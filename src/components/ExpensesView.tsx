import React, { useState } from 'react';
import { Expense } from '../types';
import { formatNumber, cleanNumber, getPersianDate, getPersianTime } from '../utils/persianDate';
import { Receipt, Plus, Trash2, Search, DollarSign } from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: number) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');

  const todayStr = getPersianDate();
  const todayExpenses = expenses.filter(e => e.date_str === todayStr);
  const todaySum = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalSum = expenses.reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = expenses.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('عنوان هزینه الزامی است.');
      return;
    }
    if (amount <= 0) {
      alert('مبلغ هزینه باید بزرگ‌تر از صفر باشد.');
      return;
    }

    onAddExpense({
      title: title.trim(),
      amount,
      description: description.trim(),
      date_str: getPersianDate(),
      time_str: getPersianTime()
    });

    setTitle('');
    setAmount(0);
    setAmountInput('');
    setDescription('');
  };

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-5 overflow-y-auto min-h-0">
      {/* Add Expense Form */}
      <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs lg:col-span-5 flex flex-col justify-between overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-500" />
              ثبت هزینه جدید مغازه
            </h3>
            <span className="text-[11px] text-slate-400">کرایه، حقوق، قبض، حمل و ...</span>
          </div>

          <div>
            <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
              عنوان هزینه: *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثلا: اجاره مغازه، قبض برق، چای و پذیرایی..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
              مبلغ هزینه (ریال): *
            </label>
            <input
              type="text"
              required
              value={amountInput}
              onChange={e => {
                const val = cleanNumber(e.target.value);
                setAmount(val);
                setAmountInput(val > 0 ? val.toLocaleString('en-US') : '');
              }}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold text-rose-600 dark:text-rose-400 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">
              توضیحات (اختیاری):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="توضیحات تکمیلی مربوط به هزینه..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            ثبت هزینه
          </button>
        </form>

        {/* Expenses Summary Box */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-3 mt-4">
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-3.5 rounded-2xl text-center">
            <div className="text-[11px] text-rose-800 dark:text-rose-300 font-bold">
              هزینه‌های امروز:
            </div>
            <div className="text-sm font-black text-rose-700 dark:text-rose-400 mt-1">
              {formatNumber(todaySum)} ریال
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl text-center">
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">
              جمع کل هزینه‌ها:
            </div>
            <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
              {formatNumber(totalSum)} ریال
            </div>
          </div>
        </div>
      </div>

      {/* Expenses History List */}
      <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-3 lg:col-span-7 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            تاریخچه هزینه‌ها ({expenses.length} مورد)
          </h3>
          <div className="relative w-60">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در هزینه‌ها..."
              className="pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {filteredExpenses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">هیچ هزینه‌ای ثبت نشده است.</div>
          ) : (
            filteredExpenses.map(exp => (
              <div
                key={exp.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs flex justify-between items-center hover:border-rose-200 transition"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{exp.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {exp.description || 'بدون توضیح'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    تاریخ: {exp.date_str} - {exp.time_str}
                  </div>
                </div>

                <div className="text-left flex flex-col items-end gap-1">
                  <div className="font-black text-rose-600 dark:text-rose-400 text-sm">
                    {formatNumber(exp.amount)} ریال
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`آیا از حذف هزینه "${exp.title}" اطمینان دارید؟`)) {
                        onDeleteExpense(exp.id);
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
