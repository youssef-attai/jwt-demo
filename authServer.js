import * as dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
dotenv.config();

const PORT = process.env.AUTH_SERVER_PORT;

import express from "express";

const app = express();
app.use(express.json());

// Should be stored in some sort of database
let refreshTokens = [];
const users = [];

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

// Remove a refresh roken from the database so it is no longer authorized to
// generate access tokens
app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

// Request a refresh token to use in generating access tokens
app.post("/login", async (req, res) => {
  // Find the user by the provided name
  const user = users.find((u) => u.name === req.body.name);

  // If it is not found
  if (user == null) return res.sendStatus(404);

  // If all goes well
  try {
    // Compare the provided password with the user's password that is stored in the database
    if (await bcrypt.compare(req.body.password, user.password)) {

      // Data to be encrypted with JWT
      const userData = { name: req.body.name };

      // Create a refresh token for the same encrypted data
      const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET);

      // Save the refresh token for later use (used in token verification to generate new access tokens)
      refreshTokens.push(refreshToken);

      // Respond with the refresh token
      res.json({ refreshToken });
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(500);
  }
});

// Generate access token for data with expiration datetime
function generateAccessToken(data) {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

// Get all users (TESTING ONLY)
app.get("/users", (req, res) => {
  res.json(users);
});

// Create user and save him to the database
app.post("/users", async (req, res) => {
  try {
    // Hash the provided password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create the user object/record
    const user = { name: req.body.name, password: hashedPassword };

    // Add the user to the database
    users.push(user);
    res.sendStatus(201);
  } catch {
    res.sendStatus(500);
  }
});

app.listen(PORT, () => console.log(`Running on http://127.0.0.1:${PORT}`));
