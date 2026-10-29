// /***
//  *
//  *  Application Name: I3EMS
//  *
//  *  Developed By: Aark InfoSoft Pvt Ltd.
//  *
//  *  Version: Ambaji Mata Temple Management
//  *
//  *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
//  *
//  */

// import { useState, useEffect, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   Save,
//   X,
//   ArrowLeft,
//   ArrowRight,
//   Building2,
//   CheckCircle,
//   XCircle,
//   Landmark,
//   CreditCard,
//   Hash,
//   Send,
//   AlertCircle,
//   ChevronDown,
//   RefreshCw,
// } from "lucide-react";
// import { toast } from "react-hot-toast";
// import Swal from "sweetalert2";
// import { BankTransactionApi } from "../../../services/banktransactionapi";

// const AddEditBankTransaction = ({ user }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [statusOptions, setStatusOptions] = useState([]);
//   const [activeTab, setActiveTab] = useState("from");
//   const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
//   const [statusHighlightedIndex, setStatusHighlightedIndex] = useState(-1);

//   // Refs for keyboard navigation
//   const cvIdRef = useRef(null);
//   const pvIdRef = useRef(null);
//   const transIdRef = useRef(null);
//   const statusButtonRef = useRef(null);
//   const remarksRef = useRef(null);
//   const cancelButtonRef = useRef(null);
//   const saveButtonRef = useRef(null);
//   const prevButtonRef = useRef(null);

//   // From Account Refs
//   const fromBankAccRef = useRef(null);
//   const fromIfscRef = useRef(null);
//   const fromBankNameRef = useRef(null);
//   const fromAccTypeRef = useRef(null);
//   const fromBranchNameRef = useRef(null);

//   // To Account Refs
//   const toBankAccRef = useRef(null);
//   const toIfscRef = useRef(null);
//   const toBankNameRef = useRef(null);
//   const toAccTypeRef = useRef(null);
//   const toBranchNameRef = useRef(null);

//   // Status dropdown refs
//   const statusDropdownRef = useRef(null);
//   const statusItemRefs = useRef([]);

//   const tabs = ["from", "to"];
//   const isLastTab = activeTab ==  tabs[tabs.length - 1];

//   const [formData, setFormData] = useState({
//     CV_Id: "",
//     PV_Id: "",
//     Trans_Id: "",
//     Status: "initial",
//     Remarks: "",
//     // From Account Details
//     From_Bank_Acc: "",
//     From_IFSC: "",
//     From_Bank_Name: "",
//     From_Acc_type: "",
//     From_Branch_Name: "",
//     // To Account Details
//     To_Bank_Acc: "",
//     To_IFSC: "",
//     To_Bank_Name: "",
//     To_Acc_type: "",
//     To_Branch_Name: "",
//   });

//   // Load status options
//   useEffect(() => {
//     const loadStatusOptions = async () => {
//       const options = await BankTransactionApi.getStatusOptions();
//       setStatusOptions(options);
//     };
//     loadStatusOptions();
//   }, []);

//   useEffect(() => {
//     if (id && id !=  "create") {
//       setIsEditMode(true);
//       loadTransactionData();
//     }

//     const focusTimeout = setTimeout(() => {
//       if (!loading && !isEditMode) {
//         cvIdRef.current?.focus();
//       }
//     }, 300);

//     return () => clearTimeout(focusTimeout);
//   }, [id]);

//   // Focus on first field of current tab when tab changes
//   useEffect(() => {
//     if (!loading) {
//       setTimeout(() => {
//         if (activeTab ==  "from") {
//           fromBankAccRef.current?.focus();
//         } else if (activeTab ==  "to") {
//           toBankAccRef.current?.focus();
//         }
//       }, 100);
//     }
//   }, [activeTab, loading]);

//   // Status dropdown effects
//   useEffect(() => {
//     if (isStatusDropdownOpen && statusHighlightedIndex >= 0 && statusDropdownRef.current) {
//       const container = statusDropdownRef.current.querySelector(".overflow-y-auto");
//       const item = statusItemRefs.current[statusHighlightedIndex];
//       if (container && item) {
//         const containerRect = container.getBoundingClientRect();
//         const itemRect = item.getBoundingClientRect();

//         if (itemRect.bottom > containerRect.bottom) {
//           item.scrollIntoView({ block: "nearest", behavior: "smooth" });
//         } else if (itemRect.top < containerRect.top) {
//           item.scrollIntoView({ block: "nearest", behavior: "smooth" });
//         }
//       }
//     }
//   }, [statusHighlightedIndex, isStatusDropdownOpen]);

//   const loadTransactionData = async () => {
//     setLoading(true);
//     try {
//       const result = await BankTransactionApi.getById(id);

//       if (!result.success) {
//         throw new Error(result.message || "Failed to load transaction data");
//       }

//       const transaction = result.data;

//       setFormData({
//         CV_Id: transaction.CV_Id || "",
//         PV_Id: transaction.PV_Id || "",
//         Trans_Id: transaction.Trans_Id || "",
//         Status: transaction.Status || "initial",
//         Remarks: transaction.Remarks || "",
//         From_Bank_Acc: transaction.From_Bank_Acc || "",
//         From_IFSC: transaction.From_IFSC || "",
//         From_Bank_Name: transaction.From_Bank_Name || "",
//         From_Acc_type: transaction.From_Acc_type || "",
//         From_Branch_Name: transaction.From_Branch_Name || "",
//         To_Bank_Acc: transaction.To_Bank_Acc || "",
//         To_IFSC: transaction.To_IFSC || "",
//         To_Bank_Name: transaction.To_Bank_Name || "",
//         To_Acc_type: transaction.To_Acc_type || "",
//         To_Branch_Name: transaction.To_Branch_Name || "",
//       });
//     } catch (error) {
//       console.error("Error loading transaction:", error);
//       toast.error(error.message || "Failed to load transaction data!");
//       navigate("/transactions/bookkeeping-vouchers/bank-transactions");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     // Auto uppercase for IFSC codes
//     if (name ==  "From_IFSC" || name ==  "To_IFSC") {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value.toUpperCase(),
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   // Status dropdown handlers
//   const handleStatusSelect = (value) => {
//     setFormData((prev) => ({
//       ...prev,
//       Status: value,
//     }));
//     setIsStatusDropdownOpen(false);
//     setStatusHighlightedIndex(-1);

//     setTimeout(() => {
//       remarksRef.current?.focus();
//     }, 100);
//   };

//   const handleStatusKeyDown = (e) => {
//     if (e.key ==  "Enter" || e.key ==  "ArrowDown" || e.key ==  "ArrowUp" || e.key ==  " ") {
//       e.preventDefault();
//       setIsStatusDropdownOpen(true);
//       setStatusHighlightedIndex(-1);
//     } else if (e.key ==  "Tab") {
//       if (!e.shiftKey) {
//         setIsStatusDropdownOpen(false);
//       }
//     }
//   };

//   const handleStatusItemKeyDown = (e, item, idx) => {
//     if (e.key ==  "ArrowDown") {
//       e.preventDefault();
//       const nextIndex = idx + 1;
//       if (nextIndex < statusOptions.length) {
//         setStatusHighlightedIndex(nextIndex);
//         setTimeout(() => {
//           if (statusItemRefs.current[nextIndex]) {
//             statusItemRefs.current[nextIndex].focus();
//           }
//         }, 0);
//       }
//     } else if (e.key ==  "ArrowUp") {
//       e.preventDefault();
//       if (idx ==  0) {
//         setStatusHighlightedIndex(-1);
//         setTimeout(() => statusButtonRef.current?.focus(), 0);
//       } else {
//         const prevIndex = idx - 1;
//         setStatusHighlightedIndex(prevIndex);
//         setTimeout(() => {
//           if (statusItemRefs.current[prevIndex]) {
//             statusItemRefs.current[prevIndex].focus();
//           }
//         }, 0);
//       }
//     } else if (e.key ==  "Enter") {
//       e.preventDefault();
//       handleStatusSelect(item.value);
//     } else if (e.key ==  "Escape") {
//       e.preventDefault();
//       setIsStatusDropdownOpen(false);
//       setStatusHighlightedIndex(-1);
//       statusButtonRef.current?.focus();
//     } else if (e.key ==  "Tab") {
//       e.preventDefault();
//       if (statusHighlightedIndex >= 0) {
//         handleStatusSelect(statusOptions[statusHighlightedIndex].value);
//       } else {
//         handleStatusSelect(formData.Status);
//       }
//     }
//   };

//   const getStatusLabel = () => {
//     const selected = statusOptions.find((option) => option.value ==  formData.Status);
//     return selected ? selected.label : "Initial";
//   };

//   // General Enter key navigation
//   const handleEnterKey = (e, nextRef) => {
//     if (e.key ==  "Enter") {
//       e.preventDefault();
//       if (nextRef?.current) {
//         if (
//           nextRef.current.tagName ==  "TEXTAREA" ||
//           nextRef.current.tagName ==  "INPUT" ||
//           nextRef.current.tagName ==  "SELECT"
//         ) {
//           nextRef.current.focus();
//         } else {
//           nextRef.current.focus();
//         }
//       }
//     }
//   };

//   const validateCurrentTab = () => {
//     const errors = [];

//     if (activeTab ==  "from") {
//       if (!formData.From_Bank_Name?.trim()) {
//         errors.push("From Bank Name is required");
//       }
//       if (!formData.From_Bank_Acc?.trim()) {
//         errors.push("From Bank Account Number is required");
//       }
//       if (!formData.From_IFSC?.trim()) {
//         errors.push("From IFSC Code is required");
//       }
//       if (formData.From_IFSC && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.From_IFSC)) {
//         errors.push("From IFSC Code must be 11 characters (e.g., SBIN0001234)");
//       }
//     }

//     if (activeTab ==  "to") {
//       if (!formData.To_Bank_Name?.trim()) {
//         errors.push("To Bank Name is required");
//       }
//       if (!formData.To_Bank_Acc?.trim()) {
//         errors.push("To Bank Account Number is required");
//       }
//       if (!formData.To_IFSC?.trim()) {
//         errors.push("To IFSC Code is required");
//       }
//       if (formData.To_IFSC && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.To_IFSC)) {
//         errors.push("To IFSC Code must be 11 characters (e.g., SBIN0001234)");
//       }
//     }

//     return errors;
//   };

//   const handleSaveAndNext = async () => {
//     const errors = validateCurrentTab();
//     if (errors.length > 0) {
//       toast.error(errors[0]);
//       return;
//     }

//     if (isLastTab) {
//       const result = await Swal.fire({
//         title: isEditMode ? "Update Bank Transaction?" : "Create New Bank Transaction?",
//         text: isEditMode
//           ? "Are you sure you want to update this transaction information?"
//           : "Are you sure you want to create this new bank transaction?",
//         icon: "question",
//         showCancelButton: true,
//         confirmButtonColor: "#10b981",
//         cancelButtonColor: "#6b7280",
//         confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
//         cancelButtonText: "Cancel",
//       });

//       if (!result.isConfirmed) return;

//       setSaving(true);
//       try {
//         const data = {
//           CV_Id: formData.CV_Id ? parseInt(formData.CV_Id) : null,
//           PV_Id: formData.PV_Id ? parseInt(formData.PV_Id) : null,
//           Trans_Id: formData.Trans_Id || null,
//           Status: formData.Status,
//           Remarks: formData.Remarks || null,
//           From_Bank_Acc: formData.From_Bank_Acc || null,
//           From_IFSC: formData.From_IFSC || null,
//           From_Bank_Name: formData.From_Bank_Name || null,
//           From_Acc_type: formData.From_Acc_type || null,
//           From_Branch_Name: formData.From_Branch_Name || null,
//           To_Bank_Acc: formData.To_Bank_Acc || null,
//           To_IFSC: formData.To_IFSC || null,
//           To_Bank_Name: formData.To_Bank_Name || null,
//           To_Acc_type: formData.To_Acc_type || null,
//           To_Branch_Name: formData.To_Branch_Name || null,
//         };

//         let response;

//         if (isEditMode) {
//           response = await BankTransactionApi.update(id, data);
//         } else {
//           response = await BankTransactionApi.create(data);
//         }

//         if (!response.success) {
//           throw new Error(
//             response.message || `Failed to ${isEditMode ? "update" : "create"} transaction`
//           );
//         }

//         toast.success(
//           `Bank transaction ${isEditMode ? "updated" : "created"} successfully!`
//         );

//         setTimeout(() => {
//           navigate("/transactions/bookkeeping-vouchers/bank-transactions");
//         }, 1500);
//       } catch (error) {
//         console.error("Error saving transaction:", error);
//         toast.error(error.message || "Failed to save bank transaction");
//       } finally {
//         setSaving(false);
//       }
//     } else {
//       const currentIndex = tabs.indexOf(activeTab);
//       if (currentIndex < tabs.length - 1) {
//         setActiveTab(tabs[currentIndex + 1]);

//         window.scrollTo({
//           top: 0,
//           behavior: "smooth",
//         });
//       }
//     }
//   };

//   const handleCancel = () => {
//     navigate("/transactions/bookkeeping-vouchers/bank-transactions");
//   };

//   if (loading) {
//     return (
//       <div className="p-12 text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
//         <p className="mt-4 text-gray-600">Loading transaction data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <button
//             onClick={() => navigate("/transactions/bookkeeping-vouchers/bank-transactions")}
//             className="mr-4 text-gray-500 hover:text-gray-700"
//           >
//             <ArrowLeft className="h-5 w-5" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {isEditMode ? "Edit Bank Transaction" : "Add New Bank Transaction"}
//             </h1>
//             <p className="text-gray-600 mt-1">
//               {isEditMode
//                 ? "Update bank transaction information"
//                 : "Create a new bank transaction record"}
//             </p>
//           </div>
//         </div>

//         {/* Progress Indicator */}
//         <div className="flex items-center space-x-2">
//           {tabs.map((tab, index) => (
//             <div key={tab} className="flex items-center">
//               <div
//                 className={`h-2 w-2 rounded-full ${
//                   activeTab ==  tab
//                     ? "bg-blue-600"
//                     : tabs.indexOf(activeTab) > index
//                     ? "bg-green-500"
//                     : "bg-gray-300"
//                 }`}
//               />
//               {index < tabs.length - 1 && (
//                 <div
//                   className={`h-0.5 w-4 ${
//                     tabs.indexOf(activeTab) > index ? "bg-green-500" : "bg-gray-300"
//                   }`}
//                 />
//               )}
//             </div>
//           ))}
//           <span className="text-sm text-gray-500 ml-2">
//             {tabs.indexOf(activeTab) + 1} of {tabs.length}
//           </span>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200 mb-6">
//         <nav className="-mb-px flex space-x-8 overflow-x-auto">
//           <button
//             onClick={() => setActiveTab("from")}
//             className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
//               activeTab ==  "from"
//                 ? "border-blue-500 text-blue-600"
//                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//             }`}
//           >
//             <Send className="h-4 w-4 inline mr-2" />
//             From Account Details
//           </button>
//           <button
//             onClick={() => setActiveTab("to")}
//             className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
//               activeTab ==  "to"
//                 ? "border-blue-500 text-blue-600"
//                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//             }`}
//           >
//             <Landmark className="h-4 w-4 inline mr-2" />
//             To Account Details
//           </button>
//         </nav>
//       </div>

//       <form onSubmit={(e) => e.preventDefault()}>
//         {/* From Account Tab */}
//         {activeTab ==  "from" && (
//           <div className="space-y-8">

//             {/* From Account Details Card */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex items-center mb-6">
//                 <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
//                   <Send className="h-4 w-4" />
//                 </div>
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   From Account Details
//                 </h2>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Bank Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       ref={fromBankNameRef}
//                       type="text"
//                       name="From_Bank_Name"
//                       value={formData.From_Bank_Name}
//                       onChange={handleInputChange}
//                       onKeyDown={(e) => handleEnterKey(e, fromBranchNameRef)}
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter source bank name"
//                       maxLength={255}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Branch Name
//                   </label>
//                   <input
//                     ref={fromBranchNameRef}
//                     type="text"
//                     name="From_Branch_Name"
//                     value={formData.From_Branch_Name}
//                     onChange={handleInputChange}
//                     onKeyDown={(e) => handleEnterKey(e, fromBankAccRef)}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter source branch name"
//                     maxLength={255}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Account Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       ref={fromBankAccRef}
//                       type="text"
//                       name="From_Bank_Acc"
//                       value={formData.From_Bank_Acc}
//                       onChange={handleInputChange}
//                       onKeyDown={(e) => handleEnterKey(e, fromIfscRef)}
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter source account number"
//                       maxLength={255}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     IFSC Code <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       ref={fromIfscRef}
//                       type="text"
//                       name="From_IFSC"
//                       value={formData.From_IFSC}
//                       onChange={handleInputChange}
//                       onKeyDown={(e) => handleEnterKey(e, fromAccTypeRef)}
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
//                       placeholder="SBIN0001234"
//                       maxLength={20}
//                     />
//                   </div>
//                   <p className="mt-1 text-xs text-gray-500">
//                     11 characters (e.g., SBIN0001234)
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Account Type
//                   </label>
//                   <select
//                     ref={fromAccTypeRef}
//                     name="From_Acc_type"
//                     value={formData.From_Acc_type}
//                     onChange={handleInputChange}
//                     onKeyDown={(e) => {
//                       if (e.key ==  "Enter") {
//                         e.preventDefault();
//                         if (!isLastTab) {
//                           handleSaveAndNext();
//                         } else {
//                           statusButtonRef.current?.focus();
//                         }
//                       }
//                     }}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Select Account Type</option>
//                     <option value="Savings">Savings</option>
//                     <option value="Current">Current</option>
//                     <option value="OD">Overdraft (OD)</option>
//                     <option value="CC">Cash Credit (CC)</option>
//                     <option value="NRI">NRI Account</option>
//                     <option value="Other">Other</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* To Account Tab */}
//         {activeTab ==  "to" && (
//           <div className="space-y-8">
//             {/* To Account Details Card */}
//             <div className="bg-white rounded-xl shadow-sm border p-6">
//               <div className="flex items-center mb-6">
//                 <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
//                   <Landmark className="h-4 w-4" />
//                 </div>
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   To Account Details
//                 </h2>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Bank Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       ref={toBankNameRef}
//                       type="text"
//                       name="To_Bank_Name"
//                       value={formData.To_Bank_Name}
//                       onChange={handleInputChange}
//                       onKeyDown={(e) => handleEnterKey(e, toBranchNameRef)}
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter destination bank name"
//                       maxLength={255}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Branch Name
//                   </label>
//                   <input
//                     ref={toBranchNameRef}
//                     type="text"
//                     name="To_Branch_Name"
//                     value={formData.To_Branch_Name}
//                     onChange={handleInputChange}
//                     onKeyDown={(e) => handleEnterKey(e, toBankAccRef)}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter destination branch name"
//                     maxLength={255}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Account Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       ref={toBankAccRef}
//                       type="text"
//                       name="To_Bank_Acc"
//                       value={formData.To_Bank_Acc}
//                       onChange={handleInputChange}
//                       onKeyDown={(e) => handleEnterKey(e, toIfscRef)}
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter destination account number"
//                       maxLength={255}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     IFSC Code <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       ref={toIfscRef}
//                       type="text"
//                       name="To_IFSC"
//                       value={formData.To_IFSC}
//                       onChange={handleInputChange}
//                       onKeyDown={(e) => handleEnterKey(e, toAccTypeRef)}
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
//                       placeholder="HDFC0001234"
//                       maxLength={20}
//                     />
//                   </div>
//                   <p className="mt-1 text-xs text-gray-500">
//                     11 characters (e.g., HDFC0001234)
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Account Type
//                   </label>
//                   <select
//                     ref={toAccTypeRef}
//                     name="To_Acc_type"
//                     value={formData.To_Acc_type}
//                     onChange={handleInputChange}
//                     onKeyDown={(e) => {
//                       if (e.key ==  "Enter") {
//                         e.preventDefault();
//                         statusButtonRef.current?.focus();
//                       }
//                     }}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">Select Account Type</option>
//                     <option value="Savings">Savings</option>
//                     <option value="Current">Current</option>
//                     <option value="OD">Overdraft (OD)</option>
//                     <option value="CC">Cash Credit (CC)</option>
//                     <option value="NRI">NRI Account</option>
//                     <option value="Other">Other</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Navigation Buttons */}
//         <div className="flex justify-between items-center mt-8 pt-6 border-t">
//           {/* Left side: Previous button */}
//           <div>
//             {activeTab !=  "from" && (
//               <button
//                 ref={prevButtonRef}
//                 type="button"
//                 onClick={() => {
//                   const currentIndex = tabs.indexOf(activeTab);
//                   setActiveTab(tabs[currentIndex - 1]);
//                   window.scrollTo({
//                     top: 0,
//                     behavior: "smooth",
//                   });
//                 }}
//                 onKeyDown={(e) => {
//                   if (e.key ==  "Enter") {
//                     e.preventDefault();
//                     const currentIndex = tabs.indexOf(activeTab);
//                     setActiveTab(tabs[currentIndex - 1]);
//                     window.scrollTo({
//                       top: 0,
//                       behavior: "smooth",
//                     });
//                   }
//                 }}
//                 className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-colors"
//               >
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Previous
//               </button>
//             )}
//           </div>

//           {/* Right side: Cancel and Save & Next button */}
//           <div className="flex items-center space-x-3">
//             <button
//               ref={cancelButtonRef}
//               type="button"
//               onClick={handleCancel}
//               onKeyDown={(e) => {
//                 if (e.key ==  "Enter") {
//                   e.preventDefault();
//                   handleCancel();
//                 }
//               }}
//               className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
//             >
//               <X className="h-4 w-4 mr-2" />
//               Cancel
//             </button>
//             <button
//               ref={saveButtonRef}
//               type="button"
//               onClick={handleSaveAndNext}
//               onKeyDown={(e) => {
//                 if (e.key ==  "Enter") {
//                   e.preventDefault();
//                   handleSaveAndNext();
//                 }
//               }}
//               disabled={saving}
//               className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {saving ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                   {isLastTab
//                     ? isEditMode
//                       ? "Updating..."
//                       : "Creating..."
//                     : "Saving..."}
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4 mr-2" />
//                   {isLastTab
//                     ? isEditMode
//                       ? "Update Transaction"
//                       : "Create Transaction"
//                     : "Next"}
//                   {!isLastTab && <ArrowRight className="h-4 w-4 ml-2" />}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddEditBankTransaction;