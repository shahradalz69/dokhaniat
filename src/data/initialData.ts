import { Product, Category, ProductUnit, PaymentMethod, UserSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "وینستون لایت (آبی) اورجینال",
    brand: "وینستون (Winston)",
    category: "سیگار خارجی",
    stock_packs: 145,
    buy_price: 461530,
    sell_price_pack: 750000,
    sell_price_box: 7400000,
    sell_price_carton: 370000000,
    packs_per_box: 10,
    boxes_per_carton: 50,
    unit_type: "بسته",
    barcode: "WIN-LIGHT-BLU",
    min_stock_alert: 20
  },
  {
    id: 2,
    name: "زغال لیمو درجه یک اعلا",
    brand: "اعلا",
    category: "توتون و قلیان",
    stock_packs: 50,
    buy_price: 2000000,
    sell_price_pack: 3000000,
    sell_price_box: 0,
    sell_price_carton: 0,
    packs_per_box: 1,
    boxes_per_carton: 1,
    unit_type: "کیلو",
    barcode: "CHARCOAL-1KG",
    min_stock_alert: 10
  },
  {
    id: 3,
    name: "فندک کلیپر فلزی اورجینال",
    brand: "کلیپر (Clipper)",
    category: "فندک و اکسسوری",
    stock_packs: 22,
    buy_price: 1700000,
    sell_price_pack: 2600000,
    sell_price_box: 25000000,
    sell_price_carton: 0,
    packs_per_box: 24,
    boxes_per_carton: 1,
    unit_type: "عدد",
    barcode: "CLIP-MET-ORIG",
    min_stock_alert: 5
  },
  {
    id: 4,
    name: "مارلبرو قرمز گلد ادیشن",
    brand: "مارلبرو (Marlboro)",
    category: "سیگار خارجی",
    stock_packs: 80,
    buy_price: 850000,
    sell_price_pack: 1200000,
    sell_price_box: 11800000,
    sell_price_carton: 590000000,
    packs_per_box: 10,
    boxes_per_carton: 50,
    unit_type: "بسته",
    barcode: "MARL-RED-GOLD",
    min_stock_alert: 15
  },
  {
    id: 5,
    name: "توتون کاپیتان بلک شکلاتی",
    brand: "کاپیتان بلک (Captain Black)",
    category: "توتون و قلیان",
    stock_packs: 35,
    buy_price: 650000,
    sell_price_pack: 950000,
    sell_price_box: 9200000,
    sell_price_carton: 0,
    packs_per_box: 10,
    boxes_per_carton: 1,
    unit_type: "بسته",
    barcode: "CAPT-CHOC-TOB",
    min_stock_alert: 8
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "سیگار خارجی", sort_order: 0 },
  { id: 2, name: "سیگار ایرانی", sort_order: 1 },
  { id: 3, name: "توتون و قلیان", sort_order: 2 },
  { id: 4, name: "فندک و اکسسوری", sort_order: 3 }
];

export const INITIAL_PRODUCT_UNITS: ProductUnit[] = [
  { id: 1, name: "بسته", sort_order: 0 },
  { id: 2, name: "باکس", sort_order: 1 },
  { id: 3, name: "کارتن", sort_order: 2 },
  { id: 4, name: "عدد", sort_order: 3 },
  { id: 5, name: "کیلو", sort_order: 4 },
  { id: 6, name: "تیر", sort_order: 5 },
  { id: 7, name: "پاکت", sort_order: 6 }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 1, name: "کارتخوان (POS)", code: "pos", sort_order: 0 },
  { id: 2, name: "نقدی", code: "cash", sort_order: 1 },
  { id: 3, name: "نسیه / حساب مشتری", code: "credit", sort_order: 2 },
  { id: 4, name: "پوز - صادرات", code: "pos_saderat", sort_order: 3 },
  { id: 5, name: "پوز - ملی", code: "pos_melli", sort_order: 4 }
];

export const INITIAL_SETTINGS: UserSettings = {
  showProfit: true,
  cardSizeIdx: 1, // 0: بزرگ, 1: متوسط, 2: کوچک
  fontSize: 12,
  darkMode: false
};
