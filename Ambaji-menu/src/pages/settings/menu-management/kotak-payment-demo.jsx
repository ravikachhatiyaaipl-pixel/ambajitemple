/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Kotak CMS Payment Demo — token + encrypted payment / status sample flow
 *
 */

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { CreditCard, Play, RotateCcw, Loader2, Search } from "lucide-react";
import {
  generateToken,
  initiateDemoPayment,
  encryptDemoPayload,
  buildPaymentSoapXml,
  buildStatusSoapXml,
  getPaymentStatus,
  getCmsConfig,
  getCmsStatusLabel,
} from "../../services/kotakcmspaymentapi";

const DEFAULT_FORM = {
  MessageId: "AASHISH15112822501",
  MsgSource: "THRSTRAVEL",
  ClientCode: "THRSTRAVEL",
  BatchRefNmbr: "AASHISH15112822501",
  InstRefNo: "AASHISH15112822501",
  CompanyId: "THRSTRAVEL",
  CompBatchId: "",
  ConfidentialInd: "N",
  MyProdCode: "BBPACKAGE",
  PayMode: "",
  TxnAmnt: "1.23",
  AccountNo: "08200050000449",
  DrRefNmbr: "Debit ref num",
  DrDesc: "Debit description",
  PaymentDt: "2022-06-28",
  BankCdInd: "M",
  RecBrCd: "ICIC0000302",
  BeneAcctNo: "12344253",
  BeneName: "Aashish",
  BeneCode: "",
  BeneEmail: "abc@gmail.com",
  BeneMb: "9999999999",
  BeneAddr1: "PUNE1",
  BeneAddr2: "PUNE2",
  BeneAddr3: "PUNE3",
  BeneAddr4: "PUNE4",
  BeneAddr5: "PUNE5",
  city: "PUNE",
  zip: "411047",
  Country: "INDIA",
  State: "MH",
  TelephoneNo: "02044928209",
  PaymentRef: "PAYREF1",
  ChgBorneBy: "N",
  CreditRefNo: "CREDITREF1",
  PaymentDtl: "THRS1904202200001-1",
  PaymentDtl1: "NAM104",
  PaymentDtl2: "104-20200508-79",
  PaymentDtl3: "20200528149000003",
  Enrichment1: "Settlement generated~test1~~test1",
  Enrichment2: "",
};

const HEADER_FIELDS = [
  { key: "MessageId", label: "Message Id" },
  { key: "MsgSource", label: "Msg Source" },
  { key: "ClientCode", label: "Client Code" },
  { key: "BatchRefNmbr", label: "Batch Ref Number" },
];

const STATUS_FIELDS = [
  { key: "MessageId", label: "Message Id (Msg_Id)" },
  { key: "InstRefNo", label: "Inst Ref No (optional)" },
  { key: "MsgSource", label: "Msg Source" },
  { key: "ClientCode", label: "Client Code" },
];

const INSTRUMENT_FIELDS = [
  { key: "InstRefNo", label: "Inst Ref No" },
  { key: "CompanyId", label: "Company Id" },
  { key: "CompBatchId", label: "Comp Batch Id" },
  { key: "ConfidentialInd", label: "Confidential Ind" },
  { key: "MyProdCode", label: "My Prod Code" },
  { key: "PayMode", label: "Pay Mode" },
  { key: "TxnAmnt", label: "Txn Amount" },
  { key: "AccountNo", label: "Debit Account No" },
  { key: "DrRefNmbr", label: "Dr Ref Number" },
  { key: "DrDesc", label: "Dr Desc" },
  { key: "PaymentDt", label: "Payment Date" },
  { key: "BankCdInd", label: "Bank Cd Ind" },
  { key: "RecBrCd", label: "IFSC / RecBrCd" },
  { key: "BeneAcctNo", label: "Bene Account No" },
  { key: "BeneName", label: "Bene Name" },
  { key: "BeneCode", label: "Bene Code" },
  { key: "BeneEmail", label: "Bene Email" },
  { key: "BeneMb", label: "Bene Mobile" },
  { key: "BeneAddr1", label: "Bene Addr 1" },
  { key: "BeneAddr2", label: "Bene Addr 2" },
  { key: "BeneAddr3", label: "Bene Addr 3" },
  { key: "BeneAddr4", label: "Bene Addr 4" },
  { key: "BeneAddr5", label: "Bene Addr 5" },
  { key: "city", label: "City" },
  { key: "zip", label: "Zip" },
  { key: "Country", label: "Country" },
  { key: "State", label: "State" },
  { key: "TelephoneNo", label: "Telephone No" },
  { key: "PaymentRef", label: "Payment Ref" },
  { key: "ChgBorneBy", label: "Chg Borne By" },
  { key: "CreditRefNo", label: "Credit Ref No" },
  { key: "PaymentDtl", label: "Payment Dtl" },
  { key: "PaymentDtl1", label: "Payment Dtl 1" },
  { key: "PaymentDtl2", label: "Payment Dtl 2" },
  { key: "PaymentDtl3", label: "Payment Dtl 3" },
  { key: "Enrichment1", label: "Enrichment 1" },
  { key: "Enrichment2", label: "Enrichment 2" },
];

const buildPayloadFromForm = (form) => {
  const {
    MessageId,
    MsgSource,
    ClientCode,
    BatchRefNmbr,
    Enrichment1,
    Enrichment2,
    ...instrumentRest
  } = form;

  const instrument = {
    ...instrumentRest,
    Enrichments: [Enrichment1, Enrichment2].filter((v) => String(v || "").trim()),
  };

  return {
    messageId: MessageId,
    requestHeader: {
      MessageId,
      MsgSource,
      ClientCode,
      BatchRefNmbr: BatchRefNmbr || MessageId,
    },
    instruments: [instrument],
  };
};

const Field = ({ label, value, onChange, disabled }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-medium text-slate-700">{label}</span>
    <input
      type="text"
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
    />
  </label>
);

const KotakPaymentDemo = () => {
  const [showForm, setShowForm] = useState(false);
  const [apiType, setApiType] = useState("payment");
  const [requestMode, setRequestMode] = useState("header");
  const [plainPayload, setPlainPayload] = useState("");
  const [encryptedPayload, setEncryptedPayload] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [lastXml, setLastXml] = useState("");
  const [copiedBankResponse, setCopiedBankResponse] = useState(false);

  const apiBase = useMemo(
    () => String(import.meta.env.VITE_API_URL || "").replace(/\/$/, ""),
    []
  );
  const config = useMemo(() => getCmsConfig(), []);
  const bankApiResponse =
    lastResponse?.bankResponse || lastResponse?.bankResponseRaw || "";

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setPlainPayload("");
    setEncryptedPayload("");
    setTokenInfo(null);
    setLastResponse(null);
    setLastXml("");
    setCopiedBankResponse(false);
    toast.success("Form reset to bank sample defaults");
  };

  const convertPlainPayload = async () => {
    const plain = plainPayload.trim();
    if (!plain) {
      toast.error("Enter a normal payload first");
      return null;
    }

    const result = await encryptDemoPayload(plain);
    if (!result.success) {
      toast.error(result.error || "Could not encrypt payload");
      return null;
    }

    setEncryptedPayload(result.encrypted);
    toast.success("Encrypted payload generated");
    return result.encrypted;
  };

  const buildStatusPayloadBody = async () => {
    if (requestMode === "payload") {
      const encrypted = encryptedPayload.replace(/\s/g, "");
      const plain = plainPayload.trim();

      if (!encrypted && !plain) {
        toast.error("Enter a normal status payload or an encrypted payload");
        return null;
      }

      if (encrypted) {
        return {
          mode: "payload",
          encryptedPayload: encrypted,
        };
      }

      toast.loading("Encrypting status payload…", { id: "kotak-demo" });
      const converted = await convertPlainPayload();
      if (!converted) {
        return null;
      }
      return {
        mode: "payload",
        encryptedPayload: converted,
      };
    }

    if (!String(form.MessageId || "").trim()) {
      toast.error("Message Id is required for status API");
      return null;
    }

    const statusPayload = {
      messageId: form.MessageId,
      instRefNo: form.InstRefNo || "",
      clientCode: form.ClientCode,
      msgSource: form.MsgSource,
    };
    setLastXml(buildStatusSoapXml(statusPayload));
    return statusPayload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLastResponse(null);
    setTokenInfo(null);
    setLastXml("");
    setCopiedBankResponse(false);

    try {
      if (apiType === "status") {
        const statusBody = await buildStatusPayloadBody();
        if (!statusBody) {
          return;
        }

        toast.loading("Step 1/2: Generating OAuth token (via backend)…", {
          id: "kotak-demo",
        });

        const tokenResult = await generateToken();
        if (!tokenResult.success) {
          toast.error(tokenResult.error || "Token generation failed", {
            id: "kotak-demo",
            duration: 10000,
          });
          setLastResponse(tokenResult);
          return;
        }

        setTokenInfo({
          access_token: tokenResult.access_token,
          token_type: tokenResult.token_type,
          expires_in: tokenResult.expires_in,
          scope: tokenResult.scope,
        });

        toast.loading("Step 2/2: Calling status API via backend…", {
          id: "kotak-demo",
        });

        const statusResult = await getPaymentStatus(statusBody);
        setLastResponse(statusResult);

        if (statusResult.encrypted) {
          setEncryptedPayload(statusResult.encrypted);
        }
        if (statusResult.requestXml) {
          setLastXml(statusResult.requestXml);
        }

        if (!statusResult.success) {
          toast.error(statusResult.error || "Status API failed", {
            id: "kotak-demo",
            duration: 12000,
          });
          return;
        }

        const first = (statusResult.details && statusResult.details[0]) || {};
        const code = statusResult.statusCode || first.statusCode || "—";
        const desc =
          statusResult.statusDesc ||
          first.statusDesc ||
          getCmsStatusLabel(code);
        const utr = statusResult.utr || first.utr || "";
        toast.success(
          `Status: ${code} · ${desc}${utr ? ` · UTR ${utr}` : ""}`,
          { id: "kotak-demo", duration: 10000 }
        );
        return;
      }

      let payBody = null;

      if (requestMode === "payload") {
        const encrypted = encryptedPayload.replace(/\s/g, "");
        const plain = plainPayload.trim();

        if (!encrypted && !plain) {
          toast.error("Enter a normal payload or an encrypted payload");
          return;
        }

        if (encrypted) {
          payBody = {
            mode: "payload",
            encryptedPayload: encrypted,
          };
        } else {
          toast.loading("Encrypting payload…", { id: "kotak-demo" });
          const converted = await convertPlainPayload();
          if (!converted) {
            return;
          }
          payBody = {
            mode: "payload",
            encryptedPayload: converted,
          };
        }
      }

      toast.loading("Step 1/2: Generating OAuth token (via backend)…", {
        id: "kotak-demo",
      });

      const tokenResult = await generateToken();
      if (!tokenResult.success) {
        toast.error(tokenResult.error || "Token generation failed", {
          id: "kotak-demo",
          duration: 10000,
        });
        setLastResponse(tokenResult);
        return;
      }

      setTokenInfo({
        access_token: tokenResult.access_token,
        token_type: tokenResult.token_type,
        expires_in: tokenResult.expires_in,
        scope: tokenResult.scope,
      });

      toast.loading("Step 2/2: Calling payment API via backend…", {
        id: "kotak-demo",
      });

      const payload =
        requestMode === "payload" ? payBody : buildPayloadFromForm(form);
      if (requestMode === "header") {
        setLastXml(buildPaymentSoapXml(payload));
      }

      const payResult = await initiateDemoPayment(payload);
      setLastResponse(payResult);

      if (payResult.encrypted) {
        setEncryptedPayload(payResult.encrypted);
      }

      if (!payResult.success) {
        toast.error(payResult.error || "Payment API failed", {
          id: "kotak-demo",
          duration: 12000,
        });
        return;
      }

      const rem = payResult.statusRem || "Payment API success";
      toast.success(
        `Payment response: StatusCd=${payResult.statusCd || "—"} · ${rem}`,
        { id: "kotak-demo", duration: 10000 }
      );
    } catch (error) {
      console.error("Kotak payment demo error:", error);
      toast.error(error.message || "Demo request failed", {
        id: "kotak-demo",
        duration: 10000,
      });
      setLastResponse({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-3 text-blue-700">
              <CreditCard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Kotak CMS Payment Demo
              </h1>
              <p className="text-sm text-slate-600">
                Server-side UAT flow: browser → Laravel API → Kotak (whitelisted
                IP)
              </p>
            </div>
          </div>

          <div className="mb-6 rounded border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
            <div>
              <span className="font-medium">Backend API:</span>{" "}
              {apiBase || "(set VITE_API_URL)"}
            </div>
            <div>
              <span className="font-medium">Proxy routes:</span>{" "}
              /kotak/cms/token · /kotak/cms/demo-payment · /kotak/cms/status
            </div>
            <div>
              <span className="font-medium">Kotak host (server only):</span>{" "}
              {config.apiUrl || "(configured on Laravel .env)"}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Play size={16} />
            Click Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Kotak CMS Payment Demo
          </h1>
          <p className="text-sm text-slate-600">
            Payment initiation or Reverse Feed status enquiry. Defaults match
            the bank sample / last accepted MessageId.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw size={14} />
            Reset defaults
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setApiType("payment")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              apiType === "payment"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            Payment API
          </button>
          <button
            type="button"
            onClick={() => setApiType("status")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              apiType === "status"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            Status API
          </button>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setRequestMode("header")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              requestMode === "header"
                ? "bg-slate-800 text-white"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            Request Header
          </button>
          <button
            type="button"
            onClick={() => setRequestMode("payload")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              requestMode === "payload"
                ? "bg-slate-800 text-white"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            Request payload
          </button>
        </div>

        {requestMode === "header" ? (
          apiType === "status" ? (
            <section>
              <h2 className="mb-3 text-base font-semibold text-slate-800">
                Status / Reverse Feed Header
              </h2>
              <p className="mb-3 text-xs text-slate-500">
                Calls Kotak <code>/v1/cms/rev</code> with MessageId from the
                payment response. Inst Ref No is optional (filters one
                instrument).
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {STATUS_FIELDS.map((f) => (
                  <Field
                    key={f.key}
                    label={f.label}
                    value={form[f.key]}
                    disabled={loading}
                    onChange={(v) => updateField(f.key, v)}
                  />
                ))}
              </div>
            </section>
          ) : (
            <>
              <section>
                <h2 className="mb-3 text-base font-semibold text-slate-800">
                  Request Header
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {HEADER_FIELDS.map((f) => (
                    <Field
                      key={f.key}
                      label={f.label}
                      value={form[f.key]}
                      disabled={loading}
                      onChange={(v) => updateField(f.key, v)}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-base font-semibold text-slate-800">
                  Instrument / Beneficiary
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {INSTRUMENT_FIELDS.map((f) => (
                    <Field
                      key={f.key}
                      label={f.label}
                      value={form[f.key]}
                      disabled={loading}
                      onChange={(v) => updateField(f.key, v)}
                    />
                  ))}
                </div>
              </section>
            </>
          )
        ) : (
          <section className="space-y-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Enter payload</span>
              <textarea
                value={plainPayload}
                disabled={loading}
                onChange={(e) => setPlainPayload(e.target.value)}
                rows={8}
                placeholder={
                  apiType === "status"
                    ? "Paste the normal status SOAP / XML payload (Reversal)"
                    : "Paste the normal SOAP / XML payload"
                }
                className="rounded border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </label>

            <div>
              <button
                type="button"
                onClick={convertPlainPayload}
                disabled={loading}
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Convert to encrypted payload
              </button>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">
                Enter encrypt payload
              </span>
              <textarea
                value={encryptedPayload}
                disabled={loading}
                onChange={(e) => setEncryptedPayload(e.target.value)}
                rows={8}
                placeholder="Paste an encrypted payload, or convert the normal payload above"
                className="rounded border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </label>
            <p className="text-xs text-slate-500">
              If the encrypted box has a value, that body is sent as-is. Otherwise
              the normal payload is encrypted first and shown here.
            </p>
          </section>
        )}

        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
              apiType === "status"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : apiType === "status" ? (
              <Search size={16} />
            ) : (
              <CreditCard size={16} />
            )}
            {loading
              ? "Calling Kotak…"
              : apiType === "status"
                ? "Generate Token & Check Status"
                : "Generate Token & Pay"}
          </button>
        </div>
      </form>

      {tokenInfo && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <div className="font-semibold text-emerald-900">Token generated</div>
          <div className="mt-1 break-all text-emerald-800">
            {tokenInfo.token_type} · expires_in={tokenInfo.expires_in}s · scope=
            {tokenInfo.scope}
          </div>
          <div className="mt-1 break-all font-mono text-xs text-emerald-900">
            {tokenInfo.access_token}
          </div>
        </div>
      )}

      {lastResponse && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            API Response
          </h3>
          <pre className="max-h-80 overflow-auto rounded bg-white p-3 text-xs text-slate-800">
            {JSON.stringify(lastResponse, null, 2)}
          </pre>
        </div>
      )}

      {lastXml && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            SOAP XML preview (encryption happens on Laravel)
          </h3>
          <pre className="max-h-64 overflow-auto rounded bg-white p-3 text-xs">
            {lastXml}
          </pre>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Bank API Response
          </h3>
          <button
            type="button"
            disabled={!bankApiResponse}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(bankApiResponse);
                setCopiedBankResponse(true);
                toast.success("Bank API response copied");
              } catch {
                toast.error("Could not copy bank API response");
              }
            }}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
          >
            {copiedBankResponse ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded bg-white p-3 text-xs text-slate-800">
          {bankApiResponse ||
            "Bank response will appear here after Generate Token & Pay / Check Status."}
        </pre>
      </div>
    </div>
  );
};

export default KotakPaymentDemo;
