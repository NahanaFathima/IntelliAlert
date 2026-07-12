import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables early
dotenv.config();

// Import Express routers
import announcementRouter from "./server/routes/announcement.ts";
import usersRouter from "./server/routes/users.ts";
import authRouter from "./server/routes/auth.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  console.log("Setting up IntelliAlert Express API routes...");

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API Route mountings
  app.use("/api/announcement", announcementRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/auth", authRouter);

  // Setup Vite Dev Server / Static files
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in DEVELOPMENT mode. Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in PRODUCTION mode. Serving static assets...");
    const distPath = path.join(process.cwd(), "dist");
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      console.warn("Dist folder not found! Please run 'npm run build' first.");
      // Fallback message to prevent infinite loading of SPA assets
      app.get("*", (req, res) => {
        res.status(404).send("Application assets not found. If you are developing, ensure you are running in dev mode.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 IntelliAlert full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical error starting IntelliAlert full-stack server:", error);
});
