import Metadata from "../models/Metadata.js";

export const getOnboardingOptions = async (req, res) => {
  try {
    const metadata = await Metadata.findOne({ type: "onboarding-options" });
    if (!metadata) {
      // Fallback to initial values if not in DB
      return res.json({
        ageGroup: ["13-17", "18-24", "25-34", "35+"],
        educationLevel: ["School", "Diploma", "Undergraduate", "Postgraduate", "Working Professional"],
        skillLevel: ["Beginner", "Intermediate", "Advanced"],
        careerGoal: ["Get a job", "Switch career", "Improve current skills", "Prepare for exams", "Build projects"],
        budgetPreference: ["Free", "Paid", "Both"],
        preferredDifficulty: ["Beginner", "Intermediate", "Advanced"],
        preferredLanguage: ["en", "hi", "mr"],
        preferredStreams: ["Programming", "Data Science", "Networking", "Cybersecurity", "Cloud", "Design", "Business"],
      });
    }
    res.json(metadata.data);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch metadata" });
  }
};
