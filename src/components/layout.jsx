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

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  Building,
  User,
  Briefcase,
  MessageCircle,
  Sparkles,
  User as UserIcon,
  Bot,
  ArrowRight,
  Paperclip,
  ChevronUp,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useAccountingNavigation } from "../hooks/useaccountingnavigation";
import { useFinancialYear } from "../context/financialyearcontext";
import axios from "axios";
import SettingsInitializer from "./settingsinitializer";
import { findRelevantKnowledge, quickSuggestions } from "../utils/ai-knowledge";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AutoBackGuard } from "./backbutton";

let toggleChatGlobal = null;

const Header = memo(
  ({
    user,
    orgData,
    orgError,
    orgLoading,
    onLogout,
    userDropdownOpen,
    setUserDropdownOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    showProfileLinks,
  }) => {
    const { currentFinancialYear, loading: fyLoading } = useFinancialYear();

    // Ambaji Temple logo is always shown in the header (replaces the "AMJ" text box)
    const getOrgLogoUrl = () => {
      return "/ambajilogo.png";
    };

    const getUserInitials = () => {
      if (!user?.apiUserData?.Usr_Name) return "U";
      return user?.apiUserData?.Usr_Name.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    };

    const getUserDisplayName = () => {
      return user?.apiUserData?.Usr_Name || "";
    };

    const getUserRole = () => {
      return user?.role || "";
    };

    const getUserEmployeeDesignation = () => {
      const designation =
        user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_Desc ||
        "";
      const designationEnglish =
        user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_EName ||
        "";

      // if (designation && designationEnglish) {
      //   return `${designation} / ${designationEnglish}`;
      // }
      return designation || designationEnglish || "";
    };

    const getOrgDisplayName = () => {
      if (orgData?.Org_Name) {
        return orgData.Org_Name;
      }
      return "Ambaji Temple";
    };

    const getOrgShortName = () => {
      if (orgData?.Org_Code) {
        return orgData.Org_Code;
      }
      return "AMT";
    };

    const getUserBranchDisplayName = () => {
      if (!user?.apiUserData) return "";

      const departmentDesc = user?.departmentData?.Dpt_Desc || "";
      const departmentName = user?.departmentData?.Dpt_Name || "";

      if (departmentDesc && departmentName) {
        return `${departmentDesc} / ${departmentName}`;
      }
      return departmentDesc || departmentName || "";
    };

    const getLeftCornerDisplay = () => {
      const isAdmin = user?.apiUserData?.Usr_Role_Id == 1;

      if (isAdmin) {
        return {
          primary: getOrgDisplayName(),
          secondary: getOrgShortName(),
        };
      } else {
        const departmentDisplay = getUserBranchDisplayName();
        return {
          primary: getOrgDisplayName(),
          secondary: departmentDisplay || getOrgShortName(),
        };
      }
    };

    const handleLogoutClick = () => {
      if (onLogout) {
        onLogout();
      }
    };

    const logoUrl = getOrgLogoUrl();
    const userRoleDisplay = getUserRole();
    const userEmployeeDesignation = getUserEmployeeDesignation();
    const userNameDisplay = getUserDisplayName();
    const userInitials = getUserInitials();
    const leftCornerDisplay = getLeftCornerDisplay();

    return (
      <header className="bg-blue-50 border-b border-gray-200 p-4 shadow-sm sticky top-0 z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex md:hidden items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                  {orgLoading ? (
                    <div className="h-full w-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 animate-pulse"></div>
                  ) : logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${getOrgDisplayName()} Logo`}
                      className="h-full w-full object-contain rounded-lg"
                      onError={(e) => {
                        console.warn("Logo failed to load, showing code");
                        e.target.style.display = "none";
                        const parent = e.target.parentElement;
                        const fallback = document.createElement("div");
                        fallback.className =
                          "h-full w-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center";

                        const displayCode = getOrgShortName();
                        fallback.innerHTML = `<span class="text-white font-bold text-xs">${displayCode}</span>`;
                        parent.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <div className="h-full w-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {getOrgShortName()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xs sm:text-sm font-bold text-gray-900 leading-none">
                    {leftCornerDisplay.primary}
                  </h1>
                  {leftCornerDisplay.secondary && (
                    <p className="text-[10px] sm:text-xs text-gray-600 leading-tight mt-0.5">
                      {leftCornerDisplay.secondary}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden xs:flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-white/80 rounded border border-gray-200">
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {fyLoading
                      ? "Loading..."
                      : currentFinancialYear
                        ? currentFinancialYear.FY_Code || "FY"
                        : "No FY"}
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100"
                >
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {userInitials}
                  </div>
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-30 border border-gray-100">
                    {showProfileLinks && (
                      <>
                        <Link
                          to="/user-profile"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3 text-gray-500" />
                          User Profile
                        </Link>
                        <Link
                          to="/employee-profile"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Briefcase className="h-4 w-4 mr-3 text-gray-500" />
                          Employee Profile
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}

                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 lg:h-12 lg:w-12 flex-shrink-0">
                  {orgLoading ? (
                    <div className="h-full w-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 animate-pulse"></div>
                  ) : logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${getOrgDisplayName()} Logo`}
                      className="h-full w-full object-contain rounded-lg"
                      onError={(e) => {
                        console.warn("Logo failed to load, showing code");
                        e.target.style.display = "none";
                        const parent = e.target.parentElement;
                        const fallback = document.createElement("div");
                        fallback.className =
                          "h-full w-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center";

                        const displayCode = getOrgShortName();
                        fallback.innerHTML = `<span class="text-white font-bold text-sm lg:text-base">${displayCode}</span>`;
                        parent.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <div className="h-full w-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <span className="text-white font-bold text-sm lg:text-base">
                        {getOrgShortName()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h1 className="text-base lg:text-lg font-bold text-gray-900 leading-none">
                    {leftCornerDisplay.primary}
                  </h1>
                  {leftCornerDisplay.secondary && (
                    <p className="text-xs text-gray-600 leading-tight mt-1">
                      {leftCornerDisplay.secondary}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-medium text-gray-700 text-left">
                        {userNameDisplay}
                      </p>
                      {/* <p className="text-xs text-gray-500 text-left">
                        {userRoleDisplay}
                      </p> */}
                      {userEmployeeDesignation && (
                        <p className="text-xs text-gray-500 text-left">
                          {userEmployeeDesignation}
                        </p>
                      )}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {userInitials}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-30 border border-gray-100">
                      {showProfileLinks && (
                        <>
                          <Link
                            to="/user-profile"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3 text-gray-500" />
                            User Profile
                          </Link>
                          <Link
                            to="/employee-profile"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <Briefcase className="h-4 w-4 mr-3 text-gray-500" />
                            Employee Profile
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}

                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  },
);

Header.displayName = "Header";

const DesktopNavigation = memo(
  ({
    navItems,
    isActive,
    isItemOrChildActive,
    openDropdown,
    setOpenDropdown,
    openNestedDropdown,
    setOpenNestedDropdown,
    openThirdDropdown,
    setOpenThirdDropdown,
    dropdownRef,
    location,
  }) => {
    const handleThirdDropdownClick = useCallback(
      (thirdItemPath, parentPath, grandPath) => {
        const fullPath = `${parentPath}-${grandPath}-${thirdItemPath}`;
        if (openThirdDropdown == fullPath) {
          setOpenThirdDropdown(null);
        } else {
          setOpenThirdDropdown(fullPath);
        }
      },
      [openThirdDropdown, setOpenThirdDropdown],
    );

    const handleNestedDropdownClick = useCallback(
      (subItemPath, parentPath) => {
        const fullPath = `${parentPath}-${subItemPath}`;
        if (openNestedDropdown == fullPath) {
          setOpenNestedDropdown(null);
          setOpenThirdDropdown(null);
        } else {
          setOpenNestedDropdown(fullPath);
          setOpenThirdDropdown(null);
        }
      },
      [openNestedDropdown, setOpenNestedDropdown, setOpenThirdDropdown],
    );

    const handleMainDropdownClick = useCallback(
      (itemPath) => {
        if (openDropdown == itemPath) {
          setOpenDropdown(null);
          setOpenNestedDropdown(null);
          setOpenThirdDropdown(null);
        } else {
          setOpenDropdown(itemPath);
          setOpenNestedDropdown(null);
          setOpenThirdDropdown(null);
        }
      },
      [
        openDropdown,
        setOpenDropdown,
        setOpenNestedDropdown,
        setOpenThirdDropdown,
      ],
    );

    return (
      <div className="hidden lg:block bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-md">
        <div className="mx-auto px-6">
          <nav ref={dropdownRef} className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const active = isActive(item);
              const childActive = isItemOrChildActive(item);
              const shouldHighlight = active || (hasSubItems && childActive);

              const getColumnCount = () => {
                const count = item.subItems?.length || 0;
                if (count <= 5) return 1;
                if (count <= 11) return 2;
                if (count <= 17) return 3;
                return 4;
              };
              const columnCount = getColumnCount();
              const itemsPerColumn =
                Math.ceil(item.subItems?.length / columnCount) || 0;
              return (
                <div key={item.key} className="relative">
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => handleMainDropdownClick(item.path)}
                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          shouldHighlight || openDropdown == item.path
                            ? "bg-white/20 text-white"
                            : "text-white/90 hover:bg-white/10"
                        }`}
                        aria-expanded={openDropdown == item.path}
                        aria-haspopup="true"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                        <ChevronDown
                          className={`h-3.5 w-3.5 ml-1 transition-transform ${
                            openDropdown == item.path ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openDropdown == item.path && (
                        <div
                          className={`absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 ${
                            columnCount == 1
                              ? "w-64"
                              : columnCount == 2
                                ? "w-[500px]"
                                : "w-[700px]"
                          }`}
                        >
                          <div className="px-4 py-2 border-b">
                            {/* <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {item.label}
                            </p> */}
                            {/* {item.description && (
                              <p className="text-xs text-gray-400 mt-1">
                                {item.description}
                              </p>
                            )} */}
                          </div>
                          <div
                            className={`py-1 px-4 ${
                              columnCount == 2
                                ? "grid grid-cols-2 gap-4"
                                : columnCount == 3
                                  ? "grid grid-cols-3 gap-4"
                                  : columnCount == 4
                                    ? "grid grid-cols-4 gap-4"
                                    : ""
                            }`}
                          >
                            {Array.from({ length: columnCount }).map(
                              (_, colIndex) => (
                                <div key={colIndex} className="space-y-1">
                                  {item.subItems
                                    ?.slice(
                                      colIndex * itemsPerColumn,
                                      (colIndex + 1) * itemsPerColumn,
                                    )
                                    .map((subItem) => {
                                      const SubIcon = subItem.icon;
                                      const hasNestedSubItems =
                                        subItem.subItems &&
                                        subItem.subItems.length > 0;
                                      const subActive = isActive(subItem);
                                      const nestedDropdownKey = `${item.path}-${subItem.path}`;
                                      return (
                                        <div
                                          key={subItem.key}
                                          className="relative group  bdr-btm"
                                        >
                                          {hasNestedSubItems ? (
                                            <>
                                              <button
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  handleNestedDropdownClick(
                                                    subItem.path,
                                                    item.path,
                                                  );
                                                }}
                                                className={`flex items-center justify-between w-full px-3 py-2.5 rounded text-sm transition-colors hover:bg-gray-100 ${
                                                  subActive ||
                                                  openNestedDropdown ==
                                                    nestedDropdownKey
                                                    ? "bg-gray-50 text-indigo-600"
                                                    : "text-gray-700"
                                                }`}
                                              >
                                                <div className="flex items-center">
                                                  {SubIcon && (
                                                    <SubIcon
                                                      className={`h-4 w-4 mr-3 ${
                                                        subActive
                                                          ? "text-indigo-500"
                                                          : "text-gray-400"
                                                      }`}
                                                    />
                                                  )}
                                                  <span>{subItem.label}</span>
                                                </div>
                                                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                              </button>
                                              {openNestedDropdown ==
                                                nestedDropdownKey && (
                                                <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]">
                                                  <div className="py-1">
                                                    {subItem.subItems?.map(
                                                      (nestedItem) => {
                                                        const NestedIcon =
                                                          nestedItem.icon;
                                                        const hasThirdLevel =
                                                          nestedItem.subItems &&
                                                          nestedItem.subItems
                                                            .length > 0;
                                                        const nestedActive =
                                                          isActive(nestedItem);
                                                        const thirdDropdownKey = `${item.path}-${subItem.path}-${nestedItem.path}`;
                                                        return (
                                                          <div
                                                            key={nestedItem.key}
                                                            className="relative group bdr-btm"
                                                          >
                                                            {hasThirdLevel ? (
                                                              <>
                                                                <button
                                                                  onClick={(
                                                                    e,
                                                                  ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleThirdDropdownClick(
                                                                      nestedItem.path,
                                                                      item.path,
                                                                      subItem.path,
                                                                    );
                                                                  }}
                                                                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded text-sm transition-colors hover:bg-gray-100 ${
                                                                    nestedActive ||
                                                                    openThirdDropdown ==
                                                                      thirdDropdownKey
                                                                      ? "bg-gray-50 text-indigo-600"
                                                                      : "text-gray-700"
                                                                  }`}
                                                                >
                                                                  <div className="flex items-center">
                                                                    {NestedIcon && (
                                                                      <NestedIcon
                                                                        className={`h-4 w-4 mr-3 ${
                                                                          nestedActive
                                                                            ? "text-indigo-500"
                                                                            : "text-gray-400"
                                                                        }`}
                                                                      />
                                                                    )}
                                                                    <span>
                                                                      {
                                                                        nestedItem.label
                                                                      }
                                                                    </span>
                                                                  </div>
                                                                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                                                </button>
                                                                {openThirdDropdown ==
                                                                  thirdDropdownKey && (
                                                                  <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]">
                                                                    <div className="py-1">
                                                                      {nestedItem.subItems.map(
                                                                        (
                                                                          thirdItem,
                                                                        ) => {
                                                                          const ThirdIcon =
                                                                            thirdItem.icon;
                                                                          const thirdActive =
                                                                            isActive(
                                                                              thirdItem,
                                                                            );
                                                                          return (
                                                                            <Link
                                                                              key={
                                                                                thirdItem.key
                                                                              }
                                                                              to={
                                                                                thirdItem.path
                                                                              }
                                                                              onClick={() => {
                                                                                setOpenDropdown(
                                                                                  null,
                                                                                );
                                                                                setOpenNestedDropdown(
                                                                                  null,
                                                                                );
                                                                                setOpenThirdDropdown(
                                                                                  null,
                                                                                );
                                                                              }}
                                                                              className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                                                                                thirdActive
                                                                                  ? "bg-indigo-50 text-indigo-600 font-medium"
                                                                                  : "text-gray-700 hover:bg-gray-100"
                                                                              }`}
                                                                            >
                                                                              {ThirdIcon && (
                                                                                <ThirdIcon
                                                                                  className={`h-4 w-4 mr-3 ${
                                                                                    thirdActive
                                                                                      ? "text-indigo-500"
                                                                                      : "text-gray-400"
                                                                                  }`}
                                                                                />
                                                                              )}
                                                                              <span>
                                                                                {
                                                                                  thirdItem.label
                                                                                }
                                                                              </span>
                                                                              {thirdActive && (
                                                                                <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-500" />
                                                                              )}
                                                                            </Link>
                                                                          );
                                                                        },
                                                                      )}
                                                                    </div>
                                                                  </div>
                                                                )}
                                                              </>
                                                            ) : (
                                                              <Link
                                                                to={
                                                                  nestedItem.path
                                                                }
                                                                onClick={() => {
                                                                  setOpenDropdown(
                                                                    null,
                                                                  );
                                                                  setOpenNestedDropdown(
                                                                    null,
                                                                  );
                                                                }}
                                                                className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                                                                  nestedActive
                                                                    ? "bg-indigo-50 text-indigo-600 font-medium"
                                                                    : "text-gray-700 hover:bg-gray-100"
                                                                }`}
                                                              >
                                                                {NestedIcon && (
                                                                  <NestedIcon
                                                                    className={`h-4 w-4 mr-3 ${
                                                                      nestedActive
                                                                        ? "text-indigo-500"
                                                                        : "text-gray-400"
                                                                    }`}
                                                                  />
                                                                )}
                                                                <span>
                                                                  {
                                                                    nestedItem.label
                                                                  }
                                                                </span>
                                                                {nestedActive && (
                                                                  <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-500" />
                                                                )}
                                                              </Link>
                                                            )}
                                                          </div>
                                                        );
                                                      },
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                            </>
                                          ) : (
                                            <Link
                                              to={subItem.path}
                                              onClick={() => {
                                                setOpenDropdown(null);
                                                setOpenNestedDropdown(null);
                                              }}
                                              className={`flex items-center px-3 py-2.5 rounded text-sm transition-colors ${
                                                subActive
                                                  ? "bg-indigo-50 text-indigo-600 font-medium"
                                                  : "text-gray-700 hover:bg-gray-100"
                                              }`}
                                            >
                                              {SubIcon && (
                                                <SubIcon
                                                  className={`h-4 w-4 mr-3 ${
                                                    subActive
                                                      ? "text-indigo-500"
                                                      : "text-gray-400"
                                                  }`}
                                                />
                                              )}
                                              <span>{subItem.label}</span>
                                              {subActive && (
                                                <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-500" />
                                              )}
                                            </Link>
                                          )}
                                        </div>
                                      );
                                    })}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-white/20 text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    );
  },
);

DesktopNavigation.displayName = "DesktopNavigation";

// Chatbot Component
const Chatbot = ({ user }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Initialize Gemini API
  let genAI = null;
  let model = null;

  // Expose toggle function globally
  useEffect(() => {
    toggleChatGlobal = () => setIsChatOpen((prev) => !prev);
    return () => {
      toggleChatGlobal = null;
    };
  }, []);

  useEffect(() => {
    try {
      const apiKey =
        import.meta.env.VITE_GEMINI_API_KEY ||
        process.env.REACT_APP_GEMINI_API_KEY;

      if (!apiKey) {
        console.warn(
          "Gemini API key not found. Please add VITE_GEMINI_API_KEY to your environment variables.",
        );
        return;
      }

      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
      setIsApiReady(true);
      console.log("Gemini API initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Gemini API:", error);
    }
  }, []);

  const sendToGemini = async (userMessage) => {
    if (!isApiReady || !model) {
      return "I'm sorry, the AI service is not available. Please try again later or contact support.";
    }

    try {
      const chat = model.startChat({
        history: conversationHistory,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3,
        },
      });

      const contextPrompt = `
You are "I3EMS Assistant" - a friendly AI assistant for I3EMS system.
The I3EMS has these modules: FAMS, HRMS.

Current user: ${user?.name || "User"}

Your role:
- Guide users step-by-step on using I3EMS features
- Be concise but thorough
- Use bullet points and clear numbering
- Be helpful and positive

User question: ${userMessage}

Provide clear, structured answer with steps if applicable.
If unsure, suggest checking documentation or contacting admin.
`;

      const result = await chat.sendMessage(contextPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return null;
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      {
        text: userMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setIsChatLoading(true);
    setShowSuggestions(false);

    try {
      let botReply = findRelevantKnowledge(userMessage);

      if (!botReply) {
        const geminiReply = await sendToGemini(userMessage);
        if (geminiReply) {
          botReply = geminiReply;
        } else {
          botReply =
            "I'm having trouble connecting. Please try again or check your internet connection. You can also try being more specific with your question.";
        }
      }

      setChatMessages((prev) => [
        ...prev,
        {
          text: botReply,
          sender: "bot",
          source: botReply.includes("having trouble")
            ? "fallback"
            : "knowledge-base",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          text: "I encountered an error. Please try again or contact support if the issue persists.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (isChatOpen && !isChatMinimized) {
      setTimeout(() => chatInputRef.current?.focus(), 300);
    }
  }, [isChatOpen, isChatMinimized]);

  const handleChatKeyPress = (e) => {
    if (e.key == "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const handleSuggestionClick = (query) => {
    setChatInput(query);
    setTimeout(() => sendChatMessage(), 100);
  };

  const renderMessage = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <strong key={i}>{line.slice(2, -2)}</strong>;
      }
      if (
        line.startsWith("📄") ||
        line.startsWith("📊") ||
        line.startsWith("👤") ||
        line.startsWith("🏖️") ||
        line.startsWith("🐾") ||
        line.startsWith("🏛️") ||
        line.startsWith("💰") ||
        line.startsWith("🏪") ||
        line.startsWith("👥") ||
        line.startsWith("💡") ||
        line.startsWith("⚠️") ||
        line.startsWith("🔐") ||
        line.startsWith("📋") ||
        line.startsWith("📈") ||
        line.startsWith("🤖")
      ) {
        return (
          <div key={i} className="flex items-start gap-2 my-1">
            {line}
          </div>
        );
      }
      if (line.trim().match(/^\d+\./)) {
        return (
          <div key={i} className="ml-4 my-1">
            {line}
          </div>
        );
      }
      return <div key={i}>{line}</div>;
    });
  };

  return (
    <>
      {/* Chat Window - Only show when open */}
      {isChatOpen && (
        <div
          className={`fixed bottom-24 right-8 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 transition-all duration-300 ${
            isChatMinimized
              ? "w-[500px] h-24"
              : isChatFullscreen
                ? "w-[800px] h-[850px]"
                : "w-[550px] h-[750px]"
          }`}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl flex items-center gap-3">
                  I3EMS Assistant
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full text-white/90 font-medium">
                    AI
                  </span>
                  <span className="text-xs bg-green-500/30 px-3 py-1 rounded-full text-green-200 font-medium">
                    Live
                  </span>
                </h3>
                
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatFullscreen(!isChatFullscreen)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              >
                {isChatFullscreen ? (
                  <Minimize2 className="h-6 w-6" />
                ) : (
                  <Maximize2 className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              >
                {isChatMinimized ? (
                  <ChevronUp className="h-6 w-6" />
                ) : (
                  <ChevronDown className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          {!isChatMinimized && (
            <>
              <div
                className={`flex-1 overflow-y-auto p-6 space-y-5 ${isChatFullscreen ? "h-[650px]" : "h-[580px]"} bg-gradient-to-b from-gray-50 to-white`}
              >
                {chatMessages.length == 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="relative">
                      <div className="text-8xl mb-6 animate-bounce">🤖</div>
                      <div className="absolute -top-2 -right-2 bg-green-400 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse shadow-lg">
                        Live
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-3">
                      Hi! I'm your I3EMS Assistant
                    </h3>
                    <p className="text-gray-500 text-lg mb-8 max-w-md">
                      Ask me anything about your ERP system. I'm here to help!
                    </p>

                    <div className="grid grid-cols-3 gap-3 w-full max-w-2xl">
                      {quickSuggestions.slice(0, 9).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleSuggestionClick(suggestion.query)
                          }
                          className="group relative overflow-hidden text-sm bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 px-4 py-3.5 rounded-2xl transition-all duration-300 text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
                        >
                          <span className="relative z-10 font-medium">
                            {suggestion.label}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                      ))}
                    </div>

                    
                  </div>
                ) : (
                  <>
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.sender == "user" ? "justify-end" : "justify-start"} message-enter`}
                      >
                        <div
                          className={`flex items-start gap-4 max-w-[85%] ${
                            msg.sender == "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center shadow-xl ${
                              msg.sender == "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                : "bg-gradient-to-r from-purple-500 to-blue-500"
                            }`}
                          >
                            {msg.sender == "user" ? (
                              <UserIcon className="h-6 w-6 text-white" />
                            ) : (
                              <Bot className="h-6 w-6 text-white" />
                            )}
                          </div>

                          <div
                            className={`p-5 rounded-2xl ${
                              msg.sender == "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-xl shadow-blue-500/30"
                                : "bg-white text-gray-800 rounded-bl-none shadow-xl shadow-gray-200/50 border border-gray-100"
                            }`}
                          >
                            <div className="text-base leading-relaxed">
                              {renderMessage(msg.text)}
                            </div>
                            {msg.timestamp && (
                              <div
                                className={`text-[11px] mt-3 ${
                                  msg.sender == "user"
                                    ? "text-blue-100"
                                    : "text-gray-400"
                                }`}
                              >
                                🕐 {msg.timestamp}
                              </div>
                            )}
                            {msg.source == "knowledge-base" &&
                              msg.sender == "bot" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                    📚 Knowledge Base
                                  </span>
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    ⚡ Instant
                                  </span>
                                </div>
                              )}
                            {msg.source == "fallback" &&
                              msg.sender == "bot" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                                    ⚠️ Offline Mode
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl rounded-bl-none shadow-xl shadow-gray-200/50 border-2 border-gray-100">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
                            <Bot className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex gap-2">
                            <div
                              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 ml-2 font-medium">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.slice(9, 15).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.query)}
                      className="text-sm bg-white hover:bg-gray-100 px-4 py-2 rounded-full transition-all duration-200 text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md font-medium"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input - With extra bottom padding */}
              <div className="p-5 pb-8 border-t-2 border-gray-200 flex gap-3 bg-white rounded-b-3xl">
                <div className="relative flex-1">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleChatKeyPress}
                    placeholder="Type your question here... (Press Enter to send)"
                    className="w-full px-6 py-4 pr-14 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-gray-50 hover:bg-white transition-colors"
                    disabled={isChatLoading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={sendChatMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 text-base font-medium"
                >
                  <span className="hidden sm:inline">Send</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

const Layout = ({ user, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openNestedDropdown, setOpenNestedDropdown] = useState(null);
  const [openThirdDropdown, setOpenThirdDropdown] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const {
    navItems,
    loading: navLoading,
    error: navError,
  } = useAccountingNavigation();

  const isDashboard =
    location.pathname == "/dashboard" || location.pathname == "/";

  // Check if chatbot should be active
  const isChatBotActive = useMemo(() => {
    const envValue = import.meta.env.VITE_IS_CHAT_BOT_ACTIVE || "NO";
    return envValue.toUpperCase() == "YES";
  }, []);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const parsed = JSON.parse(userData);
        setIsAdmin(parsed.Usr_Role_Id == 1);
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
    }
  }, []);

  useEffect(() => {
    if (!navLoading && navError == "NO_ACCESS") {
      onLogout();
      navigate("/login", {
        state: {
          error:
            "You don't have permission to access the system. Please contact administrator.",
        },
      });
    }
  }, [navLoading, navError, onLogout, navigate]);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setOrgLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/lst-org-master`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          },
        );

        if (
          response.data.success &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          setOrgData(response.data.data[0]);
        } else {
          setOrgData(null);
        }
        setOrgLoading(false);
      } catch (err) {
        console.error("Error fetching organisation data:", err);
        setOrgError("Failed to load organisation information");
        setOrgLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  useEffect(() => {
    const loadUserDataFromLocalStorage = () => {
      try {
        const amtUser = localStorage.getItem("amt_user");
        if (amtUser) {
          const userData = JSON.parse(amtUser);

          if (user) {
            user.name = userData.Usr_Name || userData.Usr_Name || user.Usr_Name;
            user.role = userData.role || userData.department || user.role;
            user.branch_name = userData.branch_name || user.branch_name;
            user.branch_code = userData.branch_code || user.branch_code;
            user.department = userData.department || user.department;

            const storedDept = localStorage.getItem("amt_department");
            if (storedDept) {
              const deptData = JSON.parse(storedDept);
              if (deptData && deptData.desc) {
                user.department = deptData.desc;
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading user data from localStorage:", err);
      }
    };

    loadUserDataFromLocalStorage();
  }, [user]);

  const isActive = useMemo(() => {
    const currentPath = location.pathname;
    const normalizedCurrentPath = currentPath.endsWith("/")
      ? currentPath.slice(0, -1)
      : currentPath;

    return (item) => {
      if (!item.path || item.path.startsWith("#")) {
        return false;
      }

      const normalizedItemPath = item.path.endsWith("/")
        ? item.path.slice(0, -1)
        : item.path;

      if (normalizedItemPath == normalizedCurrentPath) {
        return true;
      }

      return false;
    };
  }, [location.pathname]);

  const isItemOrChildActive = useMemo(() => {
    const currentPath = location.pathname;
    const normalizedCurrentPath = currentPath.endsWith("/")
      ? currentPath.slice(0, -1)
      : currentPath;

    const checkItemAndChildren = (item) => {
      if (item.path && !item.path.startsWith("#")) {
        const normalizedItemPath = item.path.endsWith("/")
          ? item.path.slice(0, -1)
          : item.path;

        if (normalizedItemPath == normalizedCurrentPath) {
          return true;
        }
      }

      if (item.subItems && item.subItems.length > 0) {
        return item.subItems.some((child) => checkItemAndChildren(child));
      }

      return false;
    };

    return (item) => checkItemAndChildren(item);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setOpenNestedDropdown(null);
        setOpenThirdDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenNestedDropdown(null);
    setOpenThirdDropdown(null);
  }, [location.pathname]);

  const MobileNavigation = useMemo(() => {
    if (!mobileMenuOpen) return null;

    return (
      <div className="lg:hidden bg-gradient-to-b from-indigo-700 to-indigo-800 border-t border-white/10">
        <nav className="max-h-[60vh] overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const active = isActive(item);
            const childActive = isItemOrChildActive(item);

            return (
              <MobileNavigationItem
                key={item.key}
                item={item}
                active={active}
                childActive={childActive}
                Icon={Icon}
                hasSubItems={hasSubItems}
                isActive={isActive}
                setMobileMenuOpen={setMobileMenuOpen}
              />
            );
          })}
        </nav>
      </div>
    );
  }, [mobileMenuOpen, navItems, isActive]);

  const showProfileLinks = !isAdmin;

  if (navLoading || orgLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <SettingsInitializer />
        <header className="bg-blue-50 border-b border-gray-200 p-4 shadow-sm sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {orgLoading ? "Loading..." : " "}
                </h1>
                <p className="text-xs text-gray-500">
                  {orgLoading ? "Loading organisation..." : ""}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (navError == "NO_ACCESS") {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-blue-50 border-b border-gray-200 p-4 shadow-sm sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  Access Denied
                </h1>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the system. Please contact
              your administrator.
            </p>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (navError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-blue-50 border-b border-gray-200 p-4 shadow-sm sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {orgError ? "" : ""}
                </h1>
                <p className="text-xs text-gray-500">{orgError ? "" : ""}</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Navigation Error
            </h3>
            <p className="text-gray-600 mb-4">{navError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const storedDate = JSON.parse(localStorage.getItem("login_date"));
  const currentDateTime = new Date();

  console.log("currentDateTime3", currentDateTime);
  if (
    storedDate &&
    currentDateTime - new Date(storedDate) > 24 * 60 * 60 * 1000
  ) {
    onLogout();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 w-full overflow-x-hidden">
      <Header
        user={user}
        orgData={orgData}
        orgError={orgError}
        orgLoading={orgLoading}
        onLogout={onLogout}
        userDropdownOpen={userDropdownOpen}
        setUserDropdownOpen={setUserDropdownOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        showProfileLinks={showProfileLinks}
      />

      <DesktopNavigation
        navItems={navItems}
        isActive={isActive}
        isItemOrChildActive={isItemOrChildActive}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        openNestedDropdown={openNestedDropdown}
        setOpenNestedDropdown={setOpenNestedDropdown}
        openThirdDropdown={openThirdDropdown}
        setOpenThirdDropdown={setOpenThirdDropdown}
        dropdownRef={dropdownRef}
        location={location}
      />

      {MobileNavigation}

      <main className="flex-1 w-full overflow-y-auto">
        <AutoBackGuard>{children}</AutoBackGuard>
      </main>

      {/* Footer - With Larger Help Button - Hidden on Dashboard */}
      {!isDashboard && (
        <div className="bg-blue-50 border-t border-gray-200 shadow-sm sticky bottom-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2 md:py-3">
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-800">
                Designed and Developed by{" "}
                <a
                  href="https://aark.co.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-800 hover:text-blue-800 transition-colors font-medium whitespace-nowrap"
                >
                  AARK InfoSoft Pvt. Ltd.
                </a>
              </p>

              {/* Conditionally show Help button based on env variable */}
              {isChatBotActive && (
                <button
                  onClick={() => {
                    if (typeof toggleChatGlobal == "function") {
                      toggleChatGlobal();
                    }
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>Help</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot - Rendered globally (only if active) */}
      {isChatBotActive && <Chatbot user={user} />}
    </div>
  );
};

const MobileNavigationItem = ({
  item,
  active,
  childActive,
  Icon,
  hasSubItems,
  isActive,
  setMobileMenuOpen,
}) => {
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [mobileNestedOpen, setMobileNestedOpen] = useState(null);
  const [mobileThirdOpen, setMobileThirdOpen] = useState(null);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      {hasSubItems ? (
        <>
          <button
            onClick={() => {
              setMobileSubOpen(!mobileSubOpen);
              setMobileNestedOpen(null);
              setMobileThirdOpen(null);
            }}
            className={`flex items-center justify-between w-full px-4 py-3.5 text-left ${
              active || childActive
                ? "bg-white/15 text-white"
                : "text-white/90 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                mobileSubOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {mobileSubOpen && (
            <div className="bg-indigo-800/50">
              {item.subItems?.map((subItem) => (
                <MobileSubItem
                  key={subItem.key}
                  subItem={subItem}
                  isActive={isActive}
                  setMobileMenuOpen={setMobileMenuOpen}
                  mobileNestedOpen={mobileNestedOpen}
                  setMobileNestedOpen={setMobileNestedOpen}
                  mobileThirdOpen={mobileThirdOpen}
                  setMobileThirdOpen={setMobileThirdOpen}
                  depth={1}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          to={item.path}
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center px-4 py-3.5 ${
            active
              ? "bg-white/15 text-white"
              : "text-white/90 hover:bg-white/10"
          }`}
        >
          <Icon className="h-5 w-5 mr-3" />
          <span className="font-medium">{item.label}</span>
          {active && <ChevronRight className="h-4 w-4 ml-auto" />}
        </Link>
      )}
    </div>
  );
};

const MobileSubItem = ({
  subItem,
  isActive,
  setMobileMenuOpen,
  mobileNestedOpen,
  setMobileNestedOpen,
  mobileThirdOpen,
  setMobileThirdOpen,
  depth,
}) => {
  const SubIcon = subItem.icon;
  const hasNestedSubItems = subItem.subItems && subItem.subItems.length > 0;
  const subActive = isActive(subItem);

  const getPaddingLeft = () => {
    const basePadding = 4;
    const increment = depth * 20;
    return basePadding + increment;
  };

  return (
    <div key={subItem.key}>
      {hasNestedSubItems ? (
        <>
          <button
            onClick={() => {
              setMobileNestedOpen(
                mobileNestedOpen == subItem.path ? null : subItem.path,
              );
              setMobileThirdOpen(null);
            }}
            className={`flex items-center justify-between w-full py-2.5 text-sm border-l-2 pl-${getPaddingLeft()} pr-4 ${
              subActive
                ? "text-white border-white font-medium"
                : "text-white/80 border-transparent"
            }`}
            style={{ paddingLeft: `${getPaddingLeft()}px` }}
          >
            <div className="flex items-center">
              {SubIcon && <SubIcon className="h-3.5 w-3.5 mr-3 opacity-70" />}
              {subItem.label}
            </div>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                mobileNestedOpen == subItem.path ? "rotate-180" : ""
              }`}
            />
          </button>
          {mobileNestedOpen == subItem.path && (
            <div className="bg-indigo-900/50">
              {subItem.subItems?.map((nestedItem) => (
                <MobileSubItem
                  key={nestedItem.key}
                  subItem={nestedItem}
                  isActive={isActive}
                  setMobileMenuOpen={setMobileMenuOpen}
                  mobileNestedOpen={mobileNestedOpen}
                  setMobileNestedOpen={setMobileNestedOpen}
                  mobileThirdOpen={mobileThirdOpen}
                  setMobileThirdOpen={setMobileThirdOpen}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          to={subItem.path}
          onClick={() => setMobileMenuOpen(false)}
          className={`flex items-center py-2.5 text-sm border-l-2 pl-${getPaddingLeft()} pr-4 ${
            subActive
              ? "text-white border-white font-medium"
              : "text-white/80 border-transparent hover:text-white"
          }`}
          style={{ paddingLeft: `${getPaddingLeft()}px` }}
        >
          {SubIcon && <SubIcon className="h-3.5 w-3.5 mr-3 opacity-70" />}
          {subItem.label}
          {subActive && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
        </Link>
      )}
    </div>
  );
};

export default Layout;
