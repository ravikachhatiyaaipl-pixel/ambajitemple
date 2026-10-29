import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Building,
  User,
  Clock,
  DollarSign,
  FileCheck,
  Info,
  AlertCircle,
  Printer,
  Copy,
  Percent,
  CreditCard,
  Hash,
  CheckCircle,
  XCircle,
  PenTool,
  Upload,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopRentAgreementApi from "../../../services/shoprentagreementapi";

const ViewShopRentAgreement = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Shop Rent Agreement");
  const [showCountersign, setShowCountersign] = useState(false);
  const [mgrSign, setMgrSign] = useState("");
  const [mgrRef, setMgrRef] = useState("");
  const [signedDoc, setSignedDoc] = useState(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/shop-rent-agreement";
      const currentMenuItem = menuDetails.find(
        (i) => i.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ShopRentAgreementApi.getById(id);
      setItem(res?.data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-rent-agreement");
    } finally {
      setLoading(false);
    }
  };

  const handleCountersign = async () => {
    if (!mgrSign.trim()) {
      toast.error("Please enter signatory name");
      return;
    }
    try {
      setSigning(true);
      const fd = new FormData();
      fd.append("SPRG_MgrSign", mgrSign.trim());
      fd.append("SPRG_MgrRef", mgrRef.trim());
      if (signedDoc) fd.append("signed_doc", signedDoc);

      const token = localStorage.getItem("auth_token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/shop-rent-agreements/${id}/countersign`,
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status) {
        toast.success("Agreement signed successfully");
        setShowCountersign(false);
        setMgrSign("");
        setMgrRef("");
        setSignedDoc(null);
        loadData();
      } else {
        const errs = res.data.errors
          ? Object.values(res.data.errors).flat().join(", ")
          : res.data.message;
        toast.error(errs || "Failed to sign agreement");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to sign agreement",
      );
    } finally {
      setSigning(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete Agreement?`,
      text: `Are you sure you want to delete agreement "${item?.SPRG_StRef}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await ShopRentAgreementApi.delete(id);
      toast.success("Agreement deleted successfully!");
      navigate("/masters/hall-shop-management/shop-rent-agreement");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING_AGREEMENT: "bg-amber-100 text-amber-800",
      ACTIVE: "bg-green-100 text-green-800",
      EXPIRED: "bg-red-100 text-red-800",
      TERMINATED: "bg-gray-100 text-gray-800",
      TRANSFERRED: "bg-blue-100 text-blue-800",
      SUSPENDED: "bg-yellow-100 text-yellow-800",
    };
    const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
      >
        {status || "N/A"}
      </span>
    );
  };

  const getSdSttBadge = (status) => {
    const statusColors = {
      HELD: "bg-blue-100 text-blue-800",
      REFUNDED: "bg-green-100 text-green-800",
      FORFEITED: "bg-red-100 text-red-800",
      PARTIAL_REFUND: "bg-yellow-100 text-yellow-800",
    };
    const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {status || "N/A"}
      </span>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/hall-shop-management/shop-rent-agreement")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <FileCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {item.SPRG_StRef || "Agreement"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(item.SPRG_Status)}
                {item.SPRG_DcYn == "Y" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Declaration: Yes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!item?.SPRG_MgrAgreed ? (
            <button
              onClick={() => setShowCountersign(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 flex items-center shadow-sm"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Sign Agreement
            </button>
          ) : (
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Signed by {item.SPRG_MgrSign}
            </span>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <Link
            to={`/masters/hall-shop-management/shop-rent-agreement/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 flex items-center shadow-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="lg:col-span-2">
          {/* Agreement Information */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Agreement Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Agreement Date
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(item.SPRG_Date)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reference
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      {item.SPRG_StRef || (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Application
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.application ? (
                        <div>
                          <div className="font-medium">
                            {item.application.Busi_Name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Date: {formatDate(item.application.SPRA_Date)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not linked</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Shop
                    </label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      {item.shop_detail ? (
                        <div>
                          <div className="font-medium">
                            {item.shop_detail.SPM_Name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lease Dates */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Lease Period
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400">Start Date</label>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(item.SPRG_StDt)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">End Date</label>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(item.SPRG_EdDt)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Due Date</label>
                    <div className="text-sm font-medium text-gray-900">
                      {item.SPRG_DuDt ? (
                        formatDate(item.SPRG_DuDt)
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Financial Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Monthly Rent
                    </label>
                    <div className="mt-1 text-lg font-bold text-green-700">
                      {formatCurrency(item.SPRG_MnRt)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Security Deposit
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.SPRG_SdAm ? (
                        formatCurrency(item.SPRG_SdAm)
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                      {item.SPRG_SdMn && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({item.SPRG_SdMn} months)
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Security Deposit %
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.SPRG_SdPr ? (
                        `${item.SPRG_SdPr}%`
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tax Percentage
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.SPRG_TaxP ? (
                        `${item.SPRG_TaxP}%`
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Late Fee
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.SPRG_LtFe ? (
                        formatCurrency(item.SPRG_LtFe)
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Annual Rent
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.SPRG_AtRn ? (
                        formatCurrency(item.SPRG_AtRn)
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Increase Percentage
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.SPRG_IncPr ? (
                        `${item.SPRG_IncPr}%`
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Transfer Fee
                    </label>
                    <div className="mt-1 text-gray-900">
                      {item.SPRG_TrfFe ? (
                        formatCurrency(item.SPRG_TrfFe)
                      ) : (
                        <span className="text-gray-400 italic">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Status & Notes */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Agreement Status</span>
                <div>{getStatusBadge(item.SPRG_Status)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Security Deposit Status
                </span>
                <div>{getSdSttBadge(item.SPRG_SdStt)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Declaration</span>
                <span
                  className={`text-sm font-medium ${item.SPRG_DcYn == "Y" ? "text-green-600" : "text-gray-600"}`}
                >
                  {item.SPRG_DcYn == "Y" ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-700">
                  {formatDate(item.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-700">
                  {formatDate(item.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Notes & Remarks
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {item.SPRG_RnNt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rent Note
                  </label>
                  <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {item.SPRG_RnNt}
                  </div>
                </div>
              )}
              {item.SPRG_Reason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Reason
                  </label>
                  <div className="mt-1 text-sm text-gray-700">
                    {item.SPRG_Reason}
                  </div>
                </div>
              )}
              {item.SPRG_Remark && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Remark
                  </label>
                  <div className="mt-1 text-sm text-gray-700">
                    {item.SPRG_Remark}
                  </div>
                </div>
              )}
              {!item.SPRG_RnNt && !item.SPRG_Reason && !item.SPRG_Remark && (
                <div className="text-center py-4">
                  <Info className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No notes or remarks added
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Countersign Modal - Trust signature */}
      {showCountersign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Sign Agreement
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Shree Ambaji Mata Temple Trust
                </p>
              </div>
              <button
                onClick={() => setShowCountersign(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                <p className="mb-1 font-semibold">Agreement Summary</p>
                <p>Monthly Rent: Rs. {item?.SPRG_MnRt ?? 0}</p>
                <p>
                  Security Deposit: Rs.{" "}
                  {item?.SPRG_DepAmt ?? item?.SPRG_SdMn ?? 0}
                </p>
                <p>
                  Period: {item?.SPRG_StDt || "-"} to {item?.SPRG_EdDt || "-"}
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
                Applicant signature:{" "}
                {item?.SPRG_Agreed
                  ? `Signed by ${item.SPRG_SignName}`
                  : "Pending - applicant ne abhi sign nahi kiya"}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Signatory Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mgrSign}
                  onChange={(e) => setMgrSign(e.target.value)}
                  placeholder="e.g. Manager Patel"
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Reference No <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={mgrRef}
                  onChange={(e) => setMgrRef(e.target.value)}
                  placeholder="e.g. TRUST/2026/01"
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Upload Signed PDF{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setSignedDoc(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setShowCountersign(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCountersign}
                disabled={signing}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {signing ? "Signing..." : "Sign Agreement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewShopRentAgreement;