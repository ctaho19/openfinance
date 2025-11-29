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
    // Secret for authentication
    const authSecret = new sst.Secret("AuthSecret");

    // VPC for database and app
    const vpc = new sst.aws.Vpc("Vpc", { bastion: true, nat: "ec2" });

    // Postgres database (free tier compatible)
    const database = new sst.aws.Postgres("Database", {
      vpc,
      instance: "t4g.micro",
      storage: "20 GB",
      transform: {
        instance: {
          backupRetentionPeriod: 0,
        },
      },
      dev: {
        username: "postgres",
        password: "password",
        database: "openfinance",
        host: "localhost",
        port: 5432,
      },
    });

    // Next.js app deployed with OpenNext
    const site = new sst.aws.Nextjs("Site", {
      vpc,
      link: [database, authSecret],
      environment: {
        DATABASE_URL: $interpolate`postgresql://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`,
      },
    });

    return {
      url: site.url,
      database: {
        host: database.host,
        port: database.port,
        username: database.username,
        database: database.database,
      },
    };
  },
});
