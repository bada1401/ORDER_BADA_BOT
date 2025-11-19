const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

// === НАСТРОЙКИ ===
const TOKEN = "8396386868:AAEAPGXCUp14AGsSW4doC1cVwi8zki3CWT8"; // твой токен
const ADMIN_ID = 928118657; // твой chat_id (ты)

// кто может пользоваться ботом
const allowedUsers = new Set([
  ADMIN_ID,
  8497970505,
  1216376532
]);

// создаём бота (long polling)
const bot = new TelegramBot(TOKEN, { polling: true });

// ====== ОБРАБОТКА СООБЩЕНИЙ ======
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  // --- админ может добавлять юзеров командой /add 123456789 ---
  if (text.startsWith("/add")) {
    if (chatId !== ADMIN_ID) {
      bot.sendMessage(chatId, "⛔ У тебя нет прав добавлять пользователей.");
      return;
    }

    const parts = text.split(/\s+/);
    const newId = Number(parts[1]);

    if (!newId) {
      bot.sendMessage(chatId, "❗ Напиши так: /add 123456789");
      return;
    }

    if (allowedUsers.has(newId)) {
      bot.sendMessage(chatId, `⚠️ Пользователь ${newId} уже есть в списке.`);
      return;
    }

    allowedUsers.add(newId);
    bot.sendMessage(chatId, `✅ Пользователь добавлен: ${newId}`);
    return;
  }

  // --- доступ только для разрешённых юзеров ---
  if (!allowedUsers.has(chatId)) {
    bot.sendMessage(chatId, "⛔ У тебя нет доступа к боту BADA JR.");
    return;
  }

  // клавиатура с двумя кнопками
  const keyboard = {
    reply_markup: {
      keyboard: [
        ["🚚 Товары в пути"],
        ["📦 Получено за последнюю неделю"]
      ],
      resize_keyboard: true
    }
  };

  if (text === "/start") {
    bot.sendMessage(chatId, "Выбери действие:", keyboard);
    return;
  }

  if (text === "🚚 Товары в пути") {
    bot.sendMessage(chatId, "🚚 Здесь будут товары в пути (потом привяжем к Google Sheets).");
    return;
  }

  if (text === "📦 Получено за последнюю неделю") {
    bot.sendMessage(chatId, "📦 Здесь будут товары, полученные за последнюю неделю.");
    return;
  }
});

// ====== СЕРВЕР ДЛЯ RENDER ======
const app = express();

app.get("/", (req, res) => {
  res.send("BADA JR BOT работает ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
