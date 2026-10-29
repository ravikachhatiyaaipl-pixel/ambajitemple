import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiCalendar,
  FiDownload,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

const PaymentVoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [pageTitle, setPageTitle] = useState("Payment Vouchers");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/transactions/bookkeeping-vouchers/payment-entries";

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

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, startDate, endDate, vouchers]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/finan-trns/vouchers?Vou_Ty=PAY&V_Mode=G`,
        {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
      );

      if (response.data.success) {
        setVouchers(response.data.data);
        setFilteredVouchers(response.data.data);
      } else {
        setVouchers([]);
        setFilteredVouchers([]);
      }
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      setMessage({ text: "Failed to load payment vouchers", type: "error" });
      setVouchers([]);
      setFilteredVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vouchers];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((voucher) => {
        if (String(voucher.Vou_Id).toLowerCase().includes(query)) return true;

        if (String(voucher.Vou_Id) == query) return true;

        if (formatDate(voucher.Vou_Dt).toLowerCase().includes(query))
          return true;

        const formattedDebit = formatAmount(voucher.sum_dr);
        const formattedCredit = formatAmount(voucher.sum_cr);
        if (formattedDebit.toLowerCase().includes(query)) return true;
        if (formattedCredit.toLowerCase().includes(query)) return true;

        const debitWithoutCommas = formattedDebit.replace(/,/g, "");
        const creditWithoutCommas = formattedCredit.replace(/,/g, "");
        if (debitWithoutCommas.toLowerCase().includes(query)) return true;
        if (creditWithoutCommas.toLowerCase().includes(query)) return true;

        const rawDebit = String(voucher.sum_dr || 0);
        const rawCredit = String(voucher.sum_cr || 0);
        if (rawDebit.toLowerCase().includes(query)) return true;
        if (rawCredit.toLowerCase().includes(query)) return true;

        if (voucher.voucher_rows && voucher.voucher_rows.length > 0) {
          return voucher.voucher_rows.some((row) => {
            const lgName = row.ledger?.Lg_Name?.toLowerCase() || "";
            const lgEngName = row.ledger?.Lg_Eng_Name?.toLowerCase() || "";
            return lgName.includes(query) || lgEngName.includes(query);
          });
        }

        return false;
      });
    }

    if (startDate) {
      filtered = filtered.filter((voucher) => {
        try {
          const voucherDate = new Date(
            voucher.Vou_Dt.split("/").reverse().join("-"),
          );
          const start = new Date(startDate);
          return voucherDate >= start;
        } catch (error) {
          return true;
        }
      });
    }

    if (endDate) {
      filtered = filtered.filter((voucher) => {
        try {
          const voucherDate = new Date(
            voucher.Vou_Dt.split("/").reverse().join("-"),
          );
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return voucherDate <= end;
        } catch (error) {
          return true;
        }
      });
    }

    setFilteredVouchers(filtered);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const parts = dateString.split("/");
      if (parts.length == 3) {
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-GB");
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleDelete = (voucher) => {
    Swal.fire({
      title: "Delete Payment Voucher?",
      html: `
        <div class="text-left">
          <p class="mb-4">Are you sure you want to delete Payment Voucher <strong>${voucher.Vou_Id}</strong>?</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        confirmButton: "mr-2",
        cancelButton: "ml-2",
      },
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await axios.delete(
            `${import.meta.env.VITE_API_URL}/finan-trns/delete-voucher?Vou_Ty=PAY&Vou_Id=${voucher.Vou_Id}`,
            {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
          );

          if (!response.data.success) {
            throw new Error(
              response.data.message || "Failed to delete voucher",
            );
          }

          return response.data;
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error.message}`);
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    })
      .then((result) => {
        if (result.isConfirmed) {
          const updatedVouchers = vouchers.filter(
            (v) => v.Vou_Id != voucher.Vou_Id,
          );
          setVouchers(updatedVouchers);

          const updatedFiltered = filteredVouchers.filter(
            (v) => v.Vou_Id != voucher.Vou_Id,
          );
          setFilteredVouchers(updatedFiltered);

          toast.success(`Voucher #${voucher.Vou_Id} deleted successfully!`, {
            position: "bottom-right",
            autoClose: 3000,
          });
        }
      })
      .catch((error) => {
        console.error("Error in delete confirmation:", error);
      });
  };

  const handleView = (voucherId) => {
    navigate(
      `/transactions/bookkeeping-vouchers/payment-entries/view/${voucherId}`,
    );
  };

  const handleEdit = (voucherId) => {
    navigate(
      `/transactions/bookkeeping-vouchers/payment-entries/edit/${voucherId}`,
    );
  };

  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVouchers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const resetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadExcel = () => {
    try {
      const worksheetData = filteredVouchers.map((voucher) => [
        voucher.Vou_Id,
        formatDate(voucher.Vou_Dt),
        formatAmount(voucher.sum_dr),
        formatAmount(voucher.sum_cr),
        voucher.voucher_rows?.length || 0,
      ]);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ["Voucher ID", "Date", "Total Debit", "Total Credit", "No. of Entries"],
        ...worksheetData,
      ]);

      const wscols = [
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
      ];
      ws["!cols"] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Payment Vouchers");

      const fileName = `Payment_Vouchers_${new Date().toISOString().slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, fileName);

      toast.success("Excel file downloaded successfully!", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel file", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ToastContainer />

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center px-3 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow"
            >
              <FiChevronLeft className="h-5 w-5" />
            </Link>

            <h1 className="text-2xl font-serif font-semibold text-gray-800">
              {pageTitle}
            </h1>
          </div>

          <Link
            to="/transactions/bookkeeping-vouchers/payment-entries/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Create Voucher
          </Link>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type == "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search Voucher ID, Amount, Ledger..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <FiCalendar className="text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="From Date"
            />
          </div>

          <div className="flex items-center space-x-2">
            <FiCalendar className="text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="To Date"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
            >
              <FiX className="mr-2" />
              Clear Filters
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              title="Download Excel"
            >
              <FiDownload className="mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment vouchers...</p>
          </div>
        ) : currentItems.length == 0 ? (
          <div className="p-8 text-center">
            <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {filteredVouchers.length == 0 && vouchers.length > 0
                ? "No vouchers match your filters"
                : "No payment vouchers found"}
            </p>
            {filteredVouchers.length == 0 && vouchers.length > 0 && (
              <button
                onClick={resetFilters}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear filters to see all vouchers
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voucher ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Debit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Credit
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. of Entries
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((voucher) => (
                    <tr key={voucher.Vou_Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {voucher.Vou_Id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(voucher.Vou_Dt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatAmount(voucher.sum_dr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatAmount(voucher.sum_cr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center align-middle">
                        <div className="flex justify-center items-center h-full">
                          {voucher.voucher_rows?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleView(voucher.Vou_Id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(voucher.Vou_Id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(voucher)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage == 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage == totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {indexOfFirstItem + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredVouchers.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredVouchers.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage == 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronLeft className="h-5 w-5" />
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage == pageNum
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage == totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentVoucherList;
