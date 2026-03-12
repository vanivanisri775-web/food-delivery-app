import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, ShoppingCart, User, MapPin, Star, Clock, 
  ChevronLeft, ChevronRight, Utensils, Bike, LayoutDashboard, LogOut,
  Plus, Minus, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { io } from 'socket.io-client';
import { User as UserType, Restaurant, MenuItem, CartItem, Order } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const socket = io();

// --- Components ---

const Navbar = ({ user, cartCount, onLogout }: { user: UserType | null, cartCount: number, onLogout: () => void }) => (
  <nav className="sticky top-0 z-50 bg-white border-b border-zinc-100 px-4 py-3">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <Link to="/" className="text-2xl font-black tracking-tighter text-rose-600">FOODIE</Link>
      
      <div className="hidden md:flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-sm font-medium text-zinc-600 bg-zinc-50 px-3 py-2 rounded-full">
          <MapPin size={16} className="text-rose-500" />
          <span>Tamil Nadu, India</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/cart" className="relative p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="flex items-center space-x-3 pl-4 border-l border-zinc-200">
              <Link to="/profile" className="flex items-center space-x-2 text-sm font-semibold text-zinc-800">
                <div className="w-8 h-8 bg-rose-100 text-rose-600 flex items-center justify-center rounded-full">
                  {user.name[0]}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-rose-600 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition-all">
            Login
          </Link>
        )}
      </div>
    </div>
  </nav>
);

// --- Pages ---

const HomePage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-12 relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-8 md:p-16">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mb-6 tracking-tighter">
            CRAVING <br /> <span className="text-rose-500">DELICIOUS?</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-md">
            Get your favorite meals from top-rated restaurants in Tamil Nadu delivered in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-3 text-zinc-900 shadow-xl">
              <Search className="text-zinc-400 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Search for Dosa, Idli, Biryani..." 
                className="bg-transparent border-none outline-none w-full font-medium"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 md:opacity-100">
           <img 
            src="https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80" 
            alt="South Indian Food" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          What's on your mind?
        </h2>
        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { name: 'Biryani', img: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=200&q=80' },
            { name: 'Dosa', img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=200&q=80' },
            { name: 'Idli', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80' },
            { name: 'Pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' },
            { name: 'Burgers', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' },
            { name: 'Thali', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80' },
            { name: 'Coffee', img: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=200&q=80' }
          ].map((cat) => (
            <div key={cat.name} className="flex-shrink-0 group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-rose-500 transition-all">
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-center text-sm font-bold text-zinc-700">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Restaurant List */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Top Restaurants in Tamil Nadu</h2>
          <button className="text-rose-600 font-bold text-sm flex items-center hover:underline">
            View all <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-zinc-200 aspect-[16/10] rounded-2xl mb-4"></div>
                <div className="h-6 bg-zinc-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            restaurants.map((res) => (
              <Link key={res.id} to={`/restaurant/${res.id}`} className="group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4">
                  <img 
                    src={res.image_url || `https://picsum.photos/seed/${res.id}/800/500`} 
                    alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center space-x-1 text-xs font-bold text-zinc-900">
                    <Star size={12} className="fill-rose-500 text-rose-500" />
                    <span>{res.rating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">{res.name}</h3>
                <p className="text-zinc-500 text-sm mb-2">{res.cuisine}</p>
                <div className="flex items-center space-x-4 text-xs font-bold text-zinc-400">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>25-30 mins</span>
                  </div>
                  <span>•</span>
                  <span>₹200 for two</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Get Started Section */}
      <section className="bg-rose-50 rounded-[40px] p-8 md:p-16 text-center mb-12 mt-20">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-zinc-900">Ready to Order?</h2>
        <p className="text-zinc-600 mb-8 max-w-md mx-auto font-medium">Enter your email to get started and explore the best food in Tamil Nadu.</p>
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input 
            type="email" 
            id="get-started-email"
            placeholder="Enter your email" 
            className="flex-1 px-6 py-4 rounded-2xl border-none outline-none font-medium shadow-sm"
          />
          <button 
            onClick={() => {
              const email = (document.getElementById('get-started-email') as HTMLInputElement).value;
              navigate(`/login?email=${encodeURIComponent(email)}`);
            }}
            className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-200"
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

const RestaurantPage = ({ onAddToCart }: { onAddToCart: (item: MenuItem) => void }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo if DB is empty
    const resId = window.location.pathname.split('/').pop();
    fetch(`/api/restaurants/${resId}/menu`)
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        setLoading(false);
      });
      
    // Fetch restaurant details (mocking for now)
    setRestaurant({
      id: Number(resId),
      name: "Saravana Bhavan",
      cuisine: "South Indian, Vegetarian",
      rating: 4.8,
      image_url: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80",
      address: "T. Nagar, Chennai"
    });
  }, []);

  if (loading) return <div className="p-20 text-center">Loading Menu...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-2">{restaurant?.name}</h1>
        <p className="text-zinc-500 font-medium mb-4">{restaurant?.cuisine}</p>
        <div className="flex items-center space-x-6">
          <div className="bg-emerald-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm font-bold">
            <Star size={14} className="fill-white" />
            <span>{restaurant?.rating}</span>
          </div>
          <div className="text-zinc-400 text-sm font-bold">
            30-40 mins • ₹500 for two
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-bold mb-6 pb-2 border-b border-zinc-100">Recommended</h2>
          <div className="space-y-8">
            {menu.length > 0 ? menu.map((item) => (
              <div key={item.id} className="flex justify-between items-start group">
                <div className="flex-1 pr-8">
                  <div className="w-4 h-4 border-2 border-emerald-600 flex items-center justify-center rounded-sm mb-2">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-800 mb-1">{item.name}</h3>
                  <p className="text-zinc-900 font-bold mb-2">₹{item.price}</p>
                  <p className="text-zinc-400 text-sm line-clamp-2">{item.description}</p>
                </div>
                <div className="relative w-32 h-32 flex-shrink-0">
                  <img 
                    src={item.image_url || `https://picsum.photos/seed/${item.id}/300/300`} 
                    alt={item.name}
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={() => onAddToCart(item)}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-emerald-600 font-black px-6 py-2 rounded-xl shadow-xl border border-zinc-100 hover:bg-zinc-50 transition-all active:scale-95"
                  >
                    ADD
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-zinc-50 rounded-3xl">
                <Utensils className="mx-auto text-zinc-300 mb-4" size={48} />
                <p className="text-zinc-500 font-medium">No items available in the menu yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const CartPage = ({ cart, onUpdateQuantity, onCheckout, user }: { 
  cart: CartItem[], 
  onUpdateQuantity: (id: number, delta: number) => void,
  onCheckout: () => void,
  user: UserType | null
}) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 40;
  const taxes = subtotal * 0.05;
  const total = subtotal + deliveryFee + taxes;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-zinc-500 mb-8">Good food is always just a few clicks away!</p>
        <Link to="/" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black tracking-tighter mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-4">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="font-bold text-zinc-800">{item.name}</h3>
                  <p className="text-zinc-500 text-sm font-bold">₹{item.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-zinc-50 rounded-xl p-1">
                <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-lg transition-colors">
                  <Minus size={16} />
                </button>
                <span className="font-bold w-6 text-center">{item.quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, 1)} 
                  disabled={item.quantity >= 30}
                  className="p-1 hover:bg-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-50 rounded-3xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold mb-6">Bill Details</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Item Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 font-medium">
              <span>Taxes & Charges</span>
              <span>₹{taxes.toFixed(2)}</span>
            </div>
            <div className="h-px bg-zinc-200 my-4" />
            <div className="flex justify-between text-xl font-black">
              <span>To Pay</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          {user ? (
            <button 
              onClick={onCheckout}
              className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-[0.98]"
            >
              Checkout
            </button>
          ) : (
            <Link 
              to="/login"
              className="block w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-center shadow-xl hover:bg-zinc-800 transition-all active:scale-[0.98]"
            >
              Login to Checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderTrackingPage = () => {
  const [status, setStatus] = useState('confirmed');
  const steps = [
    { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
    { id: 'preparing', label: 'Preparing Food', icon: Utensils },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  useEffect(() => {
    socket.on('status_changed', (data) => {
      setStatus(data.status);
    });
    return () => { socket.off('status_changed'); };
  }, []);

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-zinc-900 text-white rounded-3xl p-8 mb-8 overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-rose-500 font-bold mb-2">Arriving in 25 mins</p>
          <h1 className="text-3xl font-black mb-6">Track Your Order</h1>
          
          <div className="space-y-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.id} className="flex items-center space-x-4 relative">
                  {idx < steps.length - 1 && (
                    <div className={cn(
                      "absolute left-5 top-10 w-0.5 h-8",
                      idx < currentStepIndex ? "bg-rose-500" : "bg-zinc-700"
                    )} />
                  )}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    isCompleted ? "bg-rose-500 border-rose-500" : "border-zinc-700 text-zinc-700"
                  )}>
                    <Icon size={20} className={isCompleted ? "text-white" : ""} />
                  </div>
                  <span className={cn(
                    "font-bold transition-colors duration-500",
                    isCurrent ? "text-white" : isCompleted ? "text-zinc-400" : "text-zinc-700"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
            <Bike className="text-zinc-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Delivery Partner</p>
            <p className="font-bold text-zinc-800">Rahul Sharma</p>
          </div>
        </div>
        <button className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm">
          Call
        </button>
      </div>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (user: UserType) => void }) => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const prefillEmail = searchParams.get('email');
    if (prefillEmail) setEmail(prefillEmail);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      onLogin(data.user);
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-xl">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-zinc-400 hover:text-rose-600 transition-colors font-bold text-sm group"
        >
          <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <h1 className="text-3xl font-black tracking-tighter mb-2">Welcome Back</h1>
        <p className="text-zinc-500 mb-8">Login to your account to continue</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-zinc-700 mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              id="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-rose-500/20 transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-zinc-700 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-rose-500/20 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-zinc-500 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-zinc-300 text-rose-600 focus:ring-rose-500" />
              Remember me
            </label>
            <button type="button" className="text-rose-600 font-bold hover:underline">Forgot password?</button>
          </div>
          <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-[0.98]">
            Login
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">Don't have an account? <Link to="/register" className="text-rose-600 font-bold">Register</Link></p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, verify token with backend
      setUser({ id: 1, name: "John Doe", email: "john@example.com", role: 'customer' });
    }
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.quantity >= 30) {
          alert('Maximum quantity limit of 30 items reached for this item.');
          return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        if (newQty > 30) {
          alert('Maximum quantity limit of 30 items reached.');
          return i;
        }
        const finalQty = Math.max(0, newQty);
        return finalQty === 0 ? null : { ...i, quantity: finalQty };
      }
      return i;
    }).filter(Boolean) as CartItem[]);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: user.id,
        restaurantId: cart[0].restaurant_id,
        items: cart,
        totalAmount: total,
        address: "123, Anna Salai, Chennai"
      })
    });

    if (res.ok) {
      const data = await res.json();
      setCart([]);
      navigate(`/track/${data.orderId}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-rose-100 selection:text-rose-600">
      <Navbar user={user} cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} onLogout={handleLogout} />
      
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage onAddToCart={handleAddToCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} onUpdateQuantity={handleUpdateQuantity} onCheckout={handleCheckout} user={user} />} />
          <Route path="/track/:id" element={<OrderTrackingPage />} />
          <Route path="/login" element={<LoginPage onLogin={setUser} />} />
          <Route path="/profile" element={<div className="p-20 text-center font-bold">User Profile Coming Soon</div>} />
        </Routes>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-6 py-3 flex justify-between items-center z-50">
        <Link to="/" className="flex flex-col items-center text-rose-600">
          <Utensils size={20} />
          <span className="text-[10px] font-bold mt-1">Delivery</span>
        </Link>
        <Link to="/cart" className="flex flex-col items-center text-zinc-400">
          <ShoppingCart size={20} />
          <span className="text-[10px] font-bold mt-1">Cart</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-zinc-400">
          <User size={20} />
          <span className="text-[10px] font-bold mt-1">Account</span>
        </Link>
      </div>
    </div>
  );
}
