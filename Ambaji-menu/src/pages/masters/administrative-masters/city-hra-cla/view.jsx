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
  Edit,
  Calendar,
  Clock,
  Copy,
  AlertCircle,
  Printer,
  Building2,
  IndianRupee,
  Home,
  Percent,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { CityHraClaApi } from "../../../services/cityhraclaapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewCityHra = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadRecordData();
  }, [id]);

  const loadRecordData = async () => {
    setLoading(true);
    try {
      const response = await CityHraClaApi.getById(id);
      setRecord(response.data);
    } catch (error) {
      toast.error("Failed to load city HRA/CLA data!");
      navigate("/masters/administrative-masters/city-hra-cla");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    const result = await Swal.fire({
      title: "Delete Record?",
      text: `Are you sure you want to delete HRA/CLA record for "${getCityGradeDisplay()}"? This action cannot be undone.`,
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
        await CityHraClaApi.delete(id);
        toast.success(`Record deleted successfully!`);
        navigate("/masters/administrative-masters/city-hra-cla");
      } catch (error) {
        toast.error(error.message || "Failed to delete record");
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
    if (value == null || value == undefined || value == 0) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCityGradeDisplay = () => {
    if (!record?.city_grade) return `City ID: ${record?.CGR_Id}`;
    const cg = record.city_grade;
    if (cg.City_Name && cg.Grade) {
      return `${cg.City_Name} (${cg.Grade})`;
    }
    if (cg.City_Name) return cg.City_Name;
    if (cg.Grade) return `Grade ${cg.Grade}`;
    return `City ID: ${cg.CGR_Id}`;
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
        {/* Record Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>City HRA/CLA Summary</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Record ID</td>
                <td style={styles.td}>{record?.CHC_Id || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>City Grade</td>
                <td style={styles.td}>{getCityGradeDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Basic From</td>
                <td style={styles.td}>{formatCurrency(record?.Basic_From)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Basic To</td>
                <td style={styles.td}>{formatCurrency(record?.Basic_To)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(record?.deleted_at
                      ? styles.statusInactive
                      : styles.statusActive),
                  }}
                >
                  {record?.deleted_at ? "Inactive" : "Active"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* HRA/CLA Values */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>HRA/CLA Values</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Parameter</th>
                <th style={styles.th}>Value (₹)</th>
                <th style={styles.th}>Parameter</th>
                <th style={styles.th}>Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>HRA 1</td>
                <td style={styles.td}>{formatCurrency(record?.HRA_1)}</td>
                <td style={styles.td}>CLA 1</td>
                <td style={styles.td}>{formatCurrency(record?.CLA_1)}</td>
              </tr>
              <tr>
                <td style={styles.td}>HRA Minimum</td>
                <td style={styles.td}>{formatCurrency(record?.HRA_Min)}</td>
                <td style={styles.td}>HRA UT24</td>
                <td style={styles.td}>{formatCurrency(record?.HRA_UT24)}</td>
              </tr>
              <tr>
                <td style={styles.td}>HRA UT49</td>
                <td style={styles.td}>{formatCurrency(record?.HRA_UT49)}</td>
                <td style={styles.td}>HRA AB49</td>
                <td style={styles.td}>{formatCurrency(record?.HRA_AB49)}</td>
              </tr>
              <tr>
                <td style={styles.td}>HRA 6th</td>
                <td style={styles.td}>{formatCurrency(record?.HRA_6th)}</td>
                <td style={styles.td}>HRA 7th</td>
                <td style={styles.td}>{formatCurrency(record?.HRA_7th)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* City Grade Details */}
        {record?.city_grade && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>City Grade Details</div>
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
                    City Name
                  </td>
                  <td style={styles.td}>
                    {record.city_grade.City_Name || "N/A"}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}>Grade</td>
                  <td style={styles.td}>{record.city_grade.Grade || "N/A"}</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    City Grade ID
                  </td>
                  <td style={styles.td} colSpan="3">
                    {record.city_grade.CGR_Id}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

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
                <td style={styles.td}>{formatDateTime(record?.created_at)}</td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(record?.updated_at)}</td>
              </tr>
              {record?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(record?.deleted_at)}
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading city HRA/CLA details...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Record Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The city HRA/CLA record you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/administrative-masters/city-hra-cla")
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
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
          title="City HRA/CLA Report"
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
                navigate("/masters/administrative-masters/city-hra-cla")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  City HRA/CLA Details
                </h1>
              </div>
              <p className="text-gray-600 mt-1">{getCityGradeDisplay()}</p>
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
            to={`/masters/administrative-masters/city-hra-cla/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    City grade and basic salary range
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        City Grade
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(getCityGradeDisplay())
                      }
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy city grade"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {getCityGradeDisplay()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <IndianRupee className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Basic Salary Range
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {record.Basic_From || record.Basic_To ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">From</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(record.Basic_From)}
                          </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                        <div className="text-right">
                          <span className="text-xs text-gray-500">To</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(record.Basic_To)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No range specified
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HRA/CLA Values */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-4 shadow-sm">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    HRA/CLA Values
                  </h2>
                  <p className="text-sm text-gray-600">
                    All values are in Indian Rupees (₹)
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HRA 1
                  </div>
                  <div className="text-xl font-bold text-purple-600">
                    {formatCurrency(record.HRA_1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    CLA 1
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(record.CLA_1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HRA Minimum
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(record.HRA_Min)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HRA UT24
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    {formatCurrency(record.HRA_UT24)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HRA UT49
                  </div>
                  <div className="text-xl font-bold text-indigo-600">
                    {formatCurrency(record.HRA_UT49)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HRA AB49
                  </div>
                  <div className="text-xl font-bold text-pink-600">
                    {formatCurrency(record.HRA_AB49)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HRA 6th
                  </div>
                  <div className="text-xl font-bold text-teal-600">
                    {formatCurrency(record.HRA_6th)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HRA 7th
                  </div>
                  <div className="text-xl font-bold text-cyan-600">
                    {formatCurrency(record.HRA_7th)}
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

export default ViewCityHra;
