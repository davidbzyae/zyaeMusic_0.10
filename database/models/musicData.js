const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reqString = {
  type: String,
  required: true,
};

const artistsSchema = new Schema({
  name: String,
  id: String,
});

const albumSchema = new Schema({
  name: reqString,
  id: reqString,
});

const musicDataSchema = new Schema({
  isSong: {
    type: Boolean,
    required: true,
  },
  original_id: reqString,
  song_id: { type: String, required: true, unique: true },
  title: reqString,
  artists: [artistsSchema],
  album_id: albumSchema,
  thumbnail: reqString,
  duration: reqString,
  isExplicit: {
    type: Boolean,
    required: true,
  },
});

artistsSchema.plugin(require("mongoose-immutable-plugin"));
musicDataSchema.plugin(require("mongoose-immutable-plugin"));

module.exports = mongoose.model("ArtistsSchema", artistsSchema);
module.exports = mongoose.model("MusicDataSchema", musicDataSchema);
