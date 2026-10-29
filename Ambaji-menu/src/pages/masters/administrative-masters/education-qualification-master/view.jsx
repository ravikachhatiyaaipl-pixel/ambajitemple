import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Edit,
  Copy,
  Code,
  Tag,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Award,
  Brain,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import EducationApi from "../../../services/educationApi";

const ViewEducation = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [education, setEducation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEducationData();
    }
  }, [id]);

  const loadEducationData = async () => {
    setLoading(true);
    try {
      const response = await EducationApi.getById(id);
      console.log("View API Response:", response); // Debug log

      if (response.success) {
        setEducation(response.data);
      } else {
        toast.error(
          response.message || "Failed to load education qualification data!",
        );
        navigate(
          "/masters/administrative-masters/education-qualification-master",
        );
      }
    } catch (error) {
      console.error("Error loading education:", error);
      toast.error("Failed to load education qualification data!");
      navigate(
        "/masters/administrative-masters/education-qualification-master",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
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
      return dateString;
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
      return dateString;
    }
  };

  // Helper function to check if a value is Yes/True
  const isYes = (value) => {
    return value == "Y" || value == 1 || value == "1" || value == true;
  };

  // Helper function to format Y/N values for display
  const formatYesNo = (value) => {
    return isYes(value) ? "Yes" : "No";
  };

  const getYesNoBadge = (value, label, color = "green") => {
    const yes = isYes(value);
    const colors = {
      green: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: CheckCircle,
        border: "border-green-200",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        icon: Award,
        border: "border-purple-200",
      },
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: Brain,
        border: "border-blue-200",
      },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        icon: Briefcase,
        border: "border-indigo-200",
      },
      pink: {
        bg: "bg-pink-50",
        text: "text-pink-700",
        icon: TrendingUp,
        border: "border-pink-200",
      },
      amber: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: CheckCircle,
        border: "border-amber-200",
      },
    };
    const selectedColor = colors[color] || colors.green;
    const Icon = selectedColor.icon;

    return (
      <div
        className={`flex items-center p-3 rounded-lg border ${selectedColor.border} ${selectedColor.bg}`}
      >
        <div
          className={`w-8 h-8 rounded-full ${yes ? selectedColor.bg : "bg-gray-100"} flex items-center justify-center mr-3 border ${selectedColor.border}`}
        >
          <Icon
            className={`h-4 w-4 ${yes ? selectedColor.text : "text-gray-500"}`}
          />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p
            className={`text-base font-semibold ${yes ? selectedColor.text : "text-gray-500"}`}
          >
            {yes ? "Yes" : "No"}
          </p>
        </div>
      </div>
    );
  };

  const InfoRow = ({ label, value, icon: Icon, onCopy }) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      {Icon && <Icon className="h-5 w-5 text-gray-400 mt-0.5" />}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="flex items-center">
          <p className="text-gray-900 font-medium">{value || "—"}</p>
          {onCopy && value && value != "—" && (
            <button
              onClick={() => onCopy(value, label)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={`Copy ${label}`}
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading education qualification details...
        </p>
      </div>
    );
  }

  if (!education) {
    return (
      <div className="p-12 text-center">
        <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          Education qualification not found
        </p>
        <Link
          to="/masters/administrative-masters/education-qualification-master"
          className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/masters/administrative-masters/education-qualification-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {education.EEd_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  {education.EEd_Code && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Code: {education.EEd_Code}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      isYes(education.Is_Active)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isYes(education.Is_Active) ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/administrative-masters/education-qualification-master/edit/${id}`}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" /> Edit Qualification
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Qualification Code"
                  value={education.EEd_Code || "—"}
                  icon={Code}
                  onCopy={handleCopyToClipboard}
                />
                <InfoRow
                  label="Qualification Name"
                  value={education.EEd_Name}
                  icon={Tag}
                  onCopy={handleCopyToClipboard}
                />
                <InfoRow
                  label="Status"
                  value={isYes(education.Is_Active) ? "Active" : "Inactive"}
                  icon={isYes(education.Is_Active) ? ToggleRight : ToggleLeft}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Qualification Attributes */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Qualification Attributes
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {getYesNoBadge(education.Is_Mandatory, "Mandatory", "purple")}
              {getYesNoBadge(education.Is_Technical, "Technical", "blue")}
              {getYesNoBadge(
                education.Is_Professional,
                "Professional",
                "indigo",
              )}
              {getYesNoBadge(education.Is_Promotional, "Promotional", "pink")}
              {getYesNoBadge(education.Rec_Valid, "Record Valid", "amber")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEducation;
