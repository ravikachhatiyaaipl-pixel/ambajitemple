import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

/**
 * DONATION MODULE - full page Add / Edit form
 *
 * Estate Management (hall-shop-management/*\/addedit.jsx) ke design ka same
 * structure: header (back + title), "<X> Details" card, right aligned
 * Cancel / Save buttons. Popup ki jagah ye page use hota hai.
 */
export const donationInputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-colors bg-white";
export const donationLabelCls = "block text-sm font-medium text-gray-700 mb-1.5";

/** Estate jaisa confirm (Swal) - save se pehle */
export const confirmDonationSave = async (isEdit, label = "Record") => {
  const result = await Swal.fire({
    title: isEdit ? `Update ${label}?` : `Create ${label}?`,
    text: isEdit
      ? "Are you sure you want to update this record?"
      : "Are you sure you want to create this record?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: isEdit ? "Yes, update!" : "Yes, create!",
    cancelButtonText: "Cancel",
  });
  return result.isConfirmed;
};

const DonationFormPage = ({
  title,
  subtitle,
  detailsTitle,
  onBack,
  onSubmit,
  saving = false,
  submitLabel = "Save",
  error = "",
  children,
}) => {
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-md font-semibold text-gray-900">
              {detailsTitle}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children}
            </div>

            {error && (
              <div className="mt-6 flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 flex items-center disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationFormPage;
