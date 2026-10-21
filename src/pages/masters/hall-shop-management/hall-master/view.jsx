import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit, Trash2, Hash, MapPin, Building, Home, 
  Layers, Eye, Download, Calendar, CheckCircle, XCircle,
  Square, Ruler, Users
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallApi from "../../../services/hallapi";

const ViewHall = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Hall");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/masters/hall-shop-management/hall-master";
      const currentMenuItem = menuDetails.find((i) => i.Menu_Links == currentPath);
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallApi.getById(id);
      setItem(res?.data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${pageTitle}?`,
      text: `Are you sure you want to delete "${item?.HLM_Name}"? This action cannot be undone.`,
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
      await HallApi.delete(id);
      toast.success(`"${item?.HLM_Name}" deleted successfully!`);
      navigate("/masters/hall-shop-management/hall-master");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/hall-shop-management/hall-master")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">{item.HLM_Name?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{item.HLM_Name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {item.HLM_Code && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 font-mono">
                    <Hash className="h-3 w-3 mr-1" />{item.HLM_Code}
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.HLM_Active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.HLM_Active ? 'Active' : 'Inactive'}
                </span>
                {item.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Layers className="h-3 w-3 mr-1" />{item.category.HLC_Name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/hall-shop-management/hall-master/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />Edit
          </Link>
        
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Hall Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hall Name</label>
                    <div className="mt-1 text-gray-900 font-medium">{item.HLM_Name}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hall Code</label>
                    <div className="mt-1 text-gray-900 font-mono">
                      {item.HLM_Code || <span className="text-gray-400 italic">Not specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <div className="mt-1">
                      {item.category ? (
                        <div className="text-gray-900">
                          {item.category.HLC_Name}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {item.HLM_Loca || <span className="text-gray-400 italic">Not specified</span>}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Building</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      {item.HLM_Bldg || <span className="text-gray-400 italic">Not specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Floor</label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Home className="h-4 w-4 text-gray-400 mr-2" />
                      {item.HLM_Flor || <span className="text-gray-400 italic">Not specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Block</label>
                    <div className="mt-1 text-gray-900">
                      {item.HLM_Blok || <span className="text-gray-400 italic">Not specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Unit Number</label>
                    <div className="mt-1 text-gray-900">
                      {item.HLM_Unit || <span className="text-gray-400 italic">Not specified</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Area & Capacity Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Area & Capacity Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Sq Ft:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {item.HLM_SqFt || <span className="text-gray-400 italic">N/A</span>}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Sq Mt:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {item.HLM_SqMt || <span className="text-gray-400 italic">N/A</span>}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {item.HLM_Capa || <span className="text-gray-400 italic">N/A</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Facilities</h3>
                <div className="text-gray-900">
                  {item.HLM_Fclt || <span className="text-gray-400 italic">No facilities specified</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Status & Documents */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center">
                  {item.HLM_Active ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-700">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium text-red-700">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-700">{formatDate(item.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-700">{formatDate(item.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            </div>
            <div className="p-6">
              {item.Documents && item.Documents.length > 0 ? (
                <div className="space-y-2">
                  {item.Documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                        {doc.split('/').pop()}
                      </span>
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <Download className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHall;