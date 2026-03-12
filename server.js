const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const API_KEY = "a54ae5ab4fb14dc99be4c7d976af042e";

app.get("/games", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar jogos" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});