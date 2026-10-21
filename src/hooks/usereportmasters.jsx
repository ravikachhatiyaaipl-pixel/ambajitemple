/***
 *  I3EMS - AMT ERP
 *  Hook: useReportMasters
 *  Loads common filter master lists (wards, zones, tax types, payment modes,
 *  collection centres) once, for report/dashboard filter dropdowns.
 *  Response shape is normalised (accepts {data}|{data:{data}}|array).
 */
import { useState, useEffect } from "react";
import axios from "axios";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
});

const pick = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

export const useReportMasters = () => {
  const [wards, setWards] = useState([]);
  const [zones, setZones] = useState([]);
  const [taxTypes, setTaxTypes] = useState([]);
  const [payModes, setPayModes] = useState([]);
  const [collectionCenters, setCollectionCenters] = useState([]);
  const base = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const calls = [
        ["wards/all", setWards],
        ["zone-master/all", setZones],
        ["tax-type-master/all", setTaxTypes],
        ["payment-mode/all", setPayModes],
        ["collection-center/all", setCollectionCenters],
      ];
      await Promise.all(
        calls.map(async ([url, setter]) => {
          try {
            const res = await axios.get(`${base}/${url}`, auth());
            if (alive) setter(pick(res));
          } catch (e) {
            /* silent - filter simply has no options */
          }
        }),
      );
    };
    load();
    return () => {
      alive = false;
    };
  }, [base]);

  return { wards, zones, taxTypes, payModes, collectionCenters };
};

export default useReportMasters;
