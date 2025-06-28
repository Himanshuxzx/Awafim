const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http');

const app = express();

// ✅ MKV URL extraction logic (modify if your server uses different patterns)
function extractMkvUrlFromText(text) {
  const mkvRegex = /(https?:\/\/[^\s"']+\.mkv[^\s"']*)/i;
  const match = text.match(mkvRegex);
  return match ? match[1] : null;
}

// 🔹 Fetch URL and return response as text
async function fetchRawText(url) {
  const response = await axios.get(url, {
    responseType: 'text', // ensure plain text, not JSON
    headers: {
      'User-Agent': 'Mozilla/5.0', // helps prevent 403 errors
    },
  });
  return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
}

// 🔹 Format response to stream structure
function buildResponse(mkvUrl) {
  return {
    streams: [
      {
        format: 'mp4',
        url: mkvUrl,
        quality: '720p',
      },
    ],
  };
}

// ✅ MOVIE endpoint
app.get('/movie/:id', async (req, res) => {
  const { id } = req.params;
  const targetUrl = `https://hahoy.server.arlen.icu/glint/${id}`;

  try {
    const pageText = await fetchRawText(targetUrl);
    const mkvUrl = extractMkvUrlFromText(pageText);

    if (!mkvUrl) {
      return res.status(404).json({ error: 'MKV URL not found' });
    }

    res.json(buildResponse(mkvUrl));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie stream', details: err.message });
  }
});

// ✅ TV endpoint
app.get('/tv/:id/:season/:episode', async (req, res) => {
  const { id, season, episode } = req.params;
  const targetUrl = `https://hahoy.server.arlen.icu/glint/${id}/${season}/${episode}`;

  try {
    const pageText = await fetchRawText(targetUrl);
    const mkvUrl = extractMkvUrlFromText(pageText);

    if (!mkvUrl) {
      return res.status(404).json({ error: 'MKV URL not found' });
    }

    res.json(buildResponse(mkvUrl));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch TV stream', details: err.message });
  }
});

module.exports.handler = serverless(app);
