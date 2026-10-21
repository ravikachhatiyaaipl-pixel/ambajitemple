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

import { useSettings } from "../context/settingscontext";

export const useSystemSettings = () => {
  const { settings, loading, error, refreshSettings, getRowLimit } = useSettings();

  return {
    settings,
    loading,
    error,
    refreshSettings,
    getRowLimit,
  };
};