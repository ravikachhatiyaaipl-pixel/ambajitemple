import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  Edit,
  Trash2,
  Clock,
  Copy,
  AlertCircle,
  Printer,
  CheckCircle2,
  XCircle,
  Hash,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { HolidayDesgMapApi } from "../../../services/holidaydesgmapapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewHolidayDesgMapping = ({ user }) => {
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
      const data = await HolidayDesgMapApi.getById(id);
      setMapping(data);
    } catch (error) {
      toast.error("Failed to load mapping data!");
      navigate("/masters/leave-time-master/holiday-desg-mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Mapping?",
      text: `Are you sure you want to delete this mapping?`,
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
        await HolidayDesgMapApi.delete(id);
        toast.success(`Mapping deleted successfully!`);
        navigate("/masters/leave-time-master/holiday-desg-mapping");
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch { return "Invalid Date"; }
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
    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: { backgroundColor: "#f3f4f6", padding: "6px 8px", margin: "8px 0", fontWeight: "600", borderLeft: "3px solid #8b5cf6", fontSize: "12px" },
      table: { width: "100%", borderCollapse: "collapse", margin: "6px 0", fontSize: "10px" },
      th: { backgroundColor: "#f1f5f9", fontWeight: "600", padding: "6px 8px", border: "1px solid #cbd5e0", textAlign: "left" },
      td: { padding: "5px 8px", border: "1px solid #e5e7eb", verticalAlign: "top" },
      textBold: { fontWeight: "600" },
    };
    return (
      <div style={{ fontSize: "11px" }}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Mapping Summary</div>
          <table style={styles.table}>
            <tbody>
              <tr><td style={{...styles.td, ...styles.textBold}}>Mapping ID</td><td style={styles.td}>{mapping?.HLDS_Id}</td><td style={{...styles.td, ...styles.textBold}}>Status</td><td style={styles.td}>{mapping?.HDS_Status ? "Active" : "Inactive"}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Holiday</td><td style={styles.td}>{mapping?.holiday_master?.HL_Name} ({mapping?.holiday_master?.HL_Date})</td><td style={{...styles.td, ...styles.textBold}}>Holiday Code</td><td style={styles.td}>{mapping?.holiday_master?.HL_Code || "—"}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Designation</td><td style={styles.td}>{mapping?.designation_master?.Dsg_Title}</td><td style={{...styles.td, ...styles.textBold}}>Desg. Description</td><td style={styles.td}>{mapping?.designation_master?.Dsg_EName || mapping?.designation_master?.Dsg_Desc || "—"}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Created</td><td style={styles.td}>{formatDateTime(mapping?.created_at)}</td><td style={{...styles.td, ...styles.textBold}}>Last Updated</td><td style={styles.td}>{formatDateTime(mapping?.updated_at)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading mapping details...</p>
      </div>
    );
  }

  if (!mapping) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Mapping Not Found</h2>
        <button onClick={() => navigate("/masters/leave-time-master/holiday-desg-mapping")} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Mappings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showPrint && (
        <PrintLayout title="Holiday Designation Mapping Report" showControls={true} onClose={() => setShowPrint(false)} organizationData={organization} orientation={printOrientation} onOrientationChange={setPrintOrientation}>
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
          <button onClick={() => navigate("/masters/leave-time-master/holiday-desg-mapping")} className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mapping Details</h1>
            <p className="text-sm text-gray-600">ID: #{mapping.HLDS_Id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPrint(true)} className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-sm font-medium">
            <Printer className="h-4 w-4 mr-2" /> Print
          </button>
          <Link to={`/masters/leave-time-master/holiday-desg-mapping/edit/${id}`} className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-sm font-medium">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Mapping Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Holiday Card */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Holiday Details</h3>
                </div>
                <div className="space-y-2 pl-2">
                  <p className="text-sm"><span className="font-medium text-gray-600">Name:</span> {mapping.holiday_master?.HL_Name}</p>
                  <p className="text-sm"><span className="font-medium text-gray-600">Code:</span> {mapping.holiday_master?.HL_Code || "—"}</p>
                  <p className="text-sm"><span className="font-medium text-gray-600">Date:</span> {new Date(mapping.holiday_master?.HL_Date).toLocaleDateString()}</p>
                  <p className="text-sm"><span className="font-medium text-gray-600">Year:</span> {mapping.holiday_master?.CI_Year}</p>
                </div>
              </div>
              {/* Designation Card */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Designation Details</h3>
                </div>
                <div className="space-y-2 pl-2">
                  <p className="text-sm"><span className="font-medium text-gray-600">Title:</span> {mapping.designation_master?.Dsg_Title}</p>
                  <p className="text-sm"><span className="font-medium text-gray-600">Description:</span> {mapping.designation_master?.Dsg_Desc || "—"}</p>
                  <p className="text-sm"><span className="font-medium text-gray-600">E Name:</span> {mapping.designation_master?.Dsg_EName || "—"}</p>
                  <p className="text-sm"><span className="font-medium text-gray-600">Group Sr No:</span> {mapping.designation_master?.GrSrn || "—"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Hash className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Mapping ID</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">#{mapping.HLDS_Id}</div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Status</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">{getStatusBadge(mapping.HDS_Status)}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Created</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">{formatDateTime(mapping.created_at)}</div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Last Updated</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">{formatDateTime(mapping.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHolidayDesgMapping;