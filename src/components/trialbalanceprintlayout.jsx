/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect } from "react";

const TrialBalancePrint = ({
  title = "Trial Balance Report",
  organizationData,
  orientation = "portrait",
  financialYear,
  startDate,
  endDate,
  trialBalanceData,
  searchQuery = "",
  currentPage = 1,
  itemsPerPage = 15,
}) => {
  const [currentDate] = useState(new Date());

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "0.00";
    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
      .replace(/ /g, "-");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const orgName =
      organizationData?.Org_Name || "Ambaji Temple";
    const fyDisplay = financialYear?.financial_year_name || "2024-25";

    const startDisplay = formatDateDisplay(startDate) || "1-Apr-24";
    const endDisplay = formatDateDisplay(endDate) || "23-Jan-26";
    const dateRange = `${startDisplay} to ${endDisplay}`;

    const grandTotals = trialBalanceData?.reduce(
      (acc, item) => ({
        openingDebit: acc.openingDebit + (item.openingDebit || 0),
        openingCredit: acc.openingCredit + (item.openingCredit || 0),
        closingDebit: acc.closingDebit + (item.closingDebit || 0),
        closingCredit: acc.closingCredit + (item.closingCredit || 0),
      }),
      { openingDebit: 0, openingCredit: 0, closingDebit: 0, closingCredit: 0 },
    ) || {
      openingDebit: 0,
      openingCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    };

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 10px;
              line-height: 1.3;
              color: #000;
              background-color: white;
              margin: 0;
              padding: 15mm 10mm;
            }
            
            @page {
              size: ${orientation == "portrait" ? "A4" : "A4 landscape"};
              margin: 15mm 10mm;
            }
            
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
            }
            
           
            .print-container {
              max-width: 100%;
            }
            
            /* Header styles - appears only once */
            .report-header {
              margin-bottom: 15px;
            }
            
            .municipal-name {
              font-size: 16px;
              font-weight: bold;
              color: #000;
            }
            
            .date-range {
              font-size: 12px;
              color: #333;
              margin-top: 2px;
            }
            
            .report-title {
              font-size: 14px;
              font-weight: bold;
              color: #000;
              text-align: right;
            }
            
            /* Table styles */
            .trial-balance-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            
            /* CRITICAL: Ensure table rows don't break across pages */
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            
            /* Header styling */
            thead {
              display: table-header-group;
            }
            
            tfoot {
              display: table-footer-group;
            }
            
            /* Table header cells */
            .trial-balance-table th {
              font-weight: 600;
              padding: 8px 4px;
              font-size: 10px;
              border-bottom: 2px solid #000;
              border-top: 2px solid #000;
              background-color: #ffffff;
              text-align: center;
            }
            
            /* Data cells */
            .trial-balance-table td {
              padding: 6px 4px;
              vertical-align: top;
              border-bottom: 1px solid #ddd;
            }
            
            /* Column widths */
            .particulars-col {
              text-align: left;
              width: 40%;
            }
            
            .balance-col {
              text-align: center;
              width: 15%;
            }
            
            .amount {
              text-align: right;
              padding-right: 8px;
            }
            
            /* Account name styles */
            .account-name {
              line-height: 1.3;
            }
            
            .gujarati-name {
              font-weight: 500;
              font-size: 10px;
            }
            
            .english-name {
              font-size: 9px;
              color: #555;
            }
            
            .code {
              font-size: 8px;
              color: #888;
            }
            
            /* Grand Total row */
            .grand-total-row {
              background-color: #f0f0f0;
              font-weight: 600;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
            }
            
            .grand-total-label {
              font-weight: 600;
              text-align: left;
              padding-left: 8px;
            }
            
            /* Footer */
            .footer {
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #999;
              font-size: 8px;
              color: #666;
            }
            
            /* Ensure proper spacing */
            .spacer {
              height: 10px;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <!-- Header - appears only once at the beginning -->
            <div class="report-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div class="municipal-name">${orgName} ${fyDisplay} - (from 1-Apr-24)</div>
                <div class="date-range">Trial Balance : ${dateRange}</div>
              </div>
              <div>
                <div class="report-title">${title}</div>
              </div>
            </div>

            <!-- Main Table with all data - no forced page breaks -->
            <table class="trial-balance-table">
              <thead>
                <tr>
                  <th class="particulars-col">Particulars</th>
                  <th colspan="2" class="balance-col">Opening Balance</th>
                  <th colspan="2" class="balance-col">Closing Balance</th>
                </tr>
                <tr>
                  <th></th>
                  <th class="amount">Debit</th>
                  <th class="amount">Credit</th>
                  <th class="amount">Debit</th>
                  <th class="amount">Credit</th>
                </tr>
              </thead>
              <tbody>
                ${trialBalanceData
                  ?.map(
                    (item) => `
                  <tr>
                    <td class="particulars-col">
                      <div class="account-name">
                        ${item.ledgerGujName ? `<div class="gujarati-name">${item.ledgerGujName}</div>` : ""}
                        ${item.ledgerEngName ? `<div class="english-name">${item.ledgerEngName}</div>` : ""}
                        ${item.code ? `<div class="code">Code: ${item.code}</div>` : ""}
                      </div>
                    </td>
                    <td class="amount">${formatCurrency(item.openingDebit)}</td>
                    <td class="amount">${formatCurrency(item.openingCredit)}</td>
                    <td class="amount">${formatCurrency(item.closingDebit)}</td>
                    <td class="amount">${formatCurrency(item.closingCredit)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <!-- Grand Total Row -->
                <tr class="grand-total-row">
                  <td class="grand-total-label">Grand Total</td>
                  <td class="amount">${formatCurrency(grandTotals.openingDebit)}</td>
                  <td class="amount">${formatCurrency(grandTotals.openingCredit)}</td>
                  <td class="amount">${formatCurrency(grandTotals.closingDebit)}</td>
                  <td class="amount">${formatCurrency(grandTotals.closingCredit)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Footer -->
            <div class="footer">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  ${searchQuery ? `Filtered by: "${searchQuery}"` : "All accounts shown"}
                  ${trialBalanceData ? ` | Total Accounts: ${trialBalanceData.length}` : ""}
                </div>
                <div>
                  Generated: ${formatDate(currentDate)} | Report ID: ${Date.now()}
                </div>
              </div>
            </div>
          </div>

          <!-- Print-specific scripts -->
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();

    printWindow.focus();
  };

  useEffect(() => {
    handlePrint();
  }, []);

  return (
    <div style={{ display: "none" }}>
      {/* This div won't be visible - print dialog will open automatically */}
    </div>
  );
};

export default TrialBalancePrint;
