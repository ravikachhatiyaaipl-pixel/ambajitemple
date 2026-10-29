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

export const useFormatters = () => {
  const { formatDate, formatTime, formatDateTime, getAlignmentClass } =
    useSettings();

  return {
    formatDate,
    formatTime,
    formatDateTime,
    getAlignmentClass,
  };
};

export const useDateFormatter = () => {
  const { formatDate } = useSettings();
  return formatDate;
};

export const useTimeFormatter = () => {
  const { formatTime } = useSettings();
  return formatTime;
};

export const useDateTimeFormatter = () => {
  const { formatDateTime } = useSettings();
  return formatDateTime;
};

export const useAlignment = () => {
  const { getAlignmentClass } = useSettings();
  return getAlignmentClass;
};
