import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const TOKEN = process.env.BOT_TOKEN;
const SCRIPT_URL = process.env.SCRIPT_URL;

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(express.json());

// Кнопка "Товары в пути"
bot.on("message", async msg => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").toLowerCase();

  if (text === "товары в пути") {
    const url = `${SCRIPT_URL}?action=in_transit&chat_id=${chatId}`;
    const response = await fetch(url);
    const data = await response.text();
    await bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
    return;
  }

  if (text === "получено за последнюю неделю") {
    const url = `${SCRIPT_URL}?action=received_week&chat_id=${chatId}`;
    const response = await fetch(url);
    const data = await response.text();
    await bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
    return;
  }

  // Остальное поведение бота оставь как есть
});

// Express сервер
app.get("/", (req, res) => {
  res.send("BADA JR BOT IS RUNNING!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server started on port", PORT));
