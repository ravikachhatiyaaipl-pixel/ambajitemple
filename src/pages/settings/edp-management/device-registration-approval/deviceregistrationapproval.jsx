import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Shield,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Globe,
  User,
  Calendar,
  Clock,
  AlertCircle,
  Info,
  HardDrive,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";

const DeviceRegistrationApproval = () => {
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
    total: 0,
  });

  const statusOptions = [
    { value: "all", label: "All Status", color: "gray", icon: Filter },
    {
      value: "APPROVAL_REQUESTED",
      label: "Pending",
      color: "yellow",
      icon: AlertCircle,
    },
    {
      value: "REGISTRATION_SUBMITTED",
      label: "Approved",
      color: "green",
      icon: CheckCircle,
    },
    { value: "APPROVED", label: "Approved", color: "green", icon: CheckCircle },
    { value: "REJECTED", label: "Rejected", color: "red", icon: XCircle },
    { value: "EXPIRED", label: "Expired", color: "orange", icon: Calendar },
  ];

  const deviceTypeIcons = {
    MOBILE: Smartphone,
    TABLET: Tablet,
    DESKTOP: Laptop,
    LAPTOP: Laptop,
    WORKSTATION: Monitor,
    SERVER: HardDrive,
    OTHER: Smartphone,
  };

  const deviceTypeColors = {
    MOBILE: "blue",
    TABLET: "purple",
    DESKTOP: "indigo",
    LAPTOP: "cyan",
    WORKSTATION: "teal",
    SERVER: "gray",
    OTHER: "slate",
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, statusFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/device-logs`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      // The API returns an array directly
      const logsData = response.data || [];
      setLogs(logsData);
      calculateStats(logsData);
      setTotalItems(logsData.length);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to fetch device registration logs");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logsData) => {
    const stats = {
      pending: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      total: logsData.length,
    };

    logsData.forEach((log) => {
      switch (log.action_type) {
        case "APPROVAL_REQUESTED":
          stats.pending++;
          break;
        case "REGISTRATION_SUBMITTED":
          stats.submitted++;
          stats.approved++; // Count as approved for display
          break;
        case "APPROVED":
          stats.approved++;
          break;
        case "REJECTED":
          stats.rejected++;
          break;
        case "EXPIRED":
          stats.expired++;
          break;
      }
    });

    setStats(stats);
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((log) => {
        const user = log.user || {};
        const deviceData = log.device_data || {};

        return (
          user.username?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.full_name?.toLowerCase().includes(term) ||
          deviceData.device_name?.toLowerCase().includes(term) ||
          deviceData.ip_address?.includes(term) ||
          deviceData.ip?.includes(term) ||
          deviceData.device_id?.toLowerCase().includes(term) ||
          deviceData.device_type?.toLowerCase().includes(term) ||
          log.action_details?.toLowerCase().includes(term) ||
          log.ip_address?.includes(term)
        );
      });
    }

    // Apply status filter
    if (statusFilter != "all") {
      filtered = filtered.filter((log) => log.action_type == statusFilter);
    }

    setFilteredLogs(filtered);
    setTotalItems(filtered.length);
  };

  const getStatusBadge = (actionType) => {
    // Map REGISTRATION_SUBMITTED to show as "Approved"
    let displayType = actionType;
    let displayLabel = "";
    let displayColor = "gray";
    let Icon = Filter;

    if (actionType == "REGISTRATION_SUBMITTED") {
      displayLabel = "Approved";
      displayColor = "green";
      Icon = CheckCircle;
    } else {
      const status = statusOptions.find((opt) => opt.value == actionType);
      if (status) {
        displayLabel = status.label;
        displayColor = status.color;
        Icon = status.icon;
      }
    }

    const colorClasses = {
      yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
      green: "bg-green-50 text-green-800 border-green-200",
      red: "bg-red-50 text-red-800 border-red-200",
      blue: "bg-blue-50 text-blue-800 border-blue-200",
      orange: "bg-orange-50 text-orange-800 border-orange-200",
      gray: "bg-gray-50 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[displayColor] || colorClasses.gray}`}
      >
        <Icon className="h-3 w-3 mr-1.5" />
        {displayLabel}
      </span>
    );
  };

  const getDeviceIcon = (deviceType) => {
    const type = deviceType?.toUpperCase() || "OTHER";
    const Icon = deviceTypeIcons[type] || deviceTypeIcons.OTHER;
    const color = deviceTypeColors[type] || deviceTypeColors.OTHER;

    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
      cyan: "bg-cyan-50 border-cyan-200 text-cyan-600",
      teal: "bg-teal-50 border-teal-200 text-teal-600",
      gray: "bg-gray-50 border-gray-200 text-gray-600",
      slate: "bg-slate-50 border-slate-200 text-slate-600",
    };

    return (
      <div
        className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.slate}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    );
  };

  const getDeviceTypeDisplay = (deviceData) => {
    if (!deviceData) return "Unknown";

    if (deviceData.device_type) {
      return (
        deviceData.device_type.charAt(0).toUpperCase() +
        deviceData.device_type.slice(1).toLowerCase()
      );
    }

    // Try to determine from user_agent if available
    if (deviceData.user_agent) {
      const userAgent = deviceData.user_agent.toLowerCase();
      if (
        userAgent.includes("mobile") ||
        userAgent.includes("android") ||
        userAgent.includes("iphone")
      ) {
        return "Mobile";
      } else if (userAgent.includes("tablet") || userAgent.includes("ipad")) {
        return "Tablet";
      } else if (
        userAgent.includes("windows") ||
        userAgent.includes("mac") ||
        userAgent.includes("linux")
      ) {
        return "Desktop";
      }
    }

    // Show whatever is in the data
    return "Device";
  };

  const getDeviceDisplayInfo = (deviceData) => {
    if (!deviceData) return "No device data";

    // Just show whatever is in device_data, no static assumptions
    const details = [];

    // Check all possible field names from the API
    if (deviceData.device_name) details.push(deviceData.device_name);
    if (deviceData.device_type) details.push(deviceData.device_type);

    // Check for IP address in different possible field names
    if (deviceData.ip_address || deviceData.ip)
      details.push(deviceData.ip_address || deviceData.ip);

    if (deviceData.operating_system) details.push(deviceData.operating_system);
    if (deviceData.browser) details.push(deviceData.browser);
    if (deviceData.mac_address) details.push(`MAC: ${deviceData.mac_address}`);
    if (deviceData.hdd_serial) details.push(`HDD: ${deviceData.hdd_serial}`);

    // Check for device_id if present
    if (deviceData.device_id)
      details.push(`ID: ${deviceData.device_id.substring(0, 8)}...`);

    // If we have user_agent but no other details, extract useful info
    if (details.length == 0 && deviceData.user_agent) {
      // Extract browser name from user agent
      const userAgent = deviceData.user_agent;
      if (userAgent.includes("Chrome")) details.push("Chrome");
      else if (userAgent.includes("Firefox")) details.push("Firefox");
      else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
        details.push("Safari");
      else if (userAgent.includes("Edge")) details.push("Edge");
      else if (userAgent.includes("Opera")) details.push("Opera");

      // Add OS info from user agent
      if (userAgent.includes("Windows")) details.push("Windows");
      else if (userAgent.includes("Mac")) details.push("macOS");
      else if (userAgent.includes("Linux")) details.push("Linux");
      else if (userAgent.includes("Android")) details.push("Android");
      else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
        details.push("iOS");

      // Add device type from user agent
      if (userAgent.includes("Mobile")) details.push("Mobile");
      else if (userAgent.includes("Tablet")) details.push("Tablet");
    }

    if (details.length == 0 && deviceData.user_agent) {
      // If still no details, just show truncated user agent
      details.push(
        deviceData.user_agent.substring(0, 30) +
          (deviceData.user_agent.length > 30 ? "..." : ""),
      );
    }

    if (details.length == 0) {
      return "Device data available";
    }

    return details.join(" • ");
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setViewDialogOpen(true);
  };

  const handleApprove = async (log) => {
    const result = await Swal.fire({
      title: "Approve Device Registration?",
      text: `Are you sure you want to approve this device registration for ${log.user?.full_name || log.user?.username || "Unknown User"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, approve!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoadingAction(true);

      // Update the device log status via PUT request - change to REGISTRATION_SUBMITTED
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/device-logs/${log.log_id}`,
        {
          action_type: "REGISTRATION_SUBMITTED",
          // Add any additional fields if needed by the API
        },
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data?.success || response.status == 200) {
        toast.success("Device registration approved successfully!");

        // Update local state
        setLogs((prevLogs) =>
          prevLogs.map((l) =>
            l.log_id == log.log_id
              ? { ...l, action_type: "REGISTRATION_SUBMITTED" }
              : l,
          ),
        );

        setStats((prev) => ({
          ...prev,
          pending: prev.pending - 1,
          submitted: prev.submitted + 1,
          approved: prev.approved + 1,
        }));
      } else {
        toast.error(
          response.data?.message || "Failed to approve device registration",
        );
      }
    } catch (error) {
      console.error("Error approving device:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to approve device registration";
      toast.error(errorMessage);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async (log) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Device Registration",
      text: `Please provide a reason for rejecting this device registration for ${log.user?.full_name || log.user?.username || "Unknown User"}:`,
      icon: "warning",
      input: "textarea",
      inputPlaceholder: "Enter rejection reason...",
      inputAttributes: {
        maxlength: "500",
      },
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Please provide a rejection reason";
        }
      },
    });

    if (!reason) return;

    try {
      setLoadingAction(true);

      // Update the device log status via PUT request
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/device-logs/${log.log_id}`,
        {
          action_type: "REJECTED",
          rejection_reason: reason,
          // Add any additional fields if needed by the API
        },
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data?.success || response.status == 200) {
        toast.success("Device registration rejected!");

        // Update local state
        setLogs((prevLogs) =>
          prevLogs.map((l) =>
            l.log_id == log.log_id
              ? {
                  ...l,
                  action_type: "REJECTED",
                  rejection_reason: reason,
                }
              : l,
          ),
        );

        setStats((prev) => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1,
        }));
      } else {
        toast.error(
          response.data?.message || "Failed to reject device registration",
        );
      }
    } catch (error) {
      console.error("Error rejecting device:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to reject device registration";
      toast.error(errorMessage);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  const parseUserAgent = (userAgent) => {
    if (!userAgent) return "Unknown";

    // Extract browser name from user agent
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";

    return "Browser";
  };

  const getDeviceRegistrationDetails = (log) => {
    // Extract device registration details from the log
    const deviceData = log.device_data || {};

    const details = {
      deviceName: deviceData.device_name || "Unknown Device",
      deviceType: getDeviceTypeDisplay(deviceData),
      ipAddress:
        deviceData.ip_address || deviceData.ip || log.ip_address || "N/A",
      browser: deviceData.browser || parseUserAgent(deviceData.user_agent),
      operatingSystem: deviceData.operating_system || "Unknown",
      userAgent: deviceData.user_agent || log.user_agent || "N/A",
      macAddress: deviceData.mac_address || "N/A",
      hddSerial: deviceData.hdd_serial || "N/A",
      motherboardSerial: deviceData.motherboard_serial || "N/A",
      processorId: deviceData.processor_id || "N/A",
      platform: deviceData.platform || "N/A",
      screenResolution: deviceData.screen_resolution || "N/A",
      timezone: deviceData.timezone || "N/A",
      browserFingerprint: deviceData.browser_fingerprint || "N/A",
      deviceId: deviceData.device_id || "N/A",
    };

    return details;
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading device registrations...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => window.history.back()}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Device Registration Approval
            </h1>
            <p className="text-gray-600 mt-1">
              Review and manage device registration requests from users
            </p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Pending Approval
              </p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="p-2 bg-yellow-200 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Submitted</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {stats.submitted}
              </p>
            </div>
            <div className="p-2 bg-blue-200 rounded-lg">
              <Clock className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {stats.approved}
              </p>
            </div>
            <div className="p-2 bg-green-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {stats.rejected}
              </p>
            </div>
            <div className="p-2 bg-red-200 rounded-lg">
              <XCircle className="h-6 w-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-2 bg-slate-200 rounded-lg">
              <Shield className="h-6 w-6 text-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user, device, IP..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilter}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 w-full flex items-center justify-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLogs.length == 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Shield className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        No device registrations found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm || statusFilter != "all"
                          ? "Try adjusting your filters"
                          : "No registrations available"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const deviceDetails = getDeviceRegistrationDetails(log);
                  return (
                    <tr key={log.log_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.user?.full_name ||
                                log.user?.username ||
                                "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {log.user?.email || "No email"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {log.user?.mobile || "No mobile"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {getDeviceIcon(getDeviceTypeDisplay(log.device_data))}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {getDeviceDisplayInfo(log.device_data)}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {log.device_data?.ip_address ||
                                  log.device_data?.ip ||
                                  log.ip_address ||
                                  "N/A"}
                              </span>
                            </p>
                            {log.device_data?.device_id && (
                              <p className="text-xs text-gray-400 truncate">
                                ID: {log.device_data.device_id.substring(0, 16)}
                                ...
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {log.action_details}
                          </p>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(log.performed_at)}
                            <Clock className="h-3 w-3 ml-3 mr-1" />
                            {formatTime(log.performed_at)}
                          </div>
                          {log.queue_id && (
                            <p className="text-xs text-gray-500 mt-1">
                              Queue ID: {log.queue_id}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.action_type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {log.action_type == "APPROVAL_REQUESTED" && (
                            <>
                              <button
                                onClick={() => handleApprove(log)}
                                disabled={loadingAction}
                                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(log)}
                                disabled={loadingAction}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage == 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg ${
                          currentPage == pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage == totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      {selectedLog && viewDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setViewDialogOpen(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-xl shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mr-3">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Device Registration Details
                      </h3>
                      <p className="text-sm text-gray-500">
                        Log ID: {selectedLog.log_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewDialogOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                      <User className="h-5 w-5 text-gray-600 mr-2" />
                      <h4 className="font-medium text-gray-900">
                        User Information
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="font-medium">
                          {selectedLog.user?.full_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Username</p>
                        <p className="font-medium">
                          {selectedLog.user?.username || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">
                          {selectedLog.user?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Mobile</p>
                        <p className="font-medium">
                          {selectedLog.user?.mobile || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">User ID</p>
                        <p className="font-medium">
                          {selectedLog.user_id || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                      <Info className="h-5 w-5 text-gray-600 mr-2" />
                      <h4 className="font-medium text-gray-900">
                        Request Information
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(selectedLog.action_type)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Action Details</p>
                        <p className="font-medium">
                          {selectedLog.action_details}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Request Date & Time
                        </p>
                        <p className="font-medium">
                          {formatDate(selectedLog.performed_at)} at{" "}
                          {formatTime(selectedLog.performed_at)}
                        </p>
                      </div>
                      {selectedLog.queue_id && (
                        <div>
                          <p className="text-xs text-gray-500">Queue ID</p>
                          <p className="font-medium">{selectedLog.queue_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Device Information */}
                  {(selectedLog.device_data ||
                    selectedLog.ip_address ||
                    selectedLog.user_agent) && (
                    <>
                      <div className="lg:col-span-2 bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <Smartphone className="h-5 w-5 text-gray-600 mr-2" />
                          <h4 className="font-medium text-gray-900">
                            Device Information
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedLog.device_data?.device_name && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Device Name
                              </p>
                              <p className="font-medium">
                                {selectedLog.device_data.device_name}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.device_type && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Device Type
                              </p>
                              <p className="font-medium capitalize">
                                {selectedLog.device_data.device_type}
                              </p>
                            </div>
                          )}
                          {(selectedLog.device_data?.ip_address ||
                            selectedLog.device_data?.ip ||
                            selectedLog.ip_address) && (
                            <div>
                              <p className="text-xs text-gray-500">
                                IP Address
                              </p>
                              <p className="font-medium">
                                {selectedLog.device_data?.ip_address ||
                                  selectedLog.device_data?.ip ||
                                  selectedLog.ip_address}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.device_id && (
                            <div>
                              <p className="text-xs text-gray-500">Device ID</p>
                              <p className="font-medium text-sm font-mono">
                                {selectedLog.device_data.device_id}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.browser && (
                            <div>
                              <p className="text-xs text-gray-500">Browser</p>
                              <p className="font-medium">
                                {selectedLog.device_data.browser}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.operating_system && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Operating System
                              </p>
                              <p className="font-medium">
                                {selectedLog.device_data.operating_system}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.mac_address && (
                            <div>
                              <p className="text-xs text-gray-500">
                                MAC Address
                              </p>
                              <p className="font-medium">
                                {selectedLog.device_data.mac_address}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.hdd_serial && (
                            <div>
                              <p className="text-xs text-gray-500">
                                HDD Serial
                              </p>
                              <p className="font-medium">
                                {selectedLog.device_data.hdd_serial}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.motherboard_serial && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Motherboard Serial
                              </p>
                              <p className="font-medium">
                                {selectedLog.device_data.motherboard_serial}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.processor_id && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Processor ID
                              </p>
                              <p className="font-medium">
                                {selectedLog.device_data.processor_id}
                              </p>
                            </div>
                          )}
                          {selectedLog.device_data?.user_agent && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-gray-500">
                                User Agent
                              </p>
                              <p className="font-medium text-sm">
                                {selectedLog.device_data.user_agent}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setViewDialogOpen(false)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedLog.action_type == "APPROVAL_REQUESTED" && (
                    <>
                      <button
                        onClick={() => {
                          setViewDialogOpen(false);
                          handleReject(selectedLog);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setViewDialogOpen(false);
                          handleApprove(selectedLog);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceRegistrationApproval;
