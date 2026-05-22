import CertificateTemplate from "../../models/CertificateTemplate.js";

export const getCertificates = async (_req, res) => {
  try {
    const templates = await CertificateTemplate.find()
      .populate("uploadedBy", "fullName email")
      .sort({ createdAt: -1 });
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch templates" });
  }
};

export const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const template = await CertificateTemplate.create({
      name: req.body.name || req.file.originalname,
      filePath: `/uploads/certificates/${req.file.filename}`,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
    });
    res.status(201).json({ message: "Template uploaded", template });
  } catch (error) {
    res.status(500).json({ message: error.message || "Upload failed" });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const template = await CertificateTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted", template });
  } catch (error) {
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
