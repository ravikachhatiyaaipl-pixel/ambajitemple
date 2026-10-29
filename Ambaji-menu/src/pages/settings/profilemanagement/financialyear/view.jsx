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
  Calendar,
  Hash,
  CheckCircle,
  Edit,
  Clock,
  Lock,
  Unlock,
  DollarSign,
  Copy,
  Info,
  ChevronRight,
  Printer,
  AlertCircle,
  XCircle,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { FinancialYearApi } from "../../../services/financialyearapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewFinancialYear = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [financialYear, setFinancialYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingCurrent, setSettingCurrent] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const [pageTitle, setPageTitle] = useState("Financial Year Management");
  const { organization } = useOrganization();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/profile-management/financial-year-master";
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
    loadFinancialYearData();
  }, [id]);

  const loadFinancialYearData = async () => {
    setLoading(true);
    try {
      const data = await FinancialYearApi.getById(id);
      setFinancialYear(data);
    } catch (error) {
      toast.error("Failed to load financial year data!");
      navigate("/settings/profile-management/financial-year-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async () => {
    const result = await Swal.fire({
      title: "Delete Financial Year?",
      text: `Are you sure you want to delete "${financialYear?.FY_Code}"? This action cannot be undone.`,
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
        await FinancialYearApi.delete(id);
        toast.success(
          `Financial year "${financialYear?.FY_Code}" deleted successfully!`,
        );
        navigate("/settings/profile-management/financial-year-master");
      } catch (error) {
        toast.error(error.message || "Failed to delete financial year");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      case "LOCKED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      statusBadge: {
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "9px",
        fontWeight: "600",
      },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Financial Year Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Financial Year Summary</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Year Code</td>
                <td style={styles.td}>{financialYear?.FY_Code || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Year ID</td>
                <td style={styles.td}>{financialYear?.FY_Id || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Year Name</td>
                <td style={styles.td}>{financialYear?.FY_Name || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        financialYear?.Status == "ACTIVE"
                          ? "#d1fae5"
                          : financialYear?.Status == "LOCKED"
                            ? "#fee2e2"
                            : "#f3f4f6",
                      color:
                        financialYear?.Status == "ACTIVE"
                          ? "#059669"
                          : financialYear?.Status == "LOCKED"
                            ? "#dc2626"
                            : "#6b7280",
                    }}
                  >
                    {financialYear?.Status || "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Start Date</td>
                <td style={styles.td}>{formatDate(financialYear?.St_Date)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                <td style={styles.td}>{formatDate(financialYear?.Ed_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Current Year
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: financialYear?.is_current_year
                        ? "#fef3c7"
                        : "#f3f4f6",
                      color: financialYear?.is_current_year
                        ? "#d97706"
                        : "#6b7280",
                    }}
                  >
                    {financialYear?.is_current_year ? "Yes" : "No"}
                  </span>
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Status
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: financialYear?.is_budget_open
                        ? "#d1fae5"
                        : "#fee2e2",
                      color: financialYear?.is_budget_open
                        ? "#059669"
                        : "#dc2626",
                    }}
                  >
                    {financialYear?.is_budget_open ? "Open" : "Closed"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Transaction Status
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: financialYear?.is_transaction_open
                        ? "#d1fae5"
                        : "#fee2e2",
                      color: financialYear?.is_transaction_open
                        ? "#059669"
                        : "#dc2626",
                    }}
                  >
                    {financialYear?.is_transaction_open ? "Open" : "Closed"}
                  </span>
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Year Relationships */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Year Relationships</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Relationship</th>
                <th style={styles.th}>Year Code</th>
                <th style={styles.th}>Year Name</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Previous Year
                </td>
                <td style={styles.td}>
                  {financialYear?.previous_year?.FY_Code || "N/A"}
                </td>
                <td style={styles.td}>
                  {financialYear?.previous_year?.FY_Name || "N/A"}
                </td>
                <td style={styles.td}>
                  {financialYear?.previous_year?.Status || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Next Year</td>
                <td style={styles.td}>
                  {financialYear?.next_year?.FY_Code || "N/A"}
                </td>
                <td style={styles.td}>
                  {financialYear?.next_year?.FY_Name || "N/A"}
                </td>
                <td style={styles.td}>
                  {financialYear?.next_year?.Status || "N/A"}
                </td>
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
                <td style={styles.td}>Created Date</td>
                <td style={styles.td}>
                  {formatDateTime(financialYear?.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(financialYear?.updated_at)}
                </td>
              </tr>
              <tr>
                <td style={styles.td}>Days Active</td>
                <td style={styles.td}>
                  {(() => {
                    if (!financialYear?.created_at) return "N/A";
                    const createdDate = new Date(financialYear.created_at);
                    const today = new Date();
                    const diffTime = Math.abs(today - createdDate);
                    return (
                      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + " days"
                    );
                  })()}
                </td>
                <td style={styles.td}>Report Generated</td>
                <td style={styles.td}>{new Date().toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remarks (if available) */}
        {financialYear?.Remarks && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Remarks</div>
            <div
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "8px",
                borderRadius: "4px",
                fontSize: "10px",
              }}
            >
              {financialYear.Remarks}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading financial year details...</p>
      </div>
    );
  }

  if (!financialYear) {
    return (
      <div className="p-12 text-center">
        <div className="text-red-600 mb-4">
          <Calendar className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Financial Year Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The financial year you're looking for doesn't exist or has been
          removed.
        </p>
        <button
          onClick={() =>
            navigate("/settings/profile-management/financial-year-master")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Financial Years
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Financial Year Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/settings/profile-management/financial-year-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {financialYear.FY_Code}
              {financialYear.FY_Name && ` - ${financialYear.FY_Name}`}
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrint(true)}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors"
            title="Print Report"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>

          <Link
            to={`/settings/profile-management/financial-year-master/edit/${id}`}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center transition-all shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Current Year Banner */}
      {financialYear.is_current_year && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">
                Current Financial Year
              </h3>
              <p className="text-sm text-yellow-800">
                This is the currently active financial year for budgeting and
                accounting
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-4">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Financial Year Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Basic details and period information
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Financial Year Code
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(financialYear.FY_Code)
                      }
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      title="Copy year code"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="font-mono text-lg font-bold text-blue-600">
                      {financialYear.FY_Code}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Start Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(financialYear.St_Date)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      End Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(financialYear.Ed_Date)}
                    </div>
                  </div>
                </div>

                {financialYear.FY_Name && (
                  <div>
                    <div className="flex items-center mb-2">
                      <Info className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Year Name
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-lg font-semibold text-gray-900">
                        {financialYear.FY_Name}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(financialYear.Status)}`}
                    >
                      {financialYear.Status == "ACTIVE" && (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      {financialYear.Status == "LOCKED" && (
                        <Lock className="h-4 w-4 mr-1" />
                      )}
                      {financialYear.Status == "CLOSED" && (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      {financialYear.Status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Year Relationships Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Year Relationships
              </h2>
              <p className="text-sm text-gray-600">
                Connections with previous and next financial years
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Previous Year */}
                <div>
                  <div className="flex items-center mb-2">
                    <ArrowLeft className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Previous Financial Year
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {financialYear.previous_year ? (
                      <div>
                        <div className="font-medium text-blue-600">
                          {financialYear.previous_year.FY_Code}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {financialYear.previous_year.FY_Name || "No name"}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No previous year defined
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Year */}
                <div>
                  <div className="flex items-center mb-2">
                    <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Next Financial Year
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {financialYear.next_year ? (
                      <div>
                        <div className="font-medium text-green-600">
                          {financialYear.next_year.FY_Code}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {financialYear.next_year.FY_Name || "No name"}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No next year defined
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings & Remarks Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Settings & Remarks
              </h2>
              <p className="text-sm text-gray-600">
                Operational settings and additional information
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Current Year Status
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {financialYear.is_current_year ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Current Year
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        <Clock className="h-4 w-4 mr-1" />
                        Not Current
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Budget Status
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {financialYear.is_budget_open ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Unlock className="h-4 w-4 mr-1" />
                        Budget Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <Lock className="h-4 w-4 mr-1" />
                        Budget Closed
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Transaction Status
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {financialYear.is_transaction_open ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Unlock className="h-4 w-4 mr-1" />
                        Transactions Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <Lock className="h-4 w-4 mr-1" />
                        Transactions Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {financialYear.Remarks && (
                <div>
                  <div className="flex items-center mb-2">
                    <Info className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Remarks
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-gray-700">{financialYear.Remarks}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Year Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Year Summary
                </h3>
                <div className="text-xs text-blue-800 space-y-2">
                  <div>
                    <span className="font-medium">Year Code:</span>{" "}
                    {financialYear.FY_Code}
                  </div>
                  <div>
                    <span className="font-medium">Period:</span>{" "}
                    {formatDate(financialYear.St_Date)} -{" "}
                    {formatDate(financialYear.Ed_Date)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {financialYear.Status}
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span>{" "}
                    {financialYear.is_budget_open ? "Open" : "Closed"}
                  </div>
                  <div>
                    <span className="font-medium">Transactions:</span>{" "}
                    {financialYear.is_transaction_open ? "Open" : "Closed"}
                  </div>
                  {financialYear.is_current_year && (
                    <div className="font-medium text-yellow-700">
                      Currently Active Year
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Information Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Audit Information
                </h3>
                <div className="text-xs text-gray-700 space-y-2">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {formatDate(financialYear.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {formatDate(financialYear.updated_at)}
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

export default ViewFinancialYear;
