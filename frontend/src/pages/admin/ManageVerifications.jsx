import { useState, useEffect } from "react";
import { FiCheck, FiX, FiAlertCircle, FiClock, FiRefreshCw, FiExternalLink, FiSearch, FiMessageSquare, FiFilter, FiUser } from "react-icons/fi";
import api from "../../api/client";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";

const STATUS_BADGES = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    icon: FiClock
  },
  approved: {
    label: "Approved",
    classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    icon: FiCheck
  },
  rejected: {
    label: "Rejected",
    classes: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    icon: FiX
  },
  changes_requested: {
    label: "Changes Requested",
    classes: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    icon: FiRefreshCw
  }
};

export default function ManageVerifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal / Review state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const { pushToast } = useToast();

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 15,
        search,
        status: statusFilter
      });
      const { data: res } = await api.get(`/verification?${queryParams.toString()}`);
      setData(res.data);
      setTotalPages(res.pages);
      setTotalItems(res.total);
    } catch (err) {
      pushToast(err.message || "Failed to load verifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVerifications();
  };

  const handleOpenReview = (doc) => {
    setSelectedDoc(doc);
    setReviewStatus(doc.status === "pending" ? "approved" : doc.status);
    setRemarks(doc.remarks || "");
  };

  const handleCloseReview = () => {
    setSelectedDoc(null);
    setReviewStatus("");
    setRemarks("");
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewStatus) {
      pushToast("Please select a status.", "warning");
      return;
    }
    if ((reviewStatus === "rejected" || reviewStatus === "changes_requested") && !remarks.trim()) {
      pushToast("Remarks are required when rejecting or requesting changes.", "warning");
      return;
    }

    setSaving(true);
    try {
      const { data: res } = await api.patch(`/verification/${selectedDoc._id}/status`, {
        status: reviewStatus,
        remarks: remarks.trim()
      });
      pushToast(`Verification document updated successfully.`, "success");
      
      // Update local state
      setData(data.map(d => d._id === selectedDoc._id ? { ...d, ...res.data, reviewedBy: { name: "You" } } : d));
      handleCloseReview();
    } catch (err) {
      pushToast(err.message || "Failed to update verification status.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Verification Submissions</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Review, approve, or reject identity and credential verification documents submitted by users.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email..."
            className="focus-ring w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          />
          <span className="absolute left-3.5 top-3.5 text-slate-400">
            <FiSearch size={16} />
          </span>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <FiFilter /> Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="focus-ring rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="changes_requested">Changes Requested</option>
          </select>
        </div>
      </div>

      {/* Main content table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20">
            <Loader label="Loading submissions..." />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FiAlertCircle className="mx-auto text-4xl mb-3 text-slate-300" />
            <p className="text-sm font-medium">No verification documents found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Document Type</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.map((doc) => {
                  const Badge = STATUS_BADGES[doc.status] || STATUS_BADGES.pending;
                  const Icon = Badge.icon;
                  return (
                    <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {doc.user?.avatar?.url ? (
                            <img src={doc.user.avatar.url} alt={doc.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <FiUser className="text-slate-400 text-lg" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                            {doc.user?.name || "Deleted User"}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">
                            {doc.user?.email || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {doc.documentType}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${Badge.classes}`}>
                          <Icon size={12} />
                          {Badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex gap-2">
                          <a
                            href={doc.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                          >
                            <FiExternalLink size={12} />
                            View file
                          </a>
                          <button
                            onClick={() => handleOpenReview(doc)}
                            className="focus-ring inline-flex items-center gap-1 rounded-lg bg-primary hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition"
                          >
                            <FiMessageSquare size={12} />
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4">
            <span className="text-xs text-slate-500">
              Showing {data.length} of {totalItems} submissions
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-xs flex items-center px-2 text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal Dialog Overlay */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white p-6 dark:bg-slate-900 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                Review: {selectedDoc.documentType}
              </h3>
              <button onClick={handleCloseReview} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-1.5 text-sm">
              <p className="text-slate-500">
                Submitted by: <strong className="text-slate-800 dark:text-slate-200">{selectedDoc.user?.name}</strong> ({selectedDoc.user?.email})
              </p>
              <p className="text-slate-500">
                Submission date: <strong className="text-slate-800 dark:text-slate-200">{new Date(selectedDoc.createdAt).toLocaleString()}</strong>
              </p>
              <div className="pt-2">
                <a
                  href={selectedDoc.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <FiExternalLink /> Open Document Attachment in New Tab
                </a>
              </div>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Review Status
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="focus-ring w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                  required
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="changes_requested">Request Changes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Review Remarks
                  {(reviewStatus === "rejected" || reviewStatus === "changes_requested") && (
                    <span className="text-rose-500 ml-0.5">*</span>
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide feedback details or reason for rejection/change request..."
                  className="focus-ring w-full min-h-24 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                  required={reviewStatus === "rejected" || reviewStatus === "changes_requested"}
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={handleCloseReview} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
