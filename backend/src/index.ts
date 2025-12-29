import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { apiRoutes } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.handler.js";
import { createLogger } from "./utils/logger.js";

const logger = createLogger("app");
const app = express();

// CORS
app.use(cors({
  origin: config.CORS_ORIGIN === "*"
    ? "*"
    : config.CORS_ORIGIN.split(",").map((o) => o.trim()),
  credentials: true,
}));

// Body parsing
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Routes
app.use("/api/v1", apiRoutes);

app.get("/", (_req, res) => {
  res.json({ name: "Spur Chat API", version: "1.0.0" });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
  logger.info(`Server started on port ${config.PORT} [${config.NODE_ENV}] [${config.LLM_PROVIDER}]`);
});