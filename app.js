const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const leadRoutes = require("./src/routes/lead.routes");
const { notFound, errorHandler } = require("./src/middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/leads", leadRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});

module.exports = app;