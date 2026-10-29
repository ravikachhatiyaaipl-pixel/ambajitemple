import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import FdRegisterApi from "../../../services/fdregisterapi";

const BASE_PATH = "/transactions/bookkeeping-vouchers/fd-register";
const today = () => new Date().toISOString().slice(0, 10);

const AddEditFdRegister = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("FD Register");
  const [formData, setFormData] = useState({
    FDR_Date: today(),
    FDR_No: "",
    Bank_Name: "",
    Branch_Name: "",
    Amount: "",
    Interest_Rate: "",
    Start_Date: "",
    Maturity_Date: "",
    Maturity_Amount: "",
    Status: "Active",
    Remarks: "",
  });

  useEffect(() => {
    try {
      const menu = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const item = menu.find((m) => m.Menu_Links == BASE_PATH);
      if (item?.Fnc_Title) setPageTitle(item.Fnc_Title);
    } catch (_) {}
  }, []);

  useEffect(() => { if (isEditMode) loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await FdRegisterApi.getById(id);
      const d = res?.data;
      setFormData({
        FDR_Date: d.FDR_Date ? String(d.FDR_Date).slice(0, 10) : today(),
        FDR_No: d.FDR_No || "",
        Bank_Name: d.Bank_Name || "",
        Branch_Name: d.Branch_Name || "",
        Amount: d.Amount != null ? String(d.Amount) : "",
        Interest_Rate: d.Interest_Rate != null ? String(d.Interest_Rate) : "",
        Start_Date: d.Start_Date ? String(d.Start_Date).slice(0, 10) : "",
        Maturity_Date: d.Maturity_Date ? String(d.Maturity_Date).slice(0, 10) : "",
        Maturity_Amount: d.Maturity_Amount != null ? String(d.Maturity_Amount) : "",
        Status: d.Status || "Active",
        Remarks: d.Remarks || "",
      });
    } catch (_) {
      toast.error("Failed to load FD record");
      navigate(BASE_PATH);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formData.FDR_Date) err.FDR_Date = "Date is required";
    if (!formData.FDR_No.trim()) err.FDR_No = "FD No is required";
    if (!formData.Bank_Name.trim()) err.Bank_Name = "Bank name is required";
    if (!formData.Amount || Number(formData.Amount) < 0) err.Amount = "Valid amount is required";
    if (!formData.Status) err.Status = "Status is required";
    setErrors(err);
    return Object.keys(err).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill required fields");
      return;
    }
    const result = await Swal.fire({
      title: isEditMode ? "Update FD record?" : "Create FD record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
    });
    if (!result.isConfirmed) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        FDR_No: formData.FDR_No.trim(),
        Bank_Name: formData.Bank_Name.trim(),
        Branch_Name: formData.Branch_Name.trim() || null,
        Interest_Rate: formData.Interest_Rate || null,
        Start_Date: formData.Start_Date || null,
        Maturity_Date: formData.Maturity_Date || null,
        Maturity_Amount: formData.Maturity_Amount || null,
        Remarks: formData.Remarks.trim() || null,
      };
      if (isEditMode) await FdRegisterApi.update(id, payload);
      else await FdRegisterApi.create(payload);
      toast.success(isEditMode ? "Updated successfully!" : "Created successfully!");
      setTimeout(() => navigate(BASE_PATH), 700);
    } catch (error) {
      if (error.response?.data?.errors) {
        const be = error.response.data.errors;
        const next = {};
        Object.keys(be).forEach((k) => { next[k] = be[k][0]; });
        setErrors(next);
        toast.error(be[Object.keys(be)[0]][0]);
      } else {
        toast.error(error.response?.data?.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const inp = (err) => `w-full px-3 py-2.5 text-sm border ${err ? "border-red-300" : "border-gray-300"} rounded-lg outline-none focus:ring-2 focus:ring-blue-500`;

  if (loading) {
    return <div className="p-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(BASE_PATH)} className="mr-4 text-gray-500"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? `Edit ${pageTitle}` : `Add ${pageTitle}`}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label>
            <input type="date" name="FDR_Date" value={formData.FDR_Date} onChange={handleChange} className={inp(errors.FDR_Date)} />
            {errors.FDR_Date && <p className="text-sm text-red-600 mt-1 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.FDR_Date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">FD No <span className="text-red-500">*</span></label>
            <input name="FDR_No" value={formData.FDR_No} onChange={handleChange} maxLength="50" className={inp(errors.FDR_No)} placeholder="FD number" />
            {errors.FDR_No && <p className="text-sm text-red-600 mt-1 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.FDR_No}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name <span className="text-red-500">*</span></label>
            <input name="Bank_Name" value={formData.Bank_Name} onChange={handleChange} className={inp(errors.Bank_Name)} placeholder="Bank name" />
            {errors.Bank_Name && <p className="text-sm text-red-600 mt-1 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.Bank_Name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <input name="Branch_Name" value={formData.Branch_Name} onChange={handleChange} className={inp()} placeholder="Branch name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount <span className="text-red-500">*</span></label>
            <input type="number" min="0" step="0.01" name="Amount" value={formData.Amount} onChange={handleChange} className={inp(errors.Amount)} />
            {errors.Amount && <p className="text-sm text-red-600 mt-1 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.Amount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
            <input type="number" min="0" step="0.01" name="Interest_Rate" value={formData.Interest_Rate} onChange={handleChange} className={inp()} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" name="Start_Date" value={formData.Start_Date} onChange={handleChange} className={inp()} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Maturity Date</label>
            <input type="date" name="Maturity_Date" value={formData.Maturity_Date} onChange={handleChange} className={inp()} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Maturity Amount</label>
            <input type="number" min="0" step="0.01" name="Maturity_Amount" value={formData.Maturity_Amount} onChange={handleChange} className={inp()} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status <span className="text-red-500">*</span></label>
            <select name="Status" value={formData.Status} onChange={handleChange} className={inp(errors.Status)}>
              <option value="Active">Active</option>
              <option value="Matured">Matured</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea name="Remarks" value={formData.Remarks} onChange={handleChange} rows="3" className={inp()} />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(BASE_PATH)} className="px-6 py-2.5 border rounded-lg flex items-center text-sm"><X className="h-4 w-4 mr-2" />Cancel</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg flex items-center text-sm disabled:opacity-50">
            <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditFdRegister;
