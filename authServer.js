import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const PORT = process.env.PORT;

import express from "express";

const app = express();
app.use(express.json());

app.post("/login", (req, res) => {
  // Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  res.json({ accessToken });
});


app.listen(PORT, () => console.log(`Running on http://127.0.0.1:${PORT}`));
