const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const { PythonShell } = require("python-shell");
const axios = require("axios");

router.use(express.json());

router.all("/ytMusic/:functName/:query", async (req, res, next) => {
  const functName = req.params.functName;
  const query = req.params.query;
  const ytMusicAPIFuncts = [
    "searchAll",
    "searchFilter",
    "getArtist",
    "getAlbum",
    "getPlaylist",
    "getSong",
  ];
  if (ytMusicAPIFuncts.includes(functName)) {
    if (functName == "searchFilter") {
      if (!req.query.filter)
        res.status(400).send({
          error: true,
          response: "'filter' query required for searchFilter function",
        });
      else callAPI(["searchFilter", query, req.query.filter]);
    } else {
      callAPI([functName, query, "empty"]);
    }
  } else next();
  function callAPI(args) {
    const config = {
      args: args,
    };
    PythonShell.run("./yt_music_api/script.py", config, (err, data) => {
      if (err) res.status(500).send({ error: true, response: err });
      else {
        try {
          const return_json = JSON.parse(data.toString());
          res.send({ error: false, response: return_json });
        } catch {
          res
            .status(500)
            .send({ error: true, response: "Unable to parse json!" });
        }
      }
    });
  }
});

router.all("/ytMusic/list", (req, res) => {
  const validFuncts = [
    "searchAll",
    "searchFilter",
    "getArtist",
    "getAlbum",
    "getPlaylist",
  ];
  res.json({ error: false, response: validFuncts });
});

router.all("/soundcloud/search_suggest/:query", (req, res) => {
  const query = req.params.query;
  const options = {
    url: `https://api-v2.soundcloud.com/search/queries?q=${query}&client_id=jOJjarVXJfZlI309Up55k93EUDG7ILW6&limit=2`,
    method: "GET",
  };

  axios(options)
    .then((response) => {
      res.json({ error: false, response: response.data });
    })
    .catch((err) =>
      res.status(500).json({ error: true, response: err.message })
    );
});

router.all("*", (req, res) => {
  res
    .status(404)
    .json({ error: true, response: "Bad request (URI doesn't exist)" });
});

module.exports = router;
