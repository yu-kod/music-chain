import { Router, Request, Response } from "express";
import { getNodeById, createNode } from "../db/nodes";
import {
  getEdge,
  createEdge,
  appendToEdge,
  getConnections,
  getTotalConnectionCount,
} from "../db/edges";
import { parseUrl, fetchTrackInfo } from "../services/music";

const router = Router();

// POST /api/edges - エッジ（つながり）を作成
router.post("/", async (req: Request, res: Response) => {
  const { fromNodeId, url, comment } = req.body;
  const userId = req.userId;

  if (!fromNodeId || !url) {
    res.status(400).json({ error: "fromNodeId and url are required" });
    return;
  }

  const trimmedComment = typeof comment === "string" ? comment.trim() : "";
  if (trimmedComment.length > 30) {
    res.status(400).json({ error: "Comment must be 30 characters or less" });
    return;
  }

  const parsed = parseUrl(url);
  if (!parsed) {
    res.status(400).json({ error: "Invalid YouTube or Spotify URL" });
    return;
  }

  try {
    const fromNode = await getNodeById(fromNodeId);
    if (!fromNode) {
      res.status(404).json({ error: "From node not found" });
      return;
    }

    // 終点ノードの取得 or 作成
    let toNode = await getNodeById(parsed.nodeId);
    let isNewNode = false;

    if (!toNode) {
      try {
        const info = await fetchTrackInfo(parsed);
        toNode = await createNode({
          id: parsed.nodeId,
          title: info.title,
          thumbnail_url: info.thumbnailUrl,
          channel_name: info.channelName,
        });
        isNewNode = true;
      } catch {
        res.status(400).json({ error: "Failed to fetch track info" });
        return;
      }
    }

    // 既存エッジの確認
    const existing = await getEdge(fromNodeId, parsed.nodeId);

    if (existing) {
      if (existing.user_ids.includes(userId)) {
        res.status(409).json({ error: "You already connected these songs" });
        return;
      }
      await appendToEdge(fromNodeId, parsed.nodeId, trimmedComment, userId);
    } else {
      await createEdge(fromNodeId, parsed.nodeId, trimmedComment, userId);
    }

    const connections = await getConnections(parsed.nodeId, 10);
    const totalCount = await getTotalConnectionCount(parsed.nodeId);
    const isFirst = totalCount === 1 && isNewNode;

    res.status(201).json({ isFirst, toNode, connections });
  } catch (error) {
    console.error("Failed to create edge:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
