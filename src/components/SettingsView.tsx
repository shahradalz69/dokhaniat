import React, { useState } from 'react';
import { PaymentMethod, ProductUnit, Product, Invoice, Purchase, Expense } from '../types';
import { Settings, CreditCard, Ruler, Plus, Trash2, Download, Upload, FileSpreadsheet, Save, Check } from 'lucide-react';

interface SettingsViewProps {
  paymentMethods: PaymentMethod[];
  productUnits: ProductUnit[];
  onAddPaymentMethod: (name: string) => void;
  onDeletePaymentMethod: (id: number) => void;
  onAddProductUnit: (name: string) => void;
  onDeleteProductUnit: (id: number) => void;
  onExportBackup: () => void;
  onImportBackup: (data: any) => void;
  onExportExcel: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  paymentMethods,
  productUnits,
  onAddPaymentMethod,
  onDeletePaymentMethod,
  onAddProductUnit,
  onDeleteProductUnit,
  onExportBackup,
  onImportBackup,
  onExportExcel
}) => {
  const [newPmName, setNewPmName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleAddPm = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPmName.trim()) {
      onAddPaymentMethod(newPmName.trim());
      setNewPmName('');
    }
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUnitName.trim()) {
      onAddProductUnit(newUnitName.trim());
      setNewUnitName('');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportBackup(json);
        alert('اطلاعات با موفقیت بازیابی شد.');
      } catch (err) {
        alert('خطا در خواندن فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
        {/* Payment Methods */}
        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              مدیریت شیوه‌های پرداخت
            </h3>
            <span className="text-[11px] text-slate-400">POS، نقد، نسیه، پوز صادرات و...</span>
          </div>

          <form onSubmit={handleAddPm} className="flex gap-2 text-xs">
            <input
              type="text"
              value={newPmName}
              onChange={e => setNewPmName(e.target.value)}
              placeholder="نام فارسی شیوه پرداخت جدید (مثلا پوز سامان)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs whitespace-nowrap cursor-pointer shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              افزودن
            </button>
          </form>

          <div className="space-y-2 max-h-56 overflow-y-auto p-1 bg-slate-50/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            {paymentMethods.map(pm => (
              <div
                key={pm.id}
                className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-between shadow-2xs"
              >
                <span className="text-slate-800 dark:text-slate-200">{pm.name}</span>
                <button
                  onClick={() => {
                    if (confirm(`آیا از حذف شیوه پرداخت "${pm.name}" اطمینان دارید؟`)) {
                      onDeletePaymentMethod(pm.id);
                    }
                  }}
                  className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Product Units */}
        <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-600" />
              مدیریت واحدهای اندازه‌گیری کالا
            </h3>
            <span className="text-[11px] text-slate-400">
              واحدهای این بخش در «ورود کالا و خرید» نمایش داده می‌شوند
            </span>
          </div>

          <form onSubmit={handleAddUnit} className="flex items-center gap-2">
            <input
              type="text"
              value={newUnitName}
              onChange={e => setNewUnitName(e.target.value)}
              placeholder="نام واحد جدید (مثلاً رول، ست، باکس ۵۰تایی)..."
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-full focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              افزودن واحد
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1 border border-dashed border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
            {productUnits.map(unit => (
              <div
                key={unit.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs"
              >
                <span>{unit.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`آیا از حذف واحد "${unit.name}" اطمینان دارید؟`)) {
                      onDeleteProductUnit(unit.id);
                    }
                  }}
                  className="text-rose-400 hover:text-rose-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backup and Excel Export */}
      <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-600" />
            پشتیبان‌گیری از داده‌ها و خروجی اکسل
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            داده‌های شما برای دسترسی آفلاین و حفظ ایمن در حافظه مرورگر ذخیره می‌شوند. می‌توانید نسخه پشتیبان JSON دانلود یا فایل اکسل خروجی بگیرید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              onExportBackup();
              setBackupSuccess(true);
              setTimeout(() => setBackupSuccess(false), 3000);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            {backupSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Download className="w-4 h-4" />}
            دانلود فایل پشتیبان (JSON)
          </button>

          <label className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            بازیابی فایل پشتیبان (Import)
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          <button
            onClick={onExportExcel}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            خروجی کامل به اکسل (Excel CSV)
          </button>
        </div>
      </div>
    </div>
  );
};
