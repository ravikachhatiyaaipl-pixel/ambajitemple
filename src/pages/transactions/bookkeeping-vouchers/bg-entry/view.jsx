import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Hash,
  Building,
  Calendar,
  FileText,
  File,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import BgEntryApi from "../../../services/bgentryapi";

const BASE_PATH = "/transactions/bookkeeping-vouchers/bg-entry";

const STATUS_BADGE = {
  In: {
    label: "In — Received / Held",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: ArrowDownLeft,
  },
  Out: {
    label: "Out — Returned / Released",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: ArrowUpRight,
  },
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Field = ({ label, value, icon: Icon }) => (
  <div>
    <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
      {label}
    </label>
    <div className="mt-1 text-gray-900 font-medium">
      {value != null && value != "" ? (
        value
      ) : (
        <span className="text-gray-400 italic font-normal">Not specified</span>
      )}
    </div>
  </div>
);

const ViewBgEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("BG Entry");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentMenuItem = menuDetails.find(
        (i) => i.Menu_Links == BASE_PATH,
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
      const res = await BgEntryApi.getById(id);
      setItem(res?.data);
    } catch (error) {
      toast.error("Failed to load BG entry");
      navigate(BASE_PATH);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${pageTitle}?`,
      text: `Are you sure you want to delete BG No. "${item?.BG_No}"? This action cannot be undone.`,
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
      await BgEntryApi.delete(id);
      toast.success("BG Entry deleted successfully!");
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

  const badge = STATUS_BADGE[item.Status] || STATUS_BADGE.In;
  const StatusIcon = badge.icon;
  const docUrl = item.document_url || item.Document;
  const docName = docUrl ? String(docUrl).split("/").pop() : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(BASE_PATH)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{item.BG_No}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {badge.label}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`${BASE_PATH}/edit/${id}`}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Date</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(item.BGE_Date)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <Hash className="h-8 w-8 text-indigo-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Tender No</p>
            <p className="text-sm font-semibold text-gray-900 font-mono">
              {item.Tender_No || "—"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          {item.Status == "In" ? (
            <ArrowDownLeft className="h-8 w-8 text-green-500 flex-shrink-0" />
          ) : (
            <ArrowUpRight className="h-8 w-8 text-amber-500 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs text-gray-500 font-medium">Status</p>
            <p
              className={`text-sm font-semibold ${item.Status == "In" ? "text-green-700" : "text-amber-700"}`}
            >
              {item.Status}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            BG Entry Details
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="Date"
              value={formatDate(item.BGE_Date)}
              icon={Calendar}
            />
            <Field label="BG No" value={item.BG_No} icon={Hash} />
            <Field label="Tender No" value={item.Tender_No} icon={Hash} />
            <Field
              label="Tender Name"
              value={item.Tender_Name}
              icon={FileText}
            />
            <Field
              label="Vendor Name"
              value={item.Vendor_Name}
              icon={Building}
            />
            <Field
              label="Amount"
              value={
                item.Amount != null && item.Amount != ""
                  ? "₹ " +
                    Number(item.Amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : null
              }
              icon={IndianRupee}
            />
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                <File className="h-3.5 w-3.5 text-gray-400" />
                Document
              </label>
              <div className="mt-1">
                {docUrl ? (
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    {docName || "View document"}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">
                    No document uploaded
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <div className="mt-1 text-sm text-gray-700">
                  {formatDateTime(item.created_at)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <div className="mt-1 text-sm text-gray-700">
                  {formatDateTime(item.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBgEntry;
