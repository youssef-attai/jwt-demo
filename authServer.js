import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const PORT = process.env.AUTH_SERVER_PORT;

import express from "express";

const app = express();
app.use(express.json());

// Should be stored in some sort of database
const refreshTokens = [];

// Request an access token from a refresh token
app.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  // If no refresh  token sent in request body, then user is not authorized to create access tokens
  if (refreshToken == null) return res.sendStatus(401);

  // If refresh token sent is not found in the database, then user is forbidden from access
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  // If all good, verify the refresh token and generate the access token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) return res.sendStatus(403);

    // Remember: the "data" returned here has extra info about expiration
    // We only want the relevant data, hence: {name: data.name} and not just data
    const accessToken = generateAccessToken({ name: data.name });
    res.json({ accessToken });
  });
});

app.post("/login", (req, res) => {
  // Authenticate User

  const username = req.body.username;

  // Data to be encrypted with JWT
  const user = { name: username };

  // Create access token with expiration datetime
  const accessToken = generateAccessToken(user);

  // Create a refresh token for the same encrypted data
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

  // Save the refresh token for later use (used in token verification to generate new access tokens)
  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

function generateAccessToken(data) {
  // Generate access token for data with expiration datetime
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

app.listen(PORT, () => console.log(`Running on http://127.0.0.1:${PORT}`));
