import express from "express";
import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

import {
  getShownKeys,
  saveShownProducts,
  resetShownProducts
} from "./services/history.js";

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
      ["🔥 5 новинок", "🔄 Ещё 5 новинок"],
      ["🚚 Товары в пути"],
      ["📦 Получено за неделю"]
    ],
    resize_keyboard: true
  }
};

function formatCaption(product, index) {
  let caption = `*${index + 1}. ${product.title}*\n`;
  caption += `Источник: ${product.source}\n`;
  caption += `Продажа: ${product.salePrice} ₽\n`;
  caption += `Закупка: ${product.buyPrice} ₽\n`;
  caption += `Маржа: ${product.margin}\n`;
  caption += `Конкуренция: ${product.competition}\n\n`;

  if (product.why?.length) {
    caption += `*Почему предлагаем:*\n• ${product.why.join("\n• ")}\n\n`;
  }

  if (product.basis?.length) {
    caption += `*Основание выбора:*\n• ${product.basis.join("\n• ")}\n`;
  }

  return caption;
}

async function sendTrendingProducts(chatId) {
  const shownKeys = getShownKeys(chatId);

  const products = await getTrendingProducts({
    shownKeys,
    limit: 5
  });

  if (!products || !products.length) {
    return bot.sendMessage(chatId, "Пока новинок не найдено.", mainKeyboard);
  }

  saveShownProducts(chatId, products);

  await bot.sendMessage(
    chatId,
    "*🔥 5 новинок*\n\nПодборка по фильтру:\n• маленький размер\n• закупка 200–500 ₽\n• высокая маржа\n• анти-повтор включён",
    {
      parse_mode: "Markdown",
      ...mainKeyboard
    }
  );

  for (const [index, product] of products.entries()) {
    const caption = formatCaption(product, index);

    if (product.videoUrl) {
      await bot.sendVideo(chatId, product.videoUrl, {
        caption,
        parse_mode: "Markdown"
      });
    } else if (product.imageUrl) {
      await bot.sendPhoto(chatId, product.imageUrl, {
        caption,
        parse_mode: "Markdown"
      });
    } else {
      await bot.sendMessage(chatId, caption, {
        parse_mode: "Markdown"
      });
    }
  }
}

bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = (msg.text || "").toLowerCase().trim();

    if (text === "/start") {
      return bot.sendMessage(chatId, "Выберите действие:", mainKeyboard);
    }

    if (text === "/resetnovelty") {
      resetShownProducts(chatId);
      return bot.sendMessage(chatId, "История новинок очищена.", mainKeyboard);
    }

    if (
      text.includes("5 новинок") ||
      text.includes("новинок") ||
      text.includes("новинки") ||
      text.includes("ещё 5")
    ) {
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
