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
  DollarSign,
  RotateCcw,
  Info
} from "lucide-react";
import { toast } from "react-hot-toast";
import SigniWorkApi from "../../../services/signiworkapi";

const ViewSigniWork = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkData();
  }, [id]);

  const loadWorkData = async () => {
    setLoading(true);
    try {
      const response = await SigniWorkApi.getById(id);
      if (response.success) {
        setWork(response.data);
      } else {
        toast.error(response.message || "Failed to load significant work data!");
        navigate("/masters/performance-discipline-masters/significant-work-master");
      }
    } catch (error) {
      toast.error("Failed to load significant work data!");
      navigate("/masters/performance-discipline-masters/significant-work-master");
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
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading significant work details...</p>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Significant work not found</p>
        <Link to="/masters/performance-discipline-masters/significant-work-master" className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-800">
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
          <button onClick={() => navigate("/masters/performance-discipline-masters/significant-work-master")} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{work.SWrk_Name}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    ID: #{work.SWrk_Id}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${work.Is_Active == 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {work.Is_Active == 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link to={`/masters/performance-discipline-masters/significant-work-master/edit/${id}`} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
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
              <h2 className="text-lg font-semibold text-gray-900">Work Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Sub-col */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Work ID</label>
                    <div className="mt-1"><span className="text-gray-900 font-medium">#{work.SWrk_Id}</span></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Work Code</label>
                    <div className="mt-1 flex items-center">
                      <Code className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">{work.SWrk_Code || '—'}</span>
                      {work.SWrk_Code && (
                        <button onClick={() => handleCopyToClipboard(work.SWrk_Code)} className="ml-2 text-gray-400 hover:text-gray-600" title="Copy"><Copy className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Has Fees</label>
                    <div className="mt-1 flex items-center">
                      <DollarSign className={`h-5 w-5 ${work.SWrk_Fees == 1 ? "text-green-600" : "text-gray-400"} mr-2`} />
                      <span className={work.SWrk_Fees == 1 ? "text-green-700 font-medium" : "text-gray-500"}>
                        {work.SWrk_Fees == 1 ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Right Sub-col */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Work Name</label>
                    <div className="mt-1 flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">{work.SWrk_Name}</span>
                      <button onClick={() => handleCopyToClipboard(work.SWrk_Name)} className="ml-2 text-gray-400 hover:text-gray-600" title="Copy"><Copy className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Is Reimbursable</label>
                    <div className="mt-1 flex items-center">
                      <RotateCcw className={`h-5 w-5 ${work.Is_Reimburse == 1 ? "text-green-600" : "text-gray-400"} mr-2`} />
                      <span className={work.Is_Reimburse == 1 ? "text-green-700 font-medium" : "text-gray-500"}>
                        {work.Is_Reimburse == 1 ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1 flex items-center">
                      {work.Is_Active == 1 ? (
                        <><ToggleRight className="h-5 w-5 text-green-600 mr-2" /><span className="text-green-700 font-medium">Active</span></>
                      ) : (
                        <><ToggleLeft className="h-5 w-5 text-gray-400 mr-2" /><span className="text-gray-500">Inactive</span></>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center"><Tag className="h-5 w-5 text-purple-600 mr-2" /><span className="text-sm font-medium text-gray-700">Name</span></div>
                <span className="text-sm font-semibold text-purple-700">{work.SWrk_Name}</span>
              </div>
              {work.SWrk_Code && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center"><Code className="h-5 w-5 text-blue-600 mr-2" /><span className="text-sm font-medium text-gray-700">Code</span></div>
                  <span className="text-sm font-semibold text-blue-700">{work.SWrk_Code}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center"><DollarSign className="h-5 w-5 text-green-600 mr-2" /><span className="text-sm font-medium text-gray-700">Has Fees</span></div>
                <span className="text-sm font-semibold text-green-700">{work.SWrk_Fees == 1 ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <div className="flex items-center"><RotateCcw className="h-5 w-5 text-pink-600 mr-2" /><span className="text-sm font-medium text-gray-700">Reimbursable</span></div>
                <span className="text-sm font-semibold text-pink-700">{work.Is_Reimburse == 1 ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center"><Info className="h-5 w-5 text-amber-600 mr-2" /><span className="text-sm font-medium text-gray-700">ID</span></div>
                <span className="text-sm font-semibold text-amber-700">#{work.SWrk_Id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSigniWork;