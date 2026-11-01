import http from "node:http";
import fs from "node:fs";
import { URL } from "node:url";

try {
  const envFile = fs.readFileSync(new URL("./.env", import.meta.url), "utf8");
  envFile.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  });
} catch {
  // Environment variables may be provided by the process manager instead.
}

const port = Number(process.env.PORT || 5000);
const youtubeApiKey = (process.env.YOUTUBE_API_KEY || "").trim();
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  });
  response.end(JSON.stringify(payload));
}

function getVideoId(value) {
  const match = String(value || "").match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  return match ? match[1] : null;
}

async function youtubeRequest(endpoint) {
  const response = await fetch(endpoint);
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`YouTube returned an invalid response (${response.status}).`);
  }
  if (!response.ok) {
    const apiErrorMessage = data?.error?.message || "";
    if (
      data?.error?.details?.some((detail) => detail?.reason === "API_KEY_SERVICE_BLOCKED") ||
      /has not been used|disabled|enable it/i.test(apiErrorMessage)
    ) {
      throw new Error("YouTube Data API v3 is blocked for this server key. Enable YouTube Data API v3 in Google Cloud or configure a key that has access to it.");
    }
    if (data?.error?.errors?.some((item) => item?.reason === "keyInvalid")) {
      throw new Error("The server YouTube API key is invalid. Replace YOUTUBE_API_KEY in backend/.env.");
    }
    throw new Error(data?.error?.message || `YouTube request failed (${response.status}).`);
  }
  return data;
}

async function fetchAllComments(videoId, query) {
  const comments = [];
  let pageToken = "";
  let pageCount = 0;
  const maxPages = 50;

  do {
    const pageQuery = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
    const data = await youtubeRequest(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&${query}${pageQuery}`
    );

    for (const comment of data.items || []) {
      const snippet = comment?.snippet?.topLevelComment?.snippet;
      if (!snippet) continue;

      const text = snippet.textOriginal || snippet.textDisplay || "";
      if (!text.trim()) continue;

      comments.push({
        authorName: snippet.authorDisplayName || "Anonymous",
        likes: Number.isFinite(Number(snippet.likeCount)) ? Number(snippet.likeCount) : 0,
        text,
        publishedAt: snippet.publishedAt || ""
      });
    }

    pageToken = data.nextPageToken || "";
    pageCount += 1;
  } while (pageToken && pageCount < maxPages);

  return comments.filter((comment, index, list) => (
    list.findIndex((item) => item.text === comment.text && item.authorName === comment.authorName) === index
  ));
}

async function analyzeVideo(videoUrl) {
  if (!youtubeApiKey) {
    throw new Error("YouTube API access is not configured on the server.");
  }

  const videoId = getVideoId(videoUrl);
  if (!videoId) throw new Error("Please enter a valid YouTube video URL.");

  const query = `key=${encodeURIComponent(youtubeApiKey)}`;
  const [metadataData, comments] = await Promise.all([
    youtubeRequest(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&${query}`),
    fetchAllComments(videoId, query)
  ]);

  const item = metadataData.items?.[0];
  if (!item) throw new Error("No video metadata found for this video.");

  return {
    videoId,
    comments,
    metadata: {
      title: item.snippet?.title || "YouTube Video Analysis",
      channelTitle: item.snippet?.channelTitle || "Channel",
      description: item.snippet?.description || "No description available.",
      publishedAt: item.snippet?.publishedAt || "",
      viewCount: item.statistics?.viewCount || 0,
      likeCount: item.statistics?.likeCount || 0,
      commentCount: item.statistics?.commentCount || 0
    }
  };
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/analyze") {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  let rawBody = "";
  request.on("data", (chunk) => {
    rawBody += chunk;
    if (rawBody.length > 20_000) request.destroy();
  });

  request.on("end", async () => {
    try {
      const body = JSON.parse(rawBody || "{}");
      sendJson(response, 200, await analyzeVideo(body.url));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : "Analysis failed." });
    }
  });
});

server.listen(port, () => {
  console.log(`TubeGrow API listening on http://localhost:${port}`);
});
