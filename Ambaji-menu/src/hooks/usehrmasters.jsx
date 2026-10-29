/***
 *  I3EMS - AMT ERP
 *  Hook: useHrMasters — loads department / employee-type / leave-type lists
 *  for HR report & dashboard filter dropdowns.
 */
import { useState, useEffect } from "react";
import axios from "axios";

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` } });
const pick = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

export const useHrMasters = () => {
  const [departments, setDepartments] = useState([]);
  const [empTypes, setEmpTypes] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const base = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let alive = true;
    const calls = [
      ["dpt-master/all/lst-dpt-master", setDepartments],
      ["emp-type/all", setEmpTypes],
      ["leave-type/all", setLeaveTypes],
    ];
    Promise.all(
      calls.map(async ([url, setter]) => {
        try {
          const res = await axios.get(`${base}/${url}`, auth());
          if (alive) setter(pick(res));
        } catch (e) {
          /* filter simply has no options */
        }
      }),
    );
    return () => { alive = false; };
  }, [base]);

  return { departments, empTypes, leaveTypes };
};

export default useHrMasters;
