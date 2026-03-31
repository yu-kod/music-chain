const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface Node {
  id: string;
  title: string;
  thumbnail_url: string;
  channel_name: string;
  created_at: string;
}

export interface Connection extends Node {
  comments: string[];
  connection_count: number;
}

export interface NodeDetail {
  node: Node;
  connections: Connection[];
}

export interface SearchResult {
  found: boolean;
  videoId?: string;
  node?: Node;
  connections?: Connection[];
}

export interface EdgeResult {
  isFirst: boolean;
  toNode: Node;
  connections: Connection[];
}

export interface RegisterResult {
  node: Node;
  isNew: boolean;
}

export const api = {
  getRandomNode: () => request<Node>("/nodes/random"),

  getNode: (id: string) => request<NodeDetail>(`/nodes/${id}`),

  search: (url: string) =>
    request<SearchResult>(`/search?url=${encodeURIComponent(url)}`),

  createEdge: (fromNodeId: string, url: string, comment: string) =>
    request<EdgeResult>("/edges", {
      method: "POST",
      body: JSON.stringify({ fromNodeId, url, comment }),
    }),

  registerNode: (url: string) =>
    request<RegisterResult>("/nodes", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
};
