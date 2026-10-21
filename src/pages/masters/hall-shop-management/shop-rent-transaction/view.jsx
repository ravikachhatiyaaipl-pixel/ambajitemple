import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Building,
  User,
  Clock,
  DollarSign,
  FileCheck,
  Info,
  AlertCircle,
  Printer,
  Copy,
  CreditCard,
  Hash,
  Receipt,
  TrendingUp,
  TrendingDown,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopRentTransactionApi from "../../../services/shoprenttransactionapi";

const ViewShopRentTransaction = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Shop Rent Transaction");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/shop-rent-transaction";
      const currentMenuItem = menuDetails.find(
        (i) => i.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ShopRentTransactionApi.getById(id);
      setItem(res?.data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-rent-transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete Transaction?`,
      text: `Are you sure you want to delete transaction "${item?.SPGT_Bill_No}"? This action cannot be undone.`,
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
      await ShopRentTransactionApi.delete(id);
      toast.success("Transaction deleted successfully!");
      navigate("/masters/hall-shop-management/shop-rent-transaction");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      SD: "bg-blue-100 text-blue-800",
      Rent: "bg-green-100 text-green-800",
      Adj: "bg-yellow-100 text-yellow-800",
      FFT: "bg-orange-100 text-orange-800",
      LtFe: "bg-red-100 text-red-800",
      Tax: "bg-purple-100 text-purple-800",
      Trf: "bg-indigo-100 text-indigo-800",
    };
    const colorClass = typeColors[type] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
      >
        {type || "N/A"}
      </span>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/hall-shop-management/shop-rent-transaction")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {item.SPGT_Bill_No || "Transaction"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {getTypeBadge(item.SPGT_Type)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.SPGT_DrCr == "C" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {item.SPGT_DrCr == "C" ? "Credit" : "Debit"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <Link
            to={`/masters/hall-shop-management/shop-rent-transaction/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 flex items-center shadow-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="lg:col-span-2">
          {/* Transaction Information */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Transaction Date
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(item.SPGT_Date)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Transaction Type
                    </label>
                    <div className="mt-1">{getTypeBadge(item.SPGT_Type)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Bill Number
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      {item.SPGT_Bill_No || (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Amount
                    </label>
                    <div className="mt-1 text-2xl font-bold text-gray-900">
                      {formatCurrency(item.SPGT_Amt)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Debit / Credit
                    </label>
                    <div className="mt-1">
                      {item.SPGT_DrCr == "C" ? (
                        <div className="flex items-center text-green-600 font-medium">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Credit
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 font-medium">
                          <TrendingDown className="h-5 w-5 mr-2" />
                          Debit
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {item.SPGT_Remark && (
                <div className="mt-6 pt-6 border-t">
                  <label className="text-sm font-medium text-gray-500">
                    Remark
                  </label>
                  <div className="mt-1 text-gray-900">{item.SPGT_Remark}</div>
                </div>
              )}
            </div>
          </div>

          {/* Related Details */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Related Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {item.agreement && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Agreement
                    </label>
                    <div className="mt-1">
                      <div className="font-medium text-gray-900">
                        {item.agreement.SPRG_StRef}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {item.agreement.SPRG_Status || "N/A"}
                      </div>
                    </div>
                  </div>
                )}
                {item.shop && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Shop
                    </label>
                    <div className="mt-1">
                      <div className="font-medium text-gray-900">
                        {item.shop.SPM_Name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Code: {item.shop.SPM_Code || "N/A"} | Location:{" "}
                        {item.shop.SPM_Loca || "N/A"}
                      </div>
                    </div>
                  </div>
                )}
                {item.receipt_counter && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Receipt Counter
                    </label>
                    <div className="mt-1">
                      <div className="font-medium text-gray-900">
                        {item.receipt_counter.CCC_Name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Code: {item.receipt_counter.CCC_Code || "N/A"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Status & Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Information
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="text-sm text-gray-700 font-mono">
                  #{item.SPGT_Id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-700">
                  {formatDate(item.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-700">
                  {formatDate(item.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => copyToClipboard(item.SPGT_Bill_No || "")}
                className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Bill Number
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewShopRentTransaction;
