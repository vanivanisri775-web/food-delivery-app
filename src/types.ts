export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'restaurant' | 'delivery' | 'admin';
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  image_url: string;
  address: string;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export interface Order {
  id: number;
  restaurant_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
