const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mcpRoutes = require("./routes/mcps");
const chatRoutes = require("./routes/chat");
const toolsRoutes = require("./routes/tools");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/mcps", mcpRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tools", toolsRoutes);

// health
app.get("/api/health", (req, res) => res.json({ ok: true, time: Date.now() }));

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});