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
  GraduationCap,
  CheckCircle,
  Edit,
  Copy,
  AlertCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  Award,
  Hash,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmployeeEducationProfileApi from "../../../services/employeeeducationprofileapi";

const ViewEmployeeEducationProfile = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    marks: true,
    employee: false,
    system: true,
  });

  useEffect(() => {
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const response = await EmployeeEducationProfileApi.getById(id);

      console.log("API Response:", response); // For debugging

      if (response.success) {
        setProfile(response.data);
      } else {
        toast.error(response.message || "Failed to load education profile!");
        navigate("/masters/employee-records/employee-qualification-details");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error(
        error.response?.data?.message || "Failed to load education profile!",
      );
      navigate("/masters/employee-records/employee-qualification-details");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (isActive) => {
    const active = isActive == true || isActive == 1 || isActive == "1";
    return active ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const DetailRow = ({ label, value, icon: Icon, copyable = false }) => (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 flex-shrink-0">
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <div className="mt-1 flex items-center flex-wrap gap-2">
          <p className="text-sm text-gray-900 font-medium">{value || "-"}</p>
          {copyable && value && value != "-" && (
            <button
              onClick={() => handleCopyToClipboard(value)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading education profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Education profile not found</p>
        <Link
          to="/masters/employee-records/employee-qualification-details"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Education Profiles
        </Link>
      </div>
    );
  }

  const employee = profile.employee_master || {};
  const qualification = profile.education_degree || {};

  // Format employee name
  const getEmployeeDisplayName = () => {
    if (employee.First_Name || employee.Last_Name) {
      return `${employee.First_Name || ""} ${employee.Last_Name || ""}`.trim();
    }
    if (employee.Emp_Code) {
      return employee.Emp_Code;
    }
    return `Employee #${profile.Emp_Id}`;
  };

  const employeeDisplayName = getEmployeeDisplayName();
  const employeeCode = employee.Emp_Code || `EMP-${profile.Emp_Id}`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/masters/employee-records/employee-qualification-details",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Education Profile
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    {employeeDisplayName}
                  </span>
                  {getStatusBadge(profile.Is_Active)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/employee-records/employee-qualification-details/edit/${profile.EEP_Id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div
              className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection("basic")}
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>
              {expandedSections.basic ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {expandedSections.basic && (
              <div className="p-6">
                <div className="space-y-1">
                  <DetailRow
                    label="Employee"
                    value={`${employeeDisplayName} (${employeeCode})`}
                    icon={User}
                  />
                  <DetailRow
                    label="Education Date"
                    value={formatDate(profile.EEP_Date)}
                    icon={Calendar}
                  />
                  <DetailRow
                    label="Qualification"
                    value={
                      qualification.EEd_Name ||
                      `Qualification #${profile.EED_Id}`
                    }
                    icon={BookOpen}
                  />
                  {qualification.EEd_Code && (
                    <DetailRow
                      label="Qualification Code"
                      value={qualification.EEd_Code}
                      icon={Hash}
                      copyable
                    />
                  )}
                  <DetailRow
                    label="Institution"
                    value={profile.Name_Insti}
                    icon={Building2}
                    copyable
                  />
                  <DetailRow
                    label="Passing Year"
                    value={profile.Pass_Year}
                    icon={Calendar}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Marks & Grade Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div
              className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection("marks")}
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Marks & Grade
                </h2>
              </div>
              {expandedSections.marks ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {expandedSections.marks && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Obtain Grade
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.Obtain_Grade || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Obtain Marks
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.Obtain_Marks || "0"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Total Marks
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.Total_Marks || "0"}
                    </p>
                  </div>
                </div>

                {profile.Obtain_Marks && profile.Total_Marks && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Percentage:</span>{" "}
                      {(
                        (parseInt(profile.Obtain_Marks) /
                          parseInt(profile.Total_Marks)) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Employee Details Card */}
          {employee && Object.keys(employee).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div
                className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection("employee")}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Employee Details
                  </h2>
                </div>
                {expandedSections.employee ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {expandedSections.employee && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.Emp_Code && (
                      <DetailRow
                        label="Employee Code"
                        value={employee.Emp_Code}
                        icon={Hash}
                        copyable
                      />
                    )}
                    {employee.Email_Id && (
                      <DetailRow
                        label="Email"
                        value={employee.Email_Id}
                        icon={Mail}
                        copyable
                      />
                    )}
                    {employee.Phone && (
                      <DetailRow
                        label="Phone"
                        value={employee.Phone}
                        icon={Phone}
                        copyable
                      />
                    )}
                    {employee.F_M && (
                      <DetailRow
                        label="Gender"
                        value={employee.F_M}
                        icon={User}
                      />
                    )}
                    {employee.Birth_Date && (
                      <DetailRow
                        label="Date of Birth"
                        value={formatDate(employee.Birth_Date)}
                        icon={Calendar}
                      />
                    )}
                    {employee.Emp_Add1 && (
                      <DetailRow
                        label="Address"
                        value={[
                          employee.Emp_Add1,
                          employee.Emp_Add2,
                          employee.Emp_Add3,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        icon={MapPin}
                      />
                    )}
                    {employee.Bank_Name && (
                      <DetailRow
                        label="Bank"
                        value={employee.Bank_Name}
                        icon={CreditCard}
                      />
                    )}
                    {employee.UID_AdharNo && (
                      <DetailRow
                        label="Aadhar Number"
                        value={employee.UID_AdharNo}
                        icon={Hash}
                        copyable
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeEducationProfile;
