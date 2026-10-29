import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Landmark } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import FdRegisterApi from "../../../services/fdregisterapi";

const BASE_PATH = "/transactions/bookkeeping-vouchers/fd-register";
const formatAmt = (val) =>
  val == null || val == ""
    ? "—"
    : "₹ " +
      Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
const formatDate = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const Field = ({ label, value }) => (
  <div>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <div className="mt-1 text-gray-900 font-medium">
      {value != null && value != "" ? (
        value
      ) : (
        <span className="text-gray-400 italic font-normal">—</span>
      )}
    </div>
  </div>
);

const ViewFdRegister = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await FdRegisterApi.getById(id);
      setItem(res?.data);
    } catch (_) {
      toast.error("Failed to load FD record");
      navigate(BASE_PATH);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete FD record?",
      text: `Delete FD No. "${item?.FDR_No}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      await FdRegisterApi.delete(id);
      toast.success("Deleted");
      navigate(BASE_PATH);
    } catch (_) {
      toast.error("Failed to delete");
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  if (!item) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(BASE_PATH)}
            className="mr-4 text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{item.FDR_No}</h1>
              <p className="text-sm text-gray-500">{item.Bank_Name}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to={`${BASE_PATH}/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Date" value={formatDate(item.FDR_Date)} />
        <Field label="FD No" value={item.FDR_No} />
        <Field label="Bank Name" value={item.Bank_Name} />
        <Field label="Branch" value={item.Branch_Name} />
        <Field label="Amount" value={formatAmt(item.Amount)} />
        <Field
          label="Interest Rate"
          value={item.Interest_Rate != null ? `${item.Interest_Rate}%` : null}
        />
        <Field label="Start Date" value={formatDate(item.Start_Date)} />
        <Field label="Maturity Date" value={formatDate(item.Maturity_Date)} />
        <Field
          label="Maturity Amount"
          value={formatAmt(item.Maturity_Amount)}
        />
        <Field label="Status" value={item.Status} />
        <div className="md:col-span-2">
          <Field label="Remarks" value={item.Remarks} />
        </div>
      </div>
    </div>
  );
};

export default ViewFdRegister;
