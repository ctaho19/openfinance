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
  async run() {
    // Secrets for authentication
    const authSecret = new sst.Secret("AuthSecret");
    const googleClientId = new sst.Secret("GoogleClientId");
    const googleClientSecret = new sst.Secret("GoogleClientSecret");

    // VPC for database and app
    const vpc = new sst.aws.Vpc("Vpc", { bastion: true, nat: "ec2" });

    // Postgres database
    const database = new sst.aws.Postgres("Database", {
      vpc,
      dev: {
        username: "postgres",
        password: "password",
        database: "openfinance",
        host: "localhost",
        port: 5432,
      },
    });

    // Next.js app deployed with OpenNext
    const app = new sst.aws.Nextjs("App", {
      vpc,
      link: [database, authSecret, googleClientId, googleClientSecret],
      environment: {
        DATABASE_URL: $interpolate`postgresql://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`,
      },
    });

    return {
      url: app.url,
      database: {
        host: database.host,
        port: database.port,
        username: database.username,
        database: database.database,
      },
    };
  },
});
