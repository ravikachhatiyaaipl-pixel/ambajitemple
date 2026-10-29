/***
 *  I3EMS - AMT ERP | PostLoginDashboard — resolves & redirects to the department's dashboard.
 *  Mount this at your default post-login route (e.g. path="/" or "/home"). It calls GET /my-dashboard,
 *  which returns the dashboard assigned to the logged-in user's department (falls back to Executive),
 *  then navigates to that dashboard's route.
 *
 *  Usage:
 *    <Route path="/" element={<PostLoginDashboard user={user} />} />
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } });

export default function PostLoginDashboard() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Loading your dashboard…");

  useEffect(() => {
    let alive = true;
    axios.get(`${API}/my-dashboard`, auth())
      .then((r) => {
        const dash = r.data?.data?.dashboard;
        const route = dash?.Route || "/dashboards/executive-dashboard";
        if (alive) navigate(route, { replace: true });
      })
      .catch(() => { if (alive) { setMsg("Could not resolve your dashboard — opening the executive dashboard."); navigate("/dashboards/executive-dashboard", { replace: true }); } });
    return () => { alive = false; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto" />
        <p className="mt-3 text-gray-500 text-sm">{msg}</p>
      </div>
    </div>
  );
}
