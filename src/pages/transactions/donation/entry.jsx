import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Save,
  Search,
  User,
  Phone,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Scale,
  Package,
  Building2,
  Eye,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DonationApi from "../../services/donationapi";

const DonationEntry = ({ user }) => {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [txn, setTxn] = useState(null);

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [purities, setPurities] = useState([]);
  const [units, setUnits] = useState([]);
  const [docMappingsByCategory, setDocMappingsByCategory] = useState({});

  const [form, setForm] = useState({
    donation_date: new Date().toISOString().slice(0, 10),
    category_id: "",
    type_id: "",
    purity_id: "",
    weight: "",
    unit_id: "",
    purchase_bill_no: "",
    purchase_bill_date: new Date().toISOString().slice(0, 10),
    purchase_price: "",
    donor_phone: "",
    donor_name: "",
    donor_email: "",
    donor_address: "",
    creator_type: "admin",
    storage_location_id: "",
  });

  const [documents, setDocuments] = useState([]);
  const [uploadFiles, setUploadFiles] = useState({});
  const [storages, setStorages] = useState([]);

  const loadMasters = useCallback(async () => {
    const results = await Promise.allSettled([
      DonationApi.getCategories(),
      DonationApi.getTypes(),
      DonationApi.getPurity(),
      DonationApi.getWeightUnits(),
      DonationApi.getDonationStorages(),
    ]);

    const pick = (i) => {
      const r = results[i];
      if (r.status !== "fulfilled") return [];
      const d = r.value?.data;
      return Array.isArray(d) ? d : d?.data || [];
    };

    setCategories(pick(0));
    setTypes(pick(1));
    setPurities(pick(2));
    setUnits(pick(3));
    setStorages(pick(4));

    const failed = results
      .map((r, i) => (r.status === "rejected" ? i : -1))
      .filter((i) => i >= 0);
    const names = ["categories", "types", "purity", "units"];

    if (failed.length) {
      const first = results[failed[0]];
      const msg =
        first.reason?.response?.data?.message ||
        first.reason?.message ||
        "Failed to load masters";
      toast.error(`${names[failed[0]]}: ${msg}`);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadAllMappings = async () => {
      try {
        const res = await DonationApi.getDocumentMappings({ module: "DONATION" });
        if (!cancelled) {
          const mappings = res?.data || [];
          const grouped = {};
          mappings.forEach((m) => {
            if (!grouped[m.ref_id]) grouped[m.ref_id] = [];
            grouped[m.ref_id].push({
              document_id: m.document_id,
              name: m.document_name,
              is_required: m.is_required,
              sort_order: m.sort_order || 0,
            });
          });
          Object.keys(grouped).forEach((catId) => {
            grouped[catId].sort((a, b) => a.sort_order - b.sort_order);
          });
          setDocMappingsByCategory(grouped);
        }
      } catch (e) {
        console.error("Failed to load document mappings:", e);
        setDocMappingsByCategory({});
      }
    };

    loadAllMappings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadMasters();
  }, [loadMasters]);

  const filteredTypes = useMemo(
    () =>
      form.category_id
        ? types.filter((t) => String(t.category_id) === String(form.category_id))
        : types,
    [types, form.category_id]
  );

  const filteredPurities = useMemo(
    () =>
      form.category_id
        ? purities.filter(
            (p) => String(p.category_id) === String(form.category_id)
          )
        : purities,
    [purities, form.category_id]
  );

  const selectedStorageDocs = useMemo(() => {
    const s = storages.find(
      (x) => String(x.location_id) === String(form.storage_location_id)
    );
    return s?.documents || [];
  }, [storages, form.storage_location_id]);

  const validateForm = () => {
    if (!form.category_id) return "Category is required";
    if (!form.type_id) return "Type is required";
    if (!form.purity_id) return "Purity is required";
    if (!form.weight || Number(form.weight) <= 0) return "Weight is required";
    if (!form.unit_id) return "Weight unit is required";
    if (!form.purchase_bill_no) return "Purchase bill number is required";
    if (!form.purchase_bill_date) return "Purchase bill date is required";
    if (form.purchase_price === "") return "Purchase price is required";
    if (!form.donor_phone) return "Donor phone is required";
    if (!form.donor_name.trim()) return "Donor name is required";
    if (!form.storage_location_id) return "Storage location is required";
    return null;
  };

  const handleSave = async () => {
    const vErr = validateForm();
    if (vErr) return setFormError(vErr);

    const mandatoryDocs = docMappingsByCategory[form.category_id]?.filter((d) => d.is_required) || [];
    const uploadedTypeIds = documents.map((d) => Number(d.doctype_id));
    const pendingUploadTypeIds = Object.keys(uploadFiles).map(Number);
    const allUploadedTypeIds = [...new Set([...uploadedTypeIds, ...pendingUploadTypeIds])];
    const missingMandatory = mandatoryDocs.filter(
      (d) => !allUploadedTypeIds.includes(Number(d.document_id))
    );

    if (missingMandatory.length > 0) {
      return setFormError(`Mandatory documents not uploaded: ${missingMandatory.map((d) => d.name).join(", ")}`);
    }

    setSaving(true);
    setFormError("");
    try {
      const res = await DonationApi.createTransaction({ ...form, creator_type: "admin" });
      if (res?.success === false) {
        setFormError(res.message || "Save failed");
        return;
      }
      const newTxn = res.data;
      setTxn(newTxn);
      toast.success(`Donation created - Receipt ${newTxn.receipt_no}`);

      if (Object.keys(uploadFiles).length > 0) {
        setUploading(true);
        try {
          for (const [docId, file] of Object.entries(uploadFiles)) {
            const fd = new FormData();
            fd.append("doctype_id", docId);
            fd.append("file", file);

            const uploadRes = await DonationApi.uploadDocument(newTxn.transaction_id, fd);
            if (uploadRes?.success === false) {
              toast.error(uploadRes.message || "Upload failed for " + docId);
              return;
            }
          }
          toast.success(`${Object.keys(uploadFiles).length} document(s) uploaded`);
          setUploadFiles({});
          const docRes = await DonationApi.getDocuments(newTxn.transaction_id);
          setDocuments(docRes?.data || []);
        } catch (e) {
          const errs = e.response?.data?.errors
            ? Object.values(e.response.data.errors).flat().join(", ")
            : e.response?.data?.message;
          toast.error(errs || "Upload failed");
        } finally {
          setUploading(false);
        }
      }

      setTimeout(() => navigate("/transactions/donation/approval"), 1500);
    } catch (e) {
      const errs = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e.response?.data?.message;
      setFormError(errs || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async (doc) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await DonationApi.deleteDocument(doc.doc_id);
      toast.success("Document deleted");
      const docRes = await DonationApi.getDocuments(txn.transaction_id);
      setDocuments(docRes?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const mandatoryTypes = Object.values(docMappingsByCategory[form.category_id] || []).filter((d) => d.is_required);
  const uploadedTypeIds = documents.map((d) => Number(d.doctype_id));
  const pendingUploadTypeIds = Object.keys(uploadFiles).map(Number);
  const allUploadedTypeIds = [...new Set([...uploadedTypeIds, ...pendingUploadTypeIds])];
  const missingMandatory = mandatoryTypes.filter(
    (d) => !allUploadedTypeIds.includes(Number(d.document_id))
  );

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500";
  const labelCls = "mb-1 block text-xs font-medium text-gray-700";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donation Entry</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Gold / Silver / Diamond donation - valuation auto calculate
            </p>
          </div>
        </div>
        {txn && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-emerald-700">
              Receipt No
            </p>
            <p className="font-mono text-base font-bold text-emerald-900">
              {txn.receipt_no}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* SECTION A - BASIC */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              A. Basic Information
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>
                Donation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.donation_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donation_date: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    category_id: e.target.value,
                    type_id: "",
                    purity_id: "",
                  }))
                }
                className={inputCls}
              >
                <option value="">-- select --</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type_id: e.target.value }))
                }
                className={inputCls}
              >
                <option value="">-- select --</option>
                {filteredTypes.map((t) => (
                  <option key={t.type_id} value={t.type_id}>
                    {t.type_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Purity <span className="text-red-500">*</span>
              </label>
              <select
                value={form.purity_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purity_id: e.target.value }))
                }
                className={inputCls}
              >
                <option value="">-- select --</option>
                {filteredPurities.map((p) => (
                  <option key={p.purity_id} value={p.purity_id}>
                    {p.purity_name}
                    {p.purity_value ? ` (${Number(p.purity_value)}%)` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION B - WEIGHT */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              B. Weight Details
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>
                Weight <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={form.weight}
                onChange={(e) =>
                  setForm((p) => ({ ...p, weight: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={form.unit_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, unit_id: e.target.value }))
                }
                className={inputCls}
              >
                <option value="">-- select --</option>
                {units.map((u) => (
                  <option key={u.unit_id} value={u.unit_id}>
                    {u.unit_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Purchase Bill No</label>
              <input
                value={form.purchase_bill_no}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purchase_bill_no: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Purchase Bill Date</label>
              <input
                type="date"
                value={form.purchase_bill_date}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    purchase_bill_date: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Purchase Price (Rs.)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.purchase_price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purchase_price: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* SECTION C - DONOR */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              C. Donor Information
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>
                Donor Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.donor_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_name: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Donor Phone <span className="text-red-500">*</span>
              </label>
              <input
                value={form.donor_phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_phone: e.target.value }))
                }
                className={inputCls}
                placeholder="9876543210"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                Donor record will be created automatically from this number
              </p>
            </div>
            <div>
              <label className={labelCls}>Donor Email</label>
              <input
                value={form.donor_email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_email: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className={labelCls}>Donor Address</label>
              <textarea
                rows={2}
                value={form.donor_address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_address: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* SECTION D - DOCUMENTS */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              D. Documents (Donor PAN Card / Invoice-Bill)
            </h2>
          </div>
          <div className="px-5 py-4">
            {form.category_id && docMappingsByCategory[form.category_id] ? (
              <div className="space-y-3">
                {(() => {
                  const docs = docMappingsByCategory[form.category_id];
                  const cat = categories.find(
                    (c) => String(c.category_id) === String(form.category_id)
                  );
                  const catName = cat ? cat.category_name : "Category";
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">
                          {catName}
                        </h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {docs.length} document{docs.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {docs.map((d) => (
                          <div
                            key={d.document_id}
                            className="bg-white border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">
                                  {d.name}
                                </span>
                                {d.is_required && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                    Required
                                  </span>
                                )}
                              </div>
                              {uploadFiles[d.document_id] && (
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Selected
                                </span>
                              )}
                            </div>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadFiles((prev) => ({
                                    ...prev,
                                    [d.document_id]: file,
                                  }));
                                }
                              }}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-blue-700 file:font-medium"
                              disabled={uploading || saving}
                            />
                            <p className="mt-1 text-[10px] text-gray-500">
                              JPG / PNG / PDF - max 5 MB
                              {uploadFiles[d.document_id] && (
                                <span className="ml-2 text-blue-600">
                                  | {uploadFiles[d.document_id].name} (
                                  {(
                                    uploadFiles[d.document_id].size / 1024
                                  ).toFixed(1)}{" "}
                                  KB)
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <svg
                  className="w-10 h-10 text-gray-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <p className="text-gray-500">
                  Select a category above to see required documents
                </p>
              </div>
            )}

            {missingMandatory.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Documents pending for upload</p>
                  <p className="text-xs">
                    {missingMandatory.map((d) => d.name).join(", ")} - required
                    for saving.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION E - STORAGE */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              E. Storage (Estate Master) <span className="text-red-500">*</span>
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>
                  Storage Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.storage_location_id}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      storage_location_id: e.target.value,
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">-- select --</option>
                  {storages.map((s) => (
                    <option key={s.location_id} value={s.location_id}>
                      {s.location_name} ({s.location_type})
                    </option>
                  ))}
                </select>
                {storages.length === 0 && (
                  <p className="mt-1 text-[10px] text-amber-600">
                    Enable "Use as Donation Storage" in Estate Master
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Storage Documents</label>
                {selectedStorageDocs.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStorageDocs.map((d) => (
                      <span
                        key={d.document_id}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          d.is_required
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.name}
                        {d.is_required ? " *" : ""}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500">
                    Mapped documents will appear when storage is selected
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving || uploading ? (
              <div className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </div>
            ) : (
              <div className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Donation
              </div>
            )}
          </button>
        </div>

        {/* Uploaded Documents list */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Uploaded Documents ({documents.length})
            </h2>
          </div>
          <div className="px-5 py-4">
            {documents.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No documents uploaded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {documents.map((d) => (
                  <div
                    key={d.doc_id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {d.doc_type?.name || `Doc #${d.doctype_id}`}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {d.doc_name}
                      </p>
                    </div>
                    {d.doc_type?.is_required && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        Mandatory
                      </span>
                    )}
                    <a
                      href={d.doc_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteDoc(d)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationEntry;