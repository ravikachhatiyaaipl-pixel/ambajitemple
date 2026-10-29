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
  Calculator,
  Hash,
  Edit,
  Calendar,
  Clock,
  Copy,
  Percent,
  AlertCircle,
  Printer,
  DollarSign,
  TrendingUp,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DaRateApi } from "../../../services/daratemasterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewDaRate = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [daRate, setDaRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadDaRateData();
  }, [id]);

  const loadDaRateData = async () => {
    setLoading(true);
    try {
      const data = await DaRateApi.getById(id);
      setDaRate(data);
    } catch (error) {
      toast.error("Failed to load DA rate data!");
      navigate("/masters/payroll-pay-structures/da-hra-ta-rate-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDaRate = async () => {
    const result = await Swal.fire({
      title: "Delete DA Rate?",
      text: `Are you sure you want to delete DA Rate #${daRate?.DR_Sr}? This action cannot be undone.`,
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
        await DaRateApi.delete(id);
        toast.success(`DA Rate #${daRate?.DR_Sr} deleted successfully!`);
        navigate("/masters/payroll-pay-structures/da-hra-ta-rate-master");
      } catch (error) {
        toast.error(error.message || "Failed to delete DA rate");
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
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (value == null || value == undefined) return "—";
    return value.toString();
  };

  const formatPercentage = (value) => {
    if (value == null || value == undefined) return "—";
    return `${value}%`;
  };

  const PrintReportContent = () => {
    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #8b5cf6",
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
        {/* Basic Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Basic Information</div>
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
                  Serial Number
                </td>
                <td style={styles.td}>{daRate?.DR_Sr || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>DA Rate ID</td>
                <td style={styles.td}>{daRate?.DR_Id || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Pay Commission
                </td>
                <td style={styles.td}>
                  {daRate?.commission?.PC_Name || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(daRate?.deleted_at
                      ? styles.statusInactive
                      : styles.statusActive),
                  }}
                >
                  {daRate?.deleted_at ? "Inactive" : "Active"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Date Information */}
        <div style={styles.section}>
          <div style={{ ...styles.sectionTitle, borderLeftColor: "#EF5350" }}>
            Date Information
          </div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>From Date</td>
                <td style={styles.td}>{formatDate(daRate?.Fr_Date)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>To Date</td>
                <td style={styles.td}>{formatDate(daRate?.To_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Effective Date
                </td>
                <td style={styles.td} colSpan="3">
                  {formatDate(daRate?.Eff_Date)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DA Rate Information */}
        <div style={styles.section}>
          <div style={{ ...styles.sectionTitle, borderLeftColor: "#10b981" }}>
            DA Rate Information
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Value</th>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>DA Rate</td>
                <td style={styles.td}>{formatCurrency(daRate?.Da_Rate)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  DA Paid (%)
                </td>
                <td style={styles.td}>{formatPercentage(daRate?.Da_Paid)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  DA Difference (%)
                </td>
                <td style={styles.td}>{formatPercentage(daRate?.Da_Diff)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  NPA Rate (%)
                </td>
                <td style={styles.td}>{formatPercentage(daRate?.NPA_Rate)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>NPA Limit</td>
                <td style={styles.td}>{formatCurrency(daRate?.NPA_Limit)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>DA PF (%)</td>
                <td style={styles.td}>{formatPercentage(daRate?.DaPf)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Bonus Limit
                </td>
                <td style={styles.td}>{formatCurrency(daRate?.Bon_Limit)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  IR Rate (%)
                </td>
                <td style={styles.td}>{formatPercentage(daRate?.IR_Rate)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  DA Difference Months
                </td>
                <td style={styles.td}>{formatNumber(daRate?.Da_Diff_Mon)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  DA Difference Rate (%)
                </td>
                <td style={styles.td}>
                  {formatPercentage(daRate?.Da_Diff_Rate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audit Information */}
        <div style={styles.section}>
          <div style={{ ...styles.sectionTitle, borderLeftColor: "#6b7280" }}>
            Audit Information
          </div>
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
                <td style={styles.td}>{formatDateTime(daRate?.created_at)}</td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(daRate?.updated_at)}</td>
              </tr>
              {daRate?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(daRate?.deleted_at)}
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

        {/* Deletion Information */}
        {daRate?.deleted_at && (
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
                  {formatDateTime(daRate.deleted_at)}
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading DA rate details...</p>
        </div>
      </div>
    );
  }

  if (!daRate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            DA Rate Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The DA rate you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/da-hra-ta-rate-master")
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to DA Rates
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
          title="DA Rate Report"
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
                navigate(
                  "/masters/payroll-pay-structures/da-hra-ta-rate-master",
                )
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  DA Rate {daRate.DR_Sr}
                </h1>
                {daRate.commission && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Building className="h-3 w-3 mr-1" />
                    {daRate.commission.PC_Name}
                  </span>
                )}
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
            to={`/masters/payroll-pay-structures/da-hra-ta-rate-master/edit/${id}`}
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
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    General details of the DA rate
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Pay Commission
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {daRate.commission?.PC_Name || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-sm">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Date Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Validity and effective dates
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      From Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(daRate.Fr_Date)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      To Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(daRate.To_Date)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Effective Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(daRate.Eff_Date)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DA Rate Details Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-4 shadow-sm">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    DA Rate Details
                  </h2>
                  <p className="text-sm text-gray-600">
                    Comprehensive rate information
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      DA Rate
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(daRate.Da_Rate)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      DA Paid
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPercentage(daRate.Da_Paid)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      DA Difference
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPercentage(daRate.Da_Diff)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      NPA Rate
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPercentage(daRate.NPA_Rate)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      NPA Limit
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(daRate.NPA_Limit)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      DA PF
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPercentage(daRate.DaPf)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Bonus Limit
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(daRate.Bon_Limit)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      IR Rate
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPercentage(daRate.IR_Rate)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      DA Difference Months
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatNumber(daRate.Da_Diff_Mon)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      DA Difference Rate
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPercentage(daRate.Da_Diff_Rate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDaRate;
