import express from "express";
import {
  getAllUserProjects,
  getProjectById,
  getUserCredits,
  toggleProjectPublic,
} from "../controllers/user.js";
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.get("/credits", protect, getUserCredits);
userRouter.get("/projects", protect, getAllUserProjects);
userRouter.get("/projects/:projectId", protect, getProjectById);
userRouter.get("/publish/:projectId", protect, toggleProjectPublic);

export default userRouter;
