import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Hash,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  CreditCard,
  Globe,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BanksApi } from "../../../services/banksapi";

const ViewBanks = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadBankData();
  }, [id]);

  const loadBankData = async () => {
    setLoading(true);
    try {
      const data = await BanksApi.getById(id);
      setBank(data);
    } catch (error) {
      console.error("Error loading bank:", error);
      toast.error(error.response?.data?.message || "Failed to load bank data!");
      navigate("/masters/financial-accounting/banks");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBank = async () => {
    const result = await Swal.fire({
      title: "Delete Bank?",
      text: `Are you sure you want to delete "${bank?.bank_name}"? This action cannot be undone.`,
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
      await BanksApi.delete(id);
      toast.success(`Bank "${bank?.bank_name}" deleted successfully!`);
      navigate("/masters/financial-accounting/banks");
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error.response?.data?.message || "Failed to delete bank");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading bank details...</p>
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Bank not found</p>
        <Link
          to="/masters/financial-accounting/banks"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bank List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/masters/financial-accounting/banks")}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {bank?.bank_name || "N/A"}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    {bank?.bank_code && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Hash className="h-3 w-3 mr-1" />
                        {bank.bank_code}
                      </span>
                    )}
                    {bank?.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/financial-accounting/banks/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Bank Information Card */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab == "details" && (
            <>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bank Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Bank Name
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 text-lg font-medium">
                            {bank?.bank_name || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Bank Code
                        </label>
                        <div className="mt-1 flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 font-mono font-medium">
                            {bank?.bank_code || "N/A"}
                          </span>
                        </div>
                      </div>
                      {bank?.short_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Short Name
                          </label>
                          <div className="mt-1 flex items-center">
                            <Globe className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {bank.short_name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          IFSC Prefix
                        </label>
                        <div className="mt-1">
                          {bank?.ifsc_prefix ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              <CreditCard className="h-3 w-3 mr-1" />
                              {bank.ifsc_prefix}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </div>
                        {bank?.ifsc_prefix && (
                          <p className="mt-1 text-xs text-gray-500">
                            Example IFSC: {bank.ifsc_prefix}0ABCDE
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <div className="mt-1">
                          {bank?.is_active ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              <XCircle className="h-4 w-4 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBanks;
