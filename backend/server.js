// const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

// import userRoutes from "./routes/user";
const clubRoutes = require("./routes/clubs");
const bookingRoutes = require("./routes/booking");
const accountRoutes = require("./routes/accounts");
const friendsRoutes = require("./routes/friends");

// an express app
const app = express();
// dotenv.config();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/club", clubRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/friends", friendsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
