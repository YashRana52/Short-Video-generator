import * as Sentry from "@sentry/node";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/*
   GET USER CREDITS
 */
export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return res.json({
      credits: user?.credits ?? 0,
    });
  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* 
   GET ALL USER PROJECTS
 */
export const getAllUserProjects = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ projects });
  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* 
   GET PROJECT BY ID
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({ project });
  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

// PUBLISH / UNPUBLISH PROJECT

export const toggleProjectPublic = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.generatedImage && !project.generatedVideo) {
      return res.status(400).json({
        success: false,
        message: "Image or video not generated",
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        isPublished: !project.isPublished,
      },
    });

    return res.json({
      success: true,
      isPublished: updatedProject.isPublished,
    });
  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
