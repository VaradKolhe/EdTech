import CertificateTemplate from "../../models/CertificateTemplate.js";

const templateTypeFromMime = (mime = "") =>
  mime.includes("pdf") ? "PDF" : "IMAGE";

export const getCertificates = async (_req, res) => {
  try {
    const templates = await CertificateTemplate.find()
      .populate("uploadedByAdminId", "name email")
      .sort({ isDefault: -1, createdAt: -1 });
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch templates" });
  }
};

export const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const isDefault = String(req.body.isDefault) === "true";
    if (isDefault) await CertificateTemplate.updateMany({}, { isDefault: false });

    const templateData = {
      uploadedByAdminId: req.user._id,
      templateName: req.body.templateName || req.file.originalname.split(".")[0] || "New Template",
      templateUrl: `/uploads/certificates/${req.file.filename}`,
      templateType: req.body.templateType || templateTypeFromMime(req.file.mimetype),
      placeholders: [
        "studentName",
        "courseTitle",
        "completionDate",
        "certificateId",
        "instructorName",
      ],
      isDefault,
      isActive: req.body.isActive !== "false",
    };

    const template = await CertificateTemplate.create(templateData);
    res.status(201).json({ message: "Template uploaded", template });
  } catch (error) {
    console.error("CERT_UPLOAD_FAILURE:", error);
    res.status(500).json({ 
      message: "Certificate upload failed", 
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined 
    });
  }
};

export const setDefaultCertificate = async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });
    await CertificateTemplate.updateMany({}, { isDefault: false });
    template.isDefault = true;
    template.isActive = true;
    await template.save();
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message || "Set default failed" });
  }
};

export const updateCertificateStatus = async (req, res) => {
  try {
    const template = await CertificateTemplate.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(req.body.isActive) },
      { returnDocument: "after" }
    );
    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message || "Update failed" });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const template = await CertificateTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json({ message: "Template deleted", template });
  } catch (error) {
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
