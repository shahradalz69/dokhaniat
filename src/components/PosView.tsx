import React, { useState } from 'react';
import { Product, CartItem, PaymentMethod } from '../types';
import { formatNumber, cleanNumber } from '../utils/persianDate';
import { ShoppingCart, Trash2, Plus, Minus, Search, CheckCircle2, User, CreditCard, Banknote, FileText } from 'lucide-react';

interface PosViewProps {
  products: Product[];
  paymentMethods: PaymentMethod[];
  fontSize: number;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  cardSizeIdx: number;
  setCardSizeIdx: (idx: number | ((prev: number) => number)) => void;
  showProfit: boolean;
  setShowProfit: (show: boolean | ((prev: boolean) => boolean)) => void;
  onCompleteSale: (invoice: {
    customer_name: string;
    items: CartItem[];
    discount: number;
    payment_method: string;
    cash_amount: number;
    pos_amount: number;
    is_credit: number;
    notes: string;
  }) => void;
}

const CARD_GRID_CLASSES = [
  'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3', // بزرگ
  'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5', // متوسط
  'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7'  // کوچک
];
const CARD_SIZE_LABELS = ['بزرگ', 'متوسط', 'کوچک'];

export const PosView: React.FC<PosViewProps> = ({
  products,
  paymentMethods,
  fontSize,
  setFontSize,
  cardSizeIdx,
  setCardSizeIdx,
  showProfit,
  setShowProfit,
  onCompleteSale
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.code || 'pos');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashInput, setCashInput] = useState('');
  const [isCredit, setIsCredit] = useState(false);
  const [notes, setNotes] = useState('');
  const [creditNotes, setCreditNotes] = useState('');

  // Extract unique categories for quick filter
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => {
          if (item.product_id === product.id) {
            const newQty = item.quantity_packs + 1;
            return {
              ...item,
              quantity_packs: newQty,
              total_price: newQty * item.unit_price,
              total_cost: newQty * item.buy_price
            };
          }
          return item;
        });
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          unit_type: product.unit_type || 'بسته',
          quantity_packs: 1,
          unit_price: product.sell_price_pack,
          buy_price: product.buy_price,
          total_price: product.sell_price_pack,
          total_cost: product.buy_price
        }
      ];
    });
  };

  const updateCartItemQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product_id === productId) {
          return {
            ...item,
            quantity_packs: qty,
            total_price: qty * item.unit_price,
            total_cost: qty * item.buy_price
          };
        }
        return item;
      })
    );
  };

  const updateCartItemPrice = (productId: number, newPrice: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product_id === productId) {
          return {
            ...item,
            unit_price: newPrice,
            total_price: item.quantity_packs * newPrice
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total_price, 0);
  const finalAmount = Math.max(0, subtotal - discount);
  const effectiveCash = Math.min(cashAmount, finalAmount);
  const calculatedPos = Math.max(0, finalAmount - effectiveCash);

  const handleDiscountChange = (val: string) => {
    const num = cleanNumber(val);
    setDiscount(num);
    setDiscountInput(num > 0 ? num.toLocaleString('en-US') : '');
  };

  const handleCashChange = (val: string) => {
    const num = cleanNumber(val);
    setCashAmount(num);
    setCashInput(num > 0 ? num.toLocaleString('en-US') : '');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('سبد خرید خالی است!');
      return;
    }

    const fullNotes = [notes.trim(), isCredit && creditNotes.trim() ? `سررسید/نسیه: ${creditNotes.trim()}` : '']
      .filter(Boolean)
      .join(' - ');

    onCompleteSale({
      customer_name: customerName.trim() || 'مشتری حضوری',
      items: cart,
      discount,
      payment_method: paymentMethod,
      cash_amount: effectiveCash,
      pos_amount: calculatedPos,
      is_credit: isCredit ? 1 : 0,
      notes: fullNotes
    });

    // Reset cart and fields
    setCart([]);
    setCustomerName('');
    setDiscount(0);
    setDiscountInput('');
    setCashAmount(0);
    setCashInput('');
    setIsCredit(false);
    setNotes('');
    setCreditNotes('');
  };

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-5 overflow-hidden">
      {/* Products Column */}
      <div className="bg-white dark:bg-slate-800/90 border border-emerald-100 dark:border-slate-700/80 rounded-3xl p-5 shadow-xs flex flex-col lg:col-span-8 h-full min-h-0">
        {/* Card and Font Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/60 dark:bg-slate-900/60 p-3 rounded-2xl border border-emerald-200/50 dark:border-slate-700 mb-3 text-xs shrink-0">
          {/* Card Size */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">اندازه کارت‌ها:</span>
            <button
              onClick={() => setCardSizeIdx(prev => Math.max(0, prev - 1))}
              className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-xs"
              title="بزرگ‌تر کردن کارت"
            >
              +
            </button>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 px-1 w-12 text-center">
              {CARD_SIZE_LABELS[cardSizeIdx]}
            </span>
            <button
              onClick={() => setCardSizeIdx(prev => Math.min(CARD_GRID_CLASSES.length - 1, prev + 1))}
              className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-xs"
              title="کوچک‌تر کردن کارت"
            >
              -
            </button>
          </div>

          {/* Font Size with Profit text synchronization */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">اندازه فونت:</span>
            <button
              onClick={() => setFontSize(prev => Math.max(9, prev - 1))}
              className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-xs"
              title="کاهش سایز فونت (شامل سود کالا)"
            >
              -
            </button>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 px-1 w-12 text-center" dir="ltr">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(prev => Math.min(20, prev + 1))}
              className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-xs"
              title="افزایش سایز فونت (شامل سود کالا)"
            >
              +
            </button>
          </div>

          {/* Show Profit Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={showProfit}
              onChange={e => setShowProfit(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span>نمایش سود کالا</span>
          </label>
        </div>

        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در کالاها (نام، برند، بارکد)..."
              className="w-full pr-10 pl-4 py-2.5 bg-emerald-50/20 dark:bg-slate-900/50 border border-emerald-200/60 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition font-medium"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                همه ({products.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div
          className={`grid gap-2.5 overflow-y-auto pr-1 flex-1 items-start content-start ${CARD_GRID_CLASSES[cardSizeIdx]}`}
        >
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
              کالایی با این مشخصات یافت نشد.
            </div>
          ) : (
            filteredProducts.map(p => {
              const profit = p.sell_price_pack - p.buy_price;
              const isLow = p.stock_packs <= (p.min_stock_alert || 15);
              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  style={{ fontSize: `${fontSize}px` }}
                  className={`border rounded-2xl p-2.5 bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between cursor-pointer shadow-2xs select-none ${
                    isLow
                      ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                      {p.name}
                    </div>
                    <div
                      style={{ fontSize: `${Math.max(9, fontSize * 0.85)}px` }}
                      className="text-slate-400 dark:text-slate-400 mt-0.5 truncate"
                    >
                      {p.brand || 'بدون برند'}
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span
                        style={{ fontSize: `${Math.max(9, fontSize * 0.88)}px` }}
                        className="text-slate-500 dark:text-slate-400"
                      >
                        موجود:
                      </span>
                      <span
                        style={{ fontSize: `${fontSize}px` }}
                        className={`font-black ${
                          isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {formatNumber(p.stock_packs)} {p.unit_type || 'بسته'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        style={{ fontSize: `${Math.max(9, fontSize * 0.88)}px` }}
                        className="text-slate-500 dark:text-slate-400"
                      >
                        قیمت:
                      </span>
                      <span
                        style={{ fontSize: `${fontSize}px` }}
                        className="font-black text-slate-900 dark:text-white"
                      >
                        {formatNumber(p.sell_price_pack)}
                      </span>
                    </div>

                    {/* PROFIT ROW: DYNAMICALLY SCALED WITH FONT SIZE AS REQUESTED BY USER */}
                    {showProfit && (
                      <div
                        style={{ fontSize: `${fontSize}px` }}
                        className="flex justify-between items-center pt-0.5 border-t border-dashed border-slate-100 dark:border-slate-700/50"
                      >
                        <span
                          style={{ fontSize: `${Math.max(9, fontSize * 0.9)}px` }}
                          className="text-slate-500 dark:text-slate-400"
                        >
                          سود:
                        </span>
                        <span
                          style={{ fontSize: `${fontSize}px` }}
                          className="font-extrabold text-emerald-600 dark:text-emerald-400"
                        >
                          {formatNumber(profit)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cart Column */}
      <div className="bg-white dark:bg-slate-800/90 border border-emerald-100 dark:border-slate-700/80 rounded-3xl p-5 shadow-xs lg:col-span-4 flex flex-col justify-between h-full min-h-0 overflow-y-auto">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              فاکتور فروش جاری
            </h3>
            <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full font-extrabold border border-emerald-200 dark:border-emerald-700">
              {cart.length} قلم
            </span>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 overflow-y-auto my-3 flex-1 min-h-[140px] pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
                <ShoppingCart className="w-8 h-8 opacity-40 text-slate-400" />
                <span>سبد خرید خالی است. روی کالاها کلیک کنید.</span>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex flex-col gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 ml-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.product_name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400">
                        {formatNumber(item.unit_price)} ریال × {item.quantity_packs} ={' '}
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatNumber(item.total_price)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartItemQty(item.product_id, item.quantity_packs - 1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={item.quantity_packs}
                        onChange={e => updateCartItemQty(item.product_id, parseFloat(e.target.value) || 1)}
                        className="w-12 px-1 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-center font-bold text-xs"
                      />
                      <button
                        onClick={() => updateCartItemQty(item.product_id, item.quantity_packs + 1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-rose-500 font-bold px-1.5 py-1 hover:text-rose-700 cursor-pointer"
                        title="حذف قلم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Price Edit */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">قیمت واحد فروش:</span>
                    <input
                      type="text"
                      defaultValue={item.unit_price.toLocaleString('en-US')}
                      onBlur={e => {
                        const val = cleanNumber(e.target.value);
                        if (val > 0) updateCartItemPrice(item.product_id, val);
                      }}
                      className="w-28 px-2 py-0.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-600 rounded-lg text-center font-bold text-emerald-700 dark:text-emerald-400 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer & Settlement Panel */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              نام مشتری:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="نام مشتری را وارد کنید..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
          </div>

          <div className="bg-emerald-50/40 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-emerald-200/50 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
              <span>جمع کل اقلام:</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {formatNumber(subtotal)} ریال
              </span>
            </div>

            <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
              <span>تخفیف فاکتور (ریال):</span>
              <input
                type="text"
                value={discountInput}
                onChange={e => handleDiscountChange(e.target.value)}
                placeholder="0"
                className="w-28 px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-center text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
              <span>شیوه پرداخت اصلی:</span>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-medium focus:outline-none"
              >
                {paymentMethods.map(pm => (
                  <option key={pm.code} value={pm.code}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Split Cash & POS */}
            <div className="pt-2 border-t border-emerald-200/60 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-amber-500" />
                  وجه نقد دریافتی:
                </span>
                <input
                  type="text"
                  value={cashInput}
                  onChange={e => handleCashChange(e.target.value)}
                  placeholder="0"
                  className="w-28 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl text-center text-xs font-bold text-amber-900 dark:text-amber-300 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                  مبلغ پوز (متباقی):
                </span>
                <span className="font-black text-xs text-sky-700 dark:text-sky-400">
                  {formatNumber(calculatedPos)} ریال
                </span>
              </div>
            </div>

            {/* General Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                توضیحات فاکتور:
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="توضیحات مربوط به فاکتور..."
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
              />
            </div>

            {/* Credit Option */}
            <div className="pt-2 border-t border-emerald-200/60 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-800 dark:text-amber-400 select-none">
                <input
                  type="checkbox"
                  checked={isCredit}
                  onChange={e => setIsCredit(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                />
                <span>ثبت به عنوان فاکتور مانده (نسیه / حساب)</span>
              </label>
              {isCredit && (
                <input
                  type="text"
                  value={creditNotes}
                  onChange={e => setCreditNotes(e.target.value)}
                  placeholder="توضیحات خاص مانده (مثلا تاریخ سررسید، شماره تماس)..."
                  className="w-full px-3 py-1.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-medium text-amber-900 dark:text-amber-200 focus:outline-none"
                />
              )}
            </div>

            <div className="pt-2 border-t border-emerald-200/60 dark:border-slate-700 flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-white text-sm">مبلغ قابل پرداخت:</span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                {formatNumber(finalAmount)} ریال
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2 ${
              cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            ثبت نهایی فاکتور و کسر از انبار
          </button>
        </div>
      </div>
    </div>
  );
};
