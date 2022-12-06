const express = require("express");
const router = express.Router();

const verifyAccessCookie = require("./middleware/verifyAccessCookie.js");

router.use(express.json());
router.use(verifyAccessCookie);

router.use("/db/", require("./database/server"));
router.use("/tracks/", require("./track_handler"));
router.use("/external/", require("./external_content"));

router.all("/*", (req, res) => {
  res
    .status(404)
    .json({ error: true, response: "Bad request (URI doesn't exist)" });
});

module.exports = router;
