import type { Adapter } from "@auth/core/adapters";
import type { Provider } from "@auth/core/providers";
import Credentials from "@auth/core/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const MAX_SESSION_AGE_SECONDS = 60 * 60 * 8; // 8 hours absolute max
export const IDLE_TIMEOUT_SECONDS = 60 * 30; // 30 minutes idle timeout

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

function checkRateLimit(email: string): boolean {
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

function recordFailedAttempt(email: string): void {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}

function resetAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase());
}

export function getAuthSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resource } = require("sst");
    if (Resource.AuthSecret?.value) return Resource.AuthSecret.value;
  } catch {
    // SST not available
  }

  throw new Error("AUTH_SECRET is not set");
}

export const adapter: Adapter = PrismaAdapter(prisma);

export const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const email = (credentials.email as string).toLowerCase().trim();

      if (checkRateLimit(email)) {
        console.warn("auth_rate_limited", { email });
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        recordFailedAttempt(email);
        return null;
      }

      const isValid = await bcrypt.compare(
        credentials.password as string,
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
        name: user.name,
      };
    },
  }),
];

export const sessionConfig = {
  strategy: "jwt" as const,
  maxAge: MAX_SESSION_AGE_SECONDS,
};

export const cookieConfig = {
  sessionToken: {
    name:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
    options: {
      httpOnly: true,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
};

export const pagesConfig = {
  signIn: "/login",
};

export const eventsConfig = {
  async signOut(message: { token: { sub?: string } | null } | { session: unknown }) {
    const tokenId =
      "token" in message ? (message.token?.sub ?? "unknown") : "session";
    console.info("auth_sign_out", { tokenId });
  },
};

export function handleJwtCallback(token: Record<string, unknown>, user?: { id?: string }) {
  const now = Math.floor(Date.now() / 1000);

  if (user) {
    token.id = user.id;
    token.lastActivity = now;
    return token;
  }

  const lastActivity = (token.lastActivity as number) || now;
  if (now - lastActivity > IDLE_TIMEOUT_SECONDS) {
    console.info("auth_idle_timeout", { userId: token.id });
    return {};
  }

  token.lastActivity = now;
  return token;
}

export function handleSessionCallback<T extends { user?: { id?: string } }>(
  session: T,
  token: Record<string, unknown>
): T | null {
  if (!token.id) {
    return null;
  }
  if (session.user && token.id) {
    session.user.id = token.id as string;
  }
  return session;
}

export const authConfig = {
  adapter,
  providers,
  session: sessionConfig,
  cookies: cookieConfig,
  pages: pagesConfig,
  events: eventsConfig,
};
