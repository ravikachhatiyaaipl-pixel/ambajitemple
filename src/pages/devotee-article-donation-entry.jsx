import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Save,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  Users,
  ExternalLink,
  CheckCircle2,
  Package,
  UploadCloud,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArticleDonationApi from "./services/articleDonationApi";

/**
 * DEVOTEE - ARTICLE & MATERIAL DONATION ENTRY
 * Donor details are auto-filled from the devotee account.
 */
const DevoteeArticleDonationEntry = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [txn, setTxn] = useState(null);

  const [docMaster, setDocMaster] = useState([]);

  const [form, setForm] = useState({
    article_name: "",
    article_description: "",
    purchase_date: new Date().toISOString().slice(0, 10),
    article_size: "",
    article_weight: "",
    article_quantity: "",
    donor_name: user?.apiUserData?.Usr_Name || user?.name || "",
    donor_email: user?.apiUserData?.Usr_Email || user?.email || "",
    donor_phone: user?.apiUserData?.Usr_Mobile || "",
    remarks: "",
    creator_type: "devotee",
  });
  const [coDonors, setCoDonors] = useState([]);
  const [docFiles, setDocFiles] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500";
  const labelCls = "mb-1 block text-xs font-medium text-gray-700";

  const loadUploadedDocs = useCallback(async (id) => {
    try {
      const res = await ArticleDonationApi.getDocuments(id);
      setUploadedDocs(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setUploadedDocs([]);
    }
  }, []);

  useEffect(() => {
    ArticleDonationApi.getDocumentMaster({ module: "ARTICLE" })
      .then((r) => {
        const data = r?.data?.data || r?.data || r || [];
        setDocMaster(Array.isArray(data) ? data : []);
      })
      .catch(() => setDocMaster([]));
  }, []);

  useEffect(() => {
    if (txn) loadUploadedDocs(txn.article_id);
  }, [txn, loadUploadedDocs]);

  const addCoDonor = () => setCoDonors((p) => [...p, { name: "" }]);
  const updateCoDonor = (index, value) => {
    setCoDonors((p) => {
      const updated = [...p];
      updated[index] = { name: value };
      return updated;
    });
  };
  const removeCoDonor = (index) =>
    setCoDonors((p) => p.filter((_, i) => i !== index));

  const missingMandatory = useMemo(() => {
    const uploadedTypeIds = uploadedDocs.map((d) => Number(d.doctype_id));
    const pendingTypeIds = Object.keys(docFiles).map(Number);
    const allUploaded = [...new Set([...uploadedTypeIds, ...pendingTypeIds])];
    return docMaster.filter(
      (d) => d.is_required && !allUploaded.includes(Number(d.document_id))
    );
  }, [docMaster, uploadedDocs, docFiles]);

  const validateForm = () => {
    if (!form.article_name.trim()) return "Article Name is required";
    if (!form.donor_name.trim()) return "Donor Name is required";
    if (!form.donor_phone.trim()) return "Donor Phone is required";
    return null;
  };

  const handleSave = async () => {
    const vErr = validateForm();
    if (vErr) return setFormError(vErr);

    if (missingMandatory.length > 0) {
      return setFormError(
        `Mandatory documents not uploaded: ${missingMandatory.map((d) => d.name).join(", ")}`
      );
    }

    setSaving(true);
    setFormError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, v);
      });
      coDonors.forEach((c, i) => {
        if (c.name && c.name.trim())
          fd.append(`co_donors[${i}][name]`, c.name.trim());
      });

      const res = await ArticleDonationApi.createTransaction(fd);
      if (!res.success) {
        setFormError(res.message || "Save failed");
        return;
      }

      const newTxn = res.data;
      setTxn(newTxn);
      toast.success("Article donation created. Waiting for approval.");

      const files = Object.entries(docFiles);
      if (files.length > 0) {
        setUploading(true);
        try {
          let failCount = 0;
          for (const [docId, file] of files) {
            const dfd = new FormData();
            dfd.append("doctype_id", docId);
            dfd.append("file", file);
            try {
              await ArticleDonationApi.uploadDocument(newTxn.article_id, dfd);
            } catch {
              failCount++;
            }
          }
          if (failCount > 0) {
            toast.error(`${failCount} document(s) failed to upload`);
          } else {
            toast.success(`${files.length} document(s) uploaded`);
          }
          setDocFiles({});
        } finally {
          setUploading(false);
        }
      }

      setTimeout(() => navigate("/devotee-article-donations"), 1500);
    } catch (e) {
      const errs = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e.response?.data?.message;
      setFormError(errs || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/devotee-dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Donate Article / Material
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Make an article donation
            </p>
          </div>
        </div>
        {txn && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-700">
              Article ID
            </p>
            <p className="font-mono text-base font-bold text-emerald-900">
              #{txn.article_id}
            </p>
          </div>
        )}
      </div>

      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="space-y-5">
        {/* A. Article details */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              A. Article Details
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>
                Article Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.article_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, article_name: e.target.value }))
                }
                disabled={!!txn}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Size</label>
              <input
                value={form.article_size}
                onChange={(e) =>
                  setForm((p) => ({ ...p, article_size: e.target.value }))
                }
                disabled={!!txn}
                placeholder="e.g. 12 x 18 inch"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Purchase / Donation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.purchase_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purchase_date: e.target.value }))
                }
                disabled={!!txn}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={form.article_weight}
                onChange={(e) =>
                  setForm((p) => ({ ...p, article_weight: e.target.value }))
                }
                disabled={!!txn}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Quantity</label>
              <input
                type="number"
                min="0"
                value={form.article_quantity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, article_quantity: e.target.value }))
                }
                disabled={!!txn}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea
                rows={2}
                value={form.article_description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, article_description: e.target.value }))
                }
                disabled={!!txn}
                className={inputCls}
              />
            </div>
          </div>
          {txn && (
            <p className="px-5 pb-3 text-[11px] text-amber-600">
              Article donation #{txn.article_id} has been saved. Documents can be uploaded, but entry details cannot be edited.
            </p>
          )}
        </div>

        {/* B. Your details */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              B. Your Details
            </h2>
            <span className="text-xs text-gray-500 font-normal">
              Logged-in devotee details auto-filled
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.donor_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_name: e.target.value }))
                }
                disabled={!!txn}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                value={form.donor_phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_phone: e.target.value }))
                }
                disabled={!!txn}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                value={form.donor_email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_email: e.target.value }))
                }
                disabled={!!txn}
                className={inputCls}
              />
            </div>

            {/* Co-Donors */}
            <div className="sm:col-span-3 border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-amber-600" />
                    Co-Donors
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add family members or joint co-donor names
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCoDonor}
                  disabled={!!txn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Co-Donor
                </button>
              </div>

              {coDonors.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-400 italic">
                    No co-donors added. Click "+ Add Co-Donor" to add joint donor names.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {coDonors.map((cd, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200"
                    >
                      <span className="text-xs font-semibold text-gray-500 w-6 text-center">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Enter co-donor full name"
                        value={cd.name}
                        onChange={(e) => updateCoDonor(idx, e.target.value)}
                        className={`${inputCls} flex-1 bg-white`}
                        disabled={!!txn}
                      />
                      <button
                        type="button"
                        onClick={() => removeCoDonor(idx)}
                        disabled={!!txn}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                        title="Remove co-donor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* C. Documents */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              C. Documents
            </h2>
          </div>
          <div className="px-5 py-4">
            {docMaster.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docMaster.map((d) => {
                  const selected = docFiles[d.document_id];
                  const alreadyUploaded = uploadedDocs.find(
                    (ud) => Number(ud.doctype_id) === Number(d.document_id)
                  );
                  
                  return (
                    <div
                      key={d.document_id}
                      className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Card Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                          <FileText className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {d.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {Boolean(d.is_required) && (
                              <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 font-medium">
                                Required
                              </span>
                            )}
                            {alreadyUploaded && (
                              <span className="text-[10px] text-green-600 flex items-center gap-0.5 font-medium">
                                <CheckCircle2 className="h-3 w-3" /> Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Body / Upload Area */}
                      <div className="mt-auto">
                        {alreadyUploaded ? (
                          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-green-800 truncate pr-2">
                              Document uploaded
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={`${import.meta.env.VITE_API_URL}/article-donation/documents/${alreadyUploaded.doc_id}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                title="View Document"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setDocFiles((prev) => ({
                                    ...prev,
                                    [d.document_id]: file,
                                  }));
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={uploading || saving || !!txn}
                              title=""
                            />
                            <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                              selected 
                                ? "border-blue-300 bg-blue-50" 
                                : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}>
                              <span className={`truncate pr-2 ${selected ? "text-blue-700 font-medium" : "text-gray-500"}`}>
                                {selected ? selected.name : "Upload file"}
                              </span>
                              {selected ? (
                                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                              ) : (
                                <UploadCloud className="h-4 w-4 text-gray-400 shrink-0" />
                              )}
                            </div>
                          </div>
                        )}
                        <p className="mt-1.5 text-[10px] text-gray-400">
                          JPG / PNG / PDF - max 5 MB
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  No documents are configured. You can upload documents later.
                </p>
              </div>
            )}

            {missingMandatory.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Documents pending for upload</p>
                  <p className="text-xs">
                    {missingMandatory.map((d) => d.name).join(", ")} - required
                    before approval.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* D. Remarks */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              D. Remarks
            </h2>
          </div>
          <div className="px-5 py-4">
            <textarea
              rows={2}
              value={form.remarks}
              onChange={(e) =>
                setForm((p) => ({ ...p, remarks: e.target.value }))
              }
              disabled={!!txn}
              className={inputCls}
            />
            <p className="mt-2 text-[11px] text-gray-500">
              The temple office will select the storage location from the Estate Master during final approval.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/devotee-dashboard")}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading || !!txn}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving || uploading ? (
              <div className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </div>
            ) : (
              <div className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Article Donation
              </div>
            )}
          </button>
        </div>

        {/* Uploaded Documents list */}
        {txn && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Uploaded Documents ({uploadedDocs.length})
              </h2>
            </div>
            <div className="px-5 py-4">
              {uploadedDocs.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No documents uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {uploadedDocs.map((d) => (
                    <div
                      key={d.doc_id}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {d.doc_name || `Doc #${d.doctype_id}`}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {d.doc_size_kb
                            ? `${Number(d.doc_size_kb).toFixed(0)} KB`
                            : ""}
                        </p>
                      </div>
                      <a
                        href={`${import.meta.env.VITE_API_URL}/article-donation/documents/${d.doc_id}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevoteeArticleDonationEntry;
