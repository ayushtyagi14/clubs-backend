// const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

// import userRoutes from "./routes/user";
const clubRoutes = require("./routes/clubs");

// an express app
const app = express();
// dotenv.config();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/club", clubRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
