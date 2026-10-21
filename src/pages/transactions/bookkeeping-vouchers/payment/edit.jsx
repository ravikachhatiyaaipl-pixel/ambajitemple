import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiChevronLeft } from "react-icons/fi";

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

const PaymentVoucherEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [allLedgers, setAllLedgers] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [nonBankAccounts, setNonBankAccounts] = useState([]);
  const [filteredBankAccounts, setFilteredBankAccounts] = useState([]);
  const [filteredNonBankAccounts, setFilteredNonBankAccounts] = useState([]);

  const [entries, setEntries] = useState([]);
  const [narration, setNarration] = useState("");
  const [voucherNumber, setVoucherNumber] = useState(id);
  const [voucherId, setVoucherId] = useState(parseInt(id));
  const [voucherDate, setVoucherDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionData, setTransactionData] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [subLedgers, setSubLedgers] = useState([]);
  const [canSave, setCanSave] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [nonBankSearch, setNonBankSearch] = useState("");

  const [organisationData, setOrganisationData] = useState([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState(() =>
    JSON.parse(localStorage.getItem("selectedOrganisation")),
  );
  const [showSubLedgerDropdownIndex, setShowSubLedgerDropdownIndex] =
    useState(null);
  const [subLedgerHighlightedIndex, setSubLedgerHighlightedIndex] =
    useState(-1);
  const [clickedElementType, setClickedElementType] = useState(null);
  const [focusedLedgerIndex, setFocusedLedgerIndex] = useState(null);
  const [localLedgerInputValues, setLocalLedgerInputValues] = useState({});

  const dateInputRef = useRef(null);
  const ledgerInputRefs = useRef([]);
  const debitAmountRefs = useRef([]);
  const creditAmountRefs = useRef([]);
  const narrationRef = useRef(null);
  const dropdownItemRefs = useRef([]);
  const subLedgerDropdownItemRefs = useRef([]);
  const subLedgerSearchRefs = useRef([]);
  const subLedgerAmountRefs = useRef([]);
  const bankSearchRef = useRef(null);
  const nonBankSearchRef = useRef(null);
  const saveButtonRef = useRef(null);
  const subLedgerNameRefs = useRef({});

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

  useEffect(() => {
    const { totalDebit, totalCredit } = calculateTotals();

    // Condition 1: First line must be bank account with credit only
    const firstLineValid =
      entries[0]?.account &&
      // entries[0]?.account.Gr_Buk ==  "Y" &&  // Keep this uncommented for production!
      entries[0]?.creditAmount &&
      parseFloat(entries[0]?.creditAmount) > 0 &&
      !entries[0]?.debitAmount;

    // Find the last row that has an account or amount
    const lastValidIndex = entries.reduce((lastIndex, entry, index) => {
      if (entry.account || entry.debitAmount || entry.creditAmount) {
        return index;
      }
      return lastIndex;
    }, -1);

    // Condition 2: All entries MUST be valid - but only up to the last valid row
    const allEntriesValid = entries.every((entry, index) => {
      // Skip empty rows after the last valid entry
      if (index > lastValidIndex) return true;

      // If it's before or at the last valid row, it must be valid
      if (!entry.account) return false;

      const hasDebit = entry.debitAmount && parseFloat(entry.debitAmount) > 0;
      const hasCredit =
        entry.creditAmount && parseFloat(entry.creditAmount) > 0;

      // Cannot have both debit and credit
      if (hasDebit && hasCredit) return false;

      // Must have either debit or credit (not both, not none)
      if (!hasDebit && !hasCredit) return false;

      // First line cannot have debit (already checked above)
      if (entry.isFirstLine && hasDebit) return false;

      return true;
    });

    // Condition 3: Debit and Credit totals must match
    const totalsMatch = Math.abs(totalDebit - totalCredit) < 0.01;

    setCanSave(firstLineValid && allEntriesValid && totalsMatch && !isLoading);
  }, [entries, isLoading]);

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

  useEffect(() => {
    if (nonBankSearch.trim() == "") {
      setFilteredNonBankAccounts(nonBankAccounts);
    } else {
      const searchTerm = nonBankSearch.toLowerCase();
      const filtered = nonBankAccounts.filter(
        (account) =>
          account.pr_name.toLowerCase().includes(searchTerm) ||
          account.pr_code.toLowerCase().includes(searchTerm) ||
          (account.Lg_Eng_Name &&
            account.Lg_Eng_Name.toLowerCase().includes(searchTerm)),
      );
      setFilteredNonBankAccounts(filtered);
    }
  }, [nonBankSearch, nonBankAccounts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownIndex != null) {
        const dropdown = document.querySelector(".ledger-dropdown-container");
        if (dropdown && !dropdown.contains(event.target)) {
          setOpenDropdownIndex(null);
          setHighlightedIndex(-1);
          setBankSearch("");
          setNonBankSearch("");
        }
      }

      if (showSubLedgerDropdownIndex != null) {
        const dropdown = document.querySelector(
          ".subledger-dropdown-container",
        );
        if (dropdown && !dropdown.contains(event.target)) {
          setShowSubLedgerDropdownIndex(null);
          setSubLedgerHighlightedIndex(-1);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownIndex, showSubLedgerDropdownIndex]);

  const getSubLedgersForAccount = (ledgerId) => {
    if (!ledgerId) return [];

    const ledgerIdStr = String(ledgerId);

    return subLedgers.filter((sl) => {
      const lgIds = Array.isArray(sl.Lg_Id) ? sl.Lg_Id : [sl.Lg_Id];
      return lgIds.some((id) => String(id) == ledgerIdStr);
    });
  };

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

  const processVoucherData = (voucher, mappedLedgers, subLedgersData) => {
    if (
      !voucher ||
      !voucher.voucher_rows ||
      !Array.isArray(voucher.voucher_rows)
    ) {
      return [];
    }

    const ledgerMap = new Map();

    voucher.voucher_rows.forEach((row) => {
      const ledgerId = row.Lg_Id;
      if (!ledgerId) return;

      if (!ledgerMap.has(ledgerId)) {
        const ledger = mappedLedgers.find(
          (l) => String(l.Lg_Id) == String(ledgerId),
        );
        if (!ledger) return;

        ledgerMap.set(ledgerId, {
          ledger: ledger,
          sEntries: [],
          gEntry: null,
          totalAmount: 0,
        });
      }

      const ledgerData = ledgerMap.get(ledgerId);

      if (row.V_Mode == "S" && row.SL_Id) {
        const subLedger = subLedgersData.find(
          (sl) => String(sl.SL_Id) == String(row.SL_Id),
        );

        if (subLedger) {
          ledgerData.sEntries.push({
            subLedgerId: subLedger.SL_Id,
            subLedgerName: subLedger.SL_Name,
            subLedgerCode: subLedger.SL_Code,
            amount: row.SL_Amt || "0",
            isDebit: row.Dr_Amt && parseFloat(row.Dr_Amt) > 0,
          });

          const subAmount = parseFloat(row.SL_Amt) || 0;
          ledgerData.totalAmount += subAmount;
        }
      } else if (row.V_Mode == "G") {
        const amount = parseFloat(row.Dr_Amt) || parseFloat(row.Cr_Amt) || 0;
        ledgerData.gEntry = {
          amount: amount.toString(),
          isDebit: row.Dr_Amt && parseFloat(row.Dr_Amt) > 0,
        };
      }
    });

    const entriesArray = Array.from(ledgerMap.values()).map(
      (ledgerData, index) => {
        const subLedgersForAccount =
          ledgerData.ledger.Lg_Sub == "yes"
            ? getSubLedgersForAccount(ledgerData.ledger.Pr_Id)
            : [];

        let debitAmount = "";
        let creditAmount = "";

        if (ledgerData.gEntry) {
          if (ledgerData.gEntry.isDebit) {
            debitAmount = formatAmount(ledgerData.gEntry.amount);
          } else {
            creditAmount = formatAmount(ledgerData.gEntry.amount);
          }
        } else if (ledgerData.sEntries.length > 0) {
          const total = ledgerData.sEntries.reduce(
            (sum, entry) => sum + parseFloat(entry.amount || 0),
            0,
          );
          const isDebit = ledgerData.sEntries[0]?.isDebit || true;

          if (isDebit) {
            debitAmount = formatAmount(total);
          } else {
            creditAmount = formatAmount(total);
          }
        }

        const formattedSubEntries = ledgerData.sEntries
          .map((entry) => ({
            ...entry,
            amount: entry.amount ? parseFloat(entry.amount).toString() : "",
          }))
          .filter((entry) => parseFloat(entry.amount) > 0);

        return {
          id: index + 1,
          account: ledgerData.ledger,
          debitAmount: debitAmount,
          creditAmount: creditAmount,
          subLedgerSearch: "",
          filteredSubLedgers: subLedgersForAccount,
          subLedgerEntries: formattedSubEntries,
          completed: true,
          isFirstLine: index == 0, // First entry is the bank account
        };
      },
    );

    return entriesArray;
  };

  useEffect(() => {
    const fetchVoucherData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [
          organisationResponse,
          ledgersResponse,
          transactionsResponse,
          subLedgersResponse,
          voucherResponse,
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/lst-org-master`,{        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }),
          axios.get(`${import.meta.env.VITE_API_URL}/ledgers/all/data`,{        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }),
          axios.get(`${import.meta.env.VITE_API_URL}/finan-trns/all`,{        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }),
          axios.get(`${import.meta.env.VITE_API_URL}/sub-ledgers/all`,
            {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
          ),
          axios.get(
            `${import.meta.env.VITE_API_URL}/finan-trns/vouchers?Vou_Ty=PAY&Vou_Id=${id}`,
            {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
          ),
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
          Gr_Buk: ledger.ledger_group?.Gr_Buk || "N",
        }));

        setAllLedgers(mappedLedgers);

        // Separate bank and non-bank accounts
        const bankAccounts = mappedLedgers.filter(
          (ledger) => ledger.Gr_Buk == "Y",
        );
        const nonBankAccounts = mappedLedgers.filter(
          (ledger) => ledger.Gr_Buk == "N",
        );

        setBankAccounts(bankAccounts);
        setNonBankAccounts(nonBankAccounts);
        setFilteredBankAccounts(bankAccounts);
        setFilteredNonBankAccounts(nonBankAccounts);

        setTransactionData(
          Array.isArray(transactionsResponse.data?.data)
            ? transactionsResponse.data.data
            : [],
        );

        if (subLedgersResponse.data.success) {
          const subLedgersData = subLedgersResponse.data.data;
          setSubLedgers(subLedgersData);
        }

        if (
          voucherResponse.data.success &&
          voucherResponse.data.data.length > 0
        ) {
          const voucher = voucherResponse.data.data[0];

          if (voucher.Vou_Dt) {
            const parts = voucher.Vou_Dt.split("/");
            if (parts.length == 3) {
              const [day, month, year] = parts;
              setVoucherDate(`${year}-${month}-${day}`);
            } else {
              setVoucherDate(new Date().toISOString().split("T")[0]);
            }
          } else {
            setVoucherDate(new Date().toISOString().split("T")[0]);
          }

          if (voucher.voucher_rows && voucher.voucher_rows.length > 0) {
            setNarration(voucher.voucher_rows[0].rmk1 || "");
          }

          const entriesArray = processVoucherData(
            voucher,
            mappedLedgers,
            subLedgersResponse.data.data || [],
          );
          setEntries(entriesArray);

          if (entriesArray.length == 0) {
            setEntries([
              {
                id: 1,
                account: null,
                debitAmount: "",
                creditAmount: "",
                subLedgerSearch: "",
                filteredSubLedgers: [],
                subLedgerEntries: [],
                completed: false,
                isFirstLine: true,
              },
            ]);
          }
        } else {
          setError("Voucher not found");
          setEntries([
            {
              id: 1,
              account: null,
              debitAmount: "",
              creditAmount: "",
              subLedgerSearch: "",
              filteredSubLedgers: [],
              subLedgerEntries: [],
              completed: false,
              isFirstLine: true,
            },
          ]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load voucher data");
        setIsLoading(false);
      }
    };

    fetchVoucherData();
  }, [id]);

  useEffect(() => {
    if (!isLoading && dateInputRef.current) {
      setTimeout(() => dateInputRef.current.focus(), 100);
    }
  }, [isLoading]);

  useEffect(() => {
    if (openDropdownIndex == 0 && bankSearchRef.current) {
      setTimeout(() => bankSearchRef.current.focus(), 0);
    } else if (openDropdownIndex > 0 && nonBankSearchRef.current) {
      setTimeout(() => nonBankSearchRef.current.focus(), 0);
    }
  }, [openDropdownIndex]);

  useEffect(() => {
    if (
      showSubLedgerDropdownIndex != null &&
      subLedgerSearchRefs.current[showSubLedgerDropdownIndex]
    ) {
      setTimeout(
        () => subLedgerSearchRefs.current[showSubLedgerDropdownIndex]?.focus(),
        0,
      );
    }
  }, [showSubLedgerDropdownIndex]);

  const handleLedgerInputChange = (index, value) => {
    // Clear the selected account when user starts typing
    if (entries[index]?.account) {
      const newEntries = [...entries];
      newEntries[index].account = null;
      setEntries(newEntries);
    }

    // Update the local input value with what user typed
    setLocalLedgerInputValues((prev) => ({
      ...prev,
      [index]: value,
    }));

    // Set search based on index
    if (index == 0) {
      setBankSearch(value);
    } else {
      setNonBankSearch(value);
    }

    // Open dropdown when typing starts
    if (value.length > 0) {
      setOpenDropdownIndex(index);
      setTimeout(() => {
        if (index == 0 && bankSearchRef.current) {
          bankSearchRef.current.focus();
        } else if (index > 0 && nonBankSearchRef.current) {
          nonBankSearchRef.current.focus();
        }
      }, 0);
    } else {
      setOpenDropdownIndex(null);
    }
  };

  const handleAccountSelect = (index, account) => {
    const newEntries = [...entries];
    newEntries[index].account = account;

    // Set the local input value to the selected account name
    setLocalLedgerInputValues((prev) => ({
      ...prev,
      [index]: account.pr_name,
    }));

    const hasAmount =
      newEntries[index].debitAmount || newEntries[index].creditAmount;

    if (!hasAmount) {
      newEntries[index].debitAmount = "";
      newEntries[index].creditAmount = "";
    }

    // First line cannot have debit amount
    if (index == 0) {
      newEntries[index].debitAmount = "";
    }

    newEntries[index].subLedgerSearch = "";

    if (account.Lg_Sub == "yes") {
      const accountSubLedgers = getSubLedgersForAccount(account.Pr_Id);
      newEntries[index].filteredSubLedgers = accountSubLedgers;
    } else {
      newEntries[index].filteredSubLedgers = [];
    }

    if (
      account.Lg_Sub != "yes" &&
      newEntries[index].subLedgerEntries.length > 0
    ) {
      newEntries[index].subLedgerEntries = [];
    }

    newEntries[index].completed = false;

    setEntries(newEntries);
    setOpenDropdownIndex(null);
    setHighlightedIndex(-1);
    setBankSearch("");
    setNonBankSearch("");
    setClickedElementType(null);
    setFocusedLedgerIndex(null);

    if (!hasAmount) {
      setTimeout(() => {
        if (index == 0) {
          creditAmountRefs.current[index]?.focus();
        } else {
          debitAmountRefs.current[index]?.focus();
        }
      }, 0);
    } else {
      setTimeout(() => {
        if (index == 0) {
          creditAmountRefs.current[index]?.focus();
        } else {
          debitAmountRefs.current[index]?.focus();
        }
      }, 0);
    }
  };

  const handleGAccountClick = (index) => {
    setFocusedLedgerIndex(index);
    ledgerInputRefs.current[index]?.focus();
    setClickedElementType("G");
    setOpenDropdownIndex(null);
    // Don't clear localLedgerInputValues - keep existing value
  };

  const handleSSubLedgerClick = (mainIndex, subIndex) => {
    setTimeout(
      () => subLedgerAmountRefs.current[`${mainIndex}-${subIndex}`]?.focus(),
      0,
    );
  };

  const handleDebitAmountChange = (index, value) => {
    // First line cannot have debit amount
    if (index == 0) return;

    if (/^\d*\.?\d{0,2}$/.test(value)) {
      const newEntries = [...entries];
      newEntries[index].debitAmount = value;

      if (value) {
        newEntries[index].creditAmount = "";
      }

      const currentAmount = parseFloat(value) || 0;

      if (currentAmount == 0) {
        newEntries[index].subLedgerSearch = "";
        newEntries[index].completed = false;
      } else {
        newEntries[index].subLedgerEntries = newEntries[
          index
        ].subLedgerEntries.filter(
          (subEntry) => parseFloat(subEntry.amount) > 0,
        );

        newEntries[index].subLedgerSearch = "";
        newEntries[index].completed = false;
      }

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

      const currentAmount = parseFloat(value) || 0;

      if (currentAmount == 0) {
        newEntries[index].subLedgerSearch = "";
        newEntries[index].completed = false;
      } else {
        newEntries[index].subLedgerEntries = newEntries[
          index
        ].subLedgerEntries.filter(
          (subEntry) => parseFloat(subEntry.amount) > 0,
        );

        newEntries[index].subLedgerSearch = "";
        newEntries[index].completed = false;
      }

      setEntries(newEntries);
    }
  };

  const handleSubLedgerSearchChange = (index, value) => {
    const newEntries = [...entries];
    newEntries[index].subLedgerSearch = value;
    setSubLedgerHighlightedIndex(-1);

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
            (subLedger.SL_Name &&
              subLedger.SL_Name.toLowerCase().includes(searchTerm)) ||
            (subLedger.SL_Code &&
              subLedger.SL_Code.toLowerCase().includes(searchTerm)),
        );
        newEntries[index].filteredSubLedgers = filtered;
      }
    }

    setEntries(newEntries);
  };

  const handleSubLedgerSelect = (mainIndex, subLedger) => {
    const newEntries = [...entries];
    const entry = newEntries[mainIndex];

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
      (subEntry) => String(subEntry.subLedgerId) == String(subLedger.SL_Id),
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
    setShowSubLedgerDropdownIndex(null);
    setSubLedgerHighlightedIndex(-1);
    setClickedElementType(null);

    setEntries(newEntries);

    setTimeout(() => {
      const subEntryIndex = entry.subLedgerEntries.length - 1;
      const nameElement = document.getElementById(
        `subledger-name-${mainIndex}-${subEntryIndex}`,
      );
      if (nameElement) {
        nameElement.focus();
      }
    }, 0);
  };

  const handleSubLedgerAmountChange = (mainIndex, subIndex, value) => {
    if (/^\d*\.?\d{0,2}$/.test(value) || value == "") {
      const newEntries = [...entries];
      const entry = newEntries[mainIndex];
      const subEntry = entry.subLedgerEntries[subIndex];

      subEntry.amount = value;

      if (value == "0" || value == "0.0" || value == "0.00") {
        entry.subLedgerEntries.splice(subIndex, 1);

        const parentAmount =
          parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0;
        const currentSubTotal = entry.subLedgerEntries.reduce(
          (sum, se) => sum + (parseFloat(se.amount) || 0),
          0,
        );

        if (parentAmount > 0 && currentSubTotal < parentAmount) {
          setShowSubLedgerDropdownIndex(mainIndex);
          setClickedElementType("S");
          setTimeout(() => subLedgerSearchRefs.current[mainIndex]?.focus(), 0);
        }

        setEntries(newEntries);
        return;
      }

      if (value && value != "" && value != "0") {
        const newAmount = parseFloat(value) || 0;

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
        }
      }

      setEntries(newEntries);
    }
  };

  const handleSubLedgerAmountBlur = (mainIndex, subIndex) => {
    const newEntries = [...entries];
    const entry = newEntries[mainIndex];

    if (subIndex >= entry.subLedgerEntries.length) {
      setEntries(newEntries);
      return;
    }

    const subEntry = entry.subLedgerEntries[subIndex];

    if (subEntry.amount && subEntry.amount != "") {
      if (
        subEntry.amount == "0" ||
        subEntry.amount == "0.0" ||
        subEntry.amount == "0.00"
      ) {
        entry.subLedgerEntries.splice(subIndex, 1);

        const parentAmount =
          parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount) || 0;
        const currentSubTotal = entry.subLedgerEntries.reduce(
          (sum, se) => sum + (parseFloat(se.amount) || 0),
          0,
        );

        if (parentAmount > 0 && currentSubTotal < parentAmount) {
          setShowSubLedgerDropdownIndex(mainIndex);
          setClickedElementType("S");
        }

        setEntries(newEntries);
        return;
      }

      const num = parseFloat(subEntry.amount);
      if (!isNaN(num)) {
        subEntry.amount = num.toString();
      }
    }

    setEntries(newEntries);
  };

  const addEntry = () => {
    // Check if the last entry is empty before adding a new one
    const lastEntry = entries[entries.length - 1];

    // If last entry has no account and no amounts, don't add another empty row
    if (
      !lastEntry.account &&
      !lastEntry.debitAmount &&
      !lastEntry.creditAmount
    ) {
      return;
    }

    const newId =
      entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1;
    setEntries([
      ...entries,
      {
        id: newId,
        account: null,
        debitAmount: "",
        creditAmount: "",
        subLedgerSearch: "",
        filteredSubLedgers: [],
        subLedgerEntries: [],
        completed: false,
        isFirstLine: false,
      },
    ]);
  };

  const handleSpecificSubLedgerClick = (mainIndex, subIndex) => {
    setTimeout(
      () => subLedgerAmountRefs.current[`${mainIndex}-${subIndex}`]?.focus(),
      0,
    );
  };

  const handleKeyPress = (e, field, mainIndex = -1, subIndex = -1) => {
    if (e.key == "Enter") {
      e.preventDefault();

      if (field == "date") {
        ledgerInputRefs.current[0]?.focus();
        setOpenDropdownIndex(null);
        setClickedElementType("G");
        setFocusedLedgerIndex(0);
      } else if (field == "ledger") {
        if (entries[mainIndex]?.account) {
          // If ledger already selected, go to amount
          if (mainIndex == 0) {
            creditAmountRefs.current[mainIndex]?.focus();
          } else {
            debitAmountRefs.current[mainIndex]?.focus();
          }
        } else {
          // Check if this is the last entry and no ledger selected
          if (mainIndex == entries.length - 1) {
            // Last entry with no ledger selected, go to narration
            narrationRef.current?.focus();
            setOpenDropdownIndex(null);
            setClickedElementType(null);
            setFocusedLedgerIndex(null);
          } else {
            // Not last entry, just stay in ledger field
            setOpenDropdownIndex(null);
          }
        }
      } else if (field == "debitAmount" || field == "creditAmount") {
        const entry = entries[mainIndex];
        const currentValue =
          field == "debitAmount" ? entry.debitAmount : entry.creditAmount;
        const currentAmount = parseFloat(currentValue) || 0;

        if (!currentValue || currentAmount == 0) {
          if (mainIndex == 0) {
            return;
          }

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
            // For S-mode accounts, go to sub-ledger name field first
            if (entry.subLedgerEntries.length > 0) {
              const firstNameElement = document.getElementById(
                `subledger-name-${mainIndex}-0`,
              );
              if (firstNameElement) {
                firstNameElement.focus();
              }
            } else {
              const newEntries = [...entries];
              newEntries[mainIndex].showSubLedgerDropdown = true;
              newEntries[mainIndex].subLedgerSearch = "";
              const accountSubLedgers = getSubLedgersForAccount(
                entry.account.Pr_Id,
              );
              newEntries[mainIndex].filteredSubLedgers = accountSubLedgers;
              setEntries(newEntries);

              setTimeout(() => {
                if (subLedgerSearchRefs.current[mainIndex]) {
                  subLedgerSearchRefs.current[mainIndex]?.focus();
                }
              }, 0);
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

        if (subIndex >= entry.subLedgerEntries.length) {
          return;
        }

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
            const newEntries = [...entries];
            newEntries[mainIndex].showSubLedgerDropdown = true;
            newEntries[mainIndex].subLedgerSearch = "";
            const accountSubLedgers = getSubLedgersForAccount(
              entry.account.Pr_Id,
            );
            newEntries[mainIndex].filteredSubLedgers = accountSubLedgers;
            setEntries(newEntries);

            setTimeout(
              () => subLedgerSearchRefs.current[mainIndex]?.focus(),
              0,
            );
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
          () => navigate("/transactions/bookkeeping-vouchers/payment-entries"),
          () => dateInputRef.current?.focus(),
        );
      } else if (field == "ledger") {
        if (mainIndex == 0) {
          dateInputRef.current?.focus();
          setOpenDropdownIndex(null);
          setClickedElementType(null);
          setFocusedLedgerIndex(null);
        } else {
          ledgerInputRefs.current[mainIndex - 1]?.focus();
          setOpenDropdownIndex(mainIndex - 1);
          setClickedElementType("G");
        }
      } else if (field == "debitAmount" || field == "creditAmount") {
        ledgerInputRefs.current[mainIndex]?.focus();
        setOpenDropdownIndex(mainIndex);
        setClickedElementType("G");
      } else if (field == "narration") {
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          const lastIndex = entries.length - 1;

          if (lastEntry.subLedgerEntries.length > 0) {
            const lastSubIndex = lastEntry.subLedgerEntries.length - 1;
            const lastSubNameElement = document.getElementById(
              `subledger-name-${lastIndex}-${lastSubIndex}`,
            );
            if (lastSubNameElement) {
              lastSubNameElement.focus();
            }
          } else if (lastEntry.debitAmount || lastEntry.creditAmount) {
            if (lastEntry.debitAmount) {
              debitAmountRefs.current[lastIndex]?.focus();
            } else {
              creditAmountRefs.current[lastIndex]?.focus();
            }
          } else {
            ledgerInputRefs.current[lastIndex]?.focus();
            setOpenDropdownIndex(lastIndex);
            setClickedElementType("G");
          }
        }
      } else if (field == "subLedgerSearch") {
        setShowSubLedgerDropdownIndex(null);
        setSubLedgerHighlightedIndex(-1);
        setClickedElementType(null);

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
        if (subIndex >= 0) {
          handleSubLedgerAmountBlur(mainIndex, subIndex);
        }

        if (subIndex > 0) {
          const prevNameElement = document.getElementById(
            `subledger-name-${mainIndex}-${subIndex - 1}`,
          );
          if (prevNameElement) {
            prevNameElement.focus();
          }
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
            const newEntries = [...entries];
            newEntries[mainIndex].showSubLedgerDropdown = true;
            newEntries[mainIndex].subLedgerSearch = "";
            const accountSubLedgers = getSubLedgersForAccount(
              entry.account?.Pr_Id,
            );
            newEntries[mainIndex].filteredSubLedgers = accountSubLedgers;
            setEntries(newEntries);
            setTimeout(
              () => subLedgerSearchRefs.current[mainIndex]?.focus(),
              0,
            );
          } else {
            setShowSubLedgerDropdownIndex(null);
            setSubLedgerHighlightedIndex(-1);
            setClickedElementType(null);

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
        addEntry();
        setTimeout(() => {
          const nextIndex = index + 1;
          ledgerInputRefs.current[nextIndex]?.focus();
          setOpenDropdownIndex(null);
          setClickedElementType("G");
          setFocusedLedgerIndex(nextIndex);
        }, 100);
      }, 50);
    } else {
      setTimeout(() => {
        ledgerInputRefs.current[index + 1]?.focus();
        setOpenDropdownIndex(null);
        setClickedElementType("G");
        setFocusedLedgerIndex(index + 1);
      }, 50);
    }
  };

  const handleDropdownKeyDown = (e, index, isBankAccount) => {
    const accounts = isBankAccount
      ? filteredBankAccounts
      : filteredNonBankAccounts;

    if (e.key == "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      setHighlightedIndex((prev) => {
        const next = Math.min(prev + 1, accounts.length - 1);
        setTimeout(() => {
          if (dropdownItemRefs.current[next]) {
            dropdownItemRefs.current[next].focus();
          }
        }, 0);
        return next;
      });
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      setHighlightedIndex((prev) => {
        const next = Math.max(prev - 1, 0);
        setTimeout(() => {
          if (dropdownItemRefs.current[next]) {
            dropdownItemRefs.current[next].focus();
          }
        }, 0);
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
      if (isBankAccount) {
        setBankSearch("");
      } else {
        setNonBankSearch("");
      }
      setClickedElementType(null);
      ledgerInputRefs.current[index]?.focus();
    } else if (e.key == "Tab") {
      setOpenDropdownIndex(null);
      setHighlightedIndex(-1);
      if (isBankAccount) {
        setBankSearch("");
      } else {
        setNonBankSearch("");
      }
      setClickedElementType(null);
    }
  };

  const handleSubLedgerDropdownKeyDown = (e, mainIndex) => {
    const entry = entries[mainIndex];
    if (!entry || !entry.filteredSubLedgers.length) return;

    if (e.key == "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      setSubLedgerHighlightedIndex((prev) => {
        const next = Math.min(prev + 1, entry.filteredSubLedgers.length - 1);

        setTimeout(() => {
          if (subLedgerDropdownItemRefs.current[next]) {
            subLedgerDropdownItemRefs.current[next].scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
            subLedgerDropdownItemRefs.current[next].focus();
          }
        }, 0);

        return next;
      });
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      setSubLedgerHighlightedIndex((prev) => {
        const next = Math.max(prev - 1, 0);

        setTimeout(() => {
          if (subLedgerDropdownItemRefs.current[next]) {
            subLedgerDropdownItemRefs.current[next].scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
            subLedgerDropdownItemRefs.current[next].focus();
          }
        }, 0);

        return next;
      });
    } else if (e.key == "Enter" && subLedgerHighlightedIndex >= 0) {
      e.preventDefault();
      const subLedger = entry.filteredSubLedgers[subLedgerHighlightedIndex];
      handleSubLedgerSelect(mainIndex, subLedger);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setShowSubLedgerDropdownIndex(null);
      setSubLedgerHighlightedIndex(-1);
      setClickedElementType(null);
      if (entry.debitAmount && parseFloat(entry.debitAmount) > 0) {
        debitAmountRefs.current[mainIndex]?.focus();
      } else if (entry.creditAmount && parseFloat(entry.creditAmount) > 0) {
        creditAmountRefs.current[mainIndex]?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that first line has bank account with credit only
    const hasInvalidEntries = entries.some((entry) => {
      if (!entry.account) return false;

      const hasDebit = entry.debitAmount && parseFloat(entry.debitAmount) > 0;
      const hasCredit =
        entry.creditAmount && parseFloat(entry.creditAmount) > 0;

      if (hasDebit && hasCredit) {
        return true;
      }

      // First line must have credit only
      if (entry.isFirstLine && hasDebit) {
        return true;
      }

      return false;
    });

    if (hasInvalidEntries) {
      toast.error(
        "Please ensure each ledger has either debit OR credit amount, not both. First line must have credit only.",
        {
          position: "bottom-right",
          autoClose: 5000,
        },
      );
      return;
    }

    // Validate that sub-ledger totals match parent amounts
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

    showConfirmToast(
      "Are you sure you want to update this payment voucher?",
      async () => {
        try {
          setIsLoading(true);

          const deleteResponse = await axios.delete(
            `${import.meta.env.VITE_API_URL}/finan-trns/delete-voucher?Vou_Ty=PAY&Vou_Id=${id}`,
            {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
          );

          if (!deleteResponse.data.success) {
            throw new Error("Failed to delete existing voucher");
          }

          const formattedDate = voucherDate;

          const transactions = [];
          let transactionCounter = 1;

          const entriesWithAccounts = entries.filter(
            (entry) =>
              entry.account && (entry.debitAmount || entry.creditAmount),
          );

          entriesWithAccounts.forEach((entry) => {
            const debitAmount = parseFloat(entry.debitAmount) || 0;
            const creditAmount = parseFloat(entry.creditAmount) || 0;
            const mainAmount = debitAmount > 0 ? debitAmount : creditAmount;
            const isDebit = debitAmount > 0;

            const hasSubLedger =
              entry.account.Lg_Sub == "yes" || entry.account.Lg_Sub == true;

            if (hasSubLedger && entry.subLedgerEntries.length > 0) {
              let subLedgerCounter = 0;
              entry.subLedgerEntries.forEach((subEntry) => {
                const subAmount = parseFloat(subEntry.amount) || 0;

                if (subAmount > 0) {
                  transactions.push({
                    Org_Id: selectedOrganisation?.id,
                    Lg_Id: entry.account.Pr_Id,
                    Vou_Ty: "PAY",
                    Vou_Id: voucherId.toString(),
                    Vou_Sr: transactionCounter.toString(),
                    Vou_Ln: transactionCounter.toString(),
                    V_Mode: "S",
                    Vou_Dt: formattedDate,
                    Dr_Amt: isDebit ? formatAmount(subAmount) : null,
                    Cr_Amt: !isDebit ? formatAmount(subAmount) : null,
                    rmk1: narration,
                    SL_Id: String(subEntry.subLedgerId),
                    SL_Amt: formatAmount(subAmount),
                    Ref_Id: entry.account.Pr_Id,
                  });
                  transactionCounter++;
                  subLedgerCounter++;
                }
              });

              if (subLedgerCounter > 0 && mainAmount > 0) {
                transactions.push({
                  Org_Id: selectedOrganisation?.id,
                  Lg_Id: entry.account.Pr_Id,
                  Vou_Ty: "PAY",
                  Vou_Id: voucherId.toString(),
                  Vou_Sr: transactionCounter.toString(),
                  Vou_Ln: transactionCounter.toString(),
                  V_Mode: "G",
                  Vou_Dt: formattedDate,
                  Dr_Amt: isDebit ? formatAmount(mainAmount) : null,
                  Cr_Amt: !isDebit ? formatAmount(mainAmount) : null,
                  rmk1: narration,
                  Ref_Id: entry.account.Pr_Id,
                });
                transactionCounter++;
              }
            } else if (hasSubLedger && entry.subLedgerEntries.length == 0) {
              if (mainAmount > 0) {
                transactions.push({
                  Org_Id: selectedOrganisation?.id,
                  Lg_Id: entry.account.Pr_Id,
                  Vou_Ty: "PAY",
                  Vou_Id: voucherId.toString(),
                  Vou_Sr: transactionCounter.toString(),
                  Vou_Ln: transactionCounter.toString(),
                  V_Mode: "G",
                  Vou_Dt: formattedDate,
                  Dr_Amt: isDebit ? formatAmount(mainAmount) : null,
                  Cr_Amt: !isDebit ? formatAmount(mainAmount) : null,
                  rmk1: narration,
                  Ref_Id: entry.account.Pr_Id,
                });
                transactionCounter++;
              }
            } else {
              if (mainAmount > 0) {
                transactions.push({
                  Org_Id: selectedOrganisation?.id,
                  Lg_Id: entry.account.Pr_Id,
                  Vou_Ty: "PAY",
                  Vou_Id: voucherId.toString(),
                  Vou_Sr: transactionCounter.toString(),
                  Vou_Ln: transactionCounter.toString(),
                  V_Mode: "G",
                  Vou_Dt: formattedDate,
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
            const submitResults = [];
            for (let i = 0; i < transactions.length; i++) {
              try {
                const response = await axios.post(
                  `${import.meta.env.VITE_API_URL}/finan-trns`,
                  transactions[i],
                  {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
                );
                submitResults.push(response);
              } catch (err) {
                console.error(`Error submitting transaction ${i + 1}:`, err);
                throw err;
              }
            }

            toast.success(
              `Payment voucher #${voucherId} updated successfully!`,
              {
                position: "bottom-right",
                autoClose: 5000,
              },
            );

            setTimeout(() => {
              navigate("/transactions/bookkeeping-vouchers/payment-entries");
            }, 5000);
          } else {
            toast.error("No valid transactions to save.", {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        } catch (err) {
          console.error("Error updating payment voucher:", err);
          toast.error(
            `Failed to update payment voucher: ${err.response?.data?.message || err.message}`,
            {
              position: "bottom-right",
              autoClose: 5000,
            },
          );
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        narrationRef.current?.focus();
      },
    );
  };

  const { totalDebit, totalCredit } = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={() =>
            navigate("/transactions/bookkeeping-vouchers/payment-entries")
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
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
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/transactions/bookkeeping-vouchers/payment-entries"
              className="flex items-center px-3 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow"
            >
              <FiChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-serif font-semibold text-gray-800">
              Edit Payment Voucher
            </h1>
          </div>
        </div>

        <div className="border border-gray-300 bg-white shadow-lg rounded-md w-full flex flex-col min-h-[750px]">
          <div className="flex justify-between items-center border-b-2 border-gray-400 p-4">
            <div className="flex items-center">
              <span className="ml-3 text-lg font-medium text-gray-600">
                No. {voucherNumber}
              </span>
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
              {formatDateDisplay(voucherDate)}
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
                {entries.map((entry, mainIndex) => (
                  <React.Fragment key={entry.id}>
                    <tr
                      className={
                        mainIndex > 0 ? "border-t border-gray-200" : ""
                      }
                    >
                      <td className="py-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={
                              mainIndex == 0
                                ? "Select Bank Account"
                                : "Select Ledger"
                            }
                            value={
                              localLedgerInputValues[mainIndex] != undefined
                                ? localLedgerInputValues[mainIndex]
                                : entry.account
                                  ? entry.account.pr_name
                                  : ""
                            }
                            onChange={(e) =>
                              handleLedgerInputChange(mainIndex, e.target.value)
                            }
                            ref={(el) =>
                              (ledgerInputRefs.current[mainIndex] = el)
                            }
                            className="w-full bg-transparent rounded p-1 text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-text"
                            onFocus={() => handleGAccountClick(mainIndex)}
                            onClick={() => handleGAccountClick(mainIndex)}
                            onKeyDown={(e) =>
                              handleKeyPress(e, "ledger", mainIndex)
                            }
                          />

                          {openDropdownIndex == mainIndex &&
                            clickedElementType == "G" && (
                              <div
                                className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto ledger-dropdown-container"
                                onKeyDown={(e) =>
                                  handleDropdownKeyDown(
                                    e,
                                    mainIndex,
                                    mainIndex == 0,
                                  )
                                }
                              >
                                <div className="sticky top-0 bg-white p-2 border-b">
                                  <input
                                    type="text"
                                    ref={
                                      mainIndex == 0
                                        ? bankSearchRef
                                        : nonBankSearchRef
                                    }
                                    value={
                                      mainIndex == 0
                                        ? bankSearch
                                        : nonBankSearch
                                    }
                                    onChange={(e) =>
                                      mainIndex == 0
                                        ? setBankSearch(e.target.value)
                                        : setNonBankSearch(e.target.value)
                                    }
                                    placeholder={
                                      mainIndex == 0
                                        ? "Search bank account..."
                                        : "Search ledger..."
                                    }
                                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    autoFocus
                                  />
                                </div>
                                {(mainIndex == 0
                                  ? filteredBankAccounts
                                  : filteredNonBankAccounts
                                ).length > 0 ? (
                                  (mainIndex == 0
                                    ? filteredBankAccounts
                                    : filteredNonBankAccounts
                                  ).map((account, idx) => (
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
                                        handleAccountSelect(mainIndex, account)
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
                                        {mainIndex == 0 &&
                                          account.Gr_Buk == "Y" && (
                                            <span className="ml-1 text-green-600">
                                              (Bank)
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-sm text-gray-500">
                                    {mainIndex == 0
                                      ? "No bank accounts found"
                                      : "No ledgers found"}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                        {entry.account && (
                          <div className="text-sm text-gray-500 mt-1">
                            <div>
                              Cur Bal: {calculateBalance(entry.account.Pr_Id)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="text-right py-3 align-top">
                        <input
                          type="text"
                          value={entry.debitAmount}
                          onChange={(e) =>
                            handleDebitAmountChange(mainIndex, e.target.value)
                          }
                          ref={(el) =>
                            (debitAmountRefs.current[mainIndex] = el)
                          }
                          className="text-right bg-transparent rounded p-1 w-full text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder={mainIndex == 0 ? "" : "0.00"}
                          onKeyDown={(e) =>
                            handleKeyPress(e, "debitAmount", mainIndex)
                          }
                          disabled={mainIndex == 0}
                          readOnly={mainIndex == 0}
                        />
                      </td>
                      <td className="text-right py-3 align-top">
                        <input
                          type="text"
                          value={entry.creditAmount}
                          onChange={(e) =>
                            handleCreditAmountChange(mainIndex, e.target.value)
                          }
                          ref={(el) =>
                            (creditAmountRefs.current[mainIndex] = el)
                          }
                          className="text-right bg-transparent rounded p-1 w-full text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="0.00"
                          onKeyDown={(e) =>
                            handleKeyPress(e, "creditAmount", mainIndex)
                          }
                          disabled={
                            mainIndex == 0 && entry.account && entry.debitAmount
                          }
                        />
                      </td>
                    </tr>

                    {showSubLedgerDropdownIndex == mainIndex &&
                      entry.account?.Lg_Sub == "yes" && (
                        <tr>
                          <td colSpan="3" className="py-2 pl-8">
                            <div className="relative subledger-dropdown-container">
                              <div className="text-xs font-medium text-gray-500 mb-1">
                                Search Sub-ledger:
                              </div>
                              <input
                                type="text"
                                ref={(el) =>
                                  (subLedgerSearchRefs.current[mainIndex] = el)
                                }
                                value={entry.subLedgerSearch}
                                onChange={(e) =>
                                  handleSubLedgerSearchChange(
                                    mainIndex,
                                    e.target.value,
                                  )
                                }
                                className="w-96 bg-transparent rounded p-1 text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm border border-gray-300"
                                placeholder="Type to search sub-ledgers..."
                                onKeyDown={(e) => {
                                  if (
                                    e.key == "ArrowDown" ||
                                    e.key == "ArrowUp" ||
                                    e.key == "Enter" ||
                                    e.key == "Escape"
                                  ) {
                                    handleSubLedgerDropdownKeyDown(
                                      e,
                                      mainIndex,
                                    );
                                  } else {
                                    handleKeyPress(
                                      e,
                                      "subLedgerSearch",
                                      mainIndex,
                                    );
                                  }
                                }}
                              />

                              {entry.filteredSubLedgers.length > 0 && (
                                <div
                                  className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto w-96"
                                  onKeyDown={(e) =>
                                    handleSubLedgerDropdownKeyDown(e, mainIndex)
                                  }
                                >
                                  {entry.filteredSubLedgers.map(
                                    (subLedger, idx) => (
                                      <div
                                        key={subLedger.SL_Id}
                                        ref={(el) =>
                                          (subLedgerDropdownItemRefs.current[
                                            idx
                                          ] = el)
                                        }
                                        className={`px-4 py-2 text-sm cursor-pointer ${
                                          subLedgerHighlightedIndex == idx
                                            ? "bg-blue-100"
                                            : "hover:bg-blue-50"
                                        }`}
                                        onClick={() =>
                                          handleSubLedgerSelect(
                                            mainIndex,
                                            subLedger,
                                          )
                                        }
                                        tabIndex={0}
                                        onMouseEnter={() =>
                                          setSubLedgerHighlightedIndex(idx)
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
                              id={`subledger-name-${mainIndex}-${subIndex}`}
                              className="flex items-center space-x-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1"
                              onClick={() =>
                                handleSSubLedgerClick(mainIndex, subIndex)
                              }
                              onKeyDown={(e) =>
                                handleKeyPress(
                                  e,
                                  "subLedgerName",
                                  mainIndex,
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
                                    mainIndex,
                                    subIndex,
                                    e.target.value,
                                  )
                                }
                                onBlur={() =>
                                  handleSubLedgerAmountBlur(mainIndex, subIndex)
                                }
                                ref={(el) =>
                                  (subLedgerAmountRefs.current[
                                    `${mainIndex}-${subIndex}`
                                  ] = el)
                                }
                                className="bg-transparent rounded p-1 text-gray-700 font-serif focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm border border-gray-300 w-32 text-right"
                                placeholder="0.00"
                                onKeyDown={(e) =>
                                  handleKeyPress(
                                    e,
                                    "subLedgerAmount",
                                    mainIndex,
                                    subIndex,
                                  )
                                }
                                onClick={() =>
                                  handleSpecificSubLedgerClick(
                                    mainIndex,
                                    subIndex,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </td>
                        <td colSpan="2"></td>
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
                  placeholder="Enter payment narration..."
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
                  onKeyDown={(e) => handleKeyPress(e, "saveButton")}
                  disabled={!canSave || isLoading}
                  className={`px-6 py-3 rounded text-white font-serif text-lg ${
                    canSave && !isLoading
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Saving..." : "Update Payment Voucher"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVoucherEdit;
