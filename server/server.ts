import "./lib/instrument.mjs";
import express, { Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";

import * as Sentry from "@sentry/node";

import cors from "cors";
import clerkWebhooks from "./controllers/clerk.js";
import userRouter from "./routes/user.js";
import projectRouter from "./routes/project.js";

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Webhook route (raw body)
app.post("/api/clerk", express.raw({ type: "*/*" }), clerkWebhooks);

// Other middlewares
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get("/", (req: Request, res: Response) => res.send("Server is Live!"));
app.get("/debug-sentry", () => {
  throw new Error("My first Sentry error!");
});
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

// Sentry error handler
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
