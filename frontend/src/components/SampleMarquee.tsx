import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Node as NodeType } from "../api/client";

const SAMPLE_COUNT = 8;
const AUTO_SCROLL_SPEED = 0.5; // px per frame

export default function SampleMarquee() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);
  const hasDragged = useRef(false);
  const autoScrollPaused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>();

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

  // Auto scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track || nodes.length === 0) return;

    let animId: number;
    const step = () => {
      if (!isDragging.current && !autoScrollPaused.current) {
        track.scrollLeft += AUTO_SCROLL_SPEED;
        // Loop: when past halfway, jump back
        const halfWidth = track.scrollWidth / 2;
        if (track.scrollLeft >= halfWidth) {
          track.scrollLeft -= halfWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [nodes]);

  const pauseAutoScroll = useCallback(() => {
    autoScrollPaused.current = true;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      autoScrollPaused.current = false;
    }, 3000);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    scrollStart.current = trackRef.current?.scrollLeft ?? 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 3) hasDragged.current = true;
    trackRef.current.scrollLeft = scrollStart.current - dx;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    if (hasDragged.current) {
      pauseAutoScroll();
    }
  }, [pauseAutoScroll]);

  const handleItemClick = useCallback((nodeId: string) => {
    if (!hasDragged.current) {
      navigate(`/node/${nodeId}`);
    }
  }, [navigate]);

  if (nodes.length === 0) return null;

  const doubled = [...nodes, ...nodes];

  return (
    <div className="marquee-container mt-16">
      <p className="text-sm text-muted mb-8">登録されている曲の例</p>
      <div
        className="marquee-track"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="marquee-content">
          {doubled.map((node, i) => (
            <div
              key={`${node.id}-${i}`}
              className="marquee-item"
              onClick={() => handleItemClick(node.id)}
            >
              <img src={node.thumbnail_url} alt={node.title} draggable={false} />
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
