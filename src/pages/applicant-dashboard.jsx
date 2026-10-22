import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Store,
  MapPin,
  Building2,
  Ruler,
  LogOut,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Search,
  Hourglass,
  KeyRound,
  XCircle,
  Lock,
  Info,
  Bell,
  X,
  Printer,
Download,
  CreditCard,
} from "lucide-react";
import {
  PortalPage, PortalLoader, HeroBanner, HeroButton, StatCard, StatGrid, Panel,
  TrendChart, BarsChart, DonutChart, EmptyState, Badge, ProgressRow, stageKind,
  countBy, monthlyCounts, greeting, todayLabel, CREAM,
} from "../components/dashboard/portalkit";

const ApplicantDashboard = ({ user, onLogout }) => {
// Date format helper - backend returns plain "YYYY-MM-DD" strings.
// We avoid new Date() here because it shifts the day due to timezone.
const fmtDate = (d) => {
  if (!d) return "-";
  const str = String(d).slice(0, 10); // YYYY-MM-DD
  const parts = str.split("-");
  if (parts.length !== 3) return str;
  const [y, m, day] = parts;
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mi = parseInt(m, 10) - 1;
  if (isNaN(mi) || !monthNames[mi]) return str;
  return `${day} ${monthNames[mi]} ${y}`;
};
  const [shops, setShops] = useState([]);
  const [shopMeta, setShopMeta] = useState({});
  const [rentals, setRentals] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyFor, setApplyFor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [allotments, setAllotments] = useState([]);
  const [flowStep, setFlowStep] = useState(null); // { agreement, step }
  const [signName, setSignName] = useState("");
  const [docFiles, setDocFiles] = useState([]);
  const [depositForm, setDepositForm] = useState({
    amount: "",
    payment_ref: "",
    payment_mode: "Cash",
  });
  const [flowLoading, setFlowLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [detail, setDetail] = useState(null); // { application, timeline, agreement }
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({
    SPR_Id: "",
    Busi_Name: "",
    Busi_Type: "",
    PAN_No: "",
    PAN_Image: null,
    SPRA_Reason: "",
    SPRA_Remark: "",
  });

  const displayName = user?.name || user?.username || "Applicant";
  const email = user?.email || "";

  const fetchAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };
      const base = import.meta.env.VITE_API_URL;

const [shopRes, rentRes, appRes, notifRes] = await Promise.all([
      axios.get(`${base}/applicant/available-shops`, { headers }),
      axios.get(`${base}/applicant/rentals`, { headers }),
      axios.get(`${base}/applicant/my-applications`, { headers }),
      axios
        .get(`${base}/applicant/notifications`, { headers })
        .catch(() => ({ data: { success: false } })),
    ]);

      if (shopRes.data.success) {
        setShops(shopRes.data.data || []);
        setShopMeta(shopRes.data.meta || {});
      }
      if (rentRes.data.success) setRentals(rentRes.data.data || []);
      if (appRes.data.success) setApplications(appRes.data.data || []);
      if (notifRes.data?.success) {
        setNotifications(notifRes.data.data.items || []);
        setUnreadCount(notifRes.data.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Applicant dashboard load failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openApply = (shop) => {
    setApplyFor(shop);
    setForm({
      SPR_Id: shop?.rental?.SPR_Id || "",
      Busi_Name: "",
      Busi_Type: "",
      PAN_No: "",
      PAN_Image: null,
      SPRA_Reason: "",
      SPRA_Remark: "",
    });
  };

  // ============ AGREEMENT FLOW: Agree -> Upload -> Deposit ============
  // ============ NOTIFICATIONS ============
  const openNotifications = async () => {
    const next = !showNotif;
    setShowNotif(next);
    if (!next || unreadCount === 0) return;

    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/applicant/notifications/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, Ntf_Status: "read" }))
      );
    } catch {
      // silently ignore - will retry on next open
    }
  };

  // ============ APPLICATION DETAIL ============
  const openDetail = async (appId) => {
    try {
      setDetailLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/applicant/application/${appId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setDetail(res.data.data);
      else toast.error(res.data.message || "Unable to load details");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to load application details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const openFlow = (agreement, step = 1) => {
    setSignName(displayName);
    setDocFiles([]);
    setDepositForm({
      amount: agreement?.SPRG_DepAmt ?? agreement?.SPRG_SdMn ?? "",
      payment_ref: "",
      payment_mode: "Cash",
    });
    setFlowStep({ agreement, step });
  };

  const submitAgree = async () => {
    try {
      setFlowLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/applicant/agreement/agree`,
        { agreement_id: flowStep.agreement.SPRG_Id, sign_name: signName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Agreement accepted");
        setFlowStep((p) => ({ ...p, agreement: res.data.data, step: 2 }));
        fetchAll();
      } else {
        toast.error(res.data.message || "Failed to accept");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept agreement");
    } finally {
      setFlowLoading(false);
    }
  };

  const submitDocs = async () => {
    if (docFiles.length === 0) {
      toast.error("Please select at least one document");
      return;
    }
    try {
      setFlowLoading(true);
      const token = localStorage.getItem("auth_token");
      const fd = new FormData();
      fd.append("agreement_id", flowStep.agreement.SPRG_Id);
      docFiles.forEach((f) => fd.append("documents[]", f));

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/applicant/agreement/documents`,
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Documents uploaded");
        setFlowStep((p) => ({ ...p, agreement: res.data.data, step: 3 }));
        fetchAll();
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch (err) {
      const msgs = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(", ")
        : null;
      toast.error(msgs || err.response?.data?.message || "Upload failed");
    } finally {
      setFlowLoading(false);
    }
  };

  const submitDeposit = async () => {
    if (!depositForm.payment_ref.trim()) {
      toast.error("Please enter payment reference");
      return;
    }
    try {
      setFlowLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/applicant/agreement/deposit`,
        {
          agreement_id: flowStep.agreement.SPRG_Id,
          amount: Number(depositForm.amount) || 0,
          payment_ref: depositForm.payment_ref.trim(),
          payment_mode: depositForm.payment_mode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Deposit paid - shop is now yours!");
        setFlowStep(null);
        fetchAll();
      } else {
        toast.error(res.data.message || "Payment failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setFlowLoading(false);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();

    if (!form.Busi_Name.trim()) {
      toast.error("Please enter business name");
      return;
    }

    const pan = (form.PAN_No || "").toUpperCase().replace(/\s+/g, "");
    if (!pan) {
      toast.error("Please enter PAN card number");
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      toast.error("Invalid PAN format. Example: ABCDE1234F");
      return;
    }
    if (!form.PAN_Image) {
      toast.error("Please upload PAN card image");
      return;
    }
    if (!applyFor?.rental?.SPR_Date) {
      toast.error("Tenure has not been set by the management yet");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("auth_token");

      // PAN image is a file - use FormData
      const fd = new FormData();
      fd.append("SPR_Id", form.SPR_Id);
      fd.append("Busi_Name", form.Busi_Name.trim());
      if (form.Busi_Type) fd.append("Busi_Type", form.Busi_Type.trim());
      fd.append("PAN_No", pan);
      fd.append("PAN_Image", form.PAN_Image);
      if (form.SPRA_Reason) fd.append("SPRA_Reason", form.SPRA_Reason.trim());
      if (form.SPRA_Remark) fd.append("SPRA_Remark", form.SPRA_Remark.trim());

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/applicant/apply`,
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Application submitted! Admin will review it.");
        setApplyFor(null);
        fetchAll();
      } else {
        toast.error(response.data.message || "Failed to submit application");
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const msgs = Object.values(error.response.data.errors).flat();
        toast.error(msgs.join(", "));
      } else {
        toast.error(error.response?.data?.message || "Failed to submit");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusOf = (app) => {
    if (app.status?.stage) return app.status.stage;
    if (app.SPRA_Status) return "Pending";
    return "Submitted";
  };

  const [query, setQuery] = useState("");

  const stageCounts = useMemo(
    () => countBy(applications, (a) => statusOf(a)),
    [applications]
  );
  const approvedCount = applications.filter((a) => stageKind(statusOf(a)) === "success").length;
  const rejectedCount = applications.filter((a) => stageKind(statusOf(a)) === "danger").length;
  const pendingCount = applications.length - approvedCount - rejectedCount;
  const appsByMonth = useMemo(
    () => monthlyCounts(applications, (a) => a.SPRA_Date, 6),
    [applications]
  );
  const shopsByBuilding = useMemo(
    () => countBy(shops, (s) => s.SPM_Bldg || "Other").slice(0, 8),
    [shops]
  );
  const rentCompare = useMemo(
    () =>
      shops
        .filter((s) => s.rental)
        .slice(0, 8)
        .map((s) => ({
          label: s.SPM_Code || s.SPM_Name || "Shop",
          rent: Number(s.rental.SPR_BsRnt) || 0,
          deposit: Number(s.rental.SPR_SDMnt) || 0,
        })),
    [shops]
  );
  // Sirf AVAILABLE shops dikhao:
  //  - "Not Yet Open"    (rental entry nahi hai) hatao
  //  - "Already Assigned" (agreement ban chuka hai) hatao
  // Backend pehle filter kar chuka hai, ye extra safety hai.
  const availableShops = shops.filter(
    (s) => !s.is_allotted && s.rental && s.rental.SPR_Date
  );

  const filteredShops = availableShops.filter((s) =>
    `${s.SPM_Name || ""} ${s.SPM_Code || ""} ${s.SPM_Loca || ""} ${s.SPM_Bldg || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  if (loading) return <PortalLoader text="Loading your portal..." />;

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-red-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/ambajilogo.png" alt="Ambaji Temple" className="h-10 w-10 object-contain" />
            <div>
              <p className="text-sm font-bold leading-tight text-gray-900">Applicant Portal</p>
              <p className="text-[11px] leading-tight text-gray-500">Shree Ambaji Mata Temple Trust</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
            <button onClick={fetchAll} title="Refresh"
              className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={openNotifications}
                title="Notifications"
                className="relative rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50"
              >
                <Bell className="h-4 w-4 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowNotif(false)}
                  />
                  <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                      <p className="text-sm font-semibold text-gray-900">
                        Notifications
                      </p>
                      <button
                        onClick={() => setShowNotif(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-xs text-gray-500">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.map((n) => {
                          const tone =
                            n.Ntf_Type === "action_required"
                              ? "bg-amber-100 text-amber-700"
                              : n.Ntf_Type === "success"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700";

                          return (
                            <div
                              key={n.Ntf_Id}
                              className={`border-b border-gray-50 px-4 py-3 last:border-0 ${
                                n.Ntf_Status === "unread" ? "bg-blue-50/40" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span
                                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tone}`}
                                >
                                  {n.Ntf_Type === "success" ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : n.Ntf_Type === "action_required" ? (
                                    <AlertCircle className="h-3.5 w-3.5" />
                                  ) : (
                                    <Info className="h-3.5 w-3.5" />
                                  )}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-900">
                                    {n.Ntf_Title}
                                  </p>
                                  <p className="mt-0.5 text-[11px] leading-snug text-gray-600">
                                    {n.Ntf_Message}
                                  </p>
                                  <p className="mt-1 text-[10px] text-gray-400">
                                    {new Date(n.created_at).toLocaleString("en-IN")}
                                  </p>
</div>

                  {/* Signatures + download */}
                  <div className="mt-3 border-t border-emerald-200 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                          detail.agreement.SPRG_Agreed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-white text-gray-500"
                        }`}
                      >
                        {detail.agreement.SPRG_Agreed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        <span className="truncate">
                          {detail.agreement.SPRG_Agreed
                            ? `You: ${detail.agreement.SPRG_SignName || "Signed"}`
                            : "Your signature pending"}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                          detail.agreement.SPRG_MgrAgreed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-white text-gray-500"
                        }`}
                      >
                        {detail.agreement.SPRG_MgrAgreed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        <span className="truncate">
                          {detail.agreement.SPRG_MgrAgreed
                            ? `Trust: ${detail.agreement.SPRG_MgrSign || "Signed"}`
                            : "Trust signature pending"}
                        </span>
                      </div>
                    </div>

                    {detail.agreement.fully_signed ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={detail.agreement.view_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          <FileText className="h-3.5 w-3.5" /> View Agreement
                        </a>
                        <a
                          href={detail.agreement.download_url}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          <Download className="h-3.5 w-3.5" /> Download PDF
                        </a>
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] text-emerald-700">
                        You will be able to view and download the agreement once it is
                        signed by both you and the Trust.
                      </p>
                    )}
                  </div>
                </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <PortalPage>
        <HeroBanner
          eyebrow={todayLabel()}
          title={`${greeting()}, ${displayName}`}
          subtitle="Apply for temple shops and track every application in one place"
          actions={
            <HeroButton solid icon={Store}
              onClick={() => document.getElementById("available-shops")?.scrollIntoView({ behavior: "smooth" })}>
              Browse shops
            </HeroButton>
          }
        />

        {/* Stats */}
        <StatGrid cols={5}>
          <StatCard label="Available Shops" value={shops.length} sub="Open for application" icon={Store} tone="red" />
          <StatCard
            label="Applied"
            value={applications.length}
            sub="Submitted by you"
            icon={FileText}
            tone="teal"
          />
          <StatCard label="Approved" value={approvedCount} sub="Ready to proceed" icon={CheckCircle2} tone="green" />
          <StatCard label="In Review" value={pendingCount} sub="Awaiting decision" icon={Hourglass} tone="gold" />
          <StatCard label="Active Rentals" value={rentals.length} sub="Shops allotted" icon={KeyRound} tone="slate" />
        </StatGrid>


        <Panel title="Approval Overview">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <ProgressRow label="Approved" value={approvedCount} total={applications.length} color="#059669" />
            <ProgressRow label="In review" value={pendingCount} total={applications.length} color="#F5B800" />
            <ProgressRow label="Rejected" value={rejectedCount} total={applications.length} color="#B71C1C" />
          </div>
        </Panel>

        {/* Available Shops */}
        <div id="available-shops">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Available Shops</h2>
              <p className="text-sm text-gray-500">
                Only shops that are open for application are listed here.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, code or location"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {filteredShops.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
              <Store className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                {shops.length === 0
                  ? "No shops are open for application right now. Please check back later."
                  : "No shops match your search"}
              </p>
              {shopMeta.assigned_count > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  ({shopMeta.assigned_count} shop
                  {shopMeta.assigned_count > 1 ? "s are" : " is"} already assigned)
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredShops.map((shop) => (
                <div key={shop.SPM_Id}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                        <Store className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{shop.SPM_Name || "Shop"}</h3>
                    </div>
                    <Badge kind="neutral">{shop.SPM_Code}</Badge>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    {shop.SPM_Loca && (
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" />{shop.SPM_Loca}</div>
                    )}
                    {shop.SPM_Bldg && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        {shop.SPM_Bldg}{shop.SPM_Unit ? ` - Unit ${shop.SPM_Unit}` : ""}
                      </div>
                    )}
                    {shop.SPM_SqFt && (
                      <div className="flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5 text-gray-400" />{shop.SPM_SqFt} sq.ft</div>
                    )}
                  </div>

                  {shop.rental && (
                    <div className="mt-3 mb-4 grid grid-cols-3 gap-2 rounded-xl px-3 py-2 text-center" style={{ background: CREAM }}>
                      <div><p className="text-[10px] text-gray-500">Base Rent</p><p className="text-xs font-semibold text-gray-900">₹{shop.rental.SPR_BsRnt ?? "0"}</p></div>
                      <div>
                          <p className="text-[10px] text-gray-500">Security</p>
                          <p className="text-xs font-semibold text-gray-900">
                            ₹{shop.rental.SPR_SDAmt ?? 0}
                          </p>
                          {shop.rental.SPR_SDMnt > 0 && (
                            <p className="text-[9px] text-gray-400">
                              {shop.rental.SPR_SDMnt} months
                            </p>
                          )}
                        </div>
                      <div><p className="text-[10px] text-gray-500">Late Fee</p><p className="text-xs font-semibold text-gray-900">₹{shop.rental.SPR_LtFe ?? "0"}</p></div>
                    </div>
                  )}

                  <div className="mt-auto space-y-2 border-t border-gray-100 pt-3">
                    {/* Tenure admin ke rental se (start -> end) */}
                    {shop.rental?.SPR_Date && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Tenure</span>
                          <span className="font-semibold text-gray-900">
                            {shop.rental.SPR_EdDt
                              ? `${fmtDate(shop.rental.SPR_Date)} → ${fmtDate(shop.rental.SPR_EdDt)}`
                              : fmtDate(shop.rental.SPR_Date)}
                          </span>
                        </div>
                        {shop.rental.SPR_Dura > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-semibold text-gray-900">
                              {shop.duration_text ||
                                `${shop.rental.SPR_Dura} Months`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {shop.already_applied ? (
                      <div className="rounded-lg bg-gray-100 px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                          <Clock className="h-4 w-4" />
                          Application Submitted
                        </div>
                        <p className="mt-1 text-[11px] text-gray-600">
                          Your application is under review
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => openApply(shop)}
                        className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Apply for this Shop
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Applications */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
          <p className="mb-4 text-sm text-gray-500">Track status of applications you submitted.</p>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">You have not applied for any shop yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const stage = statusOf(app);
                const kind = stageKind(stage);
                return (
                  <div key={app.SPRA_Id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <FileText className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-semibold text-gray-900">{app.Busi_Name}</span>
                          {app.SPRA_No && (
                            <span className="rounded-md bg-gray-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                              {app.SPRA_No}
                            </span>
                          )}
                          {app.Busi_Type && <Badge kind="neutral">{app.Busi_Type}</Badge>}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Applied on {app.SPRA_Date ? new Date(app.SPRA_Date).toLocaleDateString("en-IN") : "-"}
                          </span>
                          {app.rental?.shop?.SPM_Name && (
                            <span className="flex items-center gap-1.5">
                              <Store className="h-3.5 w-3.5" />
                              {app.rental.shop.SPM_Name}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge kind={kind}>
                        {kind === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : kind === "danger" ? <XCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                        {stage}
                      </Badge>
                    </div>

                    {/* Action required banner - shown when agreement is pending */}
                    {app.agreement?.SPRG_Status === "PENDING_AGREEMENT" && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                        <p className="text-xs font-medium text-amber-800">
                          Action required: accept the agreement, upload your documents
                          and pay the security deposit
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => openDetail(app.SPRA_Id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <FileText className="h-3.5 w-3.5" /> View Full Details
                      </button>
                    </div>

                    {app.agreement && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-800">
                              Agreement {app.agreement.SPRG_No}
                            </span>
                          </div>
                          <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-medium text-white">
                            {app.agreement.SPRG_Status || "ACTIVE"}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                          <div className="rounded-md bg-white px-2.5 py-1.5">
                            <p className="text-gray-500">Monthly Rent</p>
                            <p className="font-semibold text-gray-900">₹{app.agreement.SPRG_MnRt ?? "0"}</p>
                          </div>
                          <div className="rounded-md bg-white px-2.5 py-1.5">
                            <p className="text-gray-500">Start</p>
                            <p className="font-semibold text-gray-900">
                              {app.agreement.SPRG_StDt ? new Date(app.agreement.SPRG_StDt).toLocaleDateString("en-IN") : "-"}
                            </p>
                          </div>
                          <div className="rounded-md bg-white px-2.5 py-1.5">
                            <p className="text-gray-500">End</p>
                            <p className="font-semibold text-gray-900">
                              {app.agreement.SPRG_EdDt ? new Date(app.agreement.SPRG_EdDt).toLocaleDateString("en-IN") : "-"}
                            </p>
                          </div>
                          <div className="rounded-md bg-white px-2.5 py-1.5">
                            <p className="text-gray-500">Ref No</p>
                            <p className="truncate font-semibold text-gray-900">{app.agreement.SPRG_StRef || "-"}</p>
                          </div>
                        </div>
{Array.isArray(app.agreement.SPRG_Doc) &&
                          app.agreement.SPRG_Doc.length > 0 && (
                            <div className="mt-3">
                              <p className="mb-1.5 text-[11px] font-medium text-emerald-800">
                                Your Documents
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {app.agreement.SPRG_Doc.map((doc, i) => (
                                  <a
                                    key={i}
                                    href={typeof doc === "string" ? doc : doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                                  >
                                    <FileText className="h-3 w-3" />
                                    {typeof doc === "string"
                                      ? doc.split("/").pop()
                                      : doc.name || `Document ${i + 1}`}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* 3-step flow: Agree -> Documents -> Deposit */}
                        {app.agreement.SPRG_Status === "PENDING_AGREEMENT" && (
                          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                            <p className="text-xs font-semibold text-amber-900">
                              Complete these steps to get your shop
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className={`rounded-full px-2 py-0.5 font-medium ${app.agreement.SPRG_Agreed ? "bg-emerald-600 text-white" : "bg-white text-amber-800 border border-amber-300"}`}>
                                1. Agree
                              </span>
                              <span className={`rounded-full px-2 py-0.5 font-medium ${(app.agreement.SPRG_Doc || []).length > 0 ? "bg-emerald-600 text-white" : "bg-white text-amber-800 border border-amber-300"}`}>
                                2. Documents
                              </span>
                              <span className={`rounded-full px-2 py-0.5 font-medium ${app.agreement.SPRG_DepPaid ? "bg-emerald-600 text-white" : "bg-white text-amber-800 border border-amber-300"}`}>
                                3. Deposit ₹{app.agreement.SPRG_DepAmt ?? app.agreement.SPRG_SdMn ?? "0"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {!app.agreement.SPRG_Agreed && (
                                <button
                                  onClick={() => openFlow(app.agreement, 1)}
                                  className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                >
                                  Accept Agreement
                                </button>
                              )}
                              {app.agreement.SPRG_Agreed && (app.agreement.SPRG_Doc || []).length === 0 && (
                                <button
                                  onClick={() => openFlow(app.agreement, 2)}
                                  className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                >
                                  Upload Documents
                                </button>
                              )}
                              {app.agreement.SPRG_Agreed && (app.agreement.SPRG_Doc || []).length > 0 && !app.agreement.SPRG_DepPaid && (
                                <button
                                  onClick={() => openFlow(app.agreement, 3)}
                                  className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                                >
                                  Pay Security Deposit
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {app.agreement.SPRG_Status === "ACTIVE" && app.agreement.SPRG_DepPaid && (
                          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white">
                            <CheckCircle2 className="h-4 w-4" />
                            Shop allotted - deposit paid ({app.agreement.SPRG_DepMode || "Manual"}
                            {app.agreement.SPRG_DepRef ? `, Ref: ${app.agreement.SPRG_DepRef}` : ""})
                          </div>
                        )}

                        {/* Agreement sign status + view/download */}
                        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-[11px] font-semibold text-gray-700">
                            Agreement Signatures
                          </p>

                          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                            <div
                              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                                app.agreement.SPRG_Agreed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {app.agreement.SPRG_Agreed ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              <span className="truncate">
                                {app.agreement.SPRG_Agreed
                                  ? `You: ${app.agreement.SPRG_SignName || "Signed"}`
                                  : "Your signature"}
                              </span>
                            </div>

                            <div
                              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                                app.agreement.SPRG_MgrAgreed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {app.agreement.SPRG_MgrAgreed ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              <span className="truncate">
                                {app.agreement.SPRG_MgrAgreed
                                  ? `Trust: ${app.agreement.SPRG_MgrSign || "Signed"}`
                                  : "Trust signature"}
                              </span>
                            </div>
                          </div>

                          {app.agreement.fully_signed ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <a
                                href={app.agreement.view_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                              >
                                <FileText className="h-3.5 w-3.5" /> View Agreement
                              </a>
                              <a
                                href={app.agreement.download_url}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                              >
                                <Download className="h-3.5 w-3.5" /> Download PDF
                              </a>
                            </div>
                          ) : (
                            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-gray-500">
                              <Info className="mt-0.5 h-3 w-3 shrink-0" />
                              You will be able to view and download the
                              agreement once it is signed by both you and
                              the Trust.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PortalPage>

      {/* Apply Modal */}
      {applyFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Apply for Shop
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {applyFor.SPM_Name} ({applyFor.SPM_Code})
                </p>
              </div>
              <button
                onClick={() => setApplyFor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className="h-5 w-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={submitApplication} className="px-5 py-4 space-y-4">
              <input type="hidden" value={form.SPR_Id} readOnly />

              {!form.SPR_Id && (
                <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                  This shop does not have a rental configuration yet. Please contact the temple office.
                </p>
              )}

              {/* Applicant will be auto-filled */}
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <p className="text-xs text-gray-500">Applicant (auto)</p>
                <p className="text-sm font-medium text-gray-900">
                  {displayName}
                  {email ? ` · ${email}` : ""}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={form.Busi_Name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, Busi_Name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Enter business name"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Business Type
                </label>
                <input
                  type="text"
                  value={form.Busi_Type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, Busi_Type: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
placeholder="e.g. Grocery, Garments, Restaurant"
                  maxLength={150}
                />
              </div>

              {/* ---------- PAN Card (identity + duplicate guard) ---------- */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-700" />
                  <p className="text-xs font-semibold text-amber-900">
                    PAN Card Details *
                  </p>
                </div>

                <div className="mt-2.5">
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    PAN Number *
                  </label>
                  <input
                    type="text"
                    value={form.PAN_No}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        PAN_No: e.target.value.toUpperCase().replace(/\s+/g, ""),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                  <p className="mt-1 text-[11px] text-gray-600">
                    Format: 5 letters + 4 digits + 1 letter
                  </p>
                </div>

                <div className="mt-2.5">
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    PAN Card Image *
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        PAN_Image: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-amber-600 file:px-3 file:py-1.5 file:text-white"
                  />
                  {form.PAN_Image && (
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {form.PAN_Image.name}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-gray-600">
                    JPG / PNG / PDF, max 5MB
                  </p>
                </div>

                <p className="mt-2 flex items-start gap-1.5 rounded-md bg-white/70 px-2 py-1.5 text-[11px] text-amber-900">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  One PAN card can be used for only ONE application per shop. Duplicate
                  applications are blocked automatically.
                </p>
              </div>

              {/* Tenure admin ke rental se auto */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div className="w-full">
                    <p className="text-[10px] uppercase tracking-wide text-blue-600">
                      Lease Tenure (auto from admin)
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span>{fmtDate(applyFor?.rental?.SPR_Date)}</span>
                      <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-blue-500" />
                      <span>{fmtDate(applyFor?.rental?.SPR_EdDt)}</span>
                    </div>
                    {applyFor?.rental?.SPR_Dura && (
                      <p className="mt-0.5 text-xs text-blue-700">
                        {applyFor.duration_text ||
                          `${applyFor.rental.SPR_Dura} Months`}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-blue-700">
                  This tenure is set by the temple management and cannot be changed by you.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Reason
                </label>
                <input
                  type="text"
                  value={form.SPRA_Reason}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, SPRA_Reason: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Why do you want this shop?"
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Remarks
                </label>
                <textarea
                  value={form.SPRA_Remark}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, SPRA_Remark: e.target.value }))
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                  placeholder="Any additional information"
                  maxLength={255}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyFor(null)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.SPR_Id}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agreement Flow Modal: 1 Agree -> 2 Documents -> 3 Deposit */}
      {flowStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {flowStep.step === 1 && "Accept Agreement"}
                  {flowStep.step === 2 && "Upload Documents"}
                  {flowStep.step === 3 && "Pay Security Deposit"}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Agreement {flowStep.agreement.SPRG_No}
                </p>
              </div>
              <button
                onClick={() => setFlowStep(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {flowStep.step === 1 && (
                <>
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                    <p className="mb-1 font-semibold">Terms</p>
                    <p>Monthly Rent: ₹{flowStep.agreement.SPRG_MnRt ?? "0"}</p>
                    <p>Security Deposit: ₹{flowStep.agreement.SPRG_SdMn ?? "0"}</p>
                    <p>Period: {flowStep.agreement.SPRG_StDt || "-"} to {flowStep.agreement.SPRG_EdDt || "-"}</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Your Full Name (Signature) *
                    </label>
                    <input
                      type="text"
                      value={signName}
                      onChange={(e) => setSignName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      placeholder="Type your full name"
                      maxLength={100}
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-gray-600">
                    <input type="checkbox" defaultChecked className="mt-0.5" />
                    I have read and agree to all the terms and conditions of this
                    shop rent agreement.
                  </label>
                </>
              )}

              {flowStep.step === 2 && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Upload Documents (ID proof, business proof) *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setDocFiles(Array.from(e.target.files || []))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-amber-600 file:px-3 file:py-1.5 file:text-white"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    JPG / PNG / PDF, max 5MB each
                  </p>
                  {docFiles.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {docFiles.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                          <FileText className="h-3.5 w-3.5 text-amber-600" />
                          {f.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {flowStep.step === 3 && (
                <>
                  <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                    Deposit Amount: ₹{flowStep.agreement.SPRG_DepAmt ?? flowStep.agreement.SPRG_SdMn ?? "0"}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Amount Paid *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={depositForm.amount}
                      onChange={(e) =>
                        setDepositForm((p) => ({ ...p, amount: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        Payment Mode
                      </label>
                      <select
                        value={depositForm.payment_mode}
                        onChange={(e) =>
                          setDepositForm((p) => ({ ...p, payment_mode: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option>Cash</option>
                        <option>Cheque</option>
                        <option>NEFT/RTGS</option>
                        <option>UPI</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        Reference No *
                      </label>
                      <input
                        type="text"
                        value={depositForm.payment_ref}
                        onChange={(e) =>
                          setDepositForm((p) => ({ ...p, payment_ref: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Ref number"
                        maxLength={100}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-200 px-5 py-4">
              <button
                onClick={() => setFlowStep(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={
                  flowStep.step === 1
                    ? submitAgree
                    : flowStep.step === 2
                      ? submitDocs
                      : submitDeposit
                }
                disabled={flowLoading}
                className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {flowLoading
                  ? "Please wait..."
                  : flowStep.step === 1
                    ? "Accept Agreement"
                    : flowStep.step === 2
                      ? "Upload Documents"
                      : "Pay Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal - full info + approval timeline */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Application Details
                </h3>
                <p className="mt-0.5 font-mono text-xs text-gray-500">
                  {detail.application.SPRA_No}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  title="Print"
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDetail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["Token No", detail.application.SPRA_No],
                  ["Applied On", detail.application.SPRA_Date],
                  ["Business Name", detail.application.Busi_Name],
                  ["Business Type", detail.application.Busi_Type || "-"],
                  ["Shop", detail.application.shop?.SPM_Name || "-"],
                  ["Lease Tenure", detail.application.tenure_text || "-"],
                  ["PAN Number", detail.application.PAN_No || "-"],
                  [
                    "Monthly Rent",
                    `₹${detail.application.rental?.SPR_BsRnt ?? "0"}`,
                  ],
                  ["Current Status", detail.application.status_name || "-"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">
                      {label}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-gray-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* PAN card image */}
              {detail.application.PAN_Image && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-amber-700">
                    PAN Card Submitted
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={detail.application.PAN_Image}
                      alt="PAN Card"
                      className="h-20 w-32 rounded-md border border-amber-200 bg-white object-cover"
                    />
                    <div>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {detail.application.PAN_No}
                      </p>
                      <a
                        href={detail.application.PAN_Image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline"
                      >
                        <FileText className="h-3 w-3" /> View full image
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason / remarks */}
              {(detail.application.SPRA_Reason ||
                detail.application.Status_Remark) && (
                <div className="space-y-2">
                  {detail.application.SPRA_Reason && (
                    <div className="rounded-lg border border-gray-200 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        Your Reason
                      </p>
                      <p className="mt-0.5 text-xs text-gray-800">
                        {detail.application.SPRA_Reason}
                      </p>
                    </div>
                  )}
                  {detail.application.Status_Remark && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-amber-700">
                        Official Remark
                      </p>
                      <p className="mt-0.5 text-xs text-amber-900">
                        {detail.application.Status_Remark}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Approval timeline */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-900">
                  Approval Progress
                </p>
                <div className="space-y-0">
                  {detail.timeline.map((t, i) => {
                    const done = t.state === "done";
                    const current = t.state === "current";

                    return (
                      <div key={`${t.Act_Id}-${i}`} className="flex gap-3">
                        {/* rail */}
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                              done
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : current
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-300 bg-white text-gray-300"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : current ? (
                              <Hourglass className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                          </span>
                          {i < detail.timeline.length - 1 && (
                            <span
                              className={`w-0.5 flex-1 ${
                                done ? "bg-emerald-600" : "bg-gray-200"
                              }`}
                              style={{ minHeight: 20 }}
                            />
                          )}
                        </div>

                        <div className="pb-4">
                          <p
                            className={`text-xs font-medium ${
                              current
                                ? "text-blue-700"
                                : done
                                  ? "text-emerald-700"
                                  : "text-gray-400"
                            }`}
                          >
                            {t.name}
                            {current && (
                              <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px]">
                                Current
                              </span>
                            )}
                          </p>
                          {t.remark && (
                            <p className="text-[11px] text-gray-500">
                              {t.remark}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agreement summary */}
              {detail.agreement && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                  <p className="text-xs font-semibold text-emerald-800">
                    Agreement {detail.agreement.SPRG_Id
                      ? `AGR/${String(detail.agreement.SPRG_Id).padStart(5, "0")}`
                      : ""}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-semibold text-gray-900">
                        {detail.agreement.SPRG_Status}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rent</p>
                      <p className="font-semibold text-gray-900">
                        ₹{detail.agreement.SPRG_MnRt ?? "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Deposit</p>
                      <p className="font-semibold text-gray-900">
                        ₹{detail.agreement.SPRG_DepAmt ?? detail.agreement.SPRG_SdMn ?? "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Period</p>
                      <p className="font-semibold text-gray-900">
                        {detail.agreement.SPRG_StDt} → {detail.agreement.SPRG_EdDt}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
              {detail.agreement?.SPRG_Status === "PENDING_AGREEMENT" && (
                <button
                  onClick={() => {
                    const agr = {
                      SPRG_Id: detail.agreement.SPRG_Id,
                      SPRG_No: `AGR/${String(detail.agreement.SPRG_Id).padStart(5, "0")}`,
                      SPRG_MnRt: detail.agreement.SPRG_MnRt,
                      SPRG_SdMn: detail.agreement.SPRG_SdMn,
                      SPRG_DepAmt: detail.agreement.SPRG_DepAmt ?? detail.agreement.SPRG_SdMn,
                      SPRG_StDt: detail.agreement.SPRG_StDt,
                      SPRG_EdDt: detail.agreement.SPRG_EdDt,
                      SPRG_Agreed: false,
                      SPRG_Doc: null,
                      SPRG_DepPaid: false,
                    };
                    setDetail(null);
                    openFlow(agr, 1);
                  }}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Complete Agreement
                </button>
              )}
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-4 text-sm text-gray-700">
            Loading details...
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;