import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("food_delivery.db");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('customer', 'restaurant', 'delivery', 'admin')) DEFAULT 'customer',
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    name TEXT NOT NULL,
    cuisine TEXT,
    rating REAL DEFAULT 0,
    image_url TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT 1,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    restaurant_id INTEGER,
    delivery_partner_id INTEGER,
    total_amount REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')) DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    delivery_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES users(id),
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY(delivery_partner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    menu_item_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
  );
`);

async function seed() {
  console.log("Seeding database...");

  // Create Admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  db.prepare("INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Admin User", "admin@foodie.com", hashedPassword, "admin"
  );

  // Create Restaurant Owner
  const ownerPassword = await bcrypt.hash("owner123", 10);
  const owner = db.prepare("INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Senthil Kumar", "senthil@saravana.com", ownerPassword, "restaurant"
  );
  const ownerId = owner.lastInsertRowid || 2;

  // Create Restaurant
  const restaurant = db.prepare("INSERT OR IGNORE INTO restaurants (owner_id, name, cuisine, rating, image_url, address) VALUES (?, ?, ?, ?, ?, ?)").run(
    ownerId, 
    "Saravana Bhavan", 
    "South Indian, Vegetarian", 
    4.8, 
    "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80",
    "T. Nagar, Chennai"
  );
  const restaurantId = restaurant.lastInsertRowid || 1;

  // Create Menu Items
  const menuItems = [
    ["Masala Dosa", "Crispy rice crepe filled with spiced potato mash", 120, "Breakfast", "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=400&q=80"],
    ["Idli Sambar", "Steamed rice cakes served with lentil soup", 80, "Breakfast", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"],
    ["Chettinad Chicken", "Spicy chicken curry with traditional spices", 320, "Main Course", "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80"],
    ["Filter Coffee", "Traditional South Indian frothy coffee", 40, "Beverages", "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=400&q=80"]
  ];

  const stmt = db.prepare("INSERT OR IGNORE INTO menu_items (restaurant_id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)");
  for (const item of menuItems) {
    stmt.run(restaurantId, ...item);
  }

  console.log("Seeding complete!");
}

seed();
