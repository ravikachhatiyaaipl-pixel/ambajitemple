import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building,
  Layers,
  DollarSign,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Printer,
  User,
  FileText,
  Briefcase,
  Tag,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { GrantEntryApi } from "../../../services/grantentryapi";

const GrantEntryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [pageTitle, setPageTitle] = useState("Grant Entry Details");
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    // Get user designation and admin status
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const adminCheck =
      userData?.roleId == 1 || userData?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const desigId =
      userData?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    const parsedDesigId = desigId ? parseInt(desigId) : null;
    setUserDesignationId(parsedDesigId);

    // Get page title from menu details
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/grant-management/grant-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    loadEntryDetails();
  }, [id]);

  const loadEntryDetails = async () => {
    setLoading(true);
    try {
      const response = await GrantEntryApi.getById(id);
      console.log("Loaded entry details:", response);

      const entryData = response?.data || response;
      setEntry(entryData);

      // Check edit permission based on designation (department check removed)
      checkEditPermission(entryData);
    } catch (error) {
      console.error("Error loading entry details:", error);
      toast.error("Failed to load entry details!");
      navigate("/transactions/grant-management/grant-entry");
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit this entry (designation-based only)
  const checkEditPermission = (entryData) => {
    if (isAdmin) {
      setCanEdit(true);
      return;
    }

    const statusAction = entryData?.action;
    if (!statusAction) {
      setCanEdit(false);
      return;
    }

    // Check if user is authority for this action
    const isAuthority = statusAction.authorities_details?.some(
      (auth) => parseInt(auth.Dsg_id) == userDesignationId,
    );

    // Check if it's initial action (Previous_Status = null)
    const isInitialAction = !statusAction.Previous_Status;

    // User can edit if they are authority AND it's initial action
    setCanEdit(isAuthority && isInitialAction);
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
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  // Get status display from action
  const getStatusDisplay = () => {
    if (entry?.action) {
      return entry.action.St_Name || "Unknown";
    }
    return "Unknown";
  };

  // Get status badge based on action
  const getStatusBadge = () => {
    const statusName = getStatusDisplay();

    const statusColors = {
      "Grant Receipt": { color: "blue", icon: Clock },
      Verification: { color: "yellow", icon: Clock },
      Approval: { color: "green", icon: CheckCircle },
      Payment: { color: "purple", icon: CheckCircle },
      Rejected: { color: "red", icon: XCircle },
    };

    const config = statusColors[statusName] || { color: "gray", icon: Clock };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}
      >
        <Icon className="h-4 w-4 mr-2" />
        {statusName}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading grant entry details...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-12 text-center">
        <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Entry Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The grant entry you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => navigate("/transactions/grant-management/grant-entry")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/grant-management/grant-entry")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageTitle} - View
            </h1>
            <p className="text-gray-600 mt-1">
              Detailed information of grant entry
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium flex items-center hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          {canEdit && (
            <Link
              to={`/transactions/grant-management/grant-entry/edit/${id}`}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Entry
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Status Information
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Status</p>
                {getStatusBadge()}
                {entry.action && entry.action.Previous_Status && (
                  <p className="text-xs text-gray-400 mt-2">
                    Previous Status ID: {entry.action.Previous_Status}
                  </p>
                )}
              </div>
              {entry.action && entry.action.Act_Remarks && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Remarks</p>
                  <p className="text-sm text-gray-700">
                    {entry.action.Act_Remarks}
                  </p>
                </div>
              )}
              {entry.Remarks && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Remarks</p>
                  <p className="text-sm text-gray-700">{entry.Remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Date Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Entry Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(entry.Date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(entry.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(entry.updated_at)}
                </p>
              </div>
              {entry.GE_HOD && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">HOD Approved At</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateTime(entry.GE_HOD)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Year Card */}
          {entry.financial_year && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <Calendar className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Financial Year Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Financial Year</p>
                  <p className="text-base font-medium text-gray-900">
                    {entry.financial_year.FY_Name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Code: {entry.financial_year.FY_Code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Period</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(entry.financial_year.St_Date)} -{" "}
                    {formatDate(entry.financial_year.Ed_Date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.financial_year.Status == "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {entry.financial_year.Status}
                  </span>
                </div>
                {entry.financial_year.is_current_year && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Year</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Yes
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Grant Details Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                <Receipt className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Grant Details
              </h2>
            </div>

            <div className="space-y-4">
              {entry.grant_type && (
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" />
                    Grant Type
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-base font-medium text-gray-900">
                      {entry.grant_type.GT_Name}
                    </p>
                    {entry.grant_type.GT_Code && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          Code: {entry.grant_type.GT_Code}
                        </span>
                        <button
                          onClick={() =>
                            handleCopyToClipboard(entry.grant_type.GT_Code)
                          }
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {entry.budget_head && (
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <Layers className="h-3 w-3 mr-1" />
                    Budget Head
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-base font-medium text-gray-900">
                      {entry.budget_head.Gr_Nm}
                    </p>
                    {entry.budget_head.Gr_Cd && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          Code: {entry.budget_head.Gr_Cd}
                        </span>
                        <button
                          onClick={() =>
                            handleCopyToClipboard(entry.budget_head.Gr_Cd)
                          }
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Branch Details Card */}
          {entry.department && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <Building className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Branch Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Branch Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {entry.department.Dpt_Desc}
                  </p>
                </div>
                {entry.department.Dpt_Name &&
                  entry.department.Dpt_Name != entry.department.Dpt_Desc && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Branch Code</p>
                      <p className="text-base font-medium text-gray-900">
                        {entry.department.Dpt_Name}
                      </p>
                    </div>
                  )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Group Code</p>
                  <p className="text-base font-medium text-gray-900 font-mono">
                    {entry.department.GrCod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Level</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.department.GrStt == "1"
                        ? "bg-blue-100 text-blue-800"
                        : entry.department.GrStt == "2"
                          ? "bg-green-100 text-green-800"
                          : entry.department.GrStt == "3"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    Level {entry.department.GrStt}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Amount Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3">
                <DollarSign className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Amount Details
              </h2>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Grant Amount</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(entry.Amount)}
              </p>
            </div>
          </div>

          {/* HOD Details Card */}
          {entry.hod && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  HOD Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">HOD Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {entry.hod.full_name || entry.hod.Usr_Name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-base text-gray-900">
                    {entry.hod.Usr_Email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mobile</p>
                  <p className="text-base text-gray-900">
                    {entry.hod.Usr_Mobile}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrantEntryView;
