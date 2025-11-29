import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

function getAuthConfig() {
  let authSecret = process.env.AUTH_SECRET;
  let googleClientId = process.env.GOOGLE_CLIENT_ID;
  let googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // Try SST Resource linking
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resource } = require("sst");
    if (Resource.AuthSecret?.value) authSecret = Resource.AuthSecret.value;
    if (Resource.GoogleClientId?.value) googleClientId = Resource.GoogleClientId.value;
    if (Resource.GoogleClientSecret?.value) googleClientSecret = Resource.GoogleClientSecret.value;
  } catch {
    // SST not available, use env vars
  }

  return { authSecret, googleClientId, googleClientSecret };
}

const config = getAuthConfig();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: config.authSecret,
  providers: [
    Google({
      clientId: config.googleClientId!,
      clientSecret: config.googleClientSecret!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
