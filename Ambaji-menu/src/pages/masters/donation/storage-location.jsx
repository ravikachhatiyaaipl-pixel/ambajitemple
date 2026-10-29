import DonationApi from "../../services/donationapi";
import DonationMasterScreen from "./DonationMasterScreen";

/**
 * S07 - DONATION STORAGE LOCATION MASTER (Vault / Strong Room / Locker)
 */
const DonationStorageLocationMaster = ({ user }) => (
  <DonationMasterScreen
    title="Donation Storage Location Master"
    subtitle="Where the donated metal is stored (vault, locker, strong room)"
    addLabel="Add Location"
    api={{
      list: () => DonationApi.getStorageLocations(),
      create: (d) => DonationApi.createStorageLocation(d),
      update: (d) => DonationApi.updateStorageLocation(d),
      remove: (id) => DonationApi.deleteStorageLocation(id),
    }}
    columns={[
      { key: "location_id", label: "#", render: (r) => r.location_id },
      { key: "location_name", label: "Location Name" },
      { key: "location_type", label: "Type" },
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
        name: "location_name",
        label: "Location Name",
        key: "location_id",
        required: true,
        placeholder: "Vault A",
      },
      {
        name: "location_type",
        label: "Location Type",
        required: true,
        placeholder: "Vault",
        help: "Vault / Strong Room / Locker / Department",
      },
      { name: "is_active", label: "Status", type: "checkbox", defaultValue: true },
    ]}
    stats={(rows) => [
      ["Total Locations", rows.length, "text-gray-900"],
      ["Active", rows.filter((r) => r.is_active).length, "text-emerald-600"],
      [
        "Vaults",
        rows.filter((r) =>
          String(r.location_type).toLowerCase().includes("vault")
        ).length,
        "text-indigo-600",
      ],
      [
        "Inactive",
        rows.filter((r) => !r.is_active).length,
        "text-gray-500",
      ],
    ]}
  />
);

export default DonationStorageLocationMaster;
