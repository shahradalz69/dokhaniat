import React from 'react';
import { Invoice } from '../types';
import { formatNumber } from '../utils/persianDate';
import { Clock, CheckCircle2, User, Phone, FileText } from 'lucide-react';

interface CreditsViewProps {
  invoices: Invoice[];
  onSettleInvoice: (id: number) => void;
}

export const CreditsView: React.FC<CreditsViewProps> = ({ invoices, onSettleInvoice }) => {
  const creditInvoices = invoices.filter(inv => inv.is_credit === 1);
  const totalCreditSum = creditInvoices.reduce((acc, inv) => acc + inv.final_amount, 0);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              لیست فاکتورهای مانده (تسویه‌نشده / نسیه و حساب دفتری)
            </h3>
          </div>
          <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
            مجموع مانده‌ها: {formatNumber(totalCreditSum)} ریال
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {creditInvoices.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 opacity-60" />
              <span>تمامی فاکتورها تسویه شده‌اند و هیچ حساب مانده‌ای وجود ندارد.</span>
            </div>
          ) : (
            creditInvoices.map(inv => (
              <div
                key={inv.id}
                className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-amber-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">
                      {inv.customer_name || 'مشتری ناشناس'}
                    </span>
                    <span className="text-[10px] text-slate-400">({inv.invoice_number})</span>
                  </div>

                  <div className="text-[11px] text-amber-850 dark:text-amber-300 font-bold">
                    مبلغ مانده فاکتور:{' '}
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                      {formatNumber(inv.final_amount)} ریال
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                    <span>تاریخ: {inv.date_str} - {inv.time_str}</span>
                    {inv.notes && (
                      <span className="bg-amber-100/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {inv.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <button
                    onClick={() => {
                      if (confirm(`آیا فاکتور "${inv.invoice_number}" متعلق به "${inv.customer_name}" به مبلغ ${formatNumber(inv.final_amount)} ریال به طور کامل تسویه شد؟`)) {
                        onSettleInvoice(inv.id);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-98 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تسویه کامل فاکتور
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
