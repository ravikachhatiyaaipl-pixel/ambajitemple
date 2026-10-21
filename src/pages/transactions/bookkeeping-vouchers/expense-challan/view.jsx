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
  Edit,
  Trash2,
  Clock,
  Printer,
  AlertCircle,
  Building,
  Layers,
  Hash,
  DollarSign,
  FileText,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";
import { ChallanVoucherApi } from "../../../services/challanvoucherapi";

const ViewExpenseChallanVoucher = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadVoucherData();
  }, [id]);

  const loadVoucherData = async () => {
    setLoading(true);
    try {
      const response = await ChallanVoucherApi.getById(id);
      console.log("Loaded challan voucher response:", response);

      // Extract voucher data from the response structure
      const voucherData =
        response.data && response.data[0] ? response.data[0] : response.data;
      setVoucher(voucherData);
    } catch (error) {
      console.error("Error loading challan voucher:", error);
      toast.error(
        error.response?.data?.message || "Failed to load challan voucher data!",
      );
      navigate("/transactions/bookkeeping-vouchers/expense-challan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = async () => {
    const result = await Swal.fire({
      title: "Delete Challan Voucher?",
      text: `Are you sure you want to delete voucher "${voucher?.CV_No}"? This action cannot be undone.`,
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
      await ChallanVoucherApi.delete(id);
      toast.success(`Voucher "${voucher?.CV_No}" deleted successfully!`);
      navigate("/transactions/bookkeeping-vouchers/expense-challan");
    } catch (error) {
      console.error("Error deleting challan voucher:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete challan voucher",
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
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
    if (!amount && amount != 0) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get branch display text
  const getBranchDisplay = () => {
    if (!voucher?.department) return "N/A";

    const dept = voucher.department;
    let displayText = dept.Dpt_Desc || "";

    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }

    return displayText;
  };

  // Get budget head display text
  const getBudgetHeadDisplay = () => {
    if (!voucher?.budget_head) return "N/A";

    const head = voucher.budget_head;
    return head.Gr_Nm || "N/A";
  };

  // Get ledger display text
  const getLedgerDisplay = () => {
    if (!voucher?.ledger) return "N/A";

    const ledger = voucher.ledger;
    let displayText = ledger.Lg_Name || "";

    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      displayText += ` (${ledger.Lg_Eng_Name})`;
    }

    if (ledger.Lg_Code) {
      displayText += ` - ${ledger.Lg_Code}`;
    }

    return displayText;
  };

  // Calculate total amount - FIXED: Use details array
  const getTotalAmount = () => {
    if (!voucher?.details || !Array.isArray(voucher.details)) return 0;
    return voucher.details.reduce(
      (sum, detail) => sum + (parseFloat(detail.Amount) || 0),
      0,
    );
  };

  // Print Report Content Component - FIXED: Use correct field names and add End Date
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
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Voucher Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Voucher Information</div>
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
                  Voucher No.
                </td>
                <td style={styles.td}>{voucher?.CV_No}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Start Date</td>
                <td style={styles.td}>{formatDate(voucher?.Ch_Start_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                <td style={styles.td}>{formatDate(voucher?.Ch_End_Date)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Head
                </td>
                <td style={styles.td}>{getBudgetHeadDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
                <td style={styles.td}>{getBranchDisplay()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Ledger Account
                </td>
                <td style={styles.td}>{getLedgerDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Created At</td>
                <td style={styles.td}>{formatDateTime(voucher?.created_at)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Updated At</td>
                <td style={styles.td}>{formatDateTime(voucher?.updated_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Challan Details - FIXED: Use Payment_Mode and SL_Name fields */}
        {voucher?.details && voucher.details.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Challan Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr. No.</th>
                  <th style={styles.th}>Vendor</th>
                  <th style={styles.th}>Payment Mode</th>
                  <th style={styles.th}>Amount (₹)</th>
                  <th style={styles.th}>File No.</th>
                  <th style={styles.th}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {voucher.details.map((detail, index) => (
                  <tr key={index}>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {detail.CV_Sr}
                    </td>
                    <td style={styles.td}>
                      {detail.SL_Name || detail.sub_ledger?.SL_Name || "—"}
                      {detail.SL_Id && (
                        <div style={{ fontSize: "9px", color: "#6b7280" }}>
                          ID: {detail.SL_Id}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          backgroundColor:
                            detail.Payment_Mode == "Cash"
                              ? "#dcfce7"
                              : "#FFCDD2",
                          color:
                            detail.Payment_Mode == "Cash"
                              ? "#166534"
                              : "#B71C1C",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: "600",
                        }}
                      >
                        {detail.Payment_Mode}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {formatCurrency(detail.Amount)}
                    </td>
                    <td style={styles.td}>{detail.FileNo || "—"}</td>
                    <td style={styles.td}>{detail.Remarks || "—"}</td>
                  </tr>
                ))}
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      ...styles.td,
                      textAlign: "right",
                      fontWeight: "600",
                    }}
                  >
                    Total:
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: "right",
                      fontWeight: "600",
                    }}
                  >
                    {formatCurrency(getTotalAmount())}
                  </td>
                  <td colSpan="2" style={styles.td}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Deletion Information */}
        {voucher?.deleted_at && (
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
                  {formatDateTime(voucher.deleted_at)}
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
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading Expense challan voucher details...
        </p>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Challan Voucher Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The challan voucher with ID #{id} does not exist or has been
            removed.
          </p>
          <Link
            to="/transactions/bookkeeping-vouchers/expense-challan"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vouchers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Challan Voucher Report"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate("/transactions/bookkeeping-vouchers/expense-challan")
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Challan Voucher Details
              </h1>
              <p className="text-gray-600 mt-1">Voucher #{voucher.CV_No}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrint(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>
          <Link
            to={`/transactions/bookkeeping-vouchers/expense-challan/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Voucher Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Voucher Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Voucher Number */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Voucher Number
                  </label>
                  <div className="mt-1 flex items-center">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {voucher.CV_No}
                    </span>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Start Date
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {formatDate(voucher.Ch_Start_Date)}
                    </span>
                  </div>
                </div>

                {/* End Date - NEW FIELD */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    End Date
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {formatDate(voucher.Ch_End_Date)}
                    </span>
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Branch
                  </label>
                  <div className="mt-1 flex items-start">
                    <Building className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900">{getBranchDisplay()}</span>
                  </div>
                </div>

                {/* Budget Head */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Budget Head
                  </label>
                  <div className="mt-1 flex items-start">
                    <Layers className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900">
                      {getBudgetHeadDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Ledger Account */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ledger Account
                  </label>
                  <div className="mt-1 flex items-start">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900">{getLedgerDisplay()}</span>
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Total Amount
                  </label>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(getTotalAmount())}
                    </span>
                  </div>
                </div>

                {/* Created At */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created At
                  </label>
                  <div className="mt-1 flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {formatDateTime(voucher.created_at)}
                    </span>
                  </div>
                </div>

                {/* Updated At */}
                {voucher.updated_at &&
                  voucher.updated_at != voucher.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </label>
                      <div className="mt-1 flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {formatDateTime(voucher.updated_at)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Challan Details Card - FIXED: Use correct field names */}
        {voucher.details && voucher.details.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Challan Details ({voucher.details.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Mode
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount (₹)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {voucher.details.map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {detail.CV_Sr}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {detail.SL_Name ||
                              detail.sub_ledger?.SL_Name ||
                              "—"}
                          </div>
                          {detail.SL_Id && (
                            <div className="text-xs text-gray-500">
                              ID: {detail.SL_Id}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              detail.Payment_Mode == "Cash"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {detail.Payment_Mode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(detail.Amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {detail.FileNo || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {detail.Remarks || "—"}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-medium">
                      <td
                        colSpan="3"
                        className="px-4 py-3 text-right text-sm text-gray-900"
                      >
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                        {formatCurrency(getTotalAmount())}
                      </td>
                      <td colSpan="2" className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExpenseChallanVoucher;
