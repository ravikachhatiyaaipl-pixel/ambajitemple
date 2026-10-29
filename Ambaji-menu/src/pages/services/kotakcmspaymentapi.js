const RTGS_THRESHOLD = 200000;
const SOAP_ENVELOPE_NS = "http://www.w3.org/2003/05/soap-envelope";
const PAYMENT_NS =
  "http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd";
const REVERSAL_NS =
  "http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd";

/** CMS reverse-feed status codes that mean final success */
const SUCCESS_CODES = new Set(["U"]);

/** CMS reverse-feed status codes that mean final failure */
const FAILED_CODES = new Set([
  "R",
  "AR",
  "DF",
  "CR",
  "CF",
  "DL",
  "CN",
  "UP",
]);

/** Payment initiation header status codes treated as accepted (or partial) */
const INITIATE_ACCEPTED_CODES = new Set(["000", "005", "007"]);

const kotakBaseUrl = () =>
  String(import.meta.env.VITE_KOTAK_API_URL || "").replace(/\/$/, "");

/**
 * Kotak OAuth + CMS credentials (bundled in frontend — only for allowlisted origins).
 */
export const getCmsConfig = () => ({
  apiUrl: kotakBaseUrl(),
  clientId: import.meta.env.VITE_KOTAK_CLIENT_ID || "",
  clientSecret: import.meta.env.VITE_KOTAK_CLIENT_SECRET || "",
  clientCode: import.meta.env.VITE_KOTAK_CMS_CLIENT_CODE || "",
  msgSource: import.meta.env.VITE_KOTAK_CMS_MSG_SOURCE || "",
  // Align with working CMS / Kotak Configuration default product.
  myProdCode: import.meta.env.VITE_KOTAK_CMS_MY_PROD || "BBPACKAGE",
  debitAccount: import.meta.env.VITE_KOTAK_CMS_DEBIT_ACCOUNT || "",
  paymentPath: import.meta.env.VITE_KOTAK_CMS_PAYMENT_PATH || "/v1/cms/pay",
  statusPath: import.meta.env.VITE_KOTAK_CMS_STATUS_PATH || "/v1/cms/rev",
});

/**
 * Auto PayMode: IFT (Kotak→Kotak) / NEFT (< ₹2L) / RTGS (≥ ₹2L).
 */
export const resolvePayMode = (ifsc, amount) => {
  const ifscUpper = String(ifsc || "")
    .trim()
    .toUpperCase();
  if (ifscUpper.startsWith("KKBK")) return "IFT";
  const amt = parseFloat(amount) || 0;
  if (amt >= RTGS_THRESHOLD) return "RTGS";
  return "NEFT";
};

/**
 * Unique MessageId ≤ 20 chars: I3 + yymmdd + 6-digit sequence.
 */
export const buildMessageId = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `I3${yy}${mm}${dd}${seq}`.slice(0, 20);
};

/**
 * Unique InstRefNo ≤ 20 chars from voucher id + detail serial.
 */
export const buildInstRefNo = (voucher, detail, index = 0) => {
  const cvId = String(voucher?.CV_Id ?? "").replace(/\D/g, "").slice(0, 12);
  const sr = String(detail?.CV_Sr ?? index + 1)
    .replace(/\D/g, "")
    .padStart(2, "0")
    .slice(-4);
  const base = `${cvId || "0"}${sr}`;
  return base.slice(0, 20);
};

export const formatPaymentDate = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
};

export const isBankTransferDetail = (detail) => {
  const mode = String(detail?.Py_Mode || detail?.Payment_Mode || "")
    .trim()
    .toLowerCase();
  return (
    mode ==  "bank" ||
    mode ==  "online" ||
    mode ==  "card" ||
    mode ==  "neft" ||
    mode ==  "rtgs" ||
    mode ==  "ift" ||
    mode ==  "imps"
  );
};

export const getDetailPayableAmount = (detail) => {
  const amount = parseFloat(detail?.Amount) || 0;
  const penalty = parseFloat(detail?.Penalty_Amount) || 0;
  return amount + penalty;
};

export const isInitiateAccepted = (statusCd) =>
  INITIATE_ACCEPTED_CODES.has(String(statusCd ?? "").trim());

/**
 * Map CMS status code → ManagePayments Py_Status.
 */
export const mapCmsStatusToPyStatus = (statusCode) => {
  if (statusCode == null || statusCode ==  "") return "pending";
  const code = String(statusCode).trim().toUpperCase();
  if (SUCCESS_CODES.has(code)) return "success";
  if (FAILED_CODES.has(code)) return "failed";
  if (code.startsWith("ERROR") || code ==  "ERROR-101" || code ==  "ERROR-99") {
    return code ==  "ERROR-101" || code ==  "ERROR-99" ? "pending" : "failed";
  }
  return "pending";
};

export const getCmsStatusLabel = (statusCode) => {
  const code = String(statusCode || "").trim().toUpperCase();
  const labels = {
    U: "Processed",
    C: "In Process",
    R: "Rejected with Error",
    AR: "Auth Rejected",
    DF: "Debit Failed",
    CR: "Pending Repair",
    CF: "Returned",
    PA: "Pending Approval",
    PS: "Pending Send",
    DL: "Deleted",
    DC: "Debited",
    CN: "Cancelled",
    O: "Draft",
    IN: "In Transit",
    UP: "Transaction Timeout",
  };
  return labels[code] || statusCode || "—";
};

/** Keeps toast messages readable while still showing the bank's own wording. */
const summarizeBody = (body, limit = 300) => {
  const text = String(body || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "no response body";
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

/**
 * OAuth client_credentials via Laravel (server IP is bank-whitelisted).
 * Browser must not call Kotak directly (CORS).
 */
export const generateToken = async () => {
  const apiBase = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (!apiBase) {
    return {
      success: false,
      error: "VITE_API_URL is not configured",
    };
  }

  const authToken = localStorage.getItem("auth_token");
  if (!authToken) {
    return {
      success: false,
      error: "Not logged in (auth_token missing). Please login again.",
    };
  }

  const url = `${apiBase}/kotak/cms/token`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const rawBody = await response.text();
    let json = null;
    try {
      json = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      json = null;
    }

    if (!response.ok || !json?.success) {
      return {
        success: false,
        error:
          json?.message ||
          `Token HTTP ${response.status}: ${summarizeBody(rawBody)}`,
        httpStatus: response.status,
        rawBody,
      };
    }

    if (!json.access_token) {
      return {
        success: false,
        error: "Token response did not include access_token",
        rawBody,
      };
    }

    return {
      success: true,
      access_token: json.access_token,
      token_type: json.token_type || "Bearer",
      expires_in: json.expires_in,
      scope: json.scope,
    };
  } catch (error) {
    return {
      success: false,
      error: `Could not reach backend token proxy ${url}: ${error.message}`,
    };
  }
};

/**
 * Demo CMS payment via Laravel (no voucher). Server gets token + encrypts + pays.
 */
export const initiateDemoPayment = async (payload) => {
  const apiBase = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (!apiBase) {
    return { success: false, error: "VITE_API_URL is not configured" };
  }

  const authToken = localStorage.getItem("auth_token");
  if (!authToken) {
    return {
      success: false,
      error: "Not logged in (auth_token missing). Please login again.",
    };
  }

  const url = `${apiBase}/kotak/cms/demo-payment`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await response.text();
    let json = null;
    try {
      json = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      json = null;
    }

    if (!response.ok || !json?.success) {
      const validation =
        json?.errors && typeof json.errors === "object"
          ? Object.values(json.errors).flat().join("; ")
          : "";
      return {
        success: false,
        error:
          validation ||
          json?.message ||
          `Demo payment HTTP ${response.status}: ${summarizeBody(rawBody)}`,
        httpStatus: response.status,
        raw: rawBody,
        rawJson: json,
      };
    }

    return {
      success: true,
      ...(json.data || {}),
      encrypted: json.encrypted || null,
      token: json.token || null,
      message: json.message,
      bankResponse: json.bankResponse || json.data?.responseXml || null,
      bankResponseRaw: json.bankResponseRaw || json.data?.responseRaw || null,
      raw: rawBody,
    };
  } catch (error) {
    return {
      success: false,
      error: `Could not reach backend demo payment proxy ${url}: ${error.message}`,
    };
  }
};

/**
 * Encrypt a plain CMS payload on Laravel and return the Base64 body.
 */
export const encryptDemoPayload = async (payload) => {
  const apiBase = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (!apiBase) {
    return { success: false, error: "VITE_API_URL is not configured" };
  }

  const authToken = localStorage.getItem("auth_token");
  if (!authToken) {
    return {
      success: false,
      error: "Not logged in (auth_token missing). Please login again.",
    };
  }

  const url = `${apiBase}/kotak/cms/encrypt`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });

    const rawBody = await response.text();
    let json = null;
    try {
      json = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      json = null;
    }

    if (!response.ok || !json?.success || !json?.encrypted) {
      return {
        success: false,
        error: json?.message || `Encrypt HTTP ${response.status}`,
      };
    }

    return { success: true, encrypted: json.encrypted };
  } catch (error) {
    return {
      success: false,
      error: `Could not reach encrypt API ${url}: ${error.message}`,
    };
  }
};

/**
 * Build CMS payment JSON for one voucher (one MessageId, N instruments).
 */
/**
 * Debit AccountNo for CMS must be a real bank account number.
 * Never use fabricated ledger codes like "L30".
 */
const looksLikeBankAccountNo = (value) => {
  const digits = String(value || "").replace(/\s+/g, "");
  return /^\d{9,20}$/.test(digits);
};

const resolveDebitAccountNo = (bankAccount, detail, config) => {
  const candidates = [
    bankAccount?.Acc_No,
    bankAccount?.Account_No,
    bankAccount?.Account_Number,
    detail?.SL_Lg_Name,
    bankAccount?.Lg_Name,
    bankAccount?.Lg_Eng_Name,
    bankAccount?.Lg_Code,
    config?.debitAccount,
  ];

  for (const candidate of candidates) {
    const raw = String(candidate || "").trim();
    if (!raw) continue;
    // Skip UI placeholders like L30 / L123
    if (/^L\d+$/i.test(raw)) continue;
    if (looksLikeBankAccountNo(raw)) {
      return raw.replace(/\s+/g, "");
    }
  }

  // Last resort: configured debit account even if format differs
  const configured = String(config?.debitAccount || "").trim();
  return configured || "";
};

/** CMS rejects many non-ASCII chars in narrative fields. */
const cmsSafeText = (value, maxLen) =>
  String(value || "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);

export const buildPaymentPayloadFromVoucher = (voucher, bankAccounts = []) => {
  const config = getCmsConfig();
  // ClientCode / MsgSource / Product are overwritten by Laravel from active
  // KotakConfiguration (or .env). VITE values are optional placeholders.
  const clientCode = config.clientCode || "";
  const msgSource = config.msgSource || "";
  const myProdCode = config.myProdCode || "BBPACKAGE";

  const details = voucher?.details || [];
  const messageId = buildMessageId();
  const instruments = [];
  const errors = [];

  details.forEach((detail, index) => {
    const totalAmount = getDetailPayableAmount(detail);
    if (totalAmount <= 0) return;

    if (!detail.SL_Lg_Id) {
      errors.push(`Row ${detail.CV_Sr || index + 1}: debit bank not selected`);
      return;
    }

    const bankAccount = bankAccounts.find(
      (acc) => String(acc.Lg_Id) === String(detail.SL_Lg_Id)
    );
    if (!bankAccount) {
      errors.push(`Row ${detail.CV_Sr || index + 1}: debit bank account not found`);
      return;
    }

    const debitAccount = resolveDebitAccountNo(bankAccount, detail, config);
    if (!debitAccount) {
      errors.push(
        `Row ${detail.CV_Sr || index + 1}: debit AccountNo missing (use bank A/c no on ledger, not ledger id)`
      );
      return;
    }

    const accNo = String(detail.Acc_No || "").trim();
    const ifsc = String(detail.IFSC_Code || "").trim().toUpperCase();
    const beneName = String(detail.SL_Nm || "").trim();

    if (!accNo || !ifsc || !beneName) {
      errors.push(
        `Row ${detail.CV_Sr || index + 1}: beneficiary Acc_No / IFSC / name required`
      );
      return;
    }

    const payMode = resolvePayMode(ifsc, totalAmount);
    const instRefNo = buildInstRefNo(voucher, detail, index);
    const voucherRef = cmsSafeText(voucher.CV_No, 40);

    instruments.push({
      InstRefNo: instRefNo,
      CompanyId: clientCode,
      // Working bank sample uses an empty CompBatchId tag.
      CompBatchId: "",
      ConfidentialInd: "N",
      MyProdCode: myProdCode,
      PayMode: payMode,
      TxnAmnt: totalAmount.toFixed(2),
      AccountNo: debitAccount,
      DrDesc: voucherRef,
      PaymentDt: formatPaymentDate(voucher.Ch_Date),
      BankCdInd: "N",
      RecBrCd: ifsc,
      BeneAcctNo: accNo,
      BeneName: cmsSafeText(beneName, 200),
      BeneCode: "",
      PaymentRef: cmsSafeText(voucher.CV_No, 45),
      ChgBorneBy: "N",
      _detailKey: detail.Chl_Vou_Id || detail.CV_Sr || index,
      _SL_Lg_Id: detail.SL_Lg_Id,
    });
  });

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
  if (instruments.length === 0) {
    throw new Error("No payable bank-transfer instruments found on voucher");
  }

  return {
    messageId,
    requestHeader: {
      MessageId: messageId,
      MsgSource: msgSource,
      ClientCode: clientCode,
      BatchRefNmbr: messageId,
    },
    instruments: instruments.map((instrument) => {
      const bankInstrument = { ...instrument };
      delete bankInstrument._detailKey;
      delete bankInstrument._SL_Lg_Id;
      return bankInstrument;
    }),
    instrumentMeta: instruments.map((inst) => ({
      InstRefNo: inst.InstRefNo,
      PayMode: inst.PayMode,
      detailKey: inst._detailKey,
      SL_Lg_Id: inst._SL_Lg_Id,
    })),
    clientCode,
    msgSource,
    cvId: voucher.CV_Id,
    cvNo: voucher.CV_No,
  };
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const paymentElement = (name, value) =>
  `<pay:${name}>${escapeXml(value)}</pay:${name}>`;

const reversalElement = (name, value) =>
  `<rev:${name}>${escapeXml(value)}</rev:${name}>`;

const PAYMENT_INSTRUMENT_SEQUENCE = [
  "InstRefNo",
  "CompanyId",
  "CompBatchId",
  "ConfidentialInd",
  "MyProdCode",
  "PayMode",
  "TxnAmnt",
  "AccountNo",
  "DrRefNmbr",
  "DrDesc",
  "PaymentDt",
  "BankCdInd",
  "RecBrCd",
  "BeneAcctNo",
  "BeneName",
  "BeneCode",
  "BeneEmail",
  "BeneMb",
  "BeneAddr1",
  "BeneAddr2",
  "BeneAddr3",
  "BeneAddr4",
  "BeneAddr5",
  "city",
  "zip",
  "Country",
  "State",
  "TelephoneNo",
  "PaymentRef",
  "ChgBorneBy",
  "CreditRefNo",
  "PaymentDtl",
  "PaymentDtl1",
  "PaymentDtl2",
  "PaymentDtl3",
];

export const buildPaymentSoapXml = (payload) => {
  const header = payload.requestHeader || {};
  const instruments = payload.instruments || [];

  const headerXml = ["MessageId", "MsgSource", "ClientCode", "BatchRefNmbr"]
    .map((field) => paymentElement(field, field === "BatchRefNmbr" ? header.BatchRefNmbr || header.MessageId : header[field]))
    .join("");

  const instrumentXml = instruments
    .map((instrument) => {
      const fields = PAYMENT_INSTRUMENT_SEQUENCE.filter(
        (field) => field !== "PayMode" || String(instrument[field] ?? "").trim() !== ""
      )
        .map((field) => paymentElement(field, instrument[field] ?? ""))
        .join("");

      const enrichments = Array.isArray(instrument.Enrichments)
        ? instrument.Enrichments.filter((v) => String(v ?? "").trim() !=  "")
        : [];
      const enrichmentXml = enrichments.length
        ? `<pay:EnrichmentSet>${enrichments
            .map((value) => paymentElement("Enrichment", value))
            .join("")}</pay:EnrichmentSet>`
        : "";

      return `<pay:instrument>${fields}${enrichmentXml}</pay:instrument>`;
    })
    .join("");

  return `<soap:Envelope xmlns:soap="${SOAP_ENVELOPE_NS}" xmlns:pay="${PAYMENT_NS}"><soap:Header/><soap:Body><pay:Payment><pay:RequestHeader>${headerXml}</pay:RequestHeader><pay:InstrumentList>${instrumentXml}</pay:InstrumentList></pay:Payment></soap:Body></soap:Envelope>`;
};

const formatDateWithOffset = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  const tzOffsetMin = -date.getTimezoneOffset();
  const sign = tzOffsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(tzOffsetMin);
  const hh = pad(Math.floor(abs / 60));
  const mm = pad(abs % 60);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}${sign}${hh}:${mm}`;
};

export const buildStatusSoapXml = ({
  messageId,
  clientCode,
  msgSource,
  instRefNo,
}) => {
  const config = getCmsConfig();
  const reqId = buildMessageId();
  const datePost = formatDateWithOffset();

  let detailsXml;
  if (String(instRefNo || "").trim()) {
    detailsXml = `<rev:MsgInstRef>${reversalElement("Msg_Id", messageId)}${reversalElement("InstRefNo", instRefNo)}</rev:MsgInstRef>`;
  } else {
    detailsXml = reversalElement("Msg_Id", messageId);
  }

  const headerXml = [
    reversalElement("Req_Id", reqId),
    reversalElement("Msg_Src", msgSource || config.msgSource),
    reversalElement("Client_Code", clientCode || config.clientCode),
    reversalElement("Date_Post", datePost),
  ].join("");

  return `<soap:Envelope xmlns:soap="${SOAP_ENVELOPE_NS}" xmlns:rev="${REVERSAL_NS}"><soap:Header/><soap:Body><rev:Reversal><rev:Header>${headerXml}</rev:Header><rev:Details>${detailsXml}</rev:Details></rev:Reversal></soap:Body></soap:Envelope>`;
};

const bytesToBase64 = (bytes) => {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const base64ToBytes = (value) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const getEncryptionKey = async () => {
  const secret = import.meta.env.VITE_KOTAK_CLIENT_SECRET || "";
  const len = secret.length;

  if (![16, 24, 32].includes(len)) {
    throw new Error(
      `VITE_KOTAK_CLIENT_SECRET must be 16, 24, or 32 bytes for AES (got ${len})`
    );
  }

  if (!crypto?.subtle) {
    throw new Error(
      "Web Crypto is unavailable. Serve the app over HTTPS (or localhost)."
    );
  }

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
};

/** AES/CBC: 16 zero-byte IV prepended to plaintext (Kotak Java/.NET reference). */
export const encryptCmsPayload = async (plaintext) => {
  const key = await getEncryptionKey();
  const iv = new Uint8Array(16);
  const encoded = new TextEncoder().encode(plaintext);
  const payload = new Uint8Array(16 + encoded.length);
  payload.set(iv);
  payload.set(encoded, 16);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    payload
  );

  return bytesToBase64(new Uint8Array(encrypted));
};

/**
 * Inverse of encryptCmsPayload / bank Java AESCBCPKCS5Encryption.decrypt:
 * decrypt full ciphertext with 16 zero-byte IV, then strip leading 16 plaintext bytes.
 */
export const decryptCmsPayload = async (encryptedText) => {
  const key = await getEncryptionKey();
  const cleaned = String(encryptedText || "").replace(/\s/g, "");
  const decoded = base64ToBytes(cleaned);

  if (decoded.length <= 16) {
    throw new Error("Kotak CMS returned an invalid encrypted payload");
  }

  const iv = new Uint8Array(16);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    decoded
  );

  const pt = new Uint8Array(decrypted);
  if (pt.length <= 16) {
    throw new Error("Decrypted CMS payload too short");
  }

  return new TextDecoder().decode(pt.slice(16));
};

const parseXml = (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Kotak CMS returned invalid XML");
  }
  return doc;
};

const elementsByLocalName = (document, localName) =>
  Array.from(document.getElementsByTagName("*")).filter(
    (node) => node.localName ==  localName
  );

const firstLocalText = (root, localName) => {
  const scope = root.ownerDocument ? root : root;
  const nodes = Array.from(scope.getElementsByTagName("*")).filter(
    (node) => node.localName ==  localName
  );
  return nodes[0]?.textContent?.trim() || "";
};

const childLocalText = (parent, localName) => {
  const node = Array.from(parent.children).find(
    (el) => el.localName ==  localName
  );
  if (node) return node.textContent?.trim() || "";
  return Array.from(parent.getElementsByTagName("*"))
    .find((el) => el.localName ==  localName && parent.contains(el))
    ?.textContent?.trim() || "";
};

const parsePaymentResponse = (xml, fallbackMessageId) => {
  const doc = parseXml(xml);
  const fault = elementsByLocalName(doc, "Fault")[0];
  if (fault) {
    const reason =
      firstLocalText(fault, "Text") || firstLocalText(fault, "faultstring");
    throw new Error(`Kotak CMS SOAP fault: ${reason || "Unknown bank error"}`);
  }

  const instruments = elementsByLocalName(doc, "instrument").concat(
    elementsByLocalName(doc, "Instrument")
  ).map((node) => ({
    instRefNo: childLocalText(node, "InstRefNo"),
    instStatusCd: childLocalText(node, "InstStatusCd"),
    instStatusRem: childLocalText(node, "InstStatusRem"),
  }));

  const statusCd = firstLocalText(doc, "StatusCd");
  if (!statusCd) {
    throw new Error("Kotak CMS payment response did not include a status code");
  }

  return {
    statusCd,
    statusRem: firstLocalText(doc, "StatusRem"),
    messageId: firstLocalText(doc, "MessageId") || fallbackMessageId,
    instruments,
  };
};

const parseStatusResponse = (xml, fallbackMessageId, fallbackInstRefNo) => {
  const doc = parseXml(xml);
  const fault = elementsByLocalName(doc, "Fault")[0];
  if (fault) {
    const reason =
      firstLocalText(fault, "Text") || firstLocalText(fault, "faultstring");
    throw new Error(`Kotak CMS SOAP fault: ${reason || "Unknown bank error"}`);
  }

  let details = elementsByLocalName(doc, "Rev_Detail").map((node) => ({
    messageId: childLocalText(node, "Msg_Id") || childLocalText(node, "Msg_id"),
    statusCode: childLocalText(node, "Status_Code"),
    statusDesc: childLocalText(node, "Status_Desc"),
    instRefNo: childLocalText(node, "InstRefNo"),
    utr: childLocalText(node, "UTR"),
  }));

  if (!details.length) {
    details = [
      {
        messageId: firstLocalText(doc, "Msg_Id") || fallbackMessageId,
        statusCode: firstLocalText(doc, "Status_Code"),
        statusDesc: firstLocalText(doc, "Status_Desc"),
        instRefNo: firstLocalText(doc, "InstRefNo") || fallbackInstRefNo,
        utr: firstLocalText(doc, "UTR"),
      },
    ];
  }

  if (!details[0]?.statusCode) {
    throw new Error("Kotak CMS status response did not include a status code");
  }

  return { details };
};

const decodeBankResponse = async (rawBody) => {
  const body = String(rawBody || "").trim();
  if (!body) {
    throw new Error("Kotak CMS returned an empty response");
  }
  if (body.startsWith("<")) {
    return body;
  }
  return decryptCmsPayload(body);
};

const postToKotakCms = async (path, xml, accessToken) => {
  const config = getCmsConfig();
  const url = `${config.apiUrl}${path}`;

  let encrypted;
  try {
    encrypted = await encryptCmsPayload(xml);
  } catch (error) {
    return {
      success: false,
      error: error.message || "CMS payload encryption failed",
    };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    // Bank UAT curl uses application/xml for the encrypted CMS body
    "Content-Type": "application/xml",
  };
  if (path.includes("/cms/pay")) {
    headers.SOAPAction =
      '"/BusinessServices/StarterProcesses/CMS_Generic_Service.serviceagent/Payment"';
  } else if (path.includes("/cms/rev")) {
    headers.SOAPAction =
      '"/BusinessServices/StarterProcesses/CMS_Generic_Service.serviceagent/Reversal"';
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: encrypted,
    });

    const rawBody = await response.text();

    if (!response.ok) {
      return {
        success: false,
        error: `Kotak CMS ${path} HTTP ${response.status}: ${summarizeBody(rawBody)}`,
        httpStatus: response.status,
        rawBody,
      };
    }

    const decrypted = await decodeBankResponse(rawBody);
    return { success: true, xml: decrypted, rawBody };
  } catch (error) {
    return {
      success: false,
      error: `Could not reach ${url} (network/CORS blocked): ${error.message}`,
    };
  }
};

/**
 * Initiate CMS payment via Laravel (server IP whitelisted).
 * accessToken arg kept for callers; backend fetches its own Kotak token.
 */
export const initiatePayment = async (payload, _accessToken) => {
  const apiBase = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (!apiBase) {
    return { success: false, error: "VITE_API_URL is not configured" };
  }

  const authToken = localStorage.getItem("auth_token");
  if (!authToken) {
    return {
      success: false,
      error: "Not logged in (auth_token missing). Please login again.",
    };
  }

  if (!payload?.cvId) {
    return {
      success: false,
      error: "Missing cvId for CMS payment (use initiateDemoPayment for demo)",
    };
  }

  const url = `${apiBase}/kotak/cms/payment`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await response.text();
    let json = null;
    try {
      json = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      json = null;
    }

    if (!response.ok || !json?.success) {
      const validation =
        json?.errors && typeof json.errors === "object"
          ? Object.values(json.errors).flat().join("; ")
          : "";
      return {
        success: false,
        error:
          validation ||
          json?.message ||
          `CMS payment HTTP ${response.status}: ${summarizeBody(rawBody)}`,
        raw: rawBody,
      };
    }

    return {
      success: true,
      ...(json.data || {}),
      raw: rawBody,
    };
  } catch (error) {
    return {
      success: false,
      error: `Could not reach backend CMS payment proxy ${url}: ${error.message}`,
    };
  }
};

/**
 * Query CMS payment status / UTR via Laravel.
 * Accepts either header fields or { mode:'payload', encryptedPayload/plainPayload }.
 */
export const getPaymentStatus = async (payload = {}, _accessToken) => {
  const apiBase = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (!apiBase) {
    return { success: false, error: "VITE_API_URL is not configured" };
  }

  const authToken = localStorage.getItem("auth_token");
  if (!authToken) {
    return {
      success: false,
      error: "Not logged in (auth_token missing). Please login again.",
    };
  }

  const url = `${apiBase}/kotak/cms/status`;
  const body =
    payload?.mode === "payload"
      ? {
          mode: "payload",
          plainPayload: payload.plainPayload || "",
          encryptedPayload: payload.encryptedPayload || "",
        }
      : {
          messageId: payload.messageId,
          instRefNo: payload.instRefNo || "",
          clientCode: payload.clientCode,
          msgSource: payload.msgSource,
        };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const rawBody = await response.text();
    let json = null;
    try {
      json = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      json = null;
    }

    if (!response.ok || !json?.success) {
      return {
        success: false,
        error:
          json?.message ||
          `CMS status HTTP ${response.status}: ${summarizeBody(rawBody)}`,
        raw: rawBody,
        rawJson: json,
      };
    }

    const data = json.data || {};
    const first = (data.details && data.details[0]) || {};

    return {
      success: true,
      messageId: first.messageId || payload.messageId,
      statusCode: first.statusCode,
      statusDesc: first.statusDesc,
      utr: first.utr || "",
      instRefNo: first.instRefNo || payload.instRefNo,
      details: data.details || [],
      encrypted: json.encrypted || null,
      token: json.token || null,
      bankResponse: json.bankResponse || data.responseXml || null,
      bankResponseRaw: json.bankResponseRaw || data.responseRaw || null,
      requestXml: json.requestXml || data.requestXml || null,
      message: json.message,
      raw: rawBody,
    };
  } catch (error) {
    return {
      success: false,
      error: `Could not reach backend CMS status proxy ${url}: ${error.message}`,
    };
  }
};

/**
 * Aggregate multi-instrument status into one Py_Status.
 */
export const aggregateInstrumentPyStatus = (details = []) => {
  if (!details.length) return "pending";
  const mapped = details.map((d) =>
    mapCmsStatusToPyStatus(d.statusCode ?? d.Status_Code)
  );
  if (mapped.every((s) => s ==  "success")) return "success";
  if (mapped.some((s) => s ==  "failed")) return "failed";
  return "pending";
};

/**
 * Pick primary UTR from status details (first non-empty).
 */
export const pickPrimaryUtr = (details = []) => {
  for (const d of details) {
    const utr = d.utr ?? d.UTR;
    if (utr && String(utr).trim()) return String(utr).trim();
  }
  return "";
};

const KotakCmsPaymentApi = {
  generateToken,
  initiatePayment,
  initiateDemoPayment,
  getPaymentStatus,
  buildPaymentPayloadFromVoucher,
  buildMessageId,
  buildInstRefNo,
  resolvePayMode,
  getCmsConfig,
  isInitiateAccepted,
  mapCmsStatusToPyStatus,
  getCmsStatusLabel,
  aggregateInstrumentPyStatus,
  pickPrimaryUtr,
  isBankTransferDetail,
  getDetailPayableAmount,
};

export default KotakCmsPaymentApi;
