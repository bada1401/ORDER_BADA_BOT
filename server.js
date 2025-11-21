// 🚚 Товары в пути
if (text.includes("товары в пути")) {
  try {
    const res = await fetch(
      `${SCRIPT_URL}?action=in_transit&chat_id=${encodeURIComponent(chatId)}`
    );
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
    const res = await fetch(
      `${SCRIPT_URL}?action=received_week&chat_id=${encodeURIComponent(chatId)}`
    );
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
