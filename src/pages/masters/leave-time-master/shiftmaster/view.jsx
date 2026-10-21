import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Edit,
  Trash2,
  AlertCircle,
  Printer,
  Hash,
  Info,
  Calendar,
  Coffee,
  AlertTriangle,
  Sun,
  Moon,
  Award,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ShiftApi } from "../../../services/shiftapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewShift = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadShiftData();
  }, [id]);

  const loadShiftData = async () => {
    setLoading(true);
    try {
      const data = await ShiftApi.getById(id);
      setShift(data);
    } catch (error) {
      toast.error("Failed to load shift data!");
      navigate("/masters/leave-time-master/shiftmaster");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Shift?",
      text: `Are you sure you want to delete this shift?`,
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
        await ShiftApi.delete(id);
        toast.success(`Shift deleted successfully!`);
        navigate("/masters/leave-time-master/shiftmaster");
      } catch (error) {
        toast.error(error.message || "Failed to delete shift");
      }
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

  const InfoCard = ({ title, icon: Icon, children, color = "purple" }) => (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center mb-3">
        <div className={`h-8 w-8 rounded-lg bg-${color}-100 flex items-center justify-center mr-2`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-1 border-b border-gray-200 last:border-0">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium text-gray-900">{value || "—"}</span>
    </div>
  );

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
          <div style={styles.sectionTitle}>Shift Summary</div>
          <table style={styles.table}>
            <tbody>
              <tr><td style={{...styles.td, ...styles.textBold}}>Shift ID</td><td style={styles.td}>{shift?.Sf_Id}</td><td style={{...styles.td, ...styles.textBold}}>Code</td><td style={styles.td}>{shift?.Sf_Code}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Name</td><td style={styles.td}>{shift?.Sf_Name}</td><td style={{...styles.td, ...styles.textBold}}>Type</td><td style={styles.td}>{shift?.Sf_Type}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Start Time</td><td style={styles.td}>{shift?.Sf_Stime}</td><td style={{...styles.td, ...styles.textBold}}>End Time</td><td style={styles.td}>{shift?.Sf_Etime}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Hours</td><td style={styles.td}>{shift?.Sf_Hours}</td><td style={{...styles.td, ...styles.textBold}}>Half Day</td><td style={styles.td}>{shift?.Sf_HalfDay} hrs</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Midnight</td><td style={styles.td}>{shift?.Sf_MidNight}</td><td style={{...styles.td, ...styles.textBold}}>Week Off</td><td style={styles.td}>{shift?.Sf_WkOff}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Holiday Duty</td><td style={styles.td}>{shift?.Sf_HolDy}</td><td style={{...styles.td, ...styles.textBold}}>Night Allow</td><td style={styles.td}>{shift?.Sf_NgtAllow}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>OT Allowed</td><td style={styles.td}>{shift?.Sf_OtAllowed}</td><td style={{...styles.td, ...styles.textBold}}>OT Grace</td><td style={styles.td}>{shift?.Sf_OtGrace} min</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>OT Rounding</td><td style={styles.td}>{shift?.Sf_OtRounding} min</td><td style={{...styles.td, ...styles.textBold}}>Max OT</td><td style={styles.td}>{shift?.Sf_MaxOTHrs} hrs</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Grace In</td><td style={styles.td}>{shift?.Grc_In_Mnt} min</td><td style={{...styles.td, ...styles.textBold}}>Grace Out</td><td style={styles.td}>{shift?.Grc_Out_Mnt} min</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Late After</td><td style={styles.td}>{shift?.LtMrk_After} min</td><td style={{...styles.td, ...styles.textBold}}>Early Before</td><td style={styles.td}>{shift?.ErlMrk_Before} min</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Rotation Days</td><td style={styles.td}>{shift?.Sf_Rot_Days}</td><td style={{...styles.td, ...styles.textBold}}></td><td style={styles.td}></td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Created</td><td style={styles.td}>{formatDateTime(shift?.created_at)}</td><td style={{...styles.td, ...styles.textBold}}>Updated</td><td style={styles.td}>{formatDateTime(shift?.updated_at)}</td></tr>
            </tbody>
          </table>
        </div>
        
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Break Timing</div>
          <table style={styles.table}>
            <tbody>
              <tr><td style={{...styles.td, ...styles.textBold}}>Break Start</td><td style={styles.td}>{shift?.Brk_Stime}</td><td style={{...styles.td, ...styles.textBold}}>Break End</td><td style={styles.td}>{shift?.Brk_Etime}</td></tr>
            </tbody>
          </table>
        </div>
        
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Flexible Timing</div>
          <table style={styles.table}>
            <tbody>
              <tr><td style={{...styles.td, ...styles.textBold}}>Flex In Start</td><td style={styles.td}>{shift?.Sf_FlxIn_ST}</td><td style={{...styles.td, ...styles.textBold}}>Flex In End</td><td style={styles.td}>{shift?.Sf_FlxIn_ET}</td></tr>
              <tr><td style={{...styles.td, ...styles.textBold}}>Flex Out Start</td><td style={styles.td}>{shift?.Sf_FlxOut_ST}</td><td style={{...styles.td, ...styles.textBold}}>Flex Out End</td><td style={styles.td}>{shift?.Sf_FlxOut_ET}</td></tr>
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
        <p className="mt-4 text-gray-600">Loading shift details...</p>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Shift Not Found</h2>
        <button onClick={() => navigate("/masters/leave-time-master/shiftmaster")} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shifts
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showPrint && (
        <PrintLayout title="Shift Report" showControls={true} onClose={() => setShowPrint(false)} organizationData={organization} orientation={printOrientation} onOrientationChange={setPrintOrientation}>
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
          <button onClick={() => navigate("/masters/leave-time-master/shiftmaster")} className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shift Details</h1>
            <p className="text-sm text-gray-600">ID: #{shift.Sf_Id} | Code: {shift.Sf_Code}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPrint(true)} className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-sm font-medium">
            <Printer className="h-4 w-4 mr-2" /> Print
          </button>
          <Link to={`/masters/leave-time-master/shiftmaster/edit/${id}`} className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-sm font-medium">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <InfoCard title="Basic Information" icon={Info} color="purple">
          <InfoRow label="Shift Name" value={shift.Sf_Name} />
          <InfoRow label="Shift Code" value={shift.Sf_Code} />
          <InfoRow label="Shift Type" value={shift.Sf_Type} />
          <InfoRow label="Week Off" value={shift.Sf_WkOff} />
          <InfoRow label="Rotation Days" value={shift.Sf_Rot_Days} />
          <InfoRow label="Half Day Hours" value={`${shift.Sf_HalfDay} hrs`} />
        </InfoCard>

        {/* Timing Information */}
        <InfoCard title="Timing Information" icon={Clock} color="blue">
          <InfoRow label="Start Time" value={shift.Sf_Stime} />
          <InfoRow label="End Time" value={shift.Sf_Etime} />
          <InfoRow label="Total Hours" value={`${shift.Sf_Hours} hrs`} />
          <InfoRow label="Midnight Shift" value={shift.Sf_MidNight} />
        </InfoCard>

        {/* Break Timing */}
        <InfoCard title="Break Timing" icon={Coffee} color="green">
          <InfoRow label="Break Start" value={shift.Brk_Stime} />
          <InfoRow label="Break End" value={shift.Brk_Etime} />
        </InfoCard>

        {/* Grace & Late Marking */}
        <InfoCard title="Grace & Late Marking" icon={AlertTriangle} color="orange">
          <InfoRow label="Grace In" value={`${shift.Grc_In_Mnt} min`} />
          <InfoRow label="Grace Out" value={`${shift.Grc_Out_Mnt} min`} />
          <InfoRow label="Late Mark After" value={`${shift.LtMrk_After} min`} />
          <InfoRow label="Early Mark Before" value={`${shift.ErlMrk_Before} min`} />
        </InfoCard>

        {/* Overtime Settings */}
        <InfoCard title="Overtime Settings" icon={Award} color="red">
          <InfoRow label="OT Allowed" value={shift.Sf_OtAllowed} />
          <InfoRow label="OT Grace" value={`${shift.Sf_OtGrace} min`} />
          <InfoRow label="OT Rounding" value={`${shift.Sf_OtRounding} min`} />
          <InfoRow label="Max OT Hours" value={`${shift.Sf_MaxOTHrs} hrs`} />
        </InfoCard>

        {/* Flexible Timing */}
        <InfoCard title="Flexible Timing" icon={Sun} color="yellow">
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Flex In Window</p>
            <InfoRow label="Start Time" value={shift.Sf_FlxIn_ST} />
            <InfoRow label="End Time" value={shift.Sf_FlxIn_ET} />
          </div>
          <div className="col-span-2 mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Flex Out Window</p>
            <InfoRow label="Start Time" value={shift.Sf_FlxOut_ST} />
            <InfoRow label="End Time" value={shift.Sf_FlxOut_ET} />
          </div>
        </InfoCard>

        {/* Holiday & Night Allowance */}
        <InfoCard title="Holiday & Night Allowance" icon={Moon} color="indigo">
          <InfoRow label="Holiday Duty" value={shift.Sf_HolDy} />
          <InfoRow label="Night Allowance" value={shift.Sf_NgtAllow} />
        </InfoCard>

        {/* Audit Information */}
        <InfoCard title="Audit Information" icon={Calendar} color="gray">
          <InfoRow label="Created" value={formatDateTime(shift.created_at)} />
          <InfoRow label="Last Updated" value={formatDateTime(shift.updated_at)} />
        </InfoCard>
      </div>
    </div>
  );
};

export default ViewShift;