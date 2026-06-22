const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

const errorHandler = (error, req, res, next) => {
  console.error("Global Error:", error);

  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

module.exports = {
  notFound,
  errorHandler,
};