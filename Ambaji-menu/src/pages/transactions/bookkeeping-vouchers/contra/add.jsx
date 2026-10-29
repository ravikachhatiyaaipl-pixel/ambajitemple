import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiChevronLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const ConfirmToast = ({ message, onConfirm, onCancel, closeToast }) => {
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      onConfirm();
      closeToast();
    } else if (e.key == "Escape") {
      e.preventDefault();
      onCancel();
      closeToast();
    } else if (e.key == "Tab") {
      e.preventDefault();
      if (document.activeElement == confirmButtonRef.current) {
        cancelButtonRef.current?.focus();
      } else {
        confirmButtonRef.current?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col items-center" onKeyDown={handleKeyDown}>
      <p className="mb-2 text-gray-800 font-serif">{message}</p>
      <div className="flex space-x-4">
        <button
          ref={confirmButtonRef}
          onClick={() => {
            onConfirm();
            closeToast();
          }}
          className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          tabIndex={0}
        >
          Yes
        </button>
        <button
          ref={cancelButtonRef}
          onClick={() => {
            onCancel();
            closeToast();
          }}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          tabIndex={0}
        >
          No
        </button>
      </div>
    </div>
  );
};

const showConfirmToast = (message, onConfirm, onCancel) => {
  toast(
    ({ closeToast }) => (
      <ConfirmToast
        message={message}
        onConfirm={onConfirm}
        onCancel={onCancel}
        closeToast={closeToast}
      />
    ),
    {
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
    },
  );
};

const CreateContraVoucher = () => {
  const [allLedgers, setAllLedgers] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [filteredBankAccounts, setFilteredBankAccounts] = useState([]);

  const [entries, setEntries] = useState([
    {
      id: 1,
      account: null,
      debitAmount: "",
      creditAmount: "",
      subLedgerSearch: "",
      filteredSubLedgers: [],
      subLedgerEntries: [],
      showSubLedgerDropdown: false,
      completed: false,
    },
  ]);

  const [narration, setNarration] = useState("");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [voucherId, setVoucherId] = useState(0);
  const [voucherDate, setVoucherDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionData, setTransactionData] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [subLedgers, setSubLedgers] = useState([]);
  const [canSave, setCanSave] = useState(false);

  const [bankSearch, setBankSearch] = useState("");

  const [organisationData, setOrganisationData] = useState([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState(() =>
    JSON.parse(localStorage.getItem("selectedOrganisation")),
  );
  const navigate = useNavigate();

  const dateInputRef = useRef(null);
  const ledgerInputRefs = useRef([]);
  const debitAmountRefs = useRef([]);
  const creditAmountRefs = useRef([]);
  const narrationRef = useRef(null);
  const dropdownItemRefs = useRef([]);
  const subLedgerSearchRefs = useRef([]);
  const subLedgerAmountRefs = useRef([]);
  const bankSearchRef = useRef(null);
  const saveButtonRef = useRef(null);

  const calculateTotals = () => {
    const totalDebit = entries.reduce((sum, entry) => {
      const debitAmount = parseFloat(entry.debitAmount) || 0;
      return sum + debitAmount;
    }, 0);

    const totalCredit = entries.reduce((sum, entry) => {
      const creditAmount = parseFloat(entry.creditAmount) || 0;
      return sum + creditAmount;
    }, 0);

    return { totalDebit, totalCredit };
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toFixed(2);
  };

  // Validation for Contra Voucher
  useEffect(() => {
    const { totalDebit, totalCredit } = calculateTotals();

    // Find the last valid row
    const lastValidIndex = entries.reduce((lastIndex, entry, index) => {
      if (
        entry.account ||
        entry.debitAmount ||
        entry.creditAmount ||
        entry.subLedgerEntries.length > 0
      ) {
        return index;
      }
      return lastIndex;
    }, -1);

    // All entries must be valid
    const allEntriesValid = entries.every((entry, index) => {
      // Skip empty rows after last valid entry
      if (index > lastValidIndex) return true;

      if (!entry.account) return false;

      const hasDebit = entry.debitAmount && parseFloat(entry.debitAmount) > 0;
      const hasCredit =
        entry.creditAmount && parseFloat(entry.creditAmount) > 0;

      if (hasDebit && hasCredit) return false;
      if (!hasDebit && !hasCredit) return false;

      // For Contra, all accounts must be bank accounts (checked separately)

      // For Contra, S-mode accounts MUST have sub-ledger totals matching parent amount
      if (entry.account.Lg_Sub == "yes") {
        const parentAmount = hasDebit
          ? parseFloat(entry.debitAmount)
          : parseFloat(entry.creditAmount);
        const subLedgerTotal = entry.subLedgerEntries.reduce(
          (sum, subEntry) => sum + (parseFloat(subEntry.amount) || 0),
          0,
        );

        return Math.abs(subLedgerTotal - parentAmount) < 0.01;
      }

      return true;
    });

    const totalsMatch = Math.abs(totalDebit - totalCredit) < 0.01;

    // Count valid entries (with amount > 0)
    const validEntriesCount = entries.filter(
      (entry) =>
        entry.account &&
        (entry.debitAmount || entry.creditAmount) &&
        parseFloat(entry.debitAmount || entry.creditAmount || 0) > 0,
    ).length;

    // Check if all accounts are bank accounts
    const allBankAccounts = entries.every(
      (entry) => !entry.account || entry.account.isBankAccount == true,
    );

    // Contra requires at least 2 valid entries and all bank accounts
    setCanSave(
      validEntriesCount >= 2 &&
        allEntriesValid &&
        totalsMatch &&
        allBankAccounts &&
        !isLoading,
    );
  }, [entries, isLoading]);

  // Filter bank accounts
  useEffect(() => {
    if (bankSearch.trim() == "") {
      setFilteredBankAccounts(bankAccounts);
    } else {
      const searchTerm = bankSearch.toLowerCase();
      const filtered = bankAccounts.filter(
        (account) =>
          account.pr_name.toLowerCase().includes(searchTerm) ||
          account.pr_code.toLowerCase().includes(searchTerm) ||
          (account.Lg_Eng_Name &&
            account.Lg_Eng_Name.toLowerCase().includes(searchTerm)),
      );
      setFilteredBankAccounts(filtered);
    }
  }, [bankSearch, bankAccounts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownIndex != null) {
        const dropdown = document.querySelector(".dropdown-container");
        if (dropdown && !dropdown.contains(event.target)) {
          setOpenDropdownIndex(null);
          setHighlightedIndex(-1);
          setBankSearch("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownIndex]);

  // Generate next voucher ID
  const generateNextVoucherId = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/finan-trns/all`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      const transactions = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const conTransactions = transactions.filter((t) => t.Vou_Ty == "CON");

      if (conTransactions.length == 0) {
        return 1;
      }

      const voucherIds = conTransactions.map((t) => {
        const id = parseInt(t.Vou_Id);
        return isNaN(id) ? 0 : id;
      });

      const uniqueVoucherIds = [...new Set(voucherIds)];
      const maxVoucherId = Math.max(...uniqueVoucherIds);
      const nextVoucherId = maxVoucherId + 1;

      return nextVoucherId;
    } catch (err) {
      console.error("Error fetching transactions:", err);
      return Math.floor(Math.random() * 9000) + 1000;
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          organisationResponse,
          ledgersResponse,
          transactionsResponse,
          subLedgersResponse,
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/lst-org-master`,  {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }),
          axios.get(`${import.meta.env.VITE_API_URL}/ledgers/all/data`,  {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }),
          axios.get(`${import.meta.env.VITE_API_URL}/finan-trns/all`,  {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }),
          axios.get(`${import.meta.env.VITE_API_URL}/sub-ledgers/all`,  {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }),
        ]);

        if (organisationResponse.data.success) {
          setOrganisationData(organisationResponse.data.data);
          if (
            !selectedOrganisation &&
            organisationResponse.data.data.length > 0
          ) {
            const org = organisationResponse.data.data[0];
            const newOrg = {
              id: org.Org_Id,
              name: org.Org_Name,
              code: org.Org_Code,
            };
            setSelectedOrganisation(newOrg);
            localStorage.setItem(
              "selectedOrganisation",
              JSON.stringify(newOrg),
            );
          }
        }

        const currentOrgId =
          selectedOrganisation?.id ||
          (organisationResponse.data.success &&
            organisationResponse.data.data[0]?.Org_Id);

        const allLedgersData = ledgersResponse.data.success
          ? ledgersResponse.data.data
          : [];

        // ✅ CORRECTED: Map ledgers with proper field names
        const mappedLedgers = allLedgersData.map((ledger) => ({
          Pr_Id: ledger.Lg_Id,
          pr_name: ledger.Lg_Name,
          pr_code: ledger.Lg_Code || `L${ledger.Lg_Id}`,
          Co_Id: currentOrgId,
          Br_Id: null,
          pr_gr: ledger.Gr_Id,
          Lg_Id: ledger.Lg_Id,
          Org_Id: currentOrgId,
          ledger_group: ledger.ledger_group,
          Lg_Sub: ledger.Lg_Sub || "no",
          Lg_Gr: ledger.Lg_Gr,
          Lg_Eng_Name: ledger.Lg_Eng_Name,
          Lg_Cr_Lim: ledger.Lg_Cr_Lim || "0.00",
          // ✅ CORRECT: Get bank flag from ledger_group.Gr_Buk
          isBankAccount: ledger.ledger_group?.Gr_Buk == "Y",
        }));

        setAllLedgers(mappedLedgers);

        // For Contra, only include bank accounts
        const bankAccounts = mappedLedgers.filter(
          (ledger) => ledger.isBankAccount == true,
        );

        setBankAccounts(bankAccounts);
        setFilteredBankAccounts(bankAccounts);

        setTransactionData(
          Array.isArray(transactionsResponse.data?.data)
            ? transactionsResponse.data.data
            : [],
        );

        if (subLedgersResponse.data.success) {
          setSubLedgers(subLedgersResponse.data.data);
        }

        setVoucherId(0);
        setVoucherNumber("");

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load accounts. Please try again.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOrganisation) {
      localStorage.setItem(
        "selectedOrganisation",
        JSON.stringify(selectedOrganisation),
      );
    }
  }, [selectedOrganisation]);

  useEffect(() => {
    if (!isLoading) {
      dateInputRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    if (openDropdownIndex != null && bankSearchRef.current) {
      bankSearchRef.current.focus();
    }
  }, [openDropdownIndex]);

  const calculateBalance = (prId) => {
    if (!prId) return "0.00 Dr";

    const transactions = transactionData.filter(
      (t) => t.Lg_Id && String(t.Lg_Id) == String(prId),
    );

    const totalCr = transactions.reduce((sum, t) => {
      const crAmt = t.Cr_Amt ? Number.parseFloat(t.Cr_Amt) : 0;
      return sum + (isNaN(crAmt) ? 0 : crAmt);
    }, 0);

    const totalDr = transactions.reduce((sum, t) => {
      const drAmt = t.Dr_Amt ? Number.parseFloat(t.Dr_Amt) : 0;
      return sum + (isNaN(drAmt) ? 0 : drAmt);
    }, 0);

    const balance = totalDr - totalCr;
    return `${Math.abs(balance).toFixed(2)} ${balance >= 0 ? "Dr" : "Cr"}`;
  };

  const getSubLedgersForAccount = (ledgerId) => {
    if (!ledgerId) return [];

    return subLedgers.filter((sl) => {
      const lgIds = Array.isArray(sl.Lg_Id) ? sl.Lg_Id : [sl.Lg_Id];
      return lgIds.some((id) => parseInt(id) == parseInt(ledgerId));
    });
  };

  const openSubLedgerDropdown = (index) => {
    const newEntries = [...entries];
    const entry = newEntries[index];

    if (
      entry.account &&
      (entry.account.Lg_Sub == "yes" || entry.account.Lg_Sub == true)
    ) {
      const parentAmount =
        parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0;

      if (parentAmount > 0) {
        newEntries[index].showSubLedgerDropdown = true;
        newEntries[index].subLedgerSearch = "";

        const accountSubLedgers = getSubLedgersForAccount(entry.account.Pr_Id);
        newEntries[index].filteredSubLedgers = accountSubLedgers;

        setEntries(newEntries);
        setTimeout(() => subLedgerSearchRefs.current[index]?.focus(), 0);
      }
    }
  };

  const handleAccountSelect = (index, account) => {
    const newEntries = [...entries];
    newEntries[index].account = account;

    newEntries[index].debitAmount = "";
    newEntries[index].creditAmount = "";
    newEntries[index].subLedgerSearch = "";
    newEntries[index].filteredSubLedgers = [];
    newEntries[index].subLedgerEntries = [];
    newEntries[index].showSubLedgerDropdown = false;
    newEntries[index].completed = false;

    if (account.Lg_Sub == "yes") {
      const accountSubLedgers = getSubLedgersForAccount(account.Pr_Id);
      newEntries[index].filteredSubLedgers = accountSubLedgers;
    }

    setEntries(newEntries);
    setOpenDropdownIndex(null);
    setHighlightedIndex(-1);
    setBankSearch("");

    setTimeout(() => {
      debitAmountRefs.current[index]?.focus();
    }, 0);
  };

  const handleDebitAmountChange = (index, value) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      const newEntries = [...entries];
      newEntries[index].debitAmount = value;

      if (value) {
        newEntries[index].creditAmount = "";
      }

      newEntries[index].subLedgerEntries = [];
      newEntries[index].subLedgerSearch = "";
      newEntries[index].completed = false;

      setEntries(newEntries);
    }
  };

  const handleCreditAmountChange = (index, value) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      const newEntries = [...entries];
      newEntries[index].creditAmount = value;

      if (value) {
        newEntries[index].debitAmount = "";
      }

      newEntries[index].subLedgerEntries = [];
      newEntries[index].subLedgerSearch = "";
      newEntries[index].completed = false;

      setEntries(newEntries);
    }
  };

  const handleSubLedgerSearchChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].subLedgerSearch = value;

    if (newEntries[index].account) {
      const accountSubLedgers = getSubLedgersForAccount(
        newEntries[index].account.Pr_Id,
      );

      if (value.trim() == "") {
        newEntries[index].filteredSubLedgers = accountSubLedgers;
      } else {
        const searchTerm = value.toLowerCase();
        const filtered = accountSubLedgers.filter(
          (subLedger) =>
            subLedger.SL_Name.toLowerCase().includes(searchTerm) ||
            (subLedger.SL_Code &&
              subLedger.SL_Code.toLowerCase().includes(searchTerm)),
        );
        newEntries[index].filteredSubLedgers = filtered;
      }
    }

    setEntries(newEntries);
  };

  const handleSubLedgerSelect = (index, subLedger) => {
    const newEntries = [...entries];
    const entry = newEntries[index];

    const parentAmount =
      parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0;
    const existingSubLedgerTotal = entry.subLedgerEntries.reduce(
      (sum, subEntry) => sum + (parseFloat(subEntry.amount) || 0),
      0,
    );

    if (parentAmount > 0 && existingSubLedgerTotal >= parentAmount) {
      toast.error("Cannot add more sub-ledgers. Amount limit reached.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    const existingEntryIndex = entry.subLedgerEntries.findIndex(
      (subEntry) => subEntry.subLedgerId == subLedger.SL_Id,
    );

    if (existingEntryIndex == -1) {
      const newSubEntry = {
        subLedgerId: subLedger.SL_Id,
        subLedgerName: subLedger.SL_Name,
        subLedgerCode: subLedger.SL_Code,
        amount: "",
        isDebit: entry.debitAmount && parseFloat(entry.debitAmount) > 0,
      };

      entry.subLedgerEntries.push(newSubEntry);
    }

    entry.subLedgerSearch = "";
    entry.showSubLedgerDropdown = false;

    setEntries(newEntries);

    setTimeout(() => {
      const subEntryIndex = entry.subLedgerEntries.length - 1;
      setTimeout(
        () => subLedgerAmountRefs.current[`${index}-${subEntryIndex}`]?.focus(),
        0,
      );
    }, 0);
  };

  const handleSubLedgerAmountChange = (mainIndex, subIndex, value) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      const newEntries = [...entries];
      const entry = newEntries[mainIndex];
      const subEntry = entry.subLedgerEntries[subIndex];

      const newAmount = parseFloat(value) || 0;

      if (newAmount == 0) {
        entry.subLedgerEntries.splice(subIndex, 1);
        setEntries(newEntries);
        return;
      }

      const currentTotal = entry.subLedgerEntries.reduce((sum, se, idx) => {
        if (idx == subIndex) {
          return sum + newAmount;
        }
        return sum + (parseFloat(se.amount) || 0);
      }, 0);

      const parentAmount =
        parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0;

      if (parentAmount > 0 && currentTotal > parentAmount) {
        toast.error(
          `Sub-ledger total (${formatAmount(currentTotal)}) exceeds parent amount (${formatAmount(parentAmount)})`,
          {
            position: "bottom-right",
            autoClose: 3000,
          },
        );
        return;
      }

      subEntry.amount = value;
      setEntries(newEntries);
    }
  };

  const addEntry = () => {
    // Check if last entry is empty
    const lastEntry = entries[entries.length - 1];

    if (
      lastEntry &&
      !lastEntry.account &&
      !lastEntry.debitAmount &&
      !lastEntry.creditAmount &&
      lastEntry.subLedgerEntries.length == 0
    ) {
      return;
    }

    const newId =
      entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1;

    const newEntry = {
      id: newId,
      account: null,
      debitAmount: "",
      creditAmount: "",
      subLedgerSearch: "",
      filteredSubLedgers: [],
      subLedgerEntries: [],
      showSubLedgerDropdown: false,
      completed: false,
    };

    setEntries([...entries, newEntry]);
    return entries.length;
  };

  const handleKeyPress = (e, field, mainIndex = -1, subIndex = -1) => {
    if (e.key == "Enter") {
      e.preventDefault();

      if (field == "date") {
        ledgerInputRefs.current[0]?.focus();
        setOpenDropdownIndex(0);
      } else if (field == "ledger") {
        if (entries[mainIndex]?.account) {
          debitAmountRefs.current[mainIndex]?.focus();
        } else {
          if (mainIndex == entries.length - 1) {
            narrationRef.current?.focus();
            setOpenDropdownIndex(null);
          } else {
            setOpenDropdownIndex(null);
          }
        }
      } else if (field == "debitAmount" || field == "creditAmount") {
        const entry = entries[mainIndex];
        const currentValue =
          field == "debitAmount" ? entry.debitAmount : entry.creditAmount;
        const currentAmount = parseFloat(currentValue) || 0;

        if (!currentValue || currentAmount == 0) {
          if (field == "debitAmount") {
            creditAmountRefs.current[mainIndex]?.focus();
          } else {
            debitAmountRefs.current[mainIndex]?.focus();
          }
          return;
        }

        if (currentAmount > 0) {
          const debitAmount = parseFloat(entry.debitAmount) || 0;
          const creditAmount = parseFloat(entry.creditAmount) || 0;

          if (debitAmount > 0 && creditAmount > 0) {
            toast.error("Please enter either debit OR credit, not both.", {
              position: "bottom-right",
              autoClose: 3000,
            });
            return;
          }

          const hasSubLedger =
            entry.account?.Lg_Sub == "yes" || entry.account?.Lg_Sub == true;

          if (hasSubLedger) {
            if (entry.subLedgerEntries.length > 0) {
              const firstNameElement = document.getElementById(
                `subledger-name-${mainIndex}-0`,
              );
              if (firstNameElement) {
                firstNameElement.focus();
              }
            } else {
              openSubLedgerDropdown(mainIndex);
            }
          } else {
            markEntryAsCompleted(mainIndex);
          }
        }
      } else if (field == "narration") {
        if (canSave) {
          saveButtonRef.current?.focus();
        } else {
          narrationRef.current?.focus();
        }
      } else if (field == "saveButton") {
        handleSubmit(e);
      } else if (field == "subLedgerName") {
        setTimeout(
          () =>
            subLedgerAmountRefs.current[`${mainIndex}-${subIndex}`]?.focus(),
          0,
        );
      } else if (field == "subLedgerSearch") {
        const entry = entries[mainIndex];

        if (
          entry.subLedgerSearch.trim() != "" &&
          entry.filteredSubLedgers.length > 0
        ) {
          handleSubLedgerSelect(mainIndex, entry.filteredSubLedgers[0]);
        }
      } else if (field == "subLedgerAmount") {
        const entry = entries[mainIndex];

        if (subIndex >= entry.subLedgerEntries.length) return;

        const parentAmount =
          parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0;
        const currentSubTotal = entry.subLedgerEntries.reduce(
          (sum, subEntry) => sum + (parseFloat(subEntry.amount) || 0),
          0,
        );

        if (subIndex == entry.subLedgerEntries.length - 1) {
          if (Math.abs(currentSubTotal - parentAmount) < 0.01) {
            markEntryAsCompleted(mainIndex);
          } else {
            openSubLedgerDropdown(mainIndex);
          }
        } else {
          const nextNameElement = document.getElementById(
            `subledger-name-${mainIndex}-${subIndex + 1}`,
          );
          if (nextNameElement) {
            nextNameElement.focus();
          }
        }
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (field == "date") {
        showConfirmToast(
          "Are you sure you want to quit?",
          () => window.history.back(),
          () => dateInputRef.current?.focus(),
        );
      } else if (field == "ledger") {
        if (mainIndex == 0) {
          dateInputRef.current?.focus();
          setOpenDropdownIndex(null);
        } else {
          ledgerInputRefs.current[mainIndex - 1]?.focus();
          setOpenDropdownIndex(mainIndex - 1);
        }
      } else if (field == "debitAmount" || field == "creditAmount") {
        ledgerInputRefs.current[mainIndex]?.focus();
        setOpenDropdownIndex(mainIndex);
      } else if (field == "narration") {
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          const lastIndex = entries.length - 1;

          if (lastEntry.subLedgerEntries.length > 0) {
            const lastSubIndex = lastEntry.subLedgerEntries.length - 1;
            const lastSubNameElement = document.getElementById(
              `subledger-name-${lastIndex}-${lastSubIndex}`,
            );
            if (lastSubNameElement) lastSubNameElement.focus();
          } else if (lastEntry.debitAmount || lastEntry.creditAmount) {
            if (lastEntry.debitAmount) {
              debitAmountRefs.current[lastIndex]?.focus();
            } else {
              creditAmountRefs.current[lastIndex]?.focus();
            }
          } else {
            ledgerInputRefs.current[lastIndex]?.focus();
            setOpenDropdownIndex(lastIndex);
          }
        }
      } else if (field == "subLedgerSearch") {
        const newEntries = [...entries];
        newEntries[mainIndex].showSubLedgerDropdown = false;
        setEntries(newEntries);

        if (
          entries[mainIndex].debitAmount &&
          parseFloat(entries[mainIndex].debitAmount) > 0
        ) {
          debitAmountRefs.current[mainIndex]?.focus();
        } else if (
          entries[mainIndex].creditAmount &&
          parseFloat(entries[mainIndex].creditAmount) > 0
        ) {
          creditAmountRefs.current[mainIndex]?.focus();
        }
      } else if (field == "subLedgerAmount") {
        if (subIndex > 0) {
          setTimeout(
            () =>
              subLedgerAmountRefs.current[
                `${mainIndex}-${subIndex - 1}`
              ]?.focus(),
            0,
          );
        } else {
          const entry = entries[mainIndex];
          const parentAmount =
            parseFloat(entry.debitAmount) ||
            parseFloat(entry.creditAmount) ||
            0;
          const currentSubTotal = entry.subLedgerEntries.reduce(
            (sum, subEntry) => sum + (parseFloat(subEntry.amount) || 0),
            0,
          );

          if (parentAmount > 0 && currentSubTotal < parentAmount) {
            openSubLedgerDropdown(mainIndex);
          } else {
            if (entry.debitAmount && parseFloat(entry.debitAmount) > 0) {
              debitAmountRefs.current[mainIndex]?.focus();
            } else if (
              entry.creditAmount &&
              parseFloat(entry.creditAmount) > 0
            ) {
              creditAmountRefs.current[mainIndex]?.focus();
            }
          }
        }
      }
    }
  };

  const markEntryAsCompleted = (index) => {
    const newEntries = [...entries];
    newEntries[index].completed = true;
    newEntries[index].showSubLedgerDropdown = false;
    setEntries(newEntries);

    if (index == entries.length - 1) {
      setTimeout(() => {
        const newIndex = addEntry();
        setTimeout(() => {
          if (ledgerInputRefs.current[newIndex]) {
            ledgerInputRefs.current[newIndex]?.focus();
            setOpenDropdownIndex(newIndex);
          }
        }, 100);
      }, 50);
    } else {
      setTimeout(() => {
        ledgerInputRefs.current[index + 1]?.focus();
        setOpenDropdownIndex(index + 1);
      }, 50);
    }
  };

  const handleDropdownKeyDown = (e, index) => {
    const accounts = filteredBankAccounts;

    if (e.key == "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = Math.min(prev + 1, accounts.length - 1);
        dropdownItemRefs.current[next]?.focus();
        return next;
      });
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = Math.max(prev - 1, 0);
        dropdownItemRefs.current[next]?.focus();
        return next;
      });
    } else if (e.key == "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const account = accounts[highlightedIndex];
      handleAccountSelect(index, account);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setOpenDropdownIndex(null);
      setHighlightedIndex(-1);
      setBankSearch("");
      ledgerInputRefs.current[index]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for invalid entries (both debit and credit)
    const hasInvalidEntries = entries.some((entry) => {
      if (!entry.account) return false;

      const hasDebit = entry.debitAmount && parseFloat(entry.debitAmount) > 0;
      const hasCredit =
        entry.creditAmount && parseFloat(entry.creditAmount) > 0;

      return hasDebit && hasCredit;
    });

    if (hasInvalidEntries) {
      toast.error(
        "Please ensure each ledger has either debit OR credit amount, not both.",
        {
          position: "bottom-right",
          autoClose: 5000,
        },
      );
      return;
    }

    // Check minimum entries (at least 2)
    const validEntries = entries.filter(
      (entry) =>
        entry.account &&
        (entry.debitAmount || entry.creditAmount) &&
        parseFloat(entry.debitAmount || entry.creditAmount || 0) > 0,
    );

    if (validEntries.length < 2) {
      toast.error(
        "Contra voucher must have at least 2 entries (one debit and one credit).",
        {
          position: "bottom-right",
          autoClose: 5000,
        },
      );
      return;
    }

    // Check if all accounts are bank accounts
    const nonBankAccounts = validEntries.filter(
      (entry) => !entry.account.isBankAccount,
    );

    if (nonBankAccounts.length > 0) {
      toast.error("Contra voucher must use bank accounts only.", {
        position: "bottom-right",
        autoClose: 5000,
      });
      return;
    }

    // Check sub-ledger totals match parent amounts
    const hasInvalidSubLedgerTotals = entries.some((entry) => {
      if (!entry.account || entry.account.Lg_Sub != "yes") return false;

      const parentAmount =
        parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0;
      if (parentAmount == 0) return false;

      const subLedgerTotal = entry.subLedgerEntries.reduce(
        (sum, subEntry) => sum + (parseFloat(subEntry.amount) || 0),
        0,
      );

      return Math.abs(subLedgerTotal - parentAmount) > 0.01;
    });

    if (hasInvalidSubLedgerTotals) {
      toast.error(
        "Some S-mode accounts have sub-ledger totals that don't match parent amounts.",
        {
          position: "bottom-right",
          autoClose: 5000,
        },
      );
      return;
    }

    try {
      setIsLoading(true);

      const nextVoucherId = await generateNextVoucherId();
      setVoucherId(nextVoucherId);
      setVoucherNumber(`${nextVoucherId}`);

      const transactions = [];
      let transactionCounter = 1;

      const entriesWithAccounts = entries.filter(
        (entry) => entry.account && (entry.debitAmount || entry.creditAmount),
      );

      entriesWithAccounts.forEach((entry) => {
        const debitAmount = parseFloat(entry.debitAmount) || 0;
        const creditAmount = parseFloat(entry.creditAmount) || 0;
        const mainAmount = debitAmount > 0 ? debitAmount : creditAmount;
        const isDebit = debitAmount > 0;

        const hasSubLedger =
          entry.account.Lg_Sub == "yes" || entry.account.Lg_Sub == true;

        if (hasSubLedger && entry.subLedgerEntries.length > 0) {
          // S-mode with sub-ledgers
          entry.subLedgerEntries.forEach((subEntry) => {
            const subAmount = parseFloat(subEntry.amount) || 0;

            if (subAmount > 0) {
              transactions.push({
                Org_Id: selectedOrganisation?.id,
                Lg_Id: entry.account.Pr_Id,
                Vou_Ty: "CON",
                Vou_Id: nextVoucherId.toString(),
                Vou_Sr: transactionCounter.toString(),
                Vou_Ln: transactionCounter.toString(),
                V_Mode: "S",
                Vou_Dt: voucherDate,
                Dr_Amt: isDebit ? formatAmount(subAmount) : null,
                Cr_Amt: !isDebit ? formatAmount(subAmount) : null,
                rmk1: narration,
                SL_Id: String(subEntry.subLedgerId),
                SL_Amt: formatAmount(subAmount),
                Ref_Id: entry.account.Pr_Id,
              });
              transactionCounter++;
            }
          });

          // G entry for parent
          if (mainAmount > 0) {
            transactions.push({
              Org_Id: selectedOrganisation?.id,
              Lg_Id: entry.account.Pr_Id,
              Vou_Ty: "CON",
              Vou_Id: nextVoucherId.toString(),
              Vou_Sr: transactionCounter.toString(),
              Vou_Ln: transactionCounter.toString(),
              V_Mode: "G",
              Vou_Dt: voucherDate,
              Dr_Amt: isDebit ? formatAmount(mainAmount) : null,
              Cr_Amt: !isDebit ? formatAmount(mainAmount) : null,
              rmk1: narration,
              Ref_Id: entry.account.Pr_Id,
            });
            transactionCounter++;
          }
        } else {
          // G-mode account
          if (mainAmount > 0) {
            transactions.push({
              Org_Id: selectedOrganisation?.id,
              Lg_Id: entry.account.Pr_Id,
              Vou_Ty: "CON",
              Vou_Id: nextVoucherId.toString(),
              Vou_Sr: transactionCounter.toString(),
              Vou_Ln: transactionCounter.toString(),
              V_Mode: "G",
              Vou_Dt: voucherDate,
              Dr_Amt: isDebit ? formatAmount(mainAmount) : null,
              Cr_Amt: !isDebit ? formatAmount(mainAmount) : null,
              rmk1: narration,
              Ref_Id: entry.account.Pr_Id,
            });
            transactionCounter++;
          }
        }
      });

      if (transactions.length > 0) {
        for (let i = 0; i < transactions.length; i++) {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/finan-trns`,
            transactions[i],
              {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
          );
        }

        toast.success(
          `Contra voucher saved successfully! Voucher ID: ${nextVoucherId}`,
          {
            position: "bottom-right",
            autoClose: 5000,
          },
        );

        setTimeout(() => {
          navigate("/transactions/bookkeeping-vouchers/contra-entries");
        }, 5000);
      } else {
        toast.error("No valid transactions to save.", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error saving contra voucher:", err);
      toast.error(
        `Failed to save contra voucher: ${err.response?.data?.message || err.message}`,
        {
          position: "bottom-right",
          autoClose: 5000,
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const { totalDebit, totalCredit } = calculateTotals();

  if (isLoading && !transactionData.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="p-4">
        <div className="border border-gray-300 bg-white shadow-lg rounded-md w-full flex flex-col min-h-[750px]">
          <div className="flex justify-between items-center border-b-2 border-gray-400 p-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/transactions/bookkeeping-vouchers/contra-entries"
                className="flex items-center px-3 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow"
              >
                <FiChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-serif font-semibold text-gray-800">
                Create Contra Voucher
              </h1>
              {voucherNumber && (
                <span className="ml-3 text-lg font-medium text-gray-600">
                  No. {voucherNumber}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 font-serif">
              <input
                type="date"
                value={voucherDate}
                onChange={(e) => setVoucherDate(e.target.value)}
                ref={dateInputRef}
                className="border border-gray-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => handleKeyPress(e, "date")}
              />
              <br />
              {formatDate(voucherDate)}
            </div>
          </div>

          <div className="p-4 flex-1">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 font-serif font-semibold text-gray-700 w-3/5">
                    Particulars
                  </th>
                  <th className="text-right py-3 font-serif font-semibold text-gray-700 w-1/5">
                    Debit
                  </th>
                  <th className="text-right py-3 font-serif font-semibold text-gray-700 w-1/5">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    <tr className={index > 0 ? "border-t border-gray-200" : ""}>
                      <td className="py-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Select Bank Account"
                            value={entry.account ? entry.account.pr_name : ""}
                            readOnly
                            ref={(el) => (ledgerInputRefs.current[index] = el)}
                            className="w-full bg-transparent rounded p-1 text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onFocus={() => setOpenDropdownIndex(index)}
                            onClick={() => setOpenDropdownIndex(index)}
                            onKeyDown={(e) =>
                              handleKeyPress(e, "ledger", index)
                            }
                          />
                          {openDropdownIndex == index && (
                            <div
                              className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto dropdown-container"
                              onKeyDown={(e) => handleDropdownKeyDown(e, index)}
                            >
                              <div className="sticky top-0 bg-white p-2 border-b">
                                <input
                                  type="text"
                                  ref={bankSearchRef}
                                  value={bankSearch}
                                  onChange={(e) =>
                                    setBankSearch(e.target.value)
                                  }
                                  placeholder="Search bank account..."
                                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  autoFocus
                                />
                              </div>
                              {filteredBankAccounts.length > 0 ? (
                                filteredBankAccounts.map((account, idx) => (
                                  <div
                                    key={account.Pr_Id}
                                    ref={(el) =>
                                      (dropdownItemRefs.current[idx] = el)
                                    }
                                    className={`px-4 py-2 text-sm cursor-pointer ${
                                      highlightedIndex == idx
                                        ? "bg-blue-100"
                                        : "hover:bg-blue-50"
                                    }`}
                                    onClick={() =>
                                      handleAccountSelect(index, account)
                                    }
                                    tabIndex={0}
                                  >
                                    <div className="font-medium">
                                      {account.pr_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {account.pr_code}
                                      {account.Lg_Eng_Name &&
                                        ` | ${account.Lg_Eng_Name}`}
                                      {account.isBankAccount && (
                                        <span className="ml-1 text-green-600">
                                          (Bank)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">
                                  No bank accounts found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 align-top">
                        <input
                          type="text"
                          value={entry.debitAmount}
                          onChange={(e) =>
                            handleDebitAmountChange(index, e.target.value)
                          }
                          ref={(el) => (debitAmountRefs.current[index] = el)}
                          className="text-right bg-transparent rounded p-1 w-full text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="0.00"
                          onKeyDown={(e) =>
                            handleKeyPress(e, "debitAmount", index)
                          }
                        />
                      </td>
                      <td className="text-right py-3 align-top">
                        <input
                          type="text"
                          value={entry.creditAmount}
                          onChange={(e) =>
                            handleCreditAmountChange(index, e.target.value)
                          }
                          ref={(el) => (creditAmountRefs.current[index] = el)}
                          className="text-right bg-transparent rounded p-1 w-full text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="0.00"
                          onKeyDown={(e) =>
                            handleKeyPress(e, "creditAmount", index)
                          }
                        />
                      </td>
                    </tr>

                    {entry.showSubLedgerDropdown &&
                      entry.account?.Lg_Sub == "yes" && (
                        <tr>
                          <td colSpan="3" className="py-2 pl-8">
                            <div className="relative">
                              <div className="text-xs font-medium text-gray-500 mb-1">
                                Search Sub-ledger (Press Enter to select):
                              </div>
                              <input
                                type="text"
                                ref={(el) =>
                                  (subLedgerSearchRefs.current[index] = el)
                                }
                                value={entry.subLedgerSearch}
                                onChange={(e) =>
                                  handleSubLedgerSearchChange(
                                    index,
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-transparent rounded p-1 text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm border border-gray-300"
                                placeholder="Type to search sub-ledgers..."
                                onKeyDown={(e) =>
                                  handleKeyPress(e, "subLedgerSearch", index)
                                }
                              />

                              {entry.filteredSubLedgers.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                  {entry.filteredSubLedgers.map(
                                    (subLedger, idx) => (
                                      <div
                                        key={subLedger.SL_Id}
                                        className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50"
                                        onClick={() =>
                                          handleSubLedgerSelect(
                                            index,
                                            subLedger,
                                          )
                                        }
                                      >
                                        <div className="font-medium">
                                          {subLedger.SL_Name}
                                        </div>
                                        {subLedger.SL_Code && (
                                          <div className="text-xs text-gray-500">
                                            {subLedger.SL_Code}
                                          </div>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                    {entry.subLedgerEntries.map((subEntry, subIndex) => (
                      <tr key={subIndex} className="bg-gray-50">
                        <td className="py-1 pl-8">
                          <div className="flex items-center justify-between">
                            <div
                              id={`subledger-name-${index}-${subIndex}`}
                              className="flex items-center space-x-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1"
                              onClick={() => {
                                setTimeout(
                                  () =>
                                    subLedgerAmountRefs.current[
                                      `${index}-${subIndex}`
                                    ]?.focus(),
                                  0,
                                );
                              }}
                              onKeyDown={(e) =>
                                handleKeyPress(
                                  e,
                                  "subLedgerName",
                                  index,
                                  subIndex,
                                )
                              }
                              tabIndex={0}
                            >
                              <span className="text-sm text-gray-700">
                                {subEntry.subLedgerName}
                              </span>
                              {subEntry.subLedgerCode && (
                                <span className="text-xs text-gray-500">
                                  ({subEntry.subLedgerCode})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                Amount:
                              </span>
                              <input
                                type="text"
                                value={subEntry.amount}
                                onChange={(e) =>
                                  handleSubLedgerAmountChange(
                                    index,
                                    subIndex,
                                    e.target.value,
                                  )
                                }
                                ref={(el) =>
                                  (subLedgerAmountRefs.current[
                                    `${index}-${subIndex}`
                                  ] = el)
                                }
                                className="bg-transparent rounded p-1 text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm border border-gray-300 w-32 text-right"
                                placeholder="0.00"
                                onKeyDown={(e) =>
                                  handleKeyPress(
                                    e,
                                    "subLedgerAmount",
                                    index,
                                    subIndex,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t-2 border-gray-400">
            <div className="flex justify-between items-center mb-4">
              <div className="w-1/2">
                <p className="text-gray-700 font-serif font-medium">
                  Narration:
                </p>
                <textarea
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  ref={narrationRef}
                  className="w-full border border-gray-300 p-1 font-serif text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows="3"
                  placeholder="Enter contra narration..."
                  onKeyDown={(e) => handleKeyPress(e, "narration")}
                />
              </div>
              <div className="text-right">
                <div className="flex justify-end gap-8 mb-4">
                  <div className="text-right">
                    <p className="text-gray-700 font-serif font-medium">
                      Total Debit
                    </p>
                    <p className="text-gray-700 font-serif text-lg font-semibold w-48 text-right border-b-2 border-gray-400 pb-1">
                      {formatAmount(totalDebit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 font-serif font-medium">
                      Total Credit
                    </p>
                    <p className="text-gray-700 font-serif text-lg font-semibold w-48 text-right border-b-2 border-gray-400 pb-1">
                      {formatAmount(totalCredit)}
                    </p>
                  </div>
                </div>

                <button
                  ref={saveButtonRef}
                  onClick={handleSubmit}
                  disabled={!canSave || isLoading}
                  className={`px-6 py-3 rounded text-white font-serif text-lg ${
                    canSave && !isLoading
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Saving..." : "Save Contra Voucher"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContraVoucher;
