// components/woff-pattern/view.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
  Printer,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { WoffPatternApi } from "../../../services/woffpatternapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewWoffPattern = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [woffPattern, setWoffPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadWoffPatternData();
  }, [id]);

  const loadWoffPatternData = async () => {
    setLoading(true);
    try {
      const data = await WoffPatternApi.getById(id);

      // Handle different API response structures
      let patternData = {
        id: data.pattern_id || data.WOP_id,
        name: data.pattern_name || data.WOP_name,
        code: data.pattern_code || data.WOP_code,
        days: data.days_array || data.pattern_data?.days || [],
        is_active:
          data.Is_Active != undefined ? data.Is_Active : data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setWoffPattern(patternData);
    } catch (error) {
      console.error("Error loading woff pattern:", error);
      toast.error("Failed to load woff pattern data!");
      navigate("/masters/leave-time-master/woff-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Woff Pattern?",
      text: `Are you sure you want to delete "${woffPattern?.name}"?`,
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
        await WoffPatternApi.delete(id);
        toast.success(`Woff pattern deleted successfully!`);
        navigate("/masters/leave-time-master/woff-master");
      } catch (error) {
        toast.error(error.message || "Failed to delete woff pattern");
      }
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
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    return status ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" /> Inactive
      </span>
    );
  };

  const PrintReportContent = () => {
    const patternDays = woffPattern?.days || [];
    const totalOffDays = patternDays.filter((d) => d == 1).length;

    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #8b5cf6",
        fontSize: "12px",
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
      patternCell: { textAlign: "center", padding: "4px", fontSize: "9px" },
      offCell: { backgroundColor: "#dcfce7", color: "#166534" },
      onCell: { backgroundColor: "#fee2e2", color: "#991b1b" },
    };

    return (
      <div style={{ fontSize: "11px" }}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Woff Pattern Details</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Code</td>
                <td style={styles.td}>{woffPattern?.code || "—"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Name</td>
                <td style={styles.td}>{woffPattern?.name}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>
                  {woffPattern?.is_active ? "Active" : "Inactive"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Total Off Days
                </td>
                <td style={styles.td}>{totalOffDays}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Created</td>
                <td style={styles.td}>
                  {formatDateTime(woffPattern?.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(woffPattern?.updated_at)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {patternDays.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Weekly Pattern (6 Weeks)</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Week</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <th key={day} style={styles.th}>
                        {day}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4, 5].map((week) => (
                  <tr key={week}>
                    <td style={styles.td}>Week {week + 1}</td>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const index = week * 7 + day;
                      const isOff = patternDays[index] == 1;
                      return (
                        <td
                          key={day}
                          style={{
                            ...styles.td,
                            ...styles.patternCell,
                            ...(isOff ? styles.offCell : styles.onCell),
                          }}
                        >
                          {isOff ? "OFF" : "ON"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading woff pattern details...</p>
      </div>
    );
  }

  if (!woffPattern) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Woff Pattern Not Found
        </h2>
        <button
          onClick={() => navigate("/masters/leave-time-master/woff-master")}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Woff Patterns
        </button>
      </div>
    );
  }

  const patternDays = woffPattern.days || [];
  const totalOffDays = patternDays.filter((d) => d == 1).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showPrint && (
        <PrintLayout
          title="Woff Pattern Details Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/leave-time-master/woff-master")}
            className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Woff Pattern Details
            </h1>
            <p className="text-sm text-gray-600">{woffPattern.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-sm font-medium"
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </button>
          <Link
            to={`/masters/leave-time-master/woff-master/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Woff Pattern Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Basic Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Basic Information
                  </h3>
                </div>
                <div className="space-y-2 pl-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Name:</span>{" "}
                    {woffPattern.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Code:</span>{" "}
                    {woffPattern.code || "—"}
                  </p>
                </div>
              </div>

              {/* Status Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Status Information
                  </h3>
                </div>
                <div className="space-y-2 pl-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-32">
                      Status:
                    </span>
                    {getStatusBadge(woffPattern.is_active)}
                  </div>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Total Off Days:
                    </span>{" "}
                    {totalOffDays}
                  </p>
                </div>
              </div>
            </div>

            {/* Pattern Grid Display */}
            {patternDays.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Weekly Pattern (6 Weeks)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-xs font-medium text-gray-500 bg-gray-100 border">
                          Week
                        </th>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => (
                            <th
                              key={day}
                              className="px-2 py-2 text-xs font-medium text-gray-700 bg-gray-100 border text-center"
                            >
                              {day}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2, 3, 4, 5].map((week) => (
                        <tr key={week}>
                          <td className="px-2 py-2 text-sm font-medium text-gray-600 bg-gray-50 border text-center">
                            Week {week + 1}
                          </td>
                          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                            const index = week * 7 + day;
                            const isOff = patternDays[index] == 1;
                            return (
                              <td
                                key={day}
                                className="px-2 py-2 border text-center"
                              >
                                <span
                                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium ${
                                    isOff
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {isOff ? "OFF" : "ON"}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="border rounded-lg p-4 bg-gray-50 mt-6">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Additional Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-600">Created:</span>{" "}
                  {formatDateTime(woffPattern.created_at)}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-600">
                    Last Updated:
                  </span>{" "}
                  {formatDateTime(woffPattern.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewWoffPattern;
