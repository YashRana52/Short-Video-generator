import "./lib/instrument.mjs";
import express, { Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerk.js";
import * as Sentry from "@sentry/node";
import userRouter from "./routes/user.js";
import projectRouter from "./routes/project.js";
import cors from "cors";

const app = express();

const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks,
);

//middlewares

app.use(express.json());

app.use(clerkMiddleware());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
