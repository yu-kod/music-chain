import serverlessExpress from "@codegenie/serverless-express";
import { createApp } from "./app";

const app = createApp();
const serverlessExpressInstance = serverlessExpress({ app });

export const handler = (event: unknown, context: unknown) =>
  new Promise((resolve, reject) => {
    serverlessExpressInstance(event, context, (err: unknown, result: unknown) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
