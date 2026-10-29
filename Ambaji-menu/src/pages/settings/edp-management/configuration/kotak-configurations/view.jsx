import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import KotakConfigurationApi from "../../../../services/kotakconfigurationapi";

const BASE_PATH = "/settings/edp-management/configuration/kotak-configurations";

const DetailRow = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <div className="mt-1 text-sm text-gray-900 break-all">{children}</div>
  </div>
);

const ViewKotakConfiguration = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Kotak Configurations");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const found = menuDetails.find((i) => i.Menu_Links == BASE_PATH);
      if (found?.Fnc_Title) setPageTitle(found.Fnc_Title);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await KotakConfigurationApi.getById(id);
      setItem(res?.data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate(BASE_PATH);
    } finally {
      setLoading(false);
    }
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
      await KotakConfigurationApi.delete(id);
      toast.success("Deleted successfully!");
      navigate(BASE_PATH);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
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

  if (!item) return null;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(BASE_PATH)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {item.Config_Name || pageTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Kotak CMS configuration details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`${BASE_PATH}/edit/${item.KC_Id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Config Name">{item.Config_Name || "—"}</DetailRow>
          <DetailRow label="Mode">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item.Mode || "UAT"}
            </span>
          </DetailRow>
          <DetailRow label="Status">
            {item.Is_Active ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Inactive
              </span>
            )}
          </DetailRow>
          <DetailRow label="API URL">
            <span className="font-mono">{item.Api_Url || "—"}</span>
          </DetailRow>
          <DetailRow label="Client Id">
            <span className="font-mono">{item.Client_Id || "—"}</span>
          </DetailRow>
          <DetailRow label="Client Secret">
            <span className="font-mono">
              {item.Client_Secret ? "••••••••••••••••" : "—"}
            </span>
          </DetailRow>
          <DetailRow label="Client Code">{item.Client_Code || "—"}</DetailRow>
          <DetailRow label="Msg Source">{item.Msg_Source || "—"}</DetailRow>
          <DetailRow label="Product Code">{item.Product_Code || "—"}</DetailRow>
          <DetailRow label="Debit Account">{item.Debit_Account || "—"}</DetailRow>
          <DetailRow label="Payment Path">
            <span className="font-mono">{item.Payment_Path || "—"}</span>
          </DetailRow>
          <DetailRow label="Status Path">
            <span className="font-mono">{item.Status_Path || "—"}</span>
          </DetailRow>
          <DetailRow label="Timeout">{item.Timeout || "—"}</DetailRow>
          <DetailRow label="Verify TLS">{item.Verify_Tls || "—"}</DetailRow>
          <DetailRow label="Remarks">{item.Remarks || "—"}</DetailRow>
        </div>
      </div>
    </div>
  );
};

export default ViewKotakConfiguration;
