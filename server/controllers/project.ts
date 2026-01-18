import * as Sentry from "@sentry/node";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";
import fs from "fs";
import ai from "../lib/ai.js";
import axios from "axios";

const loadImage = (filePath: string, mimeType: string) => ({
  inlineData: {
    data: fs.readFileSync(filePath).toString("base64"),
    mimeType,
  },
});

//    CREATE PROJECT

export const createProject = async (req: Request, res: Response) => {
  let projectId: string | null = null;
  let creditsDeducted = false;

  try {
    const { userId } = req.auth();
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name = "New Project",
      aspectRatio,
      userPrompt = "",
      productName,
      productDescription,
      targetLength = 5,
    } = req.body;

    const images = req.files as Express.Multer.File[];

    if (!images || images.length < 2 || !productName) {
      return res.status(400).json({
        message: "Please upload at least 2 images and product name",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < 5) {
      return res.status(400).json({
        message: "Insufficient credits",
      });
    }

    /*  Upload images to Cloudinary  */
    const uploadedImages = await Promise.all(
      images.map((file) =>
        cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        })
      )
    );

    /* ===== Create Project ===== */
    const project = await prisma.project.create({
      data: {
        name,
        userId,
        productName,
        productDescription,
        userPrompt,
        aspectRatio,
        targetLength: Number(targetLength),
        uploadedImages: uploadedImages.map((img) => img.secure_url),
        isGenerating: true,
      },
    });

    projectId = project.id;

    /*  Deduct Credits AFTER project creation */
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    });
    creditsDeducted = true;

    /*  AI Generation */
    const model = "gemini-3-pro-image-preview";

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspectRatio || "9:16",
        imageSize: "1K",
      },
      safetySettings: Object.values(HarmCategory).map((category) => ({
        category,
        threshold: HarmBlockThreshold.OFF,
      })),
    };

    const img1 = loadImage(images[0].path, images[0].mimetype);
    const img2 = loadImage(images[1].path, images[1].mimetype);

    const prompt = {
      text: `Combine the person and product into a realistic photo.
Make the person naturally hold or use the product.
Match lighting, shadows, scale and perspective.
Make the person stand in professional studio lighting.
Output ecommerce-quality photo realistic imagery.
${userPrompt}`,
    };

    const response: any = await ai.models.generateContent({
      model,
      contents: [img1, img2, prompt],
      config: generationConfig,
    });

    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("Invalid AI response");

    const imagePart = parts.find((p: any) => p.inlineData);
    if (!imagePart) throw new Error("Image generation failed");

    const buffer = Buffer.from(imagePart.inlineData.data, "base64");

    const uploadedGenerated = await cloudinary.uploader.upload(
      `data:image/png;base64,${buffer.toString("base64")}`,
      { resource_type: "image" }
    );

    /* Update Project  */
    await prisma.project.update({
      where: { id: project.id },
      data: {
        generatedImage: uploadedGenerated.secure_url,
        isGenerating: false,
      },
    });

    return res.json({ projectId: project.id });
  } catch (error: any) {
    if (projectId) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          isGenerating: false,
          error: error.message,
        },
      });
    }

    if (creditsDeducted) {
      await prisma.user.update({
        where: { id: req.auth()?.userId },
        data: { credits: { increment: 5 } },
      });
    }

    Sentry.captureException(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

//createvideo
export const createVideo = async (req: Request, res: Response) => {
  let creditsDeducted = false;

  try {
    const { userId } = req.auth();
    const { projectId } = req.body;

    if (!userId || !projectId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    /* ===== User & Credits ===== */
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < 10) {
      return res.status(400).json({
        message: "Insufficient credits",
      });
    }

    /* ===== Fetch Project ===== */
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.isGenerating) {
      return res.status(400).json({ message: "Project in progress" });
    }

    if (project.generatedVideo) {
      return res.status(400).json({ message: "Video already generated" });
    }

    if (!project.generatedImage) {
      return res.status(400).json({ message: "Generated image not found" });
    }

    /* ===== Mark project generating ===== */
    await prisma.project.update({
      where: { id: projectId },
      data: { isGenerating: true },
    });

    /* ===== Deduct Credits ===== */
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 10 } },
    });
    creditsDeducted = true;

    /* ===== Prompt ===== */
    const prompt = `make the person showcase the product which is ${
      project.productName
    } ${
      project.productDescription
        ? `and Product Description: ${project.productDescription}`
        : ""
    }`;

    /* ===== Download image ===== */
    const imageResponse = await axios.get(project.generatedImage, {
      responseType: "arraybuffer",
    });

    const imageBase64 = Buffer.from(imageResponse.data).toString("base64");

    /* ===== Generate Video ===== */
    const model = "ve0-3.1-generate-preview";

    let operation: any = await ai.models.generateVideos({
      model,
      prompt,
      image: {
        imageBytes: imageBase64,
        mimeType: "image/png",
      },
      config: {
        aspectRatio: project.aspectRatio || "9:16",
        numberOfVideos: 1,
        resolution: "720",
      },
    });

    while (!operation.done) {
      await new Promise((r) => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({
        operation,
      });
    }

    const video = operation?.response?.generatedVideo?.[0]?.video;
    if (!video) {
      throw new Error(
        operation?.response?.raiMediaFilteredReasons?.[0] ||
          "Video generation failed"
      );
    }

    /* ===== Save Video ===== */
    const fileName = `${userId}-${Date.now()}.mp4`;
    const videoDir = "videos";
    const filePath = path.join(videoDir, fileName);

    fs.mkdirSync(videoDir, { recursive: true });

    await ai.files.download({
      file: video,
      downloadPath: filePath,
    });

    /* ===== Upload to Cloudinary ===== */
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
    });

    /* ===== Update Project ===== */
    await prisma.project.update({
      where: { id: projectId },
      data: {
        generatedVideo: uploadResult.secure_url,
        isGenerating: false,
      },
    });

    fs.unlinkSync(filePath);

    return res.json({
      message: "Video generation completed",
      videoUrl: uploadResult.secure_url,
    });
  } catch (error: any) {
    if (creditsDeducted) {
      await prisma.user.update({
        where: { id: req.auth()?.userId },
        data: { credits: { increment: 10 } },
      });
    }

    await prisma.project.update({
      where: { id: req.body?.projectId },
      data: {
        isGenerating: false,
        error: error.message,
      },
    });

    Sentry.captureException(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

//get all publish project
export const getAllPublishedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { isPublished: true },
    });

    res.json({
      projects,
    });
  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteproject = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;

    if (!userId || !projectId) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return res.json({
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
