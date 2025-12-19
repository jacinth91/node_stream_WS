const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const ALLOWED_ORIGINS = [
  "http://localhost:4200",
  "https://trading-angular-git-main-jacinth91s-projects.vercel.app",
  "https://trading-angular-gccn7ar02-jacinth91s-projects.vercel.app",
  "https://trading-angular.vercel.app"
];

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'https://trading-angular-git-main-jacinth91s-projects.vercel.app/';
app.use(cors({ origin: CLIENT_ORIGIN }));
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },

  pingInterval: 25000,
  pingTimeout: 20000,
  transports: ['websocket'],
});
const market = new Map([
  ["DFM",  { symbol: "DFM",  name: "Dubai Financial Market", price: 12.45, changePercent: 2.89, volume: "2.5M" }],
  ["EMAAR",{ symbol: "EMAAR",name: "Emaar Properties",      price: 45.60, changePercent: -1.72, volume: "1.8M" }],
  ["ADNOC",{ symbol: "ADNOC",name: "ADNOC Distribution",    price: 33.20, changePercent: 3.59, volume: "3.2M" }],
  ["TAQA", { symbol: "TAQA", name: "Abu Dhabi National Energy", price: 8.75, changePercent: 1.39, volume: "5.1M" }],
  ["ADX",  { symbol: "ADX",  name: "Abu Dhabi Securities Exchange", price: 28.90, changePercent: -1.53, volume: "1.2M" }],
]);
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("market:snapshot", Array.from(market.values()));

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
setInterval(() => {
  for (const [symbol, row] of market.entries()) {
    const oldPrice = row.price;

    // +/- small random move
    const delta = (Math.random() - 0.5) * 0.4;
    const newPrice = +(oldPrice + delta).toFixed(2);

    const pct = +(((newPrice - oldPrice) / oldPrice) * 100).toFixed(2);

    const updated = { ...row, price: newPrice, changePercent: pct };
    market.set(symbol, updated);

    // send only the delta update (best practice)
    io.emit("market:update", {
      symbol,
      name: row.name,
      price: newPrice,
      changePercent: pct,
      volume: row.volume
    });
  }
}, 1000);
app.get("/health", (_req, res) => res.json({ ok: true }));
server.listen(PORT, () => {
  console.log(`Stock live service running on port ${PORT}`);
  console.log(`Allowed origin: ${CLIENT_ORIGIN}`);
});
