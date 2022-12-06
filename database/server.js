const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/zyaeMusic_0-10", {
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", (err) => console.log("Error connecting to database: " + err));
db.on("open", () => console.log("Connected to database!"));

router.use(express.json());
router.use("/userData/", require("./routes/userDataRouter"));
router.use("/musicData/", require("./routes/musicDataRouter"));
router.all("*", (req, res) => {
  res
    .status(404)
    .json({ error: true, response: "Bad request (URI doesn't exist)" });
});

module.exports = router;
