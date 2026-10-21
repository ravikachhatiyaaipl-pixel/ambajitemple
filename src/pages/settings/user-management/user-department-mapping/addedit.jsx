/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Building,
  User,
  Link,
  AlertCircle,
  ChevronDown,
  Search,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import UserDepartmentMapping from "../../../services/userdepartmentmapping";

const AddEditUserDepartmentMapping = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchUserTerm, setSearchUserTerm] = useState("");
  const [searchDeptTerm, setSearchDeptTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [originalDepartments, setOriginalDepartments] = useState([]);
  const [pageTitle, setPageTitle] = useState("User-Department Mapping");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/settings/user-management/user-department-mapping";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  const [formData, setFormData] = useState({
    Usr_Id: "",
    Dpt_Id: [],
    Status: "1", // Default status active
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDropdowns();

    if (id && id != "create") {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setSelectedUser(null);
      setSelectedDepartments([]);
      setFormData({ Usr_Id: "", Dpt_Id: [], Status: "1" });
      setErrors({});
    }
  }, [id, location]);

  useEffect(() => {
    if (isEditMode && id) {
      loadMappingData();
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (searchUserTerm.trim()) {
      const term = searchUserTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(term) ||
          user.Usr_Email?.toLowerCase().includes(term) ||
          user.Usr_Name?.toLowerCase().includes(term) ||
          user.Usr_Mobile?.includes(term),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchUserTerm, users]);

  useEffect(() => {
    if (searchDeptTerm.trim()) {
      const term = searchDeptTerm.toLowerCase();
      const filtered = departments.filter(
        (dept) =>
          dept.Dpt_Desc?.toLowerCase().includes(term) ||
          dept.Dpt_Name?.toLowerCase().includes(term) ||
          dept.GrCod?.toLowerCase().includes(term),
      );
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(departments);
    }
  }, [searchDeptTerm, departments]);

  const loadDropdowns = async () => {
    try {
      const [usersResponse, deptResponse] = await Promise.all([
        UserDepartmentMapping.getUsers(),
        UserDepartmentMapping.getDepartments(),
      ]);

      if (usersResponse.success) {
        const usersData = usersResponse.data || [];

        const filteredUsersData = usersData.filter((user) => user.Usr_Id != 1);

        setUsers(filteredUsersData);
        setFilteredUsers(filteredUsersData);
      }

      if (deptResponse.success) {
        const deptData = deptResponse.data || [];
        const activeDepts = deptData.filter((dept) => dept.isvisible == "1");
        setDepartments(activeDepts);
        setFilteredDepartments(activeDepts);
      }
    } catch (error) {
      console.error("Failed to load dropdowns:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const response = await UserDepartmentMapping.getById(id);
      if (response.status == true) {
        const mappingData = response.data;

        const dptIds = Array.isArray(mappingData.Dpt_Id)
          ? mappingData.Dpt_Id.map(Number)
          : mappingData.Dpt_Id
          ? [Number(mappingData.Dpt_Id)]
          : [];

        setFormData({
          Usr_Id: mappingData.Usr_Id?.toString() || "",
          Dpt_Id: dptIds,
          Status: mappingData.Status?.toString() || "1",
        });

        if (mappingData.user) {
          setSelectedUser(mappingData.user);
          setOriginalUser(mappingData.user);
        }
        const loadedDepts = mappingData.departments || (mappingData.department ? [mappingData.department] : []);
        setSelectedDepartments(loadedDepts);
        setOriginalDepartments(loadedDepts);
      } else {
        toast.error("Failed to load mapping data!");
        navigate("/settings/user-management/user-department-mapping");
      }
    } catch (error) {
      console.error("Error loading mapping:", error);
      toast.error("Failed to load mapping data!");
      navigate("/settings/user-management/user-department-mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setFormData((prev) => ({
      ...prev,
      Usr_Id: user.Usr_Id.toString(),
    }));
    setSelectedUser(user);
    setUserSearchOpen(false);
    setSearchUserTerm("");

    if (errors.Usr_Id) {
      setErrors((prev) => ({ ...prev, Usr_Id: null }));
    }
  };

  const handleDepartmentSelect = (department) => {
    const isSelected = formData.Dpt_Id.includes(department.Dpt_id);
    const updatedIds = isSelected
      ? formData.Dpt_Id.filter((id) => id !=  department.Dpt_id)
      : [...formData.Dpt_Id, department.Dpt_id];
    const updatedDepts = isSelected
      ? selectedDepartments.filter((d) => d.Dpt_id !=  department.Dpt_id)
      : [...selectedDepartments, department];

    setFormData((prev) => ({ ...prev, Dpt_Id: updatedIds }));
    setSelectedDepartments(updatedDepts);
    // keep dropdown open for multi-select
    if (errors.Dpt_Id) {
      setErrors((prev) => ({ ...prev, Dpt_Id: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Usr_Id) {
      newErrors.Usr_Id = "User is required";
    }

    if (!formData.Dpt_Id || formData.Dpt_Id.length == 0) {
      newErrors.Dpt_Id = "At least one department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    const submitData = {
      Usr_Id: parseInt(formData.Usr_Id),
      Dpt_Id: formData.Dpt_Id.map(Number),
      Status: 1,
    };

    const currentSelectedUser = users.find(
      (user) => user.Usr_Id.toString() == formData.Usr_Id,
    );

    let confirmationMessage = "";
    if (isEditMode) {
      const changes = [];

      if (originalUser?.Usr_Id.toString() != formData.Usr_Id) {
        changes.push(
          `<strong>User:</strong> ${originalUser?.full_name || "N/A"} → ${currentSelectedUser?.full_name || "N/A"}`,
        );
      }

      const origIds = originalDepartments.map((d) => d.Dpt_id).sort().join(",");
      const newIds = [...formData.Dpt_Id].sort().join(",");
      if (origIds !=  newIds) {
        changes.push(
          `<strong>Departments:</strong> ${selectedDepartments.map((d) => d.Dpt_Desc).join(", ") || "N/A"}`,
        );
      }

      if (changes.length == 0) {
        toast.info("No changes detected");
        return;
      }

      confirmationMessage = `
        <div class="text-left">
          <p class="mb-2">Update this user-department mapping?</p>
          <div class="text-sm text-gray-600 mb-2">
            ${changes.join("<br/>")}
          </div>
        </div>
      `;
    } else {
      confirmationMessage = `
        <div class="text-left">
          <p class="mb-2">Create a new user-department mapping?</p>
          <p class="text-sm text-gray-600 mb-1"><strong>User:</strong> ${currentSelectedUser?.full_name || "Not selected"}</p>
          <p class="text-sm text-gray-600 mb-2"><strong>Departments:</strong> ${selectedDepartments.map((d) => d.Dpt_Desc).join(", ") || "Not selected"}</p>
        </div>
      `;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Mapping?" : "Create New Mapping?",
      html: confirmationMessage,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      let response;

      if (isEditMode) {
        response = await UserDepartmentMapping.update(id, submitData);
        toast.success("Mapping updated successfully!");
      } else {
        response = await UserDepartmentMapping.create(submitData);
        toast.success("Mapping created successfully!");
      }

      setTimeout(() => {
        navigate("/settings/user-management/user-department-mapping");
      }, 1500);
    } catch (error) {
      console.error("Error saving mapping:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[
            key == "Usr_Id" ? "Usr_Id" : key == "Dpt_Id" ? "Dpt_Id" : key
          ] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update mapping. Please try again."
            : "Failed to create mapping. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/settings/user-management/user-department-mapping");
  };

  const refreshData = () => {
    loadDropdowns();
    if (isEditMode && id) {
      loadMappingData();
    }
    toast.success("Data refreshed!");
  };

  const clearUserSelection = () => {
    setSelectedUser(null);
    setFormData((prev) => ({ ...prev, Usr_Id: "" }));
    setSearchUserTerm("");
  };

  const clearDepartmentSelection = () => {
    setSelectedDepartments([]);
    setFormData((prev) => ({ ...prev, Dpt_Id: [] }));
    setSearchDeptTerm("");
  };

  const hasChanges = () => {
    if (!isEditMode) return true;
    const userChanged = originalUser?.Usr_Id.toString() != formData.Usr_Id;
    const origIds = originalDepartments.map((d) => d.Dpt_id).sort().join(",");
    const newIds = [...formData.Dpt_Id].sort().join(",");
    return userChanged || origIds !=  newIds;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading mapping data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/settings/user-management/user-department-mapping")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Mapping" : "Add New Mapping"}
            </h1>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mapping Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mr-3">
              <Link className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Mapping Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Selection - Updated field name to Usr_Id */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserSearchOpen(!userSearchOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-left ${
                    errors.Usr_Id ? "border-red-300" : "border-gray-300"
                  } hover:bg-gray-50`}
                >
                  {selectedUser ? (
                    <div className="flex items-center w-full">
                      <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-900">
                          {selectedUser.full_name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {selectedUser.Usr_Email}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-0.5">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{selectedUser.Usr_Mobile}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-500">Select a user...</span>
                    </div>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${userSearchOpen ? "rotate-180" : ""} flex-shrink-0`}
                  />
                </button>

                {selectedUser && (
                  <button
                    type="button"
                    onClick={clearUserSelection}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                    title="Clear selection"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}

                {userSearchOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users by name, email, or mobile..."
                          value={searchUserTerm}
                          onChange={(e) => setSearchUserTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-64">
                      {filteredUsers.length == 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No users found</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <button
                              key={user.Usr_Id}
                              type="button"
                              onClick={() => handleUserSelect(user)}
                              className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">
                                    {user.full_name}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                    <Mail className="h-3 w-3 mr-1" />
                                    <span>{user.Usr_Email}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                    <Phone className="h-3 w-3 mr-1" />
                                    <span>{user.Usr_Mobile}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {errors.Usr_Id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Usr_Id}
                  </p>
                )}
              </div>
              {selectedUser &&
                isEditMode &&
                originalUser?.Usr_Id.toString() != formData.Usr_Id && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <div className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>
                        Changed from: <strong>{originalUser?.full_name}</strong>
                      </span>
                    </div>
                  </div>
                )}
              <p className="mt-2 text-xs text-gray-500">
                {isEditMode ? "Click dropdown to change user" : "Select a user"}
              </p>
            </div>

            {/* Department Selection - Updated field name to Dpt_Id */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDepartmentSearchOpen(!departmentSearchOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-left ${
                    errors.Dpt_Id ? "border-red-300" : "border-gray-300"
                  } hover:bg-gray-50`}
                >
                  {selectedDepartments.length > 0 ? (
                    <div className="flex items-center w-full">
                      <Building className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="font-medium text-gray-900">
                        {selectedDepartments.length == 1
                          ? selectedDepartments[0].Dpt_Desc
                          : `${selectedDepartments.length} departments selected`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-500">Select department(s)...</span>
                    </div>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${departmentSearchOpen ? "rotate-180" : ""} flex-shrink-0`}
                  />
                </button>

                {selectedDepartments.length > 0 && (
                  <button
                    type="button"
                    onClick={clearDepartmentSelection}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                    title="Clear selection"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}

                {departmentSearchOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search departments by name or code..."
                          value={searchDeptTerm}
                          onChange={(e) => setSearchDeptTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-64">
                      {filteredDepartments.length == 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>No departments found</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {filteredDepartments.map((dept) => {
                            const isChecked = formData.Dpt_Id.includes(dept.Dpt_id);
                            return (
                            <button
                              key={dept.Dpt_id}
                              type="button"
                              onClick={() => handleDepartmentSelect(dept)}
                              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${isChecked ? "bg-blue-50" : ""}`}
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <Building className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="ml-3 flex-1">
                                  <p className="font-medium text-gray-900">
                                    {dept.Dpt_Desc}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                    <span>{dept.Dpt_Name || "No code"}</span>
                                  </div>
                                </div>
                                {isChecked && <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                              </div>
                            </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {errors.Dpt_Id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Dpt_Id}
                  </p>
                )}
              </div>
              {selectedDepartments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedDepartments.map((dept) => (
                    <span
                      key={dept.Dpt_id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {dept.Dpt_Desc}
                      <button
                        type="button"
                        onClick={() => handleDepartmentSelect(dept)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {isEditMode
                  ? "Click dropdown to change departments"
                  : "Select one or more departments"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0"></div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                saving ||
                !formData.Usr_Id ||
                formData.Dpt_Id.length == 0 ||
                (isEditMode && !hasChanges())
              }
              className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm ${
                saving ||
                !formData.Usr_Id ||
                formData.Dpt_Id.length == 0 ||
                (isEditMode && !hasChanges())
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Mapping" : "Create Mapping"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditUserDepartmentMapping;
