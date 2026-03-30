import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/auth";
import nodesRouter from "./routes/nodes";
import edgesRouter from "./routes/edges";
import searchRouter from "./routes/search";

export function createApp(options?: { corsOrigin?: string }) {
  const app = express();

  if (options?.corsOrigin) {
    app.use(cors({ origin: options.corsOrigin, credentials: true }));
  }

  app.use(express.json());
  app.use(cookieParser());
  app.use(authMiddleware);

  app.use("/api/nodes", nodesRouter);
  app.use("/api/edges", edgesRouter);
  app.use("/api/search", searchRouter);

  return app;
}
