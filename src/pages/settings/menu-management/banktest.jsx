import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const KotakNameEnquiry = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // CORRECT CREDENTIALS - FIXED THE SWAPPED VALUES
  const CLIENT_ID = "l725a045ac84544c84b00083165d31a7c1"; // This is the correct client_id
  const CLIENT_SECRET = "d029236a13c0400daf89afd6dca94346"; // This is the correct client_secret

  // Bank URLs
  const TOKEN_URL = "https://apigw.kotakuat.bank.in:8443/auth/oauth/v2/token";
  const NAME_ENQUIRY_URL =
    "https://apigw.kotakuat.bank.in:8443/Name_Enquiry_API?SrcAppCd=UATBCREMIT";

  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getUTCDate()).padStart(2, "0");
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const year = now.getUTCFullYear();
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    return `${day}${month}${year}${hours}${minutes}${seconds}`;
  };

  // Generate Token - FIXED CREDENTIALS
  const generateToken = async () => {
    setLoading(true);
    setError(null);

    // Create form data with CORRECT credentials
    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", CLIENT_ID); // ← FIXED: Now using correct client_id
    formData.append("client_secret", CLIENT_SECRET); // ← FIXED: Now using correct client_secret

    console.log("Sending token request with:", {
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: "***HIDDEN***",
    });

    try {
      toast.info("🔄 Generating token...");

      const response = await axios.post(TOKEN_URL, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        timeout: 30000, // 30 second timeout
      });

      console.log("Token response:", response.data);

      if (response.data?.access_token) {
        setToken(response.data.access_token);
        toast.success("✅ Token generated successfully!");
        return response.data.access_token;
      } else {
        throw new Error("No access token in response");
      }
    } catch (error) {
      console.error("Token Generation Error - Full details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      let errorMessage = "Token generation failed: ";

      if (error.response) {
        // Server responded with error
        if (error.response.status == 400) {
          errorMessage += "Bad request - Check client_id and client_secret";
        } else if (error.response.status == 401) {
          errorMessage += "Unauthorized - Invalid credentials";
        } else if (error.response.status == 500) {
          errorMessage += "Bank server error - Please check your credentials";
        } else {
          errorMessage += `Server error (${error.response.status})`;
        }

        // Log the actual error from bank
        console.log("Bank error response:", error.response.data);
      } else if (error.request) {
        // Request made but no response
        errorMessage += "Bank server not responding. Check:";
        errorMessage += "\n• Bank server might be down";
        errorMessage += "\n• Network connectivity issues";
        errorMessage += "\n• Firewall blocking port 8443";
        errorMessage +=
          "\n• CORS policy (bank APIs often block browser requests)";
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Call Name Enquiry
  const callNameEnquiry = async (generatedToken) => {
    if (!generatedToken && !token) {
      toast.warning("⚠️ Please generate token first");
      return;
    }

    setLoading(true);

    const accessToken = generatedToken || token;

    const requestBody = {
      messageCode: "6210",
      merchantId: "UATBCREMIT",
      dateTime: getCurrentDateTime(),
      requestId: "TEST" + Date.now(),
      requestType: "R",
      beneficiaryfsc: "SBIN0011082",
      beneficiaryAccntNumber: "123456080",
      remarks: "TEST PAYMENT",
      beneficiaryAccountType: "SAVINGS",
      remitterName: "Sadhana",
      remitterMobileNumber: "919899178017",
      remitterAccountNumber: "09582650000173",
      remitterMmid: "9485533",
      filler1: "",
      filler2: "",
      filler3: "",
      Checksum: "2147483647",
    };

    try {
      toast.info("🔄 Calling Name Enquiry API...");

      const response = await axios.post(NAME_ENQUIRY_URL, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        timeout: 30000,
      });

      setResponse(response.data);
      toast.success("✅ Name Enquiry API call successful!");
    } catch (error) {
      console.error("Name Enquiry Error:", error);

      let errorMessage = "Name Enquiry failed: ";

      if (error.response) {
        if (error.response.status == 401) {
          errorMessage = "Unauthorized - Token expired or invalid";
          setToken("");
        } else if (error.response.status == 400) {
          errorMessage = "Bad request - Check beneficiary details";
        } else {
          errorMessage += `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage += "Bank server not responding";
      } else {
        errorMessage += error.message;
      }

      toast.error(`❌ ${errorMessage}`);
      setResponse(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Test with CORS proxy as fallback
  const generateTokenWithProxy = async () => {
    setLoading(true);
    setError(null);

    // Using a CORS proxy as fallback
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", CLIENT_ID);
    formData.append("client_secret", CLIENT_SECRET);

    try {
      toast.info("🔄 Trying with CORS proxy...");

      const response = await axios.post(CORS_PROXY + TOKEN_URL, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
        },
        timeout: 30000,
      });

      if (response.data?.access_token) {
        setToken(response.data.access_token);
        toast.success("✅ Token generated with proxy!");
      }
    } catch (error) {
      console.error("Proxy attempt failed:", error);
      toast.error("❌ Proxy attempt also failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />

      <h1 style={styles.header}>🏦 Kotak Bank API Tester</h1>

      {/* Debug Info */}
      <div style={styles.debugBox}>
        <strong>🔧 Debug Info:</strong>
        <div>
          Client ID: {CLIENT_ID.substring(0, 10)}...
          {CLIENT_ID.substring(CLIENT_ID.length - 5)}
        </div>
        <div>Client Secret: [HIDDEN]</div>
        <div>Token URL: {TOKEN_URL}</div>
      </div>

      <div style={styles.buttonGroup}>
        <button
          onClick={generateToken}
          disabled={loading}
          style={styles.button(loading ? "#ccc" : "#007bff")}
        >
          {loading ? "⏳ Processing..." : "1. Generate Token"}
        </button>

        <button
          onClick={() => callNameEnquiry()}
          disabled={loading || !token}
          style={styles.button(loading || !token ? "#ccc" : "#28a745")}
        >
          {loading ? "⏳ Processing..." : "2. Name Enquiry"}
        </button>

        <button
          onClick={generateTokenWithProxy}
          disabled={loading}
          style={styles.button(loading ? "#ccc" : "#ffc107")}
        >
          {loading ? "⏳..." : "🔄 Try with Proxy"}
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>❌ Error:</strong> {error}
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#fff",
              borderRadius: "5px",
            }}
          >
            <strong>🔍 Troubleshooting Steps:</strong>
            <ol style={{ marginTop: "10px", paddingLeft: "20px" }}>
              <li>
                <strong>Check Credentials:</strong> Make sure client_id and
                client_secret are correct (not swapped)
              </li>
              <li>
                <strong>Test with Postman:</strong> Use Postman to verify API
                works
              </li>
              <li>
                <strong>CORS Issue:</strong> Bank APIs block browser requests.
                You need:
              </li>
              <ul>
                <li>Backend proxy server</li>
                <li>Or contact bank to whitelist your domain</li>
              </ul>
              <li>
                <strong>Network:</strong> Port 8443 might be blocked by firewall
              </li>
            </ol>
          </div>
          <div style={{ marginTop: "15px" }}>
            <strong>📝 Postman Test Instructions:</strong>
            <pre style={styles.pre}>
              {`POST ${TOKEN_URL}
Headers:
  Content-Type: application/x-www-form-urlencoded

Body (x-www-form-urlencoded):
  grant_type: client_credentials
  client_id: ${CLIENT_ID}
  client_secret: ${CLIENT_SECRET}`}
            </pre>
          </div>
        </div>
      )}

      {token && (
        <div style={styles.tokenBox}>
          <strong>🔑 Token Generated:</strong>
          <div
            style={{
              wordBreak: "break-all",
              marginTop: "5px",
              fontSize: "12px",
            }}
          >
            {token}
          </div>
        </div>
      )}

      {response && (
        <div style={styles.responseBox}>
          <h3>📊 Bank Response:</h3>
          <pre style={styles.pre}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    color: "#333",
    borderBottom: "2px solid #eee",
    paddingBottom: "15px",
  },
  debugBox: {
    padding: "10px",
    backgroundColor: "#e3f2fd",
    borderRadius: "5px",
    margin: "20px 0",
    fontSize: "13px",
    border: "1px solid #90caf9",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  button: (bgColor) => ({
    padding: "12px 24px",
    backgroundColor: bgColor,
    color: bgColor == "#ffc107" ? "#000" : "white",
    border: "none",
    borderRadius: "5px",
    cursor: bgColor == "#ccc" ? "not-allowed" : "pointer",
    fontSize: "16px",
    flex: "1 1 auto",
    minWidth: "150px",
  }),
  errorBox: {
    padding: "15px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "5px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb",
  },
  tokenBox: {
    padding: "15px",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "5px",
    marginBottom: "20px",
    border: "1px solid #c3e6cb",
  },
  responseBox: {
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "5px",
    marginTop: "20px",
    border: "1px solid #dee2e6",
  },
  pre: {
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "5px",
    overflow: "auto",
    maxHeight: "300px",
    fontSize: "12px",
  },
};

export default KotakNameEnquiry;
