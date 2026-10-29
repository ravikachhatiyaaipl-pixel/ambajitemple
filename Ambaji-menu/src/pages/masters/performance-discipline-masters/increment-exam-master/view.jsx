import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Edit,
  Copy,
  Code,
  Tag,
  ToggleLeft,
  ToggleRight,
  Calendar,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import IncExamApi from "../../../services/incexamapi";

const ViewIncExam = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadExamData();
    }
  }, [id]);

  const loadExamData = async () => {
    setLoading(true);
    try {
      const response = await IncExamApi.getById(id);
      console.log("View API Response:", response); // Debug log
      if (response && response.success) {
        setExam(response.data);
      } else {
        toast.error(response?.message || "Failed to load increment exam data!");
        navigate(
          "/masters/performance-discipline-masters/increment-exam-master",
        );
      }
    } catch (error) {
      console.error("Error loading exam:", error);
      toast.error("Failed to load increment exam data!");
      navigate("/masters/performance-discipline-masters/increment-exam-master");
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
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const getStatusBadge = (value) => {
    const isYes = value == "Y" || value == true || value == 1 || value == "1";
    return isYes ? (
      <div className="flex items-center text-green-700">
        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
        <span>Yes</span>
      </div>
    ) : (
      <div className="flex items-center text-gray-500">
        <XCircle className="h-5 w-5 text-gray-400 mr-2" />
        <span>No</span>
      </div>
    );
  };

  const isActive = (value) => {
    return value == true || value == 1 || value == "1";
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading increment exam details...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Increment exam not found</p>
        <Link
          to="/masters/performance-discipline-masters/increment-exam-master"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Link>
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
                "/masters/performance-discipline-masters/increment-exam-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {exam.EEd_Name || "N/A"}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ID: #{exam.EEd_Id || "N/A"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive(exam.Is_Active) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {isActive(exam.Is_Active) ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/performance-discipline-masters/increment-exam-master/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Exam Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Sub-col */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Exam ID
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900 font-medium">
                        #{exam.EEd_Id || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Exam Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <Code className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {exam.EEd_Code || "—"}
                      </span>
                      {exam.EEd_Code && (
                        <button
                          onClick={() => handleCopyToClipboard(exam.EEd_Code)}
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
                      Is Mandatory
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(exam.Is_Mandatory)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Is Technical
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(exam.Is_Technical)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Record Valid
                    </label>
                    <div className="mt-1">{getStatusBadge(exam.Rec_Valid)}</div>
                  </div>
                </div>
                {/* Right Sub-col */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Exam Name
                    </label>
                    <div className="mt-1 flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {exam.EEd_Name || "N/A"}
                      </span>
                      {exam.EEd_Name && (
                        <button
                          onClick={() => handleCopyToClipboard(exam.EEd_Name)}
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
                      Is Professional
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(exam.Is_Professional)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Is Promotional
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(exam.Is_Promotional)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-1 flex items-center">
                      {isActive(exam.Is_Active) ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-green-700 font-medium">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-500">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Info Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Tag className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Name
                  </span>
                </div>
                <span
                  className="text-sm font-semibold text-blue-700 truncate max-w-[150px]"
                  title={exam.EEd_Name}
                >
                  {exam.EEd_Name || "N/A"}
                </span>
              </div>
              {exam.EEd_Code && (
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div className="flex items-center">
                    <Code className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Code
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-indigo-700">
                    {exam.EEd_Code}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Mandatory
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-700">
                  {exam.Is_Mandatory == "Y" ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Code className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Technical
                  </span>
                </div>
                <span className="text-sm font-semibold text-purple-700">
                  {exam.Is_Technical == "Y" ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-pink-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Professional
                  </span>
                </div>
                <span className="text-sm font-semibold text-pink-700">
                  {exam.Is_Professional == "Y" ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Promotional
                  </span>
                </div>
                <span className="text-sm font-semibold text-amber-700">
                  {exam.Is_Promotional == "Y" ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-cyan-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">ID</span>
                </div>
                <span className="text-sm font-semibold text-cyan-700">
                  #{exam.EEd_Id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewIncExam;
