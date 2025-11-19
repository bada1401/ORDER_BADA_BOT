import express from "express";
import TelegramBot from "node-telegram-bot-api";

const TOKEN = "8396386868:AAEAPGXCUp14AGsSW4doC1cVwi8zki3CWT8";

// Only you can add users, обычные юзеры только 2 кнопки
const admins = [928118657];
let allowedUsers = [...admins, 1216376532, 8497970505];

const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();

// ————————————————————————
// Команды Telegram
// ————————————————————————

bot.on("message", msg => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  // Добавление юзера — только для админов
  if (text.startsWith("/add") && admins.includes(chatId)) {
    const newId = text.split(" ")[1];
    if (newId) {
      allowedUsers.push(newId);
      bot.sendMessage(chatId, `Пользователь ${newId} добавлен!`);
    }
    return;
  }

  // Если юзер не в списке — нет доступа
  if (!allowedUsers.includes(String(chatId))) {
    bot.sendMessage(chatId, "❌ У вас нет доступа к боту.");
    return;
  }

  // Кнопки меню
  const options = {
    reply_markup: {
      keyboard: [
        ["🚚 Товары в пути"],
        ["📦 Получено за неделю"]
      ],
      resize_keyboard: true
    }
  };

  if (text === "/start") {
    bot.sendMessage(chatId, "Выберите действие:", options);
    return;
  }

  if (text === "🚚 Товары в пути") {
    bot.sendMessage(chatId, "Тут будет список товаров в пути.");
    return;
  }

  if (text === "📦 Получено за неделю") {
    bot.sendMessage(chatId, "Тут будет список полученных товаров.");
    return;
  }
});

// Express endpoint
app.get("/", (req, res) => {
  res.send("BADAJR BOT RUNNING");
});

// Render требует порт в процессе
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
