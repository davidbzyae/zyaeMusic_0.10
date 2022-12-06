const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

// userData
const publicUserData = require("../models/publicUserData");

// playlistData
const playlistData = require("../models/playlistData");

// recently searched
const itemData = require("../models/itemData");

// music data
const musicData = require("../models/musicData");

// publicUserData routes

// // get all user data
// router.get("/", getAllUser, async (req, res) => {
//   res.json({ error: false, response: res.users });
//   // getting all publicUserData
// });

// login authorization
router.put("/", getAllUser, async (req, res) => {
  const user = res.users.find((user) => user.username == req.body.username);
  if (user) {
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err)
        return res.status(500).json({ error: true, response: err.message });
      if (result) res.json({ error: false, response: user });
      else res.status(401).json({ error: true, response: "Unauthorized" });
    });
  } else {
    res.status(401).json({ error: true, response: "Unauthorized" });
  }
});

// get specific id user data
router.get("/:id", getOneUser, async (req, res) => {
  res.json({ error: false, response: res.user });
});

// create new user
router.post("/", getAllUser, (req, res) => {
  var userTaken = false;
  res.users.forEach((userObject) => {
    if (userObject.username == req.body.username) {
      userTaken = true;
    }
  });
  if (userTaken)
    return res
      .status(409)
      .json({ error: true, response: "Username already taken!" });

  const id_string = new String("u" + Date.now());

  // create account data
  try {
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err)
        return res.status(500).json({ error: true, response: err.message });

      const publicData = new publicUserData({
        user_id: id_string,
        username: req.body.username,
        password: hash,
        liked_songs: [],
        playlists: [],
        recently_searched: [],
      });

      const newUserMusicData = await publicData.save();
      res.status(201).json({ error: false, response: newUserMusicData });
    });
  } catch (err) {
    res.status(400).json({ error: true, response: err.message });
  }
});

// update user
router.patch("/:id", getOneUser, (req, res) => {
  var updateData = req.body;

  publicUserData
    .findOneAndUpdate(
      {
        user_id: res.user.user_id,
      },
      updateData,
      {
        new: true,
      }
    )
    .then((updateData) => {
      res.status(200).json({ error: false, response: updateData });
    })
    .catch((err) => {
      res.status(500).json({ error: true, response: err.message });
    });
});

// delete user
router.delete("/:id/", getOneUser, (req, res) => {
  const deleteAccount = async () => {
    try {
      await publicUserData.findOneAndDelete({
        user_id: res.user.user_id,
      });
      await playlistData.deleteMany({
        owner_id: res.user.user_id,
      });
    } catch (err) {
      res.status(500).json({ error: true, response: err.message });
    }
  };
  deleteAccount();
  res.json({ error: false, response: res.user });
});

// liked songs data routes

// get liked songs
router.get("/:id/likedSongs", getOneUser, (req, res) => {
  res.json({ error: false, response: res.user.liked_songs });
});

// add new liked song
router.post("/:id/likedSongs", getOneUser, (req, res) => {
  publicUserData
    .findOneAndUpdate(
      {
        user_id: req.params.id,
      },
      {
        $addToSet: {
          liked_songs: req.body.song_id,
        },
      },
      {
        new: true,
      }
    )
    .then((updateUser) =>
      res.status(201).json({ error: false, response: updateUser.liked_songs })
    )
    .catch((err) =>
      res.status(500).json({ error: true, response: err.message })
    );
});

// delete liked song
router.delete("/:id/likedSongs/:song_id", getOneUser, (req, res) => {
  publicUserData
    .findOneAndUpdate(
      {
        user_id: req.params.id,
      },
      {
        $pull: {
          liked_songs: req.params.song_id,
        },
      },
      {
        new: true,
      }
    )
    .then((updateUser) => {
      res.json({ error: false, response: updateUser.liked_songs });
    })
    .catch((err) => {
      res.status(500).json({ error: true, response: err.message });
    });
});

// playlist routes

// get user playlist data
router.get("/:id/playlistData", getOneUser, getPlaylistData, (req, res) => {
  res.json({ error: false, response: res.playlists });
});

// get user specific playlist
router.get(
  "/:id/playlistData/:playlist_id",
  getOneUser,
  getOnePlaylistData,
  (req, res) => {
    res.json({ error: false, response: res.playlist || [] });
  }
);

// create new playlist
router.post("/:id/playlistData", getOneUser, async (req, res) => {
  const id_string = new String("p" + Date.now());

  var userPlaylists = await playlistData.find({ owner_id: req.params.id });
  var playlistInt = userPlaylists.length + 1;

  const newPlaylist = new playlistData({
    owner_id: res.user.user_id,
    playlist_id: id_string,
    playlist_name: req.body.playlist_name || "Playlist #" + playlistInt,
    playlist_content: [],
  });

  try {
    const newPlaylistData = await newPlaylist.save();
    publicUserData
      .findOneAndUpdate(
        {
          user_id: res.user.user_id,
        },
        {
          $push: {
            playlists: id_string,
          },
        }
      )
      .then();
    res.status(201).json({ error: false, response: newPlaylistData });
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
});

// updating one playlist
router.patch("/:id/playlistData/:playlist_id", getOneUser, (req, res) => {
  var updateData = req.body;

  playlistData
    .findOneAndUpdate(
      {
        owner_id: req.params.id,
        playlist_id: req.params.playlist_id,
      },
      updateData,
      {
        new: true,
      }
    )
    .then((updateData) => {
      res.status(200).json({ error: false, response: updateData });
    })
    .catch((err) => {
      res.status(500).json({ error: true, response: err.message });
    });
});

// delete playlist
router.delete(
  "/:id/playlistData/:playlist_id",
  getOneUser,
  getOnePlaylistData,
  (req, res) => {
    const deletePlaylist = async () => {
      try {
        await playlistData.findOneAndDelete({
          owner_id: req.params.id,
          playlist_id: req.params.playlist_id,
        });
        await publicUserData.findOneAndUpdate(
          {
            user_id: req.params.id,
          },
          {
            $pull: { playlists: req.params.playlist_id },
          }
        );
      } catch (err) {
        res.status(500).json({ error: true, response: err.message });
      }
    };
    deletePlaylist();
    res.json({ error: false, response: res.playlist });
  }
);

// library routes

// get all library items
router.get("/:id/libraryData", getOneUser, getLibraryData, (req, res) => {
  res.json({ error: false, response: res.library_data });
});

// get one recently searched
router.get(
  "/:id/libraryData/:item_id",
  getOneUser,
  getOneLibraryData,
  (req, res) => {
    res.json({ error: false, response: res.library_data });
  }
);

// create new library item
router.post("/:id/libraryData", getOneUser, async (req, res) => {
  const id_string = new String("i" + Date.now());

  req.body.item_id = id_string;

  const newItem = new itemData(req.body);

  try {
    const newItemData = await newItem.save();
    publicUserData
      .findOneAndUpdate(
        {
          user_id: res.user.user_id,
        },
        {
          $push: {
            library: id_string,
          },
        }
      )
      .then();
    res.status(201).json({ error: false, response: newItemData });
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
});

// delete library item
router.delete("/:id/libraryData/:item_id", getOneUser, async (req, res) => {
  var library_data;
  var search_object = { item_id: req.params.item_id };
  try {
    library_data = await itemData.find(search_object);
    await itemData.deleteOne(search_object);
    await publicUserData.findOneAndUpdate(
      { user_id: req.params.id },
      { $pull: { library: req.params.item_id } }
    );
    res.json({ error: false, response: library_data });
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }

  const deleteAllRS = async () => {};
  deleteAllRS();
});

// recently searched routes

// get all recently searched
router.get(
  "/:id/recentlySearched",
  getOneUser,
  getRecentlySearched,
  (req, res) => {
    res.json({ error: false, response: res.recently_searched });
  }
);

// get one recently searched
router.get(
  "/:id/recentlySearched/:item_id",
  getOneUser,
  getOneRecentlySearched,
  (req, res) => {
    res.json({ error: false, response: res.recently_searched });
  }
);

// create new recently searched
router.post("/:id/recentlySearched", getOneUser, async (req, res) => {
  const id_string = new String("i" + Date.now());

  req.body.item_id = id_string;

  const newRSItem = new itemData(req.body);

  try {
    const newRSItemData = await newRSItem.save();
    publicUserData
      .findOneAndUpdate(
        {
          user_id: res.user.user_id,
        },
        {
          $push: {
            recently_searched: id_string,
          },
        }
      )
      .then();
    res.status(201).json({ error: false, response: newRSItemData });
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
});

// delete all recently searched
router.delete("/:id/recentlySearched", getOneUser, async (req, res) => {
  var recently_searched;
  var search_object = { item_id: { $in: res.user.recently_searched } };
  try {
    recently_searched = await itemData.find(search_object);
    await itemData.deleteMany(search_object);
    await publicUserData.findOneAndUpdate(
      { user_id: req.params.id },
      { $set: { recently_searched: [] } }
    );
    res.json({ error: false, response: recently_searched });
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }

  const deleteAllRS = async () => {};
  deleteAllRS();
});

// recently played routes

// get all recently played
router.get("/:id/recentlyPlayed", getOneUser, getRecentlyPlayed, (req, res) => {
  res.json({ error: false, response: res.recently_played });
});

// get one recently played
router.get(
  "/:id/recentlyPlayed:item_id",
  getOneUser,
  getOneRecentlySearched,
  (req, res) => {
    res.json({ error: false, response: res.recently_searched });
  }
);

// create new recently played
router.post("/:id/recentlyPlayed", getOneUser, async (req, res) => {
  const id_string = new String("i" + Date.now());

  req.body.item_id = id_string;

  const newItem = new itemData(req.body);

  try {
    const newItemData = await newItem.save();
    publicUserData
      .findOneAndUpdate(
        {
          user_id: res.user.user_id,
        },
        {
          $push: {
            recently_played: id_string,
          },
        }
      )
      .then();
    res.status(201).json({ error: false, response: newItemData });
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
});

// delete all recentlyPlayed
router.delete("/:id/recentlyPlayed", getOneUser, async (req, res) => {
  var recently_played;
  var search_object = { item_id: { $in: res.user.recently_played } };
  try {
    recently_played = await itemData.find(search_object);
    await itemData.deleteMany(search_object);
    await publicUserData.findOneAndUpdate(
      { user_id: req.params.id },
      { $set: { recently_played: [] } }
    );
    res.json({ error: false, response: recently_played });
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }

  const deleteAllRS = async () => {};
  deleteAllRS();
});

// publicUserData middleware

async function getAllUser(req, res, next) {
  var users;
  try {
    users = await publicUserData.find({});
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
  res.users = users;
  next();
}

async function getOneUser(req, res, next) {
  var user;
  try {
    user = await publicUserData.find({
      user_id: req.params.id,
    });
    if (user[0] == null) {
      return res.status(404).json({ error: true, response: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: true, response: err.message });
  }
  res.user = user[0];
  next();
}

// liked songs middleware

// async function getLikedSongs(req, res, next) {
//   var liked_songs;
//   var search_object = req.body;
//   search_object.song_id = { $in: res.user.liked_songs };
//   try {
//     liked_songs = await musicData.find(search_object);
//   } catch (err) {
//     res.status(500).json({ error: true, response: err.message });
//   }
//   res.liked_songs = liked_songs;
//   next();
// }

// playlistData middleware

async function getPlaylistData(req, res, next) {
  var playlists;
  var search_object = req.body;
  search_object.owner_id = req.params.id;
  try {
    playlists = await playlistData.find(search_object);
  } catch (err) {
    return res.status(500).json({ error: true, response: err.message });
  }
  res.playlists = playlists;
  next();
}

async function getOnePlaylistData(req, res, next) {
  var playlist;
  var search_object = req.body;
  search_object.owner_id = req.params.id;
  search_object.playlist_id = req.params.playlist_id;
  try {
    playlist = await playlistData.find(search_object);
  } catch (err) {
    return res.status(500).json({ error: true, response: err.message });
  }
  res.playlist = playlist[0];
  next();
}

async function getLibraryData(req, res, next) {
  var library_data;
  var search_object = req.body;
  if (!("item_id" in search_object))
    search_object.item_id = { $in: res.user.library };
  try {
    library_data = await itemData.find(search_object);
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
  res.library_data = library_data;
  next();
}

async function getOneLibraryData(req, res, next) {
  if (res.user.library.includes(req.params.item_id)) {
    var library_data;
    var search_object = { item_id: req.params.item_id };
    try {
      library_data = await itemData.find(search_object);
    } catch (err) {
      res.status(500).json({ error: true, response: err.message });
    }
    res.library_data = library_data;
    next();
  } else res.json({ error: false, response: [] });
}

// recently searched middleware

async function getRecentlySearched(req, res, next) {
  var recently_searched;
  var search_object = req.body;
  if (!("item_id" in search_object))
    search_object.item_id = { $in: res.user.recently_searched };
  try {
    recently_searched = await itemData.find(search_object);
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
  res.recently_searched = recently_searched;
  next();
}

async function getOneRecentlySearched(req, res, next) {
  if (res.user.recently_searched.includes(req.params.item_id)) {
    var recently_searched;
    var search_object = { item_id: req.params.item_id };
    try {
      recently_searched = await itemData.find(search_object);
    } catch (err) {
      res.status(500).json({ error: true, response: err.message });
    }
    res.recently_searched = recently_searched;
    next();
  } else res.json({ error: false, response: [] });
}

// recently played middleware

async function getRecentlyPlayed(req, res, next) {
  var recently_played;
  var search_object = req.body;
  var search_object = req.body;
  if (!("item_id" in search_object))
    search_object.item_id = { $in: res.user.recently_played };
  try {
    recently_played = await itemData.find(search_object);
  } catch (err) {
    res.status(500).json({ error: true, response: err.message });
  }
  res.recently_played = recently_played;
  next();
}

// musicData middleware

// async function getAllMusic(req, res, next) {
//   var musics;
//   var search_object = req.body;
//   try {
//     musics = await musicData.find(search_object);
//   } catch (err) {
//     res.status(500).json({ error: true, response: err.message });
//   }
//   res.musics = musics;
//   next();
// }

module.exports = router;
