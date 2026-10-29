/**
 *
 *  Application Name: I3EMS
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *  Version: Ambaji Mata Temple Management
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Search,
  Users,
  ListChecks,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import EmpAlwdedMapApi from "../../../services/empalwdedmapapi";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

const AddEditAlwdedEmpMapping = () => {
  const navigate = useNavigate();
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [saving, setSaving] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [empTypes, setEmpTypes] = useState([]);
  const [payBills, setPayBills] = useState([]);
  const [heads, setHeads] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [filters, setFilters] = useState({
    Dpt_Id: "",
    Dsg_Id: "",
    ETy_Id: "",
    PRB_id: "",
    search: "",
  });
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [selectedPadIds, setSelectedPadIds] = useState([]);
  const [headTypeFilter, setHeadTypeFilter] = useState("");
  const [headSearch, setHeadSearch] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [effectiveTo, setEffectiveTo] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [deptRes, dsgRes, typeRes, billRes, headRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dpt-master/all/lst-dpt-master`, {
          headers: authHeaders(),
        }),
        axios.get(`${API_BASE_URL}/designation/all`, { headers: authHeaders() }),
        axios.get(`${API_BASE_URL}/emp-type/all`, { headers: authHeaders() }),
        axios.get(`${API_BASE_URL}/payroll-bill/all`, { headers: authHeaders() }),
        EmpAlwdedMapApi.getHeads(),
      ]);

      const depts = deptRes.data?.data || deptRes.data || [];
      const dsgs = dsgRes.data?.data || dsgRes.data || [];
      const types = (typeRes.data?.data || typeRes.data || []).filter(
        (t) => t.Is_Active == "1" || t.Is_Active === 1 || t.Is_Active === true,
      );
      const bills = billRes.data?.data || billRes.data || [];

      setDepartments(Array.isArray(depts) ? depts : []);
      setDesignations(Array.isArray(dsgs) ? dsgs : []);
      setEmpTypes(Array.isArray(types) ? types : []);
      setPayBills(Array.isArray(bills) ? bills : []);
      setHeads(headRes?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load filter options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const params = {};
      if (filters.Dpt_Id) params.Dpt_Id = filters.Dpt_Id;
      if (filters.Dsg_Id) params.Dsg_Id = filters.Dsg_Id;
      if (filters.ETy_Id) params.ETy_Id = filters.ETy_Id;
      if (filters.PRB_id) params.PRB_id = filters.PRB_id;
      if (filters.search.trim()) params.search = filters.search.trim();

      const res = await EmpAlwdedMapApi.getEmployees(params);
      const list = res.data || [];
      setEmployees(list);
      setSelectedEmpIds([]);
      if (!list.length) toast("No employees found for selected filters");
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const filteredHeads = useMemo(() => {
    return heads.filter((h) => {
      if (headTypeFilter && h.Alw_Ded !== headTypeFilter) return false;
      if (!headSearch.trim()) return true;
      const term = headSearch.toLowerCase();
      return (
        h.PAD_Code?.toLowerCase().includes(term) ||
        h.PAD_Name?.toLowerCase().includes(term) ||
        h.PAD_ShortName?.toLowerCase().includes(term)
      );
    });
  }, [heads, headTypeFilter, headSearch]);

  const toggleEmp = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllEmp = () => {
    if (selectedEmpIds.length === employees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(employees.map((e) => e.Emp_Id));
    }
  };

  const togglePad = (id) => {
    setSelectedPadIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllPads = () => {
    const ids = filteredHeads.map((h) => h.PAD_Id);
    const allSelected = ids.every((id) => selectedPadIds.includes(id));
    if (allSelected) {
      setSelectedPadIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedPadIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const validate = () => {
    const next = {};
    if (!selectedEmpIds.length) next.employees = "Select at least one employee";
    if (!selectedPadIds.length)
      next.heads = "Select at least one allowance/deduction";
    if (!effectiveFrom) next.Effective_From = "Effective from date is required";
    if (
      effectiveTo &&
      effectiveFrom &&
      new Date(effectiveTo) < new Date(effectiveFrom)
    ) {
      next.Effective_To = "Effective to must be on/after from date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAssign = async () => {
    if (!validate()) return;

    const result = await Swal.fire({
      title: "Assign selected heads?",
      html: `<div style="text-align:left">
        <p><b>${selectedEmpIds.length}</b> employee(s)</p>
        <p><b>${selectedPadIds.length}</b> allowance/deduction head(s)</p>
        <p>Effective From: <b>${effectiveFrom}</b></p>
        ${effectiveTo ? `<p>Effective To: <b>${effectiveTo}</b></p>` : "<p>Effective To: Open</p>"}
      </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, assign",
      confirmButtonColor: "#2563eb",
    });
    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const res = await EmpAlwdedMapApi.bulkAssign({
        Emp_Ids: selectedEmpIds,
        PAD_Ids: selectedPadIds,
        Effective_From: effectiveFrom,
        Effective_To: effectiveTo || null,
        Is_Active: true,
      });
      toast.success(res.message || "Assigned successfully");
      navigate("/masters/payroll-pay-structures/alwded-emp-mapping");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to assign mappings",
      );
    } finally {
      setSaving(false);
    }
  };

  const calcLabel = (h) => {
    if (h.Calc_Type === "F") return `Flat ₹${h.Flat_Amount || 0}`;
    if (h.Calc_Type === "S") return `Slab (${(h.slabs || []).length})`;
    return `${h.Percentage || 0}% of Basic`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/alwded-emp-mapping")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bulk Assign Alw/Ded to Employees
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Filter employees, select heads, set effective date, then assign
            </p>
          </div>
        </div>
      </div>

      {loadingOptions ? (
        <div className="p-12 text-center text-gray-500">Loading options...</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Employee Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <select
                value={filters.Dpt_Id}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, Dpt_Id: e.target.value }))
                }
                className="px-3 py-2.5 border border-gray-300 rounded-lg"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.Dpt_id || d.Dpt_Id} value={d.Dpt_id || d.Dpt_Id}>
                    {d.Dpt_Name || d.Dpt_Desc}
                  </option>
                ))}
              </select>
              <select
                value={filters.Dsg_Id}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, Dsg_Id: e.target.value }))
                }
                className="px-3 py-2.5 border border-gray-300 rounded-lg"
              >
                <option value="">All Designations</option>
                {designations.map((d) => (
                  <option key={d.Dsg_id || d.Dsg_Id} value={d.Dsg_id || d.Dsg_Id}>
                    {d.Dsg_Title || d.Dsg_Desc || d.Dsg_Name}
                  </option>
                ))}
              </select>
              <select
                value={filters.ETy_Id}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, ETy_Id: e.target.value }))
                }
                className="px-3 py-2.5 border border-gray-300 rounded-lg"
              >
                <option value="">All Emp Types</option>
                {empTypes.map((t) => (
                  <option key={t.ETy_Id} value={t.ETy_Id}>
                    {t.ETy_Name}
                  </option>
                ))}
              </select>
              <select
                value={filters.PRB_id}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, PRB_id: e.target.value }))
                }
                className="px-3 py-2.5 border border-gray-300 rounded-lg"
              >
                <option value="">All Pay Bills</option>
                {payBills.map((b) => (
                  <option key={b.PRB_id || b.PRB_Id} value={b.PRB_id || b.PRB_Id}>
                    {b.PayBill_Code || b.Description || b.PRB_id}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="Emp code / name"
                />
              </div>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={loadEmployees}
                className="px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                Load Employees
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">
                  Employees ({selectedEmpIds.length}/{employees.length})
                </h2>
                {employees.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllEmp}
                    className="text-sm text-blue-600"
                  >
                    {selectedEmpIds.length === employees.length
                      ? "Clear All"
                      : "Select All"}
                  </button>
                )}
              </div>
              {errors.employees && (
                <p className="text-sm text-red-600 mb-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.employees}
                </p>
              )}
              <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
                {loadingEmployees ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : employees.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Apply filters and click Load Employees
                  </div>
                ) : (
                  employees.map((emp) => (
                    <label
                      key={emp.Emp_Id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedEmpIds.includes(emp.Emp_Id)}
                        onChange={() => toggleEmp(emp.Emp_Id)}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {emp.Emp_Code} - {emp.Emp_Name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {[emp.Department, emp.Designation, emp.EmpType]
                            .filter(Boolean)
                            .join(" | ")}
                          {emp.Basic != null ? ` | Basic: ₹${emp.Basic}` : ""}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <ListChecks className="h-4 w-4 mr-2" />
                  Allowances / Deductions ({selectedPadIds.length})
                </h2>
                {filteredHeads.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllPads}
                    className="text-sm text-blue-600"
                  >
                    Select All Visible
                  </button>
                )}
              </div>
              <div className="flex gap-2 mb-3">
                <select
                  value={headTypeFilter}
                  onChange={(e) => setHeadTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  <option value="A">Allowance</option>
                  <option value="D">Deduction</option>
                </select>
                <input
                  value={headSearch}
                  onChange={(e) => setHeadSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Search heads"
                />
              </div>
              {errors.heads && (
                <p className="text-sm text-red-600 mb-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.heads}
                </p>
              )}
              <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
                {filteredHeads.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No heads found
                  </div>
                ) : (
                  filteredHeads.map((h) => (
                    <label
                      key={h.PAD_Id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedPadIds.includes(h.PAD_Id)}
                        onChange={() => togglePad(h.PAD_Id)}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {h.PAD_Code} - {h.PAD_Name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {h.Alw_Ded === "A" ? "Allowance" : "Deduction"} ·{" "}
                          {calcLabel(h)}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Effective Period
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg ${
                    errors.Effective_From ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective To (optional)
                </label>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg ${
                    errors.Effective_To ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.Effective_To && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.Effective_To}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/masters/payroll-pay-structures/alwded-emp-mapping")
              }
              className="px-5 py-2.5 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleAssign}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Assign
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEditAlwdedEmpMapping;
