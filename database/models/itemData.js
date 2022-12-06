const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reqString = {
  type: String,
  required: true,
};

const itemSchema = new Schema({
  item_id: {
    type: String,
    required: true,
    immutable: true,
  },
  youtube_id: reqString,
  item_type: {
    type: String,
    required: true,
    enum: ["song", "artist", "album", "playlist"],
  },
  item_title: reqString,
  thumbnail: reqString,
  item_subInfo: {
    type: String,
  },
});

itemSchema.plugin(require("mongoose-immutable-plugin"));

module.exports = mongoose.model("item", itemSchema);
