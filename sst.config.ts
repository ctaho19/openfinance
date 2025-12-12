/// <reference path="./.sst/platform/config.d.ts" />

// Migration flag - set to true to deploy Astro instead of Next.js
const USE_ASTRO = true;

export default $config({
  app(input) {
    return {
      name: "openfinance",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    // Secrets
    const authSecret = new sst.Secret("AuthSecret");
    const databaseUrl = new sst.Secret("DatabaseUrl");

    if (USE_ASTRO) {
      // Astro app (new)
      const astroSite = new sst.aws.Astro("Site", {
        path: "./",
        domain: "openfi.me",
        link: [authSecret, databaseUrl],
        environment: {
          DATABASE_URL: databaseUrl.value,
          AUTH_SECRET: authSecret.value,
          AUTH_TRUST_HOST: "true",
        },
        transform: {
          server(args) {
            // Copy Prisma engine binaries into Lambda bundle
            args.copyFiles ??= [];
            args.copyFiles.push({
              from: "node_modules/.prisma/client/",
            });

            // Ensure esbuild doesn't bundle Prisma (it needs runtime resolution)
            args.nodejs ??= {};
            args.nodejs.esbuild ??= {};
            args.nodejs.esbuild.external = [
              ...(args.nodejs.esbuild.external ?? []),
              "@prisma/client",
              ".prisma/client",
            ];
          },
        },
      });

      return {
        url: astroSite.url,
      };
    } else {
      // Next.js app (legacy - remove after migration)
      const nextSite = new sst.aws.Nextjs("Site", {
        domain: "openfi.me",
        link: [authSecret, databaseUrl],
        environment: {
          DATABASE_URL: databaseUrl.value,
          AUTH_TRUST_HOST: "true",
        },
      });

      return {
        url: nextSite.url,
      };
    }
  },
});
