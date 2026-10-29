import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  Hash,
  Code,
  Info,
  Calendar,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmpLanguageApi from "../../../services/emplanguageapi";

const ViewEmpLanguage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguageData();
  }, [id]);

  const loadLanguageData = async () => {
    setLoading(true);
    try {
      const response = await EmpLanguageApi.getById(id);

      if (response.success) {
        setLanguage(response.data);
      } else {
        toast.error(response.message || "Failed to load employee language data!");
        navigate("/masters/employee-records/employee-language-master");
      }
    } catch (error) {
      toast.error("Failed to load employee language data!");
      navigate("/masters/employee-records/employee-language-master");
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employee language details...</p>
      </div>
    );
  }

  if (!language) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Employee language not found</p>
        <Link
          to="/masters/employee-records/employee-language-master"
          className="mt-4 inline-flex items-center text-green-600 hover:text-green-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-records/employee-language-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language.Elg_Name}
                </h1>
                {/* <div className="flex items-center flex-wrap gap-2 mt-1">
                  
                  {language.ELg_Code && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Code: {language.ELg_Code}
                    </span>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/employee-records/employee-language-master/edit/${id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Language Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Language Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <Code className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {language.ELg_Code || "—"}
                      </span>
                      {language.ELg_Code && (
                        <button
                          onClick={() =>
                            handleCopyToClipboard(language.ELg_Code)
                          }
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Language Name
                    </label>
                    <div className="mt-1 flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {language.Elg_Name}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(language.Elg_Name)
                        }
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmpLanguage;