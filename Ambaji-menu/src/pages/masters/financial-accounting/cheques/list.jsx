import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  XCircle as XCircleIcon,
  Calendar,
  Filter,
  Printer,
  Clock,
  CheckSquare,
  Square,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequesApi } from "../../../services/chequesapi";
import { ChequeFormatsApi } from "../../../services/chequeformatsapi";
import debounce from "lodash/debounce";
import {
  buildDynamicChequePrintHtml,
  printChequeHtml,
  resolveChequeFormat,
  findChequeBookForCheque,
  formatHasLayout,
  unwrapChequeFormat,
  getChequeFormatId,
  pickChequePrintValues,
} from "../../../../utils/chequeFormatPrint";

const ChequesList = ({ user }) => {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCheques, setSelectedCheques] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Cheque Management");
  const [activeTab, setActiveTab] = useState("pending");

  // Print state
  const [isPrinting, setIsPrinting] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [printingProgress, setPrintingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [chequeBooks, setChequeBooks] = useState([]);
  const printContextRef = useRef({ books: [] });

  // Filter states
  const [filters, setFilters] = useState({
    cheque_number: "",
    SL_Name: "",
    amount: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/cheques";

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

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    [],
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setFilters({
      cheque_number: "",
      SL_Name: "",
      amount: "",
      status: "",
      date_from: "",
      date_to: "",
    });
    setCurrentPage(1);
  };

  // Load cheques when page, search, filters, or tab change
  useEffect(() => {
    loadCheques();
  }, [currentPage, searchDebounced, filters, activeTab]);

  useEffect(() => {
    loadChequePrintContext();
  }, []);

  const loadChequePrintContext = async () => {
    try {
      const books = await ChequesApi.getAllChequeBooks();
      const next = { books: Array.isArray(books) ? books : [] };
      printContextRef.current = next;
      setChequeBooks(next.books);
      return next;
    } catch (error) {
      console.error("Error loading cheque print formats:", error);
      return printContextRef.current;
    }
  };

  const ensureChequeBooks = async (booksOverride = null) => {
    if (Array.isArray(booksOverride) && booksOverride.length > 0) {
      return booksOverride;
    }
    if (printContextRef.current.books?.length > 0) {
      return printContextRef.current.books;
    }
    const loaded = await loadChequePrintContext();
    return loaded.books || [];
  };

  const getFormatForCheque = async (cheque, booksOverride = null) => {
    const books =
      Array.isArray(booksOverride) && booksOverride.length > 0
        ? booksOverride
        : await ChequesApi.getAllChequeBooks();
    const bookList = Array.isArray(books) ? books : [];
    printContextRef.current = { books: bookList };
    setChequeBooks(bookList);

    const book = findChequeBookForCheque(cheque, bookList);
    const formatId = getChequeFormatId(cheque, book);
    let format = unwrapChequeFormat(book?.cheque_format);

    if (formatId) {
      try {
        const response = await ChequeFormatsApi.getById(formatId);
        const detailed = unwrapChequeFormat(response);
        if (formatHasLayout(detailed)) format = detailed;
      } catch (error) {
        console.error("Error fetching cheque format:", error);
      }
    }

    if (!formatHasLayout(format)) {
      throw new Error(
        "No cheque format is attached to this cheque book. Assign a format and try again.",
      );
    }

    return format;
  };

  const loadCheques = async () => {
    setLoading(true);
    try {
      // Prepare filters object - only send non-empty values
      const activeFilters = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key].toString().trim() != "") {
          activeFilters[key] = filters[key];
        }
      });

      // Add status filter based on active tab
      if (activeTab == "pending") {
        activeFilters.status = "1";
      } else if (activeTab == "history") {
        activeFilters.status = "2";
      }

      const result = await ChequesApi.getAllCheques(
        currentPage,
        itemsPerPage,
        searchDebounced,
        activeFilters,
      );

      setCheques(result.cheques || []);
      setPagination(
        result.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
        },
      );
    } catch (error) {
      console.error("Error loading cheques:", error);
      toast.error(error.response?.data?.message || "Failed to load cheques");
      setCheques([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedCheques([]);
    setCurrentPage(1);
  };

  const handleDeleteCheque = async (chequeId, chequeNumber) => {
    const result = await Swal.fire({
      title: "Delete Cheque?",
      text: `Are you sure you want to delete cheque "${chequeNumber}"? This action cannot be undone.`,
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
      await ChequesApi.delete(chequeId);
      toast.success(`Cheque "${chequeNumber}" deleted successfully!`);
      await loadCheques();
      setSelectedCheques(selectedCheques.filter((id) => id != chequeId));
    } catch (error) {
      console.error("Error deleting cheque:", error);
      toast.error(error.response?.data?.message || "Failed to delete cheque");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCheques.length == 0) {
      toast.error("No cheques selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedCheques.length} selected cheques?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const deletePromises = selectedCheques.map((id) =>
          ChequesApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadCheques();
        setSelectedCheques([]);
        toast.success(
          `${selectedCheques.length} cheque(s) deleted successfully!`,
        );
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete some cheques");
        await loadCheques();
      } finally {
        setLoading(false);
      }
    }
  };

  // Mark cheque as complete (move to history)
  const handleMarkComplete = async (chequeId, chequeNumber) => {
    const result = await Swal.fire({
      title: "Mark as Complete?",
      text: `Are you sure you want to mark cheque "${chequeNumber}" as complete? This will move it to history.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, mark complete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setMarkingComplete(true);

      // Call update API with status = "2"
      await ChequesApi.update(chequeId, { status: "2" });

      toast.success(`Cheque "${chequeNumber}" marked as complete!`);
      await loadCheques();
      setSelectedCheques(selectedCheques.filter((id) => id != chequeId));
    } catch (error) {
      console.error("Error marking cheque as complete:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark cheque as complete",
      );
    } finally {
      setMarkingComplete(false);
    }
  };

  // Bulk mark as complete
  const handleBulkMarkComplete = async () => {
    if (selectedCheques.length == 0) {
      toast.error("No cheques selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Mark as Complete?",
      text: `Are you sure you want to mark ${selectedCheques.length} selected cheque(s) as complete? They will be moved to history.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, mark complete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLoading(true);
      setMarkingComplete(true);
      try {
        const updatePromises = selectedCheques.map((id) =>
          ChequesApi.update(id, { status: "2" }),
        );
        await Promise.all(updatePromises);
        await loadCheques();
        setSelectedCheques([]);
        toast.success(
          `${selectedCheques.length} cheque(s) marked as complete successfully!`,
        );
      } catch (error) {
        console.error("Bulk mark complete error:", error);
        toast.error("Failed to mark some cheques as complete");
        await loadCheques();
      } finally {
        setLoading(false);
        setMarkingComplete(false);
      }
    }
  };

  // ============ CHEQUE PRINT FUNCTIONS ============

  // Helper: Get cheque format name safely
  const getChequeFormatName = (cheque) => {
    const format = resolveChequeFormat(cheque, chequeBooks, []);
    if (format?.format_name) return format.format_name;
    const formatId = getChequeFormatId(
      cheque,
      findChequeBookForCheque(cheque, chequeBooks),
    );
    if (formatId) return `Format #${formatId}`;
    return "No Format";
  };

  // Convert number to words (Indian Rupees format)
  const numberToWords = (num) => {
    if (num == 0) return "Zero";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertToWords = (n) => {
      if (n < 20) return ones[n];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + convertToWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          convertToWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + convertToWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          convertToWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + convertToWords(n % 100000) : "")
        );
      return (
        convertToWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + convertToWords(n % 10000000) : "")
      );
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let words = convertToWords(rupees);
    if (paise > 0) {
      words += " and " + convertToWords(paise) + " Paise";
    }
    words += " Only";
    return words;
  };

  const buildChequePrintDocument = async (cheque, booksOverride = null) => {
    const { payeeName, amount, amountInWords, chequeDate } =
      pickChequePrintValues(cheque);
    const format = await getFormatForCheque(cheque, booksOverride);

    if (!payeeName) {
      throw new Error("Payee name is missing for this cheque");
    }

    if (amount <= 0) {
      throw new Error("Invalid amount for this cheque");
    }

    if (!chequeDate) {
      throw new Error("Cheque date is missing for this cheque");
    }

    if (!formatHasLayout(format)) {
      throw new Error(
        "No cheque format is attached to this cheque book. Assign a format and try again.",
      );
    }

    return buildDynamicChequePrintHtml({
      format,
      payeeName,
      amount,
      amountInWords: amountInWords || numberToWords(amount),
      chequeDate,
    });
  };

  // Single cheque print
  const handleDirectPrintCheque = async (cheque) => {
    if (isPrinting) return;

    try {
      setIsPrinting(true);
      toast.loading("Preparing cheque for printing...", {
        id: "print-loading",
      });

      const html = await buildChequePrintDocument(cheque);
      await printChequeHtml(html);

      toast.dismiss("print-loading");
      toast.success(`Cheque #${cheque.cheque_number} sent to printer!`);
    } catch (error) {
      console.error("Error printing cheque:", error);
      toast.dismiss("print-loading");
      toast.error(error.message || "Failed to print cheque. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  // Preview cheque (opens in new window)
  const handlePreviewCheque = async (cheque) => {
    try {
      const html = await buildChequePrintDocument(cheque);
      const printWindow = window.open("", "_blank", "width=900,height=500");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        toast.success("Preview opened! Use Ctrl+P to print.");
      } else {
        toast.error("Popup blocked. Please allow popups for this site.");
      }
    } catch (error) {
      console.error("Error previewing cheque:", error);
      toast.error(error.message || "Failed to generate preview");
    }
  };

  // Bulk print cheques (one by one)
  const handleBulkPrint = async () => {
    if (selectedCheques.length == 0) {
      toast.error("Please select at least one cheque to print");
      return;
    }

    if (isPrinting) return;

    try {
      setIsPrinting(true);

      // Confirm bulk print
      const result = await Swal.fire({
        title: "Bulk Print",
        html: `Are you sure you want to print <strong>${selectedCheques.length}</strong> cheque(s)?<br><br>
               <small class="text-gray-500">Each cheque will be printed one by one.</small>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10B981",
        cancelButtonColor: "#6B7280",
        confirmButtonText: `Yes, Print ${selectedCheques.length}`,
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        setIsPrinting(false);
        return;
      }

      // Get selected cheques
      const selectedChequeObjects = cheques.filter((c) =>
        selectedCheques.includes(c.cheque_id),
      );
      const bookList = await ensureChequeBooks();

      let successCount = 0;
      let failCount = 0;
      let failedCheques = [];

      // Print each cheque
      for (let i = 0; i < selectedChequeObjects.length; i++) {
        const cheque = selectedChequeObjects[i];

        try {
          // Show progress
          setPrintingProgress({
            current: i + 1,
            total: selectedChequeObjects.length,
          });
          toast.loading(
            `Printing ${i + 1}/${selectedChequeObjects.length}: ${cheque.cheque_number}`,
            {
              id: "bulk-print-progress",
            },
          );

          const html = await buildChequePrintDocument(cheque, bookList);
          await printChequeHtml(html);
          successCount++;

          // Small delay between prints to prevent browser issues
          if (i < selectedChequeObjects.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(
            `Error printing cheque ${cheque.cheque_number}:`,
            error,
          );
          failCount++;
          failedCheques.push(cheque.cheque_number);
        }
      }

      toast.dismiss("bulk-print-progress");
      setPrintingProgress({ current: 0, total: 0 });

      // Show results
      if (successCount > 0 && failCount == 0) {
        toast.success(`All ${successCount} cheque(s) printed successfully!`);
        setSelectedCheques([]);
      } else {
        toast.error("Failed to print any cheques. Please try again.");
      }
    } catch (error) {
      console.error("Bulk print error:", error);
      toast.dismiss("bulk-print-progress");
      toast.error("Bulk print failed. Please try again.");
    } finally {
      setIsPrinting(false);
      setPrintingProgress({ current: 0, total: 0 });
    }
  };

  // Stats calculation
  const stats = {
    totalCheques: pagination.total,
    totalAmount: cheques.reduce(
      (sum, c) => sum + (parseFloat(c.amount) || 0),
      0,
    ),
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status, clearedDate, bounceDate) => {
    if (status == "2") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </span>
      );
    }
    if (clearedDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Cleared
        </span>
      );
    }
    if (bounceDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Bounced
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const lastPage = pagination.last_page;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const hasActiveFilters =
    searchTerm != "" ||
    filters.cheque_number != "" ||
    filters.SL_Name != "" ||
    filters.amount != "" ||
    filters.status != "" ||
    filters.date_from != "" ||
    filters.date_to != "";

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCheques(cheques.map((c) => c.cheque_id));
    } else {
      setSelectedCheques([]);
    }
  };

  const handleSelectCheque = (chequeId, checked) => {
    if (checked) {
      setSelectedCheques([...selectedCheques, chequeId]);
    } else {
      setSelectedCheques(selectedCheques.filter((id) => id != chequeId));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage cheque transactions for financial accounting
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-4" aria-label="Tabs">
            <button
              onClick={() => handleTabChange("pending")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
                activeTab == "pending"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending Cheques
              <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                {cheques.filter((c) => c.status != "2").length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
                activeTab == "history"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Cheque History
              <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                {cheques.filter((c) => c.status == "2").length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cheques by number, payee name..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 border rounded-lg flex items-center transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                  {Object.values(filters).filter(
                    (f) => f && f.toString().trim() != "",
                  ).length + (searchTerm ? 1 : 0)}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}

            <button
              onClick={loadCheques}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cheque Number
                </label>
                <input
                  type="text"
                  name="cheque_number"
                  value={filters.cheque_number}
                  onChange={handleFilterChange}
                  placeholder="CHQ-000123"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payee Name
                </label>
                <input
                  type="text"
                  name="SL_Name"
                  value={filters.SL_Name}
                  onChange={handleFilterChange}
                  placeholder="Payee name"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="date_from"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="date_to"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* ===== BULK ACTIONS BAR - UPDATED ===== */}
        {/* Show bulk actions whenever any cheque is selected, regardless of tab */}
        {selectedCheques.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedCheques.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedCheques.length} cheque(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  {activeTab == "pending"
                    ? "Choose an action for selected cheques"
                    : "History cheques - only print action available"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* Progress indicator for bulk printing */}
              {printingProgress.total > 0 && (
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm text-gray-700">
                    {printingProgress.current}/{printingProgress.total}
                  </span>
                </div>
              )}

              <button
                onClick={() => setSelectedCheques([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>

              {/* PRINT BUTTON - Available for both tabs */}
              <button
                onClick={handleBulkPrint}
                disabled={isPrinting}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 flex items-center disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Printing...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Selected ({selectedCheques.length})
                  </>
                )}
              </button>

              {/* MARK COMPLETE BUTTON - Only show in pending tab */}
              {activeTab == "pending" && (
                <button
                  onClick={handleBulkMarkComplete}
                  disabled={markingComplete || loading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 flex items-center disabled:opacity-50"
                >
                  {markingComplete ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete ({selectedCheques.length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cheques Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={
                      cheques.length > 0 &&
                      selectedCheques.length == cheques.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cheque Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payee & Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Print Format
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading cheques...</p>
                    </div>
                  </td>
                </tr>
              ) : cheques.length > 0 ? (
                cheques.map((cheque) => (
                  <tr
                    key={cheque.cheque_id}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/cheques/view/${cheque.cheque_id}`,
                        );
                      }
                    }}
                  >
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedCheques.includes(cheque.cheque_id)}
                        onChange={(e) =>
                          handleSelectCheque(cheque.cheque_id, e.target.checked)
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {cheque.cheque_number}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {cheque.payment_type || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {cheque.SL_Name}
                      </div>
                      <div className="text-sm font-bold text-green-600 mt-1">
                        {formatCurrency(cheque.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {formatDate(cheque.cheque_date)}
                      </div>
                      {cheque.pdc_clearing_date && (
                        <div className="text-xs text-gray-400 mt-1">
                          PDC: {formatDate(cheque.pdc_clearing_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {getChequeFormatName(cheque)}
                          </span>
                        </div>
                        {resolveChequeFormat(cheque, chequeBooks, [])
                          ?.is_default && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(
                        cheque.status,
                        cheque.cleared_date,
                        cheque.bounce_date,
                      )}
                      {cheque.status_action && (
                        <div className="text-xs text-gray-500 mt-1">
                          {cheque.status_action.St_Name}
                        </div>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        {/* Print Button - Direct Print */}
                        <button
                          onClick={() => handleDirectPrintCheque(cheque)}
                          disabled={isPrinting}
                          className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Print Cheque"
                        >
                          {isPrinting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                          ) : (
                            <Printer className="h-4 w-4" />
                          )}
                        </button>

                        {/* Preview Button */}
                        <button
                          onClick={() => handlePreviewCheque(cheque)}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Preview Cheque"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <Link
                          to={`/masters/financial-accounting/cheques/view/${cheque.cheque_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Mark Complete - Only show in pending tab */}
                        {activeTab == "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkComplete(
                                cheque.cheque_id,
                                cheque.cheque_number,
                              );
                            }}
                            disabled={markingComplete}
                            className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as Complete"
                          >
                            {markingComplete ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        {activeTab == "pending" ? (
                          <Clock className="h-8 w-8 text-gray-400" />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching cheques found"
                          : activeTab == "pending"
                            ? "No pending cheques found"
                            : "No cheque history found"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : activeTab == "pending"
                            ? "All cheques have been completed or no cheques exist"
                            : "No cheques have been marked as complete yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
            entries
            {hasActiveFilters && " (filtered)"}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage == page
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.last_page, prev + 1),
                )
              }
              disabled={currentPage == pagination.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChequesList;
