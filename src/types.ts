export interface Product {
  id: number;
  name: string;
  brand?: string;
  category: string;
  stock_packs: number;
  buy_price: number;
  sell_price_pack: number;
  sell_price_box?: number;
  sell_price_carton?: number;
  packs_per_box: number;
  boxes_per_carton?: number;
  unit_type: string;
  barcode?: string;
  min_stock_alert: number;
}

export interface Category {
  id: number;
  name: string;
  sort_order: number;
}

export interface ProductUnit {
  id: number;
  name: string;
  sort_order: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  sort_order: number;
}

export interface CartItem {
  product_id: number;
  product_name: string;
  unit_type: string;
  quantity_packs: number;
  unit_price: number;
  buy_price: number;
  total_price: number;
  total_cost: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  date_str: string;
  time_str: string;
  payment_method: string;
  cash_amount: number;
  pos_amount: number;
  total_amount: number;
  discount: number;
  final_amount: number;
  total_cost: number;
  net_profit: number;
  is_credit: number;
  notes?: string;
  items: CartItem[];
}

export interface Purchase {
  id: number;
  product_id: number;
  product_name: string;
  unit: string;
  quantity: number;
  quantity_packs: number;
  buy_price_per_pack: number;
  total_cost: number;
  supplier?: string;
  invoice_number?: string;
  date_str: string;
  time_str?: string;
  notes?: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  description?: string;
  date_str: string;
  time_str: string;
}

export interface UserSettings {
  showProfit: boolean;
  cardSizeIdx: number;
  fontSize: number;
  darkMode: boolean;
}
