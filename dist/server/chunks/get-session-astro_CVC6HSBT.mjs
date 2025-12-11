import { Auth } from '@auth/core';
import { I as IDLE_TIMEOUT_SECONDS, g as getAuthSecret, a as authConfig } from './auth-config_mz_UKjvQ.mjs';

async function getSession(request) {
  const cookieName = process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token";
  const cookies = request.headers.get("cookie") || "";
  const sessionToken = cookies.split(";").find((c) => c.trim().startsWith(`${cookieName}=`))?.split("=")[1];
  if (!sessionToken) {
    return null;
  }
  try {
    const sessionUrl = new URL("/api/auth/session", request.url);
    const sessionRequest = new Request(sessionUrl, {
      headers: {
        cookie: request.headers.get("cookie") || ""
      }
    });
    const config = {
      ...authConfig,
      secret: getAuthSecret(),
      trustHost: true,
      basePath: "/api/auth",
      callbacks: {
        async jwt({ token, user }) {
          const now = Math.floor(Date.now() / 1e3);
          if (user) {
            token.id = user.id;
            token.lastActivity = now;
            return token;
          }
          const lastActivity = token.lastActivity || now;
          if (now - lastActivity > IDLE_TIMEOUT_SECONDS) {
            return {};
          }
          token.lastActivity = now;
          return token;
        },
        async session({ session: session2, token }) {
          if (!token.id) {
            return {};
          }
          if (session2.user && token.id) {
            session2.user.id = token.id;
          }
          return session2;
        }
      }
    };
    const response = await Auth(sessionRequest, config);
    if (!response.ok) {
      return null;
    }
    const session = await response.json();
    if (!session?.user?.id) {
      return null;
    }
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export { getSession as g };
//# sourceMappingURL=get-session-astro_CVC6HSBT.mjs.map
