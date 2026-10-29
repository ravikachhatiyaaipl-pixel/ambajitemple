import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import GenVoucherMasterApi from "../../../../services/genvouchermasterapi";

const BASE_PATH = "/settings/edp-management/configuration/generate-voucher-master";

const SEP_OPTIONS = [
  { value: "/", label: "/ (Forward Slash)" },
  { value: "-", label: "- (Hyphen)" },
];

const EMPTY_FORM = {
  prifix:     "",
  prifix_dev_type: "/",
  Dept:       "N",
  dept_dev_type:   "/",
  Text:       "",
  text_dev_type:   "/",
  No:         "Dept_Series",
  no_dev_type:     "/",
  FY:         "N",
  Is_Active:  "Y",
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{" "}
      {required
        ? <span className="text-red-500">*</span>
        : <span className="text-gray-400 text-xs">(optional)</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-xs text-red-600 flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" />{error}
      </p>
    )}
  </div>
);

const Toggle = ({ name, label, desc, checked, onChange, colorClass = "peer-checked:bg-blue-600" }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg h-full">
    <div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer ml-4">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${colorClass}`}></div>
    </label>
  </div>
);

/** Inline separator selector shown next to each field */
const SepSelect = ({ name, value, onChange }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    title="Separator after this segment"
    className="ml-2 px-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white text-gray-700 w-20 flex-shrink-0"
  >
    <option value="/">/</option>
    <option value="-">-</option>
  </select>
);

/** Build live preview using per-field separators */
const buildPreview = ({ prifix, prifix_dev_type, Dept, dept_dev_type, Text, text_dev_type, No, no_dev_type, FY }) => {
  const deptCode = "ACC";
  const fyCode   = "2025-26";
  const serial   = "1";

  const parts = [];

  if (prifix?.trim()) {
    parts.push({ value: prifix.trim(), sep: prifix_dev_type || "/" });
  }
  if (Dept == "Y") {
    parts.push({ value: deptCode, sep: dept_dev_type || "/" });
  }
  if (Text?.trim()) {
    parts.push({ value: Text.trim(), sep: text_dev_type || "/" });
  }
  parts.push({ value: serial, sep: no_dev_type || "/" });
  if (FY == "Y") {
    parts.push({ value: fyCode, sep: null }); // last — no trailing sep
  }

  // Build string: each part followed by its sep (except the last)
  return parts.map((p, i) => (i < parts.length - 1 ? p.value + p.sep : p.value)).join("");
};

const AddEditGenVoucherMaster = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [pageTitle, setPageTitle] = useState("Generate Voucher Master");
  const [formData, setFormData] = useState(EMPTY_FORM);

  const prifixRef = useRef(null);
  const textRef   = useRef(null);
  const noRef     = useRef(null);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const found = menuDetails.find((item) => item.Menu_Links == BASE_PATH);
      if (found?.Fnc_Title) setPageTitle(found.Fnc_Title);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (isEditMode) loadData();
    else setTimeout(() => prifixRef.current?.focus(), 100);
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await GenVoucherMasterApi.getById(id);
      const d = res?.data;
      setFormData({
        prifix:     d.prifix     || "",
        prifix_dev_type: d.prifix_dev_type || "/",
        Dept:       d.Dept       || "N",
        dept_dev_type:   d.dept_dev_type   || "/",
        Text:       d.Text       || "",
        text_dev_type:   d.text_dev_type   || "/",
        No:         d.No         || "Dept_Series",
        no_dev_type:     d.no_dev_type     || "/",
        FY:         d.FY         || "N",
        Is_Active:  d.Is_Active  || "Y",
      });
    } catch (error) {
      toast.error("Failed to load data");
      navigate(BASE_PATH);
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked ? "Y" : "N" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.No) newErrors.No = "No Series is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode ? "Are you sure you want to update this record?" : "Are you sure you want to create this record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const payload = {
        prifix:     formData.prifix.trim(),
        prifix_dev_type: formData.prifix_dev_type,
        Dept:       formData.Dept,
        dept_dev_type:   formData.dept_dev_type,
        Text:       formData.Text.trim(),
        text_dev_type:   formData.text_dev_type,
        No:         formData.No,
        no_dev_type:     formData.no_dev_type,
        FY:         formData.FY,
        Is_Active:  formData.Is_Active,
      };

      if (isEditMode) {
        await GenVoucherMasterApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await GenVoucherMasterApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(() => navigate(BASE_PATH), 1000);
    } catch (error) {
      if (error.response?.data?.message && typeof error.response.data.message == "object") {
        const be = error.response.data.message;
        const newErrors = {};
        Object.keys(be).forEach((k) => { newErrors[k] = be[k][0]; });
        setErrors(newErrors);
        toast.error(Object.values(be)[0][0]);
      } else {
        toast.error(error.response?.data?.message || "Failed to save");
      }
    } finally { setSaving(false); }
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") { e.preventDefault(); nextRef?.current?.focus(); }
  };

  const ic = (name) =>
    `w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
      errors[name] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const preview = buildPreview(formData);

  // Build coloured segments for the visual preview
  const buildSegments = () => {
    const segs = [];
    if (formData.prifix?.trim())
      segs.push({ label: "Prefix", value: formData.prifix.trim(), sep: formData.prifix_dev_type || "/", color: "bg-blue-100 text-blue-800 border-blue-200" });
    if (formData.Dept == "Y")
      segs.push({ label: "Dept", value: "ACC", sep: formData.dept_dev_type || "/", color: "bg-orange-100 text-orange-800 border-orange-200" });
    if (formData.Text?.trim())
      segs.push({ label: "Text", value: formData.Text.trim(), sep: formData.text_dev_type || "/", color: "bg-purple-100 text-purple-800 border-purple-200" });
    segs.push({ label: "Serial", value: "1", sep: formData.no_dev_type || "/", color: "bg-gray-100 text-gray-800 border-gray-200" });
    if (formData.FY == "Y")
      segs.push({ label: "FY", value: "2025-26", sep: null, color: "bg-green-100 text-green-800 border-green-200" });
    return segs;
  };

  if (loading) return (
    <div className="p-12 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );

  return (
    <div className="p-6">
      {/* Page Header — buttons top right */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(BASE_PATH)} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit ${pageTitle}` : `Add ${pageTitle}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? "Update the record details" : "Fill in the details to create a new record"}
            </p>
          </div>
        </div>
        {/* Action Buttons — top right */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(BASE_PATH)}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="gvn-form"
            disabled={saving}
            className="px-7 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center disabled:opacity-50 transition-all shadow-sm font-medium"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? `Update` : `Save`}
              </>
            )}
          </button>
        </div>
      </div>

      <form id="gvn-form" onSubmit={handleSubmit}>
        {/* Two-column layout: Config left, Preview right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT — Voucher Configuration */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-base font-semibold text-gray-900">Voucher Configuration</h2>
              <p className="text-xs text-gray-500 mt-0.5">Each field has its own separator that follows it</p>
            </div>
            <div className="p-6 space-y-4 flex-1">

              {/* 1. Prefix + separator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefix <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="flex items-center">
                  <input
                    ref={prifixRef}
                    type="text"
                    name="prifix"
                    value={formData.prifix}
                    onChange={handleChange}
                    onKeyDown={(e) => handleEnterKey(e, textRef)}
                    placeholder="e.g. AMT"
                    className={ic("prifix") + " flex-1 min-w-0"}
                  />
                  <SepSelect name="prifix_dev_type" value={formData.prifix_dev_type} onChange={handleChange} />
                </div>
                {errors.prifix && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.prifix}</p>}
              </div>

              {/* 2. Include Department + separator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Include Department (Dept)</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <Toggle
                      name="Dept"
                      label="Include Department"
                      desc="Append department code"
                      checked={formData.Dept == "Y"}
                      onChange={handleToggle}
                    />
                  </div>
                  <SepSelect name="dept_dev_type" value={formData.dept_dev_type} onChange={handleChange} />
                </div>
              </div>

              {/* 3. Text + separator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="flex items-center">
                  <input
                    ref={textRef}
                    type="text"
                    name="Text"
                    value={formData.Text}
                    onChange={handleChange}
                    onKeyDown={(e) => handleEnterKey(e, noRef)}
                    placeholder="e.g. INV"
                    maxLength={50}
                    className={ic("Text") + " flex-1 min-w-0"}
                  />
                  <SepSelect name="text_dev_type" value={formData.text_dev_type} onChange={handleChange} />
                </div>
                {errors.Text && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.Text}</p>}
              </div>

              {/* 4. No Series + separator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No Series <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <select
                    ref={noRef}
                    name="No"
                    value={formData.No}
                    onChange={handleChange}
                    className={ic("No") + " flex-1 min-w-0"}
                  >
                    <option value="">Select Series</option>
                    <option value="Dept_Series">Department Series</option>
                    <option value="GMC_Series">AMT Series</option>
                  </select>
                  <SepSelect name="no_dev_type" value={formData.no_dev_type} onChange={handleChange} />
                </div>
                {errors.No && <p className="mt-1 text-xs text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.No}</p>}
              </div>

              {/* 5. FY toggle — last, no separator */}
              <Toggle
                name="FY"
                label="Include Financial Year (FY)"
                desc="Append financial year code in the voucher number"
                checked={formData.FY == "Y"}
                onChange={handleToggle}
              />

              {/* 6. Active Status */}
              <Toggle
                name="Is_Active"
                label="Active Status"
                desc="Enable or disable this voucher configuration"
                checked={formData.Is_Active == "Y"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, Is_Active: e.target.checked ? "Y" : "N" }))
                }
                colorClass="peer-checked:bg-green-600"
              />

            </div>
          </div>

          {/* RIGHT — Sample Preview */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-teal-50 flex items-center gap-2">
              <Eye className="h-4 w-4 text-teal-600" />
              <h2 className="text-base font-semibold text-gray-900">Sample Preview</h2>
            </div>
            <div className="p-6 flex-1">
              <p className="text-xs text-gray-500 mb-4">
                Based on your current configuration, the voucher number will look like:
              </p>

              {/* Coloured segment pills */}
              <div className="flex flex-wrap items-end gap-1">
                {buildSegments().map((seg, idx) => (
                  <div key={idx} className="flex items-end gap-1">
                    <div className="flex flex-col items-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono font-semibold border ${seg.color}`}>
                        {seg.value}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">{seg.label}</span>
                    </div>
                    {seg.sep && idx < buildSegments().length - 1 && (
                      <div className="flex flex-col items-center mb-5">
                        <span className="text-gray-500 font-mono font-bold text-lg leading-none">{seg.sep}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Full combined preview */}
              <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <span className="text-xs text-gray-500 mr-2">Full number:</span>
                <span className="font-mono font-bold text-gray-800 text-sm">{preview}</span>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                {formData.Dept == "Y" && <span><span className="font-semibold text-orange-700">ACC</span> = sample dept code</span>}
                {formData.FY == "Y" && <span><span className="font-semibold text-green-700">2025-26</span> = sample FY</span>}
                <span><span className="font-semibold text-gray-700">1</span> = auto serial ({formData.No == "Dept_Series" ? "Dept Series" : "AMT Series"})</span>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AddEditGenVoucherMaster;
