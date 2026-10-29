import React, { useState, useEffect, useRef } from "react";
import {
    FiChevronLeft,
    FiAlertCircle,
    FiPrinter,
    FiX,
    FiSearch,
    FiCalendar,
    FiHome,
    FiChevronDown,
    FiChevronRight,
    FiCheck,
    FiFolder,
    FiFileText,
    FiEye,
    FiEyeOff,
    FiDownload,
    FiPrinter as FiPrinterIcon,
} from "react-icons/fi";
import axios from "axios";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

// ============= SEARCHABLE DROPDOWN COMPONENT ==============
const SearchableDropdown = ({
    label,
    value,
    error,
    required = false,
    icon: Icon,
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    items,
    filteredItems,
    highlightedIndex,
    onSelect,
    onKeyDown,
    onSearchKeyDown,
    onItemKeyDown,
    getDisplay,
    getSelectedDisplay,
    loading,
    placeholder,
    searchPlaceholder,
    buttonRef,
    dropdownRef,
    searchRef,
    itemRefs,
    listRef,
    disabled = false,
    renderItem,
    includeAllOption = false,
    allOptionLabel = "All Departments",
    allOptionValue = "all",
}) => {
    const handleWheel = (e) => {
        e.stopPropagation();
    };

    return (
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                )}

                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    onKeyDown={!disabled ? onKeyDown : undefined}
                    disabled={disabled}
                    className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${error ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${disabled
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white hover:bg-gray-50"
                        } transition-colors`}
                >
                    {value ? (
                        <span className="text-gray-900">{getSelectedDisplay()}</span>
                    ) : (
                        <span className="text-gray-500">
                            {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
                        </span>
                    )}
                </button>

                {loading ? (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    !disabled && (
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FiChevronDown className="h-4 w-4" />
                        </button>
                    )
                )}

                {error && (
                    <FiAlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
            </div>

            {isOpen && !disabled && (
                <div
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
                    style={{ minWidth: "300px" }}
                >
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={onSearchKeyDown}
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                autoFocus
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div
                        ref={listRef}
                        className="overflow-y-auto max-h-64"
                        onWheel={handleWheel}
                    >
                        {includeAllOption && !searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect({
                                        id: allOptionValue,
                                        name: allOptionLabel,
                                        isAllOption: true,
                                    });
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${value == allOptionValue
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700"
                                    }`}
                                tabIndex={0}
                            >
                                <div className="flex items-center">
                                    <FiHome className="h-4 w-4 mr-2" />
                                    <span className="font-medium">{allOptionLabel}</span>
                                </div>
                                {value == allOptionValue && (
                                    <div className="text-xs text-blue-600 mt-1 flex items-center">
                                        <FiCheck className="h-3 w-3 mr-1" />
                                        Selected
                                    </div>
                                )}
                            </button>
                        )}

                        {filteredItems.length > 0 ? (
                            filteredItems.map((item, idx) => {
                                const itemId =
                                    item?.Dpt_id ?? item?.Dpt_Id ?? item?.id ?? `item-${idx}`;

                                return (
                                    <button
                                        key={itemId}
                                        ref={(el) => {
                                            if (el && itemRefs.current) {
                                                itemRefs.current[idx] = el;
                                            }
                                        }}
                                        type="button"
                                        onClick={() => {
                                            onSelect(item);
                                        }}
                                        onKeyDown={(e) => onItemKeyDown(e, idx, item)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${highlightedIndex == idx
                                                ? "bg-blue-100"
                                                : value && itemId && value == itemId.toString()
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "text-gray-700"
                                            }`}
                                        tabIndex={0}
                                    >
                                        {renderItem ? renderItem(item) : getDisplay(item)}
                                        {value && itemId && value == itemId.toString() && (
                                            <div className="text-xs text-blue-600 mt-1 flex items-center">
                                                <FiCheck className="h-3 w-3 mr-1" />
                                                Selected
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <FiSearch className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                <p>No departments found</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>{filteredItems.length} departments found</span>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                    <FiAlertCircle className="h-3 w-3 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
};

// Format currency
const formatCurrency = (amount) => {
    if (amount == undefined || amount == null || amount == 0) return "-";
    const num = typeof amount == "number" ? amount : parseFloat(amount);
    if (isNaN(num)) return "-";
    const formatted = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(num));
    if (num < 0) {
        return `(${formatted})`;
    }
    return formatted;
};

// Number to words function
const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero";
    const n = Math.round(parseFloat(num));
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
    const convert = (n) => {
        if (n < 20) return ones[n];
        if (n < 100)
            return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        if (n < 1000)
            return (
                ones[Math.floor(n / 100)] +
                " Hundred" +
                (n % 100 ? " " + convert(n % 100) : "")
            );
        if (n < 100000)
            return (
                convert(Math.floor(n / 1000)) +
                " Thousand" +
                (n % 1000 ? " " + convert(n % 1000) : "")
            );
        if (n < 10000000)
            return (
                convert(Math.floor(n / 100000)) +
                " Lakh" +
                (n % 100000 ? " " + convert(n % 100000) : "")
            );
        return (
            convert(Math.floor(n / 10000000)) +
            " Crore" +
            (n % 10000000 ? " " + convert(n % 10000000) : "")
        );
    };
    return convert(n);
};

const DepartmentwiseCashbookReport = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [reportData, setReportData] = useState(null);
    const [pageTitle, setPageTitle] = useState("Department-wise Cashbook Report");

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    // Filter states - default to today's date
    const [dateFrom, setDateFrom] = useState(getTodayDate());
    const [dateTo, setDateTo] = useState(getTodayDate());
    const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");

    // Department dropdown states
    const [departments, setDepartments] = useState([]);
    const [flattenedDepartments, setFlattenedDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [dropdownLoading, setDropdownLoading] = useState(false);
    const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
    const [deptSearchTerm, setDeptSearchTerm] = useState("");
    const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
    const deptDropdownRef = useRef(null);
    const deptSearchRef = useRef(null);
    const deptButtonRef = useRef(null);
    const deptItemRefs = useRef([]);
    const deptListRef = useRef(null);

    // Applied filters
    const [appliedFilters, setAppliedFilters] = useState({
        from_date: null,
        to_date: null,
        dept_id: null,
        dept_name: null,
    });
    const [hasGenerated, setHasGenerated] = useState(false);

    // Expand state for ledger rows
    const [expandedLedger, setExpandedLedger] = useState(null);

    // Print state
    const [showPrint, setShowPrint] = useState(false);
    const [printOrientation, setPrintOrientation] = useState("landscape");
    const [printReady, setPrintReady] = useState(false);

    const { organization } = useOrganization();

    // Get dynamic page title
    useEffect(() => {
        try {
            const menuDetails = JSON.parse(
                localStorage.getItem("menu_details") || "[]",
            );
            const currentPath = "/reports/cash-bank/departmentwise-cashbook-report";
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

    // Build department tree structure
    const buildDepartmentTree = (depts) => {
        const map = {};
        const roots = [];

        depts.forEach((dept) => {
            const id = dept.Dpt_id ?? dept.Dpt_Id;
            map[id] = {
                ...dept,
                Dpt_id: id,
                children: [],
                level: parseInt(dept.GrStt) || 1,
            };
        });

        depts.forEach((dept) => {
            const id = dept.Dpt_id ?? dept.Dpt_Id;
            const currentDept = map[id];
            const parentGrp = dept.UpGrp;

            const parent = Object.values(map).find(
                (d) => d.GrCod == parentGrp && (d.Dpt_id ?? d.Dpt_Id) != id,
            );

            if (parent && parentGrp != dept.GrCod) {
                parent.children.push(currentDept);
            } else if (currentDept.level == 1 || !parent) {
                roots.push(currentDept);
            }
        });

        return roots;
    };

    // Flatten tree for dropdown
    const flattenTree = (nodes, level = 1, result = []) => {
        nodes.forEach((node) => {
            result.push({
                ...node,
                treeLevel: level,
                displayName: `${"    ".repeat(level - 1)}${node.Dpt_Desc || node.Dpt_Name
                    }`,
            });
            if (node.children && node.children.length > 0) {
                flattenTree(node.children, level + 1, result);
            }
        });
        return result;
    };

    // Load departments structure
    const loadDepartments = async () => {
        setDropdownLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
                { headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
            );

            if (response.data.success) {
                const activeDepartments = (response.data.data || []).filter(
                    (dept) => dept.isvisible == 1 || dept.isvisible == "1",
                );

                const tree = buildDepartmentTree(activeDepartments);
                const flattened = flattenTree(tree);
                setDepartments(activeDepartments);
                setFlattenedDepartments(flattened);
                setFilteredDepartments(flattened);
            }
        } catch (error) {
            console.error("Failed to load departments:", error);
        } finally {
            setDropdownLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                deptDropdownRef.current &&
                !deptDropdownRef.current.contains(event.target)
            ) {
                setIsDeptDropdownOpen(false);
                setDeptHighlightedIndex(-1);
                setDeptSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Focus search when dropdown opens
    useEffect(() => {
        if (isDeptDropdownOpen && deptSearchRef.current) {
            setTimeout(() => deptSearchRef.current.focus(), 0);
        }
    }, [isDeptDropdownOpen]);

    // Filter departments
    useEffect(() => {
        if (!flattenedDepartments.length) return;

        if (!deptSearchTerm.trim()) {
            setFilteredDepartments(flattenedDepartments);
        } else {
            const term = deptSearchTerm.toLowerCase();
            const filtered = flattenedDepartments.filter(
                (dept) =>
                    (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
                    (dept.Dpt_Name?.toLowerCase() || "").includes(term) ||
                    (dept.GrCod?.toLowerCase() || "").includes(term),
            );
            setFilteredDepartments(filtered);
        }
        setDeptHighlightedIndex(-1);
    }, [deptSearchTerm, flattenedDepartments]);

    // Fetch report data from API
    const fetchReportData = async (filters = null) => {
        setLoading(true);
        try {
            const activeFilters = filters || appliedFilters;

            const params = new URLSearchParams();

            if (activeFilters.dept_id) params.append("Dpt_Id", activeFilters.dept_id);
            else params.append("Dpt_Id", "0");
            if (activeFilters.from_date)
                params.append("from_date", activeFilters.from_date);
            if (activeFilters.to_date)
                params.append("to_date", activeFilters.to_date);

            const url = `${import.meta.env.VITE_API_URL
                }/department-cash-ledgers?${params.toString()}`;
            const response = await axios.get(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });

            if (response.data?.success) {
                const payload = response.data.data;
                if (payload?.ledgers?.length > 0) {
                    setReportData(payload);
                } else {
                    setReportData(null);
                    setMessage({
                        text: "No data found for selected filters",
                        type: "warning",
                    });
                }
            } else {
                setReportData(null);
                setMessage({
                    text: response.data?.message || "No data found",
                    type: "warning",
                });
            }
        } catch (err) {
            console.error("Error fetching report data:", err);
            setMessage({
                text: err.response?.data?.message || "Error loading report data",
                type: "error",
            });
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const invalidateReport = () => {
        setHasGenerated(false);
        setReportData(null);
        setMessage({ text: "", type: "" });
    };

    const clearFilters = () => {
        setDateFrom(getTodayDate());
        setDateTo(getTodayDate());
        setSelectedDeptFilter("all");
        const emptyFilters = {
            from_date: null,
            to_date: null,
            dept_id: null,
            dept_name: null,
        };
        setAppliedFilters(emptyFilters);
        invalidateReport();
    };

    const handleGenerateReport = async () => {
        let deptIdValue = null;
        let deptNameValue = null;

        if (selectedDeptFilter && selectedDeptFilter != "all") {
            const selectedDept = flattenedDepartments.find(
                (d) => (d.Dpt_id ?? d.Dpt_Id)?.toString() == selectedDeptFilter,
            );
            deptIdValue = selectedDept?.Dpt_id ?? selectedDept?.Dpt_Id ?? null;
            deptNameValue = selectedDept?.Dpt_Name || selectedDept?.Dpt_Desc || null;
        } else {
            deptNameValue = "All Departments";
        }

        const newFilters = {
            from_date: dateFrom || null,
            to_date: dateTo || null,
            dept_id: deptIdValue,
            dept_name: deptNameValue,
        };

        setAppliedFilters(newFilters);
        setHasGenerated(true);
        setMessage({ text: "", type: "" });

        await fetchReportData(newFilters);
    };

    // Department display functions for dropdown
    const renderDepartmentItem = (dept) => {
        const level = dept.treeLevel || parseInt(dept.GrStt, 10) || 1;
        const desc = dept.Dpt_Desc || dept.desc || "No Description";
        const name = dept.Dpt_Name || dept.name;

        const levelColors = {
            1: "bg-blue-100 text-blue-600",
            2: "bg-green-100 text-green-600",
            3: "bg-amber-100 text-amber-600",
            4: "bg-purple-100 text-purple-600",
        };
        const colorClass = levelColors[level] || "bg-gray-100 text-gray-600";

        return (
            <div className="py-1">
                <div className="flex items-start">
                    <div
                        className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
                    >
                        <span className="text-xs font-bold">L{level}</span>
                    </div>
                    <div className="flex-1">
                        <div
                            className="text-sm font-medium text-gray-900 whitespace-pre-wrap"
                            style={{ marginLeft: `${(level - 1) * 20}px` }}
                        >
                            {desc}
                        </div>
                        {name && name != desc && (
                            <div
                                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                                style={{ marginLeft: `${(level - 1) * 20}px` }}
                            >
                                {name}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const getSelectedDepartmentDisplay = () => {
        if (!selectedDeptFilter || selectedDeptFilter == "all")
            return "All Departments";
        const selected = flattenedDepartments.find(
            (dept) => (dept.Dpt_id ?? dept.Dpt_Id)?.toString() == selectedDeptFilter,
        );
        if (!selected) return "All Departments";

        const level = selected.treeLevel || parseInt(selected.GrStt, 10) || 1;
        const indent = "    ".repeat(level - 1);
        const desc = selected.Dpt_Desc || selected.desc || "No Description";
        const name = selected.Dpt_Name || selected.name;

        if (name && name != desc) {
            return `${indent}${desc} (${name})`;
        }
        return `${indent}${desc}`;
    };

    const handleDeptFilterSelect = (dept) => {
        if (dept?.isAllOption) {
            setSelectedDeptFilter("all");
        } else if (dept) {
            const id = dept.Dpt_id ?? dept.Dpt_Id;
            if (id != null) setSelectedDeptFilter(id.toString());
        }
        setIsDeptDropdownOpen(false);
        setDeptSearchTerm("");
        setDeptHighlightedIndex(-1);

        if (hasGenerated) invalidateReport();
    };

    // Department dropdown key handlers
    const handleDepartmentKeyDown = (e) => {
        if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
            e.preventDefault();
            if (!isDeptDropdownOpen) {
                setIsDeptDropdownOpen(true);
                setDeptSearchTerm("");
                setDeptHighlightedIndex(-1);
                setTimeout(() => deptSearchRef.current?.focus(), 0);
            }
        } else if (e.key == "Escape") {
            e.preventDefault();
            if (isDeptDropdownOpen) {
                setIsDeptDropdownOpen(false);
                setDeptHighlightedIndex(-1);
                setDeptSearchTerm("");
            }
        }
    };

    const handleDeptSearchKeyDown = (e) => {
        if (e.key == "ArrowDown") {
            e.preventDefault();
            if (filteredDepartments.length > 0) {
                setDeptHighlightedIndex(0);
                setTimeout(() => {
                    if (deptItemRefs.current[0]) {
                        deptItemRefs.current[0].focus();
                    }
                }, 0);
            }
        } else if (e.key == "ArrowUp") {
            e.preventDefault();
        } else if (e.key == "Escape") {
            e.preventDefault();
            setIsDeptDropdownOpen(false);
            setDeptHighlightedIndex(-1);
            setDeptSearchTerm("");
            deptButtonRef.current?.focus();
        }
    };

    const handleDeptItemKeyDown = (e, idx, item) => {
        if (e.key == "ArrowDown") {
            e.preventDefault();
            const nextIndex = idx + 1;
            if (nextIndex < filteredDepartments.length) {
                setDeptHighlightedIndex(nextIndex);
                setTimeout(() => {
                    if (deptItemRefs.current[nextIndex]) {
                        deptItemRefs.current[nextIndex].focus();
                    }
                }, 0);
            } else {
                setDeptHighlightedIndex(-1);
                setTimeout(() => deptSearchRef.current?.focus(), 0);
            }
        } else if (e.key == "ArrowUp") {
            e.preventDefault();
            if (idx == 0) {
                setDeptHighlightedIndex(-1);
                setTimeout(() => deptSearchRef.current?.focus(), 0);
            } else {
                const prevIndex = idx - 1;
                setDeptHighlightedIndex(prevIndex);
                setTimeout(() => {
                    if (deptItemRefs.current[prevIndex]) {
                        deptItemRefs.current[prevIndex].focus();
                    }
                }, 0);
            }
        } else if (e.key == "Enter") {
            e.preventDefault();
            handleDeptFilterSelect(item);
        } else if (e.key == "Escape") {
            e.preventDefault();
            setIsDeptDropdownOpen(false);
            setDeptHighlightedIndex(-1);
            setDeptSearchTerm("");
            deptButtonRef.current?.focus();
        }
    };

    const handlePrintClick = () => {
        if (!reportData) return;
        setPrintReady(true);
        setTimeout(() => {
            setShowPrint(true);
        }, 100);
    };

    const renderReportTable = () => {
        if (!reportData || !reportData.ledgers || reportData.ledgers.length == 0) {
            return null;
        }

        const {
            ledgers,
            grand_total,
            department,
            payment_mode,
            filters,
            chalan_no,
            fund,
        } = reportData;
        const totalAmt =
            parseFloat(grand_total) ||
            ledgers.reduce((s, l) => s + (parseFloat(l.total_amount) || 0), 0);
        const deptName =
            department?.Dpt_Name ||
            department?.Dpt_Desc ||
            appliedFilters.dept_name ||
            "";
        const orgName = organization?.Org_Name || organization?.name || "";
        const fundName = fund || reportData.Fund || "Main";
        const totalTxn = ledgers.reduce(
            (s, l) => s + (parseInt(l.transaction_count) || 0),
            0,
        );
        const amtWords = numberToWords(totalAmt);

        const cell = {
            borderBottom: "1px solid #e5e7eb",
            padding: "5px 8px",
            fontSize: "9pt",
            verticalAlign: "top",
        };
        const hCell = {
            ...cell,
            fontWeight: "700",
            background: "#f3f4f6",
            textAlign: "center",
        };

        const rightPanel = (
            <div style={{ fontSize: "9pt", lineHeight: "1.9", padding: "10px" }}>
                <div
                    style={{
                        marginBottom: "6px",
                        paddingBottom: "6px",
                        textAlign: "right",
                    }}
                >
                    <div>ભરત નં. {chalan_no || reportData?.Bharat_No || ""}</div>
                    <div>
                        Cashbook Chalan No. {chalan_no || reportData?.Chalan_No || ""}
                    </div>
                    <div>
                        તારીખ:- {appliedFilters.from_date || filters?.from_date || getTodayDate()}
                    </div>
                    <div>ચલણ પ્રકાર: - {payment_mode || "રોકડ દ્વારા"}</div>
                    <div>બેંક:</div>
                </div>
                {orgName && <div>મુખ્ય એકાઉન્ટ - {orgName}</div>}
                <div>બેંક મેનેજર</div>
                <div>હિસાબી અધિકારી {deptName}</div>
                {deptName && <div>Department-{deptName} વિભાગમાંથી</div>}
                {fundName && <div>Fund : {fundName}</div>}
                <div style={{ marginTop: "6px" }}>
                    કુલ રોકડ દ્વારા ચૂકવણીની રકમ રૂ. ( {formatCurrency(totalAmt)} )
                </div>
                <div>પત્રી:- (રકમ રૂ {amtWords} )</div>
                <div>
                    {payment_mode || "રોકડ દ્વારા"} માત્ર ચૂકવણી. તે જમા અને સ્વીકારવું
                    જોઈએ.
                </div>
                <div style={{ marginTop: "10px" }}>File No-</div>
                <div>Party Name-</div>
                {(filters?.from_date || filters?.to_date) && (
                    <div>
                        Description : {filters.from_date}
                        {filters.to_date && filters.to_date != filters.from_date
                            ? ` to ${filters.to_date}`
                            : ""}
                    </div>
                )}
                <div style={{ marginTop: "16px", paddingTop: "8px" }}>
                    <div>સ્વૃતિ</div>
                    <div>ચકાસણી સંખ્યા: {totalTxn}</div>
                    <div>ઉપર મુજબ કુલ રકમ રૂ. ( {formatCurrency(totalAmt)} )</div>
                    <div>પત્રી:- (રકમ રૂ {amtWords} )</div>
                </div>
                <div style={{ marginTop: "12px" }}>ખાલી મળી.</div>
            </div>
        );

        return (
            <div
                style={{
                    border: "1px solid #999",
                    borderRadius: "4px",
                    overflow: "hidden",
                }}
            >
                {/* Full-width heading row */}
                <div
                    style={{
                        textAlign: "center",
                        padding: "6px 8px 4px",
                        borderBottom: "1px solid #999",
                        width: "100%",
                    }}
                >
                    <div style={{ fontSize: "10pt", fontWeight: "700" }}>
                        મુખ્ય કચેરી ખાતે તિજોરી/બેંકમાં જમા કરાવવા માટેનું ચલણ
                    </div>
                    <div style={{ fontSize: "9pt", fontWeight: "600", marginTop: "2px" }}>
                        ચૂકવણી વિગતો
                    </div>
                </div>
                <div style={{ display: "flex", width: "100%" }}>
                    <div
                        style={{
                            width: "50%",
                            borderRight: "1px solid #999",
                            flexShrink: 0,
                        }}
                    >
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ ...hCell, width: "8%" }}>ક્ર.</th>
                                    <th style={{ ...hCell, textAlign: "left" }}>
                                        ખાતાનું શીર્ષક
                                    </th>
                                    <th style={{ ...hCell, textAlign: "right", width: "28%" }}>
                                        કુલ
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {ledgers.map((ledger, idx) => {
                                    const isExpanded = expandedLedger == ledger.Lg_Id;
                                    const transactions = ledger.transactions || [];
                                    return (
                                        <React.Fragment key={ledger.Lg_Id}>
                                            <tr
                                                style={{
                                                    cursor:
                                                        transactions.length > 0 ? "pointer" : "default",
                                                    background: isExpanded ? "#ffffff" : "white",
                                                }}
                                                onClick={() =>
                                                    transactions.length > 0 &&
                                                    setExpandedLedger(isExpanded ? null : ledger.Lg_Id)
                                                }
                                            >
                                                <td style={{ ...cell, textAlign: "center", width: "8%" }}>
                                                    {transactions.length > 0 &&
                                                        (isExpanded ? (
                                                            <FiChevronDown
                                                                size={12}
                                                                style={{ display: "inline", marginRight: "2px" }}
                                                            />
                                                        ) : (
                                                            <FiChevronRight
                                                                size={12}
                                                                style={{ display: "inline", marginRight: "2px" }}
                                                            />
                                                        ))}
                                                    {idx + 1}
                                                </td>
                                                <td style={cell}>{ledger.Lg_Name}</td>
                                                <td
                                                    style={{
                                                        ...cell,
                                                        textAlign: "right",
                                                        fontFamily: "monospace",
                                                    }}
                                                >
                                                    {formatCurrency(ledger.total_amount)}
                                                </td>
                                            </tr>
                                            {isExpanded && transactions.length > 0 && (
                                                <React.Fragment>
                                                    <tr style={{ background: "#FFCDD2" }}>
                                                        <td
                                                            style={{
                                                                padding: "3px 8px",
                                                                border: "none",
                                                                background: "#FFCDD2",
                                                            }}
                                                        />
                                                        <td
                                                            colSpan="2"
                                                            style={{
                                                                padding: "4px 8px 4px 20px",
                                                                fontSize: "8pt",
                                                                border: "none",
                                                                background: "#FFCDD2",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: "grid",
                                                                    gridTemplateColumns: "2fr 1fr 1fr",
                                                                    fontWeight: 600,
                                                                    color: "#374151",
                                                                }}
                                                            >
                                                                <span>Challan Number</span>
                                                                <span>Date</span>
                                                                <span style={{ textAlign: "right" }}>
                                                                    Amount
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {transactions.map((txn) => (
                                                        <tr
                                                            key={txn.CV_Id}
                                                            style={{ background: "#ffffff" }}
                                                        >
                                                            <td
                                                                style={{
                                                                    padding: "3px 8px",
                                                                    border: "none",
                                                                    background: "#ffffff",
                                                                }}
                                                            />
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding: "3px 8px 3px 20px",
                                                                    fontSize: "8pt",
                                                                    border: "none",
                                                                    background: "#ffffff",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: "grid",
                                                                        gridTemplateColumns: "2fr 1fr 1fr",
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            color: "#C62828",
                                                                            fontWeight: 500,
                                                                        }}
                                                                    >
                                                                        {txn.CV_No || "-"}
                                                                    </span>
                                                                    <span style={{ color: "#6b7280" }}>
                                                                        {txn.Ch_Date || ""}
                                                                    </span>
                                                                    <span
                                                                        style={{
                                                                            fontFamily: "monospace",
                                                                            color: "#111827",
                                                                            textAlign: "right",
                                                                        }}
                                                                    >
                                                                        {formatCurrency(txn.Amount)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td
                                        colSpan="2"
                                        style={{
                                            ...cell,
                                            fontWeight: "700",
                                            background: "#f9fafb",
                                        }}
                                    >
                                        કુલ
                                    </td>
                                    <td
                                        style={{
                                            ...cell,
                                            fontWeight: "700",
                                            textAlign: "right",
                                            fontFamily: "monospace",
                                            background: "#f9fafb",
                                        }}
                                    >
                                        {formatCurrency(totalAmt)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div style={{ width: "50%", flexShrink: 0 }}>{rightPanel}</div>
                </div>
            </div>
        );
    };

    // Render filters
    const renderFilters = () => {
        return (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FiCalendar className="inline mr-1 h-3 w-3" />
                            From Date
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FiCalendar className="inline mr-1 h-3 w-3" />
                            To Date
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <SearchableDropdown
                            label="Department"
                            value={selectedDeptFilter}
                            required={false}
                            icon={FiFolder}
                            isOpen={isDeptDropdownOpen}
                            setIsOpen={setIsDeptDropdownOpen}
                            searchTerm={deptSearchTerm}
                            setSearchTerm={setDeptSearchTerm}
                            items={flattenedDepartments}
                            filteredItems={filteredDepartments}
                            highlightedIndex={deptHighlightedIndex}
                            onSelect={handleDeptFilterSelect}
                            onKeyDown={handleDepartmentKeyDown}
                            onSearchKeyDown={handleDeptSearchKeyDown}
                            onItemKeyDown={handleDeptItemKeyDown}
                            getDisplay={(dept) => dept.Dpt_Desc || dept.Dpt_Name || "No Name"}
                            getSelectedDisplay={getSelectedDepartmentDisplay}
                            loading={dropdownLoading}
                            placeholder="All Departments"
                            searchPlaceholder="Search departments..."
                            buttonRef={deptButtonRef}
                            dropdownRef={deptDropdownRef}
                            searchRef={deptSearchRef}
                            itemRefs={deptItemRefs}
                            listRef={deptListRef}
                            renderItem={renderDepartmentItem}
                            includeAllOption={true}
                            allOptionLabel="All Departments"
                        />
                    </div>

                    <div className="flex items-end gap-3">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading || dropdownLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            <FiSearch className="h-4 w-4 mr-2" />
                            Generate Report
                        </button>
                        {(hasGenerated ||
                            (appliedFilters.from_date &&
                                appliedFilters.from_date != getTodayDate()) ||
                            (appliedFilters.to_date &&
                                appliedFilters.to_date != getTodayDate()) ||
                            appliedFilters.dept_id) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
                                >
                                    <FiX className="h-4 w-4 mr-2" />
                                    Clear
                                </button>
                            )}
                    </div>
                </div>
                {message.text && message.type == "error" && (
                    <div className="mt-2 text-red-600 text-sm flex items-center">
                        <FiAlertCircle className="h-4 w-4 mr-1" />
                        {message.text}
                    </div>
                )}
            </div>
        );
    };

    // Render loading state
    const renderLoading = () => (
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading report data...</p>
        </div>
    );

    // Render no data state
    const renderNoData = () =>
        !hasGenerated ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Generate report to view results
                </h3>
                <p className="text-gray-600">
                    Select a department and click{" "}
                    <span className="font-medium">Generate Report</span> to fetch data.
                </p>
            </div>
        ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Records Found
                </h3>
                <p className="text-gray-600">
                    No records found for the selected filters.
                </p>
                <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                    <FiX className="h-4 w-4 mr-2" />
                    Clear Filters
                </button>
            </div>
        );

    const hasData =
        reportData && reportData.ledgers && reportData.ledgers.length > 0;

    // Export to Excel
    const handleExcelExport = () => {
        if (!reportData || !reportData.ledgers) return;

        const data = reportData.ledgers.map((ledger, idx) => ({
            "S.N.": idx + 1,
            "Ledger Name": ledger.Lg_Name,
            "Transaction Count": ledger.transaction_count,
            "Amount (₹)": ledger.total_amount,
        }));

        data.push({
            "S.N.": "",
            "Ledger Name": "GRAND TOTAL",
            "Transaction Count": reportData.ledgers.reduce(
                (sum, l) => sum + l.transaction_count,
                0,
            ),
            "Amount (₹)": reportData.grand_total,
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Department Cashbook");
        XLSX.writeFile(
            wb,
            `Department_Cashbook_${reportData.department?.Dpt_Name || "Report"}_${new Date().toISOString().split("T")[0]}.xlsx`,
        );
    };

    return (
        <div className="bg-gray-100">
            {/* Print Layout Component */}
            {showPrint && reportData && printReady && (
                <PrintLayout
                    title={`${pageTitle}`}
                    showControls={true}
                    onClose={() => {
                        setShowPrint(false);
                        setPrintReady(false);
                    }}
                    organizationData={organization}
                    orientation={printOrientation}
                    onOrientationChange={setPrintOrientation}
                >
                    <div>
                        <style>
                            {`
                    @media print {
                    body { 
                        margin: 0; 
                        padding: 0;
                    }
                    
                    .print-content {
                        display: block;
                    }
                    
                    table { 
                        border-collapse: collapse !important; 
                        width: 100% !important; 
                        margin-bottom: 20px;
                    }
                    
                    th, td { 
                        border: none !important; 
                        padding: 8px !important;
                        font-size: 10pt !important;
                    }

                    thead th {
        border-bottom: 1px solid #ccc !important;
    }
                    
                    th { 
                        font-weight: 600 !important; 
                        background: #f3f4f6 !important;
                    }
                    
                    tr {
                        page-break-inside: avoid;
                    }
                    
                    thead {
                        display: table-header-group;
                    }
                    
                    tfoot {
                        display: table-footer-group;
                    }
                    }
                `}
                        </style>

                        {/* Report Header */}
                        <div style={{ textAlign: "center", marginBottom: "16px" }}>
                            <h1
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    margin: "0 0 4px 0",
                                }}
                            >
                                {pageTitle}
                            </h1>
                            {reportData.department?.Dpt_Name && (
                                <p style={{ fontSize: "11px", margin: "2px 0" }}>
                                    {reportData.department.Dpt_Name} વિભાગ
                                </p>
                            )}
                            {reportData.filters?.from_date && (
                                <p style={{ fontSize: "11px", margin: "2px 0" }}>
                                    તારીખ: {reportData.filters.from_date}
                                    {reportData.filters.to_date &&
                                        reportData.filters.to_date != reportData.filters.from_date
                                        ? ` થી ${reportData.filters.to_date}`
                                        : ""}
                                </p>
                            )}
                        </div>

                        {/* Report Table - Same as UI */}
                        <div className="print-content">
                            <div
                                style={{
                                    border: "1px solid #999",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "6px 8px 4px",
                                        borderBottom: "1px solid #999",
                                        width: "100%",
                                    }}
                                >
                                    <div style={{ fontSize: "10pt", fontWeight: "700" }}>
                                        મુખ્ય કચેરી ખાતે તિજોરી/બેંકમાં જમા કરાવવા માટેનું ચલણ
                                    </div>
                                    <div style={{ fontSize: "9pt", fontWeight: "600", marginTop: "2px" }}>
                                        ચૂકવણી વિગતો
                                    </div>
                                </div>
                                <div style={{ display: "flex", width: "100%" }}>
                                    <div
                                        style={{
                                            width: "50%",
                                            borderRight: "1px solid #999",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <table
                                            style={{ width: "100%", borderCollapse: "collapse" }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th
                                                        style={{
                                                            border: "1px solid #555",
                                                            padding: "5px 8px",
                                                            fontSize: "9pt",
                                                            fontWeight: "700",
                                                            background: "#f3f4f6",
                                                            textAlign: "center",
                                                            width: "8%",
                                                        }}
                                                    >
                                                        ક્ર.
                                                    </th>
                                                    <th
                                                        style={{
                                                            border: "1px solid #555",
                                                            padding: "5px 8px",
                                                            fontSize: "9pt",
                                                            fontWeight: "700",
                                                            background: "#f3f4f6",
                                                            textAlign: "left",
                                                        }}
                                                    >
                                                        ખાતાનું શીર્ષક
                                                    </th>
                                                    <th
                                                        style={{
                                                            border: "1px solid #555",
                                                            padding: "5px 8px",
                                                            fontSize: "9pt",
                                                            fontWeight: "700",
                                                            background: "#f3f4f6",
                                                            textAlign: "right",
                                                            width: "28%",
                                                        }}
                                                    >
                                                        કુલ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.ledgers.map((ledger, idx) => {
                                                    const isExpanded = expandedLedger == ledger.Lg_Id;
                                                    const transactions = ledger.transactions || [];
                                                    return (
                                                        <React.Fragment key={ledger.Lg_Id}>
                                                            <tr
                                                                style={{
                                                                    background: isExpanded ? "#ffffff" : "white",
                                                                }}
                                                            >
                                                                <td
                                                                    style={{
                                                                        border: "1px solid #555",
                                                                        padding: "5px 8px",
                                                                        fontSize: "9pt",
                                                                        textAlign: "center",
                                                                    }}
                                                                >
                                                                    {transactions.length > 0 &&
                                                                        (isExpanded ? "▼ " : "▶ ")}
                                                                    {idx + 1}
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        border: "1px solid #555",
                                                                        padding: "5px 8px",
                                                                        fontSize: "9pt",
                                                                    }}
                                                                >
                                                                    {ledger.Lg_Name}
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        border: "1px solid #555",
                                                                        padding: "5px 8px",
                                                                        fontSize: "9pt",
                                                                        textAlign: "right",
                                                                        fontFamily: "monospace",
                                                                    }}
                                                                >
                                                                    {formatCurrency(ledger.total_amount)}
                                                                </td>
                                                            </tr>
                                                            {isExpanded && transactions.length > 0 && (
                                                                <>
                                                                    <tr style={{ background: "#FFCDD2" }}>
                                                                        <td
                                                                            style={{
                                                                                border: "1px solid #555",
                                                                                padding: "3px 5px",
                                                                                fontSize: "8pt",
                                                                                background: "#FFCDD2",
                                                                            }}
                                                                        ></td>
                                                                        <td
                                                                            colSpan="2"
                                                                            style={{
                                                                                border: "1px solid #555",
                                                                                padding: "4px 8px 4px 20px",
                                                                                fontSize: "8pt",
                                                                                background: "#FFCDD2",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    display: "grid",
                                                                                    gridTemplateColumns: "2fr 1fr 1fr",
                                                                                    fontWeight: 600,
                                                                                }}
                                                                            >
                                                                                <span>Challan Number</span>
                                                                                <span>Date</span>
                                                                                <span style={{ textAlign: "right" }}>
                                                                                    Amount
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    {transactions.map((txn) => (
                                                                        <tr
                                                                            key={txn.CV_Id}
                                                                            style={{ background: "#ffffff" }}
                                                                        >
                                                                            <td
                                                                                style={{
                                                                                    border: "1px solid #555",
                                                                                    padding: "3px 5px",
                                                                                    fontSize: "8pt",
                                                                                    background: "#ffffff",
                                                                                }}
                                                                            ></td>
                                                                            <td
                                                                                colSpan="2"
                                                                                style={{
                                                                                    border: "1px solid #555",
                                                                                    padding: "3px 8px 3px 20px",
                                                                                    fontSize: "8pt",
                                                                                    background: "#ffffff",
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        display: "grid",
                                                                                        gridTemplateColumns: "2fr 1fr 1fr",
                                                                                    }}
                                                                                >
                                                                                    <span style={{ fontWeight: 500 }}>
                                                                                        {txn.CV_No || "-"}
                                                                                    </span>
                                                                                    <span>{txn.Ch_Date || ""}</span>
                                                                                    <span
                                                                                        style={{
                                                                                            fontFamily: "monospace",
                                                                                            textAlign: "right",
                                                                                        }}
                                                                                    >
                                                                                        {formatCurrency(txn.Amount)}
                                                                                    </span>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td
                                                        colSpan="2"
                                                        style={{
                                                            border: "1px solid #555",
                                                            padding: "5px 8px",
                                                            fontSize: "9pt",
                                                            fontWeight: "700",
                                                            background: "#f9fafb",
                                                        }}
                                                    >
                                                        કુલ
                                                    </td>
                                                    <td
                                                        style={{
                                                            border: "1px solid #555",
                                                            padding: "5px 8px",
                                                            fontSize: "9pt",
                                                            fontWeight: "700",
                                                            textAlign: "right",
                                                            fontFamily: "monospace",
                                                            background: "#f9fafb",
                                                        }}
                                                    >
                                                        {formatCurrency(reportData.grand_total)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    <div style={{ width: "50%", flexShrink: 0 }}>
                                        <div
                                            style={{
                                                fontSize: "9pt",
                                                lineHeight: "1.9",
                                                padding: "10px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    marginBottom: "6px",
                                                    paddingBottom: "6px",
                                                    textAlign: "right",
                                                }}
                                            >
                                                <div>
                                                    ભરત નં.{" "}
                                                    {reportData.chalan_no || reportData.Bharat_No || ""}
                                                </div>
                                                <div>
                                                    Cashbook Chalan No.{" "}
                                                    {reportData.chalan_no || reportData.Chalan_No || ""}
                                                </div>
                                                <div>
                                                    તારીખ:-{" "}
                                                    {appliedFilters.from_date ||
                                                        reportData.filters?.from_date ||
                                                        getTodayDate()}
                                                </div>
                                                <div>
                                                    ચલણ પ્રકાર: -{" "}
                                                    {reportData.payment_mode || "રોકડ દ્વારા"}
                                                </div>
                                                <div>બેંક:</div>
                                            </div>
                                            {organization?.Org_Name && (
                                                <div>મુખ્ય એકાઉન્ટ - {organization.Org_Name}</div>
                                            )}
                                            <div>બેંક મેનેજર</div>
                                            <div>
                                                હિસાબી અધિકારી{" "}
                                                {reportData.department?.Dpt_Name ||
                                                    appliedFilters.dept_name ||
                                                    ""}
                                            </div>
                                            {reportData.department?.Dpt_Name && (
                                                <div>
                                                    Department-{reportData.department.Dpt_Name} વિભાગમાંથી
                                                </div>
                                            )}
                                            {(reportData.fund || reportData.Fund) && (
                                                <div>Fund : {reportData.fund || reportData.Fund}</div>
                                            )}
                                            <div style={{ marginTop: "6px" }}>
                                                કુલ રોકડ દ્વારા ચૂકવણીની રકમ રૂ. ({" "}
                                                {formatCurrency(reportData.grand_total)} )
                                            </div>
                                            <div>
                                                પત્રી:- (રકમ રૂ{" "}
                                                {numberToWords(parseFloat(reportData.grand_total))} )
                                            </div>
                                            <div>
                                                {reportData.payment_mode || "રોકડ દ્વારા"} માત્ર ચૂકવણી.
                                                તે જમા અને સ્વીકારવું જોઈએ.
                                            </div>
                                            <div style={{ marginTop: "10px" }}>File No-</div>
                                            <div>Party Name-</div>
                                            {reportData.filters?.from_date && (
                                                <div>
                                                    Description : {reportData.filters.from_date}
                                                    {reportData.filters.to_date &&
                                                        reportData.filters.to_date !=
                                                        reportData.filters.from_date
                                                        ? ` to ${reportData.filters.to_date}`
                                                        : ""}
                                                </div>
                                            )}
                                            <div style={{ marginTop: "16px", paddingTop: "8px" }}>
                                                <div>સ્વૃતિ</div>
                                                <div>
                                                    ચકાસણી સંખ્યા:{" "}
                                                    {reportData.ledgers?.reduce(
                                                        (s, l) => s + (parseInt(l.transaction_count) || 0),
                                                        0,
                                                    ) || 0}
                                                </div>
                                                <div>
                                                    ઉપર મુજબ કુલ રકમ રૂ. ({" "}
                                                    {formatCurrency(reportData.grand_total)} )
                                                </div>
                                            </div>
                                            <div style={{ marginTop: "12px" }}>ખાલી મળી.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PrintLayout>
            )}

            <div className="px-4 py-6 max-w-full">
                {/* Header with back button and actions */}
                <div className="flex justify-between items-center mb-6">
                    <Link to="/dashboard">
                        <button className="flex items-center text-grey-600 hover:text-grey-600 transition-colors font-medium">
                            <FiChevronLeft className="mr-1" /> Back to Dashboard
                        </button>
                    </Link>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleExcelExport}
                            className="px-4 py-2 bg-green-600 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors shadow-sm"
                            disabled={!hasData || loading}
                            title="Export to Excel"
                        >
                            <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
                        </button>
                        <button
                            onClick={handlePrintClick}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors shadow-sm"
                            disabled={!hasData || loading}
                            title="Print Report"
                        >
                            <FiPrinterIcon className="h-4 w-4 mr-2" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    {/* Header with dynamic title */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 text-center">
                            {pageTitle}
                        </h2>
                        <p className="text-center text-sm text-gray-500 mt-1">
                            Department-wise Cash Transaction Details
                        </p>
                    </div>

                    {/* Filters */}
                    {renderFilters()}

                    {/* Period and Department Display */}
                    {hasGenerated && reportData && (
                        <div className="mb-4 p-2 bg-blue-50 rounded-lg text-center text-sm text-blue-700 border border-blue-200">
                            <strong>Department:</strong> {reportData.department?.Dpt_Name} |
                            <strong> Payment Mode:</strong> {reportData.payment_mode}
                            {reportData.filters?.from_date && reportData.filters?.to_date && (
                                <>
                                    {" "}
                                    | <strong>Period:</strong> {reportData.filters.from_date} to{" "}
                                    {reportData.filters.to_date}
                                </>
                            )}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && renderLoading()}

                    {/* No Data State */}
                    {!loading && !hasData && renderNoData()}

                    {/* Data Display */}
                    {!loading && hasData && renderReportTable()}
                </div>
            </div>
        </div>
    );
};

export default DepartmentwiseCashbookReport;
