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
  Edit,
  Calendar,
  Clock,
  Copy,
  Percent,
  AlertCircle,
  Printer,
  IndianRupee,
  Tag,
  Hash,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { TaxSlabApi } from "../../../services/taxslabmasterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const ViewTaxSlab = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taxSlab, setTaxSlab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const [financialYear, setFinancialYear] = useState(null);
  const { organization } = useOrganization();

  useEffect(() => {
    loadTaxSlabData();
  }, [id]);

  const loadTaxSlabData = async () => {
    setLoading(true);
    try {
      const response = await TaxSlabApi.getById(id);
      const data = response.data;
      setTaxSlab(data);

      // Load financial year details
      if (data.FY_ID) {
        const fyResponse = await axios.get(`${API_BASE_URL}/fy-master`,
            {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const fy = (fyResponse.data.data || []).find(
          (f) => f.FY_Id == data.FY_ID,
        );
        setFinancialYear(fy);
      }
    } catch (error) {
      toast.error("Failed to load tax slab data!");
      navigate("/masters/administrative-masters/tax-slab");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTaxSlab = async () => {
    const result = await Swal.fire({
      title: "Delete Tax Slab?",
      text: `Are you sure you want to delete ${taxSlab?.Tax_Name || "tax"} slab (${formatCurrency(taxSlab?.From_Amt)} - ${formatCurrency(taxSlab?.To_Amt)})? This action cannot be undone.`,
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
        await TaxSlabApi.delete(id);
        toast.success(`Tax slab deleted successfully!`);
        navigate("/masters/administrative-masters/tax-slab");
      } catch (error) {
        toast.error(error.message || "Failed to delete tax slab");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text && text !=  "—" && text !=  "Not set") {
      navigator.clipboard.writeText(text.toString());
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

  const formatPercentage = (value) => {
    if (value == null || value == undefined || value == "0.00" || value == 0) return "—";
    return `${value}%`;
  };

  const getFinancialYearDisplay = () => {
    if (!financialYear) return `FY ${taxSlab?.FY_ID}`;
    return (
      financialYear.FY_Name || financialYear.FY_Code || `FY ${taxSlab?.FY_ID}`
    );
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
        {/* Tax Slab Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Tax Slab Summary</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Tax Slab ID</td>
                <td style={styles.td}>{taxSlab?.TSL_Id || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Tax Name</td>
                <td style={styles.td}>{taxSlab?.Tax_Name || "Not set"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Tax Code</td>
                <td style={styles.td}>{taxSlab?.Code || "—"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Financial Year</td>
                <td style={styles.td}>{getFinancialYearDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>From Amount</td>
                <td style={styles.td}>{formatCurrency(taxSlab?.From_Amt)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>To Amount</td>
                <td style={styles.td}>{formatCurrency(taxSlab?.To_Amt)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Tax Rate</td>
                <td style={styles.td}>{formatPercentage(taxSlab?.TaxRate)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Standard Deduction</td>
                <td style={styles.td}>{formatCurrency(taxSlab?.Stand_Deduc)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Cess</td>
                <td style={styles.td}>{formatPercentage(taxSlab?.Cess)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Cess Amount</td>
                <td style={styles.td}>{formatCurrency(taxSlab?.Cess_Amount)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={{
                  ...styles.td,
                  ...(taxSlab?.deleted_at ? styles.statusInactive : styles.statusActive),
                }}>
                  {taxSlab?.deleted_at ? "Inactive" : "Active"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Created Date</td>
                <td style={styles.td}>{formatDateTime(taxSlab?.created_at)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(taxSlab?.updated_at)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Report Generated</td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Year Details */}
        {financialYear && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Financial Year Details</div>
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
                  <td style={{ ...styles.td, ...styles.textBold }}>FY Name</td>
                  <td style={styles.td}>{financialYear.FY_Name || "N/A"}</td>
                  <td style={{ ...styles.td, ...styles.textBold }}>FY Code</td>
                  <td style={styles.td}>{financialYear.FY_Code || "N/A"}</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>Start Date</td>
                  <td style={styles.td}>{formatDate(financialYear.St_Date)}</td>
                  <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                  <td style={styles.td}>{formatDate(financialYear.Ed_Date)}</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                  <td style={styles.td} colSpan="3">
                    <span style={financialYear.Status == "ACTIVE" ? styles.statusActive : styles.statusInactive}>
                      {financialYear.Status || "N/A"}
                    </span>
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
                <td style={styles.td}>{formatDateTime(taxSlab?.created_at)}</td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(taxSlab?.updated_at)}</td>
              </tr>
              {taxSlab?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>{formatDateTime(taxSlab?.deleted_at)}</td>
                  <td style={styles.td}>Report Generated</td>
                  <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Deletion Information */}
        {taxSlab?.deleted_at && (
          <div style={styles.section}>
            <div style={{ ...styles.sectionTitle, borderLeftColor: "#dc2626" }}>
              Deletion Information
            </div>
            <div style={{
              padding: "10px",
              border: "1px solid #fecaca",
              borderRadius: "4px",
              backgroundColor: "#fef2f2",
              fontSize: "10px",
            }}>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: "600" }}>Status:</span>
                <span style={{ color: "#dc2626", marginLeft: "8px" }}>Deleted</span>
              </div>
              <div>
                <span style={{ fontWeight: "600" }}>Deleted Date:</span>
                <span style={{ marginLeft: "8px" }}>{formatDateTime(taxSlab.deleted_at)}</span>
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
          <p className="mt-4 text-gray-600">Loading tax slab details...</p>
        </div>
      </div>
    );
  }

  if (!taxSlab) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tax Slab Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The tax slab you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/masters/administrative-masters/tax-slab")}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tax Slabs
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
          title="Tax Slab Report"
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
              onClick={() => navigate("/masters/administrative-masters/tax-slab")}
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  Tax Slab Details
                </h1>
                {/* {taxSlab.Code && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Hash className="h-3 w-3 mr-1" />
                    {taxSlab.Code}
                  </span>
                )} */}
              </div>
              <p className="text-gray-600 mt-1">
                {taxSlab.Tax_Name ? `${taxSlab.Tax_Name} - ` : ""}
                {formatCurrency(taxSlab.From_Amt)} - {formatCurrency(taxSlab.To_Amt)} @ {formatPercentage(taxSlab.TaxRate)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <Link
            to={`/masters/administrative-masters/tax-slab/edit/${id}`}
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
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tax Slab Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the tax slab
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tax Name */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Tax Name
                      </span>
                    </div>
                    {taxSlab.Tax_Name && (
                      <button
                        onClick={() => handleCopyToClipboard(taxSlab.Tax_Name)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy tax name"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {taxSlab.Tax_Name || <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  </div>
                </div>

                {/* Tax Code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Tax Code
                      </span>
                    </div>
                    {taxSlab.Code && (
                      <button
                        onClick={() => handleCopyToClipboard(taxSlab.Code)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy tax code"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {taxSlab.Code || <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  </div>
                </div>

                {/* Financial Year */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Financial Year
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(getFinancialYearDisplay())}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy financial year"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {getFinancialYearDisplay()}
                    </div>
                    {financialYear && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(financialYear.St_Date)} - {formatDate(financialYear.Ed_Date)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount Range */}
                <div>
                  <div className="flex items-center mb-2">
                    <IndianRupee className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Amount Range
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500">From</span>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(taxSlab.From_Amt)}
                        </div>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                      <div className="text-right">
                        <span className="text-xs text-gray-500">To</span>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(taxSlab.To_Amt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Tax Rate
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(taxSlab.TaxRate?.toString())}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy tax rate"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-bold text-purple-600">
                      {formatPercentage(taxSlab.TaxRate)}
                    </div>
                  </div>
                </div>

                {/* Standard Deduction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Standard Deduction
                      </span>
                    </div>
                    {taxSlab.Stand_Deduc > 0 && (
                      <button
                        onClick={() => handleCopyToClipboard(taxSlab.Stand_Deduc?.toString())}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy standard deduction"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {taxSlab.Stand_Deduc > 0 ? formatCurrency(taxSlab.Stand_Deduc) : 
                        <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  </div>
                </div>

                {/* Cess */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Cess
                      </span>
                    </div>
                    {taxSlab.Cess > 0 && (
                      <button
                        onClick={() => handleCopyToClipboard(taxSlab.Cess?.toString())}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy cess"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-bold text-purple-600">
                      {taxSlab.Cess > 0 ? formatPercentage(taxSlab.Cess) : 
                        <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  </div>
                </div>

                {/* Cess Amount */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Cess Amount
                      </span>
                    </div>
                    {taxSlab.Cess_Amount > 0 && (
                      <button
                        onClick={() => handleCopyToClipboard(taxSlab.Cess_Amount?.toString())}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy cess amount"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {taxSlab.Cess_Amount > 0 ? formatCurrency(taxSlab.Cess_Amount) : 
                        <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Created Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(taxSlab.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Last Updated
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(taxSlab.updated_at)}
                    </div>
                  </div>
                </div>
              </div>

              {taxSlab.deleted_at && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Deleted Date
                    </span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-900">
                      {formatDateTime(taxSlab.deleted_at)}
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

export default ViewTaxSlab;