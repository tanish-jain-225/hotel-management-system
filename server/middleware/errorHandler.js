export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : "Internal server error";
  console.error(`[${status}] ${err.message}`);
  res.status(status).json({ message });
}
