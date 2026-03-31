import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Node as NodeType } from "../api/client";

const SAMPLE_COUNT = 8;

export default function SampleMarquee() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<NodeType[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const results: NodeType[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < SAMPLE_COUNT + 4; i++) {
        try {
          const node = await api.getRandomNode();
          if (!seen.has(node.id)) {
            seen.add(node.id);
            results.push(node);
          }
          if (results.length >= SAMPLE_COUNT) break;
        } catch {
          break;
        }
      }
      if (!cancelled) setNodes(results);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (nodes.length === 0) return null;

  // 2倍にしてシームレスループ
  const doubled = [...nodes, ...nodes];

  return (
    <div className="marquee-container mt-16">
      <p className="text-sm text-muted mb-8">登録されている曲の例</p>
      <div className="marquee-track">
        <div className="marquee-content">
          {doubled.map((node, i) => (
            <div
              key={`${node.id}-${i}`}
              className="marquee-item"
              onClick={() => navigate(`/node/${node.id}`)}
            >
              <img src={node.thumbnail_url} alt={node.title} />
              <div className="marquee-item-info">
                <div className="marquee-item-title">{node.title}</div>
                <div className="marquee-item-channel">{node.channel_name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
