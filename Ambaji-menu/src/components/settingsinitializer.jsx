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

import { useEffect } from "react";
import { useSettings } from "../context/settingscontext";

const SettingsInitializer = () => {
  const { loading, error, fetchSettingsFromAPI } = useSettings();
  
  useEffect(() => {
    const initSettings = async () => {
      try {
        await fetchSettingsFromAPI();
      } catch (err) {
        console.error("Failed to initialize settings:", err);
      }
    };
    
    initSettings();
  }, [fetchSettingsFromAPI]);
  
  if (loading) {
    return null; 
  }
  
  if (error) {
    return null;
  }
  
  return null;
};

export default SettingsInitializer;