import express from "express";
import { checkTranslateHealth } from "../services/awsTranslate.service.js";

const router = express.Router();

router.get("/health", async (_req, res) => {
  const result = await checkTranslateHealth();
  res.status(result.success ? 200 : 503).json(result);
});

export default router;
