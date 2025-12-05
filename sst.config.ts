/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "openfinance",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() { 507013
    // Secrets
    const authSecret = new sst.Secret("AuthSecret");
    const databaseUrl = new sst.Secret("DatabaseUrl");

    // Next.js app deployed with OpenNext (no VPC needed with external DB)
    const site = new sst.aws.Nextjs("Site", {
      domain: "openfi.me",
      link: [authSecret, databaseUrl],
      environment: {
        DATABASE_URL: databaseUrl.value,
        AUTH_TRUST_HOST: "true",
      },
    });

    return {
      url: site.url,
    };
  },
});
