import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
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

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.post("/login", (req, res) => {
  // Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  res.json({ accessToken });
});

app.listen(PORT, () => console.log(`Running on http://127.0.0.1:${PORT}`));
