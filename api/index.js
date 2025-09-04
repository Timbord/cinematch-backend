require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const runConversation = require("./gpt");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/getBanner", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=de&page=1`
    );
    const banners = response.data.results.map((movie) => ({
      banner: movie.poster_path,
    }));
    res.json(banners);
  } catch (error) {
    console.error("Error in /getBanner route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/search", async (req, res) => {
  const { query } = req.body;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}&language=de`
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("Error in /serch route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/getGenre", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=de`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error in /getGenre route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/discover", async (req, res) => {
  const { genre, page } = req.body;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${
        process.env.TMDB_API_KEY
      }&include_adult=false&include_video=false&language=de&page=${
        page ? page : 1
      }&sort_by=popularity.desc&with_genres=${genre}`
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("Error in /discover route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/getPopular", async (req, res) => {
  const { page } = req.body;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${
        process.env.TMDB_API_KEY
      }&page=${page ? page : 1}&language=de`
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("Error in /getPopular route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/getToprated", async (req, res) => {
  const { page } = req.body;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${
        process.env.TMDB_API_KEY
      }&page=${page ? page : 1}&language=de`
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("Error in /getToprated route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/getMovieDetails", async (req, res) => {
  const { tmdbid } = req.body;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbid}?api_key=${process.env.TMDB_API_KEY}&language=de`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error in /getMovieDetails route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/getNowPlaying", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&language=de&page=1`
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("Error in /getNowPlaying route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/getTrailer", async (req, res) => {
  const { tmdbid } = req.body;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbid}/videos?api_key=${process.env.TMDB_API_KEY}&language=de`
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("Error in /getTrailer route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/getStreamingServices", async (req, res) => {
  const { tmdbid } = req.body;
  const options = {
    method: "GET",
    url: "https://streaming-availability.p.rapidapi.com/get",
    params: {
      output_language: "en",
      tmdb_id: `movie/${tmdbid}`,
    },
    headers: {
      "X-RapidAPI-Key": "73245fe840msh758afb2d8c1010fp13ba38jsndd38c03c7c3f",
      "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    res.json(response.data.result.streamingInfo.de);
  } catch (error) {
    console.error("Error in /getStreamingServices route:", error);
    //res.status(500).json({ error: error.message });
    res.json([]);
  }
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await runConversation(message);
    res.json(response);
  } catch (error) {
    console.error("Error in /chat route:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => res.send("Express on Vercel is running!"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
