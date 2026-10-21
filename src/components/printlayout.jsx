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

import { useEffect } from "react";
import { toast } from "react-hot-toast";

const PrintLayout = ({
  children,
  title = "Report",
  showControls = true,
  onClose,
  organizationData,
  orientation = "portrait",
  onOrientationChange,
  backgroundImage = "/AMT_ambajimatatemple.png",
  watermarkOpacity = 0.08,
  watermarkSize = "medium",
}) => {
  // Get watermark size based on selection (BIGGER SIZES)
  const getWatermarkSizeStyle = () => {
    switch (watermarkSize) {
      case "small":
        return { width: "250px", height: "auto" };
      case "medium":
        return { width: "400px", height: "auto" };
      case "large":
      default:
        return { width: "550px", height: "auto" };
    }
  };

  // Get background size for print CSS
  const getBackgroundSize = () => {
    switch (watermarkSize) {
      case "small":
        return "250px";
      case "medium":
        return "400px";
      case "large":
      default:
        return "550px";
    }
  };

  const handlePrint = () => {
    if (!children) {
      toast.error("Print content not found");
      return;
    }

    const printWindow = window.open("", "_blank");

    console.log("Anand1417", organizationData?.Org_Name)
    const orgName = organizationData?.Org_Name || "Ambaji Temple";
    const orgAddress = organizationData?.Org_Address || "Shri Arasuri Ambaji Mata Devasthan Trust, Ambaji";
    const orgCity = organizationData?.Org_City || "Ambaji";
    const orgState = organizationData?.Org_State || "Gujarat";
    const orgPin = organizationData?.Org_Pin
      ? ` - ${organizationData.Org_Pin}`
      : "";
    const orgEmail = organizationData?.Org_Email
      ? `Email: ${organizationData.Org_Email}`
      : "";
    const orgMobile = organizationData?.Org_Mobile
      ? ` | Contact: ${organizationData.Org_Mobile}`
      : " ";
    const orgGST = organizationData?.Org_GST_No
      ? ` | GST: ${organizationData.Org_GST_No}`
      : "24AAAGM0007N1ZM";

    const backgroundSizeValue = getBackgroundSize();

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
        
          <title></title>
          
          <meta charset="UTF-8">
          <meta name="theme-color" content="#ffffff">
          <meta name="supported-color-schemes" content="light">
          <style>
            /* Reset and base styles */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 11px;
              line-height: 1.4;
              color: #000;
              padding: 15mm;
              background-color: white;
              position: relative;
            }
            
            /* Government Document Style Watermark - LARGE Centered Logo on EVERY PAGE */
            body::before {
              content: "";
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url('${backgroundImage}');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: ${backgroundSizeValue};
              opacity: ${watermarkOpacity};
              pointer-events: none;
              z-index: -1;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Optional: Add a faint border pattern like government documents */
            body::after {
              content: "";
              position: fixed;
              top: 5mm;
              left: 5mm;
              right: 5mm;
              bottom: 5mm;
              border: 0.5px solid rgba(0, 0, 0, 0.05);
              pointer-events: none;
              z-index: -1;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            @page {
              size: ${orientation == "portrait" ? "A4 portrait" : "A4 landscape"};
              margin: 10mm 15mm 20mm 15mm;
              
              @top-left { content: ""; }
              @top-right { content: ""; }
              @top-center { content: ""; }
              
              @bottom-left {
                content: "Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} \A Time: ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}   This is computer generated report";
                white-space: pre;
                font-size: 9px;
                color: #000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              }
              
              @bottom-right {
                content: counter(page) " / " counter(pages);
                font-size: 9px;
                color: #000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              }
            }
            
            @media print {
              body {
                padding: 0 !important;
                margin: 0 !important;
              }
              
              /* Ensure background image prints on EVERY page */
              body::before {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                opacity: ${watermarkOpacity} !important;
                position: fixed !important;
              }
              
              body::after {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              .no-print {
                display: none !important;
              }
              
              /* Force colors to print */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            
            /* Header styles */
            .print-header {
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
              position: relative;
              z-index: 1;
              background-color: rgba(255, 255, 255, 0.88);
            }
            
            .org-name {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              margin-bottom: 4px;
            }
            
            .org-details {
              font-size: 10px;
              color: #444;
              line-height: 1.3;
            }
            
            .report-title {
              font-size: 14px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 4px;
            }
            
            .report-date {
              font-size: 10px;
              color: #666;
            }
            
            /* Content styles */
            .print-content {
              margin-top: 10px;
              position: relative;
              z-index: 1;
              background-color: rgba(255, 255, 255, 0.88);
            }
            
            .section {
              margin: 0;
              padding: 0;
            }
            
            .section-title {
              background-color: #f3f4f6 !important;
              padding: 6px 8px !important;
              margin: 8px 0 !important;
              font-weight: 600 !important;
              border-left: 3px solid #d1d5db !important;
              font-size: 12px !important;
              color: #1f2937 !important;
            }
            
            /* Table styles */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 0 !important;
              font-size: 10px !important;
            }
            
            th {
              font-weight: 600 !important;
              padding: 4px 6px !important;
              border: 1px solid #d1d5db !important;
            }
            
            td {
              padding: 4px 6px !important;
              border: 1px solid #d1d5db !important;
              vertical-align: top !important;
            }
            
            td.no-border {
              border: none !important;
            }
            
            .text-bold {
              font-weight: 600 !important;
            }
            
            .text-center {
              text-align: center !important;
            }
            
            .text-right {
              text-align: right !important;
            }
            
            .currency {
              font-family: 'Courier New', monospace !important;
            }
            
           
            .grid-container {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 8px !important;
              margin: 8px 0 !important;
            }
            
            .grid-item {
              border: 1px solid #e5e7eb !important;
              padding: 8px !important;
              border-radius: 4px !important;
              background-color: #f9fafb !important;
            }
            
           
            .status-active {
              color: #059669 !important;
              font-weight: 600 !important;
            }
            
            .status-inactive {
              color: #dc2626 !important;
              font-weight: 600 !important;
            }
            
            
       
            /* Print Footer - Add horizontal line */
            .print-footer {
              border-top: 1px solid #d1d5db !important;
              padding-top: 8px !important;
              margin-top: 20px !important;
              font-size: 9px !important;
              color: #6b7280 !important;
              position: relative;
              z-index: 1;
              background-color: rgba(255, 255, 255, 0.88);
            }
            
            .footer-info {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
            }
            
           
            .mt-1 { margin-top: 4px !important; }
            .mt-2 { margin-top: 8px !important; }
            .mb-1 { margin-bottom: 4px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .col-span-2 { grid-column: span 2 !important; }
            .border-b { border-bottom: 1px solid #e5e7eb !important; }
            .p-2 { padding: 8px !important; }
            
           
            .bg-blue-100 { background-color: #FFCDD2 !important; }
            .bg-blue-50 { background-color: #ffffff !important; }
            .bg-green-100 { background-color: #d1fae5 !important; }
            .bg-green-50 { background-color: #f0fdf4 !important; }
            .bg-red-100 { background-color: #fee2e2 !important; }
            .bg-red-50 { background-color: #fef2f2 !important; }
            .bg-yellow-100 { background-color: #fef3c7 !important; }
            .bg-yellow-50 { background-color: #fffbeb !important; }
            .bg-purple-100 { background-color: #f3e8ff !important; }
            .bg-purple-50 { background-color: #faf5ff !important; }
            .bg-indigo-100 { background-color: #FFCDD2 !important; }
            .bg-indigo-50 { background-color: #ffffff !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-gray-100 { background-color: #f3f4f6 !important; }
            .bg-gray-200 { background-color: #e5e7eb !important; }
            .bg-white { background-color: white !important; }
            
            
            .text-blue-600 { color: #E53935 !important; }
            .text-green-600 { color: #059669 !important; }
            .text-red-600 { color: #dc2626 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-gray-900 { color: #111827 !important; }
            
            
            .border-blue-200 { border-color: #bfdbfe !important; }
            .border-gray-200 { border-color: #e5e7eb !important; }
            .border-green-200 { border-color: #bbf7d0 !important; }
            .border-red-200 { border-color: #fecaca !important; }
            .border-yellow-200 { border-color: #fde68a !important; }
            .border-purple-200 { border-color: #e9d5ff !important; }
            
            
            .shadow-lg, .shadow-sm, .shadow-md, .shadow {
              box-shadow: none !important;
            }
            
           
            table, th, td {
              border-color: #d1d5db;
            }
            
           
            *[style] {
              /* Preserve inline styles */
            }
            
           
            body * {
              visibility: visible !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container" style="width: 100%;">
            <!-- Header -->
            <div class="print-header">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <!-- Left: Logo -->
                <div style="flex-shrink: 0;">
                  <img src="${backgroundImage}" alt="Logo" style="width: 80px; height: 80px; object-fit: contain;" />
                </div>
                <!-- Right: Org Info -->
                <div style="text-align: right;">
                  <div class="org-name">${orgName}</div>
                  <div class="org-details">
                    ${orgAddress} ${orgCity} ${orgState}${orgPin}
                  </div>
                  <div class="org-details" style="margin-top: 4px;">
                    ${orgEmail}${orgMobile}${orgGST}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Content -->
            <div class="print-content">
              <div style="font-size: 11px; line-height: 1.4;">
                <div id="print-content-placeholder"></div>
              </div>
            </div>
            

          
          </div>
          
          <script>
            try {
              const content = window.opener.document.querySelector('.print-preview-content');
              if (content) {
                document.getElementById('print-content-placeholder').innerHTML = content.innerHTML;
              }
            } catch (e) {
              console.error('Could not get content from parent:', e);
            }
            
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }, 500);
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();

    onClose();
  };

  useEffect(() => {
    handlePrint();
  }, []);

  return (
    <div className="print-preview-content" style={{ display: "none" }}>
      {children}
    </div>
  );
};

export default PrintLayout;
