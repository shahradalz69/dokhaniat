// Gregorian to Jalali converter algorithm
export function toJalaali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    (365 * gy) +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

export function getPersianDate(date: Date = new Date()): string {
  const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const mm = String(j.jm).padStart(2, '0');
  const dd = String(j.jd).padStart(2, '0');
  return `${j.jy}/${mm}/${dd}`;
}

export function getPersianWeekday(date: Date = new Date()): string {
  const weekdays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  return weekdays[date.getDay()];
}

export function getPersianTime(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '۰';
  const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(n)) return '۰';
  return Math.round(n).toLocaleString('fa-IR');
}

export function formatNumberEn(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '0';
  const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
  if (isNaN(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}

export function cleanNumber(val: string | number | undefined | null): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}
