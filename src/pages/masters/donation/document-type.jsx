import DonationApi from "../../services/donationapi";
import DonationMasterScreen from "./DonationMasterScreen";

/**
 * S06 - DONATION DOCUMENT TYPE MASTER
 */
const DonationDocumentTypeMaster = ({ user }) => (
  <DonationMasterScreen
    title="Donation Document Type Master"
    subtitle="Aadhaar, Invoice, Hallmark ... (mandatory documents)"
    addLabel="Add Document Type"
    api={{
      list: () => DonationApi.getDocumentTypes(),
      create: (d) => DonationApi.createDocumentType(d),
      update: (d) => DonationApi.updateDocumentType(d),
      remove: (id) => DonationApi.deleteDocumentType(id),
    }}
    columns={[
      { key: "doctype_id", label: "#", render: (r) => r.doctype_id },
      { key: "doctype_name", label: "Document Type" },
      {
        key: "is_mandatory",
        label: "Mandatory",
        render: (r) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              r.is_mandatory
                ? "bg-red-100 text-red-800"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {r.is_mandatory ? "Mandatory" : "Optional"}
          </span>
        ),
      },
      {
        key: "is_active",
        label: "Status",
        render: (r) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              r.is_active
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {r.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
    ]}
    fields={[
      {
        name: "doctype_name",
        label: "Document Type Name",
        key: "doctype_id",
        required: true,
        placeholder: "Aadhaar Card",
      },
      {
        name: "is_mandatory",
        label: "Mandatory",
        type: "checkbox",
        checkboxLabel: "Mandatory document (approval se pehle upload zaroori)",
        defaultValue: false,
      },
      { name: "is_active", label: "Status", type: "checkbox", defaultValue: true },
    ]}
    stats={(rows) => [
      ["Total Types", rows.length, "text-gray-900"],
      [
        "Mandatory",
        rows.filter((r) => r.is_mandatory).length,
        "text-red-600",
      ],
      ["Optional", rows.filter((r) => !r.is_mandatory).length, "text-gray-500"],
      ["Active", rows.filter((r) => r.is_active).length, "text-emerald-600"],
    ]}
  />
);

export default DonationDocumentTypeMaster;
