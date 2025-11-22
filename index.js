import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const TOKEN = process.env.BOT_TOKEN;
const SCRIPT_URL = process.env.SCRIPT_URL;

console.log("BOT TOKEN:", TOKEN ? "OK" : "EMPTY");
console.log("SCRIPT URL:", SCRIPT_URL);

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

// КНОПКИ
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      ["🚚 Товары в пути"],
      ["📦 Получено за неделю"]
    ],
    resize_keyboard: true
  }
};

// КОМАНДЫ
bot.on("message", async msg => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").toLowerCase();

  if (text === "/start") {
    return bot.sendMessage(chatId, "Выберите действие:", mainKeyboard);
  }

  // ТОВАРЫ В ПУТИ
  if (text.includes("товары") && text.includes("пути")) {
    const url = `${SCRIPT_URL}?action=inTransit&chat_id=${chatId}`;
    const response = await fetch(url);
    const data = await response.text();
    return bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
  }

  // ПОЛУЧЕНО ЗА НЕДЕЛЮ
  if (text.includes("неделю") || text.includes("неделя")) {
    const url = `${SCRIPT_URL}?action=receivedWeek&chat_id=${chatId}`;
    const response = await fetch(url);
    const data = await response.text();
    return bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
  }

  // ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ
  if (text.startsWith("/add")) {
    const id = text.split(" ")[1];
    if (!id) return bot.sendMessage(chatId, "❗ Формат: /add 123456");
    const url = `${SCRIPT_URL}?action=addUser&id=${id}`;
    const response = await fetch(url);
    return bot.sendMessage(chatId, await response.text());
  }

  return bot.sendMessage(chatId, "Выберите действие:", mainKeyboard);
});

// RENDER SERVER
app.get("/", (_, res) => res.send("BOT IS RUNNING"));

app.listen(process.env.PORT || 10000, () =>
  console.log("Server ready")
);
