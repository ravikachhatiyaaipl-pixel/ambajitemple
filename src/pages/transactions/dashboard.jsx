"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  RefreshCw,
  FileText,
  TrendingUp,
  BarChart3,
  Receipt as ReceiptIcon,
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Sparkles,
  User,
  Bot,
  Loader2,
  ChevronDown,
  ChevronUp,
  Home,
  HelpCircle,
  Zap,
  Settings,
  Menu,
  Paperclip,
  Mic,
  Smile,
  ArrowRight,
  Clock,
  CheckCircle,
  Star,
  Gift,
  Rocket,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { NavLink, useNavigate } from "react-router-dom";
import { filterRemovedMenus } from "../../hooks/useaccountingnavigation";
import { GoogleGenAI } from "@google/genai";

// Import knowledge base and quick suggestions from utils
import {
  findRelevantKnowledge,
  initiateExpertCall,
  initiateEmergencyCall,
  isVoiceSupported,
  getVoiceCallHelp,
  isVoiceCallActive,
  getCurrentVoiceCallState,
  getVoiceAssistant,
  getSupportedLanguages,
  getLanguage,
  setLanguage,
  getLanguageInstruction,
} from "../../utils/ai-knowledge";

// ✅ ADD THIS IMPORT
import VoiceButton from "../../components/voiceButton";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
];

const QA_COLORS = [
  { bg: "bg-purple-50", iconBg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
  { bg: "bg-green-50", iconBg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
  { bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
  { bg: "bg-red-50", iconBg: "bg-red-100", text: "text-red-600", border: "border-red-200" },
  { bg: "bg-yellow-50", iconBg: "bg-yellow-100", text: "text-yellow-600", border: "border-yellow-200" },
  { bg: "bg-indigo-50", iconBg: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-200" },
  { bg: "bg-pink-50", iconBg: "bg-pink-100", text: "text-pink-600", border: "border-pink-200" },
  { bg: "bg-orange-50", iconBg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
];

const hasLink = (m) => !!m?.Menu_Links && m.Menu_Links != "#";
const menuName = (m) => m?.Fnc_Desc || m?.title || "";
const isQuick = (m) =>
  m?.Is_Quick_Action == true || m?.Is_Quick_Action == "true" || m?.Is_Quick_Action == 1;
const isHidden = (m) => m?.isvisible == 0 || m?.isvisible == false || m?.isvisible == "0";

// Quick actions come only from the menu data (flag set in Menu Master).
const buildQuickActions = (menus) => {
  const seen = new Set();
  return menus
    .filter((m) => isQuick(m) && hasLink(m) && !isHidden(m) && menuName(m))
    .filter((m) => {
      const key = `${m.Menu_Links}|${menuName(m)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((m, i) => ({
      label: menuName(m),
      path: m.Menu_Links.startsWith("/") ? m.Menu_Links : `/${m.Menu_Links}`,
      Fnc_Id: m.Fnc_Id,
      GrCod: m.GrCod,
      colorScheme: QA_COLORS[i % QA_COLORS.length],
    }));
};

const Dashboard = ({ user }) => {
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [organisationData, setOrganisationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerGroupData, setLedgerGroupData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [transactionTrigger, setTransactionTrigger] = useState(0);

  // New state for department ledger mappings
  const [departmentLedgers, setDepartmentLedgers] = useState([]);
  const [departmentMappings, setDepartmentMappings] = useState([]);
  const [quickActionsData, setQuickActionsData] = useState([]);
  const [quickActionsLoading, setQuickActionsLoading] = useState(true);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // ✅ ADD THESE VOICE STATE VARIABLES
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Language state — default English, persisted in localStorage via setLanguage()
  const [selectedLang, setSelectedLang] = useState(() => getLanguage().code);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const LANGUAGES = getSupportedLanguages();

  // Close language dropdown when clicking outside
  useEffect(() => {
    if (!showLangDropdown) return;
    const handler = () => setShowLangDropdown(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showLangDropdown]);

  // Initialize Gemini API — refs persist across re-renders
  const genAIRef = useRef(null);

  useEffect(() => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("VITE_GEMINI_API_KEY not found in .env");
        return;
      }
      genAIRef.current = new GoogleGenAI({ apiKey });
      setIsApiReady(true);
      console.log("✅ Gemini API ready (@google/genai)");
    } catch (error) {
      console.error("Failed to initialize Gemini API:", error);
    }
  }, []);

  // ✅ ADD THIS - CHECK VOICE SUPPORT ON MOUNT
  useEffect(() => {
    const supported = isVoiceSupported();
    console.log("🎤 Voice supported in browser:", supported);
    setVoiceSupported(supported);
  }, []);

  const navigate = useNavigate();

  // Get user role and department from localStorage
  const userRoleId = localStorage.getItem("user_role_id");
  const departmentData = JSON.parse(
    localStorage.getItem("amt_department") || "{}",
  );
  const departmentId = departmentData?.Dpt_id || null;

  // Top-level module names the user can actually open (dynamic, no removed modules).
  const moduleNames = useMemo(
    () =>
      [...new Set(menuItems.filter((m) => !m.UpGrp && menuName(m)).map(menuName))],
    [menuItems],
  );

  // Chat suggestions are built from the user's own menus (quick actions first).
  const chatSuggestions = useMemo(() => {
    const leaves = menuItems.filter((m) => hasLink(m) && menuName(m));
    const ordered = [...leaves.filter(isQuick), ...leaves.filter((m) => !isQuick(m))];
    const seen = new Set();
    return ordered
      .filter((m) => (seen.has(menuName(m)) ? false : seen.add(menuName(m)))) 
      .map((m) => ({ label: menuName(m), query: `How to use ${menuName(m)}?` }));
  }, [menuItems]);

  // Chatbot functions
  const sendToGemini = async (
    userMessage,
    knowledgeContext = null,
    langCode = selectedLang,
  ) => {
    if (!isApiReady || !genAIRef.current) {
      return null;
    }

    try {
      const isGujarati = langCode ==  "gu";

      const systemRole = isGujarati
        ? `તમે "I3EMS Assistant" છો. તમારે ફક્ત અને ફક્ત ગુજરાતી ભાષામાં જ જવાબ આપવાનો છે. એક પણ અંગ્રેજી શબ્દ વાપરશો નહીં.`
        : `You are "I3EMS Assistant" - a helpful AI assistant for the I3EMS system.`;

      const moduleList = moduleNames.join(", ");
      const modules = moduleList
        ? isGujarati
          ? `ઉપલબ્ધ મોડ્યુલ: ${moduleList}.`
          : `Modules: ${moduleList}.`
        : "";

      const rules = isGujarati
        ? `નિયમો: સ્પષ્ટ ગુજરાતીમાં જ જવાબ આપો. પ્રક્રિયા સમજાવવા ક્રમ (1, 2, 3) વાપરો.`
        : `Rules: Answer clearly. Use numbered steps for processes.`;

      const contextPart = knowledgeContext
        ? isGujarati
          ? `\nસંદર્ભ માહિતી (ગુજરાતીમાં અનુવાદ કરીને જવાબ આપો):\n${knowledgeContext}\n`
          : `\nReference info:\n${knowledgeContext}\n`
        : "";

      const prompt = `${systemRole}\n\n${modules}\n\n${rules}\n${contextPart}\n${isGujarati ? "પ્રશ્ન" : "Question"}: ${userMessage}`;

      const response = await genAIRef.current.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: isGujarati
            ? "તમે I3EMS Assistant છો. તમારે ફક્ત ગુજરાતી ભાષામાં જ જવાબ આપવાનો છે. અંગ્રેજીમાં કોઈ પણ જવાબ ન આપો."
            : "You are I3EMS Assistant. Answer only in English.",
          maxOutputTokens: 600,
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        console.warn("Gemini returned empty response");
        return null;
      }
      return text;
    } catch (error) {
      console.error("Gemini API Error:", error.message, error);
      return null;
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      {
        text: userMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setIsChatLoading(true);
    setShowSuggestions(false);

    try {
      // Always search knowledge base first
      const knowledgeReply = findRelevantKnowledge(userMessage, selectedLang);

      // If knowledge base has an answer — return it directly (no Gemini needed)
      if (knowledgeReply) {
        setChatMessages((prev) => [
          ...prev,
          {
            text: knowledgeReply,
            sender: "bot",
            source: "knowledge-base",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setIsChatLoading(false);
        return;
      }

      // No knowledge base match — try Gemini as fallback
      let botReply = null;
      try {
        botReply = await sendToGemini(userMessage, null, selectedLang);
      } catch (_) {}

      if (!botReply) {
        botReply =
          selectedLang ==  "gu"
            ? `માફ કરશો, "${userMessage}" વિષે ચોક્કસ માહિતી ન મળી.${moduleNames.length ? `\n\nઆ વિષે પૂછો: ${moduleNames.join(", ")}` : ""}`
            : `I couldn't find information about "${userMessage}".${moduleNames.length ? ` Try asking about: ${moduleNames.join(", ")}.` : ""}`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          text: botReply,
          sender: "bot",
          source: "gemini",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          text:
            selectedLang ==  "gu"
              ? "માફ કરશો, ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો."
              : "I encountered an error. Please try again or contact support.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Auto-scroll to bottom for chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && !isChatMinimized) {
      setTimeout(() => chatInputRef.current?.focus(), 300);
    }
  }, [isChatOpen, isChatMinimized]);

  const handleChatKeyPress = (e) => {
    if (e.key ==  "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const handleSuggestionClick = (query) => {
    setChatInput(query);
    setTimeout(() => sendChatMessage(), 100);
  };

  // ✅ ADD THIS - VOICE COMMAND HANDLER
  const handleVoiceCommand = (command, data) => {
    console.log("🎤 Voice command received:", command, data);

    // 📞 CALL EXPERT
    if (command ==  "call_expert") {
      setChatMessages((prev) => [
        ...prev,
        {
          text: "📞 **Connecting to Expert via Daily.co...**\n\nPlease wait while we connect you to a support expert.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          source: "voice",
        },
      ]);
      initiateExpertCall("normal");
      return;
    }

    // 🚨 EMERGENCY
    if (command ==  "emergency") {
      setChatMessages((prev) => [
        ...prev,
        {
          text: "🚨 **EMERGENCY CALL INITIATED!**\n\nPriority support team is being connected. Please stay on the line.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          source: "voice",
        },
      ]);
      initiateEmergencyCall();
      return;
    }

    // ⏹️ END CALL
    if (command ==  "end_call") {
      setChatMessages((prev) => [
        ...prev,
        {
          text: "⏹️ **Ending voice call...**\n\nYour call has been disconnected. Say **'call expert'** to start a new call.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          source: "voice",
        },
      ]);
      return;
    }

    // 📊 CALL STATUS
    if (command ==  "call_status") {
      const active = isVoiceCallActive();
      const state = getCurrentVoiceCallState();

      let statusMessage = active
        ? `📊 **Call Status: Active**
        
${state?.type ==  "emergency" ? "🚨 Emergency" : "📞 Expert"} call in progress
📱 Room: ${state?.roomName || "N/A"}
🕐 Started: ${state?.startedAt ? new Date(state.startedAt).toLocaleTimeString() : "N/A"}

Say **"end call"** to disconnect`
        : `📊 **Call Status: No Active Call**

No voice call is currently active.

Say **"call expert"** to start a call
Say **"emergency"** for priority support`;

      setChatMessages((prev) => [
        ...prev,
        {
          text: statusMessage,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          source: "voice",
        },
      ]);
      return;
    }

    // ❓ HELP
    if (command ==  "help") {
      setChatMessages((prev) => [
        ...prev,
        {
          text: getVoiceCallHelp(),
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          source: "voice",
        },
      ]);
      return;
    }

    // 🗑️ CLEAR
    if (command ==  "CLEAR") {
      setChatMessages([]);
      setChatMessages((prev) => [
        ...prev,
        {
          text: "🗑️ Chat cleared. How can I help you?",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    // 🔄 RESET
    if (command ==  "RESET") {
      setChatMessages([]);
      setChatMessages((prev) => [
        ...prev,
        {
          text: "🔄 Chat reset. How can I help you?",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    // 💬 QUERY — voice transcript routed here for lookup + TTS answer
    if (command ==  "query" && data) {
      const userText = typeof data ==  "string" ? data : String(data);

      // Add the user's spoken words as a chat bubble
      setChatMessages((prev) => [
        ...prev,
        {
          text: userText,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
          source: "voice",
        },
      ]);

      setIsChatLoading(true);
      setShowSuggestions(false);

      (async () => {
        // Knowledge base lookup — returns Gujarati text directly when lang=gu
        const knowledgeReply = findRelevantKnowledge(userText, selectedLang);

        let replyText = knowledgeReply;

        // Only call Gemini if knowledge base had no answer
        if (!replyText) {
          try {
            replyText = await sendToGemini(userText, null, selectedLang);
          } catch (_) {}
        }

        if (!replyText) {
          replyText =
            selectedLang ==  "gu"
              ? "માફ કરશો, આ વિષે ચોક્કસ માહિતી ન મળી. કૃપા ટાઇપ કરીને પૂછો."
              : "I didn't catch that. Could you please type your question?";
        }

        // Show answer in chat
        setChatMessages((prev) => [
          ...prev,
          {
            text: replyText,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
            source: "voice",
          },
        ]);
        setIsChatLoading(false);

        // 3️⃣ Speak the answer aloud — strip markdown for clean TTS
        try {
          const assistant = getVoiceAssistant();
          if (assistant) {
            assistant.speak(replyText);
          }
        } catch (e) {
          console.warn("TTS error:", e);
        }
      })();

      return;
    }
  };

  // Menus (and therefore Quick Actions) are dynamic: permission-filtered menu_details
  // from login first, then - for admin - refreshed from Menu Master so changes show
  // up without logging in again. Removed modules (Pet / Tax) are never shown.
  useEffect(() => {
    let cancelled = false;

    const applyMenus = (list) => {
      const clean = filterRemovedMenus(Array.isArray(list) ? list : []).filter(
        (m) => !isHidden(m),
      );
      if (cancelled) return;
      setMenuItems(clean);
      setQuickActionsData(buildQuickActions(clean));
    };

    const load = async () => {
      setQuickActionsLoading(true);
      try {
        applyMenus(JSON.parse(localStorage.getItem("menu_details") || "[]"));
      } catch (err) {
        console.error("Error loading menus from localStorage:", err);
        applyMenus([]);
      }
      setQuickActionsLoading(false);

      if (userRoleId == "1") {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } },
          );
          if (res.data?.status == "success" && Array.isArray(res.data.data)) {
            applyMenus(res.data.data.filter((m) => m.isvisible == 1));
          }
        } catch (err) {
          console.warn("Could not refresh menus, using saved menus:", err?.message);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const savedOrganisation = localStorage.getItem("selectedOrganisation");
    if (savedOrganisation) {
      try {
        setSelectedOrganisation(JSON.parse(savedOrganisation));
      } catch (e) {
        console.error("Error parsing saved organisation:", e);
      }
    }
    fetchOrganisationData();
  }, []);

  // Fetch department ledgers if user is not admin
  useEffect(() => {
    if (!userRoleId || userRoleId == "1") {
      console.log("Admin user - showing all ledgers");
      return;
    }

    if (departmentId) {
      fetchDepartmentLedgers(departmentId);
    }
  }, [userRoleId, departmentId]);

  // Fetch all data when organisation changes
  useEffect(() => {
    if (selectedOrganisation) {
      fetchLedgerData();
      fetchLedgerGroupData();
      fetchTransactionData();
    }
  }, [selectedOrganisation, transactionTrigger]);

  const fetchDepartmentLedgers = async (deptId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/grant-dept-map/by-department/${deptId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.data.success && response.data.data) {
        setDepartmentMappings(response.data.data);

        const allLedgers = [];
        response.data.data.forEach((mapping) => {
          if (mapping.all_ledgers && mapping.all_ledgers.length > 0) {
            allLedgers.push(...mapping.all_ledgers);
          }
        });

        const uniqueLedgers = allLedgers.filter(
          (ledger, index, self) =>
            index == self.findIndex((l) => l.Lg_Id == ledger.Lg_Id),
        );

        setDepartmentLedgers(uniqueLedgers);
        console.log("Department ledgers loaded:", uniqueLedgers);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching department ledgers:", err);
      setError("Failed to load department ledgers");
      setIsLoading(false);
    }
  };

  const filterLedgersByAccess = (ledgers) => {
    if (userRoleId == "1") {
      return ledgers;
    }

    if (departmentLedgers.length > 0) {
      const departmentLgIds = departmentLedgers.map((l) => String(l.Lg_Id));
      return ledgers.filter((ledger) =>
        departmentLgIds.includes(String(ledger.Lg_Id)),
      );
    }

    return [];
  };

  const calculateCashFlowData = () => {
    const bookAccountIds = new Set(
      ledgerData
        .filter((ledger) => {
          const ledgerGroup = ledger.ledger_group;
          return ledgerGroup && ledgerGroup.Gr_Buk == "Y";
        })
        .map((ledger) => String(ledger.Lg_Id)),
    );

    const monthlyData = {};

    transactionData.forEach((transaction) => {
      if (!bookAccountIds.has(String(transaction.Lg_Id))) return;

      const date = new Date(transaction.Vou_Dt);
      if (isNaN(date.getTime())) {
        return;
      }

      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { moneyIn: 0, moneyOut: 0 };
      }

      if (transaction.Vou_Ty == "RCP" && transaction.Dr_Amt) {
        const drAmt = parseFloat(transaction.Dr_Amt);
        if (!isNaN(drAmt)) {
          monthlyData[monthYear].moneyIn += drAmt;
        }
      } else if (transaction.Vou_Ty == "PAY" && transaction.Cr_Amt) {
        const crAmt = parseFloat(transaction.Cr_Amt);
        if (!isNaN(crAmt)) {
          monthlyData[monthYear].moneyOut += crAmt;
        }
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();

    return sortedMonths.map((monthYear) => ({
      name: monthYear,
      moneyIn: monthlyData[monthYear].moneyIn,
      moneyOut: monthlyData[monthYear].moneyOut,
    }));
  };

  const cashFlowData = useMemo(
    () => calculateCashFlowData(),
    [transactionData, ledgerData],
  );

  const { totalCashIn, totalCashOut } = useMemo(() => {
    return cashFlowData.reduce(
      (totals, month) => ({
        totalCashIn: totals.totalCashIn + month.moneyIn,
        totalCashOut: totals.totalCashOut + month.moneyOut,
      }),
      { totalCashIn: 0, totalCashOut: 0 },
    );
  }, [cashFlowData]);

  const CashFlowChart = ({ data }) => (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="moneyIn" fill="#82ca9d" name="Cash In" />
          <Bar dataKey="moneyOut" fill="#8884d8" name="Cash Out" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-semibold text-gray-700 mb-2">
          Cash Flow Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Cash In</p>
            <p className="text-lg font-bold text-green-600">
              ₹
              {totalCashIn.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Cash Out</p>
            <p className="text-lg font-bold text-red-600">
              ₹
              {totalCashOut.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const fetchOrganisationData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-org-master`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.data.success && response.data.data) {
        const orgData = response.data.data.map((org) => ({
          id: org.Org_Id,
          name: org.Org_Name,
          code: org.Org_Code,
          address: org.Org_Address,
          city: org.Org_City,
          state: org.Org_State,
          pin: org.Org_Pin,
          email: org.Org_Email,
          mobile: org.Org_Mobile,
        }));

        setOrganisationData(orgData);

        const savedOrg = localStorage.getItem("selectedOrganisation");
        if (
          savedOrg &&
          orgData.some((org) => org.id == JSON.parse(savedOrg).id)
        ) {
          setSelectedOrganisation(JSON.parse(savedOrg));
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
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching organisation data:", err);
      setError("Failed to load organisation data");
      setIsLoading(false);
    }
  };

  const fetchLedgerData = async () => {
    if (!selectedOrganisation) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ledgers/all/data`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.data.success && response.data.data) {
        const filteredLedgers = response.data.data.filter((ledger) => {
          return ledger.ledger_group;
        });

        setLedgerData(filteredLedgers);
      } else {
        setLedgerData([]);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching ledger data:", err);
      setError("Failed to load ledger data");
      setLedgerData([]);
      setIsLoading(false);
    }
  };

  const fetchLedgerGroupData = async () => {
    if (!selectedOrganisation) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-ledg-grps`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.data.status == "success" && response.data.data) {
        const filteredGroups = response.data.data.filter((group) => {
          return group.is_del != "Y";
        });

        setLedgerGroupData(filteredGroups);
      } else {
        setLedgerGroupData([]);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching ledger group data:", err);
      setError("Failed to load ledger group data");
      setLedgerGroupData([]);
      setIsLoading(false);
    }
  };

  const fetchTransactionData = async () => {
    if (!selectedOrganisation) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/finan-trns/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.data.success && response.data.data) {
        const filteredTransactions = response.data.data.filter(
          (transaction) => {
            return (
              String(transaction.Org_Id) == String(selectedOrganisation.id) &&
              transaction.V_Mode == "G"
            );
          },
        );

        setTransactionData(filteredTransactions);
      } else {
        setTransactionData([]);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching transaction data:", err);
      setError("Failed to load transaction data");
      setTransactionData([]);
      setIsLoading(false);
    }
  };

  const handleRefreshTransactions = () => {
    setTransactionTrigger((prev) => prev + 1);
  };

  const calculateBalance = (lgId) => {
    if (!lgId) return 0.0;

    const transactions = transactionData.filter(
      (t) => t.Lg_Id && String(t.Lg_Id) == String(lgId),
    );

    const totalCr = transactions.reduce((sum, t) => {
      const crAmt = t.Cr_Amt ? parseFloat(t.Cr_Amt) : 0;
      return sum + (isNaN(crAmt) ? 0 : crAmt);
    }, 0);

    const totalDr = transactions.reduce((sum, t) => {
      const drAmt = t.Dr_Amt ? parseFloat(t.Dr_Amt) : 0;
      return sum + (isNaN(drAmt) ? 0 : drAmt);
    }, 0);

    return (totalCr - totalDr).toFixed(2);
  };

  const calculateProfitLoss = () => {
    const accessibleLedgers = filterLedgersByAccess(ledgerData);

    const incomeLedgerIds = accessibleLedgers
      .filter((ledger) => {
        const group = ledger.ledger_group;
        return group && group.Gr_Cd && group.Gr_Cd.startsWith("03");
      })
      .map((ledger) => String(ledger.Lg_Id));

    const expenseLedgerIds = accessibleLedgers
      .filter((ledger) => {
        const group = ledger.ledger_group;
        return group && group.Gr_Cd && group.Gr_Cd.startsWith("04");
      })
      .map((ledger) => String(ledger.Lg_Id));

    const incomeTransactions = transactionData.filter(
      (t) => t.Lg_Id && incomeLedgerIds.includes(String(t.Lg_Id)),
    );
    const expenseTransactions = transactionData.filter(
      (t) => t.Lg_Id && expenseLedgerIds.includes(String(t.Lg_Id)),
    );

    const totalIncome = incomeTransactions.reduce((sum, t) => {
      const drAmt = t.Dr_Amt ? parseFloat(t.Dr_Amt) : 0;
      const crAmt = t.Cr_Amt ? parseFloat(t.Cr_Amt) : 0;
      return sum + (isNaN(drAmt) ? 0 : drAmt) - (isNaN(crAmt) ? 0 : crAmt);
    }, 0);

    const totalExpenses = expenseTransactions.reduce((sum, t) => {
      const drAmt = t.Dr_Amt ? parseFloat(t.Dr_Amt) : 0;
      const crAmt = t.Cr_Amt ? parseFloat(t.Cr_Amt) : 0;
      return sum + (isNaN(drAmt) ? 0 : drAmt) - (isNaN(crAmt) ? 0 : crAmt);
    }, 0);

    const netProfit = totalIncome - totalExpenses;

    return {
      netProfit: netProfit.toFixed(2),
      income: totalIncome.toFixed(2),
      expenses: totalExpenses.toFixed(2),
    };
  };

  const profitLossData = calculateProfitLoss();

  // Top expense ledgers with their real net amount (Dr - Cr) from transactions.
  const expensesData = useMemo(() => {
    return filterLedgersByAccess(ledgerData)
      .filter((l) => l.ledger_group?.Gr_Cd && l.ledger_group.Gr_Cd.startsWith("04"))
      .map((l) => {
        const value = transactionData
          .filter((t) => t.Lg_Id && String(t.Lg_Id) == String(l.Lg_Id))
          .reduce(
            (sum, t) => sum + (parseFloat(t.Dr_Amt) || 0) - (parseFloat(t.Cr_Amt) || 0),
            0,
          );
        return { name: l.Lg_Name, group: l.ledger_group?.Gr_Nm || "", value };
      })
      .filter((e) => e.name && e.value > 0)
      .sort((x, y) => y.value - x.value)
      .slice(0, 5)
      .map((e, i) => ({ ...e, color: COLORS[i % COLORS.length] }));
  }, [ledgerData, transactionData, departmentLedgers]);

  const handleLedgerClick = (ledger) => {
    navigate(`/transactions/${ledger.Lg_Id}`);
  };

  const calculateTotalBalance = () => {
    let total = 0;
    const accessibleLedgers = filterLedgersByAccess(ledgerData);

    accessibleLedgers.forEach((ledger) => {
      const balance = parseFloat(calculateBalance(ledger.Lg_Id));
      if (!isNaN(balance)) {
        total += balance;
      }
    });
    return total.toFixed(2);
  };

  const totalBalance = calculateTotalBalance();

  const getBookAccounts = () => {
    const accessibleLedgers = filterLedgersByAccess(ledgerData);
    return accessibleLedgers.filter((ledger) => {
      const group = ledger.ledger_group;
      return group && group.Gr_Buk == "Y";
    });
  };

  const getLedgerAccounts = () => {
    const accessibleLedgers = filterLedgersByAccess(ledgerData);
    return accessibleLedgers.filter((ledger) => {
      const group = ledger.ledger_group;
      return group && group.Gr_Buk == "N";
    });
  };

  const getInvoiceAccounts = () => {
    const accessibleLedgers = filterLedgersByAccess(ledgerData);
    return accessibleLedgers.filter((ledger) => {
      const group = ledger.ledger_group;
      return group && group.Gr_Buk == "Y";
    });
  };

  const bookAccounts = getBookAccounts();
  const ledgerAccounts = getLedgerAccounts();
  const invoiceAccounts = getInvoiceAccounts();

  // Helper function to render message with formatting and clickable links
  const renderMessage = (text, msg = {}) => {
    if (!text) return null;

    // ✅ If it's a navigation message with a button
    if (msg?.isNavigation && msg?.redirectPath) {
      return (
        <div className="flex flex-col gap-3">
          <div>{text}</div>
          <button
            onClick={() => {
              navigate(msg.redirectPath);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium self-start"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Go to Page
          </button>
        </div>
      );
    }

    // Split by new lines
    const lines = text.split("\n");

    return lines.map((line, index) => {
      // Skip empty lines
      if (!line.trim()) return <br key={index} />;

      // ✅ DETECT MARKDOWN LINKS: [Link Text](URL)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      // Check if there are any links in this line
      const hasLinks = linkRegex.test(line);
      linkRegex.lastIndex = 0;

      if (hasLinks) {
        // Process all links in the line
        while ((match = linkRegex.exec(line)) !=  null) {
          // Add text before the link
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
          }

          // Add the link as a clickable element
          parts.push({
            type: "link",
            text: match[1],
            url: match[2],
          });

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text after the last link
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }

        // Render the line with clickable links
        return (
          <div key={index} className="flex items-center gap-1 flex-wrap">
            {parts.map((part, i) => {
              if (typeof part ==  "string") {
                return <span key={i}>{part}</span>;
              }

              // Extract path from URL
              const path = part.url.replace(/^https?:\/\/[^\/]+/, "");

              return (
                <button
                  key={i}
                  onClick={() => {
                    navigate(path);
                  }}
                  className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer inline-flex items-center gap-1 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors group"
                >
                  {part.text}
                  <svg
                    className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        );
      }

      // ✅ Bold text: **text**
      if (line.startsWith("**") && line.endsWith("**")) {
        return <strong key={index}>{line.slice(2, -2)}</strong>;
      }

      // ✅ Headers: ### text
      if (line.trim().startsWith("###")) {
        return (
          <h4 key={index} className="font-bold text-gray-800 mt-3 mb-1">
            {line.trim().replace("###", "").trim()}
          </h4>
        );
      }

      // ✅ Emoji/icon lines
      if (
        line.startsWith("📄") ||
        line.startsWith("📊") ||
        line.startsWith("👤") ||
        line.startsWith("🏖️") ||
        line.startsWith("🐾") ||
        line.startsWith("🏛️") ||
        line.startsWith("💰") ||
        line.startsWith("🏪") ||
        line.startsWith("👥") ||
        line.startsWith("💡") ||
        line.startsWith("⚠️") ||
        line.startsWith("🔐") ||
        line.startsWith("📋") ||
        line.startsWith("📈") ||
        line.startsWith("🤖") ||
        line.startsWith("🔗") ||
        line.startsWith("🚀")
      ) {
        return (
          <div key={index} className="flex items-start gap-2 my-1">
            {line}
          </div>
        );
      }

      // ✅ Numbered lists: 1., 2., etc.
      if (line.trim().match(/^\d+\./)) {
        return (
          <div key={index} className="ml-4 my-1">
            {line}
          </div>
        );
      }

      // ✅ Bullet points: - text
      if (line.trim().startsWith("-")) {
        return (
          <div key={index} className="ml-6 my-1">
            {line}
          </div>
        );
      }

      // Default line
      return <div key={index}>{line}</div>;
    });
  };
  return (
    <div className="p-3 md:p-6">
      {isLoading && (
        <div className="fixed inset-0 bg-[#0000006a] bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Total Balance Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-sm md:text-lg font-medium text-gray-500 mb-2">
            Total Balance
          </h2>
          <div className="mb-4">
            <p className="text-2xl md:text-3xl font-bold">
              ₹{Math.abs(parseFloat(totalBalance)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Profit & Loss Card */}
        <NavLink
          to="/transactions/profit-loss"
          className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm md:text-lg font-medium text-gray-500">
              Profit & Loss
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mb-4">
            <p
              className={`text-2xl md:text-3xl font-bold ${
                parseFloat(profitLossData.netProfit) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₹{Math.abs(parseFloat(profitLossData.netProfit)).toLocaleString()}
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {parseFloat(profitLossData.netProfit) >= 0
                ? "Net Profit"
                : "Net Loss"}
            </p>
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between">
              <p className="text-xs md:text-sm text-gray-500">Total Income</p>
              <p className="font-medium text-xs md:text-sm">
                ₹{Math.abs(parseFloat(profitLossData.income)).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-xs md:text-sm text-gray-500">Total Expenses</p>
              <p className="font-medium text-xs md:text-sm">
                ₹
                {Math.abs(parseFloat(profitLossData.expenses)).toLocaleString()}
              </p>
            </div>
          </div>
        </NavLink>

        {/* Expenses Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm md:text-lg font-medium text-gray-500">
              Expenses
            </h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3 md:space-y-6 mt-2 md:mt-4">
            {expensesData.length > 0 ? (
              expensesData.slice(0, 2).map((expense, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-gray-100 w-8 h-8 md:w-12 md:h-12 rounded flex items-center justify-center mr-3 md:mr-4">
                    <span
                      className="text-xs md:text-sm font-bold"
                      style={{ color: expense.color }}
                    >
                      {expense.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-medium">
                      {expense.name}
                    </p>
                    {expense.group && (
                      <p className="text-xs md:text-sm text-gray-500">{expense.group}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-base">
                      ₹{expense.value.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm md:text-base">
                No expenses data available
              </p>
            )}
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm md:text-lg font-medium text-gray-500">
              Invoice
            </h2>
            <ReceiptIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3 md:space-y-6">
            {invoiceAccounts.slice(0, 2).map((ledger) => (
              <div key={ledger.Lg_Id} className="flex items-center">
                <div className="bg-gray-100 p-2 rounded mr-3 md:mr-4">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base font-medium">
                    {ledger?.Lg_Name || ""}
                  </p>
                  <p className="text-[9px] md:text-[12px] text-gray-500 leading-tight">
                    {ledger?.Lg_Eng_Name || ""}
                  </p>
                  <p className="text-[9px] md:text-[12px] text-gray-500 leading-tight">
                    {ledger?.Lg_Code || ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm md:text-base">
                    ₹
                    {Math.abs(
                      parseFloat(calculateBalance(ledger.Lg_Id)),
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {invoiceAccounts.length == 0 && (
              <div className="text-gray-500 text-sm md:text-base">
                No sales accounts available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6 mb-6">
        {/* Book Accounts Section - Budget Income */}
        <div className="lg:col-span-4 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-medium text-gray-700">
              Budget Income
            </h2>
          </div>
          <div className="space-y-3 md:space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {bookAccounts
              .filter((ledger) => {
                const balance = parseFloat(calculateBalance(ledger.Lg_Id));
                return !isNaN(balance) && Math.abs(balance) > 0;
              })
              .map((ledger) => {
                const balance = calculateBalance(ledger.Lg_Id);
                return (
                  <div
                    key={ledger.Lg_Id}
                    className="border border-gray-200 rounded-lg p-3 md:p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => handleLedgerClick(ledger)}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm md:text-base font-medium">
                            {ledger.Lg_Name}
                          </p>
                          {ledger.Lg_Eng_Name && (
                            <p className="text-[9px] md:text-[12px] text-gray-600 leading-tight">
                              {ledger.Lg_Eng_Name}
                            </p>
                          )}
                          <p className="text-[9px] md:text-[12px] text-gray-500 mt-0 leading-tight">
                            {ledger.Lg_Code || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm md:text-base">
                            ₹{Math.abs(parseFloat(balance)).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Balance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {bookAccounts.filter((ledger) => {
              const balance = parseFloat(calculateBalance(ledger.Lg_Id));
              return !isNaN(balance) && Math.abs(balance) > 0;
            }).length == 0 && (
              <div className="text-center text-gray-500 py-4">
                No budget income accounts with balance available.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section - DYNAMIC from localStorage */}
        <div className="lg:col-span-6 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-medium text-gray-700">
              Quick Actions
            </h2>
          </div>

          {quickActionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : quickActionsData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {quickActionsData.map((action, index) => (
                <div
                  key={action.Fnc_Id || index}
                  className={`border ${action.colorScheme.border} ${action.colorScheme.bg} rounded-lg p-3 hover:shadow-md cursor-pointer transition-all duration-200 hover:scale-105`}
                  onClick={() => {
                    if (action.path && action.path != "#") {
                      navigate(action.path);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`${action.colorScheme.iconBg} w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-2 md:mr-3`}
                      >
                        <FileText
                          className={`h-3 w-3 md:h-4 md:w-4 ${action.colorScheme.text}`}
                        />
                      </div>
                      <p className="text-xs md:text-sm font-medium text-gray-700">
                        {action.label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No quick actions available</p>
              <p className="text-sm mt-1">
                Configure quick actions in menu settings
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6 mb-6">
        {/* Ledger Accounts Section - Budget Expense */}
        <div className="lg:col-span-4 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-medium text-gray-700">
              Budget Expense
            </h2>
          </div>
          <div className="space-y-3 md:space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {ledgerAccounts
              .filter((ledger) => {
                const balance = parseFloat(calculateBalance(ledger.Lg_Id));
                return !isNaN(balance) && Math.abs(balance) > 0;
              })
              .map((ledger) => {
                const balance = calculateBalance(ledger.Lg_Id);
                return (
                  <div
                    key={ledger.Lg_Id}
                    className="border border-gray-200 bg-gray-100 rounded-lg p-3 md:p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleLedgerClick(ledger)}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm md:text-base font-medium">
                            {ledger.Lg_Name}
                          </p>
                          {ledger.Lg_Eng_Name && (
                            <p className="text-[9px] md:text-[12px] text-gray-600 leading-tight">
                              {ledger.Lg_Eng_Name}
                            </p>
                          )}
                          <p className="text-[9px] md:text-[12px] text-gray-500 mt-0 leading-tight">
                            {ledger.Lg_Code || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm md:text-base">
                            ₹{Math.abs(parseFloat(balance)).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Balance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {ledgerAccounts.filter((ledger) => {
              const balance = parseFloat(calculateBalance(ledger.Lg_Id));
              return !isNaN(balance) && Math.abs(balance) > 0;
            }).length == 0 && (
              <div className="text-center text-gray-500 py-4">
                No budget expense accounts with balance available.
              </div>
            )}
          </div>
        </div>

        {/* Cash Flow Section */}
        <div className="lg:col-span-6 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-medium text-gray-700">
              Cash Flow
            </h2>
            <button
              onClick={handleRefreshTransactions}
              className="flex items-center text-xs md:text-sm text-white bg-blue-600 px-3 py-1 md:px-3 md:py-1 rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Refresh Data
            </button>
          </div>
          {cashFlowData.length > 0 ? (
            <div className="w-full">
              <CashFlowChart data={cashFlowData} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No cash flow data available</p>
              <p className="text-sm mt-1">
                Add bank transactions to see cash flow
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ENHANCED CHATBOT SECTION - Ultra Large Design */}
      {/* ============================================================ */}

      {/* Floating Chat Button - Ultra Large */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-8 right-8 z-50 group transition-all duration-300 ${
          isChatOpen ? "scale-100" : "hover:scale-110 animate-pulse"
        }`}
      >
        <div
          className={`p-5 rounded-full shadow-2xl transition-all duration-300 ${
            isChatOpen
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rotate-90"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          }`}
        >
          {isChatOpen ? (
            <X className="h-9 w-9 text-white" />
          ) : (
            <div className="relative">
              <MessageCircle className="h-9 w-9 text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          )}
        </div>
        {!isChatOpen && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full px-3 py-1 animate-bounce shadow-lg">
            Help
          </div>
        )}
      </button>

      {/* Chat Window - Ultra Large */}
      {isChatOpen && (
        <div
          className={`fixed bottom-28 right-8 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 transition-all duration-300 ${
            isChatMinimized
              ? "w-[500px] h-24"
              : isChatFullscreen
                ? "w-[800px] h-[850px]"
                : "w-[550px] h-[750px]"
          }`}
        >
          {/* Chat Header - Enhanced Premium Design */}
          {/* Chat Header - Enhanced Premium Design */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl flex items-center gap-3">
                  I3EMS Assistant
                  
                  {isApiReady && (
                    <span className="text-xs bg-green-500/30 px-3 py-1 rounded-full text-green-200 font-medium">
                      Live
                    </span>
                  )}
                </h3>
                
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="text-white/80 hover:text-white hover:bg-white/20 px-3 py-2 rounded-xl transition-colors text-sm font-medium flex items-center gap-1"
                  title="Change language"
                >
                  <span>
                    {LANGUAGES.find((l) => l.code ==  selectedLang)?.flag}
                  </span>
                  <span>
                    {
                      LANGUAGES.find((l) => l.code ==  selectedLang)
                        ?.nativeLabel
                    }
                  </span>
                  <span className="text-xs ml-1">▾</span>
                </button>
                {showLangDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[140px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setSelectedLang(lang.code);
                          setShowLangDropdown(false);
                          setChatMessages((prev) => [
                            ...prev,
                            {
                              text:
                                lang.code ==  "en"
                                  ? "✅ Language changed to English. I will now reply in English."
                                  : "✅ ભાષા ગુજરાતી પર બદલાઈ ગઈ. હવે હું ગુજરાતીમાં જ જવાબ આપીશ.",
                              sender: "bot",
                              timestamp: new Date().toLocaleTimeString(),
                            },
                          ]);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 transition-colors ${
                          selectedLang ==  lang.code
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div className="text-left">
                          <div className="font-medium">{lang.nativeLabel}</div>
                          <div className="text-xs text-gray-400">
                            {lang.label}
                          </div>
                        </div>
                        {selectedLang ==  lang.code && (
                          <span className="ml-auto text-blue-500">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsChatFullscreen(!isChatFullscreen)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              >
                {isChatFullscreen ? (
                  <Minimize2 className="h-6 w-6" />
                ) : (
                  <Maximize2 className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              >
                {isChatMinimized ? (
                  <ChevronUp className="h-6 w-6" />
                ) : (
                  <ChevronDown className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Chat Body - Only show when not minimized */}
          {!isChatMinimized && (
            <>
              {/* Messages - With better styling and larger area */}
              <div
                className={`flex-1 overflow-y-auto p-6 space-y-5 ${isChatFullscreen ? "h-[650px]" : "h-[580px]"} bg-gradient-to-b from-gray-50 to-white`}
              >
                {chatMessages.length ==  0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="relative">
                      <div className="text-8xl mb-6 animate-bounce">🤖</div>
                      {isApiReady && (
                        <div className="absolute -top-2 -right-2 bg-green-400 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse shadow-lg">
                          Live
                        </div>
                      )}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-3">
                      Hi! I'm your I3EMS Assistant
                    </h3>
                    <p className="text-gray-500 text-lg mb-8 max-w-md">
                      Ask me anything about your ERP system. I'm here to help!
                    </p>

                    {/* Quick Suggestions Grid - built from the user's menus */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-2xl">
                      {chatSuggestions.slice(0, 9).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleSuggestionClick(suggestion.query)
                          }
                          className="group relative overflow-hidden text-sm bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 px-4 py-3.5 rounded-2xl transition-all duration-300 text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
                        >
                          <span className="relative z-10 font-medium">
                            {suggestion.label}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                      ))}
                    </div>

                    {/* ✅ ADD VOICE STATUS INDICATOR */}
                    {isVoiceListening && (
                      <div className="px-5 py-2 bg-green-50 border-t border-green-200 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 font-medium">
                          🎤 Listening... Speak your command
                        </span>
                      </div>
                    )}

                
                  </div>
                ) : (
                  <>
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.sender ==  "user" ? "justify-end" : "justify-start"} message-enter`}
                      >
                        <div
                          className={`flex items-start gap-4 max-w-[85%] ${
                            msg.sender ==  "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          {/* Avatar - Enhanced with bigger size */}
                          <div
                            className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center shadow-xl ${
                              msg.sender ==  "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                : "bg-gradient-to-r from-purple-500 to-blue-500"
                            }`}
                          >
                            {msg.sender ==  "user" ? (
                              <User className="h-6 w-6 text-white" />
                            ) : (
                              <Bot className="h-6 w-6 text-white" />
                            )}
                          </div>

                          {/* Message Bubble - Enhanced with bigger size */}
                          <div
                            className={`p-5 rounded-2xl ${
                              msg.sender ==  "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-xl shadow-blue-500/30"
                                : "bg-white text-gray-800 rounded-bl-none shadow-xl shadow-gray-200/50 border border-gray-100"
                            }`}
                          >
                            <div className="text-base leading-relaxed">
                              {renderMessage(msg.text)}
                            </div>
                            {msg.timestamp && (
                              <div
                                className={`text-[11px] mt-3 ${
                                  msg.sender ==  "user"
                                    ? "text-blue-100"
                                    : "text-gray-400"
                                }`}
                              >
                                🕐 {msg.timestamp}
                              </div>
                            )}
                            {msg.source ==  "knowledge-base" &&
                              msg.sender ==  "bot" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                    📚 Knowledge Base
                                  </span>
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    ⚡ Instant
                                  </span>
                                </div>
                              )}
                            {msg.source ==  "fallback" &&
                              msg.sender ==  "bot" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                                    ⚠️ Offline Mode
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl rounded-bl-none shadow-xl shadow-gray-200/50 border-2 border-gray-100">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
                            <Bot className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex gap-2">
                            <div
                              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 ml-2 font-medium">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions - Always visible with more options */}
              {chatSuggestions.length > 9 && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {chatSuggestions.slice(9, 15).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.query)}
                      className="text-sm bg-white hover:bg-gray-100 px-4 py-2 rounded-full transition-all duration-200 text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md font-medium"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Chat Input - Enhanced with bigger design */}
              {/* Chat Input - Enhanced with bigger design */}
              <div className="p-5 border-t-2 border-gray-200 flex gap-3 bg-white rounded-b-3xl">
                <div className="relative flex-1">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleChatKeyPress}
                    placeholder="Type your question here... (Press Enter to send)"
                    className="w-full px-6 py-4 pr-24 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-gray-50 hover:bg-white transition-colors"
                    disabled={isChatLoading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {/* ✅ VOICE BUTTON ICON INSIDE INPUT */}
                    {voiceSupported && (
                      <button
                        onClick={() => {
                          const assistant = getVoiceAssistant();
                          if (!assistant) return;

                          if (isVoiceListening) {
                            assistant.stop();
                            setIsVoiceListening(false);
                          } else {
                            // Wire callbacks before starting
                            assistant.onCommand = (command, data) => {
                              handleVoiceCommand(command, data);
                            };
                            assistant.onInterimResult = (t) => setChatInput(t);
                            assistant.onFinalResult = () => setChatInput("");
                            assistant.onStateChange = (active) =>
                              setIsVoiceListening(active);
                            assistant.start();
                          }
                        }}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                          isVoiceListening
                            ? "text-red-500 bg-red-50 animate-pulse"
                            : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                        }`}
                        title={
                          isVoiceListening
                            ? "Stop listening"
                            : "Start voice input"
                        }
                      >
                        <Mic className="h-5 w-5" />
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={sendChatMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 text-base font-medium"
                >
                  <span className="hidden sm:inline">Send</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
