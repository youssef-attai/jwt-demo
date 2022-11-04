import * as dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

import express from "express";

const app = express();

app.listen(PORT, () => console.log(`Running on http://127.0.0.1:${PORT}`));
