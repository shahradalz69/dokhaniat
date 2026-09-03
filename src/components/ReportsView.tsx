import React, { useState } from 'react';
import { Invoice, Expense, PaymentMethod } from '../types';
import { formatNumber, getPersianDate } from '../utils/persianDate';
import { BarChart3, Printer, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Banknote, Clock, Wallet } from 'lucide-react';

interface ReportsViewProps {
  invoices: Invoice[];
  expenses: Expense[];
  paymentMethods: PaymentMethod[];
}

type PeriodType = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export const ReportsView: React.FC<ReportsViewProps> = ({ invoices, expenses, paymentMethods }) => {
  const [period, setPeriod] = useState<PeriodType>('today');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59:59');

  // Modal for payment breakdown items
  const [selectedPmModal, setSelectedPmModal] = useState<{
    name: string;
    code: string;
    items: Invoice[];
    sum: number;
    cashSum: number;
    posSum: number;
  } | null>(null);

  const todayStr = getPersianDate();

  // Filter invoices and expenses based on period
  const filterByPeriod = (itemDate: string, itemTime?: string) => {
    if (!itemDate) return false;

    if (period === 'today') {
      return itemDate === todayStr;
    }
    if (period === 'week' || period === 'month') {
      // In Jalali YYYY/MM/DD, matching YYYY/MM
      return itemDate.substring(0, 7) === todayStr.substring(0, 7);
    }
    if (period === 'year') {
      return itemDate.substring(0, 4) === todayStr.substring(0, 4);
    }
    if (period === 'custom') {
      const sDate = startDate.trim() || '1300/01/01';
      const eDate = endDate.trim() || '1500/01/01';
      const itemSortKey = `${itemDate} ${itemTime || '00:00:00'}`;
      const startKey = `${sDate} ${startTime || '00:00:00'}`;
      const endKey = `${eDate} ${endTime || '23:59:59'}`;
      return itemSortKey >= startKey && itemSortKey <= endKey;
    }
    return true; // 'all'
  };

  const filteredInvoices = invoices.filter(inv => filterByPeriod(inv.date_str, inv.time_str));
  const filteredExpenses = expenses.filter(exp => filterByPeriod(exp.date_str, exp.time_str));

  // Calculations
  const totalSales = filteredInvoices.reduce((acc, inv) => acc + inv.final_amount, 0);
  const totalCost = filteredInvoices.reduce((acc, inv) => acc + inv.total_cost, 0);
  const totalDiscount = filteredInvoices.reduce((acc, inv) => acc + (inv.discount || 0), 0);
  const totalGrossProfit = filteredInvoices.reduce((acc, inv) => acc + inv.net_profit, 0);

  // Cash and POS sums
  let totalCashReceived = 0;
  let totalPosReceived = 0;
  let totalCreditOutstanding = 0;

  filteredInvoices.forEach(inv => {
    if (inv.is_credit === 1) {
      totalCreditOutstanding += inv.final_amount;
    } else {
      totalCashReceived += inv.cash_amount || 0;
      totalPosReceived += inv.pos_amount || 0;
    }
  });

  const totalExpensesSum = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfitAfterExpenses = totalGrossProfit - totalExpensesSum;

  // Top selling products in this period
  const productSalesMap: { [id: number]: { name: string; qty: number; total: number } } = {};
  filteredInvoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = {
          name: item.product_name,
          qty: 0,
          total: 0
        };
      }
      productSalesMap[item.product_id].qty += item.quantity_packs;
      productSalesMap[item.product_id].total += item.total_price;
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  // Payment Breakdown
  const paymentBreakdown = paymentMethods.map(pm => {
    const pmInvoices = filteredInvoices.filter(inv => inv.payment_method === pm.code && inv.is_credit !== 1);
    const cashSum = pmInvoices.reduce((acc, i) => acc + (i.cash_amount || 0), 0);
    const posSum = pmInvoices.reduce((acc, i) => acc + (i.pos_amount || 0), 0);
    const sum = cashSum + posSum;
    return {
      code: pm.code,
      name: pm.name,
      count: pmInvoices.length,
      sum,
      cashSum,
      posSum,
      items: pmInvoices
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Period Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-3xl shadow-xs shrink-0">
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          {[
            { id: 'today', label: 'امروز' },
            { id: 'week', label: 'هفته جاری' },
            { id: 'month', label: 'ماه جاری' },
            { id: 'year', label: 'سال جاری' },
            { id: 'all', label: 'کل سوابق' },
            { id: 'custom', label: '📅 بازه دلخواه' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as PeriodType)}
              className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                period === p.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
            تعداد فاکتورها: {filteredInvoices.length}
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            چاپ / خروجی PDF
          </button>
        </div>
      </div>

      {/* Custom Range Filter Panel */}
      {period === 'custom' && (
        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-3xl shadow-xs shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium mb-1 text-slate-600 dark:text-slate-300">از تاریخ (شمسی):</label>
              <input
                type="text"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                placeholder={todayStr}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-slate-600 dark:text-slate-300">از ساعت:</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-slate-600 dark:text-slate-300">تا تاریخ (شمسی):</label>
              <input
                type="text"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                placeholder={todayStr}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-slate-600 dark:text-slate-300">تا ساعت:</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 shrink-0">
        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">فروش کل:</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1">
            {formatNumber(totalSales)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">سود ناخالص:</div>
          <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatNumber(totalGrossProfit)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">دریافتی نقد:</div>
          <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatNumber(totalCashReceived)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">دریافتی پوز:</div>
          <div className="text-base font-black text-sky-600 dark:text-sky-400 mt-1">
            {formatNumber(totalPosReceived)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">فروش نسیه/مانده:</div>
          <div className="text-base font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatNumber(totalCreditOutstanding)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">هزینه‌ها:</div>
          <div className="text-base font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatNumber(totalExpensesSum)}
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-black">سود خالص (با کسر هزینه):</div>
          <div className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {formatNumber(netProfitAfterExpenses)}
          </div>
        </div>
      </div>

      {/* 2 Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Top Selling Products */}
        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-5 shadow-xs lg:col-span-6 flex flex-col min-h-0">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
            پرفروش‌ترین کالاها در این بازه
          </h3>
          <div className="space-y-2 overflow-y-auto pr-1 flex-1 mt-3">
            {topSellingProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">فروشی در این بازه ثبت نشده است.</div>
            ) : (
              topSellingProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-black text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {p.qty} بسته
                    </div>
                    <div className="text-[10px] text-slate-400">{formatNumber(p.total)} ریال</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-5 shadow-xs lg:col-span-6 flex flex-col min-h-0">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
            تفکیک تسویه صندوق در این بازه (برای مشاهده ریز فاکتورها کلیک کنید)
          </h3>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1 mt-3">
            {paymentBreakdown.map(pm => (
              <div
                key={pm.code}
                onClick={() => setSelectedPmModal(pm)}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-slate-700/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{pm.name}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                      {pm.count} تراکنش
                    </span>
                  </div>
                  <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-2">
                    {formatNumber(pm.sum)} ریال
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                  <span>نقد: {formatNumber(pm.cashSum)}</span>
                  <span>پوز: {formatNumber(pm.posSum)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedPmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                ریز فاکتورهای شیوه پرداخت: {selectedPmModal.name}
              </h3>
              <button
                onClick={() => setSelectedPmModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
              {selectedPmModal.items.length === 0 ? (
                <div className="py-8 text-center text-slate-400">تراکنشی برای این شیوه ثبت نشده است.</div>
              ) : (
                selectedPmModal.items.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {item.customer_name} ({item.invoice_number})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.date_str} - {item.time_str} | نقدی: {formatNumber(item.cash_amount)} | پوز:{' '}
                        {formatNumber(item.pos_amount)}
                      </div>
                    </div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatNumber(item.final_amount)} ریال
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">
                مجموع: {formatNumber(selectedPmModal.sum)} ریال
              </span>
              <button
                onClick={() => setSelectedPmModal(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
