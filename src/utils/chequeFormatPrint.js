const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const toNum = (value, fallback = 0) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

const mm = (value) => `${value}mm`;

const isPrintEnabled = (value) =>
  value == true || value == 1 || value == "1" || value == "true";

export const formatHasLayout = (format) =>
  Boolean(
    format &&
      typeof format == "object" &&
      format.date_x != null &&
      format.payee_x != null &&
      format.amount_num_x != null,
  );

export const unwrapChequeFormat = (payload) => {
  if (!payload || typeof payload != "object") return null;
  if (Array.isArray(payload)) return null;
  if (formatHasLayout(payload)) return payload;
  const nested = payload.data ?? payload.cheque_format;
  if (nested && nested !=  payload) return unwrapChequeFormat(nested);
  return null;
};

export const pickChequePrintValues = (cheque) => ({
  payeeName: String(cheque?.SL_Name || cheque?.payee_name || "").trim(),
  amount: parseFloat(cheque?.amount) || 0,
  amountInWords: String(cheque?.amount_words || "").trim(),
  chequeDate: cheque?.cheque_date || cheque?.Cheque_Date || "",
});

export const findChequeBookForCheque = (cheque, chequeBooks = []) => {
  const bookId = cheque?.cheque_book_id ?? cheque?.cheque_book?.cheque_book_id;
  if (bookId == null || bookId == "") return null;
  return (
    chequeBooks.find((book) => Number(book.cheque_book_id) == Number(bookId)) ||
    null
  );
};

export const getChequeFormatId = (cheque, book = null) =>
  cheque?.cheque_format_id ||
  book?.cheque_format_id ||
  cheque?.cheque_book?.cheque_format_id ||
  cheque?.cheque_format?.cheque_format_id ||
  null;

export const resolveChequeFormat = (
  cheque,
  chequeBooks = [],
  chequeFormats = [],
) => {
  const book = findChequeBookForCheque(cheque, chequeBooks);
  const nested =
    unwrapChequeFormat(book?.cheque_format) ||
    unwrapChequeFormat(cheque?.cheque_format);
  if (nested) return nested;

  const formatId = getChequeFormatId(cheque, book);
  if (formatId != null && formatId != "") {
    const fromList = chequeFormats.find(
      (fmt) => Number(fmt.cheque_format_id) == Number(formatId),
    );
    if (fromList) return fromList;
  }

  return book?.cheque_format || cheque?.cheque_format || null;
};

export const parseChequeDate = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput == "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(dateInput);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatChequeDateByPattern = (dateInput, dateFormat) => {
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

export const formatChequeAmountFigures = (amount) => {
  const n = parseFloat(amount) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
    `left:${mm(leftMargin + toNum(x))}`,
    `top:${mm(topMargin + toNum(y))}`,
    `width:${mm(toNum(width))}`,
    `height:${mm(toNum(height))}`,
    fontSize != null && fontSize != ""
      ? `font-size:${toNum(fontSize)}px`
      : "",
    fontFamily
      ? `font-family:'${escapeHtml(fontFamily)}', sans-serif`
      : "",
    fontWeight ? `font-weight:${escapeHtml(fontWeight)}` : "",
    color ? `color:${escapeHtml(color)}` : "",
    extra,
  ]
    .filter(Boolean)
    .join(";");

const renderFormatField = (format, prefix, text, extra = "") => {
  const printKey =
    prefix == "amount_word"
      ? "print_amount_words"
      : prefix == "amount_num"
        ? "print_amount_num"
        : prefix == "sig1" || prefix == "sig2"
          ? "print_signature"
          : `print_${prefix}`;

  if (!isPrintEnabled(format[printKey])) return "";

  return `<div class="field" style="${fieldBoxStyle({
    x: format[`${prefix}_x`],
    y: format[`${prefix}_y`],
    width: format[`${prefix}_width`],
    height: format[`${prefix}_height`],
    leftMargin: toNum(format.left_margin_mm),
    topMargin: toNum(format.top_margin_mm),
    fontSize: format[`${prefix}_font_size`],
    fontFamily: format[`${prefix}_font_family`],
    fontWeight: format[`${prefix}_font_weight`],
    color: format[`${prefix}_color`],
    extra,
  })}">${text ? escapeHtml(text) : ""}</div>`;
};

export const printChequeHtml = (html) =>
  new Promise((resolve, reject) => {
    try {
      const printWin = window.open("", "_blank", "width=900,height=520");
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

export const buildDynamicChequePrintHtml = ({
  format,
  payeeName = "",
  amount = 0,
  amountInWords = "",
  chequeDate = "",
}) => {
  if (!formatHasLayout(format)) {
    throw new Error("Cheque format is required for printing.");
  }

  const pageWidth = toNum(format.page_width_mm);
  const pageHeight = toNum(format.page_height_mm);
  const formatName = format.format_name || "Cheque";
  const dateText = formatChequeDateByPattern(chequeDate, format.date_format);
  const amountFigures = [
    format.amount_prefix || "",
    formatChequeAmountFigures(amount),
    format.amount_suffix || "",
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const wordsText = buildAmountWordsText(amountInWords, format.words_suffix);
  const dateSpacing = toNum(format.date_char_spacing);

  const fields = [
    renderFormatField(
      format,
      "date",
      dateText,
      `letter-spacing:${dateSpacing}px;white-space:nowrap;`,
    ),
    renderFormatField(
      format,
      "payee",
      String(payeeName || "").trim(),
      "white-space:normal;overflow:visible;line-height:1.2;align-items:flex-start;",
    ),
    renderFormatField(
      format,
      "amount_num",
      amountFigures,
      "white-space:nowrap;overflow:visible;",
    ),
    renderFormatField(
      format,
      "amount_word",
      wordsText,
      "white-space:normal;overflow:visible;line-height:1.2;align-items:flex-start;",
    ),
    renderFormatField(format, "sig1", ""),
    renderFormatField(format, "sig2", ""),
  ].filter(Boolean);

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
    ${fields.join("\n    ")}
  </div>
  <div class="toolbar">
    <button class="print-btn" onclick="window.print()">Print Cheque</button>
    <button class="close-btn" onclick="window.close()">Close</button>
  </div>
</body>
</html>`;
};
