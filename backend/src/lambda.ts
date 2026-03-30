import serverlessExpress from "@codegenie/serverless-express";
import { createApp } from "./app";

const app = createApp();
export const handler = serverlessExpress({ app });
