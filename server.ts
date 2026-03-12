import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

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

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json());

  const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
      const result = stmt.run(name, email, hashedPassword, role || 'customer');
      res.json({ id: result.lastInsertRowid, message: "User registered successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Restaurant Routes
  app.get("/api/restaurants", (req, res) => {
    const restaurants = db.prepare("SELECT * FROM restaurants WHERE is_active = 1").all();
    res.json(restaurants);
  });

  app.get("/api/restaurants/:id/menu", (req, res) => {
    const menu = db.prepare("SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1").all(req.params.id);
    res.json(menu);
  });

  // Order Routes
  app.post("/api/orders", (req, res) => {
    const { customerId, restaurantId, items, totalAmount, address } = req.body;
    const stmt = db.prepare("INSERT INTO orders (customer_id, restaurant_id, total_amount, delivery_address) VALUES (?, ?, ?, ?)");
    const info = stmt.run(customerId, restaurantId, totalAmount, address);
    const orderId = info.lastInsertRowid;

    const itemStmt = db.prepare("INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)");
    for (const item of items) {
      itemStmt.run(orderId, item.id, item.quantity, item.price);
    }

    io.emit("new_order", { orderId, restaurantId });
    res.json({ orderId, message: "Order placed successfully" });
  });

  app.get("/api/orders/customer/:id", (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, r.name as restaurant_name 
      FROM orders o 
      JOIN restaurants r ON o.restaurant_id = r.id 
      WHERE o.customer_id = ? 
      ORDER BY o.created_at DESC
    `).all(req.params.id);
    res.json(orders);
  });

  // Socket.io for Real-time tracking
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    socket.on("join_order", (orderId) => {
      socket.join(`order_${orderId}`);
    });

    socket.on("update_status", ({ orderId, status }) => {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
      io.to(`order_${orderId}`).emit("status_changed", { orderId, status });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
