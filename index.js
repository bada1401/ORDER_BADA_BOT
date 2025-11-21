import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const TOKEN = process.env.BOT_TOKEN;
const SCRIPT_URL = process.env.SCRIPT_URL;

// ❌ УБИРАЕМ POLLING
const bot = new TelegramBot(TOKEN); // без { polling: true }
const app = express();
app.use(express.json());

// ====================================================
//  КНОПКИ (оставляем как есть)
// ====================================================
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      ["🚚 Товары в пути"],
      ["📦 Получено за неделю"]
    ],
    resize_keyboard: true
  }
};

// ====================================================
//  ОБРАБОТКА СООБЩЕНИЙ (оставляем как есть)
// ====================================================
bot.on("message", async msg => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").toLowerCase();

  if (text === "/start") {
    return bot.sendMessage(
      chatId,
      "👋 Добро пожаловать!\nВыберите действие:",
      mainKeyboard
    );
  }

  if (text === "🚚 товары в пути" || text === "товары в пути") {
    try {
      const url = `${SCRIPT_URL}?action=inTransit&chat_id=${chatId}`;
      const response = await fetch(url);
      const data = await response.text();
      return bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
    } catch (err) {
      return bot.sendMessage(chatId, "❌ Ошибка соединения с сервером.");
    }
  }

  if (text === "📦 получено за неделю" || text === "получено за неделю") {
    try {
      const url = `${SCRIPT_URL}?action=receivedWeek&chat_id=${chatId}`;
      const response = await fetch(url);
      const data = await response.text();
      return bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
    } catch (err) {
      return bot.sendMessage(chatId, "❌ Ошибка соединения.");
    }
  }

  if (text.startsWith("/add")) {
    const newId = text.split(" ")[1];
    if (!newId) {
      return bot.sendMessage(chatId, "❗ Используй: /add 123456789");
    }
    try {
      const url = `${SCRIPT_URL}?action=addUser&id=${newId}`;
      const response = await fetch(url);
      const answer = await response.text();
      return bot.sendMessage(chatId, answer);
    } catch (err) {
      return bot.sendMessage(chatId, "❌ Ошибка при добавлении.");
    }
  }

  bot.sendMessage(chatId, "Выберите действие:", mainKeyboard);
});

// ====================================================
//  ВЕБХУК ДЛЯ TELEGRAM (ДОБАВИТЬ!)
// ====================================================
app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ====================================================
//  СЕРВЕР ДЛЯ RENDER
// ====================================================
app.get("/", (req, res) => {
  res.send("BADA JR BOT IS RUNNING!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server started on port", PORT));
