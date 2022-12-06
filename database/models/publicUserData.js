const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reqString = {
  type: String,
  required: true,
};

const PublicUserDataSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    immutable: true,
  },
  username: reqString,
  password: reqString,
  liked_songs: [],
  playlists: [String],
  library: [String],
  recently_searched: [String],
  recently_played: [String],
});

PublicUserDataSchema.plugin(require("mongoose-immutable-plugin"));

module.exports = mongoose.model("PublicUserData", PublicUserDataSchema);
