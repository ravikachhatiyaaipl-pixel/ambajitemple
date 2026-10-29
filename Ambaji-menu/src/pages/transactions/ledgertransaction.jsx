"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiAlertCircle,
  FiUpload,
  FiX,
  FiEdit,
  FiTrash,
  FiDownload,
  FiCalendar,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

const LedgerTransactionPage = ({ ledgerGroupData }) => {
  const { partyId } = useParams();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("review");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [excelPreview, setExcelPreview] = useState(null);
  const [matchedFields, setMatchedFields] = useState({});
  const [unmatchedFields, setUnmatchedFields] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("review");
  const [ledgers, setLedgers] = useState([]);
  const [showNewLedgerModal, setShowNewLedgerModal] = useState(false);
  const [newLedger, setNewLedger] = useState({
    lg_name: "",
    lg_code: "",
    gr_id: "",
  });
  const [transactionIdForLedger, setTransactionIdForLedger] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [tempLedgerSelections, setTempLedgerSelections] = useState({});
  const [ledgerSearch, setLedgerSearch] = useState("");
  const itemsPerPage = 10;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const [organisationData, setOrganisationData] = useState(null);
  const [error, setError] = useState(null);

  const normalizeHeader = (header) => header.trim().toLowerCase();

  const columnKeywords = {
    Vou_Dt: ["date", "transaction date", "vou date"],
    rmk1: ["description", "remark", "transaction remark"],
    Dr_Amt: ["withdrawal", "debit", "dr amount"],
    Cr_Amt: ["deposit", "credit", "cr amount"],
  };

  const findMatchingField = (header) => {
    const normalizedHeader = normalizeHeader(header);
    for (const [field, keywords] of Object.entries(columnKeywords)) {
      if (
        keywords.some((keyword) =>
          normalizedHeader.includes(keyword.toLowerCase()),
        )
      ) {
        return field;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchOrganisationData();
    const storedLedger = localStorage.getItem("selectedLedger");
    if (storedLedger) {
      try {
        const parsedLedger = JSON.parse(storedLedger);
        if (String(parsedLedger.Lg_Id) == String(partyId)) {
          setSelectedLedger(parsedLedger);
        } else {
          fetchLedgerData();
        }
      } catch (e) {
        console.error("Error parsing stored ledger:", e);
        fetchLedgerData();
      }
    } else {
      fetchLedgerData();
    }
  }, [partyId]);

  const fetchOrganisationData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-org-master`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      if (response.data.success && response.data.data.length > 0) {
        setOrganisationData(response.data.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching organisation data:", err);
      setError("Failed to load organisation data");
      setLoading(false);
    }
  };

  const fetchLedgerData = async () => {
    if (!partyId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ledgers/all/data`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      if (response.data.success && response.data.data) {
        // NO ORGANISATION FILTER - same as working old code
        const ledger = response.data.data.find(
          (p) => String(p.Lg_Id) == String(partyId),
        );

        if (ledger) {
          setSelectedLedger(ledger);
          localStorage.setItem("selectedLedger", JSON.stringify(ledger));
        } else {
          setMessage({ text: "Ledger not found", type: "error" });
        }
      }
    } catch (err) {
      console.error("Error fetching ledger data:", err);
      setMessage({ text: "Error loading ledger data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgers = async () => {
    if (!organisationData?.Org_Id) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ledgers/all/data`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      if (response.data.success && response.data.data) {
        const fetchedLedgers = response.data.data
          .filter((ledger) => ledger.Lg_Id != selectedLedger?.Lg_Id)
          .map((ledger) => ({
            lg_id: ledger.Lg_Id,
            lg_name: ledger.Lg_Name,
            lg_code: ledger.Lg_Code,
            gr_id: ledger.Gr_Id,
            lg_gr: ledger.ledger_group?.Gr_Nm || "",
          }));
        setLedgers(fetchedLedgers);
      }
    } catch (err) {
      console.error("Error fetching ledgers:", err);
      setMessage({ text: "Error fetching ledgers.", type: "error" });
    }
  };

  const fetchTransactions = async () => {
    if (!selectedLedger?.Lg_Id || !organisationData?.Org_Id) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/finan-trns/all`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.success && response.data.data) {
        const filteredTransactions = response.data.data.filter(
          (t) =>
            String(t.Lg_Id) == String(selectedLedger.Lg_Id) &&
            String(t.Org_Id) == String(organisationData.Org_Id) &&
            t.V_Mode == "G",
        );

        if (filteredTransactions.length == 0) {
          setTransactions([]);
          await fetchLedgers();
          setLoading(false);
          return;
        }

        const mappedTransactions = filteredTransactions.map((t) => {
          // Get opposite ledger name from ref_ledger
          const ledgerName =
            t.ref_ledger?.Lg_Name || t.ledger?.Lg_Name || "Unknown Ledger";

          return {
            id: t.Ft_Id,
            date: t.Vou_Dt,
            description: t.rmk1,
            ledger: ledgerName,
            ledger_id: t.Lg_Id,
            category: t.Vou_Ty,
            tax: "",
            debit: t.Dr_Amt,
            credit: t.Cr_Amt,
            ref_id: t.Vou_Rf,
            lg_id: t.Lg_Id,
            lg_code: t.ledger?.Lg_Code || "NULL",
            gr_code: t.ledger?.ledger_group?.Gr_Cd || "N/A",
            oppositeLedgerName: ledgerName,
            has_ref_ledger: !!t.ref_ledger,
            v_mode: t.V_Mode,
          };
        });

        setTransactions(mappedTransactions);
        await fetchLedgers();
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
      setMessage({ text: "Error fetching transactions.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLedger && organisationData) {
      fetchTransactions();
    }
  }, [selectedLedger, organisationData]);

  useEffect(() => {
    setTempLedgerSelections((prev) => {
      const updatedSelections = transactions.reduce((acc, transaction) => {
        acc[transaction.id] =
          prev[transaction.id] && prev[transaction.id] != "N/A"
            ? prev[transaction.id]
            : transaction.ledger || "N/A";
        return acc;
      }, {});
      return updatedSelections;
    });
  }, [transactions]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        setSheetNames(workbook.SheetNames);
        setSelectedSheet(workbook.SheetNames[0]);
        parseSheet(workbook, workbook.SheetNames[0], data);
      } catch (err) {
        console.error("Error parsing Excel file:", err);
        setMessage({
          text: "Error processing the Excel file. Please ensure it has the correct format.",
          type: "error",
        });
      }
    };
    reader.onerror = () =>
      setMessage({ text: "Error reading the file.", type: "error" });
    reader.readAsArrayBuffer(file);
  };

  const parseSheet = (workbook, sheetName, rawData) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let firstDataRowIndex = 0;
    for (let i = 0; i < jsonData.length; i++) {
      if (
        jsonData[i].some(
          (cell) => cell != undefined && cell != null && cell != "",
        )
      ) {
        firstDataRowIndex = i;
        break;
      }
    }

    const headers = jsonData[firstDataRowIndex].map((header) => String(header));
    const rows = jsonData
      .slice(firstDataRowIndex + 1)
      .filter((row) =>
        row.some((cell) => cell != undefined && cell != null && cell != ""),
      );

    let lastValidDate = null;
    const processedRows = rows.map((row) => {
      const newRow = [...row];
      const dateIndex = headers.findIndex(
        (h) => findMatchingField(h) == "Vou_Dt",
      );
      if (dateIndex != -1) {
        const dateValue = newRow[dateIndex];
        if (!dateValue && lastValidDate) {
          newRow[dateIndex] = lastValidDate;
        } else if (dateValue) {
          try {
            const parsedDate = new Date(dateValue);
            if (!isNaN(parsedDate.getTime())) {
              newRow[dateIndex] = parsedDate.toISOString().split("T")[0];
              lastValidDate = newRow[dateIndex];
            } else {
              newRow[dateIndex] = lastValidDate || null;
            }
          } catch (e) {
            newRow[dateIndex] = lastValidDate || null;
          }
        }
      }
      return newRow;
    });

    const dateIndex = headers.findIndex(
      (h) => findMatchingField(h) == "Vou_Dt",
    );
    const sortedRows = processedRows.sort((a, b) => {
      const dateA = a[dateIndex] ? new Date(a[dateIndex]) : new Date(0);
      const dateB = b[dateIndex] ? new Date(b[dateIndex]) : new Date(0);
      return dateA - dateB;
    });

    const headerToField = {};
    const unmatched = [];

    headers.forEach((header, index) => {
      const field = findMatchingField(header);
      if (field && field != "balance") {
        headerToField[index] = field;
      } else {
        unmatched.push(header);
      }
    });

    const previewRows = sortedRows.slice(0, 5).map((row) => {
      const previewRow = {};
      headers.forEach((header, index) => {
        previewRow[header] = row[index] || "";
      });
      return previewRow;
    });

    setExcelPreview({
      headers,
      rows: previewRows,
      totalRows: sortedRows.length,
      allRows: sortedRows,
      rawData,
      workbook,
    });

    setMatchedFields(headerToField);
    setUnmatchedFields(unmatched);
    setShowPreviewModal(true);
  };

  const handleSheetChange = (e) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);
    if (excelPreview?.workbook) {
      parseSheet(excelPreview.workbook, sheetName, excelPreview.rawData);
    }
  };

  const uploadDataToApi = () => {
    if (!excelPreview || !selectedLedger || !organisationData) return;

    const apiTransactions = excelPreview.allRows
      .map((row) => {
        const transaction = {
          Org_Id: organisationData.Org_Id,
          Lg_Id: selectedLedger.Lg_Id,
          Dr_Amt: "",
          Cr_Amt: "",
        };
        let hasData = false;

        Object.entries(matchedFields).forEach(([index, field]) => {
          let value = row[index];
          if (value != undefined && value != null && value != "") {
            if (field == "Vou_Dt") {
              try {
                const parsedDate = new Date(value);
                if (!isNaN(parsedDate.getTime())) {
                  value = parsedDate.toISOString();
                } else {
                  value = null;
                }
              } catch (e) {
                value = null;
              }
            } else if (field == "Dr_Amt" || field == "Cr_Amt") {
              value = Number.parseFloat(value) || 0;
              if (value == 0) value = "";
            }
            transaction[field] = value;
            hasData = true;
          }
        });

        if (
          transaction["rmk1"] == "Opening Balance" ||
          (transaction["Dr_Amt"] == "" && transaction["Cr_Amt"] == "")
        ) {
          return null;
        }

        return hasData ? transaction : null;
      })
      .filter((t) => t != null);

    if (apiTransactions.length > 0) {
      setLoading(true);
      const uploadPromises = apiTransactions.map((transaction, index) =>
        axios
          .post(`${import.meta.env.VITE_API_URL}/finan-trns`, transaction, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
            }
          })
          .then(() => ({ success: true, index }))
          .catch((error) => ({ success: false, index, error })),
      );

      Promise.all(uploadPromises)
        .then((results) => {
          const failedUploads = results.filter((result) => !result.success);
          if (failedUploads.length > 0) {
            setMessage({
              text: `Uploaded ${results.length - failedUploads.length} of ${
                results.length
              } transactions successfully. ${failedUploads.length} failed.`,
              type: "error",
            });
          } else {
            setMessage({
              text: "All transactions uploaded successfully!",
              type: "success",
            });
          }
          fetchTransactions();
          setShowPreviewModal(false);
        })
        .catch((error) => {
          setMessage({ text: "Error uploading transactions.", type: "error" });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setMessage({
        text: "No valid data found in the Excel file.",
        type: "error",
      });
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction({
      id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      ledger: transaction.ledger,
      ledger_id: transaction.ledger_id,
      category: transaction.category,
      tax: transaction.tax,
      debit: transaction.debit,
      credit: transaction.credit,
      lg_id: transaction.lg_id,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingTransaction) return;

    setLoading(true);
    try {
      const selectedLedgerItem = ledgers.find(
        (p) => p.lg_name == editingTransaction.ledger,
      );
      const updatedTransaction = {
        Vou_Dt: editingTransaction.date,
        rmk1: editingTransaction.description,
        Vou_Ty: editingTransaction.category,
        Dr_Amt: Number.parseFloat(editingTransaction.debit) || "",
        Cr_Amt: Number.parseFloat(editingTransaction.credit) || "",
        Org_Id: organisationData.Org_Id,
        Lg_Id: selectedLedgerItem
          ? selectedLedgerItem.lg_id
          : editingTransaction.lg_id || selectedLedger.Lg_Id,
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/finan-trns/${editingTransaction.id}`,
        updatedTransaction,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      setMessage({
        text: "Transaction updated successfully!",
        type: "success",
      });
      setShowEditModal(false);
      fetchTransactions();
    } catch (error) {
      setMessage({ text: "Error updating transaction.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/finan-trns/${transactionToDelete.id}`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      setMessage({
        text: "Transaction deleted successfully!",
        type: "success",
      });
      fetchTransactions();
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      setMessage({ text: "Error deleting transaction.", type: "error" });
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLedgerChange = async (transactionId, ledgerName) => {
    if (ledgerName == "add_new") {
      setTransactionIdForLedger(transactionId);
      setLedgerSearch("");
      setShowNewLedgerModal(true);
      return;
    }

    setTempLedgerSelections((prev) => ({
      ...prev,
      [transactionId]: ledgerName,
    }));

    setLoading(true);
    try {
      const selectedLedgerItem = ledgers.find((p) => p.lg_name == ledgerName);
      const transaction = transactions.find((t) => t.id == transactionId);
      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      const updatedTransaction = {
        Ft_Id: transactionId,
        Org_Id: organisationData.Org_Id,
        Lg_Id: selectedLedgerItem ? selectedLedgerItem.lg_id : null,
        Vou_Dt: transaction.date,
        rmk1: transaction.description,
        Vou_Ty: transaction.category,
        Dr_Amt: Number.parseFloat(transaction.debit) || "",
        Cr_Amt: Number.parseFloat(transaction.credit) || "",
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/finan-trns/${transactionId}`,
        updatedTransaction,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      setTransactions((prev) =>
        prev.map((t) =>
          t.id == transactionId
            ? {
                ...t,
                ledger:
                  ledgerName == "N/A" ? "N/A" : selectedLedgerItem.lg_name,
                ledger_id: selectedLedgerItem ? selectedLedgerItem.lg_id : null,
                lg_id: selectedLedgerItem ? selectedLedgerItem.lg_id : null,
                lg_code: selectedLedgerItem
                  ? selectedLedgerItem.lg_code
                  : "NULL",
              }
            : t,
        ),
      );

      setMessage({ text: "Ledger updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating ledger:", error);
      setMessage({ text: "Error updating ledger.", type: "error" });
      setTempLedgerSelections((prev) => {
        const transaction = transactions.find((t) => t.id == transactionId);
        return {
          ...prev,
          [transactionId]: transaction ? transaction.ledger || "N/A" : "N/A",
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewLedgerSubmit = async (e) => {
    e.preventDefault();
    if (!newLedger.lg_name.trim()) {
      setMessage({ text: "Ledger name cannot be empty.", type: "error" });
      return;
    }
    if (newLedger.lg_code == selectedLedger?.Lg_Code) {
      setMessage({
        text: "Ledger code cannot match the selected ledger's code.",
        type: "error",
      });
      return;
    }
    if (!newLedger.gr_id) {
      setMessage({ text: "Please select a ledger group.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Find the selected ledger from ledgerGroupData by Gr_Id
      const selectedLedgerGroup = (ledgerGroupData || []).find(
        (ledger) => String(ledger.Gr_Id) == String(newLedger.gr_id),
      );

      const ledgerPayload = {
        Lg_Code: newLedger.lg_code,
        Lg_Name: newLedger.lg_name.trim(),
        Gr_Id: newLedger.gr_id,
        Org_Id: organisationData.Org_Id,
        Lg_Gr: selectedLedgerGroup ? selectedLedgerGroup.Gr_Nm : "",
        Lg_Status: true,
      };

      const newLedgerResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/ledgers`,
        ledgerPayload,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      const newLedgerData = {
        lg_id: newLedgerResponse.data.Lg_Id,
        lg_name: newLedger.lg_name.trim(),
        lg_code: newLedger.lg_code,
        gr_id: newLedger.gr_id,
      };

      setLedgers([...ledgers, newLedgerData]);
      setNewLedger({ lg_name: "", lg_code: "", gr_id: "" });
      setLedgerSearch("");
      setShowNewLedgerModal(false);

      if (transactionIdForLedger) {
        const transaction = transactions.find(
          (t) => t.id == transactionIdForLedger,
        );
        const updatedTransaction = {
          Ft_Id: transactionIdForLedger,
          Org_Id: organisationData.Org_Id,
          Lg_Id: newLedgerData.lg_id,
          Vou_Dt: transaction.date,
          rmk1: transaction.description,
          Vou_Ty: transaction.category,
          Dr_Amt: Number.parseFloat(transaction.debit) || "",
          Cr_Amt: Number.parseFloat(transaction.credit) || "",
        };

        await axios.put(
          `${import.meta.env.VITE_API_URL}/finan-trns/${transactionIdForLedger}`,
          updatedTransaction,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
        );
        setTempLedgerSelections((prev) => ({
          ...prev,
          [transactionIdForLedger]: newLedgerData.lg_name,
        }));
        setMessage({
          text: "Ledger added and transaction updated successfully!",
          type: "success",
        });
        setTransactionIdForLedger(null);
        fetchTransactions();
      } else if (editingTransaction) {
        setEditingTransaction({
          ...editingTransaction,
          ledger: newLedgerData.lg_name,
          ledger_id: newLedgerData.lg_id,
        });
      }
    } catch (error) {
      console.error("Error adding new ledger:", error);
      setMessage({ text: "Error adding new ledger.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditLedgerChange = (ledgerName) => {
    if (ledgerName == "add_new") {
      setLedgerSearch("");
      setShowNewLedgerModal(true);
    } else {
      const selectedLedgerItem = ledgers.find((p) => p.lg_name == ledgerName);
      setEditingTransaction({
        ...editingTransaction,
        ledger: ledgerName,
        ledger_id: selectedLedgerItem ? selectedLedgerItem.lg_id : null,
      });
    }
  };

  const toggleLedgerEdit = (transactionId) => {
    setTempLedgerSelections((prev) => ({
      ...prev,
      [transactionId]: "N/A",
    }));
  };

  const handleLedgerCheckboxChange = (gr_id) => {
    setNewLedger({
      ...newLedger,
      gr_id: newLedger.gr_id == gr_id ? "" : gr_id,
    });
  };

  const handleDateFilterChange = (type, value) => {
    if (type == "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }

    if (value) {
      setIsDateFilterActive(true);
    } else if ((type == "start" && !endDate) || (type == "end" && !startDate)) {
      setIsDateFilterActive(false);
    }
  };

  const resetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setIsDateFilterActive(false);
  };

  const parseDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const formatDateToDDMMYYYY = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "N/A";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getFilteredTransactions = () => {
    const searchLower = searchQuery.toLowerCase();
    const isLedgerAccount =
      selectedLedger?.ledger_group?.Gr_Cd &&
      (selectedLedger.ledger_group.Gr_Cd.startsWith("03") ||
        selectedLedger.ledger_group.Gr_Cd.startsWith("04"));

    return transactions.filter((transaction) => {
      const matchesSearch =
        (transaction.description &&
          transaction.description.toLowerCase().includes(searchLower)) ||
        (transaction.debit &&
          transaction.debit.toString().includes(searchLower)) ||
        (transaction.credit &&
          transaction.credit.toString().includes(searchLower));

      if (isLedgerAccount) {
        return matchesSearch;
      } else {
        if (filterType == "review") {
          return (
            matchesSearch &&
            transaction.ref_id == "BKRBC01" &&
            transaction.lg_code == "NULL"
          );
        } else if (filterType == "categorized") {
          return (
            matchesSearch &&
            transaction.lg_id != null &&
            transaction.lg_code != "BKRBC01"
          );
        }
        return matchesSearch;
      }
    });
  };

  const getFilteredTransactionsForExport = () => {
    const searchLower = searchQuery.toLowerCase();
    const isLedgerAccount =
      selectedLedger?.ledger_group?.Gr_Cd &&
      (selectedLedger.ledger_group.Gr_Cd.startsWith("03") ||
        selectedLedger.ledger_group.Gr_Cd.startsWith("04"));

    return transactions.filter((transaction) => {
      const matchesSearch =
        (transaction.description &&
          transaction.description.toLowerCase().includes(searchLower)) ||
        (transaction.debit &&
          transaction.debit.toString().includes(searchLower)) ||
        (transaction.credit &&
          transaction.credit.toString().includes(searchLower));

      const transactionDate = parseDateDDMMYYYY(transaction.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const matchesDateFilter =
        !isDateFilterActive ||
        (transactionDate &&
          (!start || transactionDate >= start) &&
          (!end || transactionDate <= end));

      if (isLedgerAccount) {
        return matchesSearch && matchesDateFilter;
      } else {
        if (filterType == "review") {
          return (
            matchesSearch &&
            matchesDateFilter &&
            transaction.ref_id == "BKRBC01" &&
            transaction.lg_code == "NULL"
          );
        } else if (filterType == "categorized") {
          return (
            matchesSearch &&
            matchesDateFilter &&
            transaction.lg_id != null &&
            transaction.lg_code != "BKRBC01"
          );
        }
        return matchesSearch && matchesDateFilter;
      }
    });
  };

  const handleDownloadExcel = () => {
    try {
      setLoading(true);

      const dataToExport = getFilteredTransactionsForExport();

      const wb = XLSX.utils.book_new();

      let runningTotal = 0;
      const dataForExport = dataToExport.map((transaction) => {
        const debit = Number(transaction.debit) || 0;
        const credit = Number(transaction.credit) || 0;
        runningTotal = runningTotal + credit - debit;

        let formattedDate = transaction.date;
        try {
          formattedDate = new Date(transaction.date).toLocaleDateString(
            "en-GB",
          );
        } catch (e) {}

        return {
          date: formattedDate,
          description: transaction.description || "",
          ledger: transaction.ledger || "N/A",
          category: transaction.category || "",
          debit: debit ? Number(debit).toFixed(2) : "",
          credit: credit ? Number(credit).toFixed(2) : "",
          balance: runningTotal.toFixed(2),
        };
      });

      const ws = XLSX.utils.json_to_sheet(dataForExport);
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `transactions_${selectedLedger?.Lg_Code}.xlsx`);

      setMessage({
        text: "Excel file downloaded successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      setMessage({ text: "Error downloading Excel file.", type: "error" });
    } finally {
      setLoading(false);
      setShowDownloadOptions(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      setLoading(true);

      const dataToExport = getFilteredTransactionsForExport();

      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");

      const orgName = organisationData ? organisationData.Org_Name : "N/A";
      doc.setFontSize(14);
      doc.text(orgName, 14, 15);

      const orgCode = organisationData ? organisationData.Org_Code : "N/A";
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(orgCode, 14, 21);

      const ledgerName = selectedLedger ? selectedLedger.Lg_Name : "N/A";
      doc.setFontSize(10);
      doc.text(`${ledgerName}`, 14, 28);

      doc.setFontSize(10);
      doc.setTextColor(100);
      let dateRangeText = "All Dates";
      if (isDateFilterActive && startDate && endDate) {
        try {
          const start = new Date(startDate).toLocaleDateString("en-GB");
          const end = new Date(endDate).toLocaleDateString("en-GB");
          dateRangeText = `${start} to ${end}`;
        } catch (e) {
          dateRangeText = "All Dates";
        }
      } else if (dataToExport.length > 0) {
        const dates = dataToExport
          .map((t) => (t.date ? new Date(t.date) : null))
          .filter((d) => d != null && !isNaN(d.getTime()));
        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          if (!isNaN(minDate.getTime()) && !isNaN(maxDate.getTime())) {
            dateRangeText = `${formatDateToDDMMYYYY(
              minDate,
            )} to ${formatDateToDDMMYYYY(maxDate)}`;
          }
        }
      }
      const dateRangeWidth = doc.getTextWidth(dateRangeText);
      doc.text(
        dateRangeText,
        doc.internal.pageSize.width - 14 - dateRangeWidth,
        15,
      );

      let runningTotal = 0;
      const tableData = dataToExport.map((transaction) => {
        const debit = Number(transaction.debit) || 0;
        const credit = Number(transaction.credit) || 0;
        runningTotal = runningTotal + credit - debit;

        const formattedDate = formatDateToDDMMYYYY(transaction.date);

        const ledgerName = transaction.ledger || "Unknown Ledger";
        const descriptionWithLedger = `${ledgerName}\n${
          transaction.description || "N/A"
        }`;
        return [
          formattedDate,
          descriptionWithLedger,
          debit ? debit.toFixed(2) : "",
          credit ? credit.toFixed(2) : "",
          runningTotal.toFixed(2),
        ];
      });

      const totals = dataToExport.reduce(
        (acc, transaction) => {
          const debit = Number(transaction.debit) || 0;
          const credit = Number(transaction.credit) || 0;
          return {
            totalDebit: acc.totalDebit + debit,
            totalCredit: acc.totalCredit + credit,
          };
        },
        { totalDebit: 0, totalCredit: 0 },
      );

      tableData.push([
        "",
        "TOTAL",
        totals.totalDebit.toFixed(2),
        totals.totalCredit.toFixed(2),
        (totals.totalCredit - totals.totalDebit).toFixed(2),
      ]);

      const headers = [["Date", "Description", "Debit", "Credit", "Balance"]];

      const columnStyles = {
        0: { cellWidth: 25 },
        1: { cellWidth: 80 },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
      };

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 42,
        styles: {
          fontSize: 9,
          font: "helvetica",
          fontStyle: "normal",
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: columnStyles,
        didParseCell: (data) => {
          if (data.row.index == tableData.length - 1) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [220, 220, 220];
            data.cell.styles.textColor = [0, 0, 0];
          } else if (data.row.index % 2 == 1) {
            data.cell.styles.fillColor = [245, 245, 245];
          }
          if (data.column.index == 1) {
            data.cell.styles.valign = "top";
            data.cell.styles.cellPadding = {
              top: 2,
              bottom: 2,
              left: 2,
              right: 2,
            };
          }
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10,
        );
        const generatedText = `Generated: ${formatDateToDDMMYYYY(new Date())}`;
        doc.text(generatedText, 14, doc.internal.pageSize.height - 10);
      }

      const dateInfo = isDateFilterActive
        ? `_${startDate.replace(/-/g, "")}_${endDate.replace(/-/g, "")}`
        : `_${new Date().toISOString().split("T")[0].replace(/-/g, "")}`;
      const filename = `${ledgerName.replace(/\s+/g, "_")}${dateInfo}.pdf`;

      doc.save(filename);

      setMessage({
        text: "PDF file downloaded successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setMessage({
        text: "Error creating PDF file: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
      setShowDownloadOptions(false);
    }
  };

  const filteredTransactions = getFilteredTransactions();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const navigate = useNavigate();

  const tabs = ["Review", "Categorized"];

  // Filter ledger groups based on search - using Gr_Nm for matching
  const filteredLedgerGroups = (
    Array.isArray(ledgerGroupData) ? ledgerGroupData : []
  ).filter(
    (ledger) =>
      ledger.Gr_Nm &&
      ledger.Gr_Nm.toLowerCase().includes(ledgerSearch.toLowerCase()),
  );

  const isLedgerAccount =
    selectedLedger?.ledger_group?.Gr_Cd &&
    (selectedLedger.ledger_group.Gr_Cd.startsWith("03") ||
      selectedLedger.ledger_group.Gr_Cd.startsWith("04"));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="px-2 py-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" />
              Back to Dashboard
            </button>
          </Link>
          <div className="w-24"></div>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type == "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            } flex justify-between items-center animate-fadeInSlide`}
          >
            <span className="flex items-center">
              {message.type == "success" ? (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
              {message.text}
            </span>
            <button
              onClick={() => setMessage({ text: "", type: "" })}
              className="text-current hover:opacity-75"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Ledger Details
            </h2>
            {loading && (
              <div className="animate-pulse text-blue-500">Updating...</div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="text-lg font-semibold">
                {selectedLedger ? selectedLedger.Lg_Name : "Loading..."}
              </h3>
              {selectedLedger?.Lg_Eng_Name && (
                <p className="text-[9px] md:text-[12px] text-gray-600">
                  {selectedLedger.Lg_Eng_Name}
                </p>
              )}
              <p className="font-light text-xs text-gray-600 mt-1">
                {selectedLedger
                  ? selectedLedger.Lg_Code || "N/A"
                  : "Loading..."}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="text-sm text-gray-500">Created On</h3>
              <p className="font-semibold">
                {selectedLedger
                  ? new Date(selectedLedger.created_at).toLocaleDateString() ||
                    "N/A"
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {!isLedgerAccount && (
          <div className="bg-white rounded-t-lg shadow-sm">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab == tab.toLowerCase()
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  } transition-colors`}
                  onClick={() => {
                    setActiveTab(tab.toLowerCase());
                    setFilterType(tab.toLowerCase());
                    setCurrentPage(1);
                  }}
                >
                  {tab} (
                  {tab.toLowerCase() == "review"
                    ? transactions.filter(
                        (t) => t.ref_id == "BKRBC01" && t.lg_code == "NULL",
                      ).length
                    : transactions.filter(
                        (t) => t.lg_id != null && t.lg_code != "BKRBC01",
                      ).length}
                  )
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-b-lg shadow-sm mb-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Transactions: {filteredTransactions.length}
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center border rounded-md px-3 py-1.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                  <FiCalendar className="mr-1 h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      handleDateFilterChange("start", e.target.value)
                    }
                    className="border-0 p-0 focus:outline-none focus:ring-0"
                    placeholder="From date"
                  />
                </div>
                <div className="flex items-center border rounded-md px-3 py-1.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                  <FiCalendar className="mr-1 h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      handleDateFilterChange("end", e.target.value)
                    }
                    className="border-0 p-0 focus:outline-none focus:ring-0"
                    placeholder="To date"
                  />
                </div>
                {isDateFilterActive && (
                  <button
                    onClick={resetDateFilter}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <FiX className="h-3 w-3 mr-1" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all flex-grow min-w-[220px]">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-full px-2 py-1"
                  placeholder="Search transactions..."
                  disabled={loading}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowDownloadOptions((prev) => !prev)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-md px-3 py-1.5 transition-colors flex items-center"
                  disabled={loading || filteredTransactions.length == 0}
                >
                  <span className="text-sm font-medium mr-2">Download</span>
                  <FiDownload className="h-8 w-6" />
                </button>

                {showDownloadOptions && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-30">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4 mr-2 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      PDF
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4 mr-2 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Excel
                    </button>
                  </div>
                )}
              </div>

              {!isLedgerAccount && (
                <label className="flex items-center cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 transition-colors">
                  <span className="text-sm font-medium mr-2">Upload</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="upload-input"
                    disabled={loading}
                    ref={fileInputRef}
                  />
                  <FiUpload className="h-4 w-4" />
                </label>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-3 border border-gray-200 w-8">
                    <input
                      type="checkbox"
                      className="rounded"
                      disabled={loading}
                    />
                  </th>
                  <th className="p-3 border border-gray-200">
                    <div className="flex items-center">
                      <span className="font-semibold">Date</span>
                      <FiChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </th>
                  <th className="p-3 border border-gray-200">Description</th>
                  <th className="p-3 border border-gray-200">Ledger</th>
                  <th className="p-3 border border-gray-200">
                    Categorize or Match
                  </th>
                  <th className="p-3 border border-gray-200">Tax</th>
                  <th className="p-3 border border-gray-200">Debit</th>
                  <th className="p-3 border border-gray-200">Credit</th>
                  <th className="p-3 border border-gray-200">Total</th>
                  {/* <th className="p-3 border border-gray-200">Action</th> */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">
                        Loading transactions...
                      </p>
                    </td>
                  </tr>
                ) : filteredTransactions.length == 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          No transactions available.
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your filters or upload new transactions
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((transaction, index) => {
                    const previousTotal =
                      index == 0
                        ? 0
                        : currentItems.slice(0, index).reduce((sum, t) => {
                            const debit = Number(t.debit) || 0;
                            const credit = Number(t.credit) || 0;
                            return sum + credit - debit;
                          }, 0);
                    const debit = Number(transaction.debit) || 0;
                    const credit = Number(transaction.credit) || 0;
                    const currentTotal =
                      Math.abs(previousTotal) +
                      Math.abs(credit) -
                      Math.abs(debit);

                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-3 border border-gray-200">
                          <input
                            type="checkbox"
                            className="rounded"
                            disabled={loading}
                          />
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {transaction.date
                            ? formatDateToDDMMYYYY(transaction.date)
                            : "N/A"}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {transaction.description || ""}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {isLedgerAccount ? (
                            <span className="font-medium">
                              {transaction.oppositeLedgerName || "N/A"}
                            </span>
                          ) : tempLedgerSelections[transaction.id] &&
                            tempLedgerSelections[transaction.id] != "N/A" ? (
                            <div className="flex items-center">
                              <span className="font-medium">
                                {tempLedgerSelections[transaction.id]}
                              </span>
                              {/* <button
                                onClick={() => toggleLedgerEdit(transaction.id)}
                                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                                disabled={loading}
                                title="Edit Ledger"
                              >
                                <FiEdit className="h-4 w-4" />
                              </button> */}
                            </div>
                          ) : (
                            <select
                              value={
                                tempLedgerSelections[transaction.id] || "N/A"
                              }
                              onChange={(e) =>
                                handleLedgerChange(
                                  transaction.id,
                                  e.target.value,
                                )
                              }
                              className="border border-gray-300 rounded-md p-1 text-sm w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              disabled={loading}
                            >
                              <option value="N/A">Select Ledger</option>
                              {ledgers.map((ledger) => (
                                <option
                                  key={ledger.lg_id}
                                  value={ledger.lg_name}
                                >
                                  {ledger.lg_name}
                                </option>
                              ))}
                              <option value="add_new">Add New Ledger</option>
                            </select>
                          )}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {transaction.category == "Accounts Payable" && (
                            <div className="flex items-center">
                              <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded mr-1">
                                new
                              </span>
                              <span>{transaction.category || ""}</span>
                            </div>
                          )}
                          {transaction.category != "Accounts Payable" &&
                            (transaction.category || "")}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {transaction.tax || ""}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right font-medium">
                          {transaction.debit ? `₹${transaction.debit}` : ""}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right font-medium text-green-600">
                          {transaction.credit ? `₹${transaction.credit}` : ""}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right font-medium">
                          ₹{currentTotal.toFixed(2)}
                        </td>
                        {/* <td className="p-3 border border-gray-200">
                          <div className="flex space-x-2 justify-center">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors"
                              disabled={loading}
                              title="Edit"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                              disabled={loading}
                              title="Delete"
                            >
                              <FiTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td> */}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
                {filteredTransactions.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage == 1 || loading}
                  className={`p-2 rounded-md ${
                    currentPage == 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  } transition-colors`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage == page
                            ? "bg-blue-600 text-white"
                            : "text-blue-600 hover:bg-blue-100"
                        } transition-colors`}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage == totalPages || loading}
                  className={`p-2 rounded-md ${
                    currentPage == totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  } transition-colors`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreviewModal && excelPreview && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Excel Data Preview</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Sheet:
                </label>
                <select
                  value={selectedSheet}
                  onChange={handleSheetChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {sheetNames.map((sheet) => (
                    <option key={sheet} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Showing {excelPreview.rows.length} of {excelPreview.totalRows}{" "}
                rows
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                      {excelPreview.headers.map((header, index) => (
                        <th key={index} className="p-3 border border-gray-200">
                          {header}{" "}
                          {matchedFields[index] && (
                            <span className="text-green-500 text-xs">
                              ({matchedFields[index]})
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelPreview.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {excelPreview.headers.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="p-3 border border-gray-200 text-sm"
                          >
                            {row[header] || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {unmatchedFields.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-md">
                  <p className="font-semibold">Unmatched Columns:</p>
                  <ul className="list-disc pl-5">
                    {unmatchedFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadDataToApi}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingTransaction && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Transaction</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={
                      editingTransaction.date
                        ? editingTransaction.date.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingTransaction({
                        ...editingTransaction,
                        date: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.description || ""}
                    onChange={(e) =>
                      setEditingTransaction({
                        ...editingTransaction,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ledger
                  </label>
                  <select
                    value={editingTransaction.ledger || "N/A"}
                    onChange={(e) => handleEditLedgerChange(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="N/A">Select Ledger</option>
                    {ledgers.map((ledger) => (
                      <option key={ledger.lg_id} value={ledger.lg_name}>
                        {ledger.lg_name}
                      </option>
                    ))}
                    <option value="add_new">Add New Ledger</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.category || ""}
                    onChange={(e) =>
                      setEditingTransaction({
                        ...editingTransaction,
                        category: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tax
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.tax || ""}
                    onChange={(e) =>
                      setEditingTransaction({
                        ...editingTransaction,
                        tax: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Debit
                  </label>
                  <input
                    type="number"
                    value={editingTransaction.debit || ""}
                    onChange={(e) =>
                      setEditingTransaction({
                        ...editingTransaction,
                        debit: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Credit
                  </label>
                  <input
                    type="number"
                    value={editingTransaction.credit || ""}
                    onChange={(e) =>
                      setEditingTransaction({
                        ...editingTransaction,
                        credit: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && transactionToDelete && (
          <div className="fixed inset-0 bg-[#0000005f] bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 animate-scaleIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Confirm Delete
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-6">
                <div className="bg-red-50 p-3 rounded-lg mb-4 text-red-600 flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <p className="text-sm">
                    Are you sure you want to delete this transaction? This
                    action cannot be undone.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Transaction Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Date</p>
                      <p className="font-medium">
                        {transactionToDelete.date
                          ? new Date(
                              transactionToDelete.date,
                            ).toLocaleDateString("en-GB")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Description</p>
                      <p className="font-medium">
                        {transactionToDelete.description || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Debit</p>
                      <p className="font-medium">
                        {transactionToDelete.debit
                          ? `₹${transactionToDelete.debit}`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Credit</p>
                      <p className="font-medium">
                        {transactionToDelete.credit
                          ? `₹${transactionToDelete.credit}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    "Delete Transaction"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Ledger Modal */}
        {showNewLedgerModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Ledger</h2>
                <button
                  onClick={() => setShowNewLedgerModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleNewLedgerSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ledger Name
                    </label>
                    <input
                      type="text"
                      value={newLedger.lg_name}
                      onChange={(e) =>
                        setNewLedger({ ...newLedger, lg_name: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ledger Code
                    </label>
                    <input
                      type="text"
                      value={newLedger.lg_code}
                      onChange={(e) =>
                        setNewLedger({ ...newLedger, lg_code: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Ledger Group
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search ledger groups..."
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-2"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                      {filteredLedgerGroups.length == 0 ? (
                        <div className="p-3 text-gray-500 text-sm">
                          No matching ledger groups found
                        </div>
                      ) : (
                        filteredLedgerGroups.map((ledger) => (
                          <div
                            key={ledger.Gr_Id}
                            className="flex items-center p-2 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              id={`ledger-${ledger.Gr_Id}`}
                              checked={
                                newLedger.gr_id == ledger.Gr_Id.toString()
                              }
                              onChange={() =>
                                handleLedgerCheckboxChange(
                                  ledger.Gr_Id.toString(),
                                )
                              }
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`ledger-${ledger.Gr_Id}`}
                              className="ml-2 block text-sm text-gray-700"
                            >
                              {ledger.Gr_Nm} ({ledger.Gr_Cd})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewLedgerModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Ledger"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerTransactionPage;
