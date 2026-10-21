"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ProfitLossPage = ({ ledgerGroupData = [] }) => {
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [gifiCodes, setGifiCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Organisation state
  const [organisationData, setOrganisationData] = useState([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const fetchAllData = async () => {
    if (!selectedOrganisation) {
      console.log("No organisation selected");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let summaryData;

      if (ledgerGroupData.length > 0) {
        summaryData = ledgerGroupData;
      } else {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/finan-trns/summary`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
        );

        if (response.data.success && response.data.data) {
          summaryData = response.data.data;
        } else {
          summaryData = [];
        }
      }

      // Fetch ledger groups to get status information
      const groupsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      // Create a map of group code to group status
      const groupStatusMap = {};
      if (groupsResponse.data.status == "success" && groupsResponse.data.data) {
        groupsResponse.data.data.forEach((group) => {
          groupStatusMap[group.Gr_Cd] = group.Gr_St;
        });
      }

      const mappedGroups = summaryData
        .filter(
          (group) =>
            (group?.GroupCode?.startsWith("03") ||
              group?.GroupCode?.startsWith("04")) &&
            String(group.Org_Id) == String(selectedOrganisation?.id),
        )
        .map((group, idx) => ({
          gr_code: group.GroupCode || `unknown-${idx}`,
          gr_nm: group.GroupName || "Unknown Group",
          // Use GroupStatus from API, fallback to 3, then to mapped status
          gr_stt:
            group.GroupStatus ||
            groupStatusMap[group.GroupCode]?.toString() ||
            "3",
          totalCr: Number.parseFloat(group.TotalCredit || 0).toFixed(2),
          totalDr: Number.parseFloat(group.TotalDebit || 0).toFixed(2),
        }))
        .sort((a, b) => a.gr_code.localeCompare(b.gr_code));

      console.log(
        "Filtered ledger groups for org",
        selectedOrganisation.id,
        ":",
        mappedGroups,
      );
      setLedgerGroups(mappedGroups);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err.message, err.response?.status);
      setError(
        err.response?.status == 404
          ? "Financial summary data not found. Please check the API endpoint."
          : `Failed to load data: ${err.message}`,
      );
      setLedgerGroups([]);
      setLoading(false);
    }
  };

  const fetchGifiCodes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      const gifiMap = {};
      if (response.data.status == "success" && response.data.data) {
        response.data.data.forEach((group) => {
          if (group.Gr_Cd) {
            gifiMap[group.Gr_Cd] = group.Gr_Cd;
          }
        });
      }
      setGifiCodes(gifiMap);
    } catch (err) {
      console.error("Error fetching GIFI codes:", err);
    }
  };

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

      if (response.data.success && response.data.data) {
        const orgData = response.data.data.map((org) => ({
          id: org.Org_Id,
          name: org.Org_Name,
          code: org.Org_Code,
        }));

        setOrganisationData(orgData);

        // Check localStorage for previously selected organisation
        const storedOrg = JSON.parse(
          localStorage.getItem("selectedOrganisation"),
        );
        if (storedOrg && orgData.some((org) => org.id == storedOrg.id)) {
          setSelectedOrganisation(storedOrg);
          console.log("Using stored organisation:", storedOrg);
        } else if (orgData.length > 0) {
          const defaultOrg = {
            id: orgData[0].id,
            name: orgData[0].name,
            code: orgData[0].code,
          };
          setSelectedOrganisation(defaultOrg);
          localStorage.setItem(
            "selectedOrganisation",
            JSON.stringify(defaultOrg),
          );
          console.log("Using default organisation:", defaultOrg);
        }
      } else {
        throw new Error("Invalid organisation data format");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching organisation data:", err);
      setError("Failed to load organisation data");
      setLoading(false);
    }
  };

  const handleOrganisationSelect = (org) => {
    const selectedOrg = {
      id: org.id,
      name: org.name,
      code: org.code,
    };
    setSelectedOrganisation(selectedOrg);
    localStorage.setItem("selectedOrganisation", JSON.stringify(selectedOrg));
    setIsOrgDropdownOpen(false);
    console.log("Organisation selected:", selectedOrg);
  };

  useEffect(() => {
    fetchOrganisationData();
    fetchGifiCodes();
  }, []);

  useEffect(() => {
    if (selectedOrganisation) {
      fetchAllData();
    }
  }, [selectedOrganisation]);

  const calculateLedgerGroupBalance = (group) => {
    const totalCr = Number.parseFloat(group.totalCr) || 0;
    const totalDr = Number.parseFloat(group.totalDr) || 0;
    const balance = totalCr - totalDr;
    return balance.toFixed(2);
  };

  const calculateSectionTotals = (sectionPrefix) => {
    const sectionGroups = ledgerGroups.filter((group) =>
      group.gr_code?.startsWith(sectionPrefix),
    );
    let sectionBalance = 0;

    sectionGroups.forEach((group) => {
      const balance = calculateLedgerGroupBalance(group);
      sectionBalance += Number.parseFloat(balance);
    });

    return { balance: sectionBalance.toFixed(2) };
  };

  const incomeTotals = calculateSectionTotals("03");
  const expenseTotals = calculateSectionTotals("04");
  const netProfit = (
    Number(incomeTotals.balance) - Number(expenseTotals.balance)
  ).toFixed(2);

  const getIndentationStyle = (grStt) => {
    const grSttNum = Number.parseInt(grStt);
    switch (grSttNum) {
      case 1:
        return {
          name: "pl-4 font-bold text-black",
          balance: "pr-71 font-bold text-black",
        };
      case 2:
        return {
          name: "pl-8 text-blue-700 font-bold",
          balance: "pr-72 text-blue-700 font-bold",
        };
      case 3:
        return {
          name: "pl-18 text-red-600 font-medium",
          balance: "pr-[550px] text-red-600 font-medium",
        };
      case 4:
        return {
          name: "pl-26 text-blue-400 font-medium",
          balance: "pr-[600px] text-blue-400 font-medium",
        };
      default:
        return { name: "pl-0 text-gray-500", balance: "pr-0 text-gray-500" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-center border-b p-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <ArrowLeft className="mr-1" /> Back to Dashboard
            </button>
          </div>

          <div className="p-4">
            {!selectedOrganisation ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-gray-500 mb-4">
                  Please select an organisation
                </div>
                {organisationData.length > 0 && (
                  <>
                    <button
                      onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                    >
                      Select Organisation
                    </button>
                    {isOrgDropdownOpen && (
                      <div className="absolute mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        {organisationData.map((org) => (
                          <div
                            key={org.id}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleOrganisationSelect(org)}
                          >
                            <div className="font-medium">{org.name}</div>
                            <div className="text-xs text-gray-500">
                              {org.code}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">{error}</div>
            ) : ledgerGroups.length == 0 ? (
              <div className="text-gray-500 text-center p-4">
                No data found for selected organisation. Check And Correct
                Account Grouping
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8/12">
                        GIFI Code
                      </th>
                      <th className="px-6 py-3 pr-72 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Income Section */}
                    <tr className="bg-gray-100">
                      <td
                        colSpan={3}
                        className="px-6 py-2 text-left text-sm font-bold text-gray-900 uppercase"
                      >
                        Income
                      </td>
                    </tr>

                    {ledgerGroups
                      .filter((group) => group.gr_code?.startsWith("03"))
                      .map((group, index) => (
                        <tr
                          key={`income-${group.gr_code}-${index}`}
                          className={index % 2 == 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                            {group.gr_code}
                          </td>
                          <td
                            className={`px-6 py-2 whitespace-nowrap text-sm ${
                              getIndentationStyle(group.gr_stt).name
                            }`}
                          >
                            {gifiCodes[group.gr_code]
                              ? `[${gifiCodes[group.gr_code]}]`
                              : ""}{" "}
                            {group.gr_nm}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-right">
                            <span
                              className={`inline-block ${
                                getIndentationStyle(group.gr_stt).balance
                              }`}
                            >
                              {Math.abs(
                                Number.parseFloat(
                                  calculateLedgerGroupBalance(group),
                                ),
                              ).toLocaleString("en-IN")}
                            </span>
                          </td>
                        </tr>
                      ))}

                    {/* Total Income */}
                    <tr className="bg-gray-200 font-bold border-t-2 border-gray-300">
                      <td className="py-2 text-left text-sm text-gray-900"></td>
                      <td className="-pl-12 py-2 text-left text-sm text-gray-900">
                        TOTAL INCOME
                      </td>
                      <td className="px-6 py-2 text-right text-sm pr-78 text-black">
                        {Math.abs(
                          Number.parseFloat(incomeTotals.balance),
                        ).toLocaleString("en-IN")}
                      </td>
                    </tr>

                    {/* Expense Section */}
                    <tr className="bg-gray-100">
                      <td
                        colSpan={3}
                        className="px-6 py-2 text-left text-sm font-bold text-gray-900 uppercase"
                      >
                        Expenses
                      </td>
                    </tr>

                    {ledgerGroups
                      .filter((group) => group.gr_code?.startsWith("04"))
                      .map((group, index) => (
                        <tr
                          key={`expense-${group.gr_code}-${index}`}
                          className={index % 2 == 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                            {group.gr_code}
                          </td>
                          <td
                            className={`px-6 py-2 whitespace-nowrap text-sm ${
                              getIndentationStyle(group.gr_stt).name
                            }`}
                          >
                            {gifiCodes[group.gr_code]
                              ? `[${gifiCodes[group.gr_code]}]`
                              : ""}{" "}
                            {group.gr_nm}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-right">
                            <span
                              className={`inline-block ${
                                getIndentationStyle(group.gr_stt).balance
                              }`}
                            >
                              {Math.abs(
                                Number.parseFloat(
                                  calculateLedgerGroupBalance(group),
                                ),
                              ).toLocaleString("en-IN")}
                            </span>
                          </td>
                        </tr>
                      ))}

                    {/* Total Expenses */}
                    <tr className="bg-gray-200 font-bold border-t-2 border-gray-300">
                      <td className="px-0 py-2 text-left text-sm text-gray-900"></td>
                      <td className="px-0 py-2 text-left text-sm text-gray-900">
                        TOTAL EXPENSES
                      </td>
                      <td className="px-6 py-2 text-right text-sm pr-78 text-black">
                        {Math.abs(
                          Number.parseFloat(expenseTotals.balance),
                        ).toLocaleString("en-IN")}
                      </td>
                    </tr>

                    {/* Net Profit/Loss */}
                    <tr className="bg-blue-50 font-bold border-t-2 border-blue-300">
                      <td className="px-0 py-2 text-left text-sm"></td>
                      <td className="px-0 py-2 text-left text-sm text-blue-700">
                        NET{" "}
                        {Number.parseFloat(netProfit) >= 0 ? "PROFIT" : "LOSS"}
                      </td>
                      <td className="px-6 py-2 text-right text-sm pr-78 text-blue-700">
                        {Math.abs(Number.parseFloat(netProfit)).toLocaleString(
                          "en-IN",
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossPage;
