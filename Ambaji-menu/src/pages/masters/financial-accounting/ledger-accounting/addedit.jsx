// AddEditLedger.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  Hash,
  Folder,
  AlertCircle,
  Tag,
  Globe,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  PieChart,
  Gift, // Add this icon for Grant Type
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LedgerAccountApi } from "../../../services/ledgeraccountsapi";

const AddEditLedger = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingBudgetHeads, setLoadingBudgetHeads] = useState(false);
  const [loadingGrantTypes, setLoadingGrantTypes] = useState(false); // NEW
  const [isEditMode, setIsEditMode] = useState(false);
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [budgetHeads, setBudgetHeads] = useState([]);
  const [filteredBudgetHeads, setFilteredBudgetHeads] = useState([]);
  const [grantTypes, setGrantTypes] = useState([]); // NEW
  const [filteredGrantTypes, setFilteredGrantTypes] = useState([]); // NEW
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBudgetTerm, setSearchBudgetTerm] = useState("");
  const [searchGrantTerm, setSearchGrantTerm] = useState(""); // NEW
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);
  const [isGrantDropdownOpen, setIsGrantDropdownOpen] = useState(false); // NEW
  const [groupHighlightedIndex, setGroupHighlightedIndex] = useState(-1);
  const [budgetHighlightedIndex, setBudgetHighlightedIndex] = useState(-1);
  const [grantHighlightedIndex, setGrantHighlightedIndex] = useState(-1); // NEW
  const dropdownRef = useRef(null);
  const budgetDropdownRef = useRef(null);
  const grantDropdownRef = useRef(null); // NEW
  const groupSearchRef = useRef(null);
  const budgetSearchRef = useRef(null);
  const grantSearchRef = useRef(null); // NEW
  const groupItemRefs = useRef([]);
  const budgetItemRefs = useRef([]);
  const grantItemRefs = useRef([]); // NEW
  const groupListRef = useRef(null);
  const budgetListRef = useRef(null);
  const grantListRef = useRef(null); // NEW
  const [errors, setErrors] = useState({});

  // Refs for focus management
  const ledgerNameRef = useRef(null);
  const ledgerEngNameRef = useRef(null);
  const ledgerCodeRef = useRef(null);
  const groupButtonRef = useRef(null);
  const budgetButtonRef = useRef(null);
  const grantButtonRef = useRef(null);
  const subLedgerRef = useRef(null);
  const statusToggleRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    Lg_Code: "",
    Gr_Id: "",
    Bh_Id: "",
    GT_Id: "",
    Lg_Name: "",
    Lg_Eng_Name: "",
    Lg_Sub: "no",
    Lg_Status: true,
  });

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setGroupHighlightedIndex(-1);
        setSearchTerm("");
      }
      if (
        budgetDropdownRef.current &&
        !budgetDropdownRef.current.contains(event.target)
      ) {
        setIsBudgetDropdownOpen(false);
        setBudgetHighlightedIndex(-1);
        setSearchBudgetTerm("");
      }
      // NEW: Close grant dropdown
      if (
        grantDropdownRef.current &&
        !grantDropdownRef.current.contains(event.target)
      ) {
        setIsGrantDropdownOpen(false);
        setGrantHighlightedIndex(-1);
        setSearchGrantTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadLedgerGroups();
    loadBudgetHeads();
    loadGrantTypes(); // NEW: Load grant types

    if (id && id != "create") {
      setIsEditMode(true);
      loadLedgerData();
    }
  }, [id]);

  // Focus on first field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => ledgerNameRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && groupSearchRef.current) {
      setTimeout(() => groupSearchRef.current.focus(), 0);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isBudgetDropdownOpen && budgetSearchRef.current) {
      setTimeout(() => budgetSearchRef.current.focus(), 0);
    }
  }, [isBudgetDropdownOpen]);

  // NEW: Focus grant search when dropdown opens
  useEffect(() => {
    if (isGrantDropdownOpen && grantSearchRef.current) {
      setTimeout(() => grantSearchRef.current.focus(), 0);
    }
  }, [isGrantDropdownOpen]);

  // Filter groups when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGroups(ledgerGroups);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = ledgerGroups.filter(
        (group) =>
          group.Gr_Nm?.toLowerCase().includes(term) ||
          group.Gr_Cd?.toLowerCase().includes(term),
      );
      setFilteredGroups(filtered);
    }
    setGroupHighlightedIndex(-1);
  }, [searchTerm, ledgerGroups]);

  // Filter budget heads when search term changes
  useEffect(() => {
    if (!searchBudgetTerm.trim()) {
      setFilteredBudgetHeads(budgetHeads);
    } else {
      const term = searchBudgetTerm.toLowerCase();
      const filtered = budgetHeads.filter(
        (head) =>
          head.Gr_Nm?.toLowerCase().includes(term) ||
          head.Gr_Cd?.toLowerCase().includes(term),
      );
      setFilteredBudgetHeads(filtered);
    }
    setBudgetHighlightedIndex(-1);
  }, [searchBudgetTerm, budgetHeads]);

  useEffect(() => {
    if (!searchGrantTerm.trim()) {
      setFilteredGrantTypes(grantTypes);
    } else {
      const term = searchGrantTerm.toLowerCase();
      const filtered = grantTypes.filter(
        (grant) =>
          grant.GT_Name?.toLowerCase().includes(term) ||
          grant.GT_Code?.toLowerCase().includes(term),
      );
      setFilteredGrantTypes(filtered);
    }
    setGrantHighlightedIndex(-1);
  }, [searchGrantTerm, grantTypes]);

  // Scroll highlighted group item into view
  useEffect(() => {
    if (isDropdownOpen && groupHighlightedIndex >= 0 && groupListRef.current) {
      const container = groupListRef.current;
      const item = groupItemRefs.current[groupHighlightedIndex];
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
  }, [groupHighlightedIndex, isDropdownOpen]);

  // Scroll highlighted budget item into view
  useEffect(() => {
    if (
      isBudgetDropdownOpen &&
      budgetHighlightedIndex >= 0 &&
      budgetListRef.current
    ) {
      const container = budgetListRef.current;
      const item = budgetItemRefs.current[budgetHighlightedIndex];
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
  }, [budgetHighlightedIndex, isBudgetDropdownOpen]);

  // NEW: Scroll highlighted grant item into view
  useEffect(() => {
    if (
      isGrantDropdownOpen &&
      grantHighlightedIndex >= 0 &&
      grantListRef.current
    ) {
      const container = grantListRef.current;
      const item = grantItemRefs.current[grantHighlightedIndex];
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
  }, [grantHighlightedIndex, isGrantDropdownOpen]);

  const loadLedgerGroups = async () => {
    setLoadingGroups(true);
    try {
      const groups = await LedgerAccountApi.getLedgerGroups();

      const filteredAndSortedGroups = Array.isArray(groups)
        ? groups
            .filter((group) => group.Gr_Buk == "N")
            .sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
        : [];

      setLedgerGroups(filteredAndSortedGroups || []);
      setFilteredGroups(filteredAndSortedGroups || []);
    } catch (error) {
      console.error("Error loading ledger groups:", error);
      toast.error("Failed to load ledger groups");
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadBudgetHeads = async () => {
    setLoadingBudgetHeads(true);
    try {
      const heads = await LedgerAccountApi.getBudgetHeads();

      const filteredHeads = Array.isArray(heads)
        ? heads.sort((a, b) => a.Gr_Cd.localeCompare(b.Gr_Cd))
        : [];

      setBudgetHeads(filteredHeads);
      setFilteredBudgetHeads(filteredHeads);
    } catch (error) {
      console.error("Error loading budget heads:", error);
      toast.error("Failed to load budget heads");
    } finally {
      setLoadingBudgetHeads(false);
    }
  };

  const loadGrantTypes = async () => {
    setLoadingGrantTypes(true);
    try {
      const grants = await LedgerAccountApi.getGrantTypes();

      const sortedGrants = Array.isArray(grants)
        ? grants.sort((a, b) => a.GT_Name?.localeCompare(b.GT_Name) || 0)
        : [];

      setGrantTypes(sortedGrants);
      setFilteredGrantTypes(sortedGrants);
    } catch (error) {
      console.error("Error loading grant types:", error);
      toast.error("Failed to load grant types");
    } finally {
      setLoadingGrantTypes(false);
    }
  };

  const loadLedgerData = async () => {
    setLoading(true);
    try {
      const ledger = await LedgerAccountApi.getById(id);

      setFormData({
        Lg_Code: ledger.Lg_Code || "",
        Gr_Id: ledger.Gr_Id?.toString() || "",
        Bh_Id: ledger.Bh_Id?.toString() || "",
        GT_Id: ledger.GT_Id?.toString() || "", // NEW: Load GT_Id
        Lg_Name: ledger.Lg_Name || "",
        Lg_Eng_Name: ledger.Lg_Eng_Name || "",
        Lg_Sub: ledger.Lg_Sub?.toLowerCase() == "yes" ? "yes" : "no",
        Lg_Status: ledger.Lg_Status != undefined ? ledger.Lg_Status : true,
      });
    } catch (error) {
      console.error("Error loading ledger:", error);
      toast.error("Failed to load ledger data!");
      navigate("/masters/financial-accounting/ledger-accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Group keyboard handlers
  const handleGroupKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsDropdownOpen(true);
      setSearchTerm("");
      setGroupHighlightedIndex(-1);
      setTimeout(() => groupSearchRef.current?.focus(), 0);
    }
  };

  const handleGroupSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredGroups.length > 0) {
        setGroupHighlightedIndex(0);
        setTimeout(() => {
          if (groupItemRefs.current[0]) {
            groupItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setGroupHighlightedIndex(-1);
      setSearchTerm("");
      groupButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredGroups.length > 0 && groupHighlightedIndex >= 0) {
        handleGroupSelect(filteredGroups[groupHighlightedIndex].Gr_Id);
      } else if (filteredGroups.length > 0) {
        handleGroupSelect(filteredGroups[0].Gr_Id);
      }
    } else if (e.key == "Tab") {
      setIsDropdownOpen(false);
      setGroupHighlightedIndex(-1);
      setSearchTerm("");
    }
  };

  const handleGroupItemKeyDown = (e, groupId, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredGroups.length) {
        setGroupHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (groupItemRefs.current[nextIndex]) {
            groupItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setGroupHighlightedIndex(-1);
        setTimeout(() => groupSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setGroupHighlightedIndex(-1);
        setTimeout(() => groupSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setGroupHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (groupItemRefs.current[prevIndex]) {
            groupItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleGroupSelect(groupId);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
      setGroupHighlightedIndex(-1);
      setSearchTerm("");
      groupButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsDropdownOpen(false);
      setGroupHighlightedIndex(-1);
      setSearchTerm("");
    }
  };

  // Budget head keyboard handlers
  const handleBudgetKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsBudgetDropdownOpen(true);
      setSearchBudgetTerm("");
      setBudgetHighlightedIndex(-1);
      setTimeout(() => budgetSearchRef.current?.focus(), 0);
    }
  };

  const handleBudgetSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredBudgetHeads.length > 0) {
        setBudgetHighlightedIndex(0);
        setTimeout(() => {
          if (budgetItemRefs.current[0]) {
            budgetItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBudgetDropdownOpen(false);
      setBudgetHighlightedIndex(-1);
      setSearchBudgetTerm("");
      budgetButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredBudgetHeads.length > 0 && budgetHighlightedIndex >= 0) {
        handleBudgetHeadSelect(
          filteredBudgetHeads[budgetHighlightedIndex].Bh_Id,
        );
      } else if (filteredBudgetHeads.length > 0) {
        handleBudgetHeadSelect(filteredBudgetHeads[0].Bh_Id);
      }
    } else if (e.key == "Tab") {
      setIsBudgetDropdownOpen(false);
      setBudgetHighlightedIndex(-1);
      setSearchBudgetTerm("");
    }
  };

  const handleBudgetItemKeyDown = (e, bhId, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredBudgetHeads.length) {
        setBudgetHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (budgetItemRefs.current[nextIndex]) {
            budgetItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setBudgetHighlightedIndex(-1);
        setTimeout(() => budgetSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setBudgetHighlightedIndex(-1);
        setTimeout(() => budgetSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setBudgetHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (budgetItemRefs.current[prevIndex]) {
            budgetItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleBudgetHeadSelect(bhId);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBudgetDropdownOpen(false);
      setBudgetHighlightedIndex(-1);
      setSearchBudgetTerm("");
      budgetButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsBudgetDropdownOpen(false);
      setBudgetHighlightedIndex(-1);
      setSearchBudgetTerm("");
    }
  };

  const handleGrantKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsGrantDropdownOpen(true);
      setSearchGrantTerm("");
      setGrantHighlightedIndex(-1);
      setTimeout(() => grantSearchRef.current?.focus(), 0);
    }
  };

  const handleGrantSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredGrantTypes.length > 0) {
        setGrantHighlightedIndex(0);
        setTimeout(() => {
          if (grantItemRefs.current[0]) {
            grantItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGrantDropdownOpen(false);
      setGrantHighlightedIndex(-1);
      setSearchGrantTerm("");
      grantButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredGrantTypes.length > 0 && grantHighlightedIndex >= 0) {
        handleGrantTypeSelect(filteredGrantTypes[grantHighlightedIndex].GT_Id);
      } else if (filteredGrantTypes.length > 0) {
        handleGrantTypeSelect(filteredGrantTypes[0].GT_Id);
      }
    } else if (e.key == "Tab") {
      setIsGrantDropdownOpen(false);
      setGrantHighlightedIndex(-1);
      setSearchGrantTerm("");
    }
  };

  const handleGrantItemKeyDown = (e, grantId, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredGrantTypes.length) {
        setGrantHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (grantItemRefs.current[nextIndex]) {
            grantItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setGrantHighlightedIndex(-1);
        setTimeout(() => grantSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setGrantHighlightedIndex(-1);
        setTimeout(() => grantSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setGrantHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (grantItemRefs.current[prevIndex]) {
            grantItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleGrantTypeSelect(grantId);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGrantDropdownOpen(false);
      setGrantHighlightedIndex(-1);
      setSearchGrantTerm("");
      grantButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsGrantDropdownOpen(false);
      setGrantHighlightedIndex(-1);
      setSearchGrantTerm("");
    }
  };

  const handleGroupSelect = (groupId) => {
    setFormData((prev) => ({
      ...prev,
      Gr_Id: groupId.toString(),
    }));
    setIsDropdownOpen(false);
    setSearchTerm("");
    setGroupHighlightedIndex(-1);

    if (errors.Gr_Id) {
      setErrors((prev) => ({ ...prev, Gr_Id: null }));
    }

    setTimeout(() => budgetButtonRef.current?.focus(), 100);
  };

  const handleBudgetHeadSelect = (bhId) => {
    setFormData((prev) => ({
      ...prev,
      Bh_Id: bhId.toString(),
    }));
    setIsBudgetDropdownOpen(false);
    setSearchBudgetTerm("");
    setBudgetHighlightedIndex(-1);

    if (errors.Bh_Id) {
      setErrors((prev) => ({ ...prev, Bh_Id: null }));
    }

    setTimeout(() => grantButtonRef.current?.focus(), 100);
  };

  // NEW: Handle Grant Type selection
  const handleGrantTypeSelect = (grantId) => {
    setFormData((prev) => ({
      ...prev,
      GT_Id: grantId.toString(),
    }));
    setIsGrantDropdownOpen(false);
    setSearchGrantTerm("");
    setGrantHighlightedIndex(-1);

    if (errors.GT_Id) {
      setErrors((prev) => ({ ...prev, GT_Id: null }));
    }

    setTimeout(() => subLedgerRef.current?.focus(), 100);
  };

  const getSelectedGroupName = () => {
    if (!formData.Gr_Id) return "";
    const selectedGroup = ledgerGroups.find(
      (group) => group.Gr_Id.toString() == formData.Gr_Id,
    );
    return selectedGroup ? `${selectedGroup.Gr_Nm}` : "";
  };

  const getSelectedBudgetHeadName = () => {
    if (!formData.Bh_Id) return "";
    const selectedHead = budgetHeads.find(
      (head) => head.Bh_Id.toString() == formData.Bh_Id,
    );
    return selectedHead ? `${selectedHead.Gr_Nm}` : "";
  };

  // NEW: Get selected grant type name
  const getSelectedGrantTypeName = () => {
    if (!formData.GT_Id) return "";
    const selectedGrant = grantTypes.find(
      (grant) => grant.GT_Id.toString() == formData.GT_Id,
    );
    return selectedGrant ? selectedGrant.GT_Name : "";
  };

  const getBudgetHeadIndent = (grSt) => {
    const level = parseInt(grSt) || 1;
    const indentLevels = {
      1: "",
      2: "    ",
      3: "        ",
      4: "            ",
    };
    return indentLevels[level] || "";
  };

  // Generate code suggestions based on name
  const generateCodeSuggestions = () => {
    const name = formData.Lg_Name.trim();
    if (!name) return [];

    const suggestions = [];

    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 2).toUpperCase());
      }
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      suggestions.push(word.substring(0, 2).toUpperCase() + "001");
      suggestions.push(word.substring(0, 3).toUpperCase() + "001");
    } else if (words.length >= 2) {
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);

      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
      suggestions.push(firstLetters + "001");
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Gr_Id) {
      newErrors.Gr_Id = "Group is required";
    } else if (!parseInt(formData.Gr_Id)) {
      newErrors.Gr_Id = "Please select a valid group";
    }

    if (!formData.Lg_Name.trim()) {
      newErrors.Lg_Name = "Ledger name is required";
    } else if (formData.Lg_Name.length > 500) {
      newErrors.Lg_Name = "Ledger name must not exceed 500 characters";
    }

    if (formData.Lg_Eng_Name && formData.Lg_Eng_Name.length > 500) {
      newErrors.Lg_Eng_Name = "English name must not exceed 500 characters";
    }

    if (formData.Lg_Code && formData.Lg_Code.length > 50) {
      newErrors.Lg_Code = "Ledger code must not exceed 50 characters";
    }

    if (formData.Lg_Sub && formData.Lg_Sub.length > 100) {
      newErrors.Lg_Sub = "Sub ledger value must not exceed 100 characters";
    }

    // GT_Id validation is optional - no error if not selected

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

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);

        if (firstErrorKey == "Lg_Name") {
          ledgerNameRef.current?.focus();
        } else if (firstErrorKey == "Lg_Eng_Name") {
          ledgerEngNameRef.current?.focus();
        } else if (firstErrorKey == "Lg_Code") {
          ledgerCodeRef.current?.focus();
        } else if (firstErrorKey == "Gr_Id") {
          groupButtonRef.current?.focus();
        } else if (firstErrorKey == "Bh_Id") {
          budgetButtonRef.current?.focus();
        } else if (firstErrorKey == "Lg_Sub") {
          subLedgerRef.current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Ledger?" : "Create New Ledger?",
      text: isEditMode
        ? "Are you sure you want to update this ledger information?"
        : "Are you sure you want to create this new ledger?",
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
      const ledgerData = {
        Gr_Id: parseInt(formData.Gr_Id),
        Bh_Id: formData.Bh_Id ? parseInt(formData.Bh_Id) : null,
        GT_Id: formData.GT_Id ? parseInt(formData.GT_Id) : null, // NEW: Include GT_Id
        Lg_Name: formData.Lg_Name.trim(),
        Lg_Eng_Name: formData.Lg_Eng_Name.trim() || null,
        Lg_Code: formData.Lg_Code.trim().toUpperCase() || null,
        Lg_Sub: formData.Lg_Sub == "yes" ? "yes" : "no",
        Lg_Status: formData.Lg_Status,
      };

      console.log("Sending ledger data to API:", ledgerData);

      let response;
      if (isEditMode) {
        response = await LedgerAccountApi.update(id, ledgerData);
        toast.success("Ledger updated successfully!");
      } else {
        response = await LedgerAccountApi.create(ledgerData);
        toast.success("Ledger created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/ledger-accounts");
      }, 1500);
    } catch (error) {
      console.error("Error saving ledger:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            (isEditMode
              ? "Failed to update ledger. Please try again."
              : "Failed to create ledger. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/ledger-accounts");
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ledger data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/ledger-accounts")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Ledger" : "Add New Ledger"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update ledger master information"
                : "Create a new ledger master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Ledger Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ledger Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Lg_Name.length > 400
                      ? formData.Lg_Name.length >= 500
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Lg_Name.length}/500 characters
                </span>
              </div>
              <input
                ref={ledgerNameRef}
                type="text"
                name="Lg_Name"
                value={formData.Lg_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, ledgerEngNameRef)}
                className={`w-full px-4 py-2.5 border ${
                  errors.Lg_Name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="e.g., Cash Account, Bank Account"
                required
                maxLength={500}
              />
              {errors.Lg_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Name}
                </p>
              )}
            </div>

            {/* Ledger English Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ledger English Name
                </label>
                <span
                  className={`text-xs ${
                    formData.Lg_Eng_Name.length > 400
                      ? formData.Lg_Eng_Name.length >= 500
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Lg_Eng_Name.length}/500 characters
                </span>
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={ledgerEngNameRef}
                  type="text"
                  name="Lg_Eng_Name"
                  value={formData.Lg_Eng_Name}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, ledgerCodeRef)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ledger English name (optional)"
                  maxLength={500}
                />
              </div>
              {errors.Lg_Eng_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Eng_Name}
                </p>
              )}
            </div>

            {/* Ledger Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Ledger Code
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Lg_Code.length > 40
                        ? formData.Lg_Code.length >= 50
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Lg_Code.length}/50 characters
                  </span>
                  {suggestions.length > 0 && !isEditMode && (
                    <div className="text-xs text-gray-500">
                      Suggestions:{" "}
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              Lg_Code: suggestion,
                            }));
                          }}
                          className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={ledgerCodeRef}
                  type="text"
                  name="Lg_Code"
                  value={formData.Lg_Code}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, groupButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Lg_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 20106, CASH001, BANK001 (optional)"
                  maxLength={50}
                />
              </div>
              {errors.Lg_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Code}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter any ledger code (optional). Can include numbers, letters,
                spaces.
              </p>
            </div>

            {/* Group Selection */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingGroups ? (
                  <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading groups...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={groupButtonRef}
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      onKeyDown={handleGroupKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.Gr_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.Gr_Id ? (
                        <span className="text-gray-900">
                          {getSelectedGroupName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Group</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.Gr_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Group Dropdown Menu */}
              {isDropdownOpen && !loadingGroups && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={groupSearchRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleGroupSearchKeyDown}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={groupListRef} className="overflow-y-auto max-h-64">
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map((group, idx) => {
                        const level = group.Gr_St ? parseInt(group.Gr_St) : 1;
                        const isSelected =
                          formData.Gr_Id == group.Gr_Id.toString();
                        const indent = "    ".repeat(level - 1);

                        return (
                          <button
                            key={group.Gr_Id}
                            ref={(el) => {
                              groupItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleGroupSelect(group.Gr_Id)}
                            onKeyDown={(e) =>
                              handleGroupItemKeyDown(e, group.Gr_Id, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              groupHighlightedIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                L{level}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  <span className="whitespace-pre">
                                    {indent}
                                  </span>
                                  {group.Gr_Nm}
                                </div>
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
                        <p>No groups found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredGroups.length} groups found</span>
                      <span>Total: {ledgerGroups.length} groups</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.Gr_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Gr_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a ledger group from the hierarchy (required)
              </p>
            </div>

            {/* Budget Head Selection */}
            <div ref={budgetDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Head{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <PieChart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingBudgetHeads ? (
                  <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">
                      Loading budget heads...
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={budgetButtonRef}
                      type="button"
                      onClick={() =>
                        setIsBudgetDropdownOpen(!isBudgetDropdownOpen)
                      }
                      onKeyDown={handleBudgetKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.Bh_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.Bh_Id ? (
                        <span className="text-gray-900">
                          {getSelectedBudgetHeadName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select a Budget Head
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsBudgetDropdownOpen(!isBudgetDropdownOpen)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isBudgetDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Budget Head Dropdown Menu */}
              {isBudgetDropdownOpen && !loadingBudgetHeads && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={budgetSearchRef}
                        type="text"
                        value={searchBudgetTerm}
                        onChange={(e) => setSearchBudgetTerm(e.target.value)}
                        onKeyDown={handleBudgetSearchKeyDown}
                        placeholder="Search budget head by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {searchBudgetTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchBudgetTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={budgetListRef} className="overflow-y-auto max-h-64">
                    {filteredBudgetHeads.length > 0 ? (
                      filteredBudgetHeads.map((head, idx) => {
                        const level = head.Gr_St ? parseInt(head.Gr_St) : 1;
                        const isSelected =
                          formData.Bh_Id == head.Bh_Id.toString();
                        const indent = getBudgetHeadIndent(head.Gr_St);

                        return (
                          <button
                            key={head.Bh_Id}
                            ref={(el) => {
                              budgetItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleBudgetHeadSelect(head.Bh_Id)}
                            onKeyDown={(e) =>
                              handleBudgetItemKeyDown(e, head.Bh_Id, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              budgetHighlightedIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-purple-100 text-purple-700 mr-2 mt-0.5">
                                L{level}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  <span className="whitespace-pre">
                                    {indent}
                                  </span>
                                  {head.Gr_Nm}
                                </div>
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
                        <p>No budget heads found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {filteredBudgetHeads.length} budget heads found
                      </span>
                      <span>Total: {budgetHeads.length} heads</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.Bh_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Bh_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a budget head from the hierarchy (optional)
              </p>
            </div>

            {/* NEW: Grant Type Selection */}
            <div ref={grantDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grant Type{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingGrantTypes ? (
                  <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">
                      Loading grant types...
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={grantButtonRef}
                      type="button"
                      onClick={() =>
                        setIsGrantDropdownOpen(!isGrantDropdownOpen)
                      }
                      onKeyDown={handleGrantKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.GT_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.GT_Id ? (
                        <span className="text-gray-900">
                          {getSelectedGrantTypeName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select a Grant Type
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsGrantDropdownOpen(!isGrantDropdownOpen)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isGrantDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Grant Type Dropdown Menu */}
              {isGrantDropdownOpen && !loadingGrantTypes && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={grantSearchRef}
                        type="text"
                        value={searchGrantTerm}
                        onChange={(e) => setSearchGrantTerm(e.target.value)}
                        onKeyDown={handleGrantSearchKeyDown}
                        placeholder="Search grant type by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {searchGrantTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchGrantTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={grantListRef} className="overflow-y-auto max-h-64">
                    {filteredGrantTypes.length > 0 ? (
                      filteredGrantTypes.map((grant, idx) => {
                        const isSelected =
                          formData.GT_Id == grant.GT_Id.toString();

                        return (
                          <button
                            key={grant.GT_Id}
                            ref={(el) => {
                              grantItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleGrantTypeSelect(grant.GT_Id)}
                            onKeyDown={(e) =>
                              handleGrantItemKeyDown(e, grant.GT_Id, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              grantHighlightedIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-green-100 text-green-700 mr-2 mt-0.5">
                                <Gift className="h-3 w-3" />
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {grant.GT_Name}
                                </div>
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
                        <p>No grant types found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredGrantTypes.length} grant types found</span>
                      <span>Total: {grantTypes.length} types</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.GT_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GT_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a grant type (optional)
              </p>
            </div>

            {/* Sub Ledger Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Ledger
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  ref={subLedgerRef}
                  name="Lg_Sub"
                  value={formData.Lg_Sub}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, statusToggleRef)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Whether this ledger allows sub-ledgers (optional)
              </p>
            </div>

            {/* Status Field */}
            <div ref={statusToggleRef}>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex">
                  <label className="flex cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="Lg_Status"
                        checked={formData.Lg_Status}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key == "Enter") {
                            e.preventDefault();
                            setFormData((prev) => ({
                              ...prev,
                              Lg_Status: !prev.Lg_Status,
                            }));
                          } else if (e.key == "Tab") {
                            if (e.shiftKey) {
                              // Handle shift+tab if needed
                            } else {
                              e.preventDefault();
                              saveButtonRef.current?.focus();
                            }
                          }
                        }}
                        className="sr-only"
                      />
                      <div
                        className={`block w-14 h-8 rounded-full ${
                          formData.Lg_Status ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          formData.Lg_Status ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      {formData.Lg_Status ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ledger code must be unique across all ledgers if provided
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleCancel();
                } else if (e.key == "Tab" && !e.shiftKey) {
                  e.preventDefault();
                  saveButtonRef.current?.focus();
                }
              }}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
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
                } else if (e.key == "Tab" && e.shiftKey) {
                  e.preventDefault();
                  cancelButtonRef.current?.focus();
                }
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Ledger" : "Create Ledger"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLedger;
