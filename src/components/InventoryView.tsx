import React, { useState } from 'react';
import { Product, Category, ProductUnit } from '../types';
import { formatNumber, cleanNumber } from '../utils/persianDate';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, Layers, Tag } from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  productUnits: ProductUnit[];
  onAddProduct: (prod: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: number, prod: Partial<Product>) => void;
  onDeleteProduct: (id: number) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  categories,
  productUnits,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newCatName, setNewCatName] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for modal
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: categories[0]?.name || 'سیگار خارجی',
    unit_type: productUnits[0]?.name || 'بسته',
    stock_packs: 0,
    min_stock_alert: 15,
    packs_per_box: 10,
    boxes_per_carton: 50,
    buy_price: 0,
    sell_price_pack: 0,
    barcode: ''
  });

  const [buyPriceInput, setBuyPriceInput] = useState('');
  const [sellPriceInput, setSellPriceInput] = useState('');

  // KPI calculations
  const totalItems = products.length;
  const totalSellValue = products.reduce((acc, p) => acc + p.stock_packs * p.sell_price_pack, 0);
  const totalBuyValue = products.reduce((acc, p) => acc + p.stock_packs * p.buy_price, 0);
  const totalHiddenProfit = totalSellValue - totalBuyValue;

  const filteredProducts = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      category: categories[0]?.name || 'سیگار خارجی',
      unit_type: productUnits[0]?.name || 'بسته',
      stock_packs: 0,
      min_stock_alert: 15,
      packs_per_box: 10,
      boxes_per_carton: 50,
      buy_price: 0,
      sell_price_pack: 0,
      barcode: ''
    });
    setBuyPriceInput('');
    setSellPriceInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      brand: p.brand || '',
      category: p.category,
      unit_type: p.unit_type || 'بسته',
      stock_packs: p.stock_packs,
      min_stock_alert: p.min_stock_alert || 15,
      packs_per_box: p.packs_per_box || 10,
      boxes_per_carton: p.boxes_per_carton || 50,
      buy_price: p.buy_price,
      sell_price_pack: p.sell_price_pack,
      barcode: p.barcode || ''
    });
    setBuyPriceInput(p.buy_price ? p.buy_price.toLocaleString('en-US') : '');
    setSellPriceInput(p.sell_price_pack ? p.sell_price_pack.toLocaleString('en-US') : '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('نام کالا الزامی است.');
      return;
    }

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, formData);
    } else {
      onAddProduct(formData);
    }
    setIsModalOpen(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-3xl shadow-xs">
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">تنوع کل کالاها:</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalItems} قلم</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-3xl shadow-xs">
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">ارزش فروش موجودی:</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatNumber(totalSellValue)} ریال
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-3xl shadow-xs">
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">ارزش خرید موجودی:</div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
            {formatNumber(totalBuyValue)} ریال
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 p-4 rounded-3xl shadow-xs bg-emerald-50/30 dark:bg-emerald-950/20">
          <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-black">سود نهفته انبار:</div>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {formatNumber(totalHiddenProfit)} ریال
          </div>
        </div>
      </div>

      {/* Categories Manager Bar */}
      <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-5 shadow-xs space-y-3 shrink-0">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            مدیریت دسته‌بندی‌های کالاها
          </h3>
          <span className="text-[11px] text-slate-400">افزودن و برچسب‌گذاری سریع</span>
        </div>

        <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="نام دسته‌بندی جدید (مثلاً پیپ و تنباکو)..."
            className="px-3.5 py-2 bg-emerald-50/30 dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 rounded-xl text-xs w-full focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs cursor-pointer"
          >
            + افزودن دسته
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1 border border-dashed border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            همه دسته‌ها ({products.length})
          </button>

          {categories.map(c => {
            const count = products.filter(p => p.category === c.name).length;
            const isSelected = selectedCategory === c.name;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-2xs ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <span>
                  {c.name} ({count})
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    if (confirm(`آیا از حذف دسته‌بندی "${c.name}" اطمینان دارید؟`)) {
                      onDeleteCategory(c.id);
                    }
                  }}
                  className="text-rose-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  title="حذف دسته"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-5 shadow-xs flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            موجودی و آستانه هشدار اختصاصی انبار
          </h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجو در انبار..."
                className="pr-9 pl-3.5 py-2 bg-emerald-50/30 dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 rounded-xl text-xs w-full focus:outline-none"
              />
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              کالای جدید
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1 mt-2">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3">نام کالا</th>
                <th className="py-3 px-3">برند / دسته</th>
                <th className="py-3 px-3 text-center">موجودی</th>
                <th className="py-3 px-3 text-center">واحد</th>
                <th className="py-3 px-3 text-center">آستانه هشدار</th>
                <th className="py-3 px-3 text-center">خرید میانگین</th>
                <th className="py-3 px-3 text-center">فروش واحد</th>
                <th className="py-3 px-3 text-center">سود واحد</th>
                <th className="py-3 px-3 text-center">وضعیت</th>
                <th className="py-3 px-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    کالایی با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.stock_packs <= (p.min_stock_alert || 15);
                  const profit = p.sell_price_pack - p.buy_price;
                  return (
                    <tr
                      key={p.id}
                      className={isLow ? 'bg-rose-50/40 dark:bg-rose-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-700/30'}
                    >
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {p.brand || '-'} / <span className="text-emerald-700 dark:text-emerald-400 font-medium">{p.category}</span>
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-black ${
                          isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {formatNumber(p.stock_packs)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400">{p.unit_type || 'بسته'}</td>
                      <td className="py-3 px-3 text-center text-rose-500 font-bold">{p.min_stock_alert || 15}</td>
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300">{formatNumber(p.buy_price)}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {formatNumber(p.sell_price_pack)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700 dark:text-amber-400">
                        {formatNumber(profit)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isLow ? (
                          <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            کسری موجودی
                          </span>
                        ) : (
                          <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                            عادی
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="text-sky-600 dark:text-sky-400 hover:text-sky-800 font-bold text-xs cursor-pointer flex items-center gap-0.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            ویرایش
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`آیا از حذف محصول "${p.name}" اطمینان دارید؟`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="text-rose-600 dark:text-rose-400 hover:text-rose-800 font-bold text-xs cursor-pointer flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                {editingProduct ? 'ویرایش مشخصات کالا' : 'تعریف کالا جدید در انبار'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">نام محصول: *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">برند:</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">دسته‌بندی:</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">واحد اندازه‌گیری:</label>
                  <select
                    value={formData.unit_type}
                    onChange={e => setFormData({ ...formData, unit_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none"
                  >
                    {productUnits.map(u => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">موجودی فعلی:</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.stock_packs}
                    onChange={e => setFormData({ ...formData, stock_packs: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">حداقل هشدار کسری:</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.min_stock_alert}
                    onChange={e => setFormData({ ...formData, min_stock_alert: parseFloat(e.target.value) || 15 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">تعداد در باکس:</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.packs_per_box}
                    onChange={e => setFormData({ ...formData, packs_per_box: parseFloat(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">نرخ خرید (ریال):</label>
                  <input
                    type="text"
                    value={buyPriceInput}
                    onChange={e => {
                      const val = cleanNumber(e.target.value);
                      setFormData({ ...formData, buy_price: val });
                      setBuyPriceInput(val > 0 ? val.toLocaleString('en-US') : '');
                    }}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">نرخ فروش (ریال):</label>
                  <input
                    type="text"
                    value={sellPriceInput}
                    onChange={e => {
                      const val = cleanNumber(e.target.value);
                      setFormData({ ...formData, sell_price_pack: val });
                      setSellPriceInput(val > 0 ? val.toLocaleString('en-US') : '');
                    }}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  {editingProduct ? 'ذخیره تغییرات' : 'ثبت کالا در انبار'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
