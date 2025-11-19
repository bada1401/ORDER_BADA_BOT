const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

// === НАСТРОЙКИ ===

// Можно оставить через переменные окружения:
const TOKEN = process.env.BOT_TOKEN || "8396386868:AAEAPGXCUp14AGsSW4doC1cVwi8zki3CWT8";
// URL твоего Apps Script Web App:
const SCRIPT_URL =
  process.env.SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbwSmuYF8TWsP-PcJMP8e3CTuU2hmheEU00vcAKoNS3X2D9SM5EmyliGnRu43kNJRpJVOw/exec";

// Если хочешь – можешь убрать дефолтные значения и оставить только process.env,
// но для теста удобно, что они есть.

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(express.json());

// ====== ОБРАБОТКА СООБЩЕНИЙ ======
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const rawText = msg.text || "";
  const text = rawText.toLowerCase().trim();

  console.log("MSG:", chatId, rawText);

  // --- /start: показать кнопки ---
  if (text === "/start") {
    const keyboard = {
      reply_markup: {
        keyboard: [
          ["🚚 Товары в пути"],
          ["📦 Получено за последнюю неделю"]
        ],
        resize_keyboard: true
      }
    };

    await bot.sendMessage(chatId, "Выберите действие:", keyboard);
    return;
  }

  // --- кнопка "Товары в пути" ---
  if (text.includes("товары в пути")) {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=inTransit`);
      const data = await res.text();
      await bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("inTransit error:", err);
      await bot.sendMessage(chatId, "❌ Ошибка при получении данных (товары в пути).");
    }
    return;
  }

  // --- кнопка "Получено за последнюю неделю" ---
  if (text.includes("получено за последнюю неделю")) {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=receivedWeek`);
      const data = await res.text();
      await bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("receivedWeek error:", err);
      await bot.sendMessage(
        chatId,
        "❌ Ошибка при получении данных (получено за неделю)."
      );
    }
    return;
  }

  // --- команда /add <chat_id> (добавление юзера в таблицу через Apps Script) ---
  if (text.startsWith("/add")) {
    const parts = text.split(/\s+/);
    const newId = parts[1];

    if (!newId) {
      await bot.sendMessage(chatId, "❗ Укажи chat_id: /add 123456789");
      return;
    }

    try {
      const res = await fetch(
        `${SCRIPT_URL}?action=addUser&id=${encodeURIComponent(newId)}`
      );
      const data = await res.text();
      await bot.sendMessage(chatId, data);
    } catch (err) {
      console.error("addUser error:", err);
      await bot.sendMessage(chatId, "❌ Ошибка при добавлении пользователя.");
    }
    return;
  }
});

// ====== EXPRESS ДЛЯ RENDER ======
app.get("/", (req, res) => {
  res.send("BADA JR BOT IS RUNNING!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
