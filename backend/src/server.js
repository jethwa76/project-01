import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

await connectDatabase();

const server = app.listen(env.port, () => {
  console.log(`API running in ${env.nodeEnv} mode on port ${env.port}`);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  server.close(() => process.exit(1));
});
