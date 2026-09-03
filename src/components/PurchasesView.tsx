import React, { useState, useEffect } from 'react';
import { Product, Purchase, ProductUnit, Category } from '../types';
import { formatNumber, cleanNumber, getPersianDate } from '../utils/persianDate';
import { ArrowDownToLine, Trash2, Search, PackageCheck, AlertCircle, CheckCircle } from 'lucide-react';

interface PurchasesViewProps {
  products: Product[];
  productUnits: ProductUnit[];
  categories: Category[];
  purchases: Purchase[];
  onAddPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  onDeletePurchase: (id: number) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  products,
  productUnits,
  categories,
  purchases,
  onAddPurchase,
  onDeletePurchase
}) => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Selected packaging unit - defaults to 'بسته' or first unit
  const [selectedUnit, setSelectedUnit] = useState<string>('بسته');

  // Quantities & Pricing
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityInput, setQuantityInput] = useState<string>('1');

  const [buyPricePack, setBuyPricePack] = useState<number>(0);
  const [buyPriceInput, setBuyPriceInput] = useState<string>('');

  const [totalPay, setTotalPay] = useState<number>(0);
  const [totalPayInput, setTotalPayInput] = useState<string>('');

  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // When product changes, update price and default unit
  useEffect(() => {
    if (selectedProduct) {
      setBuyPricePack(selectedProduct.buy_price);
      setBuyPriceInput(selectedProduct.buy_price.toLocaleString('en-US'));

      // If product has a unit_type matching available units, pick it, else default to 'بسته'
      const matchUnit = productUnits.find(u => u.name === selectedProduct.unit_type);
      if (matchUnit) {
        setSelectedUnit(matchUnit.name);
      } else {
        setSelectedUnit(productUnits[0]?.name || 'بسته');
      }

      // Recalculate initial total with 1 quantity
      const multiplier = getUnitMultiplier(selectedUnit, selectedProduct);
      const packs = (quantity || 1) * multiplier;
      const tot = Math.round(packs * selectedProduct.buy_price);
      setTotalPay(tot);
      setTotalPayInput(tot.toLocaleString('en-US'));
    }
  }, [selectedProductId]);

  // Multiplier helper
  function getUnitMultiplier(unitName: string, product?: Product): number {
    if (!product) return 1;
    const packsPerBox = product.packs_per_box || 10;
    const boxesPerCarton = product.boxes_per_carton || 50;

    if (unitName === 'باکس' || unitName === 'box') {
      return packsPerBox;
    }
    if (unitName === 'کارتن' || unitName === 'carton') {
      return packsPerBox * boxesPerCarton;
    }
    return 1;
  }

  // Handle unit selection
  const handleUnitSelect = (unitName: string) => {
    setSelectedUnit(unitName);
    if (!selectedProduct) return;

    const multiplier = getUnitMultiplier(unitName, selectedProduct);
    const packs = (quantity || 1) * multiplier;
    const tot = Math.round(packs * buyPricePack);
    setTotalPay(tot);
    setTotalPayInput(tot.toLocaleString('en-US'));
  };

  // 3-way smart calculation
  const handleQuantityChange = (valStr: string) => {
    setQuantityInput(valStr);
    const qty = parseFloat(valStr) || 0;
    setQuantity(qty);

    if (selectedProduct && buyPricePack > 0) {
      const multiplier = getUnitMultiplier(selectedUnit, selectedProduct);
      const packs = qty * multiplier;
      const tot = Math.round(packs * buyPricePack);
      setTotalPay(tot);
      setTotalPayInput(tot > 0 ? tot.toLocaleString('en-US') : '');
    }
  };

  const handlePriceChange = (valStr: string) => {
    const price = cleanNumber(valStr);
    setBuyPricePack(price);
    setBuyPriceInput(price > 0 ? price.toLocaleString('en-US') : '');

    if (selectedProduct && quantity > 0) {
      const multiplier = getUnitMultiplier(selectedUnit, selectedProduct);
      const packs = quantity * multiplier;
      const tot = Math.round(packs * price);
      setTotalPay(tot);
      setTotalPayInput(tot > 0 ? tot.toLocaleString('en-US') : '');
    }
  };

  const handleTotalChange = (valStr: string) => {
    const tot = cleanNumber(valStr);
    setTotalPay(tot);
    setTotalPayInput(tot > 0 ? tot.toLocaleString('en-US') : '');

    if (selectedProduct && quantity > 0) {
      const multiplier = getUnitMultiplier(selectedUnit, selectedProduct);
      const packs = quantity * multiplier;
      if (packs > 0) {
        const calculatedPrice = Math.round(tot / packs);
        setBuyPricePack(calculatedPrice);
        setBuyPriceInput(calculatedPrice > 0 ? calculatedPrice.toLocaleString('en-US') : '');
      }
    }
  };

  const handleSelectProduct = (p: Product) => {
    setSelectedProductId(p.id);
    setSearchQuery(p.name);
    setIsDropdownOpen(false);
  };

  // Weighted average preview calculation
  const multiplier = getUnitMultiplier(selectedUnit, selectedProduct);
  const incomingPacks = (quantity || 0) * multiplier;
  const currentStock = selectedProduct ? selectedProduct.stock_packs : 0;
  const currentBuyPrice = selectedProduct ? selectedProduct.buy_price : 0;
  const newStock = currentStock + incomingPacks;
  const newWeightedAvg =
    newStock > 0 && selectedProduct
      ? Math.round((currentStock * currentBuyPrice + incomingPacks * buyPricePack) / newStock)
      : buyPricePack;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('لطفا ابتدا یک کالا را انتخاب کنید.');
      return;
    }
    if (quantity <= 0) {
      alert('تعداد وارد شده باید بزرگ‌تر از صفر باشد.');
      return;
    }
    if (buyPricePack <= 0 && totalPay <= 0) {
      alert('قیمت خرید را مشخص کنید.');
      return;
    }

    onAddPurchase({
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      unit: selectedUnit,
      quantity,
      quantity_packs: incomingPacks,
      buy_price_per_pack: buyPricePack,
      total_cost: totalPay || incomingPacks * buyPricePack,
      supplier: supplier.trim(),
      invoice_number: invoiceNumber.trim(),
      date_str: getPersianDate(),
      notes: notes.trim()
    });

    // Reset form
    setSelectedProductId(null);
    setSearchQuery('');
    setQuantity(1);
    setQuantityInput('1');
    setBuyPricePack(0);
    setBuyPriceInput('');
    setTotalPay(0);
    setTotalPayInput('');
    setSupplier('');
    setInvoiceNumber('');
    setNotes('');
  };

  const filteredDropdownProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-5 overflow-y-auto min-h-0">
      {/* Purchase Entry Form */}
      <div className="bg-white dark:bg-slate-800/90 border border-emerald-100 dark:border-slate-700/80 rounded-3xl p-6 shadow-xs lg:col-span-6 flex flex-col justify-between overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              فرم ثبت خرید و ورود کالا به انبار
            </h3>
            <span className="text-[11px] text-slate-400">ارتباط هوشمند سه‌طرفه و میانگین موزون</span>
          </div>

          {/* 1. Product Search & Selection */}
          <div className="relative">
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              جستجو و انتخاب کالا *
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="نام یا برند کالا را جستجو کنید..."
                className="w-full pr-10 pl-4 py-2.5 bg-emerald-50/30 dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Filter for Products Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-30 top-16 right-0 left-0 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex gap-1 overflow-x-auto bg-slate-50 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer whitespace-nowrap ${
                      categoryFilter === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    همه
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryFilter(c.name)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer whitespace-nowrap ${
                        categoryFilter === c.name
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto max-h-48 divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDropdownProducts.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">کالایی یافت نشد.</div>
                  ) : (
                    filteredDropdownProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className="p-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{p.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {p.brand || 'بدون برند'} | دسته: {p.category}
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {formatNumber(p.stock_packs)} {p.unit_type || 'بسته'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. THE REQUESTED FEATURE: "واحد بسته‌بندی خرید... دسته‌بندی‌هایی باشه تا بتونیم انتخاب کنیم" */}
          <div className="bg-emerald-50/40 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-emerald-200/60 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-extrabold text-emerald-800 dark:text-emerald-300">
                واحد بسته‌بندی خرید:
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                (هماهنگ با دسته‌بندی و واحدهای تنظیمات)
              </span>
            </div>

            {/* Packaging Units Chips list dynamically pulled from Settings (productUnits) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {productUnits.map(unit => {
                const isSelected = selectedUnit === unit.name;
                const isBox = unit.name === 'باکس';
                const isCarton = unit.name === 'کارتن';
                const extraNote =
                  selectedProduct && isBox
                    ? ` (${selectedProduct.packs_per_box || 10} تایی)`
                    : selectedProduct && isCarton
                    ? ` (${(selectedProduct.packs_per_box || 10) * (selectedProduct.boxes_per_carton || 50)} تایی)`
                    : '';

                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => handleUnitSelect(unit.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-slate-900 font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                    <span>{unit.name}{extraNote}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Three-way Quantities and Pricing */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                تعداد ({selectedUnit}):
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantityInput}
                onChange={e => handleQuantityChange(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold text-xs sm:text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                قیمت هر واحد پایه:
              </label>
              <input
                type="text"
                value={buyPriceInput}
                onChange={e => handlePriceChange(e.target.value)}
                placeholder="قیمت پایه"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                مبلغ کل (ریال):
              </label>
              <input
                type="text"
                value={totalPayInput}
                onChange={e => handleTotalChange(e.target.value)}
                placeholder="مبلغ کل"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold text-amber-700 dark:text-amber-400 text-xs sm:text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Supplier and Invoice # */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">فروشنده:</label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="نام فروشنده یا پخش..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">شماره فاکتور خرید:</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="شماره فاکتور خرید..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Smart Weighted Average Preview */}
          <div className="bg-emerald-50/60 dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-700 p-4 rounded-2xl space-y-2 text-[11px] text-slate-700 dark:text-slate-300">
            <div className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              تحلیل هوشمند میانگین موزون انبار:
            </div>
            <div className="flex justify-between">
              <span>حجم ورودی معادل:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatNumber(incomingPacks)} {selectedProduct?.unit_type || 'بسته'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>موجودی فعلی انبار:</span>
              <span className="font-bold">
                {formatNumber(currentStock)} {selectedProduct?.unit_type || 'بسته'} (نرخ فعلی:{' '}
                {formatNumber(currentBuyPrice)})
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-emerald-200/50 dark:border-slate-700">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                نرخ میانگین موزون جدید پس از ثبت:
              </span>
              <span className="font-black text-emerald-700 dark:text-emerald-400">
                {formatNumber(newWeightedAvg)} ریال
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedProduct}
            className={`w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 ${
              !selectedProduct ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            ثبت ورود کالا و به‌روزرسانی میانگین انبار
          </button>
        </form>
      </div>

      {/* Purchases History List */}
      <div className="bg-white dark:bg-slate-800/90 border border-emerald-100 dark:border-slate-700/80 rounded-3xl p-6 shadow-xs space-y-3 lg:col-span-6 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            تاریخچه خریدها و ورود کالا ({purchases.length} رکورد)
          </h3>
          <span className="text-[11px] text-slate-400">امکان حذف و بازگشت موجودی</span>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {purchases.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">هنوز خریدی ثبت نشده است.</div>
          ) : (
            purchases.map(pur => (
              <div
                key={pur.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs flex justify-between items-center hover:border-emerald-200 transition"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {pur.product_name}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    تعداد: <span className="font-bold text-emerald-700 dark:text-emerald-400">{pur.quantity} {pur.unit}</span>{' '}
                    (معادل {pur.quantity_packs} واحد پایه) | فی:{' '}
                    {formatNumber(pur.buy_price_per_pack)} ریال
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    فروشنده: {pur.supplier || 'ثبت نشده'} | فاکتور:{' '}
                    {pur.invoice_number || '-'} | تاریخ: {pur.date_str}
                  </div>
                </div>

                <div className="text-left flex flex-col items-end gap-1">
                  <div className="font-black text-amber-700 dark:text-amber-400 text-sm">
                    {formatNumber(pur.total_cost)} ریال
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`آیا از حذف این رکورد خرید (${pur.product_name}) اطمینان دارید؟ موجودی انبار کسر خواهد شد.`)) {
                        onDeletePurchase(pur.id);
                      }
                    }}
                    className="text-rose-500 hover:text-rose-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
