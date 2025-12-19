const { io } = require("socket.io-client");

const URL = process.argv[2] || "http://localhost:3000";

const socket = io(URL, { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("market:snapshot", (rows) => {
  console.log("Snapshot rows:", rows.length);
  console.log(rows);
});

socket.on("market:update", (u) => {
  console.log("Update:", u);
});

socket.on("connect_error", (err) => {
  console.error("Connect error:", err.message);
});
