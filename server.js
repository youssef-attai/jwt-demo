import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const PORT = process.env.PORT;

import express from "express";

const posts = [
  {
    username: "Youssef",
    title: "Post 1",
  },
  {
    username: "Omar",
    title: "Post 2",
  },
];

const app = express();
app.use(express.json());

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username == req.user.name));
});

app.post("/login", (req, res) => {
  // Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  res.json({ accessToken });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) return res.sendStatus(403);

    req.user = data;
    next();
  });
}

app.listen(PORT, () => console.log(`Running on http://127.0.0.1:${PORT}`));
