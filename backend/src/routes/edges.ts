import { Router, Request, Response } from "express";
import { getNodeById, createNode } from "../db/nodes";
import {
  getEdge,
  createEdge,
  appendToEdge,
  getConnections,
  getTotalConnectionCount,
} from "../db/edges";
import { extractVideoId, fetchVideoInfo } from "../services/youtube";

const router = Router();

// POST /api/edges - エッジ（つながり）を作成
router.post("/", async (req: Request, res: Response) => {
  const { fromNodeId, youtubeUrl, comment } = req.body;
  const userId = req.userId;

  if (!fromNodeId || !youtubeUrl) {
    res.status(400).json({ error: "fromNodeId and youtubeUrl are required" });
    return;
  }

  const trimmedComment = typeof comment === "string" ? comment.trim() : "";
  if (trimmedComment.length > 30) {
    res.status(400).json({ error: "Comment must be 30 characters or less" });
    return;
  }

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    res.status(400).json({ error: "Invalid YouTube URL" });
    return;
  }

  try {
    const fromNode = await getNodeById(fromNodeId);
    if (!fromNode) {
      res.status(404).json({ error: "From node not found" });
      return;
    }

    // 終点ノードの取得 or 作成
    let toNode = await getNodeById(videoId);
    let isNewNode = false;

    if (!toNode) {
      try {
        const info = await fetchVideoInfo(videoId);
        toNode = await createNode({
          id: videoId,
          title: info.title,
          thumbnail_url: info.thumbnailUrl,
          channel_name: info.channelName,
        });
        isNewNode = true;
      } catch {
        res.status(400).json({ error: "Failed to fetch YouTube video info" });
        return;
      }
    }

    // 既存エッジの確認
    const existing = await getEdge(fromNodeId, videoId);

    if (existing) {
      if (existing.user_ids.includes(userId)) {
        res.status(409).json({ error: "You already connected these songs" });
        return;
      }
      await appendToEdge(fromNodeId, videoId, trimmedComment, userId);
    } else {
      await createEdge(fromNodeId, videoId, trimmedComment, userId);
    }

    const connections = await getConnections(videoId, 10);
    const totalCount = await getTotalConnectionCount(videoId);
    const isFirst = totalCount === 1 && isNewNode;

    res.status(201).json({ isFirst, toNode, connections });
  } catch (error) {
    console.error("Failed to create edge:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
