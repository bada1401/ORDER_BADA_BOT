import * as cheerio from "cheerio";
import { buildProductKey } from "./history.js";

const TIKTOK_TOP_PRODUCTS_URL =
  "https://ads.tiktok.com/business/creativecenter/top-products/pc/en";

function parseCompactNumber(value) {
  if (!value) return 0;

  const clean = String(value).replace(/,/g, "").trim().toUpperCase();

  if (clean.endsWith("K")) return parseFloat(clean) * 1000;
  if (clean.endsWith("M")) return parseFloat(clean) * 1000000;
  if (clean.endsWith("B")) return parseFloat(clean) * 1000000000;

  const num = parseFloat(clean.replace(/[^\d.-]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function parsePercent(value) {
  if (!value) return 0;
  const num = parseFloat(String(value).replace("%", "").trim());
  return Number.isFinite(num) ? num : 0;
}

function detectSmallSize(title, category) {
  const text = `${title} ${category}`.toLowerCase();

  const smallKeywords = [
    "mini",
    "holder",
    "organizer",
    "brush",
    "sprayer",
    "case",
    "hook",
    "cable",
    "screen protectors",
    "stickers",
    "perfume",
    "lip gloss",
    "lipstick"
  ];

  return smallKeywords.some((k) => text.includes(k));
}

function estimateBuyPriceRub(title, category) {
  const text = `${title} ${category}`.toLowerCase();

  if (text.includes("perfume")) return 320;
  if (text.includes("case")) return 220;
  if (text.includes("screen protectors")) return 210;
  if (text.includes("lipstick")) return 280;
  if (text.includes("household cleaners")) return 260;
  if (text.includes("crossbody")) return 420;
  if (text.includes("organizer")) return 290;
  if (text.includes("brush")) return 240;
  if (text.includes("hook")) return 260;

  return 300;
}

function estimateSalePriceRub(title, category) {
  const text = `${title} ${category}`.toLowerCase();

  if (text.includes("perfume")) return 1190;
  if (text.includes("case")) return 790;
  if (text.includes("screen protectors")) return 690;
  if (text.includes("lipstick")) return 990;
  if (text.includes("household cleaners")) return 890;
  if (text.includes("crossbody")) return 1490;
  if (text.includes("organizer")) return 1090;
  if (text.includes("brush")) return 850;
  if (text.includes("hook")) return 990;

  return 990;
}

function estimateCompetition(popularity, impressions) {
  if (popularity < 8000 && impressions < 15000000) return "ниже средней";
  if (popularity < 15000) return "средняя";
  return "высокая";
}

function estimateMarginLabel(salePrice, buyPrice) {
  const ratio = salePrice / buyPrice;
  if (ratio >= 3.5) return "очень высокая";
  if (ratio >= 2.7) return "высокая";
  if (ratio >= 2.1) return "средняя";
  return "низкая";
}

function buildWhyAndBasis(product) {
  const why = [];
  const basis = [];

  if (product.size === "small") {
    why.push("маленький и лёгкий товар");
    basis.push("подходит под маленький размер");
  }

  if (product.buyPrice >= 200 && product.buyPrice <= 500) {
    why.push("закупка попадает в нужный бюджет");
    basis.push("входит в диапазон закупки 200–500 ₽");
  }

  if (product.popularity >= 6000) {
    why.push("есть живой внешний сигнал спроса");
    basis.push("в TikTok есть заметная популярность товара");
  }

  if (product.popularityChange >= 0) {
    why.push("товар не в резком падении");
    basis.push("динамика популярности не отрицательная или близка к нулю");
  }

  if (product.ctr >= 2) {
    why.push("товар хорошо цепляет внимание");
    basis.push("CTR выше базового порога");
  }

  if (product.cvr >= 4) {
    why.push("у товара есть сигнал конверсии");
    basis.push("CVR показывает реальный интерес, а не только просмотры");
  }

  if (product.impressions >= 10000000) {
    basis.push("есть крупный объём показов в TikTok");
  }

  basis.push("источник сигнала: TikTok Top Products");

  return { why, basis };
}

function scoreProduct(product) {
  let score = 0;

  if (product.buyPrice >= 200 && product.buyPrice <= 500) score += 3;
  if (product.size === "small") score += 2;
  if (product.popularity >= 6000) score += 3;
  if (product.popularityChange >= -3) score += 1;
  if (product.ctr >= 2) score += 1;
  if (product.cvr >= 4) score += 2;
  if (product.impressions >= 10000000) score += 2;
  if (product.competition.includes("ниже")) score += 2;
  else if (product.competition.includes("средняя")) score += 1;

  return score;
}

async function fetchTikTokTopProducts() {
  const response = await fetch(TIKTOK_TOP_PRODUCTS_URL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`TikTok source error: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  // Берём только часть после заголовка страницы
  const startMarker = "Explore Top Products on TikTok";
  const startIndex = bodyText.indexOf(startMarker);
  const relevantText = startIndex >= 0 ? bodyText.slice(startIndex) : bodyText;

  // Очень упрощённый парсер по публичному тексту страницы
  // Ищем блоки "Title ... Category ... metrics ... Details"
  const detailChunks = relevantText.split("Details");

  const products = [];

  for (const chunk of detailChunks) {
    const text = chunk.trim();
    if (!text) continue;

    // Название — первая фраза перед категорией с /
    const categoryMatch = text.match(/([A-Za-z&,' -]+\/[A-Za-z&,' -/]+)/);
    if (!categoryMatch) continue;

    const category = categoryMatch[1].trim();
    const titlePart = text.slice(0, text.indexOf(category)).trim();
    const title = titlePart.split(" ").slice(-6).join(" ").trim();

    if (!title || title.length < 3) continue;

    const kMatches = text.match(/\b\d+(?:\.\d+)?[KMB]\b/g) || [];
    const percentMatches = text.match(/-?\d+(?:\.\d+)?%/g) || [];
    const usdMatches = text.match(/\d+(?:\.\d+)?\s*USD/g) || [];

    const popularity = parseCompactNumber(kMatches[0] || "0");
    const popularityChange = parsePercent(percentMatches[0] || "0%");
    const ctr = parsePercent(percentMatches[1] || "0%");
    const cvr = parsePercent(percentMatches[2] || "0%");
    const costUsd = parseFloat((usdMatches[0] || "0").replace(/[^\d.]/g, "")) || 0;
    const impressions = parseCompactNumber(kMatches[kMatches.length - 1] || "0");

    const imageUrl = null; // у публичной страницы картинки в DOM неудобны; пока без них
    const size = detectSmallSize(title, category) ? "small" : "other";
    const buyPrice = estimateBuyPriceRub(title, category);
    const salePrice = estimateSalePriceRub(title, category);
    const competition = estimateCompetition(popularity, impressions);
    const margin = estimateMarginLabel(salePrice, buyPrice);

    const baseProduct = {
      title,
      source: "TikTok Top Products",
      category,
      salePrice,
      buyPrice,
      margin,
      competition,
      size,
      imageUrl,
      popularity,
      popularityChange,
      ctr,
      cvr,
      costUsd,
      impressions
    };

    const explanation = buildWhyAndBasis(baseProduct);
    const score = scoreProduct(baseProduct);

    products.push({
      ...baseProduct,
      why: explanation.why,
      basis: explanation.basis,
      score,
      key: buildProductKey({
        title: baseProduct.title,
        source: baseProduct.source
      })
    });
  }

  // Убираем мусор, оставляем только похожее на мелкие товары
  return products.filter((p) => {
    return (
      p.title &&
      p.size === "small" &&
      p.buyPrice >= 200 &&
      p.buyPrice <= 500 &&
      p.margin !== "низкая"
    );
  });
}

function fallbackProducts() {
  const fallback = [
    {
      title: "Perfume",
      source: "TikTok Top Products",
      category: "Beauty & Personal Care",
      salePrice: 1190,
      buyPrice: 320,
      competition: "средняя",
      size: "small",
      imageUrl: null,
      popularity: 17000,
      popularityChange: -9,
      ctr: 2.39,
      cvr: 5.92,
      costUsd: 4.53,
      impressions: 127000000
    },
    {
      title: "Cases, Screen Protectors & Stickers",
      source: "TikTok Top Products",
      category: "Phone Accessories",
      salePrice: 690,
      buyPrice: 220,
      competition: "ниже средней",
      size: "small",
      imageUrl: null,
      popularity: 13000,
      popularityChange: -7,
      ctr: 4.7,
      cvr: 100,
      costUsd: 0.12,
      impressions: 32000000
    },
    {
      title: "Lipstick & Lip Gloss",
      source: "TikTok Top Products",
      category: "Makeup",
      salePrice: 990,
      buyPrice: 280,
      competition: "средняя",
      size: "small",
      imageUrl: null,
      popularity: 11000,
      popularityChange: 1,
      ctr: 2.84,
      cvr: 10.94,
      costUsd: 1.55,
      impressions: 74000000
    },
    {
      title: "Household Cleaners",
      source: "TikTok Top Products",
      category: "Home Supplies",
      salePrice: 890,
      buyPrice: 260,
      competition: "ниже средней",
      size: "small",
      imageUrl: null,
      popularity: 6000,
      popularityChange: -4,
      ctr: 1.93,
      cvr: 100,
      costUsd: 0.2,
      impressions: 36000000
    },
    {
      title: "Crossbody & Shoulder Bags",
      source: "TikTok Top Products",
      category: "Bags",
      salePrice: 1490,
      buyPrice: 420,
      competition: "средняя",
      size: "small",
      imageUrl: null,
      popularity: 6000,
      popularityChange: -9,
      ctr: 4.42,
      cvr: 4.8,
      costUsd: 1.79,
      impressions: 11000000
    }
  ];

  return fallback.map((product) => {
    const explanation = buildWhyAndBasis(product);
    const score = scoreProduct(product);

    return {
      ...product,
      margin: estimateMarginLabel(product.salePrice, product.buyPrice),
      why: explanation.why,
      basis: explanation.basis,
      score,
      key: buildProductKey({
        title: product.title,
        source: product.source
      })
    };
  });
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function getTrendingProducts({ shownKeys, limit = 5 } = {}) {
  let products = [];

  try {
    products = await fetchTikTokTopProducts();
  } catch (error) {
    console.error("TikTok parser failed, fallback used:", error.message);
    products = fallbackProducts();
  }

  let fresh = products;

  if (shownKeys && shownKeys.size) {
    fresh = products.filter((product) => !shownKeys.has(product.key));
  }

  if (fresh.length < limit) {
    fresh = products;
  }

  fresh.sort((a, b) => b.score - a.score);

  const mixed = shuffle(fresh.slice(0, 12)).sort((a, b) => b.score - a.score);

  return mixed.slice(0, limit);
}
