import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Save,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Scale,
  Heart,
  ExternalLink,
  UploadCloud,
  Plus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DonationApi from "./services/donationapi";

const DevoteeDonationEntry = ({ user }) => {
  const navigate = useNavigate();

  const getInitialUser = () => {
    try {
      const storedAmt = localStorage.getItem("amt_user");
      const storedUserData = localStorage.getItem("user_data");
      const parsedAmt = storedAmt ? JSON.parse(storedAmt) : {};
      const parsedUser = storedUserData ? JSON.parse(storedUserData) : {};
      return {
        name:
          user?.name ||
          user?.username ||
          user?.apiUserData?.Usr_Name ||
          parsedAmt?.name ||
          parsedAmt?.username ||
          parsedAmt?.Usr_Name ||
          parsedUser?.Usr_Name ||
          "",
        email:
          user?.email ||
          user?.apiUserData?.Usr_Email ||
          parsedAmt?.email ||
          parsedAmt?.Usr_Email ||
          parsedUser?.Usr_Email ||
          "",
        phone:
          user?.phone ||
          user?.mobile ||
          user?.apiUserData?.Usr_Mobile ||
          parsedAmt?.phone ||
          parsedAmt?.mobile ||
          parsedAmt?.Usr_Mobile ||
          parsedUser?.Usr_Mobile ||
          "",
        address:
          user?.address ||
          user?.apiUserData?.Usr_Address ||
          parsedAmt?.address ||
          parsedAmt?.Usr_Address ||
          parsedUser?.Usr_Address ||
          "",
      };
    } catch (e) {
      return {
        name: user?.name || user?.username || "",
        email: user?.email || "",
        phone: user?.phone || user?.mobile || "",
        address: user?.address || "",
      };
    }
  };

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [txn, setTxn] = useState(null);

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [purities, setPurities] = useState([]);
  const [units, setUnits] = useState([]);
  const [docMappingsByCategory, setDocMappingsByCategory] = useState({});

  const [form, setForm] = useState(() => {
    const u = getInitialUser();
    return {
      donation_date: new Date().toISOString().slice(0, 10),
      category_id: "",
      type_id: "",
      purity_id: "",
      weight: "",
      unit_id: "",
      purchase_bill_no: "",
      purchase_bill_date: new Date().toISOString().slice(0, 10),
      purchase_price: "",
      donor_name: u.name,
      donor_phone: u.phone,
      donor_email: u.email,
      donor_address: u.address,
      co_donors: [],
    };
  });

  useEffect(() => {
    const u = getInitialUser();
    setForm((prev) => ({
      ...prev,
      donor_name: prev.donor_name || u.name,
      donor_email: prev.donor_email || u.email,
      donor_phone: prev.donor_phone || u.phone,
      donor_address: prev.donor_address || u.address,
    }));
  }, [user]);

  const addCoDonor = () => {
    setForm((p) => ({
      ...p,
      co_donors: [...(p.co_donors || []), { name: "" }],
    }));
  };

  const updateCoDonor = (index, value) => {
    setForm((p) => {
      const updated = [...(p.co_donors || [])];
      updated[index] = { ...updated[index], name: value };
      return { ...p, co_donors: updated };
    });
  };

  const removeCoDonor = (index) => {
    setForm((p) => {
      const updated = [...(p.co_donors || [])];
      updated.splice(index, 1);
      return { ...p, co_donors: updated };
    });
  };

  // Server par uploaded documents (txn create hone ke baad)
  const [documents, setDocuments] = useState([]);
  // Doc type wise selected files (abhi upload pending)
  const [uploadFiles, setUploadFiles] = useState({});

  const loadMasters = useCallback(async () => {
    try {
      const res = await DonationApi.getPortalMasters();
      const d = res?.data || {};
      setCategories(d.categories || []);
      setTypes(d.types || []);
      setPurities(d.purities || []);
      setUnits(d.units || []);
    } catch (e) {
      toast.error("Failed to load donation masters");
    }
  }, []);

  useEffect(() => {
    loadMasters();
  }, [loadMasters]);

  const loadAllMappings = async () => {
    try {
      const res = await DonationApi.getDocumentMappings({ module: "DONATION" });
      if (!res) return;
      const mappings = res?.data || [];
      const grouped = {};
      mappings.forEach((m) => {
        // Devotee portal se PAN document remove hai
        const docName = (m.document_name || "").toLowerCase();
        if (docName.includes("pan") || Number(m.document_id) === 3) {
          return;
        }
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
    } catch (e) {
      console.error("Failed to load document mappings:", e);
      setDocMappingsByCategory({});
    }
  };

  useEffect(() => {
    loadAllMappings();
  }, []);

  // Txn ban jane ke baad server se documents load
  const refreshDocuments = useCallback(async (txnId) => {
    try {
      const list = await DonationApi.getPortalDocuments(txnId);
      setDocuments(list?.data || []);
    } catch (e) {
      setDocuments([]);
    }
  }, []);

  useEffect(() => {
    if (txn?.transaction_id) refreshDocuments(txn.transaction_id);
  }, [txn?.transaction_id, refreshDocuments]);

  const filteredTypes = categories.length
    ? types.filter(
        (t) => String(t.category_id) === String(form.category_id)
      )
    : types;

  const filteredPurities = categories.length
    ? purities.filter(
        (p) => String(p.category_id) === String(form.category_id)
      )
    : purities;

  const validateForm = () => {
    if (!form.category_id) return "Category is required";
    if (!form.type_id) return "Type is required";
    if (!form.purity_id) return "Purity is required";
    if (!form.weight || Number(form.weight) <= 0) return "Weight is required";
    if (!form.unit_id) return "Weight unit is required";
    // Purchase bill fields are now optional
    if (!form.donor_name.trim()) return "Your name is required";
    if (!form.donor_phone.trim()) return "Your mobile number is required";
    return null;
  };

  // Selected files ko ek ek karke upload karo (doc type wise)
  const uploadPendingFiles = async (txnId, files) => {
    const entries = Object.entries(files);
    const failed = {};
    let uploaded = 0;

    for (const [docId, file] of entries) {
      try {
        const fd = new FormData();
        fd.append("doctype_id", docId);
        fd.append("file", file);

        const r = await DonationApi.uploadPortalDocument(txnId, fd);
        if (r?.success === false) {
          failed[docId] = file;
          toast.error(r.message || `Upload failed (${file.name})`);
        } else {
          uploaded++;
        }
      } catch (e) {
        failed[docId] = file;
        const msg =
          e.response?.data?.message ||
          (e.response?.data?.errors
            ? Object.values(e.response.data.errors).flat().join(", ")
            : null) ||
          `Upload failed (${file.name})`;
        toast.error(msg);
      }
    }

    return { uploaded, failed };
  };

  const handleSave = async () => {
    const vErr = validateForm();
    if (vErr) return setFormError(vErr);

    setSaving(true);
    setFormError("");
    try {
      const validCoDonors = (form.co_donors || [])
        .map((c) => ({ name: (c.name || "").trim() }))
        .filter((c) => c.name.length > 0);

      const res = await DonationApi.createPortalDonation({
        ...form,
        co_donors: validCoDonors,
        creator_type: "devotee",
      });
      if (res?.success === false) {
        setFormError(res.message || "Save failed");
        return;
      }

      const newTxn = res.data;
      setTxn(newTxn);

      // Donation create hote hi selected documents upload karo
      const pendingFiles = { ...uploadFiles };
      if (Object.keys(pendingFiles).length > 0) {
        setUploading(true);
        const { uploaded, failed } = await uploadPendingFiles(
          newTxn.transaction_id,
          pendingFiles
        );
        setUploadFiles(failed);
        setUploading(false);

        if (uploaded > 0) {
          toast.success(
            `${uploaded} document(s) uploaded successfully`
          );
        }
        await refreshDocuments(newTxn.transaction_id);
      }

      toast.success(
        `Donation created - Receipt ${newTxn.receipt_no}. Documents upload ho gaye, approval ka wait karein.`
      );
    } catch (e) {
      const errs = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e.response?.data?.message;
      setFormError(errs || "Save failed");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Txn already bana hua hai - sirf baaki files upload karo
  const handleUploadPending = async () => {
    if (!txn) return;
    const pendingFiles = { ...uploadFiles };
    if (Object.keys(pendingFiles).length === 0) return;

    setUploading(true);
    try {
      const { uploaded, failed } = await uploadPendingFiles(
        txn.transaction_id,
        pendingFiles
      );
      setUploadFiles(failed);
      await refreshDocuments(txn.transaction_id);
      if (uploaded > 0) {
        toast.success(`${uploaded} document(s) uploaded successfully`);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (docId) => {
    setUploadFiles((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500";
  const labelCls = "mb-1 block text-xs font-medium text-gray-700";

  const serverUploadedTypeIds = documents.map((d) => Number(d.doctype_id));
  const pendingCount = Object.keys(uploadFiles).length;

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/devotee-dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donate Gold / Silver</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Make a donation with seva bhav
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
        {/* A. Donation details */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              A. Donation Details
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
                disabled={!!txn}
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
                disabled={!!txn}
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
                disabled={!!txn}
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
                disabled={!!txn}
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
                disabled={!!txn}
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
                disabled={!!txn}
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
              <label className={labelCls}>Purchase Bill No (Optional)</label>
              <input
                value={form.purchase_bill_no}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purchase_bill_no: e.target.value }))
                }
                placeholder="Optional"
                className={inputCls}
                disabled={!!txn}
              />
            </div>
            <div>
              <label className={labelCls}>Purchase Bill Date (Optional)</label>
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
                disabled={!!txn}
              />
            </div>
            <div>
              <label className={labelCls}>Purchase Price (Rs.) (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.purchase_price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purchase_price: e.target.value }))
                }
                placeholder="Optional"
                className={inputCls}
                disabled={!!txn}
              />
            </div>
          </div>
          {txn && (
            <p className="px-5 pb-3 text-[11px] text-amber-600">
              Donation save ho chuki hai ({txn.receipt_no}) - ab documents
              upload karein. Entry details edit nahi ho sakti.
            </p>
          )}
        </div>

        {/* B. Donor details */}
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
                className={inputCls}
                disabled={!!txn}
              />
            </div>
            <div>
              <label className={labelCls}>
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                value={form.donor_phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_phone: e.target.value }))
                }
                className={inputCls}
                placeholder="9876543210"
                disabled={!!txn}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                value={form.donor_email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_email: e.target.value }))
                }
                className={inputCls}
                disabled={!!txn}
              />
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Address</label>
              <textarea
                rows={2}
                value={form.donor_address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, donor_address: e.target.value }))
                }
                className={inputCls}
                disabled={!!txn}
              />
            </div>

            {/* Co-Donors (Multiple) */}
            <div className="sm:col-span-3 border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-amber-600" />
                    Co-Donors (सह-दानदाता)
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

              {(form.co_donors || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-400 italic">
                    No co-donors added. Click "+ Add Co-Donor" to add joint donor names.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.co_donors.map((cd, idx) => (
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
            <div className="space-y-3">
              {form.category_id && docMappingsByCategory[form.category_id] ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900">Documents</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {docMappingsByCategory[form.category_id].length} document
                      {docMappingsByCategory[form.category_id].length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {docMappingsByCategory[form.category_id].map((d) => {
                      const serverDoc = documents.find(
                        (sd) => Number(sd.doctype_id) === Number(d.document_id)
                      );
                      const selected = uploadFiles[d.document_id];
                      return (
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
                              {serverDoc && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Uploaded
                                </span>
                              )}
                            </div>
                            {serverDoc && (
                              <a
                                href={serverDoc.doc_url || serverDoc.doc_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </a>
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
                            {selected && (
                              <span className="ml-2 text-blue-600">
                                | {selected.name} (
                                {(selected.size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </p>
                          {selected && !serverDoc && (
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(d.document_id)}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Upload button (txn bane ke baad remaining files ke liye) */}
                  {txn && pendingCount > 0 && (
                    <button
                      onClick={handleUploadPending}
                      disabled={uploading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4" />
                          Upload {pendingCount} pending document
                          {pendingCount > 1 ? "s" : ""}
                        </>
                      )}
                    </button>
                  )}
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

              {/* Server par uploaded documents list */}
              {documents.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white">
                  <div className="border-b border-gray-100 px-4 py-2.5">
                    <h4 className="text-xs font-semibold text-gray-700">
                      Uploaded Documents ({documents.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {documents.map((d) => (
                      <div
                        key={d.doc_id}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {d.doc_type?.name || `Document #${d.doctype_id}`}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {d.doc_name}
                            {d.doc_size_kb
                              ? ` (${Number(d.doc_size_kb).toFixed(0)} KB)`
                              : ""}
                          </p>
                        </div>
                        <a
                          href={d.doc_url || d.doc_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {txn && documents.length === 0 && !uploading && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Abhi koi document upload nahi hua. Required documents
                    select karke upload karein - approval ke liye zaroori hai.
                  </span>
                </div>
              )}
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
            onClick={() => navigate("/devotee-dashboard")}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          {txn ? (
            pendingCount > 0 ? (
              <button
                onClick={handleUploadPending}
                disabled={uploading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" /> Upload {pendingCount}{" "}
                    Document{pendingCount > 1 ? "s" : ""} &amp; Finish
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => navigate("/devotee-dashboard")}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                <Heart className="h-4 w-4" /> Done - View My Donations
              </button>
            )
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {saving || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Donation
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevoteeDonationEntry;
