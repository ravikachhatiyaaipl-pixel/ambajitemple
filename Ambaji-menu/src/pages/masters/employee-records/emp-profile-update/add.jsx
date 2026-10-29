/***
 * Application Name: I3EMS
 * Developed By: Aark InfoSoft Pvt Ltd.
 * All Rights Reserved
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  User,
  Users,
  Calendar,
  AlertCircle,
  Award,
  CreditCard,
  Briefcase,
  Building2,
  Search,
  XCircle,
  ChevronDown,
  Loader,
  DollarSign,
  Percent,
  Heart,
  Flag,
  Check,
  Home,
  Coffee,
  Gift,
  TrendingUp,
  Hash,
  Shield,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import EmployeeProfileApi from "../../../services/employeeprofileapi";

// =============  SEARCHABLE DROPDOWN COMPONENT ==============
const SearchableDropdown = ({
  label,
  value,
  error,
  required = false,
  icon: Icon,
  isOpen,
  setIsOpen,
  searchTerm,
  setSearchTerm,
  items,
  filteredItems,
  highlightedIndex,
  onSelect,
  onKeyDown,
  onSearchKeyDown,
  onItemKeyDown,
  getDisplay,
  getSelectedDisplay,
  loading,
  placeholder,
  searchPlaceholder,
  buttonRef,
  dropdownRef,
  searchRef,
  itemRefs,
  listRef,
  getId = (item) => item?.id,
  disabled = false,
  renderItem,
  showAsText = false,
  lockedValue = "",
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  if (showAsText) {
    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          )}
          <div
            className={`w-full ${
              Icon ? "pl-10" : "pl-4"
            } pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700`}
          >
            {lockedValue || "Auto-filled from grade selection"}
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Auto-filled from grade selection (non-editable)
        </p>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={!disabled ? onKeyDown : undefined}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
            disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
        >
          {value ? (
            <span className="text-gray-900">{getSelectedDisplay()}</span>
          ) : (
            <span className="text-gray-500">
              {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
            </span>
          )}
        </button>

        {loading ? (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          !disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )
        )}

        {error && (
          <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "500px", width: "auto" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId = getId(item) || `item-${idx}`;

                return (
                  <button
                    key={itemId}
                    ref={(el) => {
                      if (el && itemRefs.current) {
                        itemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                    }}
                    onKeyDown={(e) => onItemKeyDown(e, idx, item)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : value && itemId && value == itemId.toString()
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderItem ? renderItem(item) : getDisplay(item)}
                    {value && itemId && value == itemId.toString() && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No items found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} items found</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// =============  QUOTA MULTI-SELECT COMPONENT ==============
const QuotaMultiSelect = ({
  quotas,
  loadingQuotas,
  isQuotaDropdownOpen,
  setIsQuotaDropdownOpen,
  quotaSearchTerm,
  setQuotaSearchTerm,
  filteredQuotas,
  quotaHighlightedIndex,
  handleQuotaKeyDown,
  handleQuotaSearchKeyDown,
  handleQuotaItemKeyDown,
  getSelectedQuotasDisplay,
  getQuotaDisplay,
  errors,
  quotaButtonRef,
  quotaDropdownRef,
  quotaSearchRef,
  quotaItemRefs,
  quotaListRef,
  formData,
  handleQuotaToggle,
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  return (
    <div ref={quotaDropdownRef} className="relative">
      <div className="relative">
        <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />

        <button
          ref={quotaButtonRef}
          type="button"
          onClick={() => setIsQuotaDropdownOpen(!isQuotaDropdownOpen)}
          onKeyDown={handleQuotaKeyDown}
          className={`w-full pl-10 pr-10 py-2.5 border ${
            errors.PHYHDCAP ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
        >
          {formData.PHYHDCAP && formData.PHYHDCAP.length > 0 ? (
            <span className="text-gray-900 truncate block">
              {getSelectedQuotasDisplay()}
            </span>
          ) : (
            <span className="text-gray-500">
              {loadingQuotas ? "Loading quotas..." : "Select quotas..."}
            </span>
          )}
        </button>

        {loadingQuotas ? (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          <button
            type="button"
            onClick={() => setIsQuotaDropdownOpen(!isQuotaDropdownOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}

        {errors.PHYHDCAP && (
          <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {formData.PHYHDCAP && formData.PHYHDCAP.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {quotas
            .filter((q) => formData.PHYHDCAP.includes(q.Qut_Id?.toString()))
            .map((quota) => (
              <span
                key={quota.Qut_Id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800"
              >
                {quota.Qut_Code || quota.Qut_Name}
                <button
                  type="button"
                  onClick={() => handleQuotaToggle(quota.Qut_Id)}
                  className="ml-1 text-pink-600 hover:text-pink-800"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </span>
            ))}
        </div>
      )}

      {isQuotaDropdownOpen && (
        <div
          className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "500px", width: "auto" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={quotaSearchRef}
                type="text"
                value={quotaSearchTerm}
                onChange={(e) => setQuotaSearchTerm(e.target.value)}
                onKeyDown={handleQuotaSearchKeyDown}
                placeholder="Search quotas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              {quotaSearchTerm && (
                <button
                  type="button"
                  onClick={() => setQuotaSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={quotaListRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {filteredQuotas.length > 0 ? (
              filteredQuotas.map((quota, idx) => {
                const quotaId = quota.Qut_Id?.toString();
                const isSelected = formData.PHYHDCAP.includes(quotaId);

                return (
                  <button
                    key={quotaId || idx}
                    ref={(el) => {
                      if (el && quotaItemRefs.current) {
                        quotaItemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => handleQuotaToggle(quota.Qut_Id)}
                    onKeyDown={(e) => handleQuotaItemKeyDown(e, idx)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      quotaHighlightedIndex == idx
                        ? "bg-blue-100"
                        : isSelected
                        ? "bg-blue-50"
                        : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {getQuotaDisplay(quota)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No quotas found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredQuotas.length} items found</span>
              <span>{formData.PHYHDCAP.length} selected</span>
            </div>
          </div>
        </div>
      )}

      {errors.PHYHDCAP && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {errors.PHYHDCAP}
        </p>
      )}
    </div>
  );
};

// =============  ALLOWANCES SECTION COMPONENT ==============
const AllowancesSection = ({
  formData,
  setFormData,
  errors,
  cpfNpsOptions,
  yesNoOptions,
  allowanceGroups,
  handleNumberInputChange,
  handleNumberBlur,
  npsPercentRef,
  fixHraAmountRef,
  hbaInterestRef,
  mcaInterestRef,
  fixGpfAmountRef,
  quotas,
  loadingQuotas,
  isQuotaDropdownOpen,
  setIsQuotaDropdownOpen,
  quotaSearchTerm,
  setQuotaSearchTerm,
  filteredQuotas,
  quotaHighlightedIndex,
  handleQuotaKeyDown,
  handleQuotaSearchKeyDown,
  handleQuotaItemKeyDown,
  handleQuotaToggle,
  getSelectedQuotasDisplay,
  getQuotaDisplay,
  quotaButtonRef,
  quotaDropdownRef,
  quotaSearchRef,
  quotaItemRefs,
  quotaListRef,
  cpfNpsRef,
  empGroupInsurances,
  loadingEmpGroupInsurances,
  isGISEGIDropdownOpen,
  setIsGISEGIDropdownOpen,
  gisEGISearchTerm,
  setGisEGISearchTerm,
  filteredGISEGI,
  gisEGIHighlightedIndex,
  handleGISEGIKeyDown,
  handleGISEGISearchKeyDown,
  handleGISEGIItemKeyDown,
  handleGISEGISelect,
  getGISEGIDisplay,
  getSelectedGISEGIDisplay,
  gisEGIButtonRef,
  gisEGIDropdownRef,
  gisEGISearchRef,
  gisEGIItemRefs,
  gisEGIListRef,
}) => {
  const showEGICodeDropdown = formData.GISF == "yes" || formData.GISV == "yes";

  const handleCPFKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (formData.CPF_NPS != "C") {
        npsPercentRef.current?.focus();
      } else {
        const npaSelect = document.querySelector('select[name="NPA"]');
        if (npaSelect) npaSelect.focus();
      }
    }
  };

  const handleNPSPercentKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const npaSelect = document.querySelector('select[name="NPA"]');
      if (npaSelect) npaSelect.focus();
    }
  };

  const handleNPAKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const daSelect = document.querySelector('select[name="DA"]');
      if (daSelect) daSelect.focus();
    }
  };

  const handleDAKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const hraSelect = document.querySelector('select[name="HRA"]');
      if (hraSelect) hraSelect.focus();
    }
  };

  const handleHRAKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (formData.HRA == "yes") {
        fixHraAmountRef.current?.focus();
      } else {
        const claSelect = document.querySelector('select[name="CLA"]');
        if (claSelect) claSelect.focus();
      }
    }
  };

  const handleFixHRAAmountKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const claSelect = document.querySelector('select[name="CLA"]');
      if (claSelect) claSelect.focus();
    }
  };

  const handleCLAKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const maSelect = document.querySelector('select[name="MA"]');
      if (maSelect) maSelect.focus();
    }
  };

  const handleMAKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const taSelect = document.querySelector('select[name="TA"]');
      if (taSelect) taSelect.focus();
    }
  };

  const handleTAKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const gisfSelect = document.querySelector('select[name="GISF"]');
      if (gisfSelect) gisfSelect.focus();
    }
  };

  const handleGISFKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (showEGICodeDropdown) {
        gisEGIButtonRef.current?.focus();
      } else {
        const gisvSelect = document.querySelector('select[name="GISV"]');
        if (gisvSelect) gisvSelect.focus();
      }
    }
  };

  const handleGISVKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (showEGICodeDropdown) {
        gisEGIButtonRef.current?.focus();
      } else {
        const gpfSelect = document.querySelector('select[name="GPF"]');
        if (gpfSelect) gpfSelect.focus();
      }
    }
  };

  const handleGPFKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (formData.GPF == "fixed") {
        fixGpfAmountRef.current?.focus();
      } else {
        const hbaSelect = document.querySelector('select[name="HBA"]');
        if (hbaSelect) hbaSelect.focus();
      }
    }
  };

  const handleFixGPFKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const hbaSelect = document.querySelector('select[name="HBA"]');
      if (hbaSelect) hbaSelect.focus();
    }
  };

  const handleHBAKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (formData.HBA == "yes") {
        hbaInterestRef.current?.focus();
      } else {
        const mcaSelect = document.querySelector('select[name="MCA"]');
        if (mcaSelect) mcaSelect.focus();
      }
    }
  };

  const handleHBAInterestKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const mcaSelect = document.querySelector('select[name="MCA"]');
      if (mcaSelect) mcaSelect.focus();
    }
  };

  const handleMCAKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (formData.MCA == "yes") {
        mcaInterestRef.current?.focus();
      } else {
        quotaButtonRef.current?.focus();
      }
    }
  };

  const handleMCAInterestKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      quotaButtonRef.current?.focus();
    }
  };

  const yesNoOptionsWithoutFixed = [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
  ];

  const gpfOptions = [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
    { value: "fixed", label: "Fixed" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
          CPF/NPS Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF/NPS
            </label>
            <select
              ref={cpfNpsRef}
              name="CPF_NPS"
              value={formData.CPF_NPS}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, CPF_NPS: e.target.value }))
              }
              onKeyDown={handleCPFKeyDown}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {cpfNpsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NPS Percentage
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={npsPercentRef}
                type="text"
                name="NPS_PERCENT"
                value={formData.NPS_PERCENT}
                onChange={handleNumberInputChange}
                onBlur={(e) => handleNumberBlur(e, "NPS_PERCENT")}
                onKeyDown={handleNPSPercentKeyDown}
                placeholder="Enter percentage"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.NPS_PERCENT ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
            {errors.NPS_PERCENT && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.NPS_PERCENT}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
            Allowances
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <select
                name="NPA"
                value={formData.NPA}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, NPA: e.target.value }))
                }
                onKeyDown={handleNPAKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Award className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">NPA</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                name="DA"
                value={formData.DA}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, DA: e.target.value }))
                }
                onKeyDown={handleDAKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">DA</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                name="HRA"
                value={formData.HRA}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, HRA: e.target.value }))
                }
                onKeyDown={handleHRAKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Home className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">HRA</span>
              {formData.HRA == "yes" && (
                <>
                  <div className="relative w-28 ml-2">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      ref={fixHraAmountRef}
                      type="text"
                      name="FixHRAAmount"
                      value={formData.FixHRAAmount || ""}
                      onChange={handleNumberInputChange}
                      onBlur={(e) => handleNumberBlur(e, "FixHRAAmount")}
                      onKeyDown={handleFixHRAAmountKeyDown}
                      placeholder="Amount"
                      className={`w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.FixHRAAmount
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    Fix HRA Amount
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                name="CLA"
                value={formData.CLA}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, CLA: e.target.value }))
                }
                onKeyDown={handleCLAKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">CLA</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                name="MA"
                value={formData.MA}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, MA: e.target.value }))
                }
                onKeyDown={handleMAKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">MA</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                name="TA"
                value={formData.TA}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, TA: e.target.value }))
                }
                onKeyDown={handleTAKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">TA</span>
            </div>

            <div className="hidden">
              <select
                name="FOOD"
                value={formData.FOOD}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, FOOD: e.target.value }))
                }
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="FEST"
                value={formData.FEST}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, FEST: e.target.value }))
                }
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="IR"
                value={formData.IR}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, IR: e.target.value }))
                }
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
            Savings & Loan Allowances
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <select
                name="GISF"
                value={formData.GISF || "no"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, GISF: e.target.value }))
                }
                onKeyDown={handleGISFKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">GISF</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                name="GISV"
                value={formData.GISV || "no"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, GISV: e.target.value }))
                }
                onKeyDown={handleGISVKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">GISV</span>
            </div>

            {showEGICodeDropdown && (
              <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-gray-200">
                <div className="relative flex-1 min-w-[400px]">
                  <SearchableDropdown
                    label="EGI Code"
                    value={formData.GIS_Em_gr}
                    error={errors.GIS_Em_gr}
                    icon={Shield}
                    isOpen={isGISEGIDropdownOpen}
                    setIsOpen={setIsGISEGIDropdownOpen}
                    searchTerm={gisEGISearchTerm}
                    setSearchTerm={setGisEGISearchTerm}
                    items={empGroupInsurances}
                    filteredItems={filteredGISEGI}
                    highlightedIndex={gisEGIHighlightedIndex}
                    onSelect={handleGISEGISelect}
                    onKeyDown={handleGISEGIKeyDown}
                    onSearchKeyDown={handleGISEGISearchKeyDown}
                    onItemKeyDown={handleGISEGIItemKeyDown}
                    getDisplay={(item) => getGISEGIDisplay(item)}
                    getSelectedDisplay={getSelectedGISEGIDisplay}
                    loading={loadingEmpGroupInsurances}
                    placeholder="Select EGI Code"
                    searchPlaceholder="Search by Group Type, Insurance Amt..."
                    buttonRef={gisEGIButtonRef}
                    dropdownRef={gisEGIDropdownRef}
                    searchRef={gisEGISearchRef}
                    itemRefs={gisEGIItemRefs}
                    listRef={gisEGIListRef}
                    getId={(item) => item?.EGI_Id?.toString()}
                  />
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  EGI Code (for GISF/GISV)
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <select
                name="GPF"
                value={formData.GPF}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, GPF: e.target.value }))
                }
                onKeyDown={handleGPFKeyDown}
                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {gpfOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">GPF</span>
              {formData.GPF == "fixed" && (
                <>
                  <div className="relative w-28 ml-2">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      ref={fixGpfAmountRef}
                      type="text"
                      name="FixGPF"
                      value={formData.FixGPF || ""}
                      onChange={handleNumberInputChange}
                      onBlur={(e) => handleNumberBlur(e, "FixGPF")}
                      onKeyDown={handleFixGPFKeyDown}
                      placeholder="Amount"
                      className={`w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.FixGPF ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    Fix GPF Amount
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                name="HBA"
                value={formData.HBA}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, HBA: e.target.value }))
                }
                onKeyDown={handleHBAKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Home className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">HBA</span>
              {formData.HBA == "yes" && (
                <>
                  <div className="relative w-24 ml-2">
                    <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      ref={hbaInterestRef}
                      type="text"
                      name="HBAINT"
                      value={formData.HBAINT || ""}
                      onChange={handleNumberInputChange}
                      onBlur={(e) => handleNumberBlur(e, "HBAINT")}
                      onKeyDown={handleHBAInterestKeyDown}
                      placeholder="Rate"
                      className={`w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.HBAINT ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    HBA Interest
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                name="MCA"
                value={formData.MCA}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, MCA: e.target.value }))
                }
                onKeyDown={handleMCAKeyDown}
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yesNoOptionsWithoutFixed.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">MCA</span>
              {formData.MCA == "yes" && (
                <>
                  <div className="relative w-24 ml-2">
                    <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      ref={mcaInterestRef}
                      type="text"
                      name="MCAINT"
                      value={formData.MCAINT || ""}
                      onChange={handleNumberInputChange}
                      onBlur={(e) => handleNumberBlur(e, "MCAINT")}
                      onKeyDown={handleMCAInterestKeyDown}
                      placeholder="Rate"
                      className={`w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.MCAINT ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    MCA Interest
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Heart className="h-4 w-4 mr-2 text-pink-600" />
          PHY/HD/AP Quota
        </h3>
        <QuotaMultiSelect
          quotas={quotas}
          loadingQuotas={loadingQuotas}
          isQuotaDropdownOpen={isQuotaDropdownOpen}
          setIsQuotaDropdownOpen={setIsQuotaDropdownOpen}
          quotaSearchTerm={quotaSearchTerm}
          setQuotaSearchTerm={setQuotaSearchTerm}
          filteredQuotas={filteredQuotas}
          quotaHighlightedIndex={quotaHighlightedIndex}
          handleQuotaKeyDown={handleQuotaKeyDown}
          handleQuotaSearchKeyDown={handleQuotaSearchKeyDown}
          handleQuotaItemKeyDown={handleQuotaItemKeyDown}
          getSelectedQuotasDisplay={getSelectedQuotasDisplay}
          getQuotaDisplay={getQuotaDisplay}
          errors={errors}
          quotaButtonRef={quotaButtonRef}
          quotaDropdownRef={quotaDropdownRef}
          quotaSearchRef={quotaSearchRef}
          quotaItemRefs={quotaItemRefs}
          quotaListRef={quotaListRef}
          formData={formData}
          handleQuotaToggle={handleQuotaToggle}
        />
      </div>

      <div className="flex items-center space-x-4 pt-4 border-t">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="Is_Active"
            checked={formData.Is_Active == true}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                Is_Active: e.target.checked,
              }))
            }
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Is Active (Profile)</span>
        </label>
      </div>
    </div>
  );
};

// =============  MAIN COMPONENT ==============
const AddEmpProfileUpdate = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Add this near your other state declarations (around line 400)
const [allDesignations, setAllDesignations] = useState([]); // Store all designations from API
  // =============  EMPLOYEE DROPDOWN STATES ==============
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeHighlightedIndex, setEmployeeHighlightedIndex] = useState(-1);
  const employeeDropdownRef = useRef(null);
  const employeeSearchRef = useRef(null);
  const employeeButtonRef = useRef(null);
  const employeeItemRefs = useRef([]);
  const employeeListRef = useRef(null);

  // =============  GRADE DROPDOWN STATES ==============
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [gradeHighlightedIndex, setGradeHighlightedIndex] = useState(-1);
  const gradeDropdownRef = useRef(null);
  const gradeSearchRef = useRef(null);
  const gradeButtonRef = useRef(null);
  const gradeItemRefs = useRef([]);
  const gradeListRef = useRef(null);

  // =============  DEPARTMENT MULTI-SELECT STATES (CHANGED) ==============
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  // =============  DESIGNATION DROPDOWN STATES ==============
  const [designations, setDesignations] = useState([]);
  const [flattenedDesignations, setFlattenedDesignations] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [isDesgDropdownOpen, setIsDesgDropdownOpen] = useState(false);
  const [desgSearchTerm, setDesgSearchTerm] = useState("");
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [desgHighlightedIndex, setDesgHighlightedIndex] = useState(-1);
  const desgDropdownRef = useRef(null);
  const desgSearchRef = useRef(null);
  const desgButtonRef = useRef(null);
  const desgItemRefs = useRef([]);
  const desgListRef = useRef(null);

  // =============  EMPLOYEE TYPE DROPDOWN STATES ==============
  const [empTypes, setEmpTypes] = useState([]);
  const [loadingEmpTypes, setLoadingEmpTypes] = useState(false);
  const [isEmpTypeDropdownOpen, setIsEmpTypeDropdownOpen] = useState(false);
  const [empTypeSearchTerm, setEmpTypeSearchTerm] = useState("");
  const [filteredEmpTypes, setFilteredEmpTypes] = useState([]);
  const [empTypeHighlightedIndex, setEmpTypeHighlightedIndex] = useState(-1);
  const empTypeDropdownRef = useRef(null);
  const empTypeSearchRef = useRef(null);
  const empTypeButtonRef = useRef(null);
  const empTypeItemRefs = useRef([]);
  const empTypeListRef = useRef(null);

  // =============  EMPLOYEE STATUS DROPDOWN STATES ==============
  const [empStatuses, setEmpStatuses] = useState([]);
  const [loadingEmpStatuses, setLoadingEmpStatuses] = useState(false);
  const [isEmpStatusDropdownOpen, setIsEmpStatusDropdownOpen] = useState(false);
  const [empStatusSearchTerm, setEmpStatusSearchTerm] = useState("");
  const [filteredEmpStatuses, setFilteredEmpStatuses] = useState([]);
  const [empStatusHighlightedIndex, setEmpStatusHighlightedIndex] =
    useState(-1);
  const empStatusDropdownRef = useRef(null);
  const empStatusSearchRef = useRef(null);
  const empStatusButtonRef = useRef(null);
  const empStatusItemRefs = useRef([]);
  const empStatusListRef = useRef(null);

  // =============  PAY BILL DROPDOWN STATES ==============
  const [payBills, setPayBills] = useState([]);
  const [loadingPayBills, setLoadingPayBills] = useState(false);
  const [isPayBillDropdownOpen, setIsPayBillDropdownOpen] = useState(false);
  const [payBillSearchTerm, setPayBillSearchTerm] = useState("");
  const [filteredPayBills, setFilteredPayBills] = useState([]);
  const [payBillHighlightedIndex, setPayBillHighlightedIndex] = useState(-1);
  const payBillDropdownRef = useRef(null);
  const payBillSearchRef = useRef(null);
  const payBillButtonRef = useRef(null);
  const payBillItemRefs = useRef([]);
  const payBillListRef = useRef(null);

  // =============  CITY GRADE DROPDOWN STATES ==============
  const [cityGrades, setCityGrades] = useState([]);
  const [loadingCityGrades, setLoadingCityGrades] = useState(false);
  const [isCityGradeDropdownOpen, setIsCityGradeDropdownOpen] = useState(false);
  const [cityGradeSearchTerm, setCityGradeSearchTerm] = useState("");
  const [filteredCityGrades, setFilteredCityGrades] = useState([]);
  const [cityGradeHighlightedIndex, setCityGradeHighlightedIndex] =
    useState(-1);
  const cityGradeDropdownRef = useRef(null);
  const cityGradeSearchRef = useRef(null);
  const cityGradeButtonRef = useRef(null);
  const cityGradeItemRefs = useRef([]);
  const cityGradeListRef = useRef(null);

  // =============  PAY MATRIX DROPDOWN STATES ==============
  const [payMatrices, setPayMatrices] = useState([]);
  const [loadingPayMatrices, setLoadingPayMatrices] = useState(false);
  const [isPayMatrixDropdownOpen, setIsPayMatrixDropdownOpen] = useState(false);
  const [payMatrixSearchTerm, setPayMatrixSearchTerm] = useState("");
  const [filteredPayMatrices, setFilteredPayMatrices] = useState([]);
  const [payMatrixHighlightedIndex, setPayMatrixHighlightedIndex] =
    useState(-1);
  const payMatrixDropdownRef = useRef(null);
  const payMatrixSearchRef = useRef(null);
  const payMatrixButtonRef = useRef(null);
  const payMatrixItemRefs = useRef([]);
  const payMatrixListRef = useRef(null);

  // =============  WEEK OFF PATTERN DROPDOWN STATES ==============
  const [weekOffPatterns, setWeekOffPatterns] = useState([]);
  const [loadingWeekOffPatterns, setLoadingWeekOffPatterns] = useState(false);
  const [isWeekOffPatternDropdownOpen, setIsWeekOffPatternDropdownOpen] =
    useState(false);
  const [weekOffPatternSearchTerm, setWeekOffPatternSearchTerm] = useState("");
  const [filteredWeekOffPatterns, setFilteredWeekOffPatterns] = useState([]);
  const [weekOffPatternHighlightedIndex, setWeekOffPatternHighlightedIndex] =
    useState(-1);
  const weekOffPatternDropdownRef = useRef(null);
  const weekOffPatternSearchRef = useRef(null);
  const weekOffPatternButtonRef = useRef(null);
  const weekOffPatternItemRefs = useRef([]);
  const weekOffPatternListRef = useRef(null);

  // =============  QUOTA MULTI-SELECT STATES ==============
  const [quotas, setQuotas] = useState([]);
  const [loadingQuotas, setLoadingQuotas] = useState(false);
  const [isQuotaDropdownOpen, setIsQuotaDropdownOpen] = useState(false);
  const [quotaSearchTerm, setQuotaSearchTerm] = useState("");
  const [filteredQuotas, setFilteredQuotas] = useState([]);
  const [quotaHighlightedIndex, setQuotaHighlightedIndex] = useState(-1);
  const quotaDropdownRef = useRef(null);
  const quotaSearchRef = useRef(null);
  const quotaButtonRef = useRef(null);
  const quotaItemRefs = useRef([]);
  const quotaListRef = useRef(null);

  // =============  EMPLOYEE GROUP INSURANCE DROPDOWN STATES ==============
  const [empGroupInsurances, setEmpGroupInsurances] = useState([]);
  const [loadingEmpGroupInsurances, setLoadingEmpGroupInsurances] =
    useState(false);
  const [isGISEGIDropdownOpen, setIsGISEGIDropdownOpen] = useState(false);
  const [gisEGISearchTerm, setGisEGISearchTerm] = useState("");
  const [filteredGISEGI, setFilteredGISEGI] = useState([]);
  const [gisEGIHighlightedIndex, setGisEGIHighlightedIndex] = useState(-1);
  const gisEGIDropdownRef = useRef(null);
  const gisEGISearchRef = useRef(null);
  const gisEGIButtonRef = useRef(null);
  const gisEGIItemRefs = useRef([]);
  const gisEGIListRef = useRef(null);

  // =============  REFS FOR FOCUS MANAGEMENT ==============
  const joinDateRef = useRef(null);
  const profileDateRef = useRef(null);
  const cpfNpsRef = useRef(null);
  const npsPercentRef = useRef(null);
  const fixHraAmountRef = useRef(null);
  const hbaInterestRef = useRef(null);
  const mcaInterestRef = useRef(null);
  const fixGpfAmountRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // =============  YES/NO OPTIONS ==============
  const yesNoOptions = [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
  ];

  // =============  FORM DATA (CHANGED: Dpt_id is now array) ==============
  const [formData, setFormData] = useState({
    Emp_Id: "",
    EPP_Date: "",
    EGM_Id: "",
    Dpt_id: [], // CHANGED: Now array for multiple departments
    Dsg_Id: "",
    ETy_Id: "",
    Join_Date: "",
    Est_Id: "",
    Is_Active: true,
    IncMonth: "",
    Basic: "",
    FixHRAAmount: "",
    DA: "no",
    HRA: "no",
    CLA: "no",
    MA: "no",
    TA: "no",
    NPA: "no",
    GPF: "no",
    FixGPF: "",
    HBA: "no",
    HBAINT: "",
    MCA: "no",
    MCAINT: "",
    FOOD: "no",
    FEST: "no",
    IR: "no",
    CPF_NPS: "",
    NPS_PERCENT: "",
    PHYHDCAP: [],
    BillNo: "",
    PB_Id: "",
    PBillNo: "",
    CityCode: "",
    Status: true,
    GISF: "no",
    GISV: "no",
    GIS_Em_gr: "",
    WeekOffPattern: "",
  });

  // Add this function near your other fetch functions (around line 800)
const fetchAllDesignations = async () => {
  setLoadingDesignations(true);
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${API_BASE_URL}/designation/all`,
          {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
    );

    let designationsData = [];
    if (response.data && response.data.data) {
      designationsData = response.data.data;
    } else if (Array.isArray(response.data)) {
      designationsData = response.data;
    }

    // Store all designations
    setAllDesignations(designationsData);
    
    // Also set initial designations (empty initially)
    setDesignations([]);
    setFlattenedDesignations([]);
    setFilteredDesignations([]);
    
  } catch (error) {
    console.error("Error fetching designations:", error);
    toast.error("Failed to load designation data");
    setAllDesignations([]);
  } finally {
    setLoadingDesignations(false);
  }
};

  // =============  PAY BAND STATE ==============
  const [payBandDisplay, setPayBandDisplay] = useState("");

  // =============  CPF_NPS OPTIONS ==============
  const cpfNpsOptions = [
    { value: "", label: "Select CPF/NPS" },
    { value: "G", label: "G" },
    { value: "N", label: "N" },
    { value: "C", label: "C" },
  ];

  // =============  ALLOWANCES CONFIGURATION ==============
  const allowanceGroups = [
    {
      title: "Basic Allowances",
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      items: [
        { name: "DA", label: "DA", icon: TrendingUp },
        { name: "MA", label: "MA", icon: DollarSign },
        { name: "TA", label: "TA", icon: DollarSign },
        { name: "FOOD", label: "FOOD", icon: Coffee },
        { name: "FEST", label: "FEST", icon: Gift },
      ],
    },
    {
      title: "Housing & Special Allowances",
      icon: <Home className="h-4 w-4 text-blue-600" />,
      items: [
        { name: "HRA", label: "HRA", icon: Home },
        { name: "CLA", label: "CLA", icon: Building2 },
        { name: "IR", label: "IR", icon: Flag },
        { name: "NPA", label: "NPA", icon: Award },
      ],
    },
    {
      title: "Savings & Loan Allowances",
      icon: <CreditCard className="h-4 w-4 text-purple-600" />,
      items: [
        { name: "GPF", label: "GPF", icon: TrendingUp },
        { name: "HBA", label: "HBA", icon: Home },
        { name: "MCA", label: "MCA", icon: CreditCard },
      ],
    },
  ];

  // =============  BUILD TREE STRUCTURE FOR DEPARTMENTS ==============
  const buildDepartmentTree = (depts) => {
    const map = {};
    const roots = [];

    depts.forEach((dept) => {
      map[dept.Dpt_id] = { ...dept, children: [] };
    });

    depts.forEach((dept) => {
      if (dept.UpGrp && map[dept.UpGrp] && dept.UpGrp != dept.Dpt_id) {
        map[dept.UpGrp].children.push(map[dept.Dpt_id]);
      } else {
        roots.push(map[dept.Dpt_id]);
      }
    });

    return roots;
  };

  // =============  FLATTEN TREE FOR DISPLAY ==============
  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, treeLevel: level });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1, result);
      }
    });
    return result;
  };

  // =============  BUILD TREE STRUCTURE FOR DESIGNATIONS ==============
  const buildDesignationTree = (desgs) => {
    const map = {};
    const roots = [];

    desgs.forEach((desg) => {
      map[desg.Dsg_id] = { ...desg, children: [] };
    });

    desgs.forEach((desg) => {
      if (desg.UpGrp && map[desg.UpGrp] && desg.UpGrp != desg.Dsg_id) {
        map[desg.UpGrp].children.push(map[desg.Dsg_id]);
      } else {
        roots.push(map[desg.Dsg_id]);
      }
    });

    return roots;
  };

  // =============  CLICK OUTSIDE HANDLER ==============
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setIsEmployeeDropdownOpen(false);
        setEmployeeHighlightedIndex(-1);
        setEmployeeSearchTerm("");
      }
      if (
        gradeDropdownRef.current &&
        !gradeDropdownRef.current.contains(event.target)
      ) {
        setIsGradeDropdownOpen(false);
        setGradeHighlightedIndex(-1);
        setGradeSearchTerm("");
      }
      if (
        empStatusDropdownRef.current &&
        !empStatusDropdownRef.current.contains(event.target)
      ) {
        setIsEmpStatusDropdownOpen(false);
        setEmpStatusHighlightedIndex(-1);
        setEmpStatusSearchTerm("");
      }
      if (
        empTypeDropdownRef.current &&
        !empTypeDropdownRef.current.contains(event.target)
      ) {
        setIsEmpTypeDropdownOpen(false);
        setEmpTypeHighlightedIndex(-1);
        setEmpTypeSearchTerm("");
      }
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target)
      ) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
      if (
        desgDropdownRef.current &&
        !desgDropdownRef.current.contains(event.target)
      ) {
        setIsDesgDropdownOpen(false);
        setDesgHighlightedIndex(-1);
        setDesgSearchTerm("");
      }
      if (
        payBillDropdownRef.current &&
        !payBillDropdownRef.current.contains(event.target)
      ) {
        setIsPayBillDropdownOpen(false);
        setPayBillHighlightedIndex(-1);
        setPayBillSearchTerm("");
      }
      if (
        cityGradeDropdownRef.current &&
        !cityGradeDropdownRef.current.contains(event.target)
      ) {
        setIsCityGradeDropdownOpen(false);
        setCityGradeHighlightedIndex(-1);
        setCityGradeSearchTerm("");
      }
      if (
        payMatrixDropdownRef.current &&
        !payMatrixDropdownRef.current.contains(event.target)
      ) {
        setIsPayMatrixDropdownOpen(false);
        setPayMatrixHighlightedIndex(-1);
        setPayMatrixSearchTerm("");
      }
      if (
        quotaDropdownRef.current &&
        !quotaDropdownRef.current.contains(event.target)
      ) {
        setIsQuotaDropdownOpen(false);
        setQuotaHighlightedIndex(-1);
        setQuotaSearchTerm("");
      }
      if (
        gisEGIDropdownRef.current &&
        !gisEGIDropdownRef.current.contains(event.target)
      ) {
        setIsGISEGIDropdownOpen(false);
        setGisEGIHighlightedIndex(-1);
        setGisEGISearchTerm("");
      }
      if (
        weekOffPatternDropdownRef.current &&
        !weekOffPatternDropdownRef.current.contains(event.target)
      ) {
        setIsWeekOffPatternDropdownOpen(false);
        setWeekOffPatternHighlightedIndex(-1);
        setWeekOffPatternSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =============  FOCUS SEARCH WHEN DROPDOWN OPENS ==============
  useEffect(() => {
    if (isEmployeeDropdownOpen && employeeSearchRef.current) {
      setTimeout(() => employeeSearchRef.current.focus(), 0);
    }
  }, [isEmployeeDropdownOpen]);

  useEffect(() => {
    if (isGradeDropdownOpen && gradeSearchRef.current) {
      setTimeout(() => gradeSearchRef.current.focus(), 0);
    }
  }, [isGradeDropdownOpen]);

  useEffect(() => {
    if (isEmpStatusDropdownOpen && empStatusSearchRef.current) {
      setTimeout(() => empStatusSearchRef.current.focus(), 0);
    }
  }, [isEmpStatusDropdownOpen]);

  useEffect(() => {
    if (isEmpTypeDropdownOpen && empTypeSearchRef.current) {
      setTimeout(() => empTypeSearchRef.current.focus(), 0);
    }
  }, [isEmpTypeDropdownOpen]);

  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  useEffect(() => {
    if (isDesgDropdownOpen && desgSearchRef.current) {
      setTimeout(() => desgSearchRef.current.focus(), 0);
    }
  }, [isDesgDropdownOpen]);

  useEffect(() => {
    if (isPayBillDropdownOpen && payBillSearchRef.current) {
      setTimeout(() => payBillSearchRef.current.focus(), 0);
    }
  }, [isPayBillDropdownOpen]);

  useEffect(() => {
    if (isCityGradeDropdownOpen && cityGradeSearchRef.current) {
      setTimeout(() => cityGradeSearchRef.current.focus(), 0);
    }
  }, [isCityGradeDropdownOpen]);

  useEffect(() => {
    if (isPayMatrixDropdownOpen && payMatrixSearchRef.current) {
      setTimeout(() => payMatrixSearchRef.current.focus(), 0);
    }
  }, [isPayMatrixDropdownOpen]);

  useEffect(() => {
    if (isQuotaDropdownOpen && quotaSearchRef.current) {
      setTimeout(() => quotaSearchRef.current.focus(), 0);
    }
  }, [isQuotaDropdownOpen]);

  useEffect(() => {
    if (isGISEGIDropdownOpen && gisEGISearchRef.current) {
      setTimeout(() => gisEGISearchRef.current.focus(), 0);
    }
  }, [isGISEGIDropdownOpen]);

  useEffect(() => {
    if (isWeekOffPatternDropdownOpen && weekOffPatternSearchRef.current) {
      setTimeout(() => weekOffPatternSearchRef.current.focus(), 0);
    }
  }, [isWeekOffPatternDropdownOpen]);

useEffect(() => {
  fetchEmployees();
  fetchAllGrades();
  fetchDepartments();
  fetchEmpTypes();
  fetchEmpStatuses();
  fetchPayBills();
  fetchCityGrades();
  fetchQuotas();
  fetchEmpGroupInsurances();
  fetchWeekOffPatterns();
  fetchAllDesignations(); 
}, []);

  

  // =============  FETCH PAY MATRICES AND PAY BAND WHEN GRADE CHANGES ==============
  useEffect(() => {
    if (formData.EGM_Id) {
      fetchPayMatricesByGrade(formData.EGM_Id);
    } else {
      setPayMatrices([]);
      setFilteredPayMatrices([]);
      setFormData((prev) => ({ ...prev, Basic: "" }));
      setPayBandDisplay("");
    }
  }, [formData.EGM_Id]);

  // =============  SET INCREMENT MONTH BASED ON POST DATE ==============
  useEffect(() => {
    if (formData.EPP_Date) {
      const postDate = new Date(formData.EPP_Date);
      const month = postDate.getMonth() + 1;
      const incrementMonth = month >= 1 && month <= 6 ? "7" : "1";
      setFormData((prev) => ({ ...prev, IncMonth: incrementMonth }));
    }
  }, [formData.EPP_Date]);

  // =============  FETCH WEEK OFF PATTERNS ==============
  const fetchWeekOffPatterns = async () => {
    setLoadingWeekOffPatterns(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/woff-pattern/all`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      let patternsData = [];
      if (response.data && response.data.success && response.data.data) {
        patternsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        patternsData = response.data;
      } else if (response.data && response.data.data) {
        patternsData = response.data.data;
      }

      setWeekOffPatterns(patternsData);
      setFilteredWeekOffPatterns(patternsData);
    } catch (error) {
      console.error("Error fetching week off patterns:", error);
      toast.error("Failed to load week off pattern data");
      setWeekOffPatterns([]);
      setFilteredWeekOffPatterns([]);
    } finally {
      setLoadingWeekOffPatterns(false);
    }
  };

 // Replace the existing fetchDesignationsByDepartment function with this:
const filterDesignationsByDepartment = (deptIds) => {
  // Check if department IDs exist and array is not empty
  if (!deptIds || deptIds.length == 0 || !allDesignations.length) {
    setDesignations([]);
    setFlattenedDesignations([]);
    setFilteredDesignations([]);
    return;
  }

  // Filter designations locally from the stored allDesignations
  const filteredByDept = allDesignations.filter((desg) => {
    if (!desg || !desg.Dpt_id) return false;
    
    const selectedDeptIdStrs = deptIds.map(id => id.toString());
    
    if (Array.isArray(desg.Dpt_id)) {
      return desg.Dpt_id.some((id) => selectedDeptIdStrs.includes(id.toString()));
    } else if (typeof desg.Dpt_id == "string" && desg.Dpt_id.includes(",")) {
      const deptIdList = desg.Dpt_id.split(",").map((id) => id.trim());
      return deptIdList.some((id) => selectedDeptIdStrs.includes(id));
    } else {
      return selectedDeptIdStrs.includes(desg.Dpt_id.toString());
    }
  });

  const validDesignations = filteredByDept
    .filter((desg) => desg && (desg.Dsg_id || desg.id))
    .sort((a, b) => (a.GrCod || "").localeCompare(b.GrCod || ""));

  setDesignations(validDesignations);

  // Build tree and flatten for display
  const tree = buildDesignationTree(validDesignations);
  const flattened = flattenTree(tree);
  setFlattenedDesignations(flattened);
  setFilteredDesignations(flattened);
  
  // Clear selected designation if it's no longer valid
  if (formData.Dsg_Id) {
    const stillValid = validDesignations.some(
      (d) => (d.Dsg_id || d.id)?.toString() == formData.Dsg_Id
    );
    if (!stillValid) {
      setFormData(prev => ({ ...prev, Dsg_Id: "" }));
    }
  }
};



// Update this useEffect (around line 620)
useEffect(() => {
  if (formData.Dpt_id && formData.Dpt_id.length > 0) {
    // Use filter function instead of API call
    filterDesignationsByDepartment(formData.Dpt_id);
  } else {
    setDesignations([]);
    setFlattenedDesignations([]);
    setFilteredDesignations([]);
    setFormData((prev) => ({ ...prev, Dsg_Id: "" }));
  }
}, [formData.Dpt_id, allDesignations]); // Add allDesignations as dependency

  // =============  FETCH PAY MATRICES BY GRADE ==============
  const fetchPayMatricesByGrade = async (gradeId) => {
    if (!gradeId) return;

    setLoadingPayMatrices(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${API_BASE_URL}/employee-profile/paymatrix-by-grade/${gradeId}`,
            {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      let matricesData = [];
      let payBandInfo = "";

      if (response.data && response.data.success && response.data.data) {
        matricesData = response.data.data;

        if (
          matricesData.length > 0 &&
          matricesData[0].emp_grade &&
          matricesData[0].emp_grade.payband
        ) {
          const payband = matricesData[0].emp_grade.payband;
          payBandInfo = `${payband.PB_Code || ""} (₹${parseFloat(
            payband.Min_Pay || 0
          ).toFixed(2)} - ₹${parseFloat(payband.Max_Pay || 0).toFixed(2)})`;
          setFormData((prev) => ({
            ...prev,
            PB_Id: payband.PB_Id?.toString() || prev.PB_Id,
          }));
        }
      }

      setPayMatrices(matricesData);
      setFilteredPayMatrices(matricesData);
      setPayBandDisplay(payBandInfo);
      setFormData((prev) => ({ ...prev, Basic: "" }));
    } catch (error) {
      console.error("Error fetching pay matrices by grade:", error);
      toast.error("Failed to load pay matrix data for selected grade");
      setPayMatrices([]);
      setFilteredPayMatrices([]);
      setPayBandDisplay("");
    } finally {
      setLoadingPayMatrices(false);
    }
  };

  // =============  FETCH EMPLOYEE GROUP INSURANCES ==============
  const fetchEmpGroupInsurances = async () => {
    setLoadingEmpGroupInsurances(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/emp-group-ins/all`,
            {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      let insurancesData = [];
      if (response.data && response.data.success && response.data.data) {
        insurancesData = response.data.data;
      } else if (response.data && response.data.data) {
        insurancesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        insurancesData = response.data;
      }

      setEmpGroupInsurances(insurancesData);
      setFilteredGISEGI(insurancesData);
    } catch (error) {
      console.error("Error fetching employee group insurances:", error);
      toast.error("Failed to load EGI Code data");
      setEmpGroupInsurances([]);
      setFilteredGISEGI([]);
    } finally {
      setLoadingEmpGroupInsurances(false);
    }
  };

  // =============  API CALLS ==============
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

      if (response.data && response.data.status == true && response.data.data) {
        const employeesData = response.data.data;
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
      } else if (Array.isArray(response.data)) {
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } else if (response.data && response.data.data) {
        setEmployees(response.data.data);
        setFilteredEmployees(response.data.data);
      } else {
        setEmployees([]);
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employee data");
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchAllGrades = async () => {
    setLoadingGrades(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/emp-grade/all`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

      let gradesData = [];
      if (response.data && response.data.success && response.data.data) {
        gradesData = response.data.data;
      } else if (response.data && response.data.data) {
        gradesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        gradesData = response.data;
      }

      setGrades(gradesData);
      setFilteredGrades(gradesData);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to load grade data");
      setGrades([]);
      setFilteredGrades([]);
    } finally {
      setLoadingGrades(false);
    }
  };

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${API_BASE_URL}/dpt-master/all/lst-dpt-master`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      let departmentsData = [];

      if (
        response.data &&
        response.data.success == true &&
        response.data.data
      ) {
        departmentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        departmentsData = response.data;
      } else if (response.data && response.data.data) {
        departmentsData = response.data.data;
      }

      const validDepartments = departmentsData.filter(
        (dept) => dept && (dept.Dpt_id || dept.id)
      );
      setDepartments(validDepartments);

      // Build tree and flatten for display
      const tree = buildDepartmentTree(validDepartments);
      const flattened = flattenTree(tree);
      setFlattenedDepartments(flattened);
      setFilteredDepartments(flattened);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load department data");
      setDepartments([]);
      setFlattenedDepartments([]);
      setFilteredDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchEmpTypes = async () => {
    setLoadingEmpTypes(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/emp-type/all`,
          {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      let typesData = [];
      if (response.data && response.data.success && response.data.data) {
        typesData = response.data.data;
      } else if (response.data && response.data.data) {
        typesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        typesData = response.data;
      }

      setEmpTypes(typesData);
      setFilteredEmpTypes(typesData);
    } catch (error) {
      console.error("Error fetching employee types:", error);
      toast.error("Failed to load employee type data");
      setEmpTypes([]);
      setFilteredEmpTypes([]);
    } finally {
      setLoadingEmpTypes(false);
    }
  };

  const fetchEmpStatuses = async () => {
    setLoadingEmpStatuses(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/emp-statuse/all`,
            {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      let statusesData = [];
      if (response.data && response.data.success && response.data.data) {
        statusesData = response.data.data;
      } else if (response.data && response.data.data) {
        statusesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        statusesData = response.data;
      }

      setEmpStatuses(statusesData);
      setFilteredEmpStatuses(statusesData);
    } catch (error) {
      console.error("Error fetching employee statuses:", error);
      toast.error("Failed to load employee status data");
      setEmpStatuses([]);
      setFilteredEmpStatuses([]);
    } finally {
      setLoadingEmpStatuses(false);
    }
  };

  const fetchPayBills = async () => {
    setLoadingPayBills(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/payroll-bill/all`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

      let payBillsData = [];
      if (response.data && response.data.success && response.data.data) {
        payBillsData = response.data.data;
      } else if (response.data && response.data.data) {
        payBillsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        payBillsData = response.data;
      }

      setPayBills(payBillsData);
      setFilteredPayBills(payBillsData);
    } catch (error) {
      console.error("Error fetching pay bills:", error);
      toast.error("Failed to load pay bill data");
      setPayBills([]);
      setFilteredPayBills([]);
    } finally {
      setLoadingPayBills(false);
    }
  };

  const fetchCityGrades = async () => {
    setLoadingCityGrades(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/city-grade/all`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

      let cityGradesData = [];
      if (response.data && response.data.success && response.data.data) {
        cityGradesData = response.data.data;
      } else if (response.data && response.data.data) {
        cityGradesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        cityGradesData = response.data;
      }

      setCityGrades(cityGradesData);
      setFilteredCityGrades(cityGradesData);
    } catch (error) {
      console.error("Error fetching city grades:", error);
      toast.error("Failed to load city grade data");
      setCityGrades([]);
      setFilteredCityGrades([]);
    } finally {
      setLoadingCityGrades(false);
    }
  };

  const fetchQuotas = async () => {
    setLoadingQuotas(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/emp-quota/all`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

      let quotasData = [];
      if (response.data && response.data.status && response.data.data) {
        quotasData = response.data.data;
      } else if (response.data && response.data.data) {
        quotasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        quotasData = response.data;
      }

      setQuotas(quotasData);
      setFilteredQuotas(quotasData);
    } catch (error) {
      console.error("Error fetching quotas:", error);
      toast.error("Failed to load quota data");
      setQuotas([]);
      setFilteredQuotas([]);
    } finally {
      setLoadingQuotas(false);
    }
  };

  // =============  INPUT CHANGE HANDLER ==============
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // =============  NUMBER INPUT HANDLER ==============
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    const regex = /^\d*\.?\d*$/;

    if (value == "" || regex.test(value)) {
      if (
        name == "NPS_PERCENT" ||
        name == "HBAINT" ||
        name == "MCAINT" ||
        name == "FixHRAAmount" ||
        name == "FixGPF"
      ) {
        const parts = value.split(".");
        if (parts.length == 2 && parts[1].length > 2) {
          const limitedValue = parseFloat(value).toFixed(2);
          setFormData((prev) => ({ ...prev, [name]: limitedValue }));
        } else {
          setFormData((prev) => ({ ...prev, [name]: value }));
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // =============  NUMBER VALIDATION ON BLUR ==============
  const handleNumberBlur = (e, field) => {
    const value = e.target.value;
    if (value == "" || value == ".") {
      setFormData((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (field.includes("INT") || field == "NPS_PERCENT") {
        if (numValue > 100) {
          setFormData((prev) => ({ ...prev, [field]: "100" }));
        } else if (numValue < 0) {
          setFormData((prev) => ({ ...prev, [field]: "0" }));
        } else {
          const formattedValue =
            numValue % 1 == 0 ? numValue.toString() : numValue.toFixed(2);
          setFormData((prev) => ({ ...prev, [field]: formattedValue }));
        }
      } else if (field == "FixHRAAmount" || field == "FixGPF") {
        if (numValue < 0) {
          setFormData((prev) => ({ ...prev, [field]: "0" }));
        } else {
          const formattedValue =
            numValue % 1 == 0 ? numValue.toString() : numValue.toFixed(2);
          setFormData((prev) => ({ ...prev, [field]: formattedValue }));
        }
      }
    }
  };

  // =============  SELECT HANDLERS ==============
  const handleEmployeeSelect = (empId) => {
    if (empId) {
      setFormData((prev) => ({ ...prev, Emp_Id: empId }));
    }
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearchTerm("");
    setEmployeeHighlightedIndex(-1);
    if (errors.Emp_Id) setErrors((prev) => ({ ...prev, Emp_Id: "" }));
    setTimeout(() => joinDateRef.current?.focus(), 100);
  };

  const handleGradeSelect = (gradeId) => {
    if (gradeId) {
      setFormData((prev) => ({ ...prev, EGM_Id: gradeId }));
    }
    setIsGradeDropdownOpen(false);
    setGradeSearchTerm("");
    setGradeHighlightedIndex(-1);
    if (errors.EGM_Id) setErrors((prev) => ({ ...prev, EGM_Id: "" }));
    setTimeout(() => deptButtonRef.current?.focus(), 100);
  };

  const handleEmpStatusSelect = (status) => {
    if (status && (status.Est_Id || status.id)) {
      setFormData((prev) => ({
        ...prev,
        Est_Id: (status.Est_Id || status.id).toString(),
      }));
    }
    setIsEmpStatusDropdownOpen(false);
    setEmpStatusSearchTerm("");
    setEmpStatusHighlightedIndex(-1);
    if (errors.Est_Id) setErrors((prev) => ({ ...prev, Est_Id: "" }));
    setTimeout(() => empTypeButtonRef.current?.focus(), 100);
  };

  const handleEmpTypeSelect = (type) => {
    if (type && (type.ETy_Id || type.id)) {
      setFormData((prev) => ({
        ...prev,
        ETy_Id: (type.ETy_Id || type.id).toString(),
      }));
    }
    setIsEmpTypeDropdownOpen(false);
    setEmpTypeSearchTerm("");
    setEmpTypeHighlightedIndex(-1);
    if (errors.ETy_Id) setErrors((prev) => ({ ...prev, ETy_Id: "" }));
    setTimeout(() => deptButtonRef.current?.focus(), 100);
  };

  // =============  DEPARTMENT TOGGLE HANDLER (NEW - FOR MULTI-SELECT) ==============
  const handleDepartmentToggle = (deptId) => {
    const currentDepts = [...formData.Dpt_id];
    const deptIdStr = deptId.toString();
    let updatedDepts;

    if (currentDepts.includes(deptIdStr)) {
      updatedDepts = currentDepts.filter((id) => id != deptIdStr);
    } else {
      updatedDepts = [...currentDepts, deptIdStr];
    }

    setFormData((prev) => ({ ...prev, Dpt_id: updatedDepts }));
    setFormData((prev) => ({ ...prev, Dsg_Id: "" }));
    if (errors.Dpt_id) setErrors((prev) => ({ ...prev, Dpt_id: "" }));
  };

  const handleDesignationSelect = (desg) => {
    if (desg && (desg.Dsg_id || desg.id)) {
      setFormData((prev) => ({
        ...prev,
        Dsg_Id: (desg.Dsg_id || desg.id).toString(),
      }));
    }
    setIsDesgDropdownOpen(false);
    setDesgSearchTerm("");
    setDesgHighlightedIndex(-1);
    if (errors.Dsg_Id) setErrors((prev) => ({ ...prev, Dsg_Id: "" }));
    setTimeout(() => payBillButtonRef.current?.focus(), 100);
  };

  const handlePayBillSelect = (pb) => {
    if (pb && pb.PRB_id) {
      setFormData((prev) => ({ ...prev, PBillNo: pb.PRB_id.toString() }));
    }
    setIsPayBillDropdownOpen(false);
    setPayBillSearchTerm("");
    setPayBillHighlightedIndex(-1);
    if (errors.PBillNo) setErrors((prev) => ({ ...prev, PBillNo: "" }));
    setTimeout(() => cityGradeButtonRef.current?.focus(), 100);
  };

  const handleCityGradeSelect = (cgId) => {
    if (cgId) {
      setFormData((prev) => ({ ...prev, CityCode: cgId.toString() }));
    }
    setIsCityGradeDropdownOpen(false);
    setCityGradeSearchTerm("");
    setCityGradeHighlightedIndex(-1);
    if (errors.CityCode) setErrors((prev) => ({ ...prev, CityCode: "" }));
    setTimeout(() => gradeButtonRef.current?.focus(), 100);
  };

  const handlePayMatrixSelect = (pm) => {
    if (!pm || !pm.Basic_Pay) return;
    setFormData((prev) => ({ ...prev, Basic: pm.Basic_Pay.toString() }));
    setIsPayMatrixDropdownOpen(false);
    setPayMatrixSearchTerm("");
    setPayMatrixHighlightedIndex(-1);
    if (errors.Basic) setErrors((prev) => ({ ...prev, Basic: "" }));
    setTimeout(() => weekOffPatternButtonRef.current?.focus(), 100);
  };

  const handleWeekOffPatternSelect = (pattern) => {
    if (pattern && pattern.pattern_id) {
      setFormData((prev) => ({
        ...prev,
        WeekOffPattern: pattern.pattern_id.toString(),
      }));
    }
    setIsWeekOffPatternDropdownOpen(false);
    setWeekOffPatternSearchTerm("");
    setWeekOffPatternHighlightedIndex(-1);
    if (errors.WeekOffPattern)
      setErrors((prev) => ({ ...prev, WeekOffPattern: "" }));
    setTimeout(() => profileDateRef.current?.focus(), 100);
  };

  const handleQuotaToggle = (quotaId) => {
    const currentQuotas = [...formData.PHYHDCAP];
    const quotaIdStr = quotaId.toString();
    let updatedQuotas;
    if (currentQuotas.includes(quotaIdStr)) {
      updatedQuotas = currentQuotas.filter((id) => id != quotaIdStr);
    } else {
      updatedQuotas = [...currentQuotas, quotaIdStr];
    }
    setFormData((prev) => ({ ...prev, PHYHDCAP: updatedQuotas }));
    if (errors.PHYHDCAP) setErrors((prev) => ({ ...prev, PHYHDCAP: "" }));
  };

  // =============  EGI CODE HANDLERS ==============
  const handleGISEGISelect = (egi) => {
    if (egi && egi.EGI_Id) {
      setFormData((prev) => ({ ...prev, GIS_Em_gr: egi.EGI_Id.toString() }));
    }
    setIsGISEGIDropdownOpen(false);
    setGisEGISearchTerm("");
    setGisEGIHighlightedIndex(-1);
    if (errors.GIS_Em_gr) setErrors((prev) => ({ ...prev, GIS_Em_gr: "" }));
    setTimeout(() => {
      const gpfSelect = document.querySelector('select[name="GPF"]');
      if (gpfSelect) gpfSelect.focus();
    }, 100);
  };

  // =============  KEYBOARD NAVIGATION ==============
  useEffect(() => {
    const timer = setTimeout(() => {
      if (employeeButtonRef.current) {
        employeeButtonRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  // Employee dropdown handlers
  const handleEmployeeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredEmployees.length > 0) {
        setEmployeeHighlightedIndex(0);
        setTimeout(() => {
          if (employeeItemRefs.current[0]) employeeItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmployeeDropdownOpen(false);
      setEmployeeHighlightedIndex(-1);
      setEmployeeSearchTerm("");
      employeeButtonRef.current?.focus();
    }
  };

  const handleEmployeeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isEmployeeDropdownOpen) {
        setIsEmployeeDropdownOpen(true);
        setEmployeeSearchTerm("");
        setEmployeeHighlightedIndex(-1);
        setTimeout(() => employeeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isEmployeeDropdownOpen) {
        setIsEmployeeDropdownOpen(false);
        setEmployeeHighlightedIndex(-1);
        setEmployeeSearchTerm("");
      }
    }
  };

  const handleEmployeeItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredEmployees.length) {
        setEmployeeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (employeeItemRefs.current[nextIndex])
            employeeItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setEmployeeHighlightedIndex(-1);
        setTimeout(() => employeeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setEmployeeHighlightedIndex(-1);
        setTimeout(() => employeeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setEmployeeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (employeeItemRefs.current[prevIndex])
            employeeItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      handleDepartmentToggle(item.Dpt_id); // NEW - multi-select toggle
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmployeeDropdownOpen(false);
      setEmployeeHighlightedIndex(-1);
      setEmployeeSearchTerm("");
      employeeButtonRef.current?.focus();
    }
  };

  // Grade dropdown handlers
  const handleGradeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredGrades.length > 0) {
        setGradeHighlightedIndex(0);
        setTimeout(() => {
          if (gradeItemRefs.current[0]) gradeItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGradeDropdownOpen(false);
      setGradeHighlightedIndex(-1);
      setGradeSearchTerm("");
      gradeButtonRef.current?.focus();
    }
  };

  const handleGradeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isGradeDropdownOpen) {
        setIsGradeDropdownOpen(true);
        setGradeSearchTerm("");
        setGradeHighlightedIndex(-1);
        setTimeout(() => gradeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isGradeDropdownOpen) {
        setIsGradeDropdownOpen(false);
        setGradeHighlightedIndex(-1);
        setGradeSearchTerm("");
      }
    }
  };

  const handleGradeItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredGrades.length) {
        setGradeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (gradeItemRefs.current[nextIndex])
            gradeItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setGradeHighlightedIndex(-1);
        setTimeout(() => gradeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setGradeHighlightedIndex(-1);
        setTimeout(() => gradeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setGradeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (gradeItemRefs.current[prevIndex])
            gradeItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleGradeSelect(filteredGrades[idx].EGM_Id?.toString());
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGradeDropdownOpen(false);
      setGradeHighlightedIndex(-1);
      setGradeSearchTerm("");
      gradeButtonRef.current?.focus();
    }
  };

  // Employee Status dropdown handlers
  const handleEmpStatusSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredEmpStatuses.length > 0) {
        setEmpStatusHighlightedIndex(0);
        setTimeout(() => {
          if (empStatusItemRefs.current[0])
            empStatusItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmpStatusDropdownOpen(false);
      setEmpStatusHighlightedIndex(-1);
      setEmpStatusSearchTerm("");
      empStatusButtonRef.current?.focus();
    }
  };

  const handleEmpStatusKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isEmpStatusDropdownOpen) {
        setIsEmpStatusDropdownOpen(true);
        setEmpStatusSearchTerm("");
        setEmpStatusHighlightedIndex(-1);
        setTimeout(() => empStatusSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isEmpStatusDropdownOpen) {
        setIsEmpStatusDropdownOpen(false);
        setEmpStatusHighlightedIndex(-1);
        setEmpStatusSearchTerm("");
      }
    }
  };

  const handleEmpStatusItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredEmpStatuses.length) {
        setEmpStatusHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (empStatusItemRefs.current[nextIndex])
            empStatusItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setEmpStatusHighlightedIndex(-1);
        setTimeout(() => empStatusSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setEmpStatusHighlightedIndex(-1);
        setTimeout(() => empStatusSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setEmpStatusHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (empStatusItemRefs.current[prevIndex])
            empStatusItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleEmpStatusSelect(filteredEmpStatuses[idx]);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmpStatusDropdownOpen(false);
      setEmpStatusHighlightedIndex(-1);
      setEmpStatusSearchTerm("");
      empStatusButtonRef.current?.focus();
    }
  };

  // Employee Type dropdown handlers
  const handleEmpTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredEmpTypes.length > 0) {
        setEmpTypeHighlightedIndex(0);
        setTimeout(() => {
          if (empTypeItemRefs.current[0]) empTypeItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmpTypeDropdownOpen(false);
      setEmpTypeHighlightedIndex(-1);
      setEmpTypeSearchTerm("");
      empTypeButtonRef.current?.focus();
    }
  };

  const handleEmpTypeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isEmpTypeDropdownOpen) {
        setIsEmpTypeDropdownOpen(true);
        setEmpTypeSearchTerm("");
        setEmpTypeHighlightedIndex(-1);
        setTimeout(() => empTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isEmpTypeDropdownOpen) {
        setIsEmpTypeDropdownOpen(false);
        setEmpTypeHighlightedIndex(-1);
        setEmpTypeSearchTerm("");
      }
    }
  };

  const handleEmpTypeItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredEmpTypes.length) {
        setEmpTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (empTypeItemRefs.current[nextIndex])
            empTypeItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setEmpTypeHighlightedIndex(-1);
        setTimeout(() => empTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setEmpTypeHighlightedIndex(-1);
        setTimeout(() => empTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setEmpTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (empTypeItemRefs.current[prevIndex])
            empTypeItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleEmpTypeSelect(filteredEmpTypes[idx]);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmpTypeDropdownOpen(false);
      setEmpTypeHighlightedIndex(-1);
      setEmpTypeSearchTerm("");
      empTypeButtonRef.current?.focus();
    }
  };

  // =============  DEPARTMENT MULTI-SELECT KEYBOARD HANDLERS (CHANGED) ==============
  const handleDeptSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredDepartments.length > 0) {
        setDeptHighlightedIndex(0);
        setTimeout(() => {
          if (deptItemRefs.current[0]) deptItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  const handleDepartmentKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isDeptDropdownOpen) {
        setIsDeptDropdownOpen(true);
        setDeptSearchTerm("");
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isDeptDropdownOpen) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
    }
  };

  const handleDeptItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredDepartments.length) {
        setDeptHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (deptItemRefs.current[nextIndex])
            deptItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setDeptHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (deptItemRefs.current[prevIndex])
            deptItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      handleDepartmentToggle(item.Dpt_id); // ← Changed from handleDepartmentSelect
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  // Designation dropdown handlers
  const handleDesgSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredDesignations.length > 0) {
        setDesgHighlightedIndex(0);
        setTimeout(() => {
          if (desgItemRefs.current[0]) desgItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDesgDropdownOpen(false);
      setDesgHighlightedIndex(-1);
      setDesgSearchTerm("");
      desgButtonRef.current?.focus();
    }
  };

  const handleDesignationKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isDesgDropdownOpen) {
        setIsDesgDropdownOpen(true);
        setDesgSearchTerm("");
        setDesgHighlightedIndex(-1);
        setTimeout(() => desgSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isDesgDropdownOpen) {
        setIsDesgDropdownOpen(false);
        setDesgHighlightedIndex(-1);
        setDesgSearchTerm("");
      }
    }
  };

  const handleDesgItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredDesignations.length) {
        setDesgHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (desgItemRefs.current[nextIndex])
            desgItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setDesgHighlightedIndex(-1);
        setTimeout(() => desgSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setDesgHighlightedIndex(-1);
        setTimeout(() => desgSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setDesgHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (desgItemRefs.current[prevIndex])
            desgItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleDesignationSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDesgDropdownOpen(false);
      setDesgHighlightedIndex(-1);
      setDesgSearchTerm("");
      desgButtonRef.current?.focus();
    }
  };

  // Pay Bill dropdown handlers
  const handlePayBillSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredPayBills.length > 0) {
        setPayBillHighlightedIndex(0);
        setTimeout(() => {
          if (payBillItemRefs.current[0]) payBillItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPayBillDropdownOpen(false);
      setPayBillHighlightedIndex(-1);
      setPayBillSearchTerm("");
      payBillButtonRef.current?.focus();
    }
  };

  const handlePayBillKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isPayBillDropdownOpen) {
        setIsPayBillDropdownOpen(true);
        setPayBillSearchTerm("");
        setPayBillHighlightedIndex(-1);
        setTimeout(() => payBillSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isPayBillDropdownOpen) {
        setIsPayBillDropdownOpen(false);
        setPayBillHighlightedIndex(-1);
        setPayBillSearchTerm("");
      }
    }
  };

  const handlePayBillItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredPayBills.length) {
        setPayBillHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (payBillItemRefs.current[nextIndex])
            payBillItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setPayBillHighlightedIndex(-1);
        setTimeout(() => payBillSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setPayBillHighlightedIndex(-1);
        setTimeout(() => payBillSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setPayBillHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (payBillItemRefs.current[prevIndex])
            payBillItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handlePayBillSelect(filteredPayBills[idx]);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPayBillDropdownOpen(false);
      setPayBillHighlightedIndex(-1);
      setPayBillSearchTerm("");
      payBillButtonRef.current?.focus();
    }
  };

  // City Grade dropdown handlers
  const handleCityGradeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredCityGrades.length > 0) {
        setCityGradeHighlightedIndex(0);
        setTimeout(() => {
          if (cityGradeItemRefs.current[0])
            cityGradeItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsCityGradeDropdownOpen(false);
      setCityGradeHighlightedIndex(-1);
      setCityGradeSearchTerm("");
      cityGradeButtonRef.current?.focus();
    }
  };

  const handleCityGradeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isCityGradeDropdownOpen) {
        setIsCityGradeDropdownOpen(true);
        setCityGradeSearchTerm("");
        setCityGradeHighlightedIndex(-1);
        setTimeout(() => cityGradeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isCityGradeDropdownOpen) {
        setIsCityGradeDropdownOpen(false);
        setCityGradeHighlightedIndex(-1);
        setCityGradeSearchTerm("");
      }
    }
  };

  const handleCityGradeItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredCityGrades.length) {
        setCityGradeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (cityGradeItemRefs.current[nextIndex])
            cityGradeItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setCityGradeHighlightedIndex(-1);
        setTimeout(() => cityGradeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setCityGradeHighlightedIndex(-1);
        setTimeout(() => cityGradeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setCityGradeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (cityGradeItemRefs.current[prevIndex])
            cityGradeItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleCityGradeSelect(filteredCityGrades[idx].CGR_Id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsCityGradeDropdownOpen(false);
      setCityGradeHighlightedIndex(-1);
      setCityGradeSearchTerm("");
      cityGradeButtonRef.current?.focus();
    }
  };

  // Pay Matrix dropdown handlers
  const handlePayMatrixSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredPayMatrices.length > 0) {
        setPayMatrixHighlightedIndex(0);
        setTimeout(() => {
          if (payMatrixItemRefs.current[0])
            payMatrixItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPayMatrixDropdownOpen(false);
      setPayMatrixHighlightedIndex(-1);
      setPayMatrixSearchTerm("");
      payMatrixButtonRef.current?.focus();
    }
  };

  const handlePayMatrixKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isPayMatrixDropdownOpen) {
        setIsPayMatrixDropdownOpen(true);
        setPayMatrixSearchTerm("");
        setPayMatrixHighlightedIndex(-1);
        setTimeout(() => payMatrixSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isPayMatrixDropdownOpen) {
        setIsPayMatrixDropdownOpen(false);
        setPayMatrixHighlightedIndex(-1);
        setPayMatrixSearchTerm("");
      }
    }
  };

  const handlePayMatrixItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredPayMatrices.length) {
        setPayMatrixHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (payMatrixItemRefs.current[nextIndex])
            payMatrixItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setPayMatrixHighlightedIndex(-1);
        setTimeout(() => payMatrixSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setPayMatrixHighlightedIndex(-1);
        setTimeout(() => payMatrixSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setPayMatrixHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (payMatrixItemRefs.current[prevIndex])
            payMatrixItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handlePayMatrixSelect(filteredPayMatrices[idx]);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPayMatrixDropdownOpen(false);
      setPayMatrixHighlightedIndex(-1);
      setPayMatrixSearchTerm("");
      payMatrixButtonRef.current?.focus();
    }
  };

  // Week Off Pattern dropdown handlers
  const handleWeekOffPatternSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredWeekOffPatterns.length > 0) {
        setWeekOffPatternHighlightedIndex(0);
        setTimeout(() => {
          if (weekOffPatternItemRefs.current[0])
            weekOffPatternItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsWeekOffPatternDropdownOpen(false);
      setWeekOffPatternHighlightedIndex(-1);
      setWeekOffPatternSearchTerm("");
      weekOffPatternButtonRef.current?.focus();
    }
  };

  const handleWeekOffPatternKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isWeekOffPatternDropdownOpen) {
        setIsWeekOffPatternDropdownOpen(true);
        setWeekOffPatternSearchTerm("");
        setWeekOffPatternHighlightedIndex(-1);
        setTimeout(() => weekOffPatternSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isWeekOffPatternDropdownOpen) {
        setIsWeekOffPatternDropdownOpen(false);
        setWeekOffPatternHighlightedIndex(-1);
        setWeekOffPatternSearchTerm("");
      }
    }
  };

  const handleWeekOffPatternItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredWeekOffPatterns.length) {
        setWeekOffPatternHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (weekOffPatternItemRefs.current[nextIndex])
            weekOffPatternItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setWeekOffPatternHighlightedIndex(-1);
        setTimeout(() => weekOffPatternSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setWeekOffPatternHighlightedIndex(-1);
        setTimeout(() => weekOffPatternSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setWeekOffPatternHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (weekOffPatternItemRefs.current[prevIndex])
            weekOffPatternItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleWeekOffPatternSelect(filteredWeekOffPatterns[idx]);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsWeekOffPatternDropdownOpen(false);
      setWeekOffPatternHighlightedIndex(-1);
      setWeekOffPatternSearchTerm("");
      weekOffPatternButtonRef.current?.focus();
    }
  };

  // Quota dropdown handlers
  const handleQuotaSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredQuotas.length > 0) {
        setQuotaHighlightedIndex(0);
        setTimeout(() => {
          if (quotaItemRefs.current[0]) quotaItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsQuotaDropdownOpen(false);
      setQuotaHighlightedIndex(-1);
      setQuotaSearchTerm("");
      quotaButtonRef.current?.focus();
    }
  };

  const handleQuotaKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isQuotaDropdownOpen) {
        setIsQuotaDropdownOpen(true);
        setQuotaSearchTerm("");
        setQuotaHighlightedIndex(-1);
        setTimeout(() => quotaSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isQuotaDropdownOpen) {
        setIsQuotaDropdownOpen(false);
        setQuotaHighlightedIndex(-1);
        setQuotaSearchTerm("");
      }
    }
  };

  const handleQuotaItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredQuotas.length) {
        setQuotaHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (quotaItemRefs.current[nextIndex])
            quotaItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setQuotaHighlightedIndex(-1);
        setTimeout(() => quotaSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setQuotaHighlightedIndex(-1);
        setTimeout(() => quotaSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setQuotaHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (quotaItemRefs.current[prevIndex])
            quotaItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      handleQuotaToggle(filteredQuotas[idx].Qut_Id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsQuotaDropdownOpen(false);
      setQuotaHighlightedIndex(-1);
      setQuotaSearchTerm("");
      quotaButtonRef.current?.focus();
    }
  };

  // GIS EGI Code dropdown handlers
  const handleGISEGISearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredGISEGI.length > 0) {
        setGisEGIHighlightedIndex(0);
        setTimeout(() => {
          if (gisEGIItemRefs.current[0]) gisEGIItemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGISEGIDropdownOpen(false);
      setGisEGIHighlightedIndex(-1);
      setGisEGISearchTerm("");
      gisEGIButtonRef.current?.focus();
    }
  };

  const handleGISEGIKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isGISEGIDropdownOpen) {
        setIsGISEGIDropdownOpen(true);
        setGisEGISearchTerm("");
        setGisEGIHighlightedIndex(-1);
        setTimeout(() => gisEGISearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isGISEGIDropdownOpen) {
        setIsGISEGIDropdownOpen(false);
        setGisEGIHighlightedIndex(-1);
        setGisEGISearchTerm("");
      }
    }
  };

  const handleGISEGIItemKeyDown = (e, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredGISEGI.length) {
        setGisEGIHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (gisEGIItemRefs.current[nextIndex])
            gisEGIItemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setGisEGIHighlightedIndex(-1);
        setTimeout(() => gisEGISearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setGisEGIHighlightedIndex(-1);
        setTimeout(() => gisEGISearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setGisEGIHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (gisEGIItemRefs.current[prevIndex])
            gisEGIItemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleGISEGISelect(filteredGISEGI[idx]);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGISEGIDropdownOpen(false);
      setGisEGIHighlightedIndex(-1);
      setGisEGISearchTerm("");
      gisEGIButtonRef.current?.focus();
    }
  };

  // =============  FILTER FUNCTIONS ==============
  useEffect(() => {
    if (!employeeSearchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const term = employeeSearchTerm.toLowerCase();
      setFilteredEmployees(
        employees.filter(
          (emp) =>
            (emp.Emp_Code?.toLowerCase() || "").includes(term) ||
            (emp.First_Name?.toLowerCase() || "").includes(term) ||
            (emp.Last_Name?.toLowerCase() || "").includes(term)
        )
      );
    }
    setEmployeeHighlightedIndex(-1);
  }, [employeeSearchTerm, employees]);

  useEffect(() => {
    if (!gradeSearchTerm.trim()) {
      setFilteredGrades(grades);
    } else {
      const term = gradeSearchTerm.toLowerCase();
      setFilteredGrades(
        grades.filter(
          (grade) =>
            (grade.EGM_Code?.toLowerCase() || "").includes(term) ||
            (grade.EGM_Name?.toLowerCase() || "").includes(term)
        )
      );
    }
    setGradeHighlightedIndex(-1);
  }, [gradeSearchTerm, grades]);

  useEffect(() => {
    if (!empStatusSearchTerm.trim()) {
      setFilteredEmpStatuses(empStatuses);
    } else {
      const term = empStatusSearchTerm.toLowerCase();
      setFilteredEmpStatuses(
        empStatuses.filter(
          (status) =>
            (status.Est_Name?.toLowerCase() || "").includes(term) ||
            (status.Est_Code?.toLowerCase() || "").includes(term)
        )
      );
    }
    setEmpStatusHighlightedIndex(-1);
  }, [empStatusSearchTerm, empStatuses]);

  useEffect(() => {
    if (!empTypeSearchTerm.trim()) {
      setFilteredEmpTypes(empTypes);
    } else {
      const term = empTypeSearchTerm.toLowerCase();
      setFilteredEmpTypes(
        empTypes.filter(
          (type) =>
            (type.ETy_Name?.toLowerCase() || "").includes(term) ||
            (type.ETy_Code?.toLowerCase() || "").includes(term)
        )
      );
    }
    setEmpTypeHighlightedIndex(-1);
  }, [empTypeSearchTerm, empTypes]);

  useEffect(() => {
    if (!departments.length) return;
    const tree = buildDepartmentTree(departments);
    const flattened = flattenTree(tree);
    setFlattenedDepartments(flattened);
    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(flattened);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = flattened.filter(
        (dept) =>
          (dept.Dpt_Name?.toLowerCase() || "").includes(term) ||
          (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (dept.GrCod?.toLowerCase() || "").includes(term)
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, departments]);

  useEffect(() => {
    if (!designations.length) return;
    const tree = buildDesignationTree(designations);
    const flattened = flattenTree(tree);
    setFlattenedDesignations(flattened);
    if (!desgSearchTerm.trim()) {
      setFilteredDesignations(flattened);
    } else {
      const term = desgSearchTerm.toLowerCase();
      const filtered = flattened.filter(
        (desg) =>
          (desg.Dsg_Title?.toLowerCase() || "").includes(term) ||
          (desg.Dsg_Desc?.toLowerCase() || "").includes(term) ||
          (desg.Dsg_EName?.toLowerCase() || "").includes(term) ||
          (desg.GrCod?.toLowerCase() || "").includes(term)
      );
      setFilteredDesignations(filtered);
    }
    setDesgHighlightedIndex(-1);
  }, [desgSearchTerm, designations]);

  useEffect(() => {
    if (!payBillSearchTerm.trim()) {
      setFilteredPayBills(payBills);
    } else {
      const term = payBillSearchTerm.toLowerCase();
      setFilteredPayBills(
        payBills.filter(
          (pb) =>
            (pb.PayBill_Code?.toLowerCase() || "").includes(term) ||
            (pb.Description?.toLowerCase() || "").includes(term)
        )
      );
    }
    setPayBillHighlightedIndex(-1);
  }, [payBillSearchTerm, payBills]);

  useEffect(() => {
    if (!cityGradeSearchTerm.trim()) {
      setFilteredCityGrades(cityGrades);
    } else {
      const term = cityGradeSearchTerm.toLowerCase();
      setFilteredCityGrades(
        cityGrades.filter(
          (cg) =>
            (cg.City_Name?.toLowerCase() || "").includes(term) ||
            (cg.Grade?.toLowerCase() || "").includes(term)
        )
      );
    }
    setCityGradeHighlightedIndex(-1);
  }, [cityGradeSearchTerm, cityGrades]);

  useEffect(() => {
    if (!payMatrixSearchTerm.trim()) {
      setFilteredPayMatrices(payMatrices);
    } else {
      const term = payMatrixSearchTerm.toLowerCase();
      setFilteredPayMatrices(
        payMatrices.filter(
          (pm) =>
            (pm.Cell_Index?.toString() || "").toLowerCase().includes(term) ||
            (pm.Basic_Pay?.toString() || "").includes(term) ||
            (pm.emp_grade?.EGM_Code?.toLowerCase() || "").includes(term) ||
            (pm.emp_grade?.EGM_Name?.toLowerCase() || "").includes(term)
        )
      );
    }
    setPayMatrixHighlightedIndex(-1);
  }, [payMatrixSearchTerm, payMatrices]);

  useEffect(() => {
    if (!weekOffPatternSearchTerm.trim()) {
      setFilteredWeekOffPatterns(weekOffPatterns);
    } else {
      const term = weekOffPatternSearchTerm.toLowerCase();
      setFilteredWeekOffPatterns(
        weekOffPatterns.filter(
          (pattern) =>
            (pattern.pattern_code?.toLowerCase() || "").includes(term) ||
            (pattern.pattern_name?.toLowerCase() || "").includes(term)
        )
      );
    }
    setWeekOffPatternHighlightedIndex(-1);
  }, [weekOffPatternSearchTerm, weekOffPatterns]);

  useEffect(() => {
    if (!quotaSearchTerm.trim()) {
      setFilteredQuotas(quotas);
    } else {
      const term = quotaSearchTerm.toLowerCase();
      setFilteredQuotas(
        quotas.filter(
          (q) =>
            (q.Qut_Code?.toLowerCase() || "").includes(term) ||
            (q.Qut_Name?.toLowerCase() || "").includes(term)
        )
      );
    }
    setQuotaHighlightedIndex(-1);
  }, [quotaSearchTerm, quotas]);

  useEffect(() => {
    if (!gisEGISearchTerm.trim()) {
      setFilteredGISEGI(empGroupInsurances);
    } else {
      const term = gisEGISearchTerm.toLowerCase();
      setFilteredGISEGI(
        empGroupInsurances.filter(
          (egi) =>
            (egi.Group_Type?.toLowerCase() || "").includes(term) ||
            (egi.Insurance_Amt?.toString() || "").includes(term) ||
            (egi.Save_Amt?.toString() || "").includes(term) ||
            (egi.pay_commission?.PC_Name?.toLowerCase() || "").includes(term)
        )
      );
    }
    setGisEGIHighlightedIndex(-1);
  }, [gisEGISearchTerm, empGroupInsurances]);

  // =============  DISPLAY FUNCTIONS ==============
  const getEmployeeDisplay = (emp) => {
    if (!emp) return "";
    if (emp.Emp_Code && (emp.First_Name || emp.Last_Name)) {
      const firstName = emp.First_Name || "";
      const lastName = emp.Last_Name ? ` ${emp.Last_Name}` : "";
      return `${emp.Emp_Code} - ${firstName}${lastName}`.trim();
    }
    if (emp.Emp_Code) return emp.Emp_Code;
    if (emp.First_Name) {
      const lastName = emp.Last_Name ? ` ${emp.Last_Name}` : "";
      return `${emp.First_Name}${lastName}`.trim();
    }
    return `Employee #${emp.Emp_Id || ""}`;
  };

  const getSelectedEmployeeDisplay = () => {
    if (!formData.Emp_Id) return "";
    const selected = employees.find(
      (emp) => emp.Emp_Id?.toString() == formData.Emp_Id
    );
    if (!selected) return "Selected employee not found";
    return getEmployeeDisplay(selected);
  };

  const getGradeDisplay = (grade) => {
    if (!grade) return "";
    const code = grade.EGM_Code || "";
    const name = grade.EGM_Name || "";
    if (code && name) return `${code} - ${name}`;
    if (code) return code;
    if (name) return name;
    return `Grade #${grade.EGM_Id || ""}`;
  };

  const getSelectedGradeDisplay = () => {
    if (!formData.EGM_Id) return "";
    const selected = grades.find(
      (grade) => grade.EGM_Id?.toString() == formData.EGM_Id
    );
    if (!selected) return "Selected grade not found";
    return getGradeDisplay(selected);
  };

  const getEmpStatusDisplay = (status) => {
    if (!status) return "";
    return (
      status.Est_Name ||
      status.Est_Code ||
      `Status ${status.Est_Id || status.id || ""}`
    );
  };

  const getSelectedEmpStatusDisplay = () => {
    if (!formData.Est_Id) return "";
    const selected = empStatuses.find(
      (status) => (status.Est_Id || status.id)?.toString() == formData.Est_Id
    );
    if (!selected) return "Selected status not found";
    return getEmpStatusDisplay(selected);
  };

  const getEmpTypeDisplay = (type) => {
    if (!type) return "";
    return (
      type.ETy_Name || type.ETy_Code || `Type ${type.ETy_Id || type.id || ""}`
    );
  };

  const getSelectedEmpTypeDisplay = () => {
    if (!formData.ETy_Id) return "";
    const selected = empTypes.find(
      (type) => (type.ETy_Id || type.id)?.toString() == formData.ETy_Id
    );
    if (!selected) return "Selected type not found";
    return getEmpTypeDisplay(selected);
  };

  const getPayBillDisplay = (pb) => {
    if (!pb) return "";
    const billCode = pb.PayBill_Code || "";
    const description = pb.Description || "";
    if (billCode && description) return `${billCode} - ${description}`;
    if (billCode) return billCode;
    return `Pay Bill #${pb.PRB_id || ""}`;
  };

  const getSelectedPayBillDisplay = () => {
    if (!formData.PBillNo) return "";
    const selected = payBills.find(
      (pb) => pb.PRB_id?.toString() == formData.PBillNo
    );
    if (!selected) return "Selected pay bill not found";
    return getPayBillDisplay(selected);
  };

  const getCityGradeDisplay = (cg) => {
    if (!cg) return "";
    const cityName = cg.City_Name || "";
    const grade = cg.Grade || "";
    if (cityName && grade) return `${cityName} - ${grade}`;
    if (cityName) return cityName;
    if (grade) return grade;
    return `City Grade #${cg.CGR_Id || ""}`;
  };

  const getSelectedCityGradeDisplay = () => {
    if (!formData.CityCode) return "";
    const selected = cityGrades.find(
      (cg) => cg.CGR_Id?.toString() == formData.CityCode
    );
    if (!selected) return "Selected city grade not found";
    return getCityGradeDisplay(selected);
  };

  const getPayMatrixDisplay = (pm) => {
    if (!pm) return "";
    const gradeName = pm.emp_grade?.EGM_Name || "";
    const gradeCode = pm.emp_grade?.EGM_Code || "";
    const cellIndex = pm.Cell_Index || "";
    const basicPay = pm.Basic_Pay
      ? `₹${parseFloat(pm.Basic_Pay).toFixed(2)}`
      : "";
    if (gradeName && gradeCode && cellIndex && basicPay) {
      return `${gradeCode} - ${gradeName} - Cell ${cellIndex} (${basicPay})`;
    }
    if (gradeName && cellIndex) return `${gradeName} - Cell ${cellIndex}`;
    if (cellIndex && basicPay) return `Cell ${cellIndex} - ${basicPay}`;
    if (basicPay) return basicPay;
    return `Pay Matrix #${pm.PMM_Id || ""}`;
  };

  const getSelectedPayMatrixDisplay = () => {
    if (!formData.Basic) return "";
    const selected = payMatrices.find(
      (pm) => pm.Basic_Pay?.toString() == formData.Basic
    );
    if (!selected) return `₹${parseFloat(formData.Basic).toFixed(2)}`;
    return getPayMatrixDisplay(selected);
  };

  const getPayBandDisplay = () => payBandDisplay || "";

  const getWeekOffPatternDisplay = (pattern) => {
    if (!pattern) return "";
    const code = pattern.pattern_code || "";
    const name = pattern.pattern_name || "";
    if (code && name) return `${code} - ${name}`;
    if (code) return code;
    if (name) return name;
    return `Pattern #${pattern.pattern_id || ""}`;
  };

  const getSelectedWeekOffPatternDisplay = () => {
    if (!formData.WeekOffPattern) return "";
    const selected = weekOffPatterns.find(
      (pattern) => pattern.pattern_id?.toString() == formData.WeekOffPattern
    );
    if (!selected) return "Selected pattern not found";
    return getWeekOffPatternDisplay(selected);
  };

  const renderDesignationItem = (desg) => {
    const level = parseInt(desg.GrStt, 10) || 1;
    const desc = desg.Dsg_Desc || "No Description";
    const englishName = desg.Dsg_EName;
    const levelColors = {
      1: "bg-blue-100 text-blue-600",
      2: "bg-green-100 text-green-600",
      3: "bg-amber-100 text-amber-600",
      4: "bg-purple-100 text-purple-600",
      5: "bg-pink-100 text-pink-600",
      6: "bg-indigo-100 text-indigo-600",
      7: "bg-orange-100 text-orange-600",
      8: "bg-teal-100 text-teal-600",
      9: "bg-cyan-100 text-cyan-600",
      10: "bg-rose-100 text-rose-600",
    };
    const colorClass = levelColors[level] || "bg-gray-100 text-gray-600";
    return (
      <div className="py-1">
        <div className="flex items-start">
          <div
            className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
          >
            <span className="text-xs font-bold">L{level}</span>
          </div>
          <div className="flex-1">
            <div
              className="text-sm font-medium text-gray-900 whitespace-pre-wrap"
              style={{ marginLeft: `${(level - 1) * 20}px` }}
            >
              {desc}
            </div>
            {englishName && (
              <div
                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                style={{ marginLeft: `${(level - 1) * 20}px` }}
              >
                {englishName}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedDesignationDisplay = () => {
    if (!formData.Dsg_Id) return "";
    const selected = designations.find(
      (d) => (d.Dsg_id || d.id)?.toString() == formData.Dsg_Id
    );
    if (!selected) return "Selected designation not found";
    const level = parseInt(selected.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dsg_Desc || "Unknown";
    const englishName = selected.Dsg_EName;
    if (englishName) return `${indent}${desc} (${englishName})`;
    return `${indent}${desc}`;
  };

  const getQuotaDisplay = (quota) => {
    if (!quota) return "";
    const code = quota.Qut_Code || "";
    const name = quota.Qut_Name || "";
    const percentage = quota.Percentage ? `${quota.Percentage}%` : "";
    if (code && name)
      return `${code} - ${name} ${percentage ? `(${percentage})` : ""}`;
    if (code) return code;
    if (name) return name;
    return `Quota #${quota.Qut_Id || ""}`;
  };

  const getSelectedQuotasDisplay = () => {
    if (!formData.PHYHDCAP || formData.PHYHDCAP.length == 0)
      return "No quotas selected";
    const selectedQuotas = quotas.filter((q) =>
      formData.PHYHDCAP.includes(q.Qut_Id?.toString())
    );
    if (selectedQuotas.length == 0) return "Selected quotas not found";
    return selectedQuotas.map((q) => getQuotaDisplay(q)).join(", ");
  };

  const getIncrementMonthDisplay = () => {
    return formData.IncMonth == "7"
      ? "July"
      : formData.IncMonth == "1"
      ? "January"
      : "";
  };

  const getGISEGIDisplay = (egi) => {
    if (!egi) return "";
    const groupType = egi.Group_Type || "";
    const insuranceAmt = egi.Insurance_Amt
      ? `₹${parseFloat(egi.Insurance_Amt).toFixed(2)}`
      : "";
    const saveAmt = egi.Save_Amt
      ? `₹${parseFloat(egi.Save_Amt).toFixed(2)}`
      : "";
    const pcName = egi.pay_commission?.PC_Name || "";
    if (groupType && insuranceAmt && saveAmt) {
      return `${groupType} - Insurance: ${insuranceAmt} / Save: ${saveAmt} ${
        pcName ? `(${pcName})` : ""
      }`;
    }
    if (groupType && insuranceAmt)
      return `${groupType} - ${insuranceAmt} ${pcName ? `(${pcName})` : ""}`;
    if (groupType) return groupType;
    return `EGI #${egi.EGI_Id || ""}`;
  };

  const getSelectedGISEGIDisplay = () => {
    if (!formData.GIS_Em_gr) return "";
    const selected = empGroupInsurances.find(
      (egi) => egi.EGI_Id?.toString() == formData.GIS_Em_gr
    );
    if (!selected) return "Selected EGI Code not found";
    return getGISEGIDisplay(selected);
  };

  // =============  VALIDATE FORM (CHANGED: Dpt_id validation) ==============
  const validateForm = () => {
    const newErrors = {};
    if (!formData.Emp_Id) newErrors.Emp_Id = "Employee is required";
    if (!formData.EGM_Id) newErrors.EGM_Id = "Grade is required";
    if (!formData.Dpt_id || formData.Dpt_id.length == 0)
      newErrors.Dpt_id = "Department is required";

    if (
      formData.EPP_Date &&
      formData.EPP_Date.length == 10 &&
      isNaN(new Date(formData.EPP_Date).getTime())
    ) {
      newErrors.EPP_Date = "Invalid date format";
    }
    if (
      formData.Join_Date &&
      formData.Join_Date.length == 10 &&
      isNaN(new Date(formData.Join_Date).getTime())
    ) {
      newErrors.Join_Date = "Invalid date format";
    }

    if (
      formData.NPS_PERCENT &&
      (parseFloat(formData.NPS_PERCENT) < 0 ||
        parseFloat(formData.NPS_PERCENT) > 100)
    ) {
      newErrors.NPS_PERCENT = "NPS percentage must be between 0 and 100";
    }

    if (formData.GPF == "fixed" && !formData.FixGPF) {
      newErrors.FixGPF = "Fix GPF Amount is required when GPF is set to Fixed";
    } else if (formData.FixGPF && parseFloat(formData.FixGPF) < 0) {
      newErrors.FixGPF = "Fix GPF Amount must be greater than 0";
    }

    if (formData.HBA == "yes" && !formData.HBAINT) {
      newErrors.HBAINT = "HBA Interest is required when HBA is selected";
    } else if (
      formData.HBAINT &&
      (parseFloat(formData.HBAINT) < 0 || parseFloat(formData.HBAINT) > 100)
    ) {
      newErrors.HBAINT = "HBA Interest must be between 0 and 100";
    }

    if (formData.MCA == "yes" && !formData.MCAINT) {
      newErrors.MCAINT = "MCA Interest is required when MCA is selected";
    } else if (
      formData.MCAINT &&
      (parseFloat(formData.MCAINT) < 0 || parseFloat(formData.MCAINT) > 100)
    ) {
      newErrors.MCAINT = "MCA Interest must be between 0 and 100";
    }

    if (
      (formData.GISF == "yes" || formData.GISV == "yes") &&
      !formData.GIS_Em_gr
    ) {
      newErrors.GIS_Em_gr =
        "EGI Code is required when GISF or GISV is selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  // =============  SUBMIT FORM (CHANGED: Dpt_id as array) ==============
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    const result = await Swal.fire({
      title: "Create Employee Profile?",
      text: "Are you sure you want to create this employee profile?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, create!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const convertToBoolean = (value) => value == "yes";

      let fixHRAAmountValue = null;
      if (
        formData.HRA == "yes" &&
        formData.FixHRAAmount &&
        formData.FixHRAAmount.trim() != ""
      ) {
        fixHRAAmountValue = parseFloat(formData.FixHRAAmount).toFixed(2);
      }

      let fixGPFAmountValue = null;
      if (
        formData.GPF == "fixed" &&
        formData.FixGPF &&
        formData.FixGPF.trim() != ""
      ) {
        fixGPFAmountValue = parseFloat(formData.FixGPF).toFixed(2);
      }

      let npsPercentValue = null;
      if (formData.NPS_PERCENT && formData.NPS_PERCENT.trim() != "") {
        const parsedValue = parseFloat(formData.NPS_PERCENT);
        if (!isNaN(parsedValue)) {
          npsPercentValue = parsedValue.toFixed(2);
        }
      }

      const payload = {
        Emp_Id: formData.Emp_Id ? formData.Emp_Id : null,
        EPP_Date: formData.EPP_Date || null,
        EGM_Id: formData.EGM_Id ? formData.EGM_Id : null,
        Dpt_id:
          formData.Dpt_id && formData.Dpt_id.length > 0
            ? formData.Dpt_id.map((id) => parseInt(id))
            : [],
        Dsg_Id: formData.Dsg_Id ? formData.Dsg_Id : null,
        ETy_Id: formData.ETy_Id ? formData.ETy_Id : null,
        Join_Date: formData.Join_Date || null,
        Est_Id: formData.Est_Id ? formData.Est_Id : null,
        Is_Active: formData.Is_Active,
        IncMonth: formData.IncMonth || null,
        Basic: formData.Basic ? formData.Basic : null,
        FixHRA: fixHRAAmountValue,
        DA: convertToBoolean(formData.DA),
        HRA: convertToBoolean(formData.HRA),
        CLA: convertToBoolean(formData.CLA),
        MA: convertToBoolean(formData.MA),
        TA: convertToBoolean(formData.TA),
        NPA: convertToBoolean(formData.NPA),
        GPF:
          formData.GPF == "yes"
            ? "1"
            : formData.GPF == "fixed"
            ? fixGPFAmountValue
            : "0",
        HBA: convertToBoolean(formData.HBA),
        HBAINT: formData.HBAINT ? parseFloat(formData.HBAINT).toFixed(2) : null,
        MCA: convertToBoolean(formData.MCA),
        MCAINT: formData.MCAINT ? parseFloat(formData.MCAINT).toFixed(2) : null,
        FOOD: convertToBoolean(formData.FOOD),
        FEST: convertToBoolean(formData.FEST),
        IR: convertToBoolean(formData.IR),
        CPF_NPS: formData.CPF_NPS || null,
        NPS_PERCENT: npsPercentValue,
        PHYHDCAP: formData.PHYHDCAP,
        BillNo: formData.BillNo || null,
        PB_Id: formData.PB_Id ? formData.PB_Id : null,
        PBillNo: formData.PBillNo ? formData.PBillNo : null,
        CityCode: formData.CityCode ? formData.CityCode : null,
        Status: formData.Status,
        GISF: convertToBoolean(formData.GISF),
        GISV: convertToBoolean(formData.GISV),
        GISF_Em_gr:
          (formData.GISF == "yes" || formData.GISV == "yes") &&
          formData.GIS_Em_gr
            ? parseInt(formData.GIS_Em_gr)
            : null,
        GISV_Em_gr:
          (formData.GISF == "yes" || formData.GISV == "yes") &&
          formData.GIS_Em_gr
            ? parseInt(formData.GIS_Em_gr)
            : null,
        WOP_id: formData.WeekOffPattern
          ? parseInt(formData.WeekOffPattern)
          : null,
      };

      console.log("Submitting payload:", payload);

      await EmployeeProfileApi.create(payload);
      toast.success("Employee profile created successfully!");

      setTimeout(() => {
        navigate("/masters/employee-records/emp-profile-update");
      }, 1500);
    } catch (error) {
      console.error("Error saving profile:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        Object.keys(apiErrors).forEach((key) => {
          setErrors((prev) => ({ ...prev, [key]: apiErrors[key][0] }));
        });
        toast.error("Please fix the validation errors");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create employee profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/employee-records/emp-profile-update");
  };

  // =============  LOADING STATE ==============
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employee profile...</p>
      </div>
    );
  }

  // =============  MAIN RENDER ==============
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-records/emp-profile-update")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Employee Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Create a new employee profile record
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Row 1: Employee and Joining Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableDropdown
                label="Employee"
                value={formData.Emp_Id}
                error={errors.Emp_Id}
                required={true}
                icon={User}
                isOpen={isEmployeeDropdownOpen}
                setIsOpen={setIsEmployeeDropdownOpen}
                searchTerm={employeeSearchTerm}
                setSearchTerm={setEmployeeSearchTerm}
                items={employees}
                filteredItems={filteredEmployees}
                highlightedIndex={employeeHighlightedIndex}
                onSelect={(emp) => {
                  const empId = emp.Emp_Id?.toString();
                  if (empId) handleEmployeeSelect(empId);
                }}
                onKeyDown={handleEmployeeKeyDown}
                onSearchKeyDown={handleEmployeeSearchKeyDown}
                onItemKeyDown={handleEmployeeItemKeyDown}
                getDisplay={(emp) => (
                  <div className="font-medium">{getEmployeeDisplay(emp)}</div>
                )}
                getSelectedDisplay={getSelectedEmployeeDisplay}
                loading={loadingEmployees}
                placeholder="Select Employee"
                searchPlaceholder="Search by employee code, name..."
                buttonRef={employeeButtonRef}
                dropdownRef={employeeDropdownRef}
                searchRef={employeeSearchRef}
                itemRefs={employeeItemRefs}
                listRef={employeeListRef}
                getId={(item) => item?.Emp_Id?.toString()}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={joinDateRef}
                    type="date"
                    name="Join_Date"
                    value={formData.Join_Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, empTypeButtonRef)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.Join_Date ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.Join_Date && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Join_Date}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Employee Type & Employee Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableDropdown
                label="Employee Type"
                value={formData.ETy_Id}
                error={errors.ETy_Id}
                icon={Hash}
                isOpen={isEmpTypeDropdownOpen}
                setIsOpen={setIsEmpTypeDropdownOpen}
                searchTerm={empTypeSearchTerm}
                setSearchTerm={setEmpTypeSearchTerm}
                items={empTypes}
                filteredItems={filteredEmpTypes}
                highlightedIndex={empTypeHighlightedIndex}
                onSelect={(type) => handleEmpTypeSelect(type)}
                onKeyDown={handleEmpTypeKeyDown}
                onSearchKeyDown={handleEmpTypeSearchKeyDown}
                onItemKeyDown={handleEmpTypeItemKeyDown}
                getDisplay={(type) => (
                  <div className="font-medium">{getEmpTypeDisplay(type)}</div>
                )}
                getSelectedDisplay={getSelectedEmpTypeDisplay}
                loading={loadingEmpTypes}
                placeholder="Select Employee Type"
                searchPlaceholder="Search by type name, code..."
                buttonRef={empTypeButtonRef}
                dropdownRef={empTypeDropdownRef}
                searchRef={empTypeSearchRef}
                itemRefs={empTypeItemRefs}
                listRef={empTypeListRef}
                getId={(item) => item?.ETy_Id || item?.id}
              />

              <SearchableDropdown
                label="Employee Status"
                value={formData.Est_Id}
                error={errors.Est_Id}
                icon={Users}
                isOpen={isEmpStatusDropdownOpen}
                setIsOpen={setIsEmpStatusDropdownOpen}
                searchTerm={empStatusSearchTerm}
                setSearchTerm={setEmpStatusSearchTerm}
                items={empStatuses}
                filteredItems={filteredEmpStatuses}
                highlightedIndex={empStatusHighlightedIndex}
                onSelect={(status) => handleEmpStatusSelect(status)}
                onKeyDown={handleEmpStatusKeyDown}
                onSearchKeyDown={handleEmpStatusSearchKeyDown}
                onItemKeyDown={handleEmpStatusItemKeyDown}
                getDisplay={(status) => (
                  <div className="font-medium">
                    {getEmpStatusDisplay(status)}
                  </div>
                )}
                getSelectedDisplay={getSelectedEmpStatusDisplay}
                loading={loadingEmpStatuses}
                placeholder="Select Employee Status"
                searchPlaceholder="Search by status name, code..."
                buttonRef={empStatusButtonRef}
                dropdownRef={empStatusDropdownRef}
                searchRef={empStatusSearchRef}
                itemRefs={empStatusItemRefs}
                listRef={empStatusListRef}
                getId={(item) => item?.Est_Id || item?.id}
              />
            </div>

            {/* Row 3: Department (MULTI-SELECT) & Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Multi-Select Component */}
              <div ref={deptDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />

                  <button
                    ref={deptButtonRef}
                    type="button"
                    onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                    onKeyDown={handleDepartmentKeyDown}
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.Dpt_id ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                  >
                    {formData.Dpt_id && formData.Dpt_id.length > 0 ? (
                      <span className="text-gray-900 truncate block">
                        {formData.Dpt_id.length} department(s) selected
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {loadingDepartments
                          ? "Loading departments..."
                          : "Select departments..."}
                      </span>
                    )}
                  </button>

                  {loadingDepartments ? (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Selected departments tags */}
                {formData.Dpt_id && formData.Dpt_id.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {filteredDepartments
                      .filter((dept) =>
                        formData.Dpt_id.includes(dept.Dpt_id.toString())
                      )
                      .map((dept) => (
                        <span
                          key={dept.Dpt_id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {dept.Dpt_Desc || dept.Dpt_Name}
                          <button
                            type="button"
                            onClick={() =>
                              handleDepartmentToggle(dept.Dpt_id.toString())
                            }
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}

                {isDeptDropdownOpen && (
                  <div
                    className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
                    style={{ minWidth: "500px", width: "auto" }}
                  >
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={deptSearchRef}
                          type="text"
                          value={deptSearchTerm}
                          onChange={(e) => setDeptSearchTerm(e.target.value)}
                          onKeyDown={handleDeptSearchKeyDown}
                          placeholder="Search departments..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          autoFocus
                        />
                        {deptSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setDeptSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div ref={deptListRef} className="overflow-y-auto max-h-64">
                      {filteredDepartments.length > 0 ? (
                        filteredDepartments.map((dept, idx) => {
                          const deptId = dept.Dpt_id?.toString();
                          const isSelected = formData.Dpt_id.includes(deptId);
                          const level = parseInt(dept.GrStt, 10) || 1;
                          const desc = dept.Dpt_Desc || "No Description";

                          return (
                            <button
                              key={deptId || idx}
                              ref={(el) => {
                                if (el && deptItemRefs.current)
                                  deptItemRefs.current[idx] = el;
                              }}
                              type="button"
                              onClick={() =>
                                handleDepartmentToggle(dept.Dpt_id)
                              }
                              onKeyDown={(e) =>
                                handleDeptItemKeyDown(e, idx, dept)
                              }
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                deptHighlightedIndex == idx
                                  ? "bg-blue-100"
                                  : isSelected
                                  ? "bg-blue-50"
                                  : "text-gray-700"
                              }`}
                              tabIndex={0}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div
                                    className="text-sm font-medium text-gray-900"
                                    style={{
                                      marginLeft: `${(level - 1) * 20}px`,
                                    }}
                                  >
                                    {desc}
                                  </div>
                                  {dept.Dpt_Name && dept.Dpt_Name != desc && (
                                    <div
                                      className="text-xs text-gray-500 mt-0.5"
                                      style={{
                                        marginLeft: `${(level - 1) * 20}px`,
                                      }}
                                    >
                                      {dept.Dpt_Name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p>No departments found</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{filteredDepartments.length} items found</span>
                        <span>{formData.Dpt_id.length} selected</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.Dpt_id && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Dpt_id}
                  </p>
                )}
              </div>

              <SearchableDropdown
                label="Designation"
                value={formData.Dsg_Id}
                error={errors.Dsg_Id}
                icon={Briefcase}
                isOpen={isDesgDropdownOpen}
                setIsOpen={setIsDesgDropdownOpen}
                searchTerm={desgSearchTerm}
                setSearchTerm={setDesgSearchTerm}
                items={flattenedDesignations}
                filteredItems={filteredDesignations}
                highlightedIndex={desgHighlightedIndex}
                onSelect={(desg) => handleDesignationSelect(desg)}
                onKeyDown={handleDesignationKeyDown}
                onSearchKeyDown={handleDesgSearchKeyDown}
                onItemKeyDown={handleDesgItemKeyDown}
                getSelectedDisplay={() => {
                  if (!formData.Dsg_Id) return "";
                  const selected = designations.find(
                    (d) => (d.Dsg_id || d.id)?.toString() == formData.Dsg_Id
                  );
                  if (!selected) return "Selected designation not found";
                  const level = parseInt(selected.GrStt, 10) || 1;
                  const indent = "    ".repeat(level - 1);
                  const desc = selected.Dsg_Desc || "Unknown";
                  const englishName = selected.Dsg_EName;
                  if (englishName) return `${indent}${desc} (${englishName})`;
                  return `${indent}${desc}`;
                }}
                loading={loadingDesignations}
                placeholder={
                  formData.Dpt_id && formData.Dpt_id.length > 0
                    ? "Select Designation"
                    : "Select Department first"
                }
                searchPlaceholder="Search by designation name, description..."
                buttonRef={desgButtonRef}
                dropdownRef={desgDropdownRef}
                searchRef={desgSearchRef}
                itemRefs={desgItemRefs}
                listRef={desgListRef}
                getId={(item) => (item?.Dsg_id || item?.id)?.toString()}
                renderItem={renderDesignationItem}
                disabled={!formData.Dpt_id || formData.Dpt_id.length == 0}
              />
            </div>

            {/* Row 4: Pay Bill & City Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableDropdown
                label="Pay Bill"
                value={formData.PBillNo}
                error={errors.PBillNo}
                icon={CreditCard}
                isOpen={isPayBillDropdownOpen}
                setIsOpen={setIsPayBillDropdownOpen}
                searchTerm={payBillSearchTerm}
                setSearchTerm={setPayBillSearchTerm}
                items={payBills}
                filteredItems={filteredPayBills}
                highlightedIndex={payBillHighlightedIndex}
                onSelect={(pb) => handlePayBillSelect(pb)}
                onKeyDown={handlePayBillKeyDown}
                onSearchKeyDown={handlePayBillSearchKeyDown}
                onItemKeyDown={handlePayBillItemKeyDown}
                getDisplay={(pb) => (
                  <div className="font-medium">{getPayBillDisplay(pb)}</div>
                )}
                getSelectedDisplay={getSelectedPayBillDisplay}
                loading={loadingPayBills}
                placeholder="Select Pay Bill"
                searchPlaceholder="Search by pay bill code, description..."
                buttonRef={payBillButtonRef}
                dropdownRef={payBillDropdownRef}
                searchRef={payBillSearchRef}
                itemRefs={payBillItemRefs}
                listRef={payBillListRef}
                getId={(item) => item?.PRB_id}
              />

              <SearchableDropdown
                label="City Grade"
                value={formData.CityCode}
                error={errors.CityCode}
                icon={Flag}
                isOpen={isCityGradeDropdownOpen}
                setIsOpen={setIsCityGradeDropdownOpen}
                searchTerm={cityGradeSearchTerm}
                setSearchTerm={setCityGradeSearchTerm}
                items={cityGrades}
                filteredItems={filteredCityGrades}
                highlightedIndex={cityGradeHighlightedIndex}
                onSelect={(cg) => handleCityGradeSelect(cg.CGR_Id)}
                onKeyDown={handleCityGradeKeyDown}
                onSearchKeyDown={handleCityGradeSearchKeyDown}
                onItemKeyDown={handleCityGradeItemKeyDown}
                getDisplay={(cg) => (
                  <div className="font-medium">{getCityGradeDisplay(cg)}</div>
                )}
                getSelectedDisplay={getSelectedCityGradeDisplay}
                loading={loadingCityGrades}
                placeholder="Select City Grade"
                searchPlaceholder="Search by city name, grade..."
                buttonRef={cityGradeButtonRef}
                dropdownRef={cityGradeDropdownRef}
                searchRef={cityGradeSearchRef}
                itemRefs={cityGradeItemRefs}
                listRef={cityGradeListRef}
                getId={(item) => item?.CGR_Id}
              />
            </div>

            {/* Row 5: Grade & Pay Band */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableDropdown
                label="Grade"
                value={formData.EGM_Id}
                error={errors.EGM_Id}
                required={true}
                icon={Award}
                isOpen={isGradeDropdownOpen}
                setIsOpen={setIsGradeDropdownOpen}
                searchTerm={gradeSearchTerm}
                setSearchTerm={setGradeSearchTerm}
                items={grades}
                filteredItems={filteredGrades}
                highlightedIndex={gradeHighlightedIndex}
                onSelect={(grade) =>
                  handleGradeSelect(grade.EGM_Id?.toString())
                }
                onKeyDown={handleGradeKeyDown}
                onSearchKeyDown={handleGradeSearchKeyDown}
                onItemKeyDown={handleGradeItemKeyDown}
                getDisplay={(grade) => (
                  <div className="font-medium">{getGradeDisplay(grade)}</div>
                )}
                getSelectedDisplay={getSelectedGradeDisplay}
                loading={loadingGrades}
                placeholder="Select Grade"
                searchPlaceholder="Search by grade name, code..."
                buttonRef={gradeButtonRef}
                dropdownRef={gradeDropdownRef}
                searchRef={gradeSearchRef}
                itemRefs={gradeItemRefs}
                listRef={gradeListRef}
                getId={(item) => item?.EGM_Id?.toString()}
              />

              <SearchableDropdown
                label="Pay Band"
                value={formData.PB_Id}
                icon={TrendingUp}
                showAsText={true}
                lockedValue={getPayBandDisplay()}
              />
            </div>

            {/* Row 6: Basic (Pay Matrix) & Week Off Pattern */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableDropdown
                label="Basic (Pay Matrix)"
                value={formData.Basic}
                error={errors.Basic}
                icon={DollarSign}
                isOpen={isPayMatrixDropdownOpen}
                setIsOpen={setIsPayMatrixDropdownOpen}
                searchTerm={payMatrixSearchTerm}
                setSearchTerm={setPayMatrixSearchTerm}
                items={payMatrices}
                filteredItems={filteredPayMatrices}
                highlightedIndex={payMatrixHighlightedIndex}
                onSelect={(pm) => handlePayMatrixSelect(pm)}
                onKeyDown={handlePayMatrixKeyDown}
                onSearchKeyDown={handlePayMatrixSearchKeyDown}
                onItemKeyDown={handlePayMatrixItemKeyDown}
                getDisplay={(pm) => (
                  <div className="font-medium">{getPayMatrixDisplay(pm)}</div>
                )}
                getSelectedDisplay={getSelectedPayMatrixDisplay}
                loading={loadingPayMatrices}
                placeholder={
                  formData.Dpt_id && formData.Dpt_id.length > 0
                    ? "Select Designation"
                    : "Select Department first"
                }
                searchPlaceholder="Search by cell index, basic pay..."
                buttonRef={payMatrixButtonRef}
                dropdownRef={payMatrixDropdownRef}
                searchRef={payMatrixSearchRef}
                itemRefs={payMatrixItemRefs}
                listRef={payMatrixListRef}
                getId={(item) => item?.PMM_Id}
                disabled={!formData.EGM_Id}
              />

              <SearchableDropdown
                label="Week Off Pattern"
                value={formData.WeekOffPattern}
                error={errors.WeekOffPattern}
                icon={CalendarDays}
                isOpen={isWeekOffPatternDropdownOpen}
                setIsOpen={setIsWeekOffPatternDropdownOpen}
                searchTerm={weekOffPatternSearchTerm}
                setSearchTerm={setWeekOffPatternSearchTerm}
                items={weekOffPatterns}
                filteredItems={filteredWeekOffPatterns}
                highlightedIndex={weekOffPatternHighlightedIndex}
                onSelect={(pattern) => handleWeekOffPatternSelect(pattern)}
                onKeyDown={handleWeekOffPatternKeyDown}
                onSearchKeyDown={handleWeekOffPatternSearchKeyDown}
                onItemKeyDown={handleWeekOffPatternItemKeyDown}
                getDisplay={(pattern) => (
                  <div className="font-medium">
                    {getWeekOffPatternDisplay(pattern)}
                  </div>
                )}
                getSelectedDisplay={getSelectedWeekOffPatternDisplay}
                loading={loadingWeekOffPatterns}
                placeholder="Select Week Off Pattern"
                searchPlaceholder="Search by pattern code, name..."
                buttonRef={weekOffPatternButtonRef}
                dropdownRef={weekOffPatternDropdownRef}
                searchRef={weekOffPatternSearchRef}
                itemRefs={weekOffPatternItemRefs}
                listRef={weekOffPatternListRef}
                getId={(item) => item?.pattern_id?.toString()}
              />
            </div>

            {/* Row 7: Post Date & Increment Month */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post-Effective Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={profileDateRef}
                    type="date"
                    name="EPP_Date"
                    value={formData.EPP_Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, cpfNpsRef)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.EPP_Date ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.EPP_Date && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.EPP_Date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Increment Month
                </label>
                <input
                  type="text"
                  name="IncMonth"
                  value={getIncrementMonthDisplay()}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  placeholder="Auto-filled from Post Date"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pay Details & Allowances Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pay Details & Allowances
            </h2>
          </div>

          <AllowancesSection
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            cpfNpsOptions={cpfNpsOptions}
            yesNoOptions={yesNoOptions}
            allowanceGroups={allowanceGroups}
            handleNumberInputChange={handleNumberInputChange}
            handleNumberBlur={handleNumberBlur}
            npsPercentRef={npsPercentRef}
            fixHraAmountRef={fixHraAmountRef}
            hbaInterestRef={hbaInterestRef}
            mcaInterestRef={mcaInterestRef}
            fixGpfAmountRef={fixGpfAmountRef}
            quotas={quotas}
            loadingQuotas={loadingQuotas}
            isQuotaDropdownOpen={isQuotaDropdownOpen}
            setIsQuotaDropdownOpen={setIsQuotaDropdownOpen}
            quotaSearchTerm={quotaSearchTerm}
            setQuotaSearchTerm={setQuotaSearchTerm}
            filteredQuotas={filteredQuotas}
            quotaHighlightedIndex={quotaHighlightedIndex}
            handleQuotaKeyDown={handleQuotaKeyDown}
            handleQuotaSearchKeyDown={handleQuotaSearchKeyDown}
            handleQuotaItemKeyDown={handleQuotaItemKeyDown}
            handleQuotaToggle={handleQuotaToggle}
            getSelectedQuotasDisplay={getSelectedQuotasDisplay}
            getQuotaDisplay={getQuotaDisplay}
            quotaButtonRef={quotaButtonRef}
            quotaDropdownRef={quotaDropdownRef}
            quotaSearchRef={quotaSearchRef}
            quotaItemRefs={quotaItemRefs}
            quotaListRef={quotaListRef}
            cpfNpsRef={cpfNpsRef}
            empGroupInsurances={empGroupInsurances}
            loadingEmpGroupInsurances={loadingEmpGroupInsurances}
            isGISEGIDropdownOpen={isGISEGIDropdownOpen}
            setIsGISEGIDropdownOpen={setIsGISEGIDropdownOpen}
            gisEGISearchTerm={gisEGISearchTerm}
            setGisEGISearchTerm={setGisEGISearchTerm}
            filteredGISEGI={filteredGISEGI}
            gisEGIHighlightedIndex={gisEGIHighlightedIndex}
            handleGISEGIKeyDown={handleGISEGIKeyDown}
            handleGISEGISearchKeyDown={handleGISEGISearchKeyDown}
            handleGISEGIItemKeyDown={handleGISEGIItemKeyDown}
            handleGISEGISelect={handleGISEGISelect}
            getGISEGIDisplay={getGISEGIDisplay}
            getSelectedGISEGIDisplay={getSelectedGISEGIDisplay}
            gisEGIButtonRef={gisEGIButtonRef}
            gisEGIDropdownRef={gisEGIDropdownRef}
            gisEGISearchRef={gisEGISearchRef}
            gisEGIItemRefs={gisEGIItemRefs}
            gisEGIListRef={gisEGIListRef}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0"></div>
          <div className="flex items-center space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => e.key == "Enter" && handleCancel()}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEmpProfileUpdate;
