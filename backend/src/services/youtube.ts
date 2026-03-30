export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface OEmbedResponse {
  title: string;
  author_name: string;
  thumbnail_url: string;
}

export async function fetchVideoInfo(
  videoId: string
): Promise<{ title: string; channelName: string; thumbnailUrl: string }> {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error(`YouTube oEmbed API error: ${res.status}`);
  }
  const data = (await res.json()) as OEmbedResponse;
  return {
    title: data.title,
    channelName: data.author_name,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  };
}
