import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  CreditCard,
  FileCheck,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Receipt,
  TrendingUp,
  TrendingDown,
  Hash,
  XCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopRentTransactionApi from "../../../services/shoprenttransactionapi";

const AddEditShopRentTransaction = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id && id != "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAgreements, setLoadingAgreements] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingCCCs, setLoadingCCCs] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Shop Rent Transaction");
  const [agreements, setAgreements] = useState([]);
  const [filteredAgreements, setFilteredAgreements] = useState([]);
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [cccs, setCccs] = useState([]);
  const [filteredCccs, setFilteredCccs] = useState([]);
  const [isAgreementDropdownOpen, setIsAgreementDropdownOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isCccDropdownOpen, setIsCccDropdownOpen] = useState(false);
  const [agreementSearch, setAgreementSearch] = useState("");
  const [shopSearch, setShopSearch] = useState("");
  const [cccSearch, setCccSearch] = useState("");
  const [highlightedAgreementIndex, setHighlightedAgreementIndex] = useState(-1);
  const [highlightedShopIndex, setHighlightedShopIndex] = useState(-1);
  const [highlightedCccIndex, setHighlightedCccIndex] = useState(-1);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedCcc, setSelectedCcc] = useState(null);

  // Refs for focus management
  const agreementButtonRef = useRef(null);
  const agreementSearchRef = useRef(null);
  const shopButtonRef = useRef(null);
  const shopSearchRef = useRef(null);
  const cccButtonRef = useRef(null);
  const cccSearchRef = useRef(null);
  const dateRef = useRef(null);
  const typeRef = useRef(null);
  const amountRef = useRef(null);
  const billNoRef = useRef(null);
  const drCrRef = useRef(null);
  const remarkRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const agreementDropdownRef = useRef(null);
  const shopDropdownRef = useRef(null);
  const cccDropdownRef = useRef(null);
  const agreementListRef = useRef(null);
  const shopListRef = useRef(null);
  const cccListRef = useRef(null);
  const agreementItemRefs = useRef([]);
  const shopItemRefs = useRef([]);
  const cccItemRefs = useRef([]);

  const [formData, setFormData] = useState({
    SPRG_Id: "",
    SPM_Id: "",
    SPGT_RCntr: "",
    SPGT_Date: new Date().toISOString().split("T")[0],
    SPGT_Type: "Rent",
    SPGT_Amt: "",
    SPGT_Bill_No: "",
    SPGT_DrCr: "C",
    SPGT_Remark: "",
  });

  // Load dropdown data
  useEffect(() => {
    loadAgreements();
    loadShops();
    loadCCCs();
  }, []);

  // Filter agreements when search changes
  useEffect(() => {
    if (!agreementSearch.trim()) {
      setFilteredAgreements(agreements);
    } else {
      const searchLower = agreementSearch.toLowerCase();
      const filtered = agreements.filter(
        (agreement) =>
          agreement.SPRG_StRef?.toLowerCase().includes(searchLower) ||
          (agreement.shop_detail?.SPM_Name &&
            agreement.shop_detail.SPM_Name.toLowerCase().includes(searchLower)),
      );
      setFilteredAgreements(filtered);
    }
    setHighlightedAgreementIndex(-1);
  }, [agreementSearch, agreements]);

  // Filter shops when search changes
  useEffect(() => {
    if (!shopSearch.trim()) {
      setFilteredShops(shops);
    } else {
      const searchLower = shopSearch.toLowerCase();
      const filtered = shops.filter(
        (shop) =>
          shop.SPM_Name?.toLowerCase().includes(searchLower)
      );
      setFilteredShops(filtered);
    }
    setHighlightedShopIndex(-1);
  }, [shopSearch, shops]);

  // Filter CCCs when search changes
  useEffect(() => {
    if (!cccSearch.trim()) {
      setFilteredCccs(cccs);
    } else {
      const searchLower = cccSearch.toLowerCase();
      const filtered = cccs.filter(
        (ccc) =>
          ccc.CCC_Name?.toLowerCase().includes(searchLower) ||
          (ccc.CCC_Code && ccc.CCC_Code.toLowerCase().includes(searchLower)),
      );
      setFilteredCccs(filtered);
    }
    setHighlightedCccIndex(-1);
  }, [cccSearch, cccs]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isAgreementDropdownOpen && agreementSearchRef.current) {
      setTimeout(() => agreementSearchRef.current.focus(), 0);
    }
  }, [isAgreementDropdownOpen]);

  useEffect(() => {
    if (isShopDropdownOpen && shopSearchRef.current) {
      setTimeout(() => shopSearchRef.current.focus(), 0);
    }
  }, [isShopDropdownOpen]);

  useEffect(() => {
    if (isCccDropdownOpen && cccSearchRef.current) {
      setTimeout(() => cccSearchRef.current.focus(), 0);
    }
  }, [isCccDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isAgreementDropdownOpen && highlightedAgreementIndex >= 0 && agreementListRef.current) {
      const container = agreementListRef.current;
      const item = agreementItemRefs.current[highlightedAgreementIndex];
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
  }, [highlightedAgreementIndex, isAgreementDropdownOpen]);

  useEffect(() => {
    if (isShopDropdownOpen && highlightedShopIndex >= 0 && shopListRef.current) {
      const container = shopListRef.current;
      const item = shopItemRefs.current[highlightedShopIndex];
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
  }, [highlightedShopIndex, isShopDropdownOpen]);

  useEffect(() => {
    if (isCccDropdownOpen && highlightedCccIndex >= 0 && cccListRef.current) {
      const container = cccListRef.current;
      const item = cccItemRefs.current[highlightedCccIndex];
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
  }, [highlightedCccIndex, isCccDropdownOpen]);

  useEffect(() => {
    if (isEditMode) loadData();
    else {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        SPGT_Date: today,
        SPGT_Type: "Rent",
        SPGT_DrCr: "C",
      }));
      setTimeout(() => agreementButtonRef.current?.focus(), 100);
    }
  }, [id]);

  const loadAgreements = async () => {
    setLoadingAgreements(true);
    try {
      const res = await ShopRentTransactionApi.getAllAgreements();
      setAgreements(res?.data || []);
      setFilteredAgreements(res?.data || []);
    } catch (error) {
      console.error("Error loading agreements:", error);
      toast.error("Failed to load agreements");
    } finally {
      setLoadingAgreements(false);
    }
  };

  const loadShops = async () => {
    setLoadingShops(true);
    try {
      const res = await ShopRentTransactionApi.getAllShops();
      setShops(res?.data || []);
      setFilteredShops(res?.data || []);
    } catch (error) {
      console.error("Error loading shops:", error);
      toast.error("Failed to load shops");
    } finally {
      setLoadingShops(false);
    }
  };

  const loadCCCs = async () => {
    setLoadingCCCs(true);
    try {
      const res = await ShopRentTransactionApi.getAllCCCs();
      setCccs(res?.data || []);
      setFilteredCccs(res?.data || []);
    } catch (error) {
      console.error("Error loading CCCs:", error);
      toast.error("Failed to load CCCs");
    } finally {
      setLoadingCCCs(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ShopRentTransactionApi.getById(id);
      const d = res?.data;
      setFormData({
        SPRG_Id: d.SPRG_Id || "",
        SPM_Id: d.SPM_Id || "",
        SPGT_RCntr: d.SPGT_RCntr || "",
        SPGT_Date: d.SPGT_Date || new Date().toISOString().split("T")[0],
        SPGT_Type: d.SPGT_Type || "Rent",
        SPGT_Amt: d.SPGT_Amt || "",
        SPGT_Bill_No: d.SPGT_Bill_No || "",
        SPGT_DrCr: d.SPGT_DrCr || "C",
        SPGT_Remark: d.SPGT_Remark || "",
      });

      if (d.SPRG_Id && d.agreement) {
        setAgreementSearch(
          `${d.agreement.SPRG_StRef || ""} - ${d.agreement.shop_detail?.SPM_Name || ""}`,
        );
        setSelectedAgreement(d.agreement);
      }

      if (d.SPM_Id && d.shop) {
        setShopSearch(`${d.shop.SPM_Name || ""}`);
        setSelectedShop(d.shop);
      }

      if (d.SPGT_RCntr && d.receipt_counter) {
        setCccSearch(
          `${d.receipt_counter.CCC_Name || ""} (${d.receipt_counter.CCC_Code || ""})`,
        );
        setSelectedCcc(d.receipt_counter);
      }
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-rent-transaction");
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

  // Agreement dropdown keyboard handlers
  const handleAgreementKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsAgreementDropdownOpen(true);
      setAgreementSearch("");
      setHighlightedAgreementIndex(-1);
      setTimeout(() => agreementSearchRef.current?.focus(), 0);
    }
  };

  const handleAgreementSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredAgreements.length > 0) {
        setHighlightedAgreementIndex(0);
        setTimeout(() => {
          if (agreementItemRefs.current[0]) {
            agreementItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAgreementDropdownOpen(false);
      setHighlightedAgreementIndex(-1);
      setAgreementSearch("");
      agreementButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredAgreements.length > 0 && highlightedAgreementIndex >= 0) {
        handleAgreementSelect(filteredAgreements[highlightedAgreementIndex]);
      } else if (filteredAgreements.length > 0) {
        handleAgreementSelect(filteredAgreements[0]);
      }
    } else if (e.key == "Tab") {
      setIsAgreementDropdownOpen(false);
      setHighlightedAgreementIndex(-1);
      setAgreementSearch("");
    }
  };

  const handleAgreementItemKeyDown = (e, agreement, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredAgreements.length) {
        setHighlightedAgreementIndex(nextIndex);
        setTimeout(() => {
          if (agreementItemRefs.current[nextIndex]) {
            agreementItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setHighlightedAgreementIndex(-1);
        setTimeout(() => agreementSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedAgreementIndex(-1);
        setTimeout(() => agreementSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedAgreementIndex(prevIndex);
        setTimeout(() => {
          if (agreementItemRefs.current[prevIndex]) {
            agreementItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleAgreementSelect(agreement);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAgreementDropdownOpen(false);
      setHighlightedAgreementIndex(-1);
      setAgreementSearch("");
      agreementButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsAgreementDropdownOpen(false);
      setHighlightedAgreementIndex(-1);
      setAgreementSearch("");
    }
  };

  const handleAgreementSelect = (agreement) => {
    setFormData((prev) => ({
      ...prev,
      SPRG_Id: agreement.SPRG_Id,
    }));
    setSelectedAgreement(agreement);
    setAgreementSearch(
      `${agreement.SPRG_StRef || ""} - ${agreement.shop_detail?.SPM_Name || ""}`,
    );
    setIsAgreementDropdownOpen(false);
    setHighlightedAgreementIndex(-1);
    if (errors.SPRG_Id) setErrors((prev) => ({ ...prev, SPRG_Id: "" }));
    setTimeout(() => shopButtonRef.current?.focus(), 100);
  };

  const handleAgreementSearchChange = (e) => {
    setAgreementSearch(e.target.value);
    setIsAgreementDropdownOpen(true);
  };

  // Shop dropdown keyboard handlers
  const handleShopKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsShopDropdownOpen(true);
      setShopSearch("");
      setHighlightedShopIndex(-1);
      setTimeout(() => shopSearchRef.current?.focus(), 0);
    }
  };

  const handleShopSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredShops.length > 0) {
        setHighlightedShopIndex(0);
        setTimeout(() => {
          if (shopItemRefs.current[0]) {
            shopItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsShopDropdownOpen(false);
      setHighlightedShopIndex(-1);
      setShopSearch("");
      shopButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredShops.length > 0 && highlightedShopIndex >= 0) {
        handleShopSelect(filteredShops[highlightedShopIndex]);
      } else if (filteredShops.length > 0) {
        handleShopSelect(filteredShops[0]);
      }
    } else if (e.key == "Tab") {
      setIsShopDropdownOpen(false);
      setHighlightedShopIndex(-1);
      setShopSearch("");
    }
  };

  const handleShopItemKeyDown = (e, shop, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredShops.length) {
        setHighlightedShopIndex(nextIndex);
        setTimeout(() => {
          if (shopItemRefs.current[nextIndex]) {
            shopItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setHighlightedShopIndex(-1);
        setTimeout(() => shopSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedShopIndex(-1);
        setTimeout(() => shopSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedShopIndex(prevIndex);
        setTimeout(() => {
          if (shopItemRefs.current[prevIndex]) {
            shopItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleShopSelect(shop);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsShopDropdownOpen(false);
      setHighlightedShopIndex(-1);
      setShopSearch("");
      shopButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsShopDropdownOpen(false);
      setHighlightedShopIndex(-1);
      setShopSearch("");
    }
  };

  const handleShopSelect = (shop) => {
    setFormData((prev) => ({
      ...prev,
      SPM_Id: shop.SPM_Id,
    }));
    setSelectedShop(shop);
    setShopSearch(`${shop.SPM_Name || ""}`);
    setIsShopDropdownOpen(false);
    setHighlightedShopIndex(-1);
    if (errors.SPM_Id) setErrors((prev) => ({ ...prev, SPM_Id: "" }));
    setTimeout(() => cccButtonRef.current?.focus(), 100);
  };

  const handleShopSearchChange = (e) => {
    setShopSearch(e.target.value);
    setIsShopDropdownOpen(true);
  };

  // CCC dropdown keyboard handlers
  const handleCccKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsCccDropdownOpen(true);
      setCccSearch("");
      setHighlightedCccIndex(-1);
      setTimeout(() => cccSearchRef.current?.focus(), 0);
    }
  };

  const handleCccSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredCccs.length > 0) {
        setHighlightedCccIndex(0);
        setTimeout(() => {
          if (cccItemRefs.current[0]) {
            cccItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsCccDropdownOpen(false);
      setHighlightedCccIndex(-1);
      setCccSearch("");
      cccButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredCccs.length > 0 && highlightedCccIndex >= 0) {
        handleCccSelect(filteredCccs[highlightedCccIndex]);
      } else if (filteredCccs.length > 0) {
        handleCccSelect(filteredCccs[0]);
      }
    } else if (e.key == "Tab") {
      setIsCccDropdownOpen(false);
      setHighlightedCccIndex(-1);
      setCccSearch("");
    }
  };

  const handleCccItemKeyDown = (e, ccc, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredCccs.length) {
        setHighlightedCccIndex(nextIndex);
        setTimeout(() => {
          if (cccItemRefs.current[nextIndex]) {
            cccItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setHighlightedCccIndex(-1);
        setTimeout(() => cccSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedCccIndex(-1);
        setTimeout(() => cccSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedCccIndex(prevIndex);
        setTimeout(() => {
          if (cccItemRefs.current[prevIndex]) {
            cccItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleCccSelect(ccc);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsCccDropdownOpen(false);
      setHighlightedCccIndex(-1);
      setCccSearch("");
      cccButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsCccDropdownOpen(false);
      setHighlightedCccIndex(-1);
      setCccSearch("");
    }
  };

  const handleCccSelect = (ccc) => {
    setFormData((prev) => ({
      ...prev,
      SPGT_RCntr: ccc.CCC_Id,
    }));
    setSelectedCcc(ccc);
    setCccSearch(`${ccc.CCC_Name || ""} (${ccc.CCC_Code || ""})`);
    setIsCccDropdownOpen(false);
    setHighlightedCccIndex(-1);
    if (errors.SPGT_RCntr) setErrors((prev) => ({ ...prev, SPGT_RCntr: "" }));
    setTimeout(() => dateRef.current?.focus(), 100);
  };

  const handleCccSearchChange = (e) => {
    setCccSearch(e.target.value);
    setIsCccDropdownOpen(true);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.SPGT_Date) {
      newErrors.SPGT_Date = "Transaction date is required";
    }

    if (!formData.SPGT_Type) {
      newErrors.SPGT_Type = "Transaction type is required";
    }

    if (!formData.SPGT_Amt) {
      newErrors.SPGT_Amt = "Amount is required";
    } else if (parseFloat(formData.SPGT_Amt) < 0) {
      newErrors.SPGT_Amt = "Amount cannot be negative";
    }

    if (formData.SPGT_Bill_No && formData.SPGT_Bill_No.length > 50) {
      newErrors.SPGT_Bill_No = "Bill number must not exceed 50 characters";
    }

    if (!formData.SPGT_DrCr) {
      newErrors.SPGT_DrCr = "Please select Debit or Credit";
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
        const refMap = {
          SPRG_Id: agreementButtonRef,
          SPM_Id: shopButtonRef,
          SPGT_RCntr: cccButtonRef,
          SPGT_Date: dateRef,
          SPGT_Type: typeRef,
          SPGT_Amt: amountRef,
          SPGT_Bill_No: billNoRef,
          SPGT_DrCr: drCrRef,
          SPGT_Remark: remarkRef,
        };
        if (refMap[firstErrorKey]) {
          refMap[firstErrorKey].current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? `Update ${pageTitle}?` : `Create ${pageTitle}?`,
      text: isEditMode
        ? "Are you sure you want to update this transaction?"
        : "Are you sure you want to create this transaction?",
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
        SPRG_Id: formData.SPRG_Id ? parseInt(formData.SPRG_Id) : null,
        SPM_Id: formData.SPM_Id ? parseInt(formData.SPM_Id) : null,
        SPGT_RCntr: formData.SPGT_RCntr ? parseInt(formData.SPGT_RCntr) : null,
        SPGT_Date: formData.SPGT_Date,
        SPGT_Type: formData.SPGT_Type,
        SPGT_Amt: parseFloat(formData.SPGT_Amt),
        SPGT_Bill_No: formData.SPGT_Bill_No?.trim() || null,
        SPGT_DrCr: formData.SPGT_DrCr,
        SPGT_Remark: formData.SPGT_Remark?.trim() || null,
      };

      if (isEditMode) {
        await ShopRentTransactionApi.update(id, payload);
        toast.success("Updated successfully!");
      } else {
        await ShopRentTransactionApi.create(payload);
        toast.success("Created successfully!");
      }
      setTimeout(
        () => navigate("/masters/hall-shop-management/shop-rent-transaction"),
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
    navigate("/masters/hall-shop-management/shop-rent-transaction");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  const getSelectedAgreementDisplay = () => {
    if (!formData.SPRG_Id || !selectedAgreement) return "";
    return `${selectedAgreement.SPRG_StRef || ""} - ${selectedAgreement.shop_detail?.SPM_Name || ""}`;
  };

  const getSelectedShopDisplay = () => {
    if (!formData.SPM_Id || !selectedShop) return "";
    return `${selectedShop.SPM_Name || ""}`;
  };

  const getSelectedCccDisplay = () => {
    if (!formData.SPGT_RCntr || !selectedCcc) return "";
    return `${selectedCcc.CCC_Name || ""} (${selectedCcc.CCC_Code || ""})`;
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
                ? "Update shop rent transaction information"
                : "Create a new shop rent transaction"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Receipt className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agreement Selection - EXACTLY LIKE LEDGER */}
            <div ref={agreementDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agreement{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <FileCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingAgreements ? (
                  <div className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading agreements...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={agreementButtonRef}
                      type="button"
                      onClick={() =>
                        setIsAgreementDropdownOpen(!isAgreementDropdownOpen)
                      }
                      onKeyDown={handleAgreementKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border ${errors.SPRG_Id ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.SPRG_Id ? (
                        <span className="text-gray-900">
                          {getSelectedAgreementDisplay()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select an Agreement</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsAgreementDropdownOpen(!isAgreementDropdownOpen)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isAgreementDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.SPRG_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Agreement Dropdown Menu */}
              {isAgreementDropdownOpen && !loadingAgreements && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={agreementSearchRef}
                        type="text"
                        value={agreementSearch}
                        onChange={handleAgreementSearchChange}
                        onKeyDown={handleAgreementSearchKeyDown}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {agreementSearch && (
                        <button
                          type="button"
                          onClick={() => setAgreementSearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={agreementListRef} className="overflow-y-auto max-h-64">
                    {filteredAgreements.length > 0 ? (
                      filteredAgreements.map((agreement, idx) => {
                        const isSelected = formData.SPRG_Id == agreement.SPRG_Id;

                        return (
                          <button                            key={agreement.SPRG_Id}
                            ref={(el) => {
                              agreementItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleAgreementSelect(agreement)}
                            onKeyDown={(e) =>
                              handleAgreementItemKeyDown(e, agreement, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              highlightedAgreementIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                A{idx + 1}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {agreement.SPRG_StRef || "N/A"}
                                </div>
                                {agreement.shop_detail?.SPM_Name && (
                                  <div className="text-xs text-gray-500">
                                    Shop: {agreement.shop_detail.SPM_Name}
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
                        <p>No agreements found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredAgreements.length} agreements found</span>
                      <span>Total: {agreements.length} agreements</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.SPRG_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPRG_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select an agreement from the list (optional)
              </p>
            </div>

            {/* Shop Selection - EXACTLY LIKE LEDGER */}
            <div ref={shopDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingShops ? (
                  <div className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading shops...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={shopButtonRef}
                      type="button"
                      onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                      onKeyDown={handleShopKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border ${errors.SPM_Id ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.SPM_Id ? (
                        <span className="text-gray-900">
                          {getSelectedShopDisplay()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Shop</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isShopDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.SPM_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Shop Dropdown Menu */}
              {isShopDropdownOpen && !loadingShops && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={shopSearchRef}
                        type="text"
                        value={shopSearch}
                        onChange={handleShopSearchChange}
                        onKeyDown={handleShopSearchKeyDown}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {shopSearch && (
                        <button
                          type="button"
                          onClick={() => setShopSearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={shopListRef} className="overflow-y-auto max-h-64">
                    {filteredShops.length > 0 ? (
                      filteredShops.map((shop, idx) => {
                        const isSelected = formData.SPM_Id == shop.SPM_Id;

                        return (
                          <button
                            key={shop.SPM_Id}
                            ref={(el) => {
                              shopItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleShopSelect(shop)}
                            onKeyDown={(e) =>
                              handleShopItemKeyDown(e, shop, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              highlightedShopIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                S{idx + 1}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {shop.SPM_Name || "N/A"}
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
                        <p>No shops found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredShops.length} shops found</span>
                      <span>Total: {shops.length} shops</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.SPM_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPM_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a shop from the list (optional)
              </p>
            </div>

            {/* Receipt Counter Selection - EXACTLY LIKE LEDGER */}
            <div ref={cccDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Counter{" "}
                <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingCCCs ? (
                  <div className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading counters...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={cccButtonRef}
                      type="button"
                      onClick={() => setIsCccDropdownOpen(!isCccDropdownOpen)}
                      onKeyDown={handleCccKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm border ${errors.SPGT_RCntr ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.SPGT_RCntr ? (
                        <span className="text-gray-900">
                          {getSelectedCccDisplay()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Receipt Counter</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCccDropdownOpen(!isCccDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isCccDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.SPGT_RCntr && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* CCC Dropdown Menu */}
              {isCccDropdownOpen && !loadingCCCs && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={cccSearchRef}
                        type="text"
                        value={cccSearch}
                        onChange={handleCccSearchChange}
                        onKeyDown={handleCccSearchKeyDown}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      {cccSearch && (
                        <button
                          type="button"
                          onClick={() => setCccSearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={cccListRef} className="overflow-y-auto max-h-64">
                    {filteredCccs.length > 0 ? (
                      filteredCccs.map((ccc, idx) => {
                        const isSelected = formData.SPGT_RCntr == ccc.CCC_Id;

                        return (
                          <button
                            key={ccc.CCC_Id}
                            ref={(el) => {
                              cccItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleCccSelect(ccc)}
                            onKeyDown={(e) =>
                              handleCccItemKeyDown(e, ccc, idx)
                            }
                            className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
                              highlightedCccIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                            }`}
                            tabIndex={0}
                          >
                            <div className="flex items-start">
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5">
                                C{idx + 1}
                              </span>
                              <div className="flex-1">
                                <div
                                  className={`font-medium ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {ccc.CCC_Name || "N/A"}
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
                        <p>No counters found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredCccs.length} counters found</span>
                      <span>Total: {cccs.length} counters</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.SPGT_RCntr && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SPGT_RCntr}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a receipt counter from the list (optional)
              </p>
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateRef}
                  type="date"
                  name="SPGT_Date"
                  value={formData.SPGT_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, typeRef)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPGT_Date ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPGT_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPGT_Date}
                </p>
              )}
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                ref={typeRef}
                name="SPGT_Type"
                value={formData.SPGT_Type}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, amountRef)}
                className={`w-full px-4 py-2.5 text-sm border ${errors.SPGT_Type ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white`}
              >
                <option value="SD">Security Deposit</option>
                <option value="Rent">Rent</option>
                <option value="Adj">Adjustment</option>
                <option value="FFT">Furniture & Fixtures</option>
                <option value="LtFe">Late Fee</option>
                <option value="Tax">Tax</option>
                <option value="Trf">Transfer</option>
              </select>
              {errors.SPGT_Type && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPGT_Type}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={amountRef}
                  type="number"
                  step="0.01"
                  name="SPGT_Amt"
                  value={formData.SPGT_Amt}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, billNoRef)}
                  placeholder="Enter amount"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPGT_Amt ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPGT_Amt && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPGT_Amt}
                </p>
              )}
            </div>

            {/* Bill Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Bill Number{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <span className="text-xs text-gray-400">
                  {formData.SPGT_Bill_No.length}/50
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={billNoRef}
                  type="text"
                  name="SPGT_Bill_No"
                  value={formData.SPGT_Bill_No}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, drCrRef)}
                  maxLength="50"
                  placeholder="Enter bill number"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border ${errors.SPGT_Bill_No ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                />
              </div>
              {errors.SPGT_Bill_No && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPGT_Bill_No}
                </p>
              )}
            </div>

            {/* Debit / Credit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debit / Credit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  ref={drCrRef}
                  name="SPGT_DrCr"
                  value={formData.SPGT_DrCr}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, remarkRef)}
                  className={`w-full px-4 py-2.5 text-sm border ${errors.SPGT_DrCr ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white appearance-none`}
                >
                  <option value="C">Credit (+)</option>
                  <option value="D">Debit (-)</option>
                </select>
                {formData.SPGT_DrCr == "C" ? (
                  <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.SPGT_DrCr && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPGT_DrCr}
                </p>
              )}
            </div>

            {/* Remark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remark <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                ref={remarkRef}
                type="text"
                name="SPGT_Remark"
                value={formData.SPGT_Remark}
                onChange={handleInputChange}
                placeholder="Enter remark"
                className={`w-full px-4 py-2.5 text-sm border ${errors.SPGT_Remark ? "border-red-300" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              {errors.SPGT_Remark && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.SPGT_Remark}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
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
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? `Update ${pageTitle}` : `Create ${pageTitle}`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditShopRentTransaction;