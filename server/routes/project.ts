import express from "express";

import { protect } from "../middlewares/auth.js";
import {
  createProject,
  createVideo,
  deleteproject,
  getAllPublishedProjects,
} from "../controllers/project.js";
import upload from "../lib/multer.js";

const projectRouter = express.Router();

projectRouter.post("/create", protect, upload.array("image", 2), createProject);
projectRouter.post("/video", protect, createVideo);
projectRouter.get("/published", protect, getAllPublishedProjects);
projectRouter.delete("/:projectId", protect, deleteproject);

export default projectRouter;
