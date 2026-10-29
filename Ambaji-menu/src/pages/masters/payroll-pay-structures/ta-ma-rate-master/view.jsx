/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Award,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Hash,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
  Copy,
  Calculator,
  MapPin,
  Briefcase,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Tamarate from "../../../services/tamarate";

const ViewTamarate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState(null);
  const [pageTitle, setPageTitle] = useState("TA-MA Rate Master");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/payroll-pay-structures/ta-ma-rate-master";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadRateData();
    }
  }, [id]);

  const loadRateData = async () => {
    setLoading(true);
    try {
      const response = await Tamarate.getById(id);
      if (response.success == true) {
        setRate(response.data);
      } else {
        toast.error("Failed to load rate data!");
        navigate("/masters/payroll-pay-structures/ta-ma-rate-master");
      }
    } catch (error) {
      console.error("Error loading rate:", error);
      toast.error("Failed to load rate data!");
      navigate("/masters/payroll-pay-structures/ta-ma-rate-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete TA-MA Rate?",
      html: `
        <div class="text-left">
          <p class="mb-2">Are you sure you want to delete this rate configuration?</p>
          <p class="text-sm text-gray-600 mb-1"><strong>Employee Grade:</strong> ${rate?.emp_grade?.EGM_Name || "Unknown Grade"}</p>
          <p class="text-sm text-gray-600 mb-1"><strong>City Grade:</strong> ${rate?.city_grade?.City_Name || "Unknown City"}</p>
          <p class="text-sm text-gray-600 mb-1"><strong>TA Amount:</strong> ₹${rate?.TA || "0"}</p>
          <p class="text-sm text-gray-600 mb-2"><strong>MA Amount:</strong> ₹${rate?.MA || "0"}</p>
          <p class="text-xs text-red-600 mt-2">This action cannot be undone!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await Tamarate.delete(id);
        toast.success("TA-MA rate deleted successfully!");
        navigate("/masters/payroll-pay-structures/ta-ma-rate-master");
      } catch (error) {
        toast.error("Failed to delete rate");
      }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0.00";
    return parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const DetailCard = ({ title, icon: Icon, children, color = "blue" }) => {
    const colorClasses = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-200",
        light: "bg-blue-50",
      },
      green: {
        bg: "bg-green-500",
        text: "text-green-600",
        border: "border-green-200",
        light: "bg-green-50",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-600",
        border: "border-purple-200",
        light: "bg-purple-50",
      },
      amber: {
        bg: "bg-amber-500",
        text: "text-amber-600",
        border: "border-amber-200",
        light: "bg-amber-50",
      },
    }[color];

    return (
      <div
        className={`bg-white rounded-xl border ${colorClasses.border} p-6 hover:shadow-lg transition-all duration-200`}
      >
        <div className="flex items-center mb-4">
          <div className={`${colorClasses.bg} text-white p-2 rounded-lg mr-3`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    );
  };

  const InfoRow = ({ label, value, icon: Icon, copyable = false }) => (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center max-w-xs">
        <span className="text-sm text-gray-900 text-right break-words">
          {value || "N/A"}
        </span>
        {copyable && value && value != "N/A" && (
          <button
            onClick={() => handleCopy(value)}
            className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="Copy to clipboard"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rate details...</p>
      </div>
    );
  }

  if (!rate) {
    return (
      <div className="p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Rate Configuration Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The requested TA-MA rate configuration could not be found.
        </p>
        <button
          onClick={() =>
            navigate("/masters/payroll-pay-structures/ta-ma-rate-master")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  const totalAmount = (parseFloat(rate.TA) || 0) + (parseFloat(rate.MA) || 0);

  return (
    <div className="p-6">
      {/* Header with Actions and Dynamic Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/ta-ma-rate-master")
            }
            className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 mr-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
              Back to List
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/masters/payroll-pay-structures/ta-ma-rate-master/edit/${id}`}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Rate
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Employee Grade Details Card */}
        <DetailCard title="Employee Grade Details" icon={Award} color="purple">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mr-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                {rate.emp_grade?.EGM_Name || "N/A"}
              </h4>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {rate.emp_grade?.Is_Active == "1" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <InfoRow
            label="Grade Code"
            value={rate.emp_grade?.EGM_Code}
            icon={Hash}
            copyable={true}
          />
          <InfoRow
            label="Grade Name"
            value={rate.emp_grade?.EGM_Name}
            icon={Award}
            copyable={true}
          />
        </DetailCard>

        {/* City Grade Details Card */}
        <DetailCard title="City Grade Details" icon={Building} color="green">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mr-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                {rate.city_grade?.City_Name || "N/A"}
              </h4>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Grade: {rate.city_grade?.Grade}
                </span>
              </div>
            </div>
          </div>

          <InfoRow
            label="City Name"
            value={rate.city_grade?.City_Name}
            icon={MapPin}
            copyable={true}
          />
          <InfoRow
            label="Grade Classification"
            value={rate.city_grade?.Grade}
            icon={Award}
          />
        </DetailCard>
      </div>

      {/* Rate Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Rate Configuration
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                TA Amount
              </p>
              <p className="text-2xl font-bold text-green-600">
                ₹ {formatCurrency(rate.TA)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Travel Allowance</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                MA Amount
              </p>
              <p className="text-2xl font-bold text-blue-600">
                ₹ {formatCurrency(rate.MA)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Medical Allowance</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center mb-2">
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Amount
              </p>
              <p className="text-2xl font-bold text-purple-600">
                ₹ {formatCurrency(totalAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-2">TA + MA Combined</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTamarate;
