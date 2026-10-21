import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Building,
  Hash,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopRentalApi from "../../../services/shoprentalapi";

const ViewShopRental = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Shop Rental");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/shop-rental";
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
      const res = await ShopRentalApi.getById(id);
      setItem(res?.data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-rental");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${pageTitle}?`,
      text: `Are you sure you want to delete this rental record for "${item?.shop?.SPM_Name}"? This action cannot be undone.`,
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
      await ShopRentalApi.delete(id);
      toast.success("Rental deleted successfully!");
      navigate("/masters/hall-shop-management/shop-rental");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/hall-shop-management/shop-rental")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {item.shop?.SPM_Name || "Rental"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {item.shop?.SPM_Code && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-mono">
                    <Hash className="h-3 w-3 mr-1" />
                    {item.shop.SPM_Code}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.SPR_Status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {item.SPR_Status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/hall-shop-management/shop-rental/edit/${id}`}
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
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Rental Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Shop
                    </label>
                    <div className="mt-1 text-gray-900 font-medium">
                      {item.shop?.SPM_Name || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Rental Date
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(item.SPR_Date)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Base Rent
                    </label>
                    <div className="mt-1 flex items-center text-gray-900 font-semibold">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      {formatCurrency(item.SPR_BsRnt)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Security Deposit (Months)
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.SPR_SDMnt || (
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
                      Tax Percentage
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      {item.SPR_TaxP ? (
                        `${item.SPR_TaxP}%`
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Late Fee
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      {item.SPR_LtFe ? (
                        formatCurrency(item.SPR_LtFe)
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Due Date
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      {item.SPR_DuDt ? (
                        formatDate(item.SPR_DuDt)
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center">
                  {item.SPR_Status ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-700">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium text-red-700">
                        Inactive
                      </span>
                    </>
                  )}
                </div>
              </div>
              {item.shop && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Shop Code</span>
                    <span className="text-sm text-gray-700 font-mono">
                      {item.shop.SPM_Code || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm text-gray-700">
                      {item.shop.SPM_Loca || "N/A"}
                    </span>
                  </div>
                </>
              )}
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
        </div>
      </div>
    </div>
  );
};

export default ViewShopRental;
