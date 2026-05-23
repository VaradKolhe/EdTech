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

  const load = useCallback(async () => {
    const { data } = await getCertificates();
    setTemplates(data.templates || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
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

      <form onSubmit={handleUpload} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600"
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          Set as default template
        </label>
        <Button type="submit" className="mt-4" disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload Template"}
        </Button>
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
