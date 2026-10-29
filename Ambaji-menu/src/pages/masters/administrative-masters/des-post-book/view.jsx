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
  Briefcase,
  Info,
  Trash2,
  Hash,
  Layers,
  Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DesPostBookApi } from "../../../services/despostbookapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewDesPostBook = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadEntryData();
  }, [id]);

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const data = await DesPostBookApi.getById(id);
      setEntry(data);
    } catch (error) {
      toast.error("Failed to load entry data!");
      navigate("/masters/administrative-masters/des-post-book");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Entry?",
      text: `Are you sure you want to delete entry for "${entry?.designation?.Dsg_Desc}"? This action cannot be undone.`,
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
        await DesPostBookApi.delete(id);
        toast.success(`Entry deleted successfully!`);
        navigate("/masters/administrative-masters/des-post-book");
      } catch (error) {
        toast.error(error.message || "Failed to delete entry");
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

  const formatNumber = (value) => {
    if (!value && value != 0) return "—";
    return parseFloat(value).toFixed(2);
  };

  const PrintReportContent = () => {
    const totalPosts =
      (parseFloat(entry?.Perm_Post) || 0) + (parseFloat(entry?.Temp_Post) || 0);

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
                <td style={{ ...styles.td, ...styles.textBold }}>Entry ID</td>
                <td style={styles.td}>#{entry?.Dpb_id}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Designation
                </td>
                <td style={styles.td}>
                  {entry?.designation?.Dsg_Desc || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Group Code</td>
                <td style={styles.td}>{entry?.designation?.GrCod || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Level</td>
                <td style={styles.td}>{entry?.designation?.GrStt || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Post Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Post Details</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Permanent Posts</td>
                <td style={styles.td}>{formatNumber(entry?.Perm_Post)}</td>
              </tr>
              <tr>
                <td style={styles.td}>Temporary Posts</td>
                <td style={styles.td}>{formatNumber(entry?.Temp_Post)}</td>
              </tr>
              <tr>
                <td style={styles.td}>Total Posts</td>
                <td
                  style={{ ...styles.td, fontWeight: "bold", color: "#8b5cf6" }}
                >
                  {totalPosts.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={styles.td}>Date</td>
                <td style={styles.td}>{formatDate(entry?.Date)}</td>
              </tr>
              <tr>
                <td style={styles.td}>NOC-Reg</td>
                <td style={styles.td}>
                  {entry?.Noc_Reg == "Y" ? "Yes (Y)" : "No (N)"}
                </td>
              </tr>
              <tr>
                <td style={styles.td}>Excepted Age</td>
                <td style={styles.td}>
                  {entry?.Excepted_Age_Min != null ||
                  entry?.Excepted_Age_Max != null
                    ? `${entry?.Excepted_Age_Min ?? "—"} – ${
                        entry?.Excepted_Age_Max ?? "—"
                      }`
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td style={styles.td}>Periodic Renewal</td>
                <td style={styles.td}>
                  {entry?.Periodic_Renewal != null
                    ? entry.Periodic_Renewal == 99
                      ? "99 years (no periodic renewal)"
                      : `${entry.Periodic_Renewal} years`
                    : "N/A"}
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
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Created</td>
                <td style={styles.td}>{formatDateTime(entry?.created_at)}</td>
              </tr>
              <tr>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(entry?.updated_at)}</td>
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
          <p className="mt-4 text-gray-600">Loading entry details...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Entry Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The entry you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/administrative-masters/des-post-book")
            }
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Entries
          </button>
        </div>
      </div>
    );
  }

  const totalPosts =
    (parseFloat(entry.Perm_Post) || 0) + (parseFloat(entry.Temp_Post) || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          title="Designation Post Book Report"
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
                navigate("/masters/administrative-masters/des-post-book")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {entry.designation?.Dsg_Desc || "Designation"} Post Book Entry
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
            to={`/masters/administrative-masters/des-post-book/edit/${id}`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Designation
                  </span>
                  <button
                    onClick={() =>
                      handleCopyToClipboard(entry.designation?.Dsg_Desc)
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {entry.designation?.Dsg_Desc || "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Group Code
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg text-gray-900">
                    {entry.designation?.GrCod || "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Level
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg text-gray-900">
                    {entry.designation?.GrStt || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Details Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-4 shadow-sm">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Post Details
                </h2>
                <p className="text-sm text-gray-600">
                  Permanent, temporary and total post information
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Permanent Posts
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(entry.Perm_Post)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(entry.Perm_Post)}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Temporary Posts
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(entry.Temp_Post)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(entry.Temp_Post)}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    <Layers className="h-3 w-3 inline mr-1" />
                    Total Posts
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(totalPosts.toString())}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-lg font-bold text-purple-700">
                    {totalPosts.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Date
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(entry.Date)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(entry.Date)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Rules Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-amber-100">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mr-4 shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  NOC, Age & Renewal
                </h2>
                <p className="text-sm text-gray-600">
                  Registration, excepted age range and periodic renewal
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    NOC-Reg
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                      entry.Noc_Reg == "Y"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {entry.Noc_Reg == "Y" ? "Yes (Y)" : "No (N)"}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Excepted Age Min
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {entry.Excepted_Age_Min != null
                      ? entry.Excepted_Age_Min
                      : "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Excepted Age Max
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {entry.Excepted_Age_Max != null
                      ? entry.Excepted_Age_Max
                      : "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Periodic Renewal
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {entry.Periodic_Renewal != null
                      ? entry.Periodic_Renewal == 99
                        ? "99 (None)"
                        : `${entry.Periodic_Renewal} years`
                      : "—"}
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

export default ViewDesPostBook;
