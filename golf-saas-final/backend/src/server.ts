
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "./db";
import { auth } from "./middleware/auth";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));
app.use(express.json());

// health
app.get("/", (_, res) => res.json({status: "ok"}));

// register
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({error: "Missing fields"});

  const hash = await bcrypt.hash(password, 10);
  try {
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hash);
    res.json({ message: "User created" });
  } catch (e) {
    res.status(400).json({ error: "User exists" });
  }
});

// login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user:any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
  res.json({ token });
});

// add score
app.post("/scores", auth, (req:any, res) => {
  const { score } = req.body || {};
  if (typeof score !== "number") return res.status(400).json({error: "Score must be number"});

  db.prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)").run(req.user.id, score);
  res.json({ message: "Score added" });
});

// get scores + rolling avg
app.get("/scores", auth, (req:any, res) => {
  const rows:any[] = db.prepare("SELECT * FROM scores WHERE user_id = ? ORDER BY id ASC").all(req.user.id);
  const last5 = rows.slice(-5);
  const avg = last5.length ? (last5.reduce((s, r) => s + r.score, 0) / last5.length) : 0;

  res.json({ scores: rows, avg });
});

// draw
app.get("/draw", (req, res) => {
  const users:any[] = db.prepare("SELECT id, email FROM users").all();
  if (users.length === 0) return res.json({ message: "No users" });

  const idx = Math.floor(Math.random() * users.length);
  const winner = users[idx];
  res.json({ winner, prize: users.length * 25 });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
