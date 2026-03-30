import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/auth";
import nodesRouter from "./routes/nodes";
import edgesRouter from "./routes/edges";
import searchRouter from "./routes/search";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

app.use("/api/nodes", nodesRouter);
app.use("/api/edges", edgesRouter);
app.use("/api/search", searchRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
