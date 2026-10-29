import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle, Calendar, MapPin, Landmark, IndianRupee, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import ZoneCollectionApi from "../../../services/zonecollectionapi";

const BASE_PATH = "/transactions/bookkeeping-vouchers/zone-wise-collection";
const today = () => new Date().toISOString().slice(0, 10);
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } });

const AddEditZoneCollection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Zone Wise Collection");
  const [years, setYears] = useState([]);
  const [zones, setZones] = useState([]);
  const [modes, setModes] = useState([]);
  const [formData, setFormData] = useState({
    ZC_Date: today(),
    FY_Id: "",
    Zon_Id: "",
    PayMd_ID: "",
    Amount: "",
  });

  useEffect(() => {
    try {
      const menu = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const item = menu.find((m) => m.Menu_Links == BASE_PATH);
      if (item?.Fnc_Title) setPageTitle(item.Fnc_Title);
    } catch (_) {}
    loadMasters();
  }, []);

  useEffect(() => { if (isEditMode) loadData(); }, [id]);

  const loadMasters = async () => {
    try {
      const [fyRes, zoneRes, modeRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/fy-master`, auth()),
        axios.get(`${import.meta.env.VITE_API_URL}/zone-master/all`, auth()),
        axios.get(`${import.meta.env.VITE_API_URL}/payment-mode/all`, auth()),
      ]);
      const fyList = fyRes.data?.data || [];
      setYears(fyList);
      setZones(zoneRes.data?.data || []);
      setModes(modeRes.data?.data || []);
      if (!isEditMode) {
        const current = fyList.find((y) => y.is_current_year);
        if (current) setFormData((p) => ({ ...p, FY_Id: String(current.FY_Id) }));
      }
    } catch (_) {
      toast.error("Failed to load dropdowns");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ZoneCollectionApi.getById(id);
      const d = res?.data;
      setFormData({
        ZC_Date: d.ZC_Date ? String(d.ZC_Date).slice(0, 10) : today(),
        FY_Id: d.FY_Id ? String(d.FY_Id) : "",
        Zon_Id: d.Zon_Id ? String(d.Zon_Id) : "",
        PayMd_ID: d.PayMd_ID ? String(d.PayMd_ID) : "",
        Amount: d.Amount != null ? String(d.Amount) : "",
      });
    } catch (_) {
      toast.error("Failed to load record");
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
    if (!formData.ZC_Date) err.ZC_Date = "Date is required";
    if (!formData.FY_Id) err.FY_Id = "Financial year is required";
    if (!formData.Zon_Id) err.Zon_Id = "Zone is required";
    if (!formData.PayMd_ID) err.PayMd_ID = "Payment mode is required";
    if (!formData.Amount || Number(formData.Amount) < 0) err.Amount = "Valid amount is required";
    setErrors(err);
    return Object.keys(err).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }
    const result = await Swal.fire({
      title: isEditMode ? "Update collection?" : "Create collection?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
    });
    if (!result.isConfirmed) return;
    setSaving(true);
    try {
      const payload = {
        ZC_Date: formData.ZC_Date,
        FY_Id: formData.FY_Id,
        Zon_Id: formData.Zon_Id,
        PayMd_ID: formData.PayMd_ID,
        Amount: formData.Amount,
      };
      if (isEditMode) await ZoneCollectionApi.update(id, payload);
      else await ZoneCollectionApi.create(payload);
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  const selectClass = (err) =>
    `w-full px-3 py-2.5 text-sm border ${err ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(BASE_PATH)} className="mr-4 text-gray-500"><ArrowLeft className="h-5 w-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? `Edit ${pageTitle}` : `Add ${pageTitle}`}</h1>
          <p className="text-gray-600 mt-1">Date, financial year, zone, payment mode and amount</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="date" name="ZC_Date" value={formData.ZC_Date} onChange={handleChange} className={`pl-10 ${selectClass(errors.ZC_Date)}`} />
              </div>
              {errors.ZC_Date && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.ZC_Date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year <span className="text-red-500">*</span></label>
              <select name="FY_Id" value={formData.FY_Id} onChange={handleChange} className={selectClass(errors.FY_Id)}>
                <option value="">Select financial year</option>
                {years.map((y) => <option key={y.FY_Id} value={y.FY_Id}>{y.FY_Name || y.FY_Code}</option>)}
              </select>
              {errors.FY_Id && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.FY_Id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select name="Zon_Id" value={formData.Zon_Id} onChange={handleChange} className={`pl-10 ${selectClass(errors.Zon_Id)}`}>
                  <option value="">Select zone</option>
                  {zones.map((z) => <option key={z.Zon_Id} value={z.Zon_Id}>{z.Zon_Code ? `${z.Zon_Code} — ` : ""}{z.Zon_Name}</option>)}
                </select>
              </div>
              {errors.Zon_Id && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.Zon_Id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode <span className="text-red-500">*</span></label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select name="PayMd_ID" value={formData.PayMd_ID} onChange={handleChange} className={`pl-10 ${selectClass(errors.PayMd_ID)}`}>
                  <option value="">Select payment mode</option>
                  {modes.map((m) => <option key={m.PayMd_ID} value={m.PayMd_ID}>{m.PayMd_Name}</option>)}
                </select>
              </div>
              {errors.PayMd_ID && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.PayMd_ID}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="number" name="Amount" min="0" step="0.01" value={formData.Amount} onChange={handleChange} placeholder="Enter amount" className={`pl-10 ${selectClass(errors.Amount)}`} />
              </div>
              {errors.Amount && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.Amount}</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(BASE_PATH)} className="px-6 py-2.5 bg-white border rounded-lg flex items-center text-sm">
            <X className="h-4 w-4 mr-2" />Cancel
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg flex items-center text-sm disabled:opacity-50">
            <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditZoneCollection;
