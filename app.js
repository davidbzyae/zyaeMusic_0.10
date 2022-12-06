process.title = "zyae-music_0-10";
process.env.NODE_ENV === "production";
Error.stackTraceLimit = -1;

require("dotenv").config({
  path: "../../,./utilities/.env",
});
const config = require("../../../utilities/config");

const fs = require("fs");
const https = require("https");
const path = require("path");

const express = require("express");
const cors = require("cors");

const port = 447;

const https_config = {
  cert: fs.readFileSync(config.https_config.cert),
  ca: fs.readFileSync(config.https_config.ca),
  key: fs.readFileSync(config.https_config.key),
};

const app = express();
const https_server = https.createServer(https_config, app);

var whitelist = config.cors_whitelist;
var cors_config = {
  origin: "*",
};
app.use(cors(cors_config));
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({ error: true, response: err.message }); // Bad request
  }
  next();
});
app.use(express.static(__dirname + "/client/build"));

// routes
app.use("/api/", require("./api"));

app.get("/*", (req, res) => {
  res.sendFile(__dirname + "/client/build/index.html");
});

https_server.listen(port, () => {
  console.log("Zyae Music 0.10 started on port: " + port);
});
