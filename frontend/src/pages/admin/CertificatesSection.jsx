import { useCallback, useEffect, useState } from "react";
import {
  deleteCertificate,
  getCertificates,
  setDefaultCertificateTemplate,
  updateCertificateTemplateStatus,
  uploadCertificate,
} from "../../api/adminApi";
import Button from "../../components/ui/Button";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "";

export default function CertificatesSection() {
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [file, setFile] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await getCertificates();
      setTemplates(data.templates || []);
    } catch (err) {
      setError("Failed to load templates.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("templateName", templateName || file.name);
      formData.append("isDefault", String(isDefault));
      await uploadCertificate(formData);
      setTemplateName("");
      setFile(null);
      setIsDefault(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Certificate Templates
        </h2>
        <p className="text-slate-500">Upload and manage universal certificate templates.</p>
      </div>

      <form onSubmit={handleUpload} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand-500/20">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-1 file:text-xs file:font-black file:uppercase file:text-brand-700 hover:file:bg-brand-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600" />
          Set as default template
        </label>
        
        {error && <p className="mt-4 text-xs font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-lg inline-block">{error}</p>}

        <div className="mt-4">
          <Button type="submit" disabled={uploading || !file}>
            {uploading ? "Uploading..." : "Upload Template"}
          </Button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div key={template._id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{template.templateName}</p>
                <p className="mt-1 text-xs text-slate-500">{template.templateType}</p>
              </div>
              {template.isDefault && (
                <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-bold text-brand-700">
                  Default
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {template.isActive ? "Active" : "Inactive"}
            </p>
            <a href={`${API_BASE}${template.templateUrl}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-brand-600">
              View template
            </a>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setDefaultCertificateTemplate(template._id).then(load)}>
                Set default
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => updateCertificateTemplateStatus(template._id, !template.isActive).then(load)}
              >
                {template.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button size="sm" variant="danger" onClick={() => deleteCertificate(template._id).then(load)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
