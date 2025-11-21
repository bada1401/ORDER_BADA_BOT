import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const TOKEN = process.env.BOT_TOKEN;
const SCRIPT_URL = process.env.SCRIPT_URL; // URL твоего Apps Script (/exec)

if (!TOKEN || !SCRIPT_URL) {
  console.error("❌ Нет BOT_TOKEN или SCRIPT_URL в переменных окружения");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(express.json());

// ---- ОБРАБОТКА СООБЩЕНИЙ ОТ ПОЛЬЗОВАТЕЛЕЙ ----
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").toLowerCase().trim();

  try {
    // 1) ТОВАРЫ В ПУТИ
    // Кнопка присылает "🚚 Товары в пути" -> в lowerCase будет "🚚 товары в пути"
    if (text.includes("товары в пути")) {
      const url = `${SCRIPT_URL}?action=in_transit&chat_id=${chatId}`;
      const response = await fetch(url);
      const data = await response.text();

      await bot.sendMessage(chatId, data, {
        parse_mode: "Markdown"
      });
      return;
    }

    // 2) ПОЛУЧЕНО ЗА ПОСЛЕДНЮЮ НЕДЕЛЮ
    if (text.includes("получено за последнюю неделю")) {
      const url = `${SCRIPT_URL}?action=received_week&chat_id=${chatId}`;
      const response = await fetch(url);
      const data = await response.text();

      await bot.sendMessage(chatId, data, {
        parse_mode: "Markdown"
      });
      return;
    }

    // 3) /add — теперь не используем, всё через Google Sheets
    if (text.startsWith("/add")) {
      await bot.sendMessage(
        chatId,
        "👨‍💻 Добавление пользователей теперь делаем через Google Sheets (лист *TelegramUsers*)."
      );
      return;
    }

  } catch (err) {
    console.error("Ошибка в обработчике бота:", err);
    await bot.sendMessage(chatId, "⚠️ Ошибка сервера, попробуй ещё раз позже.");
  }
});

// Простой HTTP-эндпоинт для Render
app.get("/", (req, res) => {
  res.send("BADA JR BOT IS RUNNING!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
