import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const HISTORY_FILE = path.join(DATA_DIR, "shown-products.json");

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({}, null, 2), "utf-8");
  }
}

function readHistory() {
  ensureStorage();

  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function writeHistory(data) {
  ensureStorage();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function buildProductKey(product) {
  return `${product.title}|${product.source}`.toLowerCase().trim();
}

export function getShownKeys(chatId) {
  const db = readHistory();
  return new Set(db[String(chatId)] || []);
}

export function saveShownProducts(chatId, products) {
  const db = readHistory();
  const key = String(chatId);

  const existing = new Set(db[key] || []);
  for (const product of products) {
    existing.add(buildProductKey(product));
  }

  db[key] = Array.from(existing);
  writeHistory(db);
}

export function resetShownProducts(chatId) {
  const db = readHistory();
  db[String(chatId)] = [];
  writeHistory(db);
}
