import express from "express";
import "./index.js"; // запускаем бота автоматически

const app = express();
app.get("/", (req, res) => res.send("BADA JR BOT IS RUNNING!"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server started on port", PORT));
