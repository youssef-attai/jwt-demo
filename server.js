import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const PORT = process.env.SERVER_PORT;

import express from "express";

// Should be saved in some sort of database
const posts = [];

const app = express();
app.use(express.json());

// Get posts endpoint is hidden behind the authenticateToken middleware
// After token authentication, this route's request object will have access
// to the JWT decrypted data
app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.name == req.user.name));
});

// Create a post
app.post("/posts", authenticateToken, (req, res) => {
  posts.push({
    name: req.user.name,
    title: req.body.title,
  });
  res.sendStatus(201);
});

function authenticateToken(req, res, next) {
  // Get the authorization header that contains the JWT access token
  const authHeader = req.headers["authorization"];

  // Authorization header format: Bearer <TOKEN>
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is sent in the authorization header, then user is not not authorized
  if (token == null) return res.sendStatus(401);

  // If all good, verify the access token and get the encrypted data
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) return res.sendStatus(403);

    req.user = data;
    next();
  });
}

app.listen(PORT, () => console.log(`Running on http://127.0.0.1:${PORT}`));
