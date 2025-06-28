const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MKV URL extraction logic
function extractMkvUrlFromText(text) {
  const mkvRegex = /(https?:\/\/[^\s"']+\.mkv[^\s"']*)/i;
  const match = text.match(mkvRegex);
  return match ? match[1] : null;
}

// 🔹 Fetch raw HTML/text from a URL
async function fetchRawText(url) {
  const response = await axios.get(url, {
    responseType: 'text',
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });
  return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
}

// 🔹 Format output
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

// ✅ Movie endpoint
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

// ✅ TV episode endpoint
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

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
