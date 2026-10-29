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
  Banknote,
  MapPin,
  DollarSign,
  Landmark,
  Home,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BankAccountsApi } from "../../../services/bankaccountsapi";
const ViewBankAccounts = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadAccountData();
  }, [id]);

  const loadAccountData = async () => {
    setLoading(true);
    try {
      const data = await BankAccountsApi.getById(id);
      setAccount(data);
    } catch (error) {
      console.error("Error loading bank account:", error);
      toast.error(
        error.response?.data?.message || "Failed to load bank account data!",
      );
      navigate("/masters/financial-accounting/bank-accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete Bank Account?",
      text: `Are you sure you want to delete "${account?.account_name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      await BankAccountsApi.delete(id);
      toast.success(
        `Bank account "${account?.account_name}" deleted successfully!`,
      );

      // Navigate back to list page after successful deletion
      // Use replace to prevent going back to deleted record
      navigate("/masters/financial-accounting/bank-accounts", {
        replace: true,
      });
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete bank account",
      );
      setLoading(false);
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

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getAccountTypeLabel = (type) => {
    const types = {
      saving: "Saving Account",
      current: "Current Account",
      overdraft: "Overdraft Account",
      cash_credit: "Cash Credit Account",
    };
    return types[type?.toLowerCase()] || type || "N/A";
  };

  if (loading && !account) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading bank account details...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Bank account not found</p>
        <Link
          to="/masters/financial-accounting/bank-accounts"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bank Accounts List
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
              onClick={() =>
                navigate("/masters/financial-accounting/bank-accounts")
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {account?.account_name || "N/A"}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    {account?.account_code && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Hash className="h-3 w-3 mr-1" />
                        {account.account_code}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Banknote className="h-3 w-3 mr-1" />
                      {getAccountTypeLabel(account.account_type)}
                    </span>
                    {account?.is_active ? (
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
            to={`/masters/financial-accounting/bank-accounts/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab == "details"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Account Details
        </button>
        <button
          onClick={() => setActiveTab("bank")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab == "bank"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Bank Information
        </button>
        <button
          onClick={() => setActiveTab("organization")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab == "organization"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Organization Info
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab == "details" && (
            <>
              {/* Account Information Card */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Account Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Account Name
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 text-lg font-medium">
                            {account?.account_name || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Account Code
                        </label>
                        <div className="mt-1 flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 font-mono font-medium">
                            {account?.account_code || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Account Number
                        </label>
                        <div className="mt-1 flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 font-mono">
                            {account?.account_number || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Account Type
                        </label>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {getAccountTypeLabel(account?.account_type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          IFSC Code
                        </label>
                        <div className="mt-1 flex items-center">
                          <Globe className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 font-mono font-medium">
                            {account?.ifsc || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          MICR Code
                        </label>
                        <div className="mt-1 flex items-center">
                          <div className="h-4 w-4 mr-2"></div>
                          <span className="text-gray-900 font-mono">
                            {account?.micr || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <div className="mt-1">
                          {account?.is_active ? (
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

              {/* Branch Information Card */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Branch Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Branch Name
                        </label>
                        <div className="mt-1 flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {account?.branch_name || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Branch Code
                        </label>
                        <div className="mt-1 flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 font-mono">
                            {account?.branch_code || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          City
                        </label>
                        <div className="mt-1 flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {account?.city || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Address
                        </label>
                        <div className="mt-1 flex items-start">
                          <Home className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <span className="text-gray-900">
                            {account?.address || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information Card */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Financial Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Opening Balance
                      </label>
                      <div className="mt-1">
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(account?.opening_balance)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        OD / Credit Limit
                      </label>
                      <div className="mt-1">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(account?.od_limit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab == "bank" && account?.bank && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center">
                  <Landmark className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bank Information
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Bank Name
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900 font-medium">
                          {account.bank.bank_name}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Bank Code
                      </label>
                      <div className="mt-1 flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-mono">
                          {account.bank.bank_code}
                        </span>
                      </div>
                    </div>
                    {account.bank.short_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Short Name
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {account.bank.short_name}
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
                        <span className="text-gray-900 font-mono">
                          {account.bank.ifsc_prefix || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Bank Status
                      </label>
                      <div className="mt-1">
                        {account.bank.is_active ? (
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
          )}

          {activeTab == "organization" && account?.organize && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Organization Information
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Organization Name
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900 font-medium">
                          {account.organize.Org_Name}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Organization Code
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900">
                          {account.organize.Org_Code}
                        </span>
                      </div>
                    </div>
                    {account.organize.Org_GST_No && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          GST Number
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 font-mono">
                            {account.organize.Org_GST_No}
                          </span>
                        </div>
                      </div>
                    )}
                    {account.organize.Org_PAN_No && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          PAN Number
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 font-mono">
                            {account.organize.Org_PAN_No}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {account.organize.Org_City && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          City
                        </label>
                        <div className="mt-1 flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {account.organize.Org_City}
                          </span>
                        </div>
                      </div>
                    )}
                    {account.organize.Org_State && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          State
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {account.organize.Org_State}
                          </span>
                        </div>
                      </div>
                    )}
                    {account.organize.Org_Email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Email
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {account.organize.Org_Email}
                          </span>
                        </div>
                      </div>
                    )}
                    {account.organize.Org_Address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Address
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {account.organize.Org_Address}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBankAccounts;
