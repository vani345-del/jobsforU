import express from "express";
import { enhancedSummary } from "../controllers/aiController.js";

const aiRouter = express.Router();
aiRouter.post("/enhanced-summary", enhancedSummary);
export default aiRouter;
