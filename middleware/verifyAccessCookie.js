const jwt = require("jsonwebtoken");

const parseCookie = (str) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

const verifyAccessCookie = (req, res, next) => {
  // bypass verification if request comes from zyae
  // might be a vulnerability ill check it out later
  if (req.headers.host.startsWith("zyae.net")) return next();

  if (!req.headers.cookie)
    return res
      .status(401)
      .send({ error: true, response: "Access token cookie required" });

  const cookies = parseCookie(req.headers.cookie);
  if (!cookies["jwt-access"])
    return res
      .status(401)
      .send({ error: true, response: "Access token cookie required" });

  const accessToken = cookies["jwt-access"];

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ error: true, response: "Invalid or expired token" });

    res.locals.decodedToken = decoded;
    next();
  });
};

module.exports = verifyAccessCookie;
