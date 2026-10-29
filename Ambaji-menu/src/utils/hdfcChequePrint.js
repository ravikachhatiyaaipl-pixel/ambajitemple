// utils/hdfcChequePrint.js

/**
 * Pre-printed Indian cheque overlay (CTS-2010).
 * Physical size: 8 in × 3.66 in (≈203 mm × 93 mm)
 * Printing: Vertical orientation (top to bottom)
 */

export const CHEQUE_SIZE = { widthMm: 203, heightMm: 93, widthIn: 8, heightIn: 3.66 };

export const CHEQUE_TYPES = ["Self", "Bearer", "A/c Payee"];

export const SBI_LAYOUT = {
  date: { left: 60, top: 5, letterSpacing: "0.1em", fontSizePt: 13 },
  payee: { top: 8, left: 45, fontSizePt: 14 },
  amountFigures: { left: 160, top: 20, fontSizePt: 16 },
  amountWordsLine1: { top: 15, left: 45, fontSizePt: 12 },
  amountWordsLine2: { top: 22, left: 45, fontSizePt: 12 },
  crossing: { top: 8, left: 8, rotation: -45 },
  self: { top: 8, left: 8, rotation: -45 },
};

const KOTAK_LAYOUT = {
  date: { left: 160, top: 5, letterSpacing: "0.35em", fontSizePt: 10 },
  payee: { top: 10, left: 65, fontSizePt: 11 },
  amountFigures: { left: 160, top: 20, fontSizePt: 12 },
  amountWordsLine1: { top: 18, left: 75, fontSizePt: 9 },
  amountWordsLine2: { top: 24, left: 75, fontSizePt: 9 },
  crossing: { top: 8, left: 8, rotation: -45 },
  self: { top: 8, left: 8, rotation: -45 },
};

const wrapLayout = (layout) => ({
  ...layout,
  acPayee: layout.crossing,
});

export const getBankLayout = (bankKey) => {
  switch (bankKey) {
    case "SBI":
      return wrapLayout(SBI_LAYOUT);
    case "KOTAK":
      return wrapLayout(KOTAK_LAYOUT);
    default:
      return wrapLayout(KOTAK_LAYOUT);
  }
};

export const SUPPORTED_BANKS = [
  { key: "SBI", name: "State Bank of India" },
  { key: "KOTAK", name: "Kotak Mahindra Bank" },
];

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const parseChequeDate = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput == "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(dateInput);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatChequeDateDigits = (dateInput, bankKey = "KOTAK") => {
  const d = parseChequeDate(dateInput);
  if (!d) return "        ";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());

  if (bankKey == "SBI") {
    return `${dd}${mm}${yyyy}`.split("").join("\u00A0");
  }
  return `${dd} ${mm} ${yyyy}`;
};

export const splitAmountInWords = (text, maxLine1 = 42) => {
  const t = String(text || "")
    .replace(/\s*Rupees\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return { line1: "", line2: "" };
  if (t.length <= maxLine1) return { line1: t, line2: "" };
  const idx = t.lastIndexOf(" ", maxLine1);
  const splitAt = idx > 18 ? idx : maxLine1;
  return { line1: t.slice(0, splitAt).trim(), line2: t.slice(splitAt).trim() };
};

export const getChequeCrossingLabel = (chequeType) => {
  switch (chequeType) {
    case "A/c Payee":
      return "A/C PAYEE";
    case "Bearer":
      return "";
    case "Self":
      return "SELF";
    default:
      return String(chequeType || "").toUpperCase();
  }
};

export const formatChequeAmountFigures = (amount) => {
  const n = parseFloat(amount) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const mm = (value) => `${value}mm`;

export const printChequeHtml = (html) =>
  new Promise((resolve, reject) => {
    try {
      const printWin = window.open("", "_blank", "width=860,height=480");
      if (!printWin) {
        reject(new Error("Pop-up blocked. Allow pop-ups to print cheque."));
        return;
      }
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      setTimeout(() => {
        printWin.focus();
        resolve(printWin);
      }, 500);
    } catch (error) {
      reject(error);
    }
  });

export const CHEQUE_FEED_MODES = [
  { key: "vertical", label: "Insert cheque VERTICALLY - prints top to bottom" },
];

export const buildChequePrintHtml = ({
  payeeName = "",
  amount = 0,
  amountInWords = "",
  chequeType = "A/c Payee",
  chequeDate = "",
  bankLayout = null,
  offsetTopMm = 0,
  offsetLeftMm = 0,
  bankKey = "KOTAK",
}) => {
  const layout = bankLayout || getBankLayout(bankKey);
  const { widthMm, heightMm } = CHEQUE_SIZE;

  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const centerY = 10;

  const safePayee = String(payeeName || "").trim() || "\u00A0";
  const dateDigits = formatChequeDateDigits(chequeDate, bankKey);
  const amountFigures = formatChequeAmountFigures(amount);
  const { line1, line2 } = splitAmountInWords(String(amountInWords || "").trim());
  const crossing = getChequeCrossingLabel(chequeType);

  let displayCrossing = crossing;
  let showSelfDiagonal = false;

  if (chequeType && chequeType.toLowerCase() == "self") {
    showSelfDiagonal = false;
    displayCrossing = "";
  } else if (chequeType == "Bearer") {
    displayCrossing = "";
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Cheque Print</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0mm;
    }

    body {
      background: white;
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .cheque-container {
      margin-top: ${centerY + offsetTopMm}mm;
      margin-left: ${offsetLeftMm}mm;
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      transform: rotate(90deg);
      position: relative;
    }

    .field {
      position: absolute;
      font-weight: bold;
      color: black;
    }

    .date-field {
      left: ${mm(layout.date.left)};
      top: ${mm(layout.date.top)};
      font-family: "Courier New", Courier, monospace;
      font-size: ${layout.date.fontSizePt}pt;
      letter-spacing: ${layout.date.letterSpacing};
      white-space: nowrap;
    }

    .payee-field {
      top: ${mm(layout.payee.top)};
      left: ${mm(layout.payee.left)};
      font-family: Arial, sans-serif;
      font-size: ${layout.payee.fontSizePt}pt;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .amount-figures {
      left: ${mm(layout.amountFigures.left)};
      top: ${mm(layout.amountFigures.top)};
      font-family: Arial, sans-serif;
      font-size: ${layout.amountFigures.fontSizePt}pt;
      white-space: nowrap;
    }

    .amount-words-1 {
      top: ${mm(layout.amountWordsLine1.top)};
      left: ${mm(layout.amountWordsLine1.left)};
      font-family: Arial, sans-serif;
      font-size: ${layout.amountWordsLine1.fontSizePt}pt;
      white-space: nowrap;
    }

    .amount-words-2 {
      top: ${mm(layout.amountWordsLine2.top)};
      left: ${mm(layout.amountWordsLine2.left)};
      font-family: Arial, sans-serif;
      font-size: ${layout.amountWordsLine2.fontSizePt}pt;
      white-space: nowrap;
    }

    .crossing-field {
      top: ${mm(layout.crossing.top)};
      left: ${mm(layout.crossing.left)};
      font-family: Arial, sans-serif;
      font-size: 9pt;
      font-weight: bold;
      transform: rotate(-45deg);
      transform-origin: top left;
      white-space: nowrap;
    }

    .self-diagonal {
      top: ${mm(layout.self.top)};
      left: ${mm(layout.self.left)};
      font-family: Arial, sans-serif;
      font-size: 11pt;
      font-weight: bold;
      transform: rotate(-45deg);
      transform-origin: top left;
      white-space: nowrap;
    }

    .toolbar {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      padding: 10px 20px;
      border-radius: 10px;
      display: flex;
      gap: 10px;
      z-index: 1000;
      font-family: system-ui;
    }
    .toolbar button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    }
    .print-btn { background: #EF5350; color: white; }
    .close-btn { background: #6b7280; color: white; }
    .instruction {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #fef3c7;
      color: #92400e;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-family: system-ui;
      z-index: 1000;
      white-space: nowrap;
    }

    @media print {
      .toolbar, .instruction {
        display: none !important;
      }
    }


.sbi-date-fmt{
  margin-left:450px !important;
  top:-235px !important;
  letter-spacing:12px !important;
  position:absolute !important;
  font-size:14px !important;
 
}

.sbi-amnt-fmt{
  margin-left:450px !important;
  position:absolute !important;
    top:-80px !important;
    font-size:20px !important;
}

.amount-words-1 { margin-top:-168px !important; margin-left:70px !important; font-size:16px !important;}
.amount-words-2 { margin-top:-168px !important; margin-left:18px !important; font-size:16px !important;}
.payee-field { margin-top:-210px !important; margin-left:30px !important; font-size:20px !important;}
.self-diagonal { margin-left:160px !important; margin-top:-225px !important; font-size:20px !important}
  </style>
</head>
<body>
  <div class="instruction">
    Insert cheque VERTICALLY | Scale: 100% | Margins: None
  </div>

  <div class="cheque-container" style="position:relative">
    ${showSelfDiagonal ? '<div class="field self-diagonal">SELF</div>' : ""}
    ${!showSelfDiagonal && displayCrossing ? `<div class="field crossing-field">${escapeHtml(displayCrossing)}</div>` : ""}
    <div class="field date-field sbi-date-fmt" >${dateDigits}</div>
    <div class="field payee-field">${escapeHtml(safePayee)}</div>
    <div class="field amount-figures sbi-amnt-fmt">${escapeHtml(amountFigures)}</div>
    <div class="field amount-words-1" >${escapeHtml(line1)}</div>
    ${line2 ? `<div class="field amount-words-2" >${escapeHtml(line2)}</div>` : ""}
  </div>

  <div class="toolbar">
    <button class="print-btn" onclick="window.print()">Print Cheque</button>
    <button class="close-btn" onclick="window.close()">Close</button>
  </div>
</body>
</html>`;
};

const toNum = (value, fallback = 0) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

const isPrintEnabled = (value, defaultOn = true) => {
  if (value ==  undefined || value ==  null || value ==  "") return defaultOn;
  return value ==  true || value ==  1 || value ==  "1" || value ==  "true";
};

export const formatChequeDateByPattern = (dateInput, dateFormat = "DD/MM/YYYY") => {
  const d = parseChequeDate(dateInput);
  if (!d) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  const monthShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][d.getMonth()];

  switch (dateFormat) {
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "DD MMM YYYY":
      return `${day} ${monthShort} ${year}`;
    case "DDMMYYYY":
      return `${day}${month}${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD-MMM-YYYY":
      return `${day}-${monthShort}-${year}`;
    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
};

export const findChequeBookForCheque = (cheque, chequeBooks = []) => {
  const bookId = cheque?.cheque_book_id ?? cheque?.cheque_book?.cheque_book_id;
  if (bookId == null || bookId ==  "") return null;
  return (
    chequeBooks.find((book) => Number(book.cheque_book_id) ==  Number(bookId)) ||
    null
  );
};

export const resolveChequeFormat = (
  cheque,
  chequeBooks = [],
  chequeFormats = [],
) => {
  const book = findChequeBookForCheque(cheque, chequeBooks);
  if (book?.cheque_format) return book.cheque_format;

  const formatId =
    cheque?.cheque_format_id ||
    book?.cheque_format_id ||
    cheque?.cheque_book?.cheque_format_id ||
    cheque?.cheque_format?.cheque_format_id;

  if (formatId != null && formatId !=   "") {
    const fromList = chequeFormats.find(
      (fmt) => Number(fmt.cheque_format_id) ==  Number(formatId),
    );
    if (fromList) return fromList;
  }

  if (cheque?.cheque_format) return cheque.cheque_format;
  return null;
};

const buildAmountWordsText = (amountInWords, wordsSuffix) => {
  let text = String(amountInWords || "").trim();
  const suffix = String(wordsSuffix || "").trim();
  if (!text) return suffix;
  if (suffix && !text.toLowerCase().endsWith(suffix.toLowerCase())) {
    text = `${text} ${suffix}`.trim();
  }
  return text;
};

const fieldBoxStyle = ({
  x,
  y,
  width,
  height,
  leftMargin,
  topMargin,
  fontSize,
  fontFamily,
  fontWeight,
  color,
  extra = "",
}) =>
  [
    `left:${mm(leftMargin + x)}`,
    `top:${mm(topMargin + y)}`,
    `width:${mm(width)}`,
    `height:${mm(height)}`,
    `font-size:${toNum(fontSize, 11)}pt`,
    `font-family:'${escapeHtml(fontFamily || "Arial")}', sans-serif`,
    `font-weight:${escapeHtml(fontWeight || "normal")}`,
    `color:${escapeHtml(color || "#000000")}`,
    extra,
  ]
    .filter(Boolean)
    .join(";");

export const buildDynamicChequePrintHtml = ({
  format,
  payeeName = "",
  amount = 0,
  amountInWords = "",
  chequeDate = "",
}) => {
  if (!format) {
    throw new Error("Cheque format is required for printing.");
  }

  const pageWidth = toNum(format.page_width_mm, 210);
  const pageHeight = toNum(format.page_height_mm, 99);
  const leftMargin = toNum(format.left_margin_mm, 0);
  const topMargin = toNum(format.top_margin_mm, 0);
  const formatName = format.format_name || "Cheque";

  const dateText = formatChequeDateByPattern(
    chequeDate,
    format.date_format || "DD/MM/YYYY",
  );
  const amountFigures = [
    format.amount_prefix || "",
    formatChequeAmountFigures(amount),
    format.amount_suffix || "",
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const wordsText = buildAmountWordsText(amountInWords, format.words_suffix);
  const safePayee = String(payeeName || "").trim() || "\u00A0";
  const dateSpacing = toNum(format.date_char_spacing, 0);

  const dateField =
    isPrintEnabled(format.print_date) &&
    `<div class="field" style="${fieldBoxStyle({
      x: toNum(format.date_x),
      y: toNum(format.date_y),
      width: toNum(format.date_width, 60),
      height: toNum(format.date_height, 10),
      leftMargin,
      topMargin,
      fontSize: format.date_font_size,
      fontFamily: format.date_font_family,
      fontWeight: format.date_font_weight,
      color: format.date_color,
      extra: `letter-spacing:${dateSpacing}mm;white-space:nowrap;`,
    })}">${escapeHtml(dateText)}</div>`;

  const payeeField =
    isPrintEnabled(format.print_payee) &&
    `<div class="field" style="${fieldBoxStyle({
      x: toNum(format.payee_x),
      y: toNum(format.payee_y),
      width: toNum(format.payee_width, 60),
      height: toNum(format.payee_height, 10),
      leftMargin,
      topMargin,
      fontSize: format.payee_font_size,
      fontFamily: format.payee_font_family,
      fontWeight: format.payee_font_weight,
      color: format.payee_color,
      extra: "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:uppercase;",
    })}">${escapeHtml(safePayee)}</div>`;

  const amountNumField =
    isPrintEnabled(format.print_amount_num) &&
    `<div class="field" style="${fieldBoxStyle({
      x: toNum(format.amount_num_x),
      y: toNum(format.amount_num_y),
      width: toNum(format.amount_num_width, 60),
      height: toNum(format.amount_num_height, 10),
      leftMargin,
      topMargin,
      fontSize: format.amount_num_font_size,
      fontFamily: format.amount_num_font_family,
      fontWeight: format.amount_num_font_weight,
      color: format.amount_num_color,
      extra: "white-space:nowrap;overflow:hidden;",
    })}">${escapeHtml(amountFigures)}</div>`;

  const amountWordField =
    isPrintEnabled(format.print_amount_words) &&
    `<div class="field" style="${fieldBoxStyle({
      x: toNum(format.amount_word_x),
      y: toNum(format.amount_word_y),
      width: toNum(format.amount_word_width, 60),
      height: toNum(format.amount_word_height, 10),
      leftMargin,
      topMargin,
      fontSize: format.amount_word_font_size,
      fontFamily: format.amount_word_font_family,
      fontWeight: format.amount_word_font_weight,
      color: format.amount_word_color,
      extra: "white-space:normal;overflow:hidden;line-height:1.2;",
    })}">${escapeHtml(wordsText)}</div>`;

  const sig1Field =
    isPrintEnabled(format.print_signature, false) &&
    toNum(format.sig1_width) > 0 &&
    `<div class="field" style="${fieldBoxStyle({
      x: toNum(format.sig1_x),
      y: toNum(format.sig1_y),
      width: toNum(format.sig1_width, 60),
      height: toNum(format.sig1_height, 10),
      leftMargin,
      topMargin,
      fontSize: 11,
      fontFamily: "cursive",
      fontWeight: "normal",
      color: "#000000",
    })}"></div>`;

  const sig2Field =
    isPrintEnabled(format.print_signature, false) &&
    toNum(format.sig2_width) > 0 &&
    `<div class="field" style="${fieldBoxStyle({
      x: toNum(format.sig2_x),
      y: toNum(format.sig2_y),
      width: toNum(format.sig2_width, 60),
      height: toNum(format.sig2_height, 10),
      leftMargin,
      topMargin,
      fontSize: 11,
      fontFamily: "cursive",
      fontWeight: "normal",
      color: "#000000",
    })}"></div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(formatName)} Cheque Print</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: ${pageWidth}mm ${pageHeight}mm; margin: 0; }
    html, body {
      width: ${pageWidth}mm;
      height: ${pageHeight}mm;
      background: white;
    }
    body { margin: 0; padding: 0; }
    .cheque-page {
      position: relative;
      width: ${pageWidth}mm;
      height: ${pageHeight}mm;
      overflow: hidden;
    }
    .field {
      position: absolute;
      display: flex;
      align-items: center;
    }
    .toolbar {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      padding: 10px 20px;
      border-radius: 10px;
      display: flex;
      gap: 10px;
      z-index: 1000;
      font-family: system-ui;
    }
    .toolbar button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    }
    .print-btn { background: #EF5350; color: white; }
    .close-btn { background: #6b7280; color: white; }
    .instruction {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #fef3c7;
      color: #92400e;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-family: system-ui;
      z-index: 1000;
      white-space: nowrap;
    }
    @media screen {
      html, body {
        width: 100%;
        height: 100%;
        background: #e5e7eb;
      }
      body {
        display: flex;
        justify-content: center;
        padding-top: 48px;
      }
      .cheque-page {
        background: white;
        outline: 1px dashed #94a3b8;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      }
    }
    @media print {
      html, body {
        width: ${pageWidth}mm;
        height: ${pageHeight}mm;
        background: white;
      }
      .toolbar, .instruction { display: none !important; }
      .cheque-page { outline: none; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="instruction">
    ${escapeHtml(formatName)} format | Scale: 100% | Margins: None
  </div>
  <div class="cheque-page">
    ${[dateField, payeeField, amountNumField, amountWordField, sig1Field, sig2Field].filter(Boolean).join("\n    ")}
  </div>
  <div class="toolbar">
    <button class="print-btn" onclick="window.print()">Print Cheque</button>
    <button class="close-btn" onclick="window.close()">Close</button>
  </div>
</body>
</html>`;
};
