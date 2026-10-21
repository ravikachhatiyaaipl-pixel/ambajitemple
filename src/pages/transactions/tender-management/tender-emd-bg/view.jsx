import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building,
  Briefcase,
  Tag,
  DollarSign,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Printer,
  Download,
  Mail,
  ToggleLeft,
  ToggleRight,
  User,
  FileText,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { TenderEmdBgApi } from "../../../services/tenderemdbgapi";

const TenderEmdBgView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [pageTitle, setPageTitle] = useState("EMD/BG Receipt Details");

  useEffect(() => {
    // Get page title from menu details
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/tender-management/tender-emd-bg-receipt-entry";
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
      const response = await TenderEmdBgApi.getById(id);
      console.log("Loaded entry details:", response);

      const entryData = response?.data || response;
      setEntry(entryData);
    } catch (error) {
      console.error("Error loading entry details:", error);
      toast.error("Failed to load entry details!");
      navigate("/transactions/tender-management/tender-emd-bg-receipt-entry");
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get status display from status_action
  const getStatusDisplay = () => {
    if (entry?.status_action) {
      return entry.status_action.St_Name || "Unknown";
    }
    return "Unknown";
  };

  // Get status badge based on action
  const getStatusBadge = () => {
    const statusName = getStatusDisplay();

    const statusColors = {
      "EMD Receipt": { color: "blue", icon: Clock },
      Verification: { color: "yellow", icon: Clock },
      Approval: { color: "green", icon: CheckCircle },
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

  const getForAccBadge = (forAcc) => {
    if (forAcc == "YES") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <ToggleRight className="h-4 w-4 mr-2" />
          YES - For Account
        </span>
      );
    } else if (forAcc == "NO") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <ToggleLeft className="h-4 w-4 mr-2" />
          NO - Not for Account
        </span>
      );
    }
    return null;
  };

  const getTypeBadge = (tetCd) => {
    if (tetCd == "Credit") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Credit Entry
        </span>
      );
    } else if (tetCd == "Debit") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Debit Entry
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading EMD/BG entry details...</p>
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
          The EMD/BG entry you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() =>
            navigate(
              "/transactions/tender-management/tender-emd-bg-receipt-entry",
            )
          }
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
              navigate(
                "/transactions/tender-management/tender-emd-bg-receipt-entry",
              )
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
              Detailed information of EMD/BG receipt entry
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
                {entry.status_action && entry.status_action.Previous_Status && (
                  <p className="text-xs text-gray-400 mt-2">
                    Previous Status ID: {entry.status_action.Previous_Status}
                  </p>
                )}
              </div>
              {entry.status_action && entry.status_action.Act_Remarks && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Remarks</p>
                  <p className="text-sm text-gray-700">
                    {entry.status_action.Act_Remarks}
                  </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tender Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(entry.TE_Date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Start Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(entry.TES_Date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">End Date</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(entry.TEE_Date)}
                </p>
              </div>
            </div>
          </div>

          {/* Tender Details Card */}
          {entry.tender && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Tender Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-base text-gray-900">
                    {entry.tender.Description || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entry.tender.department && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        Branch/Department
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {entry.tender.department.Dpt_Desc ||
                          entry.tender.department.Dpt_Name}
                      </p>
                    </div>
                  )}

                  {entry.tender.tendertype && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" />
                        Work Type
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {entry.tender.tendertype.TnT_Name}
                      </p>
                    </div>
                  )}
                </div>

                {entry.tender.ledger && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      Ledger
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {entry.tender.ledger.Lg_Name}
                      {entry.tender.ledger.Lg_Code && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({entry.tender.ledger.Lg_Code})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Proposal Amount
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {formatCurrency(entry.tender.Proposal_Amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Approved Amount
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {formatCurrency(entry.tender.Approved_Amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Party and Amount */}
        <div className="space-y-6">
          {/* Party Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Party Information
              </h2>
            </div>

            {entry.subledger ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Party Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {entry.subledger.SL_Name}
                  </p>
                </div>

                {entry.subledger.SL_Code && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Party Code</p>
                    <p className="text-base font-medium text-gray-900">
                      {entry.subledger.SL_Code}
                    </p>
                  </div>
                )}

                {entry.subledger.SL_Address && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-sm text-gray-900">
                      {entry.subledger.SL_Address}
                    </p>
                  </div>
                )}

                {entry.subledger.SL_Phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-base text-gray-900">
                      {entry.subledger.SL_Phone}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No party information available</p>
            )}
          </div>

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

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">EMD Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(entry.EMD_Amt)}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-1">Transaction Type</p>
                <p className="text-base font-medium text-gray-900">
                  {getTypeBadge(entry.TET_CD)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">For Account</p>
                <div className="flex items-center">
                  {getForAccBadge(entry.For_Acc)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderEmdBgView;
