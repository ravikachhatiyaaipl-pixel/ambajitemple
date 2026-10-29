import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Percent,
  List,
  Calculator,
  AlertCircle,
  Info,
  Plus,
  Minus,
  Eye,
  Calendar as CalendarIcon,
  Briefcase,
  Hash,
  Building,
  Code,
  Lock,
  Unlock,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { InvoiceTaxParameterApi } from "../../../services/invoicetaxparameterapi";


const AddEditInvoiceTaxParameter = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [enableTaxEntries, setEnableTaxEntries] = useState(false);


  // Dropdown states
  const [tenderWorkOptions, setTenderWorkOptions] = useState([]);
  const [taxTypeOptions, setTaxTypeOptions] = useState([]);
  const [filteredTaxTypes, setFilteredTaxTypes] = useState([]);
  const [ledgerOptions, setLedgerOptions] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);


  // Dropdown search and open states
  const [searchTerm, setSearchTerm] = useState("");
  const [isTenderWorkDropdownOpen, setIsTenderWorkDropdownOpen] = useState(false);
  const tenderWorkDropdownRef = useRef(null);


  const [taxTypeSearchTerms, setTaxTypeSearchTerms] = useState([]);
  const [isTaxTypeDropdownOpen, setIsTaxTypeDropdownOpen] = useState([]);
  const taxTypeDropdownRefs = useRef([]);


  const [ledgerSearchTerms, setLedgerSearchTerms] = useState([]);
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState([]);
  const [filteredTenderWorks, setFilteredTenderWorks] = useState([]);


  const ledgerDropdownRefs = useRef([]);


  const [loadingOptions, setLoadingOptions] = useState({
    tenderWorks: true,
    taxTypes: true,
    ledgers: true,
  });


  // Tax entries state - updated to match API fields with Exmp_Alw as "Yes"/"No"
  const [taxEntries, setTaxEntries] = useState([
    {
      VIP_Sr: 1,
      IC_Id: "",
      Add_Dedu: "1",
      Lg_Id: "",
      Percent: "",
      Formula: "",
      Exmp_Alw: "No", // Added Exmp_Alw field with default "No"
      tax_code: "", // For display only
      tax_name: "", // For display only
      ledger_details: null,
      is_ledger_editable: false,
    },
  ]);


  // Form state - updated to match API fields
  const [formData, setFormData] = useState({
    TnT_ID: "",
    Eff_Date: "",
  });


  const addDeductOptions = [
    { value: "1", label: "Add" },
    { value: "0", label: "Deduct" },
  ];


  // Add Exmp_Alw options with "Yes"/"No" values
  const exemptAllowOptions = [
    { value: "No", label: "No" },
    { value: "Yes", label: "Yes" },
  ];


  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadTaxData();
    } else {
      setIsEditMode(false);
    }
  }, [id]);


  useEffect(() => {
    loadDropdownOptions();
  }, []);


  useEffect(() => {
    setEnableTaxEntries(
      formData.TnT_ID != "" && formData.Eff_Date != "",
    );
  }, [formData.TnT_ID, formData.Eff_Date]);


  // Initialize search term arrays when taxEntries change
  useEffect(() => {
    setTaxTypeSearchTerms(Array(taxEntries.length).fill(""));
    setIsTaxTypeDropdownOpen(Array(taxEntries.length).fill(false));
    setLedgerSearchTerms(Array(taxEntries.length).fill(""));
    setIsLedgerDropdownOpen(Array(taxEntries.length).fill(false));
  }, [taxEntries.length]);


  // Filter tax types based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTaxTypes(taxTypeOptions);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = taxTypeOptions.filter(
        (option) =>
          option.IC_Name?.toLowerCase().includes(term) ||
          option.IC_Code?.toLowerCase().includes(term) ||
          `${option.IC_Code} - ${option.IC_Name}`.toLowerCase().includes(term)
      );
      setFilteredTaxTypes(filtered);
    }
  }, [searchTerm, taxTypeOptions]);


  useEffect(() => {
  if (!searchTerm.trim()) {
    setFilteredTenderWorks(tenderWorkOptions);
  } else {
    const term = searchTerm.toLowerCase();
    const filtered = tenderWorkOptions.filter(
      (option) =>
        option.TnT_Code?.toLowerCase().includes(term) ||
        option.TnT_Name?.toLowerCase().includes(term) ||
        `${option.TnT_Code} - ${option.TnT_Name}`.toLowerCase().includes(term)
    );
    setFilteredTenderWorks(filtered);
  }
}, [searchTerm, tenderWorkOptions]);


  // Filter ledgers based on search term for a specific index
  const getFilteredLedgers = (index) => {
    const term = ledgerSearchTerms[index] || "";
    if (!term.trim()) return ledgerOptions;
   
    const lowerTerm = term.toLowerCase();
    return ledgerOptions.filter(
      (option) =>
        option.Lg_Name?.toLowerCase().includes(lowerTerm) ||
        option.Lg_Code?.toLowerCase().includes(lowerTerm) ||
        `${option.Lg_Code} - ${option.Lg_Name}`.toLowerCase().includes(lowerTerm)
    );
  };


  const loadDropdownOptions = async () => {
    try {
      // Load Tender Works
      const tenderWorks = await InvoiceTaxParameterApi.getTenderWorkOptions();
      setTenderWorkOptions(tenderWorks || []);
    } catch (error) {
      console.error("Error loading tender works:", error);
      toast.error("Failed to load tender works");
    } finally {
      setLoadingOptions((prev) => ({ ...prev, tenderWorks: false }));
    }


    try {
      const taxTypes = await InvoiceTaxParameterApi.getTaxTypeOptions();
     
      const taxTypeOptionsWithLedger = (taxTypes || [])
        .map((taxType) => {
          return {
            ...taxType,
            value: taxType.IC_Id?.toString() || "",
            label: taxType.IC_Name || "Unknown Tax Type",
            has_ledger: !!taxType.ledger,
            ledger_info: taxType.ledger || null,
          };
        })
        .filter((option) => option.value != "");


      setTaxTypeOptions(taxTypeOptionsWithLedger);
      setFilteredTaxTypes(taxTypeOptionsWithLedger);


      if (taxTypeOptionsWithLedger.length == 0) {
        toast.error("No tax types found. Please create tax types first.");
      }
    } catch (error) {
      console.error("Error loading tax types:", error);
      toast.error("Failed to load tax types");
    } finally {
      setLoadingOptions((prev) => ({ ...prev, taxTypes: false }));
    }


    try {
      const ledgers = await InvoiceTaxParameterApi.getLedgerOptions();
      setLedgerOptions(ledgers || []);
    } catch (error) {
      console.error("Error loading ledgers:", error);
      toast.error("Failed to load ledger accounts");
    } finally {
      setLoadingOptions((prev) => ({ ...prev, ledgers: false }));
    }
  };


  const loadTaxData = async () => {
    setLoading(true);
    try {
      const data = await InvoiceTaxParameterApi.getById(id);
     
      // Handle the response structure - data might be an array
      const parameterData = Array.isArray(data) && data.length > 0 ? data[0] : data;


      setFormData({
        TnT_ID: parameterData.tnt_id || "",
        Eff_Date: parameterData.eff_date ? parameterData.eff_date.split('T')[0] : "",
      });


      if (parameterData.parameters && parameterData.parameters.length > 0) {
        const taxTypes = await InvoiceTaxParameterApi.getTaxTypeOptions();
        const taxTypeMap = {};
        (taxTypes || []).forEach((taxType) => {
          if (taxType?.IC_Id) {
            taxTypeMap[taxType.IC_Id] = taxType;
          }
        });


        const entriesWithLedger = parameterData.parameters.map((entry, index) => {
          const taxTypeInfo = taxTypeMap[entry.IC_Id];
          const hasLedger = taxTypeInfo?.ledger;


          // Convert Exmp_Alw from API format if needed (assuming API might return 0/1 or Yes/No)
          let exmpAlwValue = "No"; // Default
          if (entry.Exmp_Alw != undefined && entry.Exmp_Alw != null) {
            // If it's a number (0/1), convert to Yes/No
            if (entry.Exmp_Alw == 1 || entry.Exmp_Alw == "1") {
              exmpAlwValue = "Yes";
            } else if (entry.Exmp_Alw == 0 || entry.Exmp_Alw == "0") {
              exmpAlwValue = "No";
            } else if (entry.Exmp_Alw == "Yes" || entry.Exmp_Alw == "No") {
              exmpAlwValue = entry.Exmp_Alw;
            }
          }


          return {
            VIP_Sr: entry.VIP_Sr || (index + 1).toString(),
            IC_Id: entry.IC_Id?.toString() || "",
            Add_Dedu: entry.Add_Dedu?.toString() || "1",
            Lg_Id: entry.Lg_Id?.toString() || "",
            Percent: entry.Percent?.toString() || "",
            Formula: entry.Formula || "",
            Exmp_Alw: exmpAlwValue, // Using string "Yes"/"No"
            tax_code: taxTypeInfo?.IC_Code || "",
            tax_name: taxTypeInfo?.IC_Name || "",
            ledger_details: hasLedger ? taxTypeInfo.ledger : null,
            is_ledger_editable: !hasLedger,
          };
        });


        setTaxEntries(entriesWithLedger);
      }


      setEnableTaxEntries(true);
    } catch (error) {
      toast.error(error.message || "Failed to load tax parameter data!");
      navigate("/masters/financial-accounting/invoice-tax-parameter");
    } finally {
      setLoading(false);
    }
  };


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));


    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };


  const handleTenderWorkSelect = (tenderWorkId) => {
    setFormData((prev) => ({
      ...prev,
      TnT_ID: tenderWorkId.toString(),
    }));
    setIsTenderWorkDropdownOpen(false);
    setSearchTerm("");


    if (errors.TnT_ID) {
      setErrors((prev) => ({ ...prev, TnT_ID: "" }));
    }
  };


  const getSelectedTenderWorkName = () => {
    if (!formData.TnT_ID) return "";
    const selected = tenderWorkOptions.find(
      (option) => option.TnT_ID.toString() == formData.TnT_ID,
    );
    return selected ? `${selected.TnT_Code} - ${selected.TnT_Name}` : "";
  };


  const handleTaxTypeChange = (index, value) => {
  const newEntries = [...taxEntries];
  const newTaxTypeSearchTerms = [...taxTypeSearchTerms];
  const newIsTaxTypeDropdownOpen = [...isTaxTypeDropdownOpen];


  if (value) {
    const selectedTaxType = taxTypeOptions.find(
      (opt) => opt.IC_Id == value || opt.value == value,
    );


    if (selectedTaxType) {
      newEntries[index].IC_Id = selectedTaxType.IC_Id?.toString() || "";
      newEntries[index].Percent = selectedTaxType.Percentage || "";
      newEntries[index].tax_code = selectedTaxType.IC_Code || "";
      newEntries[index].tax_name = selectedTaxType.IC_Name || "";
     
      // Auto-generate the formula: Gros*IC_Code/100
      const generatedFormula = `Gros*${selectedTaxType.IC_Code}/100`;
      newEntries[index].Formula = generatedFormula;


      if (selectedTaxType.ledger_info) {
        const ledgerId = selectedTaxType.ledger_info.Lg_Id;
        newEntries[index].Lg_Id = ledgerId ? ledgerId.toString() : "";
        newEntries[index].ledger_details = selectedTaxType.ledger_info;
        newEntries[index].is_ledger_editable = false;
      } else {
        newEntries[index].Lg_Id = "";
        newEntries[index].ledger_details = null;
        newEntries[index].is_ledger_editable = true;
        toast.info(
          `Tax type "${selectedTaxType.IC_Name}" doesn't have an associated ledger. Please select one manually.`,
        );
      }
    }
  } else {
    newEntries[index] = {
      ...newEntries[index],
      IC_Id: "",
      Lg_Id: "",
      Percent: "",
      Formula: "", // Clear formula when tax type is cleared
      tax_code: "",
      tax_name: "",
      ledger_details: null,
      is_ledger_editable: false,
      Exmp_Alw: "No",
    };
  }


  // Close dropdown
  newIsTaxTypeDropdownOpen[index] = false;
  newTaxTypeSearchTerms[index] = "";


  setTaxEntries(newEntries);
  setTaxTypeSearchTerms(newTaxTypeSearchTerms);
  setIsTaxTypeDropdownOpen(newIsTaxTypeDropdownOpen);


  // Clear errors
  ["IC_Id", "Lg_Id", "Percent", "Formula"].forEach((field) => {
    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  });
};
  const handleLedgerChange = (index, value) => {
    const newEntries = [...taxEntries];
    const newLedgerSearchTerms = [...ledgerSearchTerms];
    const newIsLedgerDropdownOpen = [...isLedgerDropdownOpen];


    newEntries[index].Lg_Id = value;


    if (value) {
      const selectedLedger = ledgerOptions.find((opt) => opt.value == value);
      if (selectedLedger) {
        newEntries[index].ledger_details = {
          Lg_Id: selectedLedger.value,
          Lg_Code: selectedLedger.Lg_Code,
          Lg_Name: selectedLedger.Lg_Name,
        };
      }
    } else {
      newEntries[index].ledger_details = null;
    }


    // Close dropdown
    newIsLedgerDropdownOpen[index] = false;
    newLedgerSearchTerms[index] = "";


    setTaxEntries(newEntries);
    setLedgerSearchTerms(newLedgerSearchTerms);
    setIsLedgerDropdownOpen(newIsLedgerDropdownOpen);


    if (errors[`Lg_Id_${index}`]) {
      setErrors((prev) => ({ ...prev, [`Lg_Id_${index}`]: "" }));
    }
  };


  const handleOtherInputChange = (index, field, value) => {
    const newEntries = [...taxEntries];
    newEntries[index][field] = value;
    setTaxEntries(newEntries);


    if (errors[`${field}_${index}`]) {
      setErrors((prev) => ({ ...prev, [`${field}_${index}`]: "" }));
    }
  };


  const addTaxEntry = () => {
    if (!enableTaxEntries) {
      toast.error("Please select Tender Work and Effective Date first");
      return;
    }


    const newSr = taxEntries.length + 1;
    setTaxEntries([
      ...taxEntries,
      {
        VIP_Sr: newSr,
        IC_Id: "",
        Add_Dedu: "1",
        Lg_Id: "",
        Percent: "",
        Formula: "",
        Exmp_Alw: "No", // Added Exmp_Alw with default "No"
        tax_code: "",
        tax_name: "",
        ledger_details: null,
        is_ledger_editable: false,
      },
    ]);
  };


  const removeTaxEntry = (index) => {
    if (taxEntries.length > 1) {
      const newEntries = taxEntries.filter((_, i) => i != index);
      // Re-sequence VIP_Sr
      const reindexedEntries = newEntries.map((entry, idx) => ({
        ...entry,
        VIP_Sr: idx + 1,
      }));
      setTaxEntries(reindexedEntries);
    } else {
      toast.error("At least one tax entry is required");
    }
  };


  const validateForm = () => {
    const newErrors = {};


    // Validate form fields
    if (!formData.TnT_ID) {
      newErrors.TnT_ID = "Tender work is required";
    }


    if (!formData.Eff_Date) {
      newErrors.Eff_Date = "Effective date is required";
    }


    // Validate tax entries
    let hasFilledEntry = false;


    taxEntries.forEach((entry, index) => {
      // If IC_Id is selected, validate all required fields
      if (entry.IC_Id) {
        hasFilledEntry = true;


        // IC_Id validation (already selected)
        if (!entry.IC_Id) {
          newErrors[`IC_Id_${index}`] = "Tax type is required";
        }


        // Add_Dedu validation
        if (entry.Add_Dedu == undefined || entry.Add_Dedu == "") {
          newErrors[`Add_Dedu_${index}`] = "Add/Deduct is required";
        }


        // Lg_Id validation
        if (!entry.Lg_Id) {
          newErrors[`Lg_Id_${index}`] = "Ledger account is required";
        }


        // Percent validation
        if (!entry.Percent && entry.Percent != 0) {
          newErrors[`Percent_${index}`] = "Percentage is required";
        } else if (
          isNaN(entry.Percent) ||
          parseFloat(entry.Percent) < 0 ||
          parseFloat(entry.Percent) > 100
        ) {
          newErrors[`Percent_${index}`] =
            "Percentage must be a valid number between 0 and 100";
        }


        // Formula validation
        if (!entry.Formula || entry.Formula.trim() == "") {
          newErrors[`Formula_${index}`] = "Calculation formula is required";
        } else if (entry.Formula.length > 100) {
          newErrors[`Formula_${index}`] = "Formula must not exceed 100 characters";
        }


        // Exmp_Alw validation - ensure it's either "Yes" or "No"
        if (!entry.Exmp_Alw || (entry.Exmp_Alw != "Yes" && entry.Exmp_Alw != "No")) {
          newErrors[`Exmp_Alw_${index}`] = "Exempt Allow selection is required";
        }
      } else {
        // If IC_Id is empty but other fields are filled
        if (entry.Lg_Id || entry.Percent || entry.Formula || entry.Exmp_Alw != "No") {
          newErrors[`IC_Id_${index}`] =
            "Tax type is required when other fields are filled";
        }
      }
    });


    // Check if at least one entry is filled
    if (!hasFilledEntry) {
      newErrors.tax_entries = "At least one tax entry must be filled";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }


    const result = await Swal.fire({
      title: isEditMode
        ? "Update Tax Parameters?"
        : "Create New Tax Parameters?",
      text: isEditMode
        ? "Are you sure you want to update these tax parameters?"
        : "Are you sure you want to create these tax parameters?",
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
      // Filter and prepare data for API
      const filteredEntries = taxEntries
        .filter(
          (entry) =>
            entry.IC_Id &&
            entry.Lg_Id &&
            entry.Percent &&
            entry.Formula &&
            entry.Add_Dedu != undefined && entry.Add_Dedu != "",
        )
        .map((entry, index) => ({
          VIP_Sr: index + 1,
          IC_Id: parseInt(entry.IC_Id),
          Add_Dedu: parseInt(entry.Add_Dedu),
          Lg_Id: parseInt(entry.Lg_Id),
          Percent: parseFloat(entry.Percent),
          Formula: entry.Formula,
          Exmp_Alw: entry.Exmp_Alw, // Pass as "Yes"/"No" string
        }));


      const taxData = {
        TnT_ID: parseInt(formData.TnT_ID),
        Eff_Date: formData.Eff_Date,
        parameters: filteredEntries,
      };


      let response;
      if (isEditMode) {
        response = await InvoiceTaxParameterApi.update(id, taxData);
        toast.success("Tax parameters updated successfully!");
      } else {
        response = await InvoiceTaxParameterApi.create(taxData);
        toast.success("Tax parameters created successfully!");
      }


      setTimeout(() => {
        navigate("/masters/financial-accounting/invoice-tax-parameter");
      }, 1500);
    } catch (error) {
      console.error("Error saving tax parameters:", error);


      // Handle validation errors
      if (error.errors) {
        let errorMessages = [];
        Object.keys(error.errors).forEach((key) => {
          error.errors[key].forEach((msg) => {
            errorMessages.push(msg);
          });
        });
        toast.error(errorMessages.join(", ") || "Validation failed");
      } else {
        toast.error(
          error.message ||
            (isEditMode
              ? "Failed to update tax parameters. Please try again."
              : "Failed to create tax parameters. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };


  const handleCancel = () => {
    navigate("/masters/financial-accounting/invoice-tax-parameter");
  };


  // Get completed entries for preview
  const getCompletedEntries = () => {
    return taxEntries.filter(
      (entry) =>
        entry.IC_Id &&
        entry.Lg_Id &&
        entry.Percent &&
        entry.Formula &&
        entry.Add_Dedu != undefined && entry.Add_Dedu != ""
    );
  };


  // Get tender work label
  const getTenderWorkLabel = (value) => {
    if (!value) return "Not selected";
    const tenderWork = tenderWorkOptions.find(
      (opt) => opt.TnT_ID == value,
    );
    return tenderWork?.TnT_Name || value;
  };


  // Get tax type label
  const getTaxTypeLabel = (value) => {
    if (!value) return "Not selected";
    const taxType = taxTypeOptions.find((opt) => opt.IC_Id == value);
    return taxType?.IC_Name || value;
  };


  // Get ledger display text
  const getLedgerDisplay = (entry) => {
    if (!entry?.Lg_Id) return "Not selected";


    if (entry.ledger_details) {
      return `${entry.ledger_details.Lg_Code || ""} - ${entry.ledger_details.Lg_Name || ""}`;
    }


    const ledger = ledgerOptions.find((opt) => opt.value == entry.Lg_Id);
    return ledger?.label || entry.Lg_Id;
  };


  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tax parameter data...</p>
      </div>
    );
  }


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/invoice-tax-parameter")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Tax Parameters" : "Add New Tax Parameters"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update tax parameter information"
                : "Create new tax parameter records"}
            </p>
          </div>
        </div>
      </div>


      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Form Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Tender Work Dropdown with Search */}
            <div ref={tenderWorkDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender Work *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingOptions.tenderWorks ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading tender works...</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsTenderWorkDropdownOpen(!isTenderWorkDropdownOpen)}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.TnT_ID ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.TnT_ID ? (
                        <span className="text-gray-900">
                          {getSelectedTenderWorkName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select Tender Work
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTenderWorkDropdownOpen(!isTenderWorkDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isTenderWorkDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.TnT_ID && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>


              {/* Dropdown Menu */}
              {isTenderWorkDropdownOpen && !loadingOptions.tenderWorks && (
                <div className="absolute z-50 mt-1 w-full max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by code or name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        autoFocus
                      />
                    </div>
                  </div>


                  {/* Options List */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredTenderWorks.length > 0 ? (
                      filteredTenderWorks.map((option) => (
                        <button
                          key={option.TnT_ID}
                          type="button"
                          onClick={() => handleTenderWorkSelect(option.TnT_ID)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                            formData.TnT_ID == option.TnT_ID.toString()
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">
                            {option.TnT_Code} - {option.TnT_Name}
                          </div>
                          {formData.TnT_ID == option.TnT_ID.toString() && (
                            <div className="text-xs text-blue-600 mt-1 flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No tender works found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>


                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {tenderWorkOptions.filter(option => {
                          if (!searchTerm.trim()) return true;
                          const term = searchTerm.toLowerCase();
                          return (
                            option.TnT_Code?.toLowerCase().includes(term) ||
                            option.TnT_Name?.toLowerCase().includes(term)
                          );
                        }).length} tender works found
                      </span>
                      <span>Total: {tenderWorkOptions.length} tender works</span>
                    </div>
                  </div>
                </div>
              )}
              {errors.TnT_ID && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TnT_ID}
                </p>
              )}
              {isEditMode ? (
                <p className="mt-1 text-xs text-gray-500">
                  Tender work cannot be changed in edit mode
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select tender work for which tax parameters apply
                </p>
              )}
            </div>
 
            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="Eff_Date"
                  value={formData.Eff_Date}
                  onChange={handleFormChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Eff_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.Eff_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Eff_Date ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Eff_Date}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Date from which these tax parameters become effective
                </p>
              )}
            </div>
          </div>


          {/* Tax Entries Section */}
          <div
            className={`border-t pt-6 ${!enableTaxEntries ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <Percent className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Tax Parameters (Gross Value Code Is Gros)
                </h2>
              </div>
              <button
                type="button"
                onClick={addTaxEntry}
                disabled={!enableTaxEntries}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </button>
            </div>


            {!enableTaxEntries && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Please select Tender Work and Effective Date above to enable
                    tax parameter entries
                  </p>
                </div>
              </div>
            )}


            {loadingOptions.taxTypes || loadingOptions.ledgers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-600">
                  Loading dropdown options...
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  {loadingOptions.taxTypes && <p>• Loading tax types...</p>}
                  {loadingOptions.ledgers && (
                    <p>• Loading ledger accounts...</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {errors.tax_entries && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.tax_entries}
                    </p>
                  </div>
                )}


                {taxEntries.map((entry, index) => (
                  <div
                    key={index}
                    className={`mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50 ${!enableTaxEntries ? "pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <h3 className="text-md font-medium text-gray-900">
                          Tax Parameter #{entry.VIP_Sr || index + 1}
                        </h3>
                        {entry.is_ledger_editable && (
                          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Unlock className="h-3 w-3 mr-1" />
                            Manual Ledger
                          </span>
                        )}
                      </div>
                      {taxEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTaxEntry(index)}
                          disabled={!enableTaxEntries}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      )}
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
                      {/* Tax Type Dropdown with Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tax Type *
                        </label>
                        <div className="relative">
                          <List className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                          <select
                            value={entry.IC_Id}
                            onChange={(e) =>
                              handleTaxTypeChange(index, e.target.value)
                            }
                            disabled={!enableTaxEntries}
                            className={`w-full pl-10 pr-4 py-2.5 border ${
                              errors[`IC_Id_${index}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
                          >
                            <option value="">Select Tax Type</option>
                            {taxTypeOptions.map((option) => (
                              <option key={option.IC_Id} value={option.IC_Id}>
                                {option.IC_Name} ({option.IC_Code})
                              </option>
                            ))}
                          </select>
                          {errors[`IC_Id_${index}`] && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {errors[`IC_Id_${index}`] ? (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`IC_Id_${index}`]}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">
                            Select tax type
                          </p>
                        )}
                      </div>


                      {/* Add/Deduct Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Add/Deduct *
                        </label>
                        <div className="relative">
                          <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <select
                            value={entry.Add_Dedu}
                            onChange={(e) =>
                              handleOtherInputChange(
                                index,
                                "Add_Dedu",
                                e.target.value,
                              )
                            }
                            disabled={!enableTaxEntries}
                            className={`w-full pl-10 pr-4 py-2.5 border ${
                              errors[`Add_Dedu_${index}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
                          >
                            {addDeductOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors[`Add_Dedu_${index}`] && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {errors[`Add_Dedu_${index}`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`Add_Dedu_${index}`]}
                          </p>
                        )}
                      </div>


                      {/* Percentage Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Percentage (%) *
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={entry.Percent}
                            onChange={(e) =>
                              handleOtherInputChange(
                                index,
                                "Percent",
                                e.target.value,
                              )
                            }
                            disabled={!enableTaxEntries}
                            className={`w-full pl-10 pr-4 py-2.5 border ${
                              errors[`Percent_${index}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
                            placeholder="e.g., 18.00"
                          />
                          {errors[`Percent_${index}`] && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {errors[`Percent_${index}`] ? (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`Percent_${index}`]}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">
                            Tax percentage (0-100)
                          </p>
                        )}
                      </div>


                      {/* Ledger Account Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ledger Account *
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          {entry.is_ledger_editable ? (
                            // Editable dropdown for tax types without ledger
                            <select
                              value={entry.Lg_Id}
                              onChange={(e) =>
                                handleLedgerChange(index, e.target.value)
                              }
                              disabled={!enableTaxEntries}
                              className={`w-full pl-10 pr-4 py-2.5 border ${
                                errors[`Lg_Id_${index}`]
                                  ? "border-red-300"
                                  : "border-gray-300"
                              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
                            >
                              <option value="">Select Ledger Account</option>
                              {ledgerOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            // Non-editable display for auto-filled ledger
                            <div className="relative">
                              <input
                                type="text"
                                value={getLedgerDisplay(entry)}
                                readOnly
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                            </div>
                          )}
                          {errors[`Lg_Id_${index}`] && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {errors[`Lg_Id_${index}`] ? (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`Lg_Id_${index}`]}
                          </p>
                        ) : entry.is_ledger_editable ? (
                          <p className="mt-1 text-xs text-gray-500">
                            Manual selection required (tax type has no ledger)
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">
                            Auto-filled from tax type (non-editable)
                          </p>
                        )}
                      </div>


                      {/* Exmp_Alw Dropdown - New Field with Yes/No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Exempt Allow *
                        </label>
                        <div className="relative">
                          <select
                            value={entry.Exmp_Alw}
                            onChange={(e) =>
                              handleOtherInputChange(
                                index,
                                "Exmp_Alw",
                                e.target.value,
                              )
                            }
                            disabled={!enableTaxEntries}
                            className={`w-full pl-4 pr-4 py-2.5 border ${
                              errors[`Exmp_Alw_${index}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
                          >
                            {exemptAllowOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors[`Exmp_Alw_${index}`] && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {errors[`Exmp_Alw_${index}`] ? (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`Exmp_Alw_${index}`]}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">
                            Select Yes for exempt, No for non-exempt (Default: No)
                          </p>
                        )}
                      </div>


                      {/* Calculation Formula Input - Wider */}
                      {/* Calculation Formula Input - Auto-generated */}
<div className="lg:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Calculation Formula *
  </label>
  <div className="relative">
    <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      type="text"
      value={entry.Formula}
      onChange={(e) =>
        handleOtherInputChange(
          index,
          "Formula",
          e.target.value,
        )
      }
      disabled={!enableTaxEntries}
      className={`w-full pl-10 pr-4 py-2.5 border ${
        errors[`Formula_${index}`]
          ? "border-red-300"
          : "border-gray-300"
      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
      placeholder="Formula auto-generated when tax type is selected"
      maxLength={100}
    />
    {errors[`Formula_${index}`] && (
      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
    )}
  </div>
  {errors[`Formula_${index}`] ? (
    <p className="mt-1 text-xs text-red-600">
      {errors[`Formula_${index}`]}
    </p>
  ) : (
    <p className="mt-1 text-xs text-gray-500">
      Formula auto-generated as <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">Gros*IC_Code/100</span> when tax type is selected (max 100 chars)
    </p>
  )}
</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              All completed entries will be saved together in a single click
            </p>
          </div>
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
                loadingOptions.taxTypes ||
                loadingOptions.ledgers ||
                loadingOptions.tenderWorks ||
                !enableTaxEntries
              }
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode
                    ? "Update Tax Parameters"
                    : "Create Tax Parameters"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};


export default AddEditInvoiceTaxParameter;

