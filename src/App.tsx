import React, { useState, useEffect } from 'react';
import {
  Product,
  Category,
  ProductUnit,
  PaymentMethod,
  Invoice,
  Purchase,
  Expense,
  UserSettings,
  CartItem
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCT_UNITS,
  INITIAL_PAYMENT_METHODS,
  INITIAL_SETTINGS
} from './data/initialData';
import { getPersianDate, getPersianWeekday, getPersianTime } from './utils/persianDate';

import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { PurchasesView } from './components/PurchasesView';
import { CreditsView } from './components/CreditsView';
import { ExpensesView } from './components/ExpensesView';
import { ReportsView } from './components/ReportsView';
import { InvoicesHistoryView } from './components/InvoicesHistoryView';
import { SettingsView } from './components/SettingsView';

import {
  ShoppingCart,
  Package,
  ArrowDownToLine,
  Clock,
  Receipt,
  BarChart3,
  FileText,
  Settings,
  Moon,
  Sun,
  Save,
  FileSpreadsheet
} from 'lucide-react';

type TabType =
  | 'pos'
  | 'inventory'
  | 'purchases'
  | 'credits'
  | 'expenses'
  | 'reports'
  | 'invoices'
  | 'settings';

export default function App() {
  // Persistent States
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nasri_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('nasri_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [productUnits, setProductUnits] = useState<ProductUnit[]>(() => {
    const saved = localStorage.getItem('nasri_product_units');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_UNITS;
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('nasri_payment_methods');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('nasri_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('nasri_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('nasri_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('nasri_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<TabType>('pos');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('nasri_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nasri_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('nasri_product_units', JSON.stringify(productUnits));
  }, [productUnits]);

  useEffect(() => {
    localStorage.setItem('nasri_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('nasri_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('nasri_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('nasri_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('nasri_settings', JSON.stringify(userSettings));
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setUserSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  // Font size handlers
  const handleSetFontSize = (size: number | ((prev: number) => number)) => {
    setUserSettings(prev => ({
      ...prev,
      fontSize: typeof size === 'function' ? size(prev.fontSize) : size
    }));
  };

  // Card size handlers
  const handleSetCardSizeIdx = (idx: number | ((prev: number) => number)) => {
    setUserSettings(prev => ({
      ...prev,
      cardSizeIdx: typeof idx === 'function' ? idx(prev.cardSizeIdx) : idx
    }));
  };

  // Show profit handler
  const handleSetShowProfit = (show: boolean | ((prev: boolean) => boolean)) => {
    setUserSettings(prev => ({
      ...prev,
      showProfit: typeof show === 'function' ? show(prev.showProfit) : show
    }));
  };

  // Badges
  const lowStockCount = products.filter(p => p.stock_packs <= (p.min_stock_alert || 15)).length;
  const creditInvoicesCount = invoices.filter(i => i.is_credit === 1).length;

  // Invoice creation from POS
  const handleCompleteSale = (invData: {
    customer_name: string;
    items: CartItem[];
    discount: number;
    payment_method: string;
    cash_amount: number;
    pos_amount: number;
    is_credit: number;
    notes: string;
  }) => {
    const total_amount = invData.items.reduce((sum, item) => sum + item.total_price, 0);
    const final_amount = Math.max(0, total_amount - invData.discount);
    const total_cost = invData.items.reduce((sum, item) => sum + item.total_cost, 0);
    const net_profit = final_amount - total_cost;
    const invNum = `F-${Date.now().toString().slice(-8)}`;

    const newInvoice: Invoice = {
      id: Date.now(),
      invoice_number: invNum,
      customer_name: invData.customer_name,
      date_str: getPersianDate(),
      time_str: getPersianTime().slice(0, 5),
      payment_method: invData.payment_method,
      cash_amount: invData.cash_amount,
      pos_amount: invData.pos_amount,
      total_amount,
      discount: invData.discount,
      final_amount,
      total_cost,
      net_profit,
      is_credit: invData.is_credit,
      notes: invData.notes,
      items: invData.items
    };

    // Deduct stock from products
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const cartItem = invData.items.find(item => item.product_id === p.id);
        if (cartItem) {
          return {
            ...p,
            stock_packs: Math.max(0, p.stock_packs - cartItem.quantity_packs)
          };
        }
        return p;
      })
    );

    setInvoices(prev => [newInvoice, ...prev]);
    alert(`فاکتور با شماره ${invNum} با موفقیت ثبت و از انبار کسر شد.`);
  };

  // Delete invoice & restore inventory
  const handleDeleteInvoice = (id: number) => {
    const target = invoices.find(i => i.id === id);
    if (!target) return;

    // Restore stock
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const item = target.items.find(it => it.product_id === p.id);
        if (item) {
          return {
            ...p,
            stock_packs: p.stock_packs + item.quantity_packs
          };
        }
        return p;
      })
    );

    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // Settle credit invoice
  const handleSettleInvoice = (id: number) => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, is_credit: 0 } : inv))
    );
  };

  // Product CRUD
  const handleAddProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: Date.now()
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const handleUpdateProduct = (id: number, prodData: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...prodData } : p))
    );
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Categories CRUD
  const handleAddCategory = (name: string) => {
    const newCat: Category = {
      id: Date.now(),
      name,
      sort_order: categories.length
    };
    setCategories(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Product Units CRUD
  const handleAddProductUnit = (name: string) => {
    const newUnit: ProductUnit = {
      id: Date.now(),
      name,
      sort_order: productUnits.length
    };
    setProductUnits(prev => [...prev, newUnit]);
  };

  const handleDeleteProductUnit = (id: number) => {
    setProductUnits(prev => prev.filter(u => u.id !== id));
  };

  // Payment Methods CRUD
  const handleAddPaymentMethod = (name: string) => {
    const code = `pm_${Date.now()}`;
    const newPm: PaymentMethod = {
      id: Date.now(),
      name,
      code,
      sort_order: paymentMethods.length
    };
    setPaymentMethods(prev => [...prev, newPm]);
  };

  const handleDeletePaymentMethod = (id: number) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  // Purchases CRUD
  const handleAddPurchase = (purData: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purData,
      id: Date.now()
    };

    // Update product stock and weighted average buy price
    setProducts(prev =>
      prev.map(p => {
        if (p.id === purData.product_id) {
          const currentStock = p.stock_packs;
          const currentBuy = p.buy_price;
          const incomingPacks = purData.quantity_packs;
          const incomingPrice = purData.buy_price_per_pack;
          const newStock = currentStock + incomingPacks;
          const newWeighted =
            newStock > 0
              ? Math.round((currentStock * currentBuy + incomingPacks * incomingPrice) / newStock)
              : incomingPrice;

          return {
            ...p,
            stock_packs: newStock,
            buy_price: newWeighted
          };
        }
        return p;
      })
    );

    setPurchases(prev => [newPurchase, ...prev]);
    alert('خرید با موفقیت ثبت و انبار به‌روزرسانی شد.');
  };

  const handleDeletePurchase = (id: number) => {
    const pur = purchases.find(p => p.id === id);
    if (!pur) return;

    // Deduct stock from product
    setProducts(prev =>
      prev.map(p => {
        if (p.id === pur.product_id) {
          return {
            ...p,
            stock_packs: Math.max(0, p.stock_packs - pur.quantity_packs)
          };
        }
        return p;
      })
    );

    setPurchases(prev => prev.filter(p => p.id !== id));
  };

  // Expenses CRUD
  const handleAddExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: Date.now()
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Backup handlers
  const handleExportBackup = () => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      categories,
      productUnits,
      paymentMethods,
      invoices,
      purchases,
      expenses,
      userSettings
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nasri_tobacco_backup_${getPersianDate().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (data: any) => {
    if (data.products) setProducts(data.products);
    if (data.categories) setCategories(data.categories);
    if (data.productUnits) setProductUnits(data.productUnits);
    if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
    if (data.invoices) setInvoices(data.invoices);
    if (data.purchases) setPurchases(data.purchases);
    if (data.expenses) setExpenses(data.expenses);
    if (data.userSettings) setUserSettings(data.userSettings);
  };

  // Excel CSV Export (with UTF-8 BOM)
  const handleExportExcel = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel to open Persian text correctly

    // Products Sheet
    csvContent += '--- انبار محصولات ---\n';
    csvContent += 'شناسه,نام کالا,برند,دسته‌بندی,موجودی,واحد,قیمت خرید,قیمت فروش,هشدار کسری\n';
    products.forEach(p => {
      csvContent += `${p.id},"${p.name}","${p.brand || ''}","${p.category}",${p.stock_packs},"${p.unit_type}",${p.buy_price},${p.sell_price_pack},${p.min_stock_alert}\n`;
    });

    csvContent += '\n--- فاکتورهای فروش ---\n';
    csvContent += 'شماره فاکتور,نام مشتری,تاریخ,ساعت,مبلغ کل,تخفیف,مبلغ نهایی,سود,نسیه\n';
    invoices.forEach(inv => {
      csvContent += `"${inv.invoice_number}","${inv.customer_name}","${inv.date_str}","${inv.time_str}",${inv.total_amount},${inv.discount},${inv.final_amount},${inv.net_profit},${inv.is_credit ? 'بله' : 'خیر'}\n`;
    });

    csvContent += '\n--- خریدهای ثبت شده ---\n';
    csvContent += 'نام کالا,واحد,تعداد,فی خرید,مبلغ کل,فروشنده,شماره فاکتور,تاریخ\n';
    purchases.forEach(pur => {
      csvContent += `"${pur.product_name}","${pur.unit}",${pur.quantity},${pur.buy_price_per_pack},${pur.total_cost},"${pur.supplier || ''}","${pur.invoice_number || ''}","${pur.date_str}"\n`;
    });

    csvContent += '\n--- هزینه‌ها ---\n';
    csvContent += 'عنوان هزینه,مبلغ,تاریخ,ساعت,توضیحات\n';
    expenses.forEach(exp => {
      csvContent += `"${exp.title}",${exp.amount},"${exp.date_str}","${exp.time_str}","${exp.description || ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tobacco_accounting_${getPersianDate().replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-emerald-50/30 via-sky-50/20 to-amber-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 sticky top-0 z-50 shadow-xs w-full shrink-0">
        <div className="w-full px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo and Persian Date */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/30">
              د
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                دخانیات نصری
                <span className="text-[11px] bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-black border border-amber-300 dark:border-amber-700">
                  📆 {getPersianWeekday()}
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-0.5 rounded-full font-black border border-emerald-200 dark:border-emerald-700 mr-1">
                  📅 {getPersianDate()}
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                سیستم جامع حسابداری و انبارداری تخصصی دخانیات
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-emerald-50/60 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-emerald-200/50 dark:border-slate-700 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'pos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              میز کار (POS)
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              انبار
              {lowStockCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'purchases'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700'
              }`}
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              ورود کالا و خرید
            </button>

            <button
              onClick={() => setActiveTab('credits')}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'credits'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              مانده‌ها
              {creditInvoicesCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                  {creditInvoicesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'expenses'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              هزینه‌ها
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              گزارشات سود
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              تاریخچه فاکتورها
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              تنظیمات
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
            >
              {userSettings.darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{userSettings.darkMode ? 'تم روز' : 'تم شب'}</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>بک‌آپ</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>اکسل</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 px-6 py-4 flex flex-col overflow-hidden">
        {activeTab === 'pos' && (
          <PosView
            products={products}
            paymentMethods={paymentMethods}
            fontSize={userSettings.fontSize}
            setFontSize={handleSetFontSize}
            cardSizeIdx={userSettings.cardSizeIdx}
            setCardSizeIdx={handleSetCardSizeIdx}
            showProfit={userSettings.showProfit}
            setShowProfit={handleSetShowProfit}
            onCompleteSale={handleCompleteSale}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            categories={categories}
            productUnits={productUnits}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesView
            products={products}
            productUnits={productUnits}
            categories={categories}
            purchases={purchases}
            onAddPurchase={handleAddPurchase}
            onDeletePurchase={handleDeletePurchase}
          />
        )}

        {activeTab === 'credits' && (
          <CreditsView invoices={invoices} onSettleInvoice={handleSettleInvoice} />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            invoices={invoices}
            expenses={expenses}
            paymentMethods={paymentMethods}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesHistoryView
            invoices={invoices}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            paymentMethods={paymentMethods}
            productUnits={productUnits}
            onAddPaymentMethod={handleAddPaymentMethod}
            onDeletePaymentMethod={handleDeletePaymentMethod}
            onAddProductUnit={handleAddProductUnit}
            onDeleteProductUnit={handleDeleteProductUnit}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onExportExcel={handleExportExcel}
          />
        )}
      </main>
    </div>
  );
}
