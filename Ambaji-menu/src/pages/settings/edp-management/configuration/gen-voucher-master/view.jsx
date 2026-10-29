import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import GenVoucherMasterApi from "../../../../services/genvouchermasterapi";

const BASE_PATH = "/settings/edp-management/configuration/generate-voucher-master";

/** Build a compact voucher format preview from per-field separators */
const buildFormat = (item) => {
  const parts = [];
  if (item.prifix) parts.push({ v: item.prifix,  sep: item.prifix_dev_type || item.dev_type || "/" });
  if (item.Dept == "Y") parts.push({ v: "DEPT",  sep: item.dept_dev_type  || item.dev_type || "/" });
  if (item.Text)  parts.push({ v: item.Text,     sep: item.text_dev_type  || item.dev_type || "/" });
  parts.push({ v: "1",                           sep: item.no_dev_type    || item.dev_type || "/" });
  if (item.FY == "Y") parts.push({ v: "FY",       sep: null });
  return parts.map((p, i) => (i < parts.length - 1 ? p.v + p.sep : p.v)).join("");
};

const DetailRow = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <div className="mt-1">{children}</div>
  </div>
);

const YNBadge = ({ value }) =>
  value == "Y"
    ? <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Yes</span>
    : <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">No</span>;

const ViewGenVoucherMaster = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Generate Voucher Master");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const found = menuDetails.find((i) => i.Menu_Links == BASE_PATH);
      if (found?.Fnc_Title) setPageTitle(found.Fnc_Title);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await GenVoucherMasterApi.getById(id);
      setItem(res?.data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate(BASE_PATH);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${pageTitle}?`,
      text: "Are you sure you want to delete this record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await GenVoucherMasterApi.delete(id);
      toast.success("Deleted successfully!");
      navigate(BASE_PATH);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return (
    <div className="p-12 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );
  if (!item) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(BASE_PATH)} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {item.prifix?.charAt(0) || "V"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {item.prifix || "—"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.No == "Dept_Series" ? "Department Series" : item.No == "GMC_Series" ? "AMT Series" : item.No}
                </span>
                {item.Is_Active == "Y"
                  ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                  : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Inactive</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`${BASE_PATH}/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 flex items-center shadow-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />Delete
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* Section: Voucher Configuration */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-base font-semibold text-gray-900">Voucher Configuration</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            <DetailRow label="Prefix">
              <span className="text-gray-900 text-base font-medium">
                {item.prifix || <span className="text-gray-400 italic">Not specified</span>}
              </span>
            </DetailRow>

            <DetailRow label="Include Department (Dept)">
              <YNBadge value={item.Dept} />
            </DetailRow>

            <DetailRow label="Text">
              <span className="text-gray-900 text-base font-medium">
                {item.Text || <span className="text-gray-400 italic">Not specified</span>}
              </span>
            </DetailRow>

            <DetailRow label="No Series">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {item.No == "Dept_Series" ? "Department Series" : item.No == "GMC_Series" ? "AMT Series" : item.No}
              </span>
            </DetailRow>

            <DetailRow label="Include Financial Year (FY)">
              <YNBadge value={item.FY} />
            </DetailRow>

            <DetailRow label="Voucher Format">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 font-mono">
                {buildFormat(item)}
              </span>
            </DetailRow>

            <DetailRow label="Separators">
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {item.prifix && <span className="bg-gray-100 px-2 py-1 rounded">After Prefix: <b>{item.prifix_dev_type || item.dev_type || "/"}</b></span>}
                {item.Dept == "Y" && <span className="bg-gray-100 px-2 py-1 rounded">After Dept: <b>{item.dept_dev_type || item.dev_type || "/"}</b></span>}
                {item.Text && <span className="bg-gray-100 px-2 py-1 rounded">After Text: <b>{item.text_dev_type || item.dev_type || "/"}</b></span>}
                <span className="bg-gray-100 px-2 py-1 rounded">After Serial: <b>{item.no_dev_type || item.dev_type || "/"}</b></span>
              </div>
            </DetailRow>

            <DetailRow label="Active Status">
              {item.Is_Active == "Y"
                ? <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Active</span>
                : <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">Inactive</span>}
            </DetailRow>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewGenVoucherMaster;
