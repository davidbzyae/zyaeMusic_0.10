const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/zyaeMusic_0-02", {
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.dropDatabase();

console.log("Dropped Database!");
