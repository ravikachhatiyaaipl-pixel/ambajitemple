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
  Users,
  User,
  Edit,
  Calendar,
  Clock,
  Copy,
  Phone,
  Heart,
  AlertCircle,
  Printer,
  UserCircle,
  Hash,
  Briefcase,
  Mail,
  MapPin,
  CreditCard
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { FamilyInfoApi } from "../../../services/familyinfoapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewEmpFamilyInfo = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [familyInfo, setFamilyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadFamilyInfoData();
  }, [id]);

  const loadFamilyInfoData = async () => {
    setLoading(true);
    try {
      const response = await FamilyInfoApi.getById(id);
      console.log("Family Info Response:", response); // For debugging
      
      if (response.success && response.data) {
        setFamilyInfo(response.data);
      } else {
        toast.error("Failed to load family information data!");
        navigate("/masters/employee-personal-masters/emp-family-info");
      }
    } catch (error) {
      console.error("Error loading family info:", error);
      toast.error(error.message || "Failed to load family information data!");
      navigate("/masters/employee-personal-masters/emp-family-info");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Family Information?",
      text: `Are you sure you want to delete "${familyInfo?.Member_name}"? This action cannot be undone.`,
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
        await FamilyInfoApi.delete(id);
        toast.success(
          `Family information "${familyInfo?.Member_name}" deleted successfully!`,
        );
        navigate("/masters/employee-personal-masters/emp-family-info");
      } catch (error) {
        toast.error(error.message || "Failed to delete family information");
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

  const getGenderBadgeColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'bg-blue-100 text-blue-800';
      case 'female':
        return 'bg-pink-100 text-pink-800';
      case 'other':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmployeeDisplay = () => {
    if (familyInfo?.employee) {
      const emp = familyInfo.employee;
      const fullName = `${emp.First_Name || ''} ${emp.Last_Name || ''}`.trim();
      const empCode = emp.Emp_Code || '';
      
      if (fullName && empCode) {
        return `${fullName} (${empCode})`;
      } else if (fullName) {
        return fullName;
      } else if (empCode) {
        return empCode;
      }
    }
    return familyInfo?.Emp_id ? `Employee #${familyInfo.Emp_id}` : '—';
  };

  const getRelationshipDisplay = () => {
    if (familyInfo?.relationship) {
      return familyInfo.relationship.Rela_Name || `Relationship #${familyInfo.Rela_Id}`;
    }
    return familyInfo?.Rela_Id ? `Relationship #${familyInfo.Rela_Id}` : '—';
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
        {/* Family Information Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Family Information Summary</div>
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
                  Member Name
                </td>
                <td style={styles.td}>{familyInfo?.Member_name || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Member ID
                </td>
                <td style={styles.td}>{familyInfo?.EFI_Id || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Gender
                </td>
                <td style={styles.td}>
                  {familyInfo?.Gender ? familyInfo.Gender.charAt(0).toUpperCase() + familyInfo.Gender.slice(1) : "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Employee
                </td>
                <td style={styles.td}>{getEmployeeDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Relationship
                </td>
                <td style={styles.td}>{getRelationshipDisplay()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Date of Birth
                </td>
                <td style={styles.td}>
                  {formatDate(familyInfo?.Dob)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Phone
                </td>
                <td style={styles.td}>{familyInfo?.Phone || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Status
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...(familyInfo?.Is_Active ? styles.statusActive : styles.statusInactive),
                  }}
                >
                  {familyInfo?.Is_Active ? "Active" : "Inactive"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(familyInfo?.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(familyInfo?.updated_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
                <td style={{ ...styles.td, ...styles.textBold }}></td>
                <td style={styles.td}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Employee Details (if available) */}
        {familyInfo?.employee && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Employee Details</div>
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
                  <td style={styles.td}>Employee Code</td>
                  <td style={styles.td}>{familyInfo.employee.Emp_Code || 'N/A'}</td>
                  <td style={styles.td}>Employee Name</td>
                  <td style={styles.td}>
                    {`${familyInfo.employee.First_Name || ''} ${familyInfo.employee.Last_Name || ''}`.trim() || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Email</td>
                  <td style={styles.td}>{familyInfo.employee.Email_Id || 'N/A'}</td>
                  <td style={styles.td}>Phone</td>
                  <td style={styles.td}>{familyInfo.employee.Phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={styles.td}>Department</td>
                  <td style={styles.td}>{familyInfo.employee.Dpt_Id || 'N/A'}</td>
                  <td style={styles.td}>Gender</td>
                  <td style={styles.td}>{familyInfo.employee.F_M || 'N/A'}</td>
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
                <td style={styles.td}>
                  {formatDateTime(familyInfo?.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(familyInfo?.updated_at)}
                </td>
              </tr>
              {familyInfo?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(familyInfo?.deleted_at)}
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
        {familyInfo?.deleted_at && (
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
                  {formatDateTime(familyInfo.deleted_at)}
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
          <p className="mt-4 text-gray-600">Loading family information details...</p>
        </div>
      </div>
    );
  }

  if (!familyInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Family Information Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The family information you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/masters/employee-personal-masters/emp-family-info")}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Family Information
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
          title="Family Information Report"
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
              onClick={() => navigate("/masters/employee-personal-masters/emp-family-info")}
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {familyInfo.Member_name}
                </h1>
                {familyInfo.Gender && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenderBadgeColor(familyInfo.Gender)}`}>
                    <Heart className="h-3 w-3 mr-1" />
                    {familyInfo.Gender.charAt(0).toUpperCase() + familyInfo.Gender.slice(1)}
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
            to={`/masters/employee-personal-masters/emp-family-info/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Family Member Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Family Member Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the family member
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Member Name
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(familyInfo.Member_name)}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy member name"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {familyInfo.Member_name}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Member ID
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(familyInfo.EFI_Id?.toString())}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy member ID"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {familyInfo.EFI_Id}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Heart className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Gender
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {familyInfo.Gender ? (
                      <div className="text-lg font-semibold text-gray-900">
                        {familyInfo.Gender.charAt(0).toUpperCase() + familyInfo.Gender.slice(1)}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Not specified</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Employee
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {getEmployeeDisplay()}
                    </div>
                    {familyInfo?.employee?.Emp_Code && (
                      <div className="text-xs text-gray-500 mt-1">
                        Code: {familyInfo.employee.Emp_Code}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Relationship
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {getRelationshipDisplay()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Date of Birth
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(familyInfo.Dob)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Phone
                      </span>
                    </div>
                    {familyInfo.Phone && (
                      <button
                        onClick={() => handleCopyToClipboard(familyInfo.Phone)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy phone number"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {familyInfo.Phone ? (
                      <div className="text-lg font-semibold text-gray-900">
                        {familyInfo.Phone}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No phone number</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <UserCircle className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      familyInfo.Is_Active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {familyInfo.Is_Active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Details Card (if available) */}
          {familyInfo.employee && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-sm">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Employee Details
                    </h2>
                    <p className="text-sm text-gray-600">
                      Information about the associated employee
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Employee Code</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-gray-900">{familyInfo.employee.Emp_Code || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Full Name</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-gray-900">
                        {`${familyInfo.employee.First_Name || ''} ${familyInfo.employee.Last_Name || ''}`.trim() || '—'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Email</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-gray-900">{familyInfo.employee.Email_Id || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Phone</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-gray-900">{familyInfo.employee.Phone || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Heart className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Gender</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-gray-900">{familyInfo.employee.F_M || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Address</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-gray-900">
                        {[familyInfo.employee.Emp_Add1, familyInfo.employee.Emp_Add2, familyInfo.employee.Emp_Add3]
                          .filter(Boolean).join(', ') || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEmpFamilyInfo;