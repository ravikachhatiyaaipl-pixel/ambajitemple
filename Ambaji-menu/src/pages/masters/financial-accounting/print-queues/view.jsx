import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Hash,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Info,
  TrendingUp,
  AlertCircle,
  UserCheck,
  User,
  IndianRupee,
  Building2,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PrintQueuesApi } from "../../../services/printqueuesapi";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const ViewPrintQueues = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chequeDetails, setChequeDetails] = useState(null);

  useEffect(() => {
    loadPrintQueueData();
  }, [id]);

  const loadPrintQueueData = async () => {
    setLoading(true);
    try {
      const data = await PrintQueuesApi.getById(id);
      setQueue(data);

      // Fetch cheque details
      if (data.cheque_id) {
        await fetchChequeDetails(data.cheque_id);
      }
    } catch (error) {
      console.error("Error loading print queue:", error);
      toast.error(
        error.response?.data?.message || "Failed to load print queue data!",
      );
      navigate("/masters/financial-accounting/print-queues");
    } finally {
      setLoading(false);
    }
  };

  const fetchChequeDetails = async (chequeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheques/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.data.success) {
        const cheque = response.data.data.find((c) => c.cheque_id == chequeId);
        setChequeDetails(cheque || null);
      }
    } catch (error) {
      console.error("Error fetching cheque details:", error);
    }
  };

  const handleDeleteQueue = async () => {
    const result = await Swal.fire({
      title: "Delete Print Queue?",
      text: `Are you sure you want to delete print queue for Cheque #${queue?.cheque_id}? This action cannot be undone.`,
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
      await PrintQueuesApi.delete(id);
      toast.success(
        `Print queue for Cheque #${queue?.cheque_id} deleted successfully!`,
      );
      navigate("/masters/financial-accounting/print-queues");
    } catch (error) {
      console.error("Error deleting print queue:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete print queue",
      );
    }
  };

  const formatDateTime = (dateString) => {
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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPriorityBadge = (priority) => {
    if (priority <= 2) {
      return {
        color: "bg-red-100 text-red-800",
        label: "High Priority",
        icon: AlertCircle,
      };
    } else if (priority <= 4) {
      return {
        color: "bg-yellow-100 text-yellow-800",
        label: "Medium Priority",
        icon: Clock,
      };
    } else {
      return {
        color: "bg-green-100 text-green-800",
        label: "Low Priority",
        icon: CheckCircle,
      };
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading print queue details...</p>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Print queue not found</p>
        <Link
          to="/masters/financial-accounting/print-queues"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Print Queues
        </Link>
      </div>
    );
  }

  const priorityBadge = getPriorityBadge(queue.priority);
  const PriorityIcon = priorityBadge.icon;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate("/masters/financial-accounting/print-queues")
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <Printer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Print Queue Details
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadge.color}`}
                    >
                      <PriorityIcon className="h-3 w-3 mr-1" />
                      {priorityBadge.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/financial-accounting/print-queues/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Information Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cheque Details Card */}
          {chequeDetails && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cheque Details
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Cheque Number
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900 font-mono">
                          {chequeDetails.cheque_number || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Payee Name
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900 font-medium">
                          {chequeDetails.SL_Name || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Amount
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-green-50 text-green-700">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {formatCurrency(chequeDetails.amount)}
                        </span>
                      </div>
                      {chequeDetails.amount_words && (
                        <p className="mt-1 text-xs text-gray-500">
                          ({chequeDetails.amount_words})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Cheque Date
                      </label>
                      <div className="mt-1 flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {formatDateTime(chequeDetails.cheque_date)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Payment Type
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {chequeDetails.payment_type || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Bank Account
                      </label>
                      <div className="mt-1">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {chequeDetails.bank_account?.account_name || "N/A"}
                          </span>
                        </div>
                        {chequeDetails.bank_account?.account_number && (
                          <p className="text-xs text-gray-500 mt-1">
                            A/C: {chequeDetails.bank_account.account_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        IFSC Code
                      </label>
                      <div className="mt-1 flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-mono">
                          {chequeDetails.bank_account?.ifsc || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Queue Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Queue Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Priority
                    </label>
                    <div className="mt-1">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-medium">
                          {queue.priority}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          (1 = Highest, 10 = Lowest)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Queued At
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDateTime(queue.queued_at)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Printed At
                    </label>
                    <div className="mt-1 flex items-center">
                      {queue.printed_at ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-900">
                            {formatDateTime(queue.printed_at)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-yellow-600">
                            Not printed yet
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Created At
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDateTime(queue.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Action Details */}
          {/* {queue.status_action && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-gray-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Status Action Details
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Action ID
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900">{queue.status_action.Act_Id}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status Name
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900 font-medium">
                          {queue.status_action.St_Name}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Previous Status
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900">{queue.status_action.Previous_Status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Stage
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {queue.status_action.stage}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Department ID
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900">{queue.status_action.Dpt_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Sidebar Card */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Print Status
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <p className="text-lg font-semibold mt-1">
                    {queue.printed_at ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Printed
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Pending
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPrintQueues;
