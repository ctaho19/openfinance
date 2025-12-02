import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

const MAX_SESSION_AGE_SECONDS = 60 * 60 * 8; // 8 hours absolute max
const IDLE_TIMEOUT_SECONDS = 60 * 30; // 30 minutes idle timeout

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

function getAuthSecret() {
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: getAuthSecret(),
  session: {
    strategy: "jwt",
    maxAge: MAX_SESSION_AGE_SECONDS,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },
  providers: [
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
  ],
  pages: {
    signIn: "/login",
  },
  events: {
    async signOut(message) {
      const tokenId =
        "token" in message ? (message.token?.sub ?? "unknown") : "session";
      console.info("auth_sign_out", { tokenId });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
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
    },
    async session({ session, token }) {
      if (!token.id) {
        return null as unknown as typeof session;
      }
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
