import { Auth } from '@auth/core';
import { g as getAuthSecret, a as authConfig, I as IDLE_TIMEOUT_SECONDS } from '../../../chunks/auth-config_mz_UKjvQ.mjs';
export { renderers } from '../../../renderers.mjs';

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
    async session({ session, token }) {
      if (!token.id) {
        return {};
      }
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    }
  }
};
const ALL = async ({ request }) => {
  return Auth(request, config);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=_---auth_.astro.mjs.map
