const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Chaves privadas
const RAWG_API_KEY = "a54ae5ab4fb14dc99be4c7d976af042e";
const WATCHMODE_API_KEY = "Bo93o7sA47pTPQmf8pziEXJ51crsFYlD5tedziqY";

// ======== ROTAS ======== //

// 1️⃣ Jogos RAWG
app.get("/games", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${RAWG_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar jogos" });
  }
});

// 2️⃣ Trailer Watchmode
// Ex: /trailer?title=Inception&year=2010
app.get("/trailer", async (req, res) => {
  const { title, year } = req.query;
  if (!title) return res.status(400).json({ error: "Title é obrigatório" });

  try {
    const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_API_KEY}&search_field=name&search_value=${encodeURIComponent(title)}&types=movie,tv`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.title_results || searchData.title_results.length === 0) {
      return res.json({ found: false, trailerUrl: null });
    }

    // pega primeiro resultado que bate com o ano, se existir
    let result = searchData.title_results[0];
    if (year) {
      const match = searchData.title_results.find(r => r.year == year);
      if (match) result = match;
    }

    // Busca detalhes do título pra pegar trailer
    const detailsRes = await fetch(
      `https://api.watchmode.com/v1/title/${result.id}/details/?apiKey=${WATCHMODE_API_KEY}`
    );
    const detailsData = await detailsRes.json();

    // Trailer oficial do YouTube, se existir
    const trailer = detailsData.trailers?.find(t => t.site === "youtube") || null;
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.youtube_id}` : null;

    res.json({ found: !!trailerUrl, trailerUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar trailer" });
  }
});

// ======== START SERVER ======== //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
