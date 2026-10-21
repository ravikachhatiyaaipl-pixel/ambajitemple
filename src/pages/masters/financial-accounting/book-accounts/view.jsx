import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Hash,
  Folder,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  User,
  Printer,
  Mail,
  Phone,
  MapPin,
  Home,
  Map,
  Info,
  Globe,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BookAccountsApi } from "../../../services/bookaccountsapi";

const ViewBookAccounts = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    loadLedgerData();
  }, [id]);

  const loadLedgerData = async () => {
    setLoading(true);
    try {
      const data = await BookAccountsApi.getById(id);
      setLedger(data);
    } catch (error) {
      console.error("Error loading ledger:", error);
      toast.error(
        error.response?.data?.message || "Failed to load ledger data!",
      );
      navigate("/masters/financial-accounting/book-accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLedger = async () => {
    const result = await Swal.fire({
      title: "Delete Ledger?",
      text: `Are you sure you want to delete "${ledger?.Lg_Name}"? This action cannot be undone.`,
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
      await BookAccountsApi.delete(id);
      toast.success(`Ledger "${ledger?.Lg_Name}" deleted successfully!`);
      navigate("/masters/financial-accounting/book-accounts");
    } catch (error) {
      console.error("Error deleting ledger:", error);
      toast.error(error.response?.data?.message || "Failed to delete ledger");
    }
  };

  const handlePrint = () => {
    window.print();
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
        <p className="mt-4 text-gray-600">Loading ledger details...</p>
      </div>
    );
  }

  if (!ledger) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Ledger not found</p>
        <Link
          to="/masters/financial-accounting/book-accounts"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ledger List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate("/masters/financial-accounting/book-accounts")
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {ledger?.Lg_Name || "N/A"}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    {ledger?.Lg_Code && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Hash className="h-3 w-3 mr-1" />
                        {ledger.Lg_Code}
                      </span>
                    )}
                    {ledger?.Lg_Status ? (
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
            to={`/masters/financial-accounting/book-accounts/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab == "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Ledger Details
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab == "details" && (
            <>
              {/* Ledger Information Card */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Ledger Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Ledger Name
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 text-lg font-medium">
                            {ledger?.Lg_Name || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Ledger Code
                        </label>
                        <div className="mt-1 flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 font-mono font-medium">
                            {ledger?.Lg_Code || "N/A"}
                          </span>
                        </div>
                      </div>
                      {ledger?.Lg_Eng_Name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            English Name
                          </label>
                          <div className="mt-1 flex items-center">
                            <Globe className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {ledger.Lg_Eng_Name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <div className="mt-1">
                          {ledger?.Lg_Status ? (
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

                  {/* Description */}
                  {ledger?.Description && (
                    <div className="mt-6 pt-6 border-t">
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <span className="text-gray-700 whitespace-pre-line">
                            {ledger.Description}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ledger Group Card */}
              {ledger?.ledger_group && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Ledger Group
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start">
                      <Folder className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {ledger.ledger_group.Gr_Nm}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBookAccounts;
