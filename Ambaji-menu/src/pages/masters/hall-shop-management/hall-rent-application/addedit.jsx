import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  Calendar,
  User,
  Clock,
  Hash,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  CheckCircle,
  XCircle,
  Info,
  X,
  Users,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentApplicationApi from "../../../services/hall-rent-application-api";

const AddEditHallRentApplication = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Hall Rent Application");
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isRentalDropdownOpen, setIsRentalDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [rentalSearch, setRentalSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [highlightedRentalIndex, setHighlightedRentalIndex] = useState(-1);
  const [highlightedUserIndex, setHighlightedUserIndex] = useState(-1);
  const [initialActionId, setInitialActionId] = useState(null);
  const [actionsList, setActionsList] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Refs for focus management - User Experience Flow
  const rentalButtonRef = useRef(null);
  const rentalSearchRef = useRef(null);
  const appDateRef = useRef(null);
  const userButtonRef = useRef(null);
  const userSearchRef = useRef(null);
  const eventDateRef = useRef(null);
  const eventTypeRef = useRef(null);
  const eventModeRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const reasonRef = useRef(null);
  const remarkRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const rentalDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const rentalListRef = useRef(null);
  const userListRef = useRef(null);
  const rentalItemRefs = useRef([]);
  const userItemRefs = useRef([]);

  const [formData, setFormData] = useState({
    HLRA_Date: new Date().toISOString().split("T")[0],
    HLR_Id: "",
    Usr_Id: "",
    HLRA_StDt: "",
    HLRA_Type: "Private",
    HLRA_Mode: "FullDay",
    HLRA_SlSt: "",
    HLRA_SlEd: "",
    HLRA_Reason: "",
    HLRA_Remark: "",
  });

  // Get user ID
  const userId = (() => {
    if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
    if (user?.Usr_Id) return user.Usr_Id;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      } catch (e) {}
    }
    return null;
  })();

  // Get Fnc_Id and stage from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/hall-shop-management/hall-rent-application";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);

      if (currentMenuItem?.action?.stage) {
        const stage = currentMenuItem.action.stage;
        setCurrentStage(stage);
        loadActionsForStage(stage);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    // Set admin check
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);

    const deptId =
      user?.departmentData?.Dpt_id ||
      user?.apiUserData?.employee?.department?.Dpt_id;
    setUserDeptId(deptId ? parseInt(deptId) : null);
  }, [user]);

  // Load actions for stage
  const loadActionsForStage = async (stage) => {
    try {
      const response = await HallRentApplicationApi.getActionsByStage(stage);
      if (response.status && response.data) {
        const actions = response.data;
        setActionsList(actions);

        const initialAction = actions.find((action) => !action.Previous_Status);
        if (initialAction) {
          setInitialActionId(initialAction.Act_Id);
        }

        if (!isAdmin && userDesignationId) {
          const hasPermission = actions.some((action) => {
            const isAuthority = action.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId,
            );
            return isAuthority && !action.Previous_Status;
          });
          setHasCreatePermission(hasPermission);
        } else if (isAdmin) {
          setHasCreatePermission(true);
        }
      }
      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Error loading actions:", error);
      setPermissionsLoaded(true);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        rentalDropdownRef.current &&
        !rentalDropdownRef.current.contains(event.target)
      ) {
        setIsRentalDropdownOpen(false);
        setHighlightedRentalIndex(-1);
        setRentalSearch("");
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
        setHighlightedUserIndex(-1);
        setUserSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load rentals and users
  useEffect(() => {
    loadRentals();
    loadUsers();
  }, []);

  // Filter rentals when search changes
  useEffect(() => {
    if (!rentalSearch.trim()) {
      setFilteredRentals(rentals);
    } else {
      const searchLower = rentalSearch.toLowerCase();
      const filtered = rentals.filter(
        (rental) =>
          rental.hall?.HLM_Name?.toLowerCase().includes(searchLower) ||
          (rental.hall?.HLM_Code &&
            rental.hall.HLM_Code.toLowerCase().includes(searchLower)) ||
          (rental.HLR_Date && rental.HLR_Date.includes(searchLower)),
      );
      setFilteredRentals(filtered);
    }
    setHighlightedRentalIndex(-1);
  }, [rentalSearch, rentals]);

  // Filter users when search changes
  useEffect(() => {
    if (!userSearch.trim()) {
      setFilteredUsers(users);
    } else {
      const searchLower = userSearch.toLowerCase();
      const filtered = users.filter(
        (userItem) =>
          userItem.Usr_Name?.toLowerCase().includes(searchLower) ||
          (userItem.Usr_Email &&
            userItem.Usr_Email.toLowerCase().includes(searchLower)) ||
          (userItem.Usr_Mobile && userItem.Usr_Mobile.includes(searchLower)),
      );
      setFilteredUsers(filtered);
    }
    setHighlightedUserIndex(-1);
  }, [userSearch, users]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isRentalDropdownOpen && rentalSearchRef.current) {
      setTimeout(() => rentalSearchRef.current.focus(), 0);
    }
  }, [isRentalDropdownOpen]);

  useEffect(() => {
    if (isUserDropdownOpen && userSearchRef.current) {
      setTimeout(() => userSearchRef.current.focus(), 0);
    }
  }, [isUserDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      isRentalDropdownOpen &&
      highlightedRentalIndex >= 0 &&
      rentalListRef.current
    ) {
      const container = rentalListRef.current;
      const item = rentalItemRefs.current[highlightedRentalIndex];
      if (item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [highlightedRentalIndex, isRentalDropdownOpen]);

  useEffect(() => {
    if (
      isUserDropdownOpen &&
      highlightedUserIndex >= 0 &&
      userListRef.current
    ) {
      const container = userListRef.current;
      const item = userItemRefs.current[highlightedUserIndex];
      if (item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [highlightedUserIndex, isUserDropdownOpen]);

  useEffect(() => {
    if (isEditMode) loadData();
    else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        HLRA_Date: today,
        Usr_Id: userId || "",
      }));
      if (userId) {
        const currentUser = users.find((u) => u.Usr_Id == userId);
        if (currentUser) {
          setSelectedUser(currentUser);
          setUserSearch(currentUser.Usr_Name || "");
        }
      }
      setTimeout(() => rentalButtonRef.current?.focus(), 100);
    }
  }, [id, users]);

  const loadRentals = async () => {
    setLoadingRentals(true);
    try {
      const res = await HallRentApplicationApi.getAllHallRentals();
      setRentals(res?.data || []);
      setFilteredRentals(res?.data || []);
    } catch (error) {
      console.error("Error loading rentals:", error);
      toast.error("Failed to load rentals");
    } finally {
      setLoadingRentals(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await HallRentApplicationApi.getAllUsers();
      const userData = res?.data || [];
      setUsers(userData);
      setFilteredUsers(userData);

      if (userId && userData.length > 0) {
        const currentUser = userData.find((u) => u.Usr_Id == userId);
        if (currentUser) {
          setSelectedUser(currentUser);
          setUserSearch(currentUser.Usr_Name || "");
          setFormData((prev) => ({ ...prev, Usr_Id: userId }));
        }
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentApplicationApi.getById(id);
      const d = res?.data;

      // Format time values - remove seconds (H:i format only)
      const formatTime = (time) => {
        if (!time) return "";
        // If time has seconds (HH:MM:SS), remove seconds
        if (time.split(":").length == 3) {
          return time.substring(0, 5); // Returns HH:MM
        }
        return time;
      };

      setFormData({
        HLRA_Date: d.HLRA_Date || new Date().toISOString().split("T")[0],
        HLR_Id: d.HLR_Id || "",
        Usr_Id: d.Usr_Id || userId || "",
        HLRA_StDt: d.HLRA_StDt || "",
        HLRA_Type: d.HLRA_Type || "Private",
        HLRA_Mode: d.HLRA_Mode || "FullDay",
        HLRA_SlSt: formatTime(d.HLRA_SlSt),
        HLRA_SlEd: formatTime(d.HLRA_SlEd),
        HLRA_Reason: d.HLRA_Reason || "",
        HLRA_Remark: d.HLRA_Remark || "",
      });

      if (d.HLR_Id && d.rental) {
        setRentalSearch(
          `${d.rental.hall?.HLM_Name || ""} - ${d.rental.HLR_Date || ""}`,
        );
        setSelectedRental(d.rental);
      }

      if (d.Usr_Id) {
        const userFound = users.find((u) => u.Usr_Id == d.Usr_Id);
        if (userFound) {
          setSelectedUser(userFound);
          setUserSearch(userFound.Usr_Name || "");
        }
      }
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rent-application");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Rental dropdown keyboard handlers
  const handleRentalKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsRentalDropdownOpen(true);
      setRentalSearch("");
      setHighlightedRentalIndex(-1);
      setTimeout(() => rentalSearchRef.current?.focus(), 0);
    }
  };

  const handleRentalSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredRentals.length > 0) {
        setHighlightedRentalIndex(0);
        setTimeout(() => {
          if (rentalItemRefs.current[0]) {
            rentalItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsRentalDropdownOpen(false);
      setHighlightedRentalIndex(-1);
      setRentalSearch("");
      rentalButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredRentals.length > 0 && highlightedRentalIndex >= 0) {
        handleRentalSelect(filteredRentals[highlightedRentalIndex]);
      } else if (filteredRentals.length > 0) {
        handleRentalSelect(filteredRentals[0]);
      }
    } else if (e.key == "Tab") {
      setIsRentalDropdownOpen(false);
      setHighlightedRentalIndex(-1);
      setRentalSearch("");
    }
  };

  const handleRentalItemKeyDown = (e, rental, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredRentals.length) {
        setHighlightedRentalIndex(nextIndex);
        setTimeout(() => {
          if (rentalItemRefs.current[nextIndex]) {
            rentalItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setHighlightedRentalIndex(-1);
        setTimeout(() => rentalSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedRentalIndex(-1);
        setTimeout(() => rentalSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedRentalIndex(prevIndex);
        setTimeout(() => {
          if (rentalItemRefs.current[prevIndex]) {
            rentalItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleRentalSelect(rental);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsRentalDropdownOpen(false);
      setHighlightedRentalIndex(-1);
      setRentalSearch("");
      rentalButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsRentalDropdownOpen(false);
      setHighlightedRentalIndex(-1);
      setRentalSearch("");
    }
  };

  const handleRentalSelect = (rental) => {
    setFormData((prev) => ({
      ...prev,
      HLR_Id: rental.HLR_Id,
    }));
    setSelectedRental(rental);
    setRentalSearch(
      `${rental.hall?.HLM_Name || ""} - ${rental.HLR_Date || ""}`,
    );
    setIsRentalDropdownOpen(false);
    setHighlightedRentalIndex(-1);
    if (errors.HLR_Id) setErrors((prev) => ({ ...prev, HLR_Id: "" }));
    setTimeout(() => userButtonRef.current?.focus(), 100);
  };

  const handleRentalSearchChange = (e) => {
    setRentalSearch(e.target.value);
    setIsRentalDropdownOpen(true);
  };

  // User dropdown keyboard handlers
  const handleUserKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsUserDropdownOpen(true);
      setUserSearch("");
      setHighlightedUserIndex(-1);
      setTimeout(() => userSearchRef.current?.focus(), 0);
    }
  };

  const handleUserSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredUsers.length > 0) {
        setHighlightedUserIndex(0);
        setTimeout(() => {
          if (userItemRefs.current[0]) {
            userItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsUserDropdownOpen(false);
      setHighlightedUserIndex(-1);
      setUserSearch("");
      userButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredUsers.length > 0 && highlightedUserIndex >= 0) {
        handleUserSelect(filteredUsers[highlightedUserIndex]);
      } else if (filteredUsers.length > 0) {
        handleUserSelect(filteredUsers[0]);
      }
    } else if (e.key == "Tab") {
      setIsUserDropdownOpen(false);
      setHighlightedUserIndex(-1);
      setUserSearch("");
    }
  };

  const handleUserItemKeyDown = (e, userItem, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredUsers.length) {
        setHighlightedUserIndex(nextIndex);
        setTimeout(() => {
          if (userItemRefs.current[nextIndex]) {
            userItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setHighlightedUserIndex(-1);
        setTimeout(() => userSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedUserIndex(-1);
        setTimeout(() => userSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedUserIndex(prevIndex);
        setTimeout(() => {
          if (userItemRefs.current[prevIndex]) {
            userItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleUserSelect(userItem);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsUserDropdownOpen(false);
      setHighlightedUserIndex(-1);
      setUserSearch("");
      userButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsUserDropdownOpen(false);
      setHighlightedUserIndex(-1);
      setUserSearch("");
    }
  };

  const handleUserSelect = (userItem) => {
    setFormData((prev) => ({
      ...prev,
      Usr_Id: userItem.Usr_Id,
    }));
    setSelectedUser(userItem);
    setUserSearch(userItem.Usr_Name || "");
    setIsUserDropdownOpen(false);
    setHighlightedUserIndex(-1);
    if (errors.Usr_Id) setErrors((prev) => ({ ...prev, Usr_Id: "" }));
    setTimeout(() => eventDateRef.current?.focus(), 100);
  };

  const handleUserSearchChange = (e) => {
    setUserSearch(e.target.value);
    setIsUserDropdownOpen(true);
  };

  const validate = () => {
    const newErrors = {};

    // Required: Application Date
    if (!formData.HLRA_Date) {
      newErrors.HLRA_Date = "Application date is required";
    }

    // Required: Hall Rental
    if (!formData.HLR_Id) {
      newErrors.HLR_Id = "Please select a hall rental";
    }

    // Required: Applicant
    if (!formData.Usr_Id) {
      newErrors.Usr_Id = "Please select an applicant";
    }

    // Required: Event Date
    if (!formData.HLRA_StDt) {
      newErrors.HLRA_StDt = "Event date is required";
    }

    // Required: Type
    if (!formData.HLRA_Type) {
      newErrors.HLRA_Type = "Event type is required";
    }

    // Required: Mode
    if (!formData.HLRA_Mode) {
      newErrors.HLRA_Mode = "Event mode is required";
    }

    // Time validation
    if (formData.HLRA_SlSt && formData.HLRA_SlEd) {
      if (formData.HLRA_SlSt >= formData.HLRA_SlEd) {
        newErrors.HLRA_SlEd = "End time must be after start time";
      }
    }

    // Optional validations
    if (formData.HLRA_Reason && formData.HLRA_Reason.length > 255) {
      newErrors.HLRA_Reason = "Reason must not exceed 255 characters";
    }

    if (formData.HLRA_Remark && formData.HLRA_Remark.length > 255) {
      newErrors.HLRA_Remark = "Remark must not exceed 255 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
        if (firstErrorKey == "HLRA_Date") {
          appDateRef.current?.focus();
        } else if (firstErrorKey == "HLR_Id") {
          rentalButtonRef.current?.focus();
        } else if (firstErrorKey == "Usr_Id") {
          userButtonRef.current?.focus();
        } else if (firstErrorKey == "HLRA_StDt") {
          eventDateRef.current?.focus();
        } else if (firstErrorKey == "HLRA_Type") {
          eventTypeRef.current?.focus();
        } else if (firstErrorKey == "HLRA_Mode") {
          eventModeRef.current?.focus();
        } else if (firstErrorKey == "HLRA_SlEd") {
          endTimeRef.current?.focus();
        } else if (firstErrorKey == "HLRA_Reason") {
          reasonRef.current?.focus();
        } else if (firstErrorKey == "HLRA_Remark") {
          remarkRef.current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this application?"
        : "Are you sure you want to create this application?",
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
      const payload = {
        HLRA_Date: formData.HLRA_Date,
        HLR_Id: parseInt(formData.HLR_Id),
        Usr_Id: parseInt(formData.Usr_Id),
        HLRA_StDt: formData.HLRA_StDt,
        HLRA_Type: formData.HLRA_Type,
        HLRA_Mode: formData.HLRA_Mode,
        HLRA_SlSt: formData.HLRA_SlSt || null,
        HLRA_SlEd: formData.HLRA_SlEd || null,
        HLRA_Reason: formData.HLRA_Reason?.trim() || null,
        HLRA_Remark: formData.HLRA_Remark?.trim() || null,
        ...(!isEditMode && { HLRA_Status: initialActionId }),
      };

      if (isEditMode) {
        await HallRentApplicationApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await HallRentApplicationApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/hall-rent-application"),
        1000,
      );
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });
        setErrors(newErrors);
        const firstErrorKey = Object.keys(backendErrors)[0];
        if (firstErrorKey) {
          toast.error(backendErrors[firstErrorKey][0]);
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/hall-shop-management/hall-rent-application");
  };

  if (loading || !permissionsLoaded) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!hasCreatePermission && !isEditMode && !isAdmin) {
    return (
      <div className="p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Permission Denied
        </h3>
        <p className="text-gray-600">
          You don't have permission to create hall rent applications.
        </p>
        <button
          onClick={() =>
            navigate("/masters/hall-shop-management/hall-rent-application")
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const getSelectedRentalDisplay = () => {
    if (!formData.HLR_Id || !selectedRental) return "";
    return `${selectedRental.hall?.HLM_Name || ""} - ${selectedRental.HLR_Date || ""}`;
  };

  const getSelectedUserDisplay = () => {
    if (!formData.Usr_Id || !selectedUser) return "";
    return selectedUser.Usr_Name || "";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit ${pageTitle}` : `Add New ${pageTitle}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update hall rent application information"
                : "Create a new hall rent application"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Application Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Application Date - First field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={appDateRef}
                  type="date"
                  name="HLRA_Date"
                  value={formData.HLRA_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, rentalButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLRA_Date ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.HLRA_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.HLRA_Date}
                </p>
              )}
            </div>

            {/* Hall Rental Selection - Second field */}
            <div ref={rentalDropdownRef} className="relative w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hall Rental <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingRentals ? (
                  <div className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading rentals...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={rentalButtonRef}
                      type="button"
                      onClick={() =>
                        setIsRentalDropdownOpen(!isRentalDropdownOpen)
                      }
                      onKeyDown={handleRentalKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border ${errors.HLR_Id ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.HLR_Id ? (
                        <span className="text-gray-900">
                          {getSelectedRentalDisplay()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select a Hall Rental
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsRentalDropdownOpen(!isRentalDropdownOpen)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isRentalDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.HLR_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Rental Dropdown Menu */}
              {isRentalDropdownOpen && !loadingRentals && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={rentalSearchRef}
                        type="text"
                        value={rentalSearch}
                        onChange={handleRentalSearchChange}
                        onKeyDown={handleRentalSearchKeyDown}
                        placeholder="Search by hall name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {rentalSearch && (
                        <button
                          type="button"
                          onClick={() => setRentalSearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={rentalListRef} className="overflow-y-auto max-h-64">
                    {filteredRentals.length > 0 ? (
                      filteredRentals.map((rental, idx) => {
                        const isSelected = formData.HLR_Id == rental.HLR_Id;

                        return (
                          <button
                            key={rental.HLR_Id}
                            ref={(el) => {
                              rentalItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleRentalSelect(rental)}
                            onKeyDown={(e) =>
                              handleRentalItemKeyDown(e, rental, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              highlightedRentalIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                R{idx + 1}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {rental.hall?.HLM_Name || "N/A"}
                                </div>
                                {rental.HLR_Date && (
                                  <div className="text-xs text-gray-500">
                                    Date: {rental.HLR_Date} | Rent: ₹
                                    {parseFloat(
                                      rental.HLR_FDR || 0,
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-blue-600 ml-2" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No rentals found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredRentals.length} rentals found</span>
                      <span>Total: {rentals.length} rentals</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.HLR_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HLR_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a hall rental from the list (required)
              </p>
            </div>

            {/* Applicant User Selection - Third field */}
            <div ref={userDropdownRef} className="relative w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applicant <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingUsers ? (
                  <div className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading users...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={userButtonRef}
                      type="button"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      onKeyDown={handleUserKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border ${errors.Usr_Id ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.Usr_Id && selectedUser ? (
                        <span className="text-gray-900">
                          {getSelectedUserDisplay()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select an Applicant
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isUserDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.Usr_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && !loadingUsers && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={userSearchRef}
                        type="text"
                        value={userSearch}
                        onChange={handleUserSearchChange}
                        onKeyDown={handleUserSearchKeyDown}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {userSearch && (
                        <button
                          type="button"
                          onClick={() => setUserSearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={userListRef} className="overflow-y-auto max-h-64">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((userItem, idx) => {
                        const isSelected = formData.Usr_Id == userItem.Usr_Id;

                        return (
                          <button
                            key={userItem.Usr_Id}
                            ref={(el) => {
                              userItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleUserSelect(userItem)}
                            onKeyDown={(e) =>
                              handleUserItemKeyDown(e, userItem, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              highlightedUserIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                U{idx + 1}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {userItem.Usr_Name || "N/A"}
                                </div>
                                {userItem.Usr_Email && (
                                  <div className="text-xs text-gray-500">
                                    {userItem.Usr_Email}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-blue-600 ml-2" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No users found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredUsers.length} users found</span>
                      <span>Total: {users.length} users</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.Usr_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Usr_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select an applicant from the list (required)
              </p>
            </div>

            {/* Remaining fields in 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={eventDateRef}
                    type="date"
                    name="HLRA_StDt"
                    value={formData.HLRA_StDt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, eventTypeRef)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLRA_StDt ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  />
                </div>
                {errors.HLRA_StDt && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.HLRA_StDt}
                  </p>
                )}
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    ref={eventTypeRef}
                    name="HLRA_Type"
                    value={formData.HLRA_Type}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, eventModeRef)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLRA_Type ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white`}
                  >
                    <option value="Private">Private</option>
                    <option value="Govt">Govt</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                {errors.HLRA_Type && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.HLRA_Type}
                  </p>
                )}
              </div>

              {/* Event Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Mode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    ref={eventModeRef}
                    name="HLRA_Mode"
                    value={formData.HLRA_Mode}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, startTimeRef)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLRA_Mode ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white`}
                  >
                    <option value="FullDay">Full Day</option>
                    <option value="HalfDay">Half Day</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                {errors.HLRA_Mode && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.HLRA_Mode}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={startTimeRef}
                    type="time"
                    name="HLRA_SlSt"
                    value={formData.HLRA_SlSt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, endTimeRef)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={endTimeRef}
                    type="time"
                    name="HLRA_SlEd"
                    value={formData.HLRA_SlEd}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, reasonRef)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.HLRA_SlEd ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  />
                </div>
                {errors.HLRA_SlEd && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.HLRA_SlEd}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason{" "}
                    <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <span className="text-xs text-gray-400">
                    {formData.HLRA_Reason.length}/255
                  </span>
                </div>
                <input
                  ref={reasonRef}
                  type="text"
                  name="HLRA_Reason"
                  value={formData.HLRA_Reason}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, remarkRef)}
                  maxLength="255"
                  placeholder="Reason for application"
                  className={`w-full px-4 py-2.5 text-sm border ${errors.HLRA_Reason ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
                {errors.HLRA_Reason && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.HLRA_Reason}
                  </p>
                )}
              </div>

              {/* Remark */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Remark{" "}
                    <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <span className="text-xs text-gray-400">
                    {formData.HLRA_Remark.length}/255
                  </span>
                </div>
                <input
                  ref={remarkRef}
                  type="text"
                  name="HLRA_Remark"
                  value={formData.HLRA_Remark}
                  onChange={handleInputChange}
                  maxLength="255"
                  placeholder="Additional remarks"
                  className={`w-full px-4 py-2.5 text-sm border ${errors.HLRA_Remark ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
                {errors.HLRA_Remark && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.HLRA_Remark}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Application will be submitted for approval
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
              className="px-6 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? `Update ${pageTitle}` : `Submit Application`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditHallRentApplication;
