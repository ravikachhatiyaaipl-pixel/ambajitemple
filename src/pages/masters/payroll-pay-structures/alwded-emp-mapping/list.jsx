/**
 *
 *  Application Name: I3EMS
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *  Version: Ambaji Mata Temple Management
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmpAlwdedMapApi from "../../../services/empalwdedmapapi";

const AlwdedEmpMappingList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageTitle, setPageTitle] = useState("Alw/Ded Emp Mapping");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const current = menuDetails.find(
        (item) =>
          item.Menu_Links ==
          "/masters/payroll-pay-structures/alwded-emp-mapping",
      );
      if (current?.Fnc_Title) setPageTitle(current.Fnc_Title);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadData();
  }, [page, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (search.trim()) params.search = search.trim();
      if (filterType) params.Alw_Ded = filterType;
      const res = await EmpAlwdedMapApi.getAll(params);
      const paginated = res.data || {};
      setItems(paginated.data || []);
      setLastPage(paginated.last_page || 1);
      setTotal(paginated.total || 0);
    } catch (error) {
      toast.error("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleDelete = async (id, label) => {
    const result = await Swal.fire({
      title: "Delete mapping?",
      text: label || "This mapping will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      await EmpAlwdedMapApi.delete(id);
      toast.success("Mapping deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleBulkUnassign = async () => {
    if (!selected.length) {
      toast.error("Select mappings first");
      return;
    }
    const result = await Swal.fire({
      title: "Unassign selected?",
      text: `Remove ${selected.length} mapping(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, unassign",
    });
    if (!result.isConfirmed) return;
    try {
      await EmpAlwdedMapApi.bulkUnassign(selected);
      setSelected([]);
      toast.success("Unassigned successfully");
      loadData();
    } catch {
      toast.error("Failed to unassign");
    }
  };

  const empName = (row) => {
    const emp = row.employee;
    if (!emp) return "-";
    return `${emp.Emp_Code || ""} - ${[emp.First_Name, emp.Last_Name].filter(Boolean).join(" ")}`;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 text-sm mt-1">
              Assign allowances/deductions to employees (bulk supported)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {selected.length > 0 && (
            <button
              onClick={handleBulkUnassign}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Unassign ({selected.length})
            </button>
          )}
          <Link
            to="/masters/payroll-pay-structures/alwded-emp-mapping/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Bulk Assign
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="Search employee / head code / name"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="A">Allowance</option>
            <option value="D">Deduction</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gray-800 text-white rounded-lg"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            Total mappings: {total}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      items.length > 0 &&
                      items.every((i) => selected.includes(i.EAM_Id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(items.map((i) => i.EAM_Id));
                      } else {
                        setSelected([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Head
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Effective From
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Effective To
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                    No mappings found.{" "}
                    <Link
                      to="/masters/payroll-pay-structures/alwded-emp-mapping/create"
                      className="text-blue-600"
                    >
                      Create assignment
                    </Link>
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.EAM_Id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.EAM_Id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected((prev) => [...prev, row.EAM_Id]);
                          } else {
                            setSelected((prev) =>
                              prev.filter((id) => id !== row.EAM_Id),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {empName(row)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {row.head?.PAD_Code || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {row.head?.PAD_Name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.head?.Alw_Ded === "A"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.head?.Alw_Ded === "A" ? "Allowance" : "Deduction"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.Effective_From
                        ? String(row.Effective_From).slice(0, 10)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.Effective_To
                        ? String(row.Effective_To).slice(0, 10)
                        : "Open"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          row.Is_Active
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.Is_Active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleDelete(
                            row.EAM_Id,
                            `${empName(row)} / ${row.head?.PAD_Code}`,
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {lastPage > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {lastPage}
            </span>
            <button
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              className="px-3 py-1.5 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlwdedEmpMappingList;
