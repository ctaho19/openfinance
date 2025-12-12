import Credentials from '@auth/core/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const MAX_SESSION_AGE_SECONDS = 60 * 60 * 8;
const IDLE_TIMEOUT_SECONDS = 60 * 30;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1e3;
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts = /* @__PURE__ */ new Map();
function checkRateLimit(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return false;
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }
  return record.count >= MAX_LOGIN_ATTEMPTS;
}
function recordFailedAttempt(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}
function resetAttempts(email) {
  loginAttempts.delete(email.toLowerCase());
}
function getAuthSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }
  try {
    const { Resource } = require("sst");
    if (Resource.AuthSecret?.value) return Resource.AuthSecret.value;
  } catch {
  }
  throw new Error("AUTH_SECRET is not set");
}
const adapter = PrismaAdapter(prisma);
const providers = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }
      const email = credentials.email.toLowerCase().trim();
      if (checkRateLimit(email)) {
        console.warn("auth_rate_limited", { email });
        return null;
      }
      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user || !user.password) {
        recordFailedAttempt(email);
        return null;
      }
      const isValid = await bcrypt.compare(
        credentials.password,
        user.password
      );
      if (!isValid) {
        recordFailedAttempt(email);
        console.warn("auth_failed_login", { email });
        return null;
      }
      resetAttempts(email);
      console.info("auth_sign_in", { userId: user.id, email });
      return {
        id: user.id,
        email: user.email,
        name: user.name
      };
    }
  })
];
const sessionConfig = {
  strategy: "jwt",
  maxAge: MAX_SESSION_AGE_SECONDS
};
const cookieConfig = {
  sessionToken: {
    name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
    options: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    }
  }
};
const pagesConfig = {
  signIn: "/login"
};
const eventsConfig = {
  async signOut(message) {
    const tokenId = "token" in message ? message.token?.sub ?? "unknown" : "session";
    console.info("auth_sign_out", { tokenId });
  }
};
const authConfig = {
  adapter,
  providers,
  session: sessionConfig,
  cookies: cookieConfig,
  pages: pagesConfig,
  events: eventsConfig
};

export { IDLE_TIMEOUT_SECONDS as I, authConfig as a, getAuthSecret as g, prisma as p };
//# sourceMappingURL=auth-config_mz_UKjvQ.mjs.map
