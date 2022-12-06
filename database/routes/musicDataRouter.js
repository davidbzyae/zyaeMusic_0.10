const express = require("express");
const router = express.Router();

// musicData
const musicData = require("../models/musicData");

// musicData routes

// get all music data
router.get("/", getAllMusic, (req, res) => {
  res.json({ error: false, response: res.musics });
});

// get one music data
router.get("/:song_id", getOneMusic, (req, res) => {
  res.json({ error: false, response: res.music });
});

// create new music data
router.post("/", async (req, res) => {
  const newMusic = new musicData(req.body);

  try {
    const newMusicData = await newMusic.save();
    res.status(201).json({ error: false, response: newMusicData });
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
});

// delete music data
router.delete("/:song_id", getOneMusic, (req, res) => {
  const deleteSong = async () => {
    try {
      await musicData.findOneAndDelete({
        song_id: res.music.song_id,
      });
    } catch (err) {
      res.status(500).json({ error: true, response: err.message });
    }
  };
  deleteSong();
  res.json({ error: false, response: res.music });
});

// musicData middleware

async function getAllMusic(req, res, next) {
  var musics;
  var search_object = req.body;
  try {
    musics = await musicData.find(search_object);
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
  res.musics = musics;
  next();
}

async function getOneMusic(req, res, next) {
  var music;
  try {
    music = await musicData
      .find({
        $or: [
          { song_id: req.params.song_id },
          { original_id: req.params.song_id },
        ],
      })
      .sort({ song_id: 1, original_id: 1 });
    if (music[0] == null) {
      return res.status(404).json({ error: true, response: "Song not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: true, response: err.message });
  }
  res.music = music[0];
  next();
}

module.exports = router;
