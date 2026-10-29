// components/masters/employee-records/employee-master/view.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building,
  Hash,
  Globe,
  Users,
  BookOpen,
  Info,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmployeeMasterApi from "../../../services/employeemasterapi";

const ViewEmployeeMaster = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, [id]);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await EmployeeMasterApi.getById(id);

      if (response.status && response.data) {
        setEmployee(response.data);
      } else {
        toast.error(response.message || "Failed to load employee data!");
        navigate("/masters/employee-records/employee-master");
      }
    } catch (error) {
      toast.error("Failed to load employee data!");
      navigate("/masters/employee-records/employee-master");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-4 w-4 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <XCircle className="h-4 w-4 mr-1" />
        Inactive
      </span>
    );
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return "—";
    const genderMap = {
      M: "Male",
      F: "Female",
      Male: "Male",
      Female: "Female",
      Other: "Other",
    };
    return genderMap[gender] || gender;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employee details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Employee not found</p>
        <Link
          to="/masters/employee-records/employee-master"
          className="mt-4 inline-flex items-center text-green-600 hover:text-green-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Link>
      </div>
    );
  }

  const fullName = `${employee.First_Name || ""} ${
    employee.Last_Name || ""
  }`.trim();

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-records/employee-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {fullName || "Employee"}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {employee.Emp_Code && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Code: {employee.Emp_Code}
                    </span>
                  )}
                  {getStatusBadge(employee.Is_Active)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/employee-records/employee-master/edit/${id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Personal Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Employee Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {employee.Emp_Code || "—"}
                      </span>
                      {employee.Emp_Code && (
                        <button
                          onClick={() =>
                            handleCopyToClipboard(employee.Emp_Code)
                          }
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <div className="mt-1 flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {fullName}
                      </span>
                      <button
                        onClick={() => handleCopyToClipboard(fullName)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Gender
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900">
                        {getGenderDisplay(employee.F_M)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Birth Date
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDate(employee.Birth_Date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email Address
                    </label>
                    <div className="mt-1 flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {employee.Email_Id || "—"}
                      </span>
                      {employee.Email_Id && (
                        <button
                          onClick={() =>
                            handleCopyToClipboard(employee.Email_Id)
                          }
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <div className="mt-1 flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {employee.Phone || "—"}
                      </span>
                      {employee.Phone && (
                        <button
                          onClick={() => handleCopyToClipboard(employee.Phone)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Alternate Phone
                    </label>
                    <div className="mt-1 flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {employee.Alt_Phone || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-yellow-600" />
                Address Information
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {employee.Emp_Add1 && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                    <div>
                      <p className="text-gray-900">{employee.Emp_Add1}</p>
                      {employee.Emp_Add2 && (
                        <p className="text-gray-900">{employee.Emp_Add2}</p>
                      )}
                      {employee.Emp_Add3 && (
                        <p className="text-gray-900">{employee.Emp_Add3}</p>
                      )}
                    </div>
                  </div>
                )}
                {!employee.Emp_Add1 &&
                  !employee.Emp_Add2 &&
                  !employee.Emp_Add3 && (
                    <p className="text-gray-500 italic">No address provided</p>
                  )}
              </div>
            </div>
          </div>

          {/* Master Data Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                Master Data
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Field - Multiple Display */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Department
                  </label>
                  <div className="mt-1">
                    {employee.departments && employee.departments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {employee.departments.map((dept) => (
                          <span
                            key={dept.Dpt_id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            <Building className="h-3 w-3 mr-1" />
                            {dept.Dpt_Name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-900">—</span>
                    )}
                  </div>
                </div>

                {/* Employee Category (replaces Caste) */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employee Category
                  </label>
                  <div className="mt-1">
                    <span className="text-gray-900">
                      {employee.employee_category?.ECt_Name || "—"}
                    </span>
                    {employee.employee_category?.ECt_Code && (
                      <p className="text-sm text-gray-600">
                        Code: {employee.employee_category.ECt_Code}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quota */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Quota
                  </label>
                  <div className="mt-1">
                    <span className="text-gray-900">
                      {employee.quota?.Qut_Name || "—"}
                    </span>
                    {employee.quota?.Qut_Code && (
                      <p className="text-sm text-gray-600">
                        Code: {employee.quota.Qut_Code}
                      </p>
                    )}
                    {employee.quota?.Percentage && (
                      <p className="text-sm text-gray-600">
                        Percentage: {employee.quota.Percentage}%
                      </p>
                    )}
                  </div>
                </div>

                {/* Employee Type */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employee Type
                  </label>
                  <div className="mt-1">
                    <span className="text-gray-900">
                      {employee.employee_type?.ETy_Name || "—"}
                    </span>
                  </div>
                </div>

                {/* User */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    User
                  </label>
                  <div className="mt-1">
                    <span className="text-gray-900">
                      {employee.user?.Usr_Name || "—"}
                    </span>
                  </div>
                </div>

                {/* Languages Known */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Languages Known
                  </label>
                  <div className="mt-1">
                    {employee.languages && employee.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {employee.languages.map((lang) => (
                          <span
                            key={lang.ELg_Id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            {lang.Elg_Name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Identification Card */}
          {(employee.Inc_TxNo || employee.UID_AdharNo) && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-600" />
                Identification
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {employee.Inc_TxNo && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      PAN Number
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {employee.Inc_TxNo}
                    </p>
                  </div>
                )}
                {employee.UID_AdharNo && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Aadhar Number
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {employee.UID_AdharNo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bank Details Card */}
          {(employee.Bank_AcNo ||
            employee.Bank_Name ||
            employee.Bank_Br_Name ||
            employee.BkAc_Type) && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-pink-600" />
                  Bank Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {employee.Bank_AcNo && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Account Number
                      </label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-900">
                          {employee.Bank_AcNo}
                        </span>
                        <button
                          onClick={() =>
                            handleCopyToClipboard(employee.Bank_AcNo)
                          }
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {employee.Bank_Name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Bank Name
                      </label>
                      <div className="mt-1 text-gray-900">
                        {employee.Bank_Name}
                      </div>
                    </div>
                  )}

                  {employee.Bank_Br_Name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Branch Name
                      </label>
                      <div className="mt-1 text-gray-900">
                        {employee.Bank_Br_Name}
                      </div>
                    </div>
                  )}

                  {employee.BkAc_Type && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Account Type
                      </label>
                      <div className="mt-1 text-gray-900">
                        {employee.BkAc_Type}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PF/GPF Details Card */}
          {(employee.Gpf_AcNo || employee.Cpf_AcNo) && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Hash className="h-5 w-5 mr-2 text-orange-600" />
                  PF/GPF Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {employee.Gpf_AcNo && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        GPF Number
                      </label>
                      <div className="mt-1">
                        {employee.Gpf_AcNo_Pref && (
                          <span className="text-gray-600">
                            {employee.Gpf_AcNo_Pref}{" "}
                          </span>
                        )}
                        <span className="text-gray-900">
                          {employee.Gpf_AcNo}
                        </span>
                      </div>
                    </div>
                  )}

                  {employee.Cpf_AcNo && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        CPF Number
                      </label>
                      <div className="mt-1 text-gray-900">
                        {employee.Cpf_AcNo}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeMaster;
