import express from "express";
import { getOnboardingOptions } from "../controllers/metadataController.js";

const router = express.Router();

router.get("/onboarding-options", getOnboardingOptions);

export default router;
