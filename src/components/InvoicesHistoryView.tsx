import React, { useState } from 'react';
import { Invoice } from '../types';
import { formatNumber } from '../utils/persianDate';
import { FileText, Search, Trash2, Calendar, User, ShoppingBag } from 'lucide-react';

interface InvoicesHistoryViewProps {
  invoices: Invoice[];
  onDeleteInvoice: (id: number) => void;
}

export const InvoicesHistoryView: React.FC<InvoicesHistoryViewProps> = ({
  invoices,
  onDeleteInvoice
}) => {
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    (inv.customer_name && inv.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (inv.notes && inv.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4 flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              تاریخچه فاکتورهای فروش ({invoices.length} فاکتور)
            </h3>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در شماره فاکتور یا نام مشتری..."
              className="pr-9 pl-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {filteredInvoices.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">فاکتوری ثبت نشده است.</div>
          ) : (
            filteredInvoices.map(inv => (
              <div
                key={inv.id}
                className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs space-y-2.5 hover:border-emerald-200 transition"
              >
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {inv.customer_name || 'مشتری ناشناس'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {inv.invoice_number}
                    </span>
                    {inv.is_credit === 1 && (
                      <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        نسیه / مانده
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatNumber(inv.final_amount)} ریال
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف فاکتور "${inv.invoice_number}" اطمینان دارید؟ موجودی کالاها به انبار بازمی‌گردد.`)) {
                          onDeleteInvoice(inv.id);
                        }
                      }}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                      title="حذف فاکتور و بازگشت موجودی"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف
                    </button>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap gap-2">
                  <span className="text-slate-400">اقلام:</span>
                  {inv.items.map((item, i) => (
                    <span
                      key={i}
                      className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                    >
                      {item.product_name} ({item.quantity_packs} {item.unit_type})
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 flex-wrap gap-2">
                  <div className="flex gap-3">
                    <span>نقدی: {formatNumber(inv.cash_amount)}</span>
                    <span>پوز: {formatNumber(inv.pos_amount)}</span>
                    <span>تخفیف: {formatNumber(inv.discount)}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      سود: {formatNumber(inv.net_profit)} ریال
                    </span>
                  </div>
                  <div>
                    تاریخ: {inv.date_str} - {inv.time_str}{' '}
                    {inv.notes && `| توضیح: ${inv.notes}`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
