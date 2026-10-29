import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import KotakConfigurationApi from "../../../../services/kotakconfigurationapi";

const BASE_PATH = "/settings/edp-management/configuration/kotak-configurations";

const EMPTY_FORM = {
  Config_Name: "",
  Mode: "UAT",
  Api_Url: "https://apigw.kotakuat.bank.in:8443",
  Client_Id: "",
  Client_Secret: "",
  Client_Code: "",
  Msg_Source: "",
  Product_Code: "BBPACKAGE",
  Debit_Account: "",
  Payment_Path: "/v1/cms/pay",
  Status_Path: "/v1/cms/rev",
  Timeout: "60",
  Verify_Tls: "true",
  Is_Active: false,
  Remarks: "",
};

const Field = ({ label, required, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{" "}
      {required ? (
        <span className="text-red-500">*</span>
      ) : (
        <span className="text-gray-400 text-xs">(optional)</span>
      )}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    {error && (
      <p className="mt-1 text-xs text-red-600 flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" />
        {error}
      </p>
    )}
  </div>
);

const AddEditKotakConfiguration = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id && id !== "create");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Kotak Configurations");
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const found = menuDetails.find((item) => item.Menu_Links == BASE_PATH);
      if (found?.Fnc_Title) setPageTitle(found.Fnc_Title);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await KotakConfigurationApi.getById(id);
      const d = res?.data || {};
      setFormData({
        Config_Name: d.Config_Name || "",
        Mode: d.Mode || "UAT",
        Api_Url: d.Api_Url || "",
        Client_Id: d.Client_Id || "",
        Client_Secret: d.Client_Secret || "",
        Client_Code: d.Client_Code || "",
        Msg_Source: d.Msg_Source || "",
        Product_Code: d.Product_Code || "",
        Debit_Account: d.Debit_Account || "",
        Payment_Path: d.Payment_Path || "/v1/cms/pay",
        Status_Path: d.Status_Path || "/v1/cms/rev",
        Timeout: d.Timeout || "60",
        Verify_Tls: d.Verify_Tls || "true",
        Is_Active: Boolean(d.Is_Active),
        Remarks: d.Remarks || "",
      });
    } catch (error) {
      toast.error("Failed to load data");
      navigate(BASE_PATH);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!formData.Api_Url?.trim()) next.Api_Url = "API URL is required";
    if (!formData.Client_Id?.trim()) next.Client_Id = "Client Id is required";
    if (!isEditMode && !formData.Client_Secret?.trim()) {
      next.Client_Secret = "Client Secret is required";
    }
    if (!formData.Client_Code?.trim()) next.Client_Code = "Client Code is required";
    if (!formData.Msg_Source?.trim()) next.Msg_Source = "Msg Source is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this record?"
        : "Are you sure you want to create this record?",
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
      const payload = { ...formData };
      if (isEditMode) {
        await KotakConfigurationApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await KotakConfigurationApi.create(payload);
        toast.success("Created successfully!");
      }
      navigate(BASE_PATH);
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const mapped = {};
        Object.entries(apiErrors).forEach(([key, val]) => {
          mapped[key] = Array.isArray(val) ? val[0] : String(val);
        });
        setErrors(mapped);
      }
      toast.error(error.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(BASE_PATH)}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? `Edit ${pageTitle}` : `Add ${pageTitle}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Values are stored encrypted in the database
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Config Name" error={errors.Config_Name}>
            <input
              name="Config_Name"
              value={formData.Config_Name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="UAT Main"
            />
          </Field>

          <Field label="Mode" required error={errors.Mode}>
            <select
              name="Mode"
              value={formData.Mode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="UAT">UAT</option>
              <option value="LIVE">LIVE</option>
            </select>
          </Field>

          <Field label="Active" hint="Only one config can be active">
            <label className="inline-flex items-center gap-2 mt-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="Is_Active"
                checked={formData.Is_Active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Mark as active
            </label>
          </Field>

          <Field label="API URL" required error={errors.Api_Url}>
            <input
              name="Api_Url"
              value={formData.Api_Url}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </Field>

          <Field label="Client Id" required error={errors.Client_Id}>
            <input
              name="Client_Id"
              value={formData.Client_Id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </Field>

          <Field
            label="Client Secret"
            required={!isEditMode}
            error={errors.Client_Secret}
            hint={isEditMode ? "Leave blank to keep existing secret" : "Also used as AES encryption key"}
          >
            <input
              type="password"
              name="Client_Secret"
              value={formData.Client_Secret}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </Field>

          <Field label="Client Code" required error={errors.Client_Code}>
            <input
              name="Client_Code"
              value={formData.Client_Code}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field label="Msg Source" required error={errors.Msg_Source}>
            <input
              name="Msg_Source"
              value={formData.Msg_Source}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field label="Product Code" error={errors.Product_Code}>
            <input
              name="Product_Code"
              value={formData.Product_Code}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="BBPACKAGE"
            />
          </Field>

          <Field label="Debit Account" error={errors.Debit_Account}>
            <input
              name="Debit_Account"
              value={formData.Debit_Account}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field label="Payment Path" error={errors.Payment_Path}>
            <input
              name="Payment_Path"
              value={formData.Payment_Path}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </Field>

          <Field label="Status Path" error={errors.Status_Path}>
            <input
              name="Status_Path"
              value={formData.Status_Path}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </Field>

          <Field label="Timeout (seconds)" error={errors.Timeout}>
            <input
              name="Timeout"
              value={formData.Timeout}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field label="Verify TLS" error={errors.Verify_Tls}>
            <select
              name="Verify_Tls"
              value={formData.Verify_Tls}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </Field>
        </div>

        <Field label="Remarks" error={errors.Remarks}>
          <textarea
            name="Remarks"
            value={formData.Remarks}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Field>

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : isEditMode ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => navigate(BASE_PATH)}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditKotakConfiguration;
