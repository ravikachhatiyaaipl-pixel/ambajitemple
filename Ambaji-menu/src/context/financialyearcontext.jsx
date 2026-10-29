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

"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const FinancialYearContext = createContext();

export const FinancialYearProvider = ({ children }) => {
  const [financialYears, setFinancialYears] = useState([]);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchFinancialYears = async () => {
      try {
        setLoading(true);
                
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/fy-master`,
           {
         headers : {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
        }
        );

        if (response.data.success && response.data.data) {
          setFinancialYears(response.data.data);
          const currentYear = response.data.data.find(
            (year) => year.is_current_year == true,
          );
          setCurrentFinancialYear(currentYear || null);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching financial years:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFinancialYears();
  }, []);

  return (
    <FinancialYearContext.Provider
      value={{
        financialYears,
        currentFinancialYear,
        loading,
        error,
      }}
    >
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error(
      "useFinancialYear must be used within FinancialYearProvider",
    );
  }
  return context;
};
