import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import { getTrendingProducts } from "./services/trends.js";

const TOKEN = process.env.BOT_TOKEN;
const SCRIPT_URL = process.env.SCRIPT_URL;

console.log("BOT TOKEN:", TOKEN ? "OK" : "EMPTY");
console.log("SCRIPT URL:", SCRIPT_URL ? "OK" : "EMPTY");

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

const mainKeyboard = {
  reply_markup: {
    keyboard: [
      ["🔥 5 новинок"],
      ["🚚 Товары в пути"],
      ["📦 Получено за неделю"]
    ],
    resize_keyboard: true
  }
};

async function sendTrendingProducts(chatId) {
  const products = await getTrendingProducts();

  if (!products || !products.length) {
    return bot.sendMessage(chatId, "Пока новинок не найдено.", mainKeyboard);
  }

  let msg = "🔥 *5 новинок*\n\n";

  products.slice(0, 5).forEach((p, i) => {
    msg += `*${i + 1}. ${p.title}*\n`;
    msg += `Источник: ${p.source}\n`;
    msg += `Продажа: ${p.salePrice} ₽\n`;
    msg += `Закупка: ${p.buyPrice} ₽\n`;
    msg += `Маржа: ${p.margin}\n`;
    msg += `Конкуренция: ${p.competition}\n\n`;

    if (p.why?.length) {
      msg += `*Почему предлагаем:*\n• ${p.why.join("\n• ")}\n\n`;
    }

    if (p.basis?.length) {
      msg += `*Основание выбора:*\n• ${p.basis.join("\n• ")}\n\n`;
    }
  });

  return bot.sendMessage(chatId, msg, {
    parse_mode: "Markdown",
    ...mainKeyboard
  });
}

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = (msg.text || "").toLowerCase().trim();

    if (text === "/start") {
      return bot.sendMessage(chatId, "Выберите действие:", mainKeyboard);
    }

    if (text.includes("новинок") || text.includes("новинки")) {
      return sendTrendingProducts(chatId);
    }

    if (text.includes("товары") && text.includes("пути")) {
      if (!SCRIPT_URL) {
        return bot.sendMessage(chatId, "SCRIPT_URL не настроен.", mainKeyboard);
      }

      const url = `${SCRIPT_URL}?action=inTransit&chat_id=${chatId}`;
      const response = await fetch(url);
      const data = await response.text();

      return bot.sendMessage(chatId, data, {
        parse_mode: "Markdown",
        ...mainKeyboard
      });
    }

    if (text.includes("неделю") || text.includes("неделя")) {
      if (!SCRIPT_URL) {
        return bot.sendMessage(chatId, "SCRIPT_URL не настроен.", mainKeyboard);
      }

      const url = `${SCRIPT_URL}?action=receivedWeek&chat_id=${chatId}`;
      const response = await fetch(url);
      const data = await response.text();

      return bot.sendMessage(chatId, data, {
        parse_mode: "Markdown",
        ...mainKeyboard
      });
    }

    return bot.sendMessage(chatId, "Выберите действие:", mainKeyboard);
  } catch (error) {
    console.error("BOT ERROR:", error);
    return bot.sendMessage(msg.chat.id, "Произошла ошибка. Попробуйте ещё раз.");
  }
});

app.get("/", (_, res) => res.send("BOT IS RUNNING"));

app.listen(process.env.PORT || 10000, () => {
  console.log("Server ready");
});
