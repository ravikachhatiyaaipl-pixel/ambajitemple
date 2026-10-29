import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Hash,
  Calendar,
  Building2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Banknote,
  Users,
  Info,
  Printer,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequeBooksApi } from "../../../services/chequebooksapi";

const ViewChequeBooks = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chequeBook, setChequeBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChequeBookData();
  }, [id]);

  const loadChequeBookData = async () => {
    setLoading(true);
    try {
      const data = await ChequeBooksApi.getById(id);
      console.log("View data:", data);
      setChequeBook(data);
    } catch (error) {
      console.error("Error loading cheque book:", error);
      toast.error(
        error.response?.data?.message || "Failed to load cheque book data!",
      );
      navigate("/masters/financial-accounting/cheque-books");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChequeBook = async () => {
    const result = await Swal.fire({
      title: "Delete Cheque Book?",
      text: `Are you sure you want to delete "${chequeBook?.book_reference}"? This action cannot be undone.`,
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
      await ChequeBooksApi.delete(id);
      toast.success(
        `Cheque Book "${chequeBook?.book_reference}" deleted successfully!`,
      );
      navigate("/masters/financial-accounting/cheque-books");
    } catch (error) {
      console.error("Error deleting cheque book:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete cheque book",
      );
    }
  };

  const handleCloseChequeBook = async () => {
    const result = await Swal.fire({
      title: "Close Cheque Book?",
      text: `Are you sure you want to close "${chequeBook?.book_reference}"? This will mark it as closed and cannot be used further.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, close!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await ChequeBooksApi.close(id);
      toast.success(
        `Cheque Book "${chequeBook?.book_reference}" closed successfully!`,
      );
      loadChequeBookData();
    } catch (error) {
      console.error("Error closing cheque book:", error);
      toast.error(
        error.response?.data?.message || "Failed to close cheque book",
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
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

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getUsagePercentage = () => {
    if (!chequeBook) return 0;
    const used = chequeBook.used_leaves || 0;
    const total = chequeBook.total_leaves || 0;
    if (total == 0) return 0;
    return Math.round((used / total) * 100);
  };

  const getStatusLabel = () => {
    if (!chequeBook) return "Unknown";
    if (chequeBook.status == 12) return "Closed";
    const usagePercentage = getUsagePercentage();
    if (usagePercentage == 0) return "New";
    if (usagePercentage < 50) return "Partially Used";
    if (usagePercentage < 80) return "Mostly Used";
    if (usagePercentage < 100) return "Nearly Used";
    return "Fully Used";
  };

  const getStatusColor = () => {
    if (!chequeBook) return "bg-gray-100 text-gray-800";
    if (chequeBook.status == 12) return "bg-red-100 text-red-800";
    const usagePercentage = getUsagePercentage();
    if (usagePercentage == 0) return "bg-green-100 text-green-800";
    if (usagePercentage < 50) return "bg-blue-100 text-blue-800";
    if (usagePercentage < 80) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading cheque book details...</p>
      </div>
    );
  }

  if (!chequeBook) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Cheque book not found</p>
        <Link
          to="/masters/financial-accounting/cheque-books"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cheque Book List
        </Link>
      </div>
    );
  }

  const usagePercentage = getUsagePercentage();
  const bankAccount = chequeBook.bank_account || chequeBook.bank;
  const chequeFormat = chequeBook.cheque_format;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate("/masters/financial-accounting/cheque-books")
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {chequeBook?.book_reference || "N/A"}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}
                    >
                      {getStatusLabel()}
                    </span>
                    {chequeBook.cheque_format_id && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Printer className="h-3 w-3 mr-1" />
                        {chequeFormat?.format_name || `Format #${chequeBook.cheque_format_id}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* {chequeBook.status != 12 && (
            <button
              onClick={handleCloseChequeBook}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 flex items-center shadow-sm transition-all"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Close Book
            </button>
          )} */}
          <Link
            to={`/masters/financial-accounting/cheque-books/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm transition-all"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          {/* <button
            onClick={handleDeleteChequeBook}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 flex items-center shadow-sm transition-all"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Cheque Book Information */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Cheque Book Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Leaf Range
                    </label>
                    <div className="mt-1 flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-mono">
                        {chequeBook?.leaf_from} - {chequeBook?.leaf_to}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total Leaves
                    </label>
                    <div className="mt-1 flex items-center">
                      <Banknote className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {chequeBook?.total_leaves}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Cheque Format
                    </label>
                    <div className="mt-1">
                      {chequeFormat ? (
                        <div>
                          <div className="flex items-center">
                            <Printer className="h-4 w-4 text-purple-500 mr-2" />
                            <span className="text-gray-900 font-medium">
                              {chequeFormat.format_name}
                            </span>
                          </div>
                          {chequeFormat.description && (
                            <p className="mt-1 text-sm text-gray-500 ml-6">
                              {chequeFormat.description}
                            </p>
                          )}
                          {chequeFormat.bank && (
                            <p className="mt-1 text-xs text-gray-400 ml-6">
                              Bank: {chequeFormat.bank.bank_name}
                            </p>
                          )}
                          {chequeFormat.cheque_width && chequeFormat.cheque_height && (
                            <p className="mt-1 text-xs text-gray-400 ml-6">
                              Dimensions: {chequeFormat.cheque_width} × {chequeFormat.cheque_height} mm
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Received Date
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDateOnly(chequeBook?.received_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bank Account Information */}
          {bankAccount && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Book Account Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Name
                    </label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {bankAccount.Lg_Name || "N/A"}
                    </p>
                  </div>
                  {bankAccount.Lg_Eng_Name && bankAccount.Lg_Eng_Name !=  bankAccount.Lg_Name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        English Name
                      </label>
                      <p className="mt-1 text-gray-900">
                        {bankAccount.Lg_Eng_Name}
                      </p>
                    </div>
                  )}
                  {bankAccount.Lg_Code && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Account Code
                      </label>
                      <p className="mt-1 font-mono text-gray-900">
                        {bankAccount.Lg_Code}
                      </p>
                    </div>
                  )}
                  {bankAccount.Lg_Buk && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Book Type
                      </label>
                      <p className="mt-1 text-gray-900">
                        {bankAccount.Lg_Buk ==  "Y" ? "Bank Account" : "Non-Bank"}
                      </p>
                    </div>
                  )}
                  {bankAccount.ledger_group && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Group
                      </label>
                      <p className="mt-1 text-gray-900">
                        {bankAccount.ledger_group.Gr_Nm}
                      </p>
                    </div>
                  )}
                  {bankAccount.Bh_Id && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Budget Head ID
                      </label>
                      <p className="mt-1 text-gray-900">
                        {bankAccount.Bh_Id}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <p className="mt-1 text-gray-900">
                      {bankAccount.Lg_Status ? (
                        <span className="inline-flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Inactive
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Issued By Bank & Remarks */}
          {(chequeBook?.issued_by_bank || chequeBook?.remarks) && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Additional Information
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {chequeBook?.issued_by_bank && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Issued By Bank
                      </label>
                      <p className="mt-1 flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {chequeBook.issued_by_bank}
                        </span>
                      </p>
                    </div>
                  )}
                  {chequeBook?.remarks && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Remarks
                      </label>
                      <p className="mt-1 flex items-start">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <span className="text-gray-900 whitespace-pre-wrap">
                          {chequeBook.remarks}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organization Information */}
          {chequeBook?.organization && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Organization Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Organization Name
                    </label>
                    <p className="mt-1 text-gray-900">
                      {chequeBook.organization.org_name || "N/A"}
                    </p>
                  </div>
                  {chequeBook.organization.org_code && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Organization Code
                      </label>
                      <p className="mt-1 text-gray-900">
                        {chequeBook.organization.org_code}
                      </p>
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

export default ViewChequeBooks;