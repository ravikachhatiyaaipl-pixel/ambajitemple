import { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  XCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function LedgerGrouping() {
  const navigate = useNavigate();
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [allLedgerGroups, setAllLedgerGroups] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [editLedgerGroup, setEditLedgerGroup] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [loadingState, setLoadingState] = useState({
    initialFetch: true,
    addLedgerGroup: false,
    updateLedgerGroup: false,
    deleteLedgerGroup: false,
    filterLedgerGroup: false,
    toggleStatus: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [formError, setFormError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const isLoading = Object.values(loadingState).some((state) => state);

  const getGrSttString = (Gr_St) => {
    if (Gr_St == null || Gr_St == undefined) return "";
    return Gr_St.toString();
  };

  const getNextGroupCode = (parentGroup) => {
    if (!parentGroup) {
      const level1Items = allLedgerGroups.filter(
        (lg) => getGrSttString(lg.Gr_St) == "1",
      );
      const maxCode = level1Items.reduce((max, item) => {
        const codeNum = parseInt(item.Gr_Cd.substring(0, 2));
        return codeNum > max ? codeNum : max;
      }, 0);
      const nextCode = (maxCode + 1).toString().padStart(2, "0");
      return {
        Gr_Cd: `${nextCode}000000`,
        Gr_Sr: (level1Items.length + 1).toString(),
        Gr_St: 1,
        Up_Gr: `${nextCode}000000`,
      };
    }

    const parentGrCode = parentGroup.Gr_Cd;
    const parentGrStt = getGrSttString(parentGroup.Gr_St);

    if (parentGrStt == "1") {
      const siblings = allLedgerGroups.filter(
        (lg) =>
          lg.Gr_Cd.startsWith(parentGrCode.substring(0, 2)) &&
          lg.Gr_Cd.match(/^\d{2}\d{2}0000$/) &&
          getGrSttString(lg.Gr_St) == "2",
      );

      const maxSibling = siblings.reduce((max, item) => {
        const siblingNum = parseInt(item.Gr_Cd.substring(2, 4));
        return siblingNum > max ? siblingNum : max;
      }, 0);

      const nextNum = maxSibling + 1;
      return {
        Gr_Cd: `${parentGrCode.substring(0, 2)}${nextNum
          .toString()
          .padStart(2, "0")}0000`,
        Gr_Sr: (siblings.length + 1).toString(),
        Gr_St: 2,
        Up_Gr: parentGrCode,
      };
    } else if (parentGrStt == "2") {
      const siblings = allLedgerGroups.filter(
        (lg) =>
          lg.Gr_Cd.startsWith(parentGrCode.substring(0, 4)) &&
          lg.Gr_Cd.match(/^\d{2}\d{2}\d{2}00$/) &&
          getGrSttString(lg.Gr_St) == "3",
      );

      const maxSibling = siblings.reduce((max, item) => {
        const siblingNum = parseInt(item.Gr_Cd.substring(4, 6));
        return siblingNum > max ? siblingNum : max;
      }, 0);

      const nextNum = maxSibling + 1;
      return {
        Gr_Cd: `${parentGrCode.substring(0, 4)}${nextNum
          .toString()
          .padStart(2, "0")}00`,
        Gr_Sr: (siblings.length + 1).toString(),
        Gr_St: 3,
        Up_Gr: parentGrCode,
      };
    } else if (parentGrStt == "3") {
      const siblings = allLedgerGroups.filter(
        (lg) =>
          lg.Gr_Cd.startsWith(parentGrCode.substring(0, 6)) &&
          lg.Gr_Cd.match(/^\d{2}\d{2}\d{2}\d{2}$/) &&
          getGrSttString(lg.Gr_St) == "4",
      );

      const maxSibling = siblings.reduce((max, item) => {
        const siblingNum = parseInt(item.Gr_Cd.substring(6, 8));
        return siblingNum > max ? siblingNum : max;
      }, 0);

      const nextNum = maxSibling + 1;
      return {
        Gr_Cd: `${parentGrCode.substring(0, 6)}${nextNum
          .toString()
          .padStart(2, "0")}`,
        Gr_Sr: (siblings.length + 1).toString(),
        Gr_St: 4,
        Up_Gr: parentGrCode,
      };
    }

    return {
      Gr_Cd: parentGrCode,
      Gr_Sr: "1",
      Gr_St: 4,
      Up_Gr: parentGrCode,
    };
  };

  const getGroupLevel = (grStt) => {
    return parseInt(getGrSttString(grStt));
  };

  const getFilteredLedgerGroups = () => {
    let filtered = ledgerGroups;

    if (expandedItems.size == 0) {
      return filtered.filter((lg) => getGrSttString(lg.Gr_St) == "1");
    }

    const visibleItems = [];

    filtered.forEach((lg) => {
      if (getGrSttString(lg.Gr_St) == "1") {
        visibleItems.push(lg);
      } else {
        const parentPrefix = lg.Gr_Cd.substring(0, 2);
        const isParentExpanded = Array.from(expandedItems).some(
          (expandedId) => {
            const expandedItem = filtered.find(
              (item) => item.Gr_Id == expandedId,
            );
            return (
              expandedItem &&
              expandedItem.Gr_Cd.startsWith(parentPrefix) &&
              getGrSttString(expandedItem.Gr_St) == "1"
            );
          },
        );

        if (isParentExpanded) {
          visibleItems.push(lg);
        }
      }
    });

    return visibleItems.sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd));
  };

  const filteredLedgerGroups = getFilteredLedgerGroups();

  const stats = {
    total: ledgerGroups.length,
    level1: ledgerGroups.filter((lg) => getGrSttString(lg.Gr_St) == "1").length,
    level2: ledgerGroups.filter((lg) => getGrSttString(lg.Gr_St) == "2").length,
    level3: ledgerGroups.filter((lg) => getGrSttString(lg.Gr_St) == "3").length,
    level4: ledgerGroups.filter((lg) => getGrSttString(lg.Gr_St) == "4").length,
    active: ledgerGroups.filter((lg) => lg.is_del == "N").length,
    inactive: ledgerGroups.filter((lg) => lg.is_del == "Y").length,
    expenditure: ledgerGroups.filter((lg) => lg.Gr_Exp == "Y").length,
    budget: ledgerGroups.filter((lg) => lg.Gr_Buk == "Y").length,
    printing: ledgerGroups.filter((lg) => lg.Gr_Prt == "Y").length,
  };

  const toggleExpand = (ledgerGroup) => {
    const newExpandedItems = new Set(expandedItems);
    if (expandedItems.has(ledgerGroup.Gr_Id)) {
      newExpandedItems.delete(ledgerGroup.Gr_Id);
    } else {
      newExpandedItems.add(ledgerGroup.Gr_Id);
    }
    setExpandedItems(newExpandedItems);
  };

  const hasChildren = (ledgerGroup) => {
    if (getGrSttString(ledgerGroup.Gr_St) != "1") return false;
    const prefix = ledgerGroup.Gr_Cd.substring(0, 2);
    return ledgerGroups.some(
      (lg) =>
        getGrSttString(lg.Gr_St) != "1" &&
        lg.Gr_Cd.startsWith(prefix) &&
        lg.Gr_Id != ledgerGroup.Gr_Id,
    );
  };

  const getIndentedGroupNameAndStyle = (ledgerGroup) => {
    const level = getGroupLevel(ledgerGroup.Gr_St);
    const indentLevels = {
      1: "",
      2: "    ",
      3: "        ",
      4: "            ",
    };
    const rowStyles = {
      1: "bg-blue-50",
      2: "bg-green-50",
      3: "bg-yellow-50",
      4: "bg-purple-50",
    };

    const opacityClass = ledgerGroup.is_del == "N" ? "" : "";

    return {
      name: `${indentLevels[level] || ""}${ledgerGroup.Gr_Nm}`,
      rowClass: `${rowStyles[level] || "bg-gray-50"} ${opacityClass}`,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, initialFetch: true }));

        const orgResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/lst-org-master`,
          {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const orgData = orgResponse.data.data || [];
        setOrganizations(orgData);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
            }
          }
        );

        const ledgerGroupsData = response.data.data || response.data;
        console.log("Fetched ledger groups:", ledgerGroupsData);

        const sortedLedgerGroups = Array.isArray(ledgerGroupsData)
          ? ledgerGroupsData.sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
          : [];

        setAllLedgerGroups(sortedLedgerGroups);
        setLedgerGroups(sortedLedgerGroups);

        console.log("Total groups:", sortedLedgerGroups.length);
        sortedLedgerGroups.forEach((lg) => {
          console.log(
            `Group: ${lg.Gr_Nm}, Gr_St: ${lg.Gr_St} (type: ${typeof lg.Gr_St})`,
          );
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoadingState((prev) => ({ ...prev, initialFetch: false }));
      }
    };
    fetchData();
  }, []);

  const handleAddLedgerGroup = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const parent_id = formData.get("parent_id");
    const Gr_Nm = formData.get("Gr_Nm");
    const Gr_Exp = formData.get("Gr_Exp") || "N";
    const Gr_Buk = formData.get("Gr_Buk") || "N";
    const Gr_Prt = formData.get("Gr_Prt") || "N";
    const is_del = formData.get("is_del") || "N";

    const orgId = organizations.length > 0 ? organizations[0].Org_Id : "1";

    if (!Gr_Nm) {
      setFormError("Group Name is required.");
      return;
    }

    try {
      setLoadingState((prev) => ({ ...prev, addLedgerGroup: true }));

      const parentGroup = allLedgerGroups.find((lg) => lg.Gr_Id == parent_id);
      const newGroupCode = getNextGroupCode(parentGroup);

      const newLedgerGroup = {
        Org_Id: orgId,
        Gr_Nm,
        Gr_Exp,
        Gr_Buk,
        Gr_Prt,
        is_del,
        ...newGroupCode,
      };

      console.log("Adding new ledger group:", newLedgerGroup);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ledg-grps`,
        newLedgerGroup,
        {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      console.log("Add response:", response.data);

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
          {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const ledgerGroupsData =
          refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(ledgerGroupsData)
          ? ledgerGroupsData.sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
          : [];

        setAllLedgerGroups(sortedData);
        setLedgerGroups(sortedData);

        setShowForm(false);
        setFormError(null);
        toast.success("Ledger group added successfully!");
      } else {
        setFormError(response.data.message || "Failed to add ledger group.");
      }
    } catch (error) {
      console.error("Error adding ledger group:", error);
      console.error("Error details:", error.response?.data);
      setFormError(
        error.response?.data?.message ||
          "Failed to add ledger group. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, addLedgerGroup: false }));
    }
  };

  const handleEdit = (ledgerGroup) => {
    setEditLedgerGroup(ledgerGroup);
    setShowEditForm(ledgerGroup.Gr_Id);
    setFormError(null);
  };

  const handleUpdateLedgerGroup = async (e) => {
    e.preventDefault();
    if (!editLedgerGroup) return;

    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const Gr_Nm = formData.get("Gr_Nm");
    const Gr_Exp = formData.get("Gr_Exp") || "N";
    const Gr_Buk = formData.get("Gr_Buk") || "N";
    const Gr_Prt = formData.get("Gr_Prt") || "N";
    const is_del = formData.get("is_del") || "N";

    if (!Gr_Nm) {
      setFormError("Group Name is required.");
      return;
    }

    const updatedLedgerGroup = {
      ...editLedgerGroup,
      Gr_Nm: Gr_Nm || editLedgerGroup.Gr_Nm,
      Gr_Exp: Gr_Exp,
      Gr_Buk: Gr_Buk,
      Gr_Prt: Gr_Prt,
      is_del: is_del,
    };

    try {
      setLoadingState((prev) => ({ ...prev, updateLedgerGroup: true }));
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/ledg-grps/${editLedgerGroup.Gr_Id}`,
        updatedLedgerGroup,
        {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
          {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const ledgerGroupsData =
          refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(ledgerGroupsData)
          ? ledgerGroupsData.sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
          : [];

        setAllLedgerGroups(sortedData);
        setLedgerGroups(sortedData);

        setShowEditForm(null);
        setEditLedgerGroup(null);
        setFormError(null);
        toast.success("Ledger group updated successfully!");
      } else {
        setFormError(response.data.message || "Failed to update ledger group.");
      }
    } catch (error) {
      console.error("Error updating ledger group:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to update ledger group. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, updateLedgerGroup: false }));
    }
  };

  const handleDeleteLedgerGroup = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This will mark it as deleted but not remove it permanently.`,
      )
    )
      return;

    try {
      setLoadingState((prev) => ({ ...prev, deleteLedgerGroup: true }));
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/ledg-grps/${id}`,
        {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
          {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const ledgerGroupsData =
          refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(ledgerGroupsData)
          ? ledgerGroupsData.sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
          : [];

        setAllLedgerGroups(sortedData);
        setLedgerGroups(sortedData);

        toast.success("Ledger group marked as deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete ledger group.");
      }
    } catch (error) {
      console.error("Error deleting ledger group:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete ledger group. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, deleteLedgerGroup: false }));
    }
  };

  const handleToggleActive = async (ledgerGroup) => {
    try {
      setLoadingState((prev) => ({ ...prev, toggleStatus: true }));

      const newStatus = ledgerGroup.is_del == "Y" ? "N" : "Y";

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/ledg-grps/${ledgerGroup.Gr_Id}`,
        {
          ...ledgerGroup,
          is_del: newStatus,
        },
        {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
          {
            headers: {
                          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
            }
          }
        );
        const ledgerGroupsData =
          refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(ledgerGroupsData)
          ? ledgerGroupsData.sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
          : [];

        setAllLedgerGroups(sortedData);
        setLedgerGroups(sortedData);

        toast.success(
          `Ledger group ${
            newStatus == "N" ? "restored" : "marked as deleted"
          } successfully!`,
        );
      } else {
        toast.error(response.data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update status. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, toggleStatus: false }));
    }
  };

  const handleViewDetails = (ledgerGroup) => {
    setShowDetails(ledgerGroup.Gr_Id);
  };

  const handleRefresh = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, filterLedgerGroup: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
        {
          headers: {
                        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );
      const ledgerGroupsData = response.data.data || response.data;
      const sortedData = Array.isArray(ledgerGroupsData)
        ? ledgerGroupsData.sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
        : [];

      setAllLedgerGroups(sortedData);
      setLedgerGroups(sortedData);

      setExpandedItems(new Set());
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setLoadingState((prev) => ({ ...prev, filterLedgerGroup: false }));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() == "") {
      setLedgerGroups(allLedgerGroups);
    } else {
      const filtered = allLedgerGroups.filter(
        (lg) =>
          lg.Gr_Nm.toLowerCase().includes(e.target.value.toLowerCase()) ||
          lg.Gr_Cd.includes(e.target.value),
      );
      setLedgerGroups(filtered);
    }
  };

  if (isLoading && loadingState.initialFetch) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ledger groups...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Ledger Group Management
            </h1>
          </div>
          <p className="text-gray-600 ml-9">
            Manage hierarchical ledger account groups
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loadingState.filterLedgerGroup}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                loadingState.filterLedgerGroup ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ledger Group
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-10 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">Total Groups</p>
              <p className="text-xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800">Level 1</p>
              <p className="text-xl font-bold text-green-900">{stats.level1}</p>
            </div>
            <div className="bg-green-500 text-white p-2 rounded-lg">
              <span className="text-xs font-bold">L1</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800">Level 2</p>
              <p className="text-xl font-bold text-yellow-900">
                {stats.level2}
              </p>
            </div>
            <div className="bg-yellow-500 text-white p-2 rounded-lg">
              <span className="text-xs font-bold">L2</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800">Level 3</p>
              <p className="text-xl font-bold text-purple-900">
                {stats.level3}
              </p>
            </div>
            <div className="bg-purple-500 text-white p-2 rounded-lg">
              <span className="text-xs font-bold">L3</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pink-800">Level 4</p>
              <p className="text-xl font-bold text-pink-900">{stats.level4}</p>
            </div>
            <div className="bg-pink-500 text-white p-2 rounded-lg">
              <span className="text-xs font-bold">L4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by group name or code..."
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Groups Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Codes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level (Gr_St)
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLedgerGroups.length > 0 ? (
                filteredLedgerGroups.map((ledgerGroup) => {
                  const { name, rowClass } =
                    getIndentedGroupNameAndStyle(ledgerGroup);
                  const isExpanded = expandedItems.has(ledgerGroup.Gr_Id);
                  const showExpandIcon =
                    getGrSttString(ledgerGroup.Gr_St) == "1" &&
                    hasChildren(ledgerGroup);
                  const level = getGroupLevel(ledgerGroup.Gr_St);
                  const grSttString = getGrSttString(ledgerGroup.Gr_St);

                  const levelStatus =
                    grSttString == "1"
                      ? "Level 1"
                      : grSttString == "2"
                        ? "Level 2"
                        : grSttString == "3"
                          ? "Level 3"
                          : "Level 4";

                  return (
                    <tr
                      key={ledgerGroup.Gr_Id}
                      className={`hover:bg-gray-50 transition-colors ${rowClass}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedItems.includes(ledgerGroup.Gr_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([
                                ...selectedItems,
                                ledgerGroup.Gr_Id,
                              ]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter(
                                  (id) => id != ledgerGroup.Gr_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-4">
                        {showExpandIcon && (
                          <button
                            onClick={() => toggleExpand(ledgerGroup)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <Minus className="h-4 w-4 text-gray-600" />
                            ) : (
                              <Plus className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center mr-3 ${
                              grSttString == "1"
                                ? "bg-blue-100 text-blue-600"
                                : grSttString == "2"
                                  ? "bg-green-100 text-green-600"
                                  : grSttString == "3"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            <span className="text-xs font-bold">
                              L{grSttString}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              Code:
                            </span>{" "}
                            {ledgerGroup.Gr_Cd}
                          </div>
                          <div className="text-xs text-gray-500">
                            Parent: {ledgerGroup.Up_Gr || "None"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {grSttString == "1" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {levelStatus}
                            </span>
                          ) : grSttString == "2" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {levelStatus}
                            </span>
                          ) : grSttString == "3" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {levelStatus}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {levelStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {ledgerGroup.Gr_Exp == "Y" && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                              title="Expenditure Group"
                            >
                              EXP
                            </span>
                          )}
                          {ledgerGroup.Gr_Buk == "Y" && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                              title="Budget Group"
                            >
                              BUK
                            </span>
                          )}
                          {ledgerGroup.Gr_Prt == "Y" && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800"
                              title="Printing Group"
                            >
                              PRT
                            </span>
                          )}
                          {ledgerGroup.is_del == "Y" && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                              title="Effective Sub-Ledger"
                            >
                              DEL
                            </span>
                          )}
                          {ledgerGroup.Gr_Exp == "N" &&
                            ledgerGroup.Gr_Buk == "N" &&
                            ledgerGroup.Gr_Prt == "N" && (
                              <span className="text-xs text-gray-400 italic">
                                No flags
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(ledgerGroup)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(ledgerGroup)}
                            className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteLedgerGroup(
                                ledgerGroup.Gr_Id,
                                ledgerGroup.Gr_Nm,
                              )
                            }
                            className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FolderTree className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">
                        No ledger groups found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first ledger group"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Ledger Group
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ledger Group Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setFormError(null);
            }}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Ledger Group
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={loadingState.addLedgerGroup}
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleAddLedgerGroup} className="space-y-4">
              {/* Error Display */}
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Ledger Group
                </label>
                <div className="relative">
                  <select
                    name="parent_id"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Parent Group (Optional)</option>
                    {Array.isArray(allLedgerGroups) &&
                      allLedgerGroups
                        .sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
                        .map((lg) => (
                          <option key={lg.Gr_Id} value={lg.Gr_Id}>
                            {getIndentedGroupNameAndStyle(lg).name}
                          </option>
                        ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to create a top-level group
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="Gr_Nm"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter group name"
                  required
                  autoFocus
                />
              </div>

              {/* Optional Fields Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Optional Flags
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="Gr_Exp"
                      name="Gr_Exp"
                      value="Y"
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="Gr_Exp"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      Expenditure Group
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="Gr_Buk"
                      name="Gr_Buk"
                      value="Y"
                      className="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                    />
                    <label
                      htmlFor="Gr_Buk"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      Booking Records
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="Gr_Prt"
                      name="Gr_Prt"
                      value="Y"
                      className="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                    />
                    <label
                      htmlFor="Gr_Prt"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      Party Records
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_del"
                      name="is_del"
                      value="Y"
                      className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <label
                      htmlFor="is_del"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      Prevent to Delete
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  All flags are optional. Default value is 'N' if not selected.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loadingState.addLedgerGroup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                  disabled={loadingState.addLedgerGroup}
                >
                  {loadingState.addLedgerGroup
                    ? "Creating..."
                    : "Create Ledger Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ledger Group Modal */}
      {showEditForm && editLedgerGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowEditForm(null);
              setFormError(null);
            }}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Ledger Group
              </h2>
              <button
                onClick={() => {
                  setShowEditForm(null);
                  setFormError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={loadingState.updateLedgerGroup}
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleUpdateLedgerGroup} className="space-y-4">
              {/* Error Display */}
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="Gr_Nm"
                  defaultValue={editLedgerGroup.Gr_Nm}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter group name"
                  required
                  autoFocus
                />
              </div>

              {/* Optional Fields Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Optional Flags
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit_gr_exp"
                      name="Gr_Exp"
                      value="Y"
                      defaultChecked={editLedgerGroup.Gr_Exp == "Y"}
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="edit_gr_exp"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      Expenditure Group
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit_gr_buk"
                      name="Gr_Buk"
                      value="Y"
                      defaultChecked={editLedgerGroup.Gr_Buk == "Y"}
                      className="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                    />
                    <label
                      htmlFor="edit_gr_buk"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      Booking Records
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit_gr_prt"
                      name="Gr_Prt"
                      value="Y"
                      defaultChecked={editLedgerGroup.Gr_Prt == "Y"}
                      className="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                    />
                    <label
                      htmlFor="edit_gr_prt"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      Party Records
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit_is_del"
                      name="is_del"
                      value="Y"
                      defaultChecked={editLedgerGroup.is_del == "Y"}
                      className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <label
                      htmlFor="edit_is_del"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      Prevent to Delete
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  All flags are optional. Default value is 'N' if not selected.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(null);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loadingState.updateLedgerGroup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                  disabled={loadingState.updateLedgerGroup}
                >
                  {loadingState.updateLedgerGroup
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetails && ledgerGroups.find((lg) => lg.Gr_Id == showDetails) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(null)}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Ledger Group Details
              </h2>
              <button
                onClick={() => setShowDetails(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {(() => {
                const ledgerGroup = ledgerGroups.find(
                  (lg) => lg.Gr_Id == showDetails,
                );
                const { name } = getIndentedGroupNameAndStyle(ledgerGroup);
                const grSttString = getGrSttString(ledgerGroup.Gr_St);

                return (
                  <>
                    <div className="flex items-center mb-4">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center mr-4 ${
                          grSttString == "1"
                            ? "bg-blue-100 text-blue-600"
                            : grSttString == "2"
                              ? "bg-green-100 text-green-600"
                              : grSttString == "3"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <span className="text-lg font-bold">
                          L{grSttString}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {name}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Group Code
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 font-medium">
                            {ledgerGroup.Gr_Cd}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Parent Group
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {ledgerGroup.Up_Gr || "None"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Group Serial
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {ledgerGroup.Gr_Sr}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Level (Gr_St)
                        </label>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              grSttString == "1"
                                ? "bg-blue-100 text-blue-800"
                                : grSttString == "2"
                                  ? "bg-green-100 text-green-800"
                                  : grSttString == "3"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            Level {grSttString}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Flags Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Flags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {ledgerGroup.Gr_Exp == "Y" && (
                          <div className="flex items-center px-3 py-1.5 bg-purple-50 rounded-lg">
                            <div>
                              <p className="text-xs font-medium text-purple-800">
                                Expenditure
                              </p>
                            </div>
                          </div>
                        )}
                        {ledgerGroup.Gr_Buk == "Y" && (
                          <div className="flex items-center px-3 py-1.5 bg-yellow-50 rounded-lg">
                            <div>
                              <p className="text-xs font-medium text-yellow-800">
                                Booking Records
                              </p>
                            </div>
                          </div>
                        )}
                        {ledgerGroup.Gr_Prt == "Y" && (
                          <div className="flex items-center px-3 py-1.5 bg-pink-50 rounded-lg">
                            <div>
                              <p className="text-xs font-medium text-pink-800">
                                Party Records
                              </p>
                            </div>
                          </div>
                        )}

                        {ledgerGroup.is_del == "Y" && (
                          <div className="flex items-center px-3 py-1.5 bg-red-50 rounded-lg">
                            <div>
                              <p className="text-xs font-medium text-red-800">
                                Deleted (Y)
                              </p>
                            </div>
                          </div>
                        )}
                        {ledgerGroup.Gr_Exp == "N" &&
                          ledgerGroup.Gr_Buk == "N" &&
                          ledgerGroup.Gr_Prt == "N" &&
                          ledgerGroup.is_del == "N" && (
                            <div className="text-sm text-gray-500 italic">
                              No special flags set
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-4">
                      <button
                        onClick={() => setShowDetails(null)}
                        className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
