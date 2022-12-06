const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const ytdl = require("ytdl-core");
const axios = require("axios");
const ytMusic = require("node-youtube-music");
var exec = require("child_process").execFile;

const tracksPath = "./assets/tracks/";
const YT_DLP_LOCATION = "C:/yt-dlp/src/yt-dlp.exe";
const MUSIC_API_URL = "https://zyae.net:447/api/";

router.use(express.json());
router.use(express.static(tracksPath));

// get loaded song
router.get("/:song_id", (req, res, next) => {
  const song_id = req.params.song_id;

  if (fs.existsSync(tracksPath + song_id + ".mp3")) {
    res.sendFile(__dirname + "/assets/tracks/" + song_id + ".mp3");
  } else {
    res.status(404).json({
      error: true,
      response: "Song not found",
    });
  }
});

// load new song
router.all("/loadSong/", (req, res) => {
  const song = req.body.song_data;

  if (!song)
    return res
      .status(400)
      .json({ error: true, response: "song_data body parameter required!" });

  if (!"title" in song && !"artists" in song)
    return res.status(400).json({
      error: true,
      response: "song_data body parameter missing data!",
    });

  ytMusic
    .searchMusics(`${song.title}  ${song.artists[0].name}`)
    .then((musics) => {
      const match_song = musics[0];

      if (
        !match_song ||
        song.duration_seconds !== match_song.duration.totalSeconds
      ) {
        console.log("no match found..");
        const match_song = song;
        const uploadToDB = {
          url: MUSIC_API_URL + "/db/musicData/",
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          data: {
            isSong: true,
            original_id: "null",
            song_id: match_song.videoId,
            title: match_song.title,
            artists: match_song.artists,
            album: match_song.album,
            thumbnail: match_song.thumbnails[0].url,
            duration: match_song.duration || "0:00",
            isExplicit: match_song.isExplicit,
          },
        };
        axios(uploadToDB)
          .then((db_response) => {
            console.log("writing file");

            writeFile(db_response.data.response, () => {
              res.json(db_response.data);
              console.log("done");
            });
          })
          .catch((err) => console.log(err.response));
      } else {
        console.log("match found!");
        const uploadToDB = {
          url: MUSIC_API_URL + "/db/musicData/",
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          data: {
            isSong: true,
            original_id: song.videoId || "",
            song_id: match_song.youtubeId,
            title: match_song.title,
            artists: match_song.artists,
            album: match_song.album,
            thumbnail: match_song.thumbnailUrl,
            duration: match_song.duration.label,
            isExplicit: match_song.isExplicit,
          },
        };
        axios(uploadToDB)
          .then((db_response) => {
            console.log("writing file..");
            writeFile(db_response.data.response, () => {
              res.json(db_response.data);
              console.log("done");
            });
          })
          .catch((err) => console.log(err));
      }
    });

  function writeFile(match_song, cb) {
    const song_id = match_song.song_id;

    var YT_DLP = () => {
      exec(
        YT_DLP_LOCATION,
        [
          "-f",
          "ba",
          "-x",
          "-o",
          __dirname + `/assets/tracks/${song_id}.mp3`,
          "--audio-format",
          "mp3",
          song_id,
        ],
        (error, data) => {
          if (error) {
            const options = {
              url: MUSIC_API_URL + "/db/musicData/" + match_song.song_id,
              method: "DELETE",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
              },
              data: {},
            };
            axios(options)
              .then((response) => {
                res.status(500).json({
                  error: true,
                  response:
                    response.data || "Unknown error occured (changes reverted)",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  error: true,
                  response:
                    err.response.data ||
                    "Unknown error occured (error reverting changes)",
                });
              });
          } else {
            cb();
          }
        }
      );
    };
    YT_DLP();
  }
});

router.all("*", (req, res) => {
  res
    .status(404)
    .json({ error: true, response: "Bad request (URI doesn't exist)" });
});

module.exports = router;
