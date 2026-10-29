import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Building2,
  Ruler,
  Type,
  Calendar,
  DollarSign,
  User,
  Copy,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequeFormatsApi } from "../../../services/chequeformatsapi";

const ViewChequeFormats = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [format, setFormat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadFormatData();
  }, [id]);

  const loadFormatData = async () => {
    setLoading(true);
    try {
      const data = await ChequeFormatsApi.getById(id);
      setFormat(data);
    } catch (error) {
      console.error("Error loading cheque format:", error);
      toast.error(
        error.response?.data?.message || "Failed to load cheque format data!",
      );
      navigate("/masters/financial-accounting/cheque-formats");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Cheque Format?",
      text: `Are you sure you want to delete "${format?.format_name}"? This action cannot be undone.`,
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
      await ChequeFormatsApi.delete(id);
      toast.success(
        `Cheque format "${format?.format_name}" deleted successfully!`,
      );
      navigate("/masters/financial-accounting/cheque-formats");
    } catch (error) {
      console.error("Error deleting cheque format:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete cheque format",
      );
    }
  };

  const handleClone = async () => {
    const result = await Swal.fire({
      title: "Clone Cheque Format?",
      text: `Are you sure you want to clone "${format?.format_name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clone!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await ChequeFormatsApi.clone(id);
      toast.success(`Cheque format cloned successfully!`);
      navigate("/masters/financial-accounting/cheque-formats");
    } catch (error) {
      console.error("Error cloning cheque format:", error);
      toast.error(
        error.response?.data?.message || "Failed to clone cheque format",
      );
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

  const FieldCard = ({ title, icon: Icon, data, printEnabled }) => {
    if (!printEnabled) return null;
    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4 text-gray-500" />
          <h4 className="font-medium text-gray-900">{title}</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Position:</span>
            <span className="font-mono">
              X: {data?.x || 0}, Y: {data?.y || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Size:</span>
            <span className="font-mono">
              W: {data?.width || 0}, H: {data?.height || 0}
            </span>
          </div>
          {data?.font_size && (
            <div className="flex justify-between">
              <span className="text-gray-500">Font:</span>
              <span>
                {data.font_size}px {data.font_family} ({data.font_weight})
              </span>
            </div>
          )}
          {data?.color && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Color:</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: data.color }}
                ></div>
                <span className="font-mono text-xs">{data.color}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading cheque format details...</p>
      </div>
    );
  }

  if (!format) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Cheque format not found</p>
        <Link
          to="/masters/financial-accounting/cheque-formats"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cheque Formats List
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
                navigate("/masters/financial-accounting/cheque-formats")
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {format?.format_name || "N/A"}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    {format?.bank && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Building2 className="h-3 w-3 mr-1" />
                        {format.bank.bank_name}
                      </span>
                    )}
                    {format?.is_active ? (
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
          <button
            onClick={handleClone}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center shadow-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Clone
          </button>
          <Link
            to={`/masters/financial-accounting/cheque-formats/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            activeTab == "details"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("fields")}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            activeTab == "fields"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Field Settings
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            activeTab == "preview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Main Content */}
      {activeTab == "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Format Name
                </label>
                <div className="mt-1 text-gray-900">{format.format_name}</div>
              </div>
              {format.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <div className="mt-1 text-gray-900">{format.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Page Settings */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Page Settings
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Page Width
                  </label>
                  <div className="mt-1 flex items-center">
                    <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {format.page_width_mm} mm
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Page Height
                  </label>
                  <div className="mt-1 flex items-center">
                    <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {format.page_height_mm} mm
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Top Margin
                  </label>
                  <div className="mt-1 text-gray-900">
                    {format.top_margin_mm} mm
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Left Margin
                  </label>
                  <div className="mt-1 text-gray-900">
                    {format.left_margin_mm} mm
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Status Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1">
                  {format.is_active ? (
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
              {format.is_default && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Default Format
                  </label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Yes
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <div className="mt-1 text-gray-900">
                  {formatDate(format.created_at)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <div className="mt-1 text-gray-900">
                  {formatDate(format.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Print Settings Summary */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Print Settings
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Print Date:</span>
                  <span
                    className={
                      format.print_date ? "text-green-600" : "text-red-600"
                    }
                  >
                    {format.print_date ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Print Payee:</span>
                  <span
                    className={
                      format.print_payee ? "text-green-600" : "text-red-600"
                    }
                  >
                    {format.print_payee ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Print Amount (Number):</span>
                  <span
                    className={
                      format.print_amount_num
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {format.print_amount_num ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Print Amount (Words):</span>
                  <span
                    className={
                      format.print_amount_words
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {format.print_amount_words ? "Yes" : "No"}
                  </span>
                </div>
                {/* <div className="flex justify-between py-1">
                  <span className="text-gray-600">Print Signature:</span>
                  <span
                    className={
                      format.print_signature ? "text-green-600" : "text-red-600"
                    }
                  >
                    {format.print_signature ? "Yes" : "No"}
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Settings Tab */}
      {activeTab == "fields" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FieldCard
            title="Date Field"
            icon={Calendar}
            data={{
              x: format.date_x,
              y: format.date_y,
              width: format.date_width,
              height: format.date_height,
              font_size: format.date_font_size,
              font_family: format.date_font_family,
              font_weight: format.date_font_weight,
              color: format.date_color,
            }}
            printEnabled={format.print_date}
          />
          <FieldCard
            title="Payee Field"
            icon={User}
            data={{
              x: format.payee_x,
              y: format.payee_y,
              width: format.payee_width,
              height: format.payee_height,
              font_size: format.payee_font_size,
              font_family: format.payee_font_family,
              font_weight: format.payee_font_weight,
              color: format.payee_color,
            }}
            printEnabled={format.print_payee}
          />
          <FieldCard
            title="Amount (Number) Field"
            icon={DollarSign}
            data={{
              x: format.amount_num_x,
              y: format.amount_num_y,
              width: format.amount_num_width,
              height: format.amount_num_height,
              font_size: format.amount_num_font_size,
              font_family: format.amount_num_font_family,
              font_weight: format.amount_num_font_weight,
              color: format.amount_num_color,
            }}
            printEnabled={format.print_amount_num}
          />
          <FieldCard
            title="Amount (Words) Field"
            icon={Type}
            data={{
              x: format.amount_word_x,
              y: format.amount_word_y,
              width: format.amount_word_width,
              height: format.amount_word_height,
              font_size: format.amount_word_font_size,
              font_family: format.amount_word_font_family,
              font_weight: format.amount_word_font_weight,
              color: format.amount_word_color,
            }}
            printEnabled={format.print_amount_words}
          />
          {format.print_signature && format.sig1_width > 0 && (
            <FieldCard
              title="Signature 1 Field"
              icon={User}
              data={{
                x: format.sig1_x,
                y: format.sig1_y,
                width: format.sig1_width,
                height: format.sig1_height,
              }}
              printEnabled={true}
            />
          )}
          {format.print_signature && format.sig2_width > 0 && (
            <FieldCard
              title="Signature 2 Field"
              icon={User}
              data={{
                x: format.sig2_x,
                y: format.sig2_y,
                width: format.sig2_width,
                height: format.sig2_height,
              }}
              printEnabled={true}
            />
          )}
        </div>
      )}

      {/* Preview Tab */}
      {activeTab == "preview" && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
              <Eye className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Cheque Layout Preview
            </h2>
          </div>

          <div className="flex justify-center">
            <div
              className="relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
              style={{
                width: `${format.page_width_mm * 2}px`,
                height: `${format.page_height_mm * 2}px`,
              }}
            >
              <div className="absolute inset-0 bg-gray-50">
                {/* Date Field Preview */}
                {format.print_date && (
                  <div
                    className="absolute border border-blue-400 bg-blue-50 flex items-center justify-center"
                    style={{
                      left: `${format.date_x * 2}px`,
                      top: `${format.date_y * 2}px`,
                      width: `${format.date_width * 2}px`,
                      height: `${format.date_height * 2}px`,
                      fontSize: `${format.date_font_size}px`,
                      fontFamily: format.date_font_family,
                      fontWeight: format.date_font_weight,
                      color: format.date_color,
                    }}
                  >
                    {new Date().toLocaleDateString()}
                  </div>
                )}

                {/* Payee Field Preview */}
                {format.print_payee && (
                  <div
                    className="absolute border border-green-400 bg-green-50 flex items-center justify-center truncate px-2"
                    style={{
                      left: `${format.payee_x * 2}px`,
                      top: `${format.payee_y * 2}px`,
                      width: `${format.payee_width * 2}px`,
                      height: `${format.payee_height * 2}px`,
                      fontSize: `${format.payee_font_size}px`,
                      fontFamily: format.payee_font_family,
                      fontWeight: format.payee_font_weight,
                      color: format.payee_color,
                    }}
                  >
                    M/s Sample Enterprises Ltd.
                  </div>
                )}

                {/* Amount Number Preview */}
                {format.print_amount_num && (
                  <div
                    className="absolute border border-yellow-400 bg-yellow-50 flex items-center justify-center"
                    style={{
                      left: `${format.amount_num_x * 2}px`,
                      top: `${format.amount_num_y * 2}px`,
                      width: `${format.amount_num_width * 2}px`,
                      height: `${format.amount_num_height * 2}px`,
                      fontSize: `${format.amount_num_font_size}px`,
                      fontFamily: format.amount_num_font_family,
                      fontWeight: format.amount_num_font_weight,
                      color: format.amount_num_color,
                    }}
                  >
                    {format.amount_prefix}1,25,000{format.amount_suffix}
                  </div>
                )}

                {/* Amount Words Preview */}
                {format.print_amount_words && (
                  <div
                    className="absolute border border-purple-400 bg-purple-50 flex items-center justify-center text-center px-2"
                    style={{
                      left: `${format.amount_word_x * 2}px`,
                      top: `${format.amount_word_y * 2}px`,
                      width: `${format.amount_word_width * 2}px`,
                      height: `${format.amount_word_height * 2}px`,
                      fontSize: `${format.amount_word_font_size}px`,
                      fontFamily: format.amount_word_font_family,
                      fontWeight: format.amount_word_font_weight,
                      color: format.amount_word_color,
                    }}
                  >
                    One Lakh Twenty Five Thousand Rupees {format.words_suffix}
                  </div>
                )}

                {/* Signature 1 Preview */}
                {/* {format.print_signature && format.sig1_width > 0 && (
                  <div
                    className="absolute border border-red-400 bg-red-50 flex items-center justify-center italic"
                    style={{
                      left: `${format.sig1_x * 2}px`,
                      top: `${format.sig1_y * 2}px`,
                      width: `${format.sig1_width * 2}px`,
                      height: `${format.sig1_height * 2}px`,
                    }}
                  >
                    Signature 1
                  </div>
                )} */}

                {/* Signature 2 Preview */}
                {/* {format.print_signature && format.sig2_width > 0 && (
                  <div
                    className="absolute border border-red-400 bg-red-50 flex items-center justify-center italic"
                    style={{
                      left: `${format.sig2_x * 2}px`,
                      top: `${format.sig2_y * 2}px`,
                      width: `${format.sig2_width * 2}px`,
                      height: `${format.sig2_height * 2}px`,
                    }}
                  >
                    Signature 2
                  </div>
                )} */}
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Preview is scaled for visualization. Actual print dimensions:{" "}
            {format.page_width_mm} x {format.page_height_mm} mm
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewChequeFormats;
