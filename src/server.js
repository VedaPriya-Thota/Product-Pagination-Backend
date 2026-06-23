require("dotenv").config();

const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/products", productRoutes);

// health check route
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// optional debug (ONLY for development)
// remove in production if you want
console.log("DB URL loaded:", process.env.DATABASE_URL ? "YES" : "NO");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});