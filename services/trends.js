import { buildProductKey } from "./history.js";

const CANDIDATES = [
  {
    title: "Мини-органайзер для кабелей",
    source: "TikTok / Amazon",
    salePrice: 990,
    buyPrice: 240,
    competition: "средняя",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/111/ffffff&text=%D0%9C%D0%B8%D0%BD%D0%B8-%D0%BE%D1%80%D0%B3%D0%B0%D0%BD%D0%B0%D0%B9%D0%B7%D0%B5%D1%80+%D0%B4%D0%BB%D1%8F+%D0%BA%D0%B0%D0%B1%D0%B5%D0%BB%D0%B5%D0%B9",
    signals: ["tiktok", "amazon"],
    brandable: true,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Складной держатель телефона",
    source: "Ozon / TikTok",
    salePrice: 890,
    buyPrice: 210,
    competition: "ниже средней",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/222/ffffff&text=%D0%A1%D0%BA%D0%BB%D0%B0%D0%B4%D0%BD%D0%BE%D0%B9+%D0%B4%D0%B5%D1%80%D0%B6%D0%B0%D1%82%D0%B5%D0%BB%D1%8C+%D1%82%D0%B5%D0%BB%D0%B5%D1%84%D0%BE%D0%BD%D0%B0",
    signals: ["tiktok", "ozon"],
    brandable: true,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Дорожный распылитель для духов",
    source: "WB / TikTok",
    salePrice: 920,
    buyPrice: 280,
    competition: "средняя",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/333/ffffff&text=%D0%94%D0%BE%D1%80%D0%BE%D0%B6%D0%BD%D1%8B%D0%B9+%D1%80%D0%B0%D1%81%D0%BF%D1%8B%D0%BB%D0%B8%D1%82%D0%B5%D0%BB%D1%8C+%D0%B4%D0%BB%D1%8F+%D0%B4%D1%83%D1%85%D0%BE%D0%B2",
    signals: ["tiktok", "wb"],
    brandable: true,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Мини-щётка для клавиатуры",
    source: "Amazon / TikTok",
    salePrice: 850,
    buyPrice: 260,
    competition: "ниже средней",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/444/ffffff&text=%D0%9C%D0%B8%D0%BD%D0%B8-%D1%89%D1%91%D1%82%D0%BA%D0%B0+%D0%B4%D0%BB%D1%8F+%D0%BA%D0%BB%D0%B0%D0%B2%D0%B8%D0%B0%D1%82%D1%83%D1%80%D1%8B",
    signals: ["amazon", "tiktok"],
    brandable: false,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Магнитный крючок для дома",
    source: "WB / Amazon",
    salePrice: 1190,
    buyPrice: 320,
    competition: "средняя",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/555/ffffff&text=%D0%9C%D0%B0%D0%B3%D0%BD%D0%B8%D1%82%D0%BD%D1%8B%D0%B9+%D0%BA%D1%80%D1%8E%D1%87%D0%BE%D0%BA+%D0%B4%D0%BB%D1%8F+%D0%B4%D0%BE%D0%BC%D0%B0",
    signals: ["amazon", "wb"],
    brandable: true,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Мини-органайзер для косметики",
    source: "Ozon / Pinterest",
    salePrice: 1290,
    buyPrice: 410,
    competition: "средняя",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/666/ffffff&text=%D0%9C%D0%B8%D0%BD%D0%B8-%D0%BE%D1%80%D0%B3%D0%B0%D0%BD%D0%B0%D0%B9%D0%B7%D0%B5%D1%80+%D0%B4%D0%BB%D1%8F+%D0%BA%D0%BE%D1%81%D0%BC%D0%B5%D1%82%D0%B8%D0%BA%D0%B8",
    signals: ["ozon"],
    brandable: true,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Мини ролик для чистки одежды",
    source: "TikTok / Amazon",
    salePrice: 790,
    buyPrice: 230,
    competition: "средняя",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/777/ffffff&text=%D0%9C%D0%B8%D0%BD%D0%B8+%D1%80%D0%BE%D0%BB%D0%B8%D0%BA+%D0%B4%D0%BB%D1%8F+%D1%87%D0%B8%D1%81%D1%82%D0%BA%D0%B8+%D0%BE%D0%B4%D0%B5%D0%B6%D0%B4%D1%8B",
    signals: ["tiktok", "amazon"],
    brandable: false,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Мини-диспенсер для зубной пасты",
    source: "Amazon / TikTok",
    salePrice: 950,
    buyPrice: 300,
    competition: "средняя",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/888/ffffff&text=%D0%9C%D0%B8%D0%BD%D0%B8-%D0%B4%D0%B8%D1%81%D0%BF%D0%B5%D0%BD%D1%81%D0%B5%D1%80+%D0%B4%D0%BB%D1%8F+%D0%B7%D1%83%D0%B1%D0%BD%D0%BE%D0%B9+%D0%BF%D0%B0%D1%81%D1%82%D1%8B",
    signals: ["amazon", "tiktok"],
    brandable: true,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Компактный держатель губки",
    source: "WB / Ozon",
    salePrice: 820,
    buyPrice: 220,
    competition: "ниже средней",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/999/ffffff&text=%D0%9A%D0%BE%D0%BC%D0%BF%D0%B0%D0%BA%D1%82%D0%BD%D1%8B%D0%B9+%D0%B4%D0%B5%D1%80%D0%B6%D0%B0%D1%82%D0%B5%D0%BB%D1%8C+%D0%B3%D1%83%D0%B1%D0%BA%D0%B8",
    signals: ["wb", "ozon"],
    brandable: false,
    easyLogistics: true,
    marketplaceFit: true
  },
  {
    title: "Мини-органайзер для проводов в авто",
    source: "TikTok / WB",
    salePrice: 1090,
    buyPrice: 340,
    competition: "средняя",
    size: "small",
    imageUrl: "https://dummyimage.com/1200x1200/101010/ffffff&text=%D0%9C%D0%B8%D0%BD%D0%B8-%D0%BE%D1%80%D0%B3%D0%B0%D0%BD%D0%B0%D0%B9%D0%B7%D0%B5%D1%80+%D0%B4%D0%BB%D1%8F+%D0%BF%D1%80%D0%BE%D0%B2%D0%BE%D0%B4%D0%BE%D0%B2+%D0%B2+%D0%B0%D0%B2%D1%82%D0%BE",
    signals: ["tiktok", "wb"],
    brandable: true,
    easyLogistics: true,
    marketplaceFit: true
  }
];

function estimateMarginLabel(salePrice, buyPrice) {
  const ratio = salePrice / buyPrice;
  if (ratio >= 3.5) return "очень высокая";
  if (ratio >= 2.7) return "высокая";
  if (ratio >= 2.1) return "средняя";
  return "низкая";
}

function scoreProduct(product) {
  let score = 0;

  if (product.buyPrice >= 200 && product.buyPrice <= 500) score += 3;
  if (product.size === "small") score += 2;
  if (product.easyLogistics) score += 2;
  if (product.marketplaceFit) score += 2;
  if (product.brandable) score += 1;
  score += Math.min(product.signals.length, 3);

  if (product.competition.includes("ниже")) score += 2;
  else if (product.competition.includes("средняя")) score += 1;

  return score;
}

function explainProduct(product) {
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

  if (product.easyLogistics) {
    why.push("простая логистика и дешёвая доставка");
    basis.push("низкий риск тестовой поставки");
  }

  if (product.marketplaceFit) {
    why.push("понятный формат для WB / Ozon");
    basis.push("подходит для маркетплейсной модели продаж");
  }

  if (product.brandable) {
    why.push("можно улучшить упаковкой или брендингом");
    basis.push("товар можно выделить среди конкурентов");
  }

  if (product.signals.includes("tiktok")) basis.push("есть внешний сигнал из TikTok");
  if (product.signals.includes("amazon")) basis.push("есть внешний сигнал из Amazon");
  if (product.signals.includes("wb")) basis.push("есть сигнал спроса на Wildberries");
  if (product.signals.includes("ozon")) basis.push("есть сигнал спроса на Ozon");

  return { why, basis };
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
  let products = CANDIDATES.map((product) => {
    const margin = estimateMarginLabel(product.salePrice, product.buyPrice);
    const score = scoreProduct(product);
    const explanation = explainProduct(product);

    return {
      ...product,
      margin,
      score,
      why: explanation.why,
      basis: explanation.basis,
      key: buildProductKey(product)
    };
  });

  products = products.filter((product) => {
    return (
      product.buyPrice >= 200 &&
      product.buyPrice <= 500 &&
      product.size === "small"
    );
  });

  let fresh = products;

  if (shownKeys && shownKeys.size) {
    fresh = products.filter((product) => !shownKeys.has(product.key));
  }

  if (fresh.length < limit) {
    fresh = products;
  }

  fresh.sort((a, b) => b.score - a.score);

  const grouped = shuffle(fresh.slice(0, 10)).sort((a, b) => b.score - a.score);

  return grouped.slice(0, limit);
}
