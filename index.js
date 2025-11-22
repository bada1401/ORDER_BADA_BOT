import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const TOKEN = process.env.BOT_TOKEN;
const SCRIPT_URL = process.env.SCRIPT_URL;

if (!TOKEN) {
  console.error("❌ ERROR: BOT_TOKEN not found");
}
if (!SCRIPT_URL) {
  console.error("❌ ERROR: SCRIPT_URL not found");
}

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();
app.use(express.json());

// =============================================
// Кнопки
// =============================================
const keyboard = {
  reply_markup: {
    keyboard: [
      ["🚚 Товары в пути"],
      ["📦 Получено за неделю"]
    ],
    resize_keyboard: true
  }
};

// =============================================
// Обработка сообщений
// =============================================
bot.on("message", async msg => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").toLowerCase();

  if (text === "/start") {
    return bot.sendMessage(chatId, "👋 Добро пожаловать!", keyboard);
  }

  if (text.includes("товары в пути")) {
    const url = `${SCRIPT_URL}?action=inTransit&chat_id=${chatId}`;
    const res = await fetch(url).then(r => r.text());
    return bot.sendMessage(chatId, res, { parse_mode: "Markdown" });
  }

  if (text.includes("получено за неделю")) {
    const url = `${SCRIPT_URL}?action=receivedWeek&chat_id=${chatId}`;
    const res = await fetch(url).then(r => r.text());
    return bot.sendMessage(chatId, res, { parse_mode: "Markdown" });
  }

  if (text.startsWith("/add")) {
    const id = text.split(" ")[1];
    if (!id) return bot.sendMessage(chatId, "❗ Формат: /add 123456789");

    const url = `${SCRIPT_URL}?action=addUser&id=${id}`;
    const res = await fetch(url).then(r => r.text());
    return bot.sendMessage(chatId, res);
  }

  return bot.sendMessage(chatId, "Выберите действие:", keyboard);
});

// =============================================
// Render server
// =============================================
app.get("/", (req, res) => res.send("BOT IS RUNNING"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server started:", PORT));
