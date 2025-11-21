const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

// === НАСТРОЙКИ ===
const TOKEN =
  process.env.BOT_TOKEN ||
  "8396386868:AAEAPGXCUp14AGsSW4doC1cVwi8zki3CWT8";

const SCRIPT_URL =
  process.env.SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbwSmuYF8TWsP-PcJMP8e3CTuU2hmheEU00vcAKoNS3X2D9SM5EmyliGnRu43kNJRpJVOw/exec";

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(express.json());

// ====== ОБРАБОТКА СООБЩЕНИЙ ======
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const rawText = msg.text || "";
  const text = rawText.toLowerCase().trim();

  console.log("MSG:", chatId, rawText);

  // /start — показать кнопки
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

  // 🚚 Товары в пути
  if (text.includes("товары в пути")) {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=in_transit`);
      const data = await res.text();
      await bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("in_transit error:", err);
      await bot.sendMessage(chatId, "❌ Ошибка при получении данных (товары в пути).");
    }
    return;
  }

  // 📦 Получено за последнюю неделю
  if (text.includes("получено за последнюю неделю")) {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=received_week`);
      const data = await res.text();
      await bot.sendMessage(chatId, data, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("received_week error:", err);
      await bot.sendMessage(
        chatId,
        "❌ Ошибка при получении данных (получено за неделю)."
      );
    }
    return;
  }
});

// EXPRESS для Render
app.get("/", (req, res) => {
  res.send("BADA JR BOT IS RUNNING!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
