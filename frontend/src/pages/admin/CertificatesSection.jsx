import { useCallback, useEffect, useState } from "react";
import {
  getCertificates,
  uploadCertificate,
  deleteCertificate,
} from "../../api/adminApi";
import Button from "../../components/ui/Button";

const API_BASE = "";

export default function CertificatesSection() {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await getCertificates();
    setTemplates(data.templates);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name || file.name);
      await uploadCertificate(formData);
      setName("");
      setFile(null);
      load();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    await deleteCertificate(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Certificate Templates
        </h2>
        <p className="text-slate-500">Upload certificate images or PDFs</p>
      </div>

      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-600"
          />
        </div>
        <Button type="submit" className="mt-4" disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload Template"}
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="font-semibold">{t.name}</p>
            <p className="mt-1 text-xs text-slate-500">{t.mimeType}</p>
            <a
              href={`${API_BASE}${t.filePath}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-brand-600 hover:underline"
            >
              View file
            </a>
            <Button
              size="sm"
              variant="danger"
              className="mt-3"
              onClick={() => handleDelete(t._id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
