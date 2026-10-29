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
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Hash,
  Edit,
  Calendar,
  Clock,
  Copy,
  IndianRupee,
  Wallet,
  AlertCircle,
  Printer,
  Building2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { HouseTypeApi } from "../../../services/housetypemasterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewHouseType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [houseType, setHouseType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadHouseTypeData();
  }, [id]);

  const loadHouseTypeData = async () => {
    setLoading(true);
    try {
      const data = await HouseTypeApi.getById(id);
      setHouseType(data);
    } catch (error) {
      toast.error("Failed to load house type data!");
      navigate("/masters/administrative-masters/house-type");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHouseType = async () => {
    const result = await Swal.fire({
      title: "Delete House Type?",
      text: `Are you sure you want to delete "${houseType?.HOUSTYPE}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await HouseTypeApi.delete(id);
        toast.success(
          `House Type "${houseType?.HOUSTYPE}" deleted successfully!`,
        );
        navigate("/masters/administrative-masters/house-type");
      } catch (error) {
        toast.error(error.message || "Failed to delete house type");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (value) => {
    if (value == null || value == undefined) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const PrintReportContent = () => {
    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "12px",
        color: "#1f2937",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "6px 0",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      td: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textBold: { fontWeight: "600" },
      statusActive: { color: "#059669", fontWeight: "600" },
      statusInactive: { color: "#dc2626", fontWeight: "600" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* House Type Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>House Type Summary</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Details</th>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  House Type Name
                </td>
                <td style={styles.td}>{houseType?.HOUSTYPE || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>House Code</td>
                <td style={styles.td}>{houseType?.House_Code || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  House Type ID
                </td>
                <td style={styles.td}>{houseType?.HTY_Id || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Flat Rate</td>
                <td style={styles.td}>
                  {formatCurrency(houseType?.Flat_Rate)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Standard Rate
                </td>
                <td style={styles.td}>{formatCurrency(houseType?.Std_Rate)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Economic Rate
                </td>
                <td style={styles.td}>{formatCurrency(houseType?.Eco_Rate)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Market Rate
                </td>
                <td style={styles.td}>{formatCurrency(houseType?.Mkt_Rate)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Municipal Tax
                </td>
                <td style={styles.td}>{formatCurrency(houseType?.Muni_Tax)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(houseType?.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(houseType?.updated_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(houseType?.deleted_at
                      ? styles.statusInactive
                      : styles.statusActive),
                  }}
                >
                  {houseType?.deleted_at ? "Inactive" : "Active"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audit Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Audit Information</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Record Created</td>
                <td style={styles.td}>
                  {formatDateTime(houseType?.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(houseType?.updated_at)}
                </td>
              </tr>
              {houseType?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(houseType?.deleted_at)}
                  </td>
                  <td style={styles.td}>Report Generated</td>
                  <td style={styles.td}>
                    {new Date().toLocaleString("en-US")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Additional Information */}
        {houseType?.deleted_at && (
          <div style={styles.section}>
            <div style={{ ...styles.sectionTitle, borderLeftColor: "#dc2626" }}>
              Deletion Information
            </div>
            <div
              style={{
                padding: "10px",
                border: "1px solid #fecaca",
                borderRadius: "4px",
                backgroundColor: "#fef2f2",
                fontSize: "10px",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: "600" }}>Status:</span>
                <span style={{ color: "#dc2626", marginLeft: "8px" }}>
                  Deleted
                </span>
              </div>
              <div>
                <span style={{ fontWeight: "600" }}>Deleted Date:</span>
                <span style={{ marginLeft: "8px" }}>
                  {formatDateTime(houseType.deleted_at)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading house type details...</p>
        </div>
      </div>
    );
  }

  if (!houseType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            House Type Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The house type you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/administrative-masters/house-type")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to House Types
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="House Type Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <button
              onClick={() =>
                navigate("/masters/administrative-masters/house-type")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {houseType.HOUSTYPE}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>
          <Link
            to={`/masters/administrative-masters/house-type/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-sm">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    House Type Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the house type
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        House Type Name
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(houseType.HOUSTYPE)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      title="Copy house type name"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {houseType.HOUSTYPE}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        House Code
                      </span>
                    </div>
                    {houseType.House_Code && (
                      <button
                        onClick={() =>
                          handleCopyToClipboard(houseType.House_Code.toString())
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                        title="Copy house code"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {houseType.House_Code ? (
                      <div className="font-mono text-lg font-bold text-blue-600">
                        {houseType.House_Code}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No code assigned
                      </div>
                    )}
                  </div>
                </div>
                {/*                 
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Created Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(houseType.created_at)}
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Rate Cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      Flat Rate
                    </span>
                    <IndianRupee className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-blue-800">
                    {formatCurrency(houseType.Flat_Rate)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">
                      Standard Rate
                    </span>
                    <IndianRupee className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-xl font-bold text-green-800">
                    {formatCurrency(houseType.Std_Rate)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">
                      Economic Rate
                    </span>
                    <IndianRupee className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-xl font-bold text-purple-800">
                    {formatCurrency(houseType.Eco_Rate)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-700">
                      Market Rate
                    </span>
                    <IndianRupee className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-xl font-bold text-amber-800">
                    {formatCurrency(houseType.Mkt_Rate)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700">
                      Municipal Tax
                    </span>
                    <Wallet className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-xl font-bold text-red-800">
                    {formatCurrency(houseType.Muni_Tax)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Last Updated
                    </span>
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    {formatDateTime(houseType.updated_at)}
                  </div>
                </div>
              </div>

              {houseType.deleted_at && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Deleted Date
                    </span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-900">
                      {formatDateTime(houseType.deleted_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHouseType;
