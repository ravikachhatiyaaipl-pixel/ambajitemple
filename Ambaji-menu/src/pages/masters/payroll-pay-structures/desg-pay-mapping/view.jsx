import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Edit,
  Calendar,
  Clock,
  Copy,
  AlertCircle,
  Printer,
  BadgeDollarSign,
  Scale,
  Layers,
  TrendingUp,
  Hash,
  Info,
  Trash2,
  Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DsgPayMapApi } from "../../../services/dsgpaymapapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewDsgPayMapping = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mapping, setMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadMappingData();
  }, [id]);

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const data = await DsgPayMapApi.getById(id);
      setMapping(data);
    } catch (error) {
      toast.error("Failed to load mapping data!");
      navigate("/masters/payroll-pay-structures/desg-pay-mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Mapping?",
      text: `Are you sure you want to delete mapping for "${mapping?.designation?.Dsg_Desc}"? This action cannot be undone.`,
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
        await DsgPayMapApi.delete(id);
        toast.success(`Mapping deleted successfully!`);
        navigate("/masters/payroll-pay-structures/desg-pay-mapping");
      } catch (error) {
        toast.error(error.message || "Failed to delete mapping");
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
    if (!value) return "—";
    return `₹${parseFloat(value).toLocaleString()}`;
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
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Designation Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Designation Information</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Mapping ID</td>
                <td style={styles.td}>#{mapping?.DPM_Id}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Designation
                </td>
                <td style={styles.td}>
                  {mapping?.designation?.Dsg_Desc || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Group Code</td>
                <td style={styles.td}>
                  {mapping?.designation?.GrCod || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pay Commission Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Pay Commission Details</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Pay Commission
                </td>
                <td style={styles.td}>
                  {mapping?.commission?.PC_Name || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Structure Type
                </td>
                <td style={styles.td}>
                  {mapping?.structure_type?.PST_Type || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pay Details */}
        {(mapping?.scale ||
          mapping?.band ||
          mapping?.grade ||
          mapping?.level) && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Pay Structure Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {mapping?.scale && (
                  <tr>
                    <td style={styles.td}>Pay Scale</td>
                    <td style={styles.td}>
                      {mapping.scale.Scl_Code} - ₹
                      {parseFloat(mapping.scale.St_Basic).toLocaleString()} to ₹
                      {parseFloat(mapping.scale.Max_Basic).toLocaleString()}
                    </td>
                  </tr>
                )}
                {mapping?.band && (
                  <tr>
                    <td style={styles.td}>Pay Band</td>
                    <td style={styles.td}>
                      {mapping.band.PB_Code} - ₹
                      {parseFloat(mapping.band.Min_Pay).toLocaleString()} to ₹
                      {parseFloat(mapping.band.Max_Pay).toLocaleString()}
                    </td>
                  </tr>
                )}
                {mapping?.grade && (
                  <tr>
                    <td style={styles.td}>Pay Grade</td>
                    <td style={styles.td}>
                      ₹{parseFloat(mapping.grade.GPay_Amount).toLocaleString()}
                    </td>
                  </tr>
                )}
                {mapping?.level && (
                  <tr>
                    <td style={styles.td}>Pay Level</td>
                    <td style={styles.td}>
                      {mapping.level.PL_Code} - ₹
                      {parseFloat(mapping.level.St_Basic).toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payroll Bill Details */}
        {mapping?.payroll_bill && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Payroll Bill Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Bill Code</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Ledger</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>{mapping.payroll_bill.PayBill_Code}</td>
                  <td style={styles.td}>
                    {mapping.payroll_bill.Description || "—"}
                  </td>
                  <td style={styles.td}>
                    {mapping.payroll_bill.ledger?.Lg_Name || "—"}
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
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Created</td>
                <td style={styles.td}>{formatDateTime(mapping?.created_at)}</td>
              </tr>
              <tr>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(mapping?.updated_at)}</td>
              </tr>
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mapping details...</p>
        </div>
      </div>
    );
  }

  if (!mapping) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Mapping Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The mapping you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/desg-pay-mapping")
            }
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mappings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          title="Designation Pay Mapping Report"
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
                navigate("/masters/payroll-pay-structures/desg-pay-mapping")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {mapping.designation?.Dsg_Desc || "Designation"}
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
            to={`/masters/payroll-pay-structures/desg-pay-mapping/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Designation Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-indigo-100">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-4 shadow-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Designation Information
                </h2>
                <p className="text-sm text-gray-600">
                  Basic designation details
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Designation
                  </span>
                  <button
                    onClick={() =>
                      handleCopyToClipboard(mapping.designation?.Dsg_Desc)
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {mapping.designation?.Dsg_Desc || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Commission Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-sm">
                <BadgeDollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pay Commission Details
                </h2>
                <p className="text-sm text-gray-600">
                  Commission and structure type information
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Pay Commission
                  </span>
                  <button
                    onClick={() =>
                      handleCopyToClipboard(mapping.commission?.PC_Name)
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {mapping.commission?.PC_Name || "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Structure Type
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg text-gray-900">
                    {mapping.structure_type?.PST_Type || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pay Scale */}
          {mapping.scale && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center">
                  <Scale className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Pay Scale</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Scale Code:</span>
                    <span className="text-sm font-medium">
                      {mapping.scale.Scl_Code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Starting Basic:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(mapping.scale.St_Basic)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Increment Amount:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(mapping.scale.Inc_Amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Increment Steps:
                    </span>
                    <span className="text-sm font-medium">
                      {mapping.scale.Inc_Steps}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Maximum Basic:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(mapping.scale.Max_Basic)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pay Band */}
          {mapping.band && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-amber-100">
                <div className="flex items-center">
                  <Layers className="h-5 w-5 text-amber-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Pay Band</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Band Code:</span>
                    <span className="text-sm font-medium">
                      {mapping.band.PB_Code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum Pay:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(mapping.band.Min_Pay)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum Pay:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(mapping.band.Max_Pay)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pay Grade */}
          {mapping.emp_grade && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Pay Grade</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Grade Name:</span>
                    <span className="text-sm font-medium">
                      {mapping.emp_grade.EGM_Name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Grade Code:</span>
                    <span className="text-sm font-medium">
                      {mapping.emp_grade.EGM_Code || "—"}
                    </span>
                  </div>
                  {mapping.emp_grade.pay_band && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Associated Pay Band:
                        </span>
                        <span className="text-sm font-medium">
                          {mapping.emp_grade.pay_band.PB_Code}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Band Range:
                        </span>
                        <span className="text-sm font-medium">
                          ₹
                          {parseFloat(
                            mapping.emp_grade.pay_band.Min_Pay
                          ).toLocaleString()}{" "}
                          - ₹
                          {parseFloat(
                            mapping.emp_grade.pay_band.Max_Pay
                          ).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pay Level */}
          {mapping.level && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-indigo-100">
                <div className="flex items-center">
                  <BadgeDollarSign className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Pay Level</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Level Code:</span>
                    <span className="text-sm font-medium">
                      {mapping.level.PL_Code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Starting Basic:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(mapping.level.St_Basic)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payroll Bill Card */}
        {mapping.payroll_bill && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payroll Bill Details
                  </h2>
                  <p className="text-sm text-gray-600">
                    Associated payroll bill information
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Bill Code
                    </span>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(mapping.payroll_bill.PayBill_Code)
                      }
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {mapping.payroll_bill.PayBill_Code}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Description
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-gray-900">
                      {mapping.payroll_bill.Description || "No Description"}
                    </div>
                  </div>
                </div>

                {mapping.payroll_bill.ledger && (
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Ledger
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-gray-900">
                        {mapping.payroll_bill.ledger.Lg_Name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Code: {mapping.payroll_bill.ledger.Lg_Code}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDsgPayMapping;
