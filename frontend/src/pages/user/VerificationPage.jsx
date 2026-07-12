import { useState, useEffect } from "react";
import { FiUploadCloud, FiFile, FiCheckCircle, FiAlertCircle, FiClock, FiRefreshCw, FiExternalLink } from "react-icons/fi";
import api from "../../api/client";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";

const DOCUMENT_TYPES = [
  "Student ID",
  "College ID",
  "Government ID",
  "Resume",
  "Certificate"
];

const STATUS_BADGES = {
  pending: {
    label: "Pending Review",
    classes: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    icon: FiClock
  },
  approved: {
    label: "Approved",
    classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    icon: FiCheckCircle
  },
  rejected: {
    label: "Rejected",
    classes: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    icon: FiAlertCircle
  },
  changes_requested: {
    label: "Changes Requested",
    classes: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    icon: FiRefreshCw
  }
};

export default function VerificationPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState(null);
  const { pushToast } = useToast();

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get("/verification/my");
      setDocuments(data.data);
    } catch (err) {
      pushToast(err.message || "Failed to load verification documents.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentType) {
      pushToast("Please select a document type.", "warning");
      return;
    }
    if (!file) {
      pushToast("Please select a file to upload.", "warning");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);

    try {
      const { data } = await api.post("/verification", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      pushToast("Verification document submitted successfully.", "success");
      setDocuments([data.data, ...documents]);
      setDocumentType("");
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      pushToast(err.message || "Failed to submit verification document.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading documents..." />;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Verify Credentials</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Submit official documents to verify your profile credentials. Approved credentials will display verified status, building trust with visitors and potential employers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_350px] items-start">
        {/* Verification History */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b pb-2 dark:border-slate-800">
            Submission History
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <FiFile className="mx-auto text-4xl mb-3 text-slate-300" />
              <p className="text-sm">No verification documents submitted yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map((doc) => {
                const Badge = STATUS_BADGES[doc.status] || STATUS_BADGES.pending;
                const Icon = Badge.icon;
                return (
                  <div key={doc._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {doc.documentType}
                        </span>
                        <a
                          href={doc.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-blue-600 inline-flex items-center text-xs gap-0.5"
                          title="View submitted file"
                        >
                          <FiExternalLink size={12} />
                          View File
                        </a>
                      </div>
                      <p className="text-xs text-slate-500">
                        Submitted: {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                      {doc.remarks && (
                        <div className="mt-2 text-xs p-2.5 rounded bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                          <span className="font-semibold block text-slate-700 dark:text-slate-300">Admin Remarks:</span>
                          {doc.remarks}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${Badge.classes}`}>
                        <Icon size={12} />
                        {Badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Form */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white border-b pb-2 dark:border-slate-800 mb-4">
            Upload Document
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                required
              >
                <option value="">Select type...</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Attach File
              </label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 hover:border-primary transition text-center bg-slate-50 dark:bg-slate-950/50">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="space-y-2">
                  <FiUploadCloud className="mx-auto text-3xl text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {file ? file.name : "Choose file or drag here"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports JPG, PNG, WEBP, PDF, DOC (Max 10MB)
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Uploading..." : "Submit for Verification"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
