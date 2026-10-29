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

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initSettingsFromLocalStorage = () => {
    try {
      const savedSettings = localStorage.getItem("amt_system_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        return parsed;
      }
    } catch (err) {
      console.error("Error loading settings from localStorage:", err);
    }
    return null;
  };

  const fetchSettingsFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-parameters`,
         {
         headers : {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
        }
      );

      if (response.data && response.data.length > 0) {
        const apiSettings = response.data[0];

        const formattedSettings = {
          id: apiSettings.id,
          Is_Active:
            apiSettings.Is_Active == "1" ||
            apiSettings.Is_Active == 1 ||
            apiSettings.Is_Active == true,

          Date_format: apiSettings.Date_format || "d-m-Y",
          Time_format: apiSettings.Time_format == "H:i" ? "24h" : "12h",
          time_format_api: apiSettings.Time_format || "h:i A",

          Amount: apiSettings.Amount || "left",
          Text: apiSettings.Text || "left",

          Db_Row_limit: apiSettings.Db_Row_limit
            ? parseInt(apiSettings.Db_Row_limit)
            : 25,

          Currency: apiSettings.Currency || "INR",

          created_at: apiSettings.created_at,
          updated_at: apiSettings.updated_at,
        };

        localStorage.setItem(
          "amt_system_settings",
          JSON.stringify(formattedSettings),
        );
        setSettings(formattedSettings);

        return formattedSettings;
      } else {
        const defaultSettings = {
          id: null,
          Is_Active: true,
          Date_format: "d-m-Y",
          Time_format: "12h",
          time_format_api: "h:i A",
          Amount: "left",
          Text: "left",
          Db_Row_limit: 25,
          Currency: "INR",
          created_at: null,
          updated_at: null,
        };

        localStorage.setItem(
          "amt_system_settings",
          JSON.stringify(defaultSettings),
        );
        setSettings(defaultSettings);

        return defaultSettings;
      }
    } catch (error) {
      console.error("Error fetching settings from API:", error);
      setError("Failed to load system settings");

      const cachedSettings = initSettingsFromLocalStorage();
      if (cachedSettings) {
        toast.warning("Using cached settings. API connection failed.");
        return cachedSettings;
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = useCallback(
    (date, format = null) => {
      if (!date) return "";

      const currentSettings = settings || initSettingsFromLocalStorage() || {};
      const dateFormat = format || currentSettings.Date_format || "d-m-Y";

      const d = new Date(date);
      if (isNaN(d.getTime())) return date;

      const pad = (n) => n.toString().padStart(2, "0");
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      };

      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const monthNames = [
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
      ];
      const fullMonthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const fullDayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      let formatted = dateFormat
        .replace(/d/g, pad(day))
        .replace(/j/g, day)
        .replace(/m/g, pad(month))
        .replace(/n/g, month)
        .replace(/Y/g, year)
        .replace(/y/g, year.toString().substr(-2))
        .replace(/M/g, monthNames[d.getMonth()])
        .replace(/F/g, fullMonthNames[d.getMonth()])
        .replace(/D/g, dayNames[d.getDay()])
        .replace(/l/g, fullDayNames[d.getDay()])
        .replace(/S/g, getOrdinalSuffix(day));

      return formatted;
    },
    [settings],
  );

  const formatTime = useCallback(
    (date, format = null) => {
      if (!date) return "";

      const currentSettings = settings || initSettingsFromLocalStorage() || {};
      const timeFormat = format || currentSettings.Time_format || "12h";

      const d = new Date(date);
      if (isNaN(d.getTime())) return date;

      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");

      if (timeFormat == "12h") {
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
      } else {
        return `${hours.toString().padStart(2, "0")}:${minutes}`;
      }
    },
    [settings],
  );

  const formatDateTime = useCallback(
    (date) => {
      if (!date) return "";
      return `${formatDate(date)} ${formatTime(date)}`;
    },
    [formatDate, formatTime],
  );

  const getAlignmentClass = useCallback(
    (fieldType = "Text") => {
      const currentSettings = settings || initSettingsFromLocalStorage() || {};

      if (fieldType == "Amount") {
        return currentSettings.Amount == "right" ? "Text-right" : "Text-left";
      } else {
        return currentSettings.Text == "right" ? "Text-right" : "Text-left";
      }
    },
    [settings],
  );

  const getRowLimit = useCallback(() => {
    const currentSettings = settings || initSettingsFromLocalStorage() || {};
    return currentSettings.Db_Row_limit || 25;
  }, [settings]);

  const refreshSettings = useCallback(async () => {
    return await fetchSettingsFromAPI();
  }, [fetchSettingsFromAPI]);

  useEffect(() => {
    initSettingsFromLocalStorage();
  }, []);

  const value = {
    settings,
    loading,
    error,
    formatDate,
    formatTime,
    formatDateTime,
    getAlignmentClass,
    getRowLimit,
    refreshSettings,
    fetchSettingsFromAPI,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
