

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


import { useState, useEffect, useMemo } from "react";
import * as Icons from "lucide-react";


// Pet Management & Tax Management modules are removed from this project.
// Menus come from the backend (menu-master), so we hide any menu entry (and its
// whole sub-tree) that belongs to those modules.
const REMOVED_MENU_LINK = /(pet-registration-masters|masters\/tax-management|reports\/pet\/|reports\/property-tax|dashboards\/pet|dashboards\/revenue|tax-payments)/i;
const REMOVED_MENU_NAME = /^\s*(pet\b.*|animal\b.*|tax management|property tax.*|revenue dashboard)\s*$/i;

export const filterRemovedMenus = (items) => {
  if (!Array.isArray(items)) return [];
  const removed = new Set();
  items.forEach((item) => {
    const link = item.Menu_Links || "";
    const name = item.Fnc_Desc || item.title || "";
    if (REMOVED_MENU_LINK.test(link) || REMOVED_MENU_NAME.test(name)) {
      removed.add(item.GrCod);
    }
  });
  // also drop every descendant of a removed menu
  let changed = true;
  while (changed) {
    changed = false;
    items.forEach((item) => {
      if (item.UpGrp && removed.has(item.UpGrp) && !removed.has(item.GrCod)) {
        removed.add(item.GrCod);
        changed = true;
      }
    });
  }
  return items.filter((item) => !removed.has(item.GrCod));
};

export const useAccountingNavigation = () => {
  const [rawMenuData, setRawMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);


        const storedMenus = localStorage.getItem("menu_details");


        if (storedMenus) {
          const parsedMenus = JSON.parse(storedMenus);


          if (Array.isArray(parsedMenus) && parsedMenus.length > 0) {
            setRawMenuData(filterRemovedMenus(parsedMenus));
            setLoading(false);
            return;
          }
        }

        // Devotee (permission-free user) ke liye admin-only menu API call hi
        // mat karo - 403 aayega. Seedha khaali navigation do.
        try {
          const storedUser = JSON.parse(localStorage.getItem("amt_user") || "null");
          const dsg = storedUser?.designation
            || storedUser?.apiUserData?.employee?.personal_profile?.designation;
          const label = dsg?.Dsg_Desc || dsg?.Dsg_Title || storedUser?.role || "";
          if (["devotee", "ભક્ત", "devot"].includes(String(label).trim().toLowerCase())) {
            setRawMenuData([]);
            setLoading(false);
            return;
          }
        } catch {
          // ignore parse error, proceed to fetch
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`, {
          method: 'GET', 
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }


        const data = await response.json();


        if (data.status ==  "success") {
          const visibleMenuData = data.data.filter(item => {
            return item.isvisible == 1;
          });
          localStorage.setItem("menu_details", JSON.stringify(visibleMenuData));
          setRawMenuData(filterRemovedMenus(visibleMenuData || []));
        } else {
          throw new Error(data.message || "Failed to fetch menu data");
        }
      } catch (error) {
        console.error("Error loading navigation:", error);
        setError(error.message);
        setRawMenuData([]);
      } finally {
        setLoading(false);
      }
    };


    loadMenuData();
  }, []);


  const normalizePath = (path) => {
    if (!path) return "#";


    let normalized = path.trim();


    normalized = normalized.replace(/\\\//g, '/');


    if (normalized && !normalized.startsWith('/') && normalized != '#') {
      normalized = '/' + normalized;
    }


    return normalized;
  };


  const getIconForMenu = (menuName, level) => {
    if (!menuName) return Icons.FileText;


    const name = menuName.toLowerCase();


    const iconMap = {
      "dashboard": Icons.Home,
      "masters": Icons.Database,
      "settings": Icons.Settings,
      "general": Icons.Settings,
      "apps": Icons.Briefcase,
      "roles": Icons.Shield,
      "menu": Icons.Menu,
      "hrms": Icons.Users,
      "fas": Icons.Calculator,
      "pdr": Icons.Map,
      "hsm": Icons.Home,
      "user": Icons.Users,
      "profile": Icons.User,
      "organization": Icons.Building,
      "branch": Icons.GitBranch,
      "division": Icons.Layers,
      "department": Icons.Building,
      "zone": Icons.Map,
      "ward": Icons.MapPin,
      "ccc": Icons.Home,
      "statistics": Icons.BarChart,
      "authorities": Icons.Shield,
      "role": Icons.Shield,
      "permission": Icons.Lock,
      "logbook": Icons.BookOpen,
      "configuration": Icons.Settings,
      "debt": Icons.CreditCard,
      "fund": Icons.PiggyBank,
      "grant": Icons.Award,
      "scheme": Icons.Package,
      "tax": Icons.Percent,
      "grouping": Icons.FolderTree,
      "ledger": Icons.BookOpen,
      "sub ledger": Icons.Layers,
      "company": Icons.Building,
      "home": Icons.Home,
      "master": Icons.Database
    };


    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key)) {
        return icon;
      }
    }


    if (level ==  "1") return Icons.Folder;
    if (level ==  "2") return Icons.Folder;
    if (level ==  "3") return Icons.File;
    if (level ==  "4") return Icons.FileText;


    return Icons.FileText;
  };


 const navItems = useMemo(() => {
  if (!Array.isArray(rawMenuData) || rawMenuData.length ==  0) {
    return [];
  }


  console.log("rawMenuData (original backend order):", rawMenuData);


  const buildHierarchy = () => {
    // Step 1: First pass - Create all nodes
    const nodeMap = new Map();
   
    rawMenuData.forEach(item => {
      nodeMap.set(item.GrCod, {
        Fnc_Id: item.Fnc_Id,
        Fnc_Desc: item.Fnc_Desc || item.title || 'Untitled',
        path: item.Menu_Links ? normalizePath(item.Menu_Links) : null,
        icon: getIconForMenu(item.Fnc_Desc || item.title, item.GrStt),
        GrStt: item.GrStt,
        GrCod: item.GrCod,
        UpGrp: item.UpGrp,
        GrSrn: item.GrSrn,
        children: [],
        originalIndex: item.index || item.Fnc_Id || 0, // Preserve original order
      });
    });


    // Step 2: Build hierarchy preserving order
    const topLevelItems = [];
    const processedNodes = new Set();


    // Process nodes in original backend order
    rawMenuData.forEach(item => {
      const node = nodeMap.get(item.GrCod);
      if (!node || processedNodes.has(node.GrCod)) return;


      if (node.GrStt ==  "1") {
        // Top level item - add in original order
        topLevelItems.push(node);
        processedNodes.add(node.GrCod);
      } else if (node.UpGrp) {
        // Child item - find parent and add to children in original order
        const parent = nodeMap.get(node.UpGrp);
        if (parent && !parent.children.some(child => child.GrCod ==  node.GrCod)) {
          parent.children.push(node);
          processedNodes.add(node.GrCod);
        }
      }
    });


    // Step 3: Recursively sort children ONLY if needed (based on GrSrn if provided)
    const sortChildrenIfNeeded = (items) => {
      // Check if any item has GrSrn that's different from backend order
      const hasGrSrnOrdering = items.some(item => item.GrSrn && parseInt(item.GrSrn) != 0);
     
      if (hasGrSrnOrdering) {
        // Sort by GrSrn if explicitly provided
        items.sort((a, b) => {
          const srnA = parseInt(a.GrSrn) || 0;
          const srnB = parseInt(b.GrSrn) || 0;
          return srnA - srnB;
        });
      }
     
      // Recursively process children
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortChildrenIfNeeded(item.children);
        }
      });
    };


    // Optional: Only sort if GrSrn values are meaningful
    // sortChildrenIfNeeded(topLevelItems);


    return topLevelItems;
  };


  const convertToNavItems = (items) => {
    return items.map(item => {
      const uniqueKey = `menu-${item.GrCod}-${item.Fnc_Id}`;


      let finalPath = item.path;
      if (!finalPath || finalPath ==  '#') {
        if (item.children.length ==  0) {
          finalPath = `#${uniqueKey}`;
        } else {
          finalPath = `#${uniqueKey}`;
        }
      }


      const navItem = {
        key: uniqueKey,
        path: finalPath,
        label: item.Fnc_Desc,
        icon: item.icon,
        description: item.Fnc_Desc,
        level: parseInt(item.GrStt) || 1,
        originalData: {
          Fnc_Id: item.Fnc_Id,
          GrCod: item.GrCod,
          GrStt: item.GrStt,
          UpGrp: item.UpGrp,
          GrSrn: item.GrSrn
        }
      };


      if (item.children && item.children.length > 0) {
        // Don't sort children - preserve order from hierarchy building
        navItem.subItems = convertToNavItems(item.children);
      }


      return navItem;
    });
  };


  const hierarchy = buildHierarchy();
  const result = convertToNavItems(hierarchy);
 
  console.log("Final navItems (preserved order):", result.map(r => r.label));
 
  return result;
}, [rawMenuData]);


  useEffect(() => {
    if (!loading && navItems.length > 0) {
      const printHierarchy = (items, depth = 0) => {
        items.forEach(item => {
          const indent = ' '.repeat(depth * 2);


          if (item.subItems && item.subItems.length > 0) {
            printHierarchy(item.subItems, depth + 1);
          }
        });
      };
      printHierarchy(navItems);
    }
  }, [navItems, loading]);


  return {
    navItems,
    loading,
    error
  };
};

