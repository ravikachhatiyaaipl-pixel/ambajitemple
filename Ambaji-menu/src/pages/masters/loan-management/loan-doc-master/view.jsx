import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Printer,
  CheckCircle2,
  XCircle,
  Hash,
  DollarSign,
  File,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LoanDocumentApi } from "../../../services/loandocumentapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewLoanDocument = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loanDocument, setLoanDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadLoanDocumentData();
  }, [id]);

  const loadLoanDocumentData = async () => {
    setLoading(true);
    try {
      const result = await LoanDocumentApi.getById(id);
      if (result.success) {
        setLoanDocument(result.data);
      } else {
        toast.error(result.message);
        navigate("/masters/loan-management/loan-doc-master");
      }
    } catch (error) {
      console.error("Error loading loan document:", error);
      toast.error(error.message || "Failed to load loan document data!");
      navigate("/masters/loan-management/loan-doc-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Loan Document?",
      text: `Are you sure you want to delete "${loanDocument?.LD_Name}"?`,
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
        const response = await LoanDocumentApi.delete(id);
        if (response.success) {
          toast.success(response.message);
          navigate("/masters/loan-management/loan-doc-master");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete loan document");
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

  const getMandatoryBadge = (isMandatory) => {
    return isMandatory ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Mandatory
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" /> Optional
      </span>
    );
  };

  const getOriginalBadge = (isOriginal) => {
    return isOriginal ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Original Required
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" /> Copy Accepted
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
          <div style={styles.sectionTitle}>Basic Information</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{...styles.td, ...styles.textBold}}>Code</td>
                <td style={styles.td}>{loanDocument?.LD_Code || "—"}</td>
                <td style={{...styles.td, ...styles.textBold}}>Name</td>
                <td style={styles.td}>{loanDocument?.LD_Name}</td>
               </tr>
               <tr>
                <td style={{...styles.td, ...styles.textBold}}>Loan Type</td>
                <td style={styles.td}>{loanDocument?.loan_type?.LT_Name} ({loanDocument?.loan_type?.LT_Code})</td>
                <td style={{...styles.td, ...styles.textBold}}>Status</td>
                <td style={styles.td}>{loanDocument?.Is_Active ? "Active" : "Inactive"}</td>
               </tr>
            </tbody>
           </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Document Settings</div>
          <table style={styles.table}>
            <tbody>
               <tr>
                <td style={{...styles.td, ...styles.textBold}}>Is Mandatory</td>
                <td style={styles.td}>{loanDocument?.Is_Mandatory ? "Yes" : "No"}</td>
                <td style={{...styles.td, ...styles.textBold}}>Require Original</td>
                <td style={styles.td}>{loanDocument?.Is_Original ? "Yes" : "No"}</td>
               </tr>
            </tbody>
           </table>
        </div>

        {loanDocument?.Loan_Doc && loanDocument.Loan_Doc.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Documents</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Document Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>URL</th>
                 </tr>
              </thead>
              <tbody>
                {loanDocument.Loan_Doc.map((doc) => (
                  <tr key={doc.doc_lib_id}>
                    <td style={styles.td}>{doc.name}</td>
                    <td style={styles.td}>{doc.type?.toUpperCase()}</td>
                    <td style={styles.td}>{doc.url}</td>
                   </tr>
                ))}
              </tbody>
             </table>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>System Information</div>
          <table style={styles.table}>
            <tbody>
               <tr>
                <td style={{...styles.td, ...styles.textBold}}>Created</td>
                <td style={styles.td}>{formatDateTime(loanDocument?.created_at)}</td>
                <td style={{...styles.td, ...styles.textBold}}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(loanDocument?.updated_at)}</td>
               </tr>
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
        <p className="mt-4 text-gray-600">Loading loan document details...</p>
      </div>
    );
  }

  if (!loanDocument) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Loan Document Not Found</h2>
        <button onClick={() => navigate("/masters/loan-management/loan-doc-master")} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Loan Documents
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showPrint && (
        <PrintLayout 
          title="Loan Document Details Report" 
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
          <button onClick={() => navigate("/masters/loan-management/loan-doc-master")} className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Document Details</h1>
            <p className="text-sm text-gray-600">{loanDocument.LD_Name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPrint(true)} className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-sm font-medium">
            <Printer className="h-4 w-4 mr-2" /> Print
          </button>
          <Link to={`/masters/loan-management/loan-doc-master/edit/${id}`} className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-sm font-medium">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
          <button onClick={handleDelete} className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-sm font-medium">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Hash className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Code</span>
                </div>
                <p className="text-lg font-semibold text-purple-600">{loanDocument.LD_Code || "—"}</p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{loanDocument.LD_Name}</p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Loan Type</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{loanDocument.loan_type?.LT_Name}</p>
                  <p className="text-xs text-gray-500">{loanDocument.loan_type?.LT_Code}</p>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                </div>
                {getStatusBadge(loanDocument.Is_Active)}
              </div>
            </div>
          </div>
        </div>

        {/* Document Settings */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Document Settings</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Mandatory Status</span>
                </div>
                {getMandatoryBadge(loanDocument.Is_Mandatory)}
                <p className="mt-2 text-xs text-gray-500">
                  {loanDocument.Is_Mandatory 
                    ? "This document is mandatory for loan application" 
                    : "This document is optional for loan application"}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <File className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Original Document</span>
                </div>
                {getOriginalBadge(loanDocument.Is_Original)}
                <p className="mt-2 text-xs text-gray-500">
                  {loanDocument.Is_Original 
                    ? "Original document copy is required" 
                    : "Photocopy of document is acceptable"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        {loanDocument.Loan_Doc && loanDocument.Loan_Doc.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Uploaded Documents</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loanDocument.Loan_Doc.map((doc) => (
                  <div key={doc.doc_lib_id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <File className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{doc.type?.toUpperCase()}</p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Created</span>
                </div>
                <p className="text-sm text-gray-700">{formatDateTime(loanDocument.created_at)}</p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Last Updated</span>
                </div>
                <p className="text-sm text-gray-700">{formatDateTime(loanDocument.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLoanDocument;