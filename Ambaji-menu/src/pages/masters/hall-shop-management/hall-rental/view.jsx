import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit, Trash2, Building, Calendar, DollarSign, 
  Clock, Percent, Users, CheckCircle, XCircle, Hash
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentalApi from "../../../services/hall-rental-api";

const ViewHallRental = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Hall Rental");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/masters/hall-shop-management/hall-rental";
      const currentMenuItem = menuDetails.find((i) => i.Menu_Links == currentPath);
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentalApi.getById(id);
      setItem(res?.data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rental");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${pageTitle}?`,
      text: `Are you sure you want to delete this rental record? This action cannot be undone.`,
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
      await HallRentalApi.delete(id);
      toast.success("Rental deleted successfully!");
      navigate("/masters/hall-shop-management/hall-rental");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    if (!value || value == 0) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
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
            onClick={() => navigate("/masters/hall-shop-management/hall-rental")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle} Details</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {item.hall?.HLM_Code || 'N/A'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.HLR_Status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.HLR_Status ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/hall-shop-management/hall-rental/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 flex items-center shadow-sm"
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

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Rental Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hall</label>
                    <div className="mt-1 text-gray-900 font-medium">
                      {item.hall?.HLM_Name || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(item.HLR_Date)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Day Rent</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      {formatCurrency(item.HLR_FDR)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Half Day Rent</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      {formatCurrency(item.HLR_HDR)}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hourly Rent</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      {formatCurrency(item.HLR_HHR)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      {formatCurrency(item.HLR_SDR)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cleaning Charges</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      {formatCurrency(item.HLR_CLC)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tax Percentage</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      {item.HLR_TXP || '0'}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Booking Duration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Advance Booking Days:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {item.HLR_ABD} days
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Maximum Booking Days:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {item.HLR_MBD} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Status & Hall Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center">
                  {item.HLR_Status ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-700">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium text-red-700">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-700">{formatDate(item.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-700">{formatDate(item.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Hall Info Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Hall Information</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Hall Name</span>
                <span className="text-sm text-gray-900 font-medium">
                  {item.hall?.HLM_Name || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Hall Code</span>
                <span className="text-sm text-gray-700 font-mono">
                  {item.hall?.HLM_Code || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Capacity</span>
                <span className="text-sm text-gray-700">
                  <Users className="h-4 w-4 inline mr-1 text-gray-400" />
                  {item.hall?.HLM_Capa || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm text-gray-700">
                  {item.hall?.HLM_Loca || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHallRental;