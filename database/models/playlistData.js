const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reqString = {
  type: String,
  required: true,
};

const playlistSchema = new Schema({
  owner_id: {
    type: String,
    required: true,
    immutable: true,
  },
  playlist_id: {
    type: String,
    required: true,
    immutable: true,
  },
  playlist_name: {
    type: String,
    required: true,
  },
  playlist_content: [String],
});

playlistSchema.plugin(require("mongoose-immutable-plugin"));

module.exports = mongoose.model("PlaylistData", playlistSchema);
