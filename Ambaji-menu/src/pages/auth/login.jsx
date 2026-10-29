// /***
//  *
//  *  Application Name: I3EMS
//  *
//  *  Developed By: Aark InfoSoft Pvt Ltd.
//  *
//  *  Version: Ambaji Mata Temple Management
//  *
//  *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
//  *  All source code, database structures, UI/UX designs, workflows,
//  *  business logic, and documentation are confidential intellectual property.
//  *  Reverse engineering, duplication, or redistribution without written permission
//  *  is strictly prohibited and may result in legal action.
//  *
//  */

// import { useState, useEffect } from "react";
// import { useNavigate, Link, useLocation } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import { Eye, EyeOff } from "lucide-react";
// import axios from "axios";

// const Login = ({ onLogin, initialError }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState(initialError || "");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
//   const [departmentsList, setDepartmentsList] = useState([]);
//   const [pendingLoginData, setPendingLoginData] = useState(null);
  
//   useEffect(() => {
//     if (location.state?.error) {
//       setError(location.state.error);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
//     checkScreenSize();
//     window.addEventListener("resize", checkScreenSize);
//     return () => window.removeEventListener("resize", checkScreenSize);
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_API_URL}/login`,
//         {
//           username: username.trim(),
//           password: password,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//         },
//       );

//       if (response.data && response.data.success == true) {
//         const userData = response.data.data?.user;
//         const sessionData = response.data.data?.session;
//         if (!userData) {
//           throw new Error("User data not found in response");
//         }

//         handleSuccessfulLogin(userData, sessionData, response.data);
//       } else {
//         setIsLoading(false);
//         const errorMsg = response.data?.message || "Invalid credentials";
//         setError(errorMsg);
//         toast.error(errorMsg);
//       }
//     } catch (error) {
//       setIsLoading(false);

//       if (error.response) {
//         const serverError = error.response.data;
//         if (serverError?.message) {
//           setError(serverError.message);
//           toast.error(serverError.message);
//         } else if (error.response.status == 401) {
//           setError("Invalid username or password");
//           toast.error("Invalid username or password");
//         } else if (error.response.status == 422) {
//           setError("Validation error. Please check your input.");
//           toast.error("Validation error. Please check your input.");
//         } else if (error.response.status == 500) {
//           setError("Server error. Please try again later.");
//           toast.error("Server error. Please try again later.");
//         } else {
//           setError(`Login failed (Status: ${error.response.status})`);
//           toast.error(`Login failed (Status: ${error.response.status})`);
//         }
//       } else if (error.request) {
//         setError("Network error. Please check your internet connection.");
//         toast.error("Network error. Please check your internet connection.");
//       } else {
//         setError(error.message || "Login failed. Please try again.");
//         toast.error(error.message || "Login failed. Please try again.");
//       }
//     }
//   };

//   const handleSuccessfulLogin = async (userData, sessionData, responseData) => {
//     try {
//       const allowedMenus = responseData.data?.allowed_menus || [];
//       const allDepartments = responseData.data?.all_departments || [];
      
//       // Store necessary data in state for department selection
//       setPendingLoginData({
//         userData,
//         sessionData,
//         responseData,
//         allowedMenus
//       });
      
//       // Check if user has multiple departments
//       if (allDepartments.length > 1) {
//         setDepartmentsList(allDepartments);
//         setShowDepartmentDialog(true);
//         setIsLoading(false); // Stop loading while waiting for selection
//       } else if (allDepartments.length == 1) {
//         // Single department - use it directly
//         const departmentToStore = allDepartments[0];
//         completeLogin(userData, sessionData, responseData, allowedMenus, departmentToStore, allDepartments);
//       } else {
//         completeLogin(userData, sessionData, responseData, allowedMenus, allDepartments, allDepartments);

//       }
//     } catch (error) {
//       setIsLoading(false);
//       setError("Error during login. Please try again.");
//       toast.error("Error during login. Please try again.");
//     }
//   };
  
//   // Complete the login process with selected department
//   const completeLogin = (userData, sessionData, responseData, allowedMenus, selectedDepartment, allDepartments) => {
//     if (sessionData?.token) {
//       localStorage.setItem("auth_token", sessionData.token);
//       localStorage.setItem("user_data", JSON.stringify(userData));
//       localStorage.setItem("session_data", JSON.stringify(sessionData));
//       localStorage.setItem("isAuthenticated", "true");
//       localStorage.setItem("username", userData.Usr_Name);
//       localStorage.setItem("menu_details", JSON.stringify(allowedMenus));
//       localStorage.setItem("amt_department", JSON.stringify(selectedDepartment));
//       localStorage.setItem("all_departments", JSON.stringify(allDepartments));
      
//       axios.defaults.headers.common["Authorization"] = `Bearer ${sessionData.token}`;
//     }
    
//     if (!onLogin || typeof onLogin !=  "function") {
//       toast.success("Login successful!");
//       setTimeout(() => {
//         navigate("/dashboard");
//       }, 1000);
//       return;
//     }
    
//     const result = onLogin(userData.Usr_Name, password, {
//       user: userData,
//       session: sessionData,
//       token: sessionData?.token,
//       allowed_menus: allowedMenus,
//       department: selectedDepartment, // Single selected department
//       all_departments: allDepartments // All departments array
//     });
    
//     if (result && typeof result.then == "function") {
//       result.then(
//         (resolvedResult) => {
//           if (resolvedResult && resolvedResult.success !=  false) {
//             const currentDateTime = new Date();
//             localStorage.setItem("login_date", JSON.stringify(currentDateTime));
//             console.log("currentDateTime",currentDateTime);
//             toast.success("Login successful!");
//             setTimeout(() => {
//               navigate("/dashboard");
//             }, 1000);
//           } else {
//             setIsLoading(false);
//             const errorMsg = resolvedResult?.message || "Login failed. Please try again.";
//             setError(errorMsg);
//             toast.error(errorMsg);
//           }
//         },
//         (error) => {
//           setIsLoading(false);
//           setError("Login failed. Please try again.");
//           toast.error("Login failed. Please try again.");
//         }
//       );
//     } else {
//       if (result && result.success !=  false) {
//         const currentDateTime = new Date();
//         localStorage.setItem("login_date", JSON.stringify(currentDateTime));
//         console.log("currentDateTime1",currentDateTime);
//         toast.success("Login successful!");
//         setTimeout(() => {
//           navigate("/dashboard");
//         }, 1000);
//       } else {
//         setIsLoading(false);
//         const errorMsg = result?.message || "Login failed. Please try again.";
//         setError(errorMsg);
//         toast.error(errorMsg);
//       }
//     }
//   };
  
//   // Handle department selection from dialog
//   const handleDepartmentSelect = (selectedDept) => {
//     setShowDepartmentDialog(false);
    
//     if (!selectedDept) {
//       // User cancelled - show error
//       setError("Department selection is required to login.");
//       toast.error("Please select a department to continue.");
//       setIsLoading(false);
//       return;
//     }
    
//     const { userData, sessionData, responseData, allowedMenus } = pendingLoginData;
//     const allDepartments = departmentsList;
    
//     completeLogin(userData, sessionData, responseData, allowedMenus, selectedDept, allDepartments);
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative"
//       style={{
//         backgroundImage: "url('/aarks.jpg')",
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundAttachment: "fixed",
//       }}
//     >
//       <div className="absolute inset-0 bg-gray-300/20 z-0"></div>
//       <div className="relative w-full max-w-6xl h-auto lg:h-[640px] flex items-center justify-center">
//         {!isMobile && (
//           <div
//             className="
//     absolute left-0 top-1/2 -translate-y-1/2
//     w-[400px] lg:w-[520px] h-[400px] lg:h-[520px]
//     bg-gradient-to-br from-blue-500 to-indigo-600
//     rounded-xl
//     shadow-[20px_0_40px_rgba(229, 57, 53,0.45)]
//     p-6 lg:p-10 text-white
//     z-20
//     flex flex-col justify-between bg-cover bg-center bg-no-repeat bg-fixed
//     hidden md:block
//   "
//             style={{
//               backgroundImage: "url('/aarks.jpg')",
//             }}
//           >
//             <div>
//               <img
//                 src="/Aark_Symbol.png"
//                 className="h-10 lg:h-14 mb-6 lg:mb-10"
//                 alt="AARK"
//               />

//               <div className="flex items-center justify-center min-h-[280px]">
//                 <div className="relative">
//                   <img
//                     src="/I3.png"
//                     alt="I³ Logo"
//                     className="
//         w-58 h-48 lg:w-56 lg:h-60
//         object-contain
//         drop-shadow-[0_8px_32px_rgba(229, 57, 53,0.6)]
//         relative z-10
//       "
//                   />

//                   <div className="absolute inset-0 z-20 flex">
//                     <div className="w-20 h-48 lg:w-27 lg:h-56"></div>

//                     <div className="flex flex-col -mb-1 justify-center font-normal tracking-wide ml-1">
//                       <span className="text-sm lg:text-sm  ">Integrated</span>
//                       <span className="text-sm lg:text-sm ">Intelligent</span>
//                       <span className="text-sm lg:text-sm">Identified</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div
//           className="
//       w-full lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2
//       max-w-md lg:max-w-2xl
//       bg-white h-auto lg:h-[600px]
//       rounded-xl shadow-xl
//       px-6 sm:px-8 lg:px-16 py-8 sm:py-10 lg:py-14
//       z-10
//       flex items-center justify-center
//       mx-auto lg:mx-0
//     "
//         >
//           <div className="w-full h-full flex flex-col justify-center">
//             <h2 className="text-2xl sm:text-3xl font-semibold text-blue-900 mb-2 text-center lg:text-left">
//               Welcome
//             </h2>

//             {error && (
//               <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
//               <div>
//                 <label className="text-xs text-gray-500 font-medium">
//                   EMAIL / MOBILE NUMBER
//                 </label>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                   className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base"
//                   placeholder="Enter Email / Phone Number"
//                 />
//               </div>

//               <div>
//                 <div className="relative mt-1">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base"
//                     placeholder="Enter password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3 text-gray-400"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="
//               w-full py-3 rounded-lg text-white font-semibold text-sm sm:text-base
//               bg-gradient-to-tr from-blue-900 to-blue-500
//               hover:opacity-90 transition
//               disabled:opacity-70
//             "
//               >
//                 {isLoading ? "Signing in..." : "LOGIN"}
//               </button>
//             </form>

//             <p className="text-center text-sm text-gray-500 mt-6 lg:mt-8">
//               Don't have an account?{" "}
//               <Link to="/registration" className="text-blue-500 font-medium">
//                 Sign up
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>

//       {showDepartmentDialog && (
//   <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
//     <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-6 p-8">
//       <h3 className="text-2xl font-bold text-gray-900 mb-3">Select Department</h3>
//       <p className="text-gray-600 mb-6 text-base">
//         You have access to multiple departments. Please select one to continue:
//       </p>
//       <div className="space-y-3 max-h-[500px] overflow-y-auto mb-6">
//         {departmentsList.map((dept) => (
//           <button
//             key={dept.Dpt_id}
//             onClick={() => handleDepartmentSelect(dept)}
//             className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
//           >
//             <div className="font-semibold text-gray-900 text-base">{dept.Dpt_Name}</div>
//             <div className="text-sm text-gray-500 mt-1">{dept.Dpt_Desc || 'No description available'}</div>
//           </button>
//         ))}
//       </div>
//       <button
//         onClick={() => handleDepartmentSelect(null)}
//         className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 font-medium text-base border-t border-gray-100 mt-2 pt-4 hover:bg-gray-50 rounded-lg transition-colors"
//       >
//         Cancel
//       </button>
//     </div>
//   </div>
// )}
//     </div>
    
//   );
// };

// export default Login;


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

import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, User, Lock, AlertCircle } from "lucide-react";
import axios from "axios";

const Login = ({ onLogin, initialError }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialError || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  // Admin ko department select nahi karna hai - track karne ke liye
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [pendingLoginData, setPendingLoginData] = useState(null);

  // Devotee / Applicant users ke liye apna-apna dashboard
  const getPublicUserDashboard = () => {
    const storedUser = JSON.parse(localStorage.getItem("amt_user") || "null");
    const dsg =
      storedUser?.designation ||
      storedUser?.apiUserData?.designation ||
      storedUser?.apiUserData?.employee?.personal_profile?.designation;
    const label = String(dsg?.Dsg_Desc || dsg?.Dsg_Title || "")
      .trim()
      .toLowerCase();

    if (["devotee", "ભક્ત", "devot"].includes(label)) return "/devotee-dashboard";
    if (["applicant", "અરજીદાર", "આવેદક"].includes(label)) return "/applicant-dashboard";
    return "/dashboard";
  };

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          username: username.trim(),
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.data && response.data.success == true) {
        const userData = response.data.data?.user;
        const sessionData = response.data.data?.session;
        if (!userData) {
          throw new Error("User data not found in response");
        }

        handleSuccessfulLogin(userData, sessionData, response.data);
      } else {
        setIsLoading(false);
        const errorMsg = response.data?.message || "Invalid credentials";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      setIsLoading(false);

      if (error.response) {
        const serverError = error.response.data;
        if (serverError?.message) {
          setError(serverError.message);
          toast.error(serverError.message);
        } else if (error.response.status == 401) {
          setError("Invalid username or password");
          toast.error("Invalid username or password");
        } else if (error.response.status == 422) {
          setError("Validation error. Please check your input.");
          toast.error("Validation error. Please check your input.");
        } else if (error.response.status == 500) {
          setError("Server error. Please try again later.");
          toast.error("Server error. Please try again later.");
        } else {
          setError(`Login failed (Status: ${error.response.status})`);
          toast.error(`Login failed (Status: ${error.response.status})`);
        }
      } else if (error.request) {
        setError("Network error. Please check your internet connection.");
        toast.error("Network error. Please check your internet connection.");
      } else {
        setError(error.message || "Login failed. Please try again.");
        toast.error(error.message || "Login failed. Please try again.");
      }
    }
  };

  const handleSuccessfulLogin = async (userData, sessionData, responseData) => {
    try {
      const allowedMenus = responseData.data?.allowed_menus || [];
      const allDepartments = responseData.data?.all_departments || [];

      // Admin ko department select karne ki zarurat NAHI hai -
      // uske paas already all menus hain.
      const isAdminUser =
        responseData.data?.is_admin === true ||
        parseInt(userData?.Usr_Role_Id) === 1 ||
        parseInt(responseData.data?.user?.Usr_Role_Id) === 1;

      // Store necessary data in state for department selection
      setPendingLoginData({
        userData,
        sessionData,
        responseData,
        allowedMenus,
      });

      if (isAdminUser) {
        // Admin: seedha login, no department selection at all
        setIsAdminLogin(true);
        setShowDepartmentDialog(false);
        setDepartmentsList([]);
        completeLogin(userData, sessionData, responseData, allowedMenus, null, []);
        return;
      }

      setIsAdminLogin(false);

      // Check if user has multiple departments
      if (allDepartments.length > 1) {
        setDepartmentsList(allDepartments);
        setShowDepartmentDialog(true);
        setIsLoading(false); // Stop loading while waiting for selection
      } else if (allDepartments.length == 1) {
        // Single department - use it directly
        const departmentToStore = allDepartments[0];
        completeLogin(
          userData,
          sessionData,
          responseData,
          allowedMenus,
          departmentToStore,
          allDepartments,
        );
      } else {
        completeLogin(
          userData,
          sessionData,
          responseData,
          allowedMenus,
          allDepartments,
          allDepartments,
        );
      }
    } catch (error) {
      setIsLoading(false);
      setError("Error during login. Please try again.");
      toast.error("Error during login. Please try again.");
    }
  };

  // Complete the login process with selected department
  const completeLogin = (
    userData,
    sessionData,
    responseData,
    allowedMenus,
    selectedDepartment,
    allDepartments,
  ) => {
    if (sessionData?.token) {
      localStorage.setItem("auth_token", sessionData.token);
      localStorage.setItem("user_data", JSON.stringify(userData));
      localStorage.setItem("session_data", JSON.stringify(sessionData));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", userData.Usr_Name);
      localStorage.setItem("menu_details", JSON.stringify(allowedMenus));
      localStorage.setItem("amt_department", JSON.stringify(selectedDepartment));
      localStorage.setItem("all_departments", JSON.stringify(allDepartments));

      axios.defaults.headers.common["Authorization"] = `Bearer ${sessionData.token}`;
    }

    if (!onLogin || typeof onLogin != "function") {
      toast.success("Login successful!");
      setTimeout(() => {
        navigate(getPublicUserDashboard());
      }, 1000);
      return;
    }

    const result = onLogin(userData.Usr_Name, password, {
      user: userData,
      session: sessionData,
      token: sessionData?.token,
      allowed_menus: allowedMenus,
      department: selectedDepartment, // Single selected department
      all_departments: allDepartments, // All departments array
    });

    if (result && typeof result.then == "function") {
      result.then(
        (resolvedResult) => {
          if (resolvedResult && resolvedResult.success != false) {
            const currentDateTime = new Date();
            localStorage.setItem("login_date", JSON.stringify(currentDateTime));
            console.log("currentDateTime", currentDateTime);
            toast.success("Login successful!");
            setTimeout(() => {
              navigate(getPublicUserDashboard());
            }, 1000);
          } else {
            setIsLoading(false);
            const errorMsg =
              resolvedResult?.message || "Login failed. Please try again.";
            setError(errorMsg);
            toast.error(errorMsg);
          }
        },
        (error) => {
          setIsLoading(false);
          setError("Login failed. Please try again.");
          toast.error("Login failed. Please try again.");
        },
      );
    } else {
      if (result && result.success != false) {
        const currentDateTime = new Date();
        localStorage.setItem("login_date", JSON.stringify(currentDateTime));
        console.log("currentDateTime1", currentDateTime);
        toast.success("Login successful!");
        setTimeout(() => {
          navigate(getPublicUserDashboard());
        }, 1000);
      } else {
        setIsLoading(false);
        const errorMsg = result?.message || "Login failed. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  // Handle department selection from dialog
  const handleDepartmentSelect = (selectedDept) => {
    setShowDepartmentDialog(false);

    if (!selectedDept) {
      // User cancelled - show error
      setError("Department selection is required to login.");
      toast.error("Please select a department to continue.");
      setIsLoading(false);
      return;
    }

    const { userData, sessionData, responseData, allowedMenus } =
      pendingLoginData;
    const allDepartments = departmentsList;

    completeLogin(
      userData,
      sessionData,
      responseData,
      allowedMenus,
      selectedDept,
      allDepartments,
    );
  };

  // Shared styling helpers (same glass style as Registration)
  const labelCls = "block text-sm font-medium text-white mb-1.5";
  const inputCls = (rightPad = "pr-4") =>
    `block w-full h-12 pl-11 ${rightPad} rounded-lg border border-white/30 bg-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] text-sm text-white placeholder-white/60 transition-colors hover:bg-white/15 hover:border-white/50 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/30 focus:border-white/70 [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]`;
  const iconWrapCls =
    "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";
  const iconCls = "h-[18px] w-[18px] text-white/70";

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ---------- Background image (Golden Shikhara.png in /public) ---------- */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Golden Shikhara.png')" }}
      ></div>
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/55 via-black/30 to-[#B71C1C]/40"></div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 xl:gap-20 px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
        {/* ---------- Left: branding (desktop only) ---------- */}
        {!isMobile && (
          <div className="flex-1 max-w-xl text-white">
            <img
              src="/ambajilogo.png"
              alt="Shree Ambaji Mata Temple"
              className="h-[140px] w-[140px] object-contain mb-6 drop-shadow-lg"
            />
            <h1 className="text-4xl font-semibold leading-tight">
              Shree Ambaji Mata
              <br />
              Temple Trust Management
            </h1>
          </div>
        )}

        {/* ---------- Right: glass login card ---------- */}
        <div className="w-full max-w-[480px]">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8">
            {/* Mobile/tablet logo */}
            {isMobile && (
              <div className="flex flex-col items-center mb-6">
                <img
                  src="/ambajilogo.png"
                  alt="Shree Ambaji Mata Temple"
                  className="h-24 w-24 object-contain drop-shadow-lg"
                />
                <p className="mt-2 text-sm font-semibold text-white text-center">
                  Shree Ambaji Mata Temple Trust Management
                </p>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Welcome</h2>
              <p className="mt-1 text-sm text-white/80">
                Sign in to continue to your account.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start rounded-lg border border-red-300/40 bg-red-500/20 p-3.5 text-sm text-red-100">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelCls}>Email / mobile number</label>
                <div className="relative">
                  <div className={iconWrapCls}>
                    <User className={iconCls} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className={inputCls()}
                    placeholder="Enter email / phone number"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <div className={iconWrapCls}>
                    <Lock className={iconCls} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputCls("pr-11")}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px] text-white/70 hover:text-white" />
                    ) : (
                      <Eye className="h-[18px] w-[18px] text-white/70 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 flex justify-center items-center px-4 rounded-lg text-sm font-semibold text-white bg-[#E53935] hover:bg-[#C62828] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E53935] transition-colors ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/80 mt-6">
              Don't have an account?{" "}
              <Link
                to="/registration"
                className="font-semibold text-red-200 hover:text-white"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Aark InfoSoft Pvt Ltd. All rights
        reserved.
      </footer>

      {/* ---------- Department selection dialog ----------
          Admin (Usr_Role_Id = 1) ke liye kabhi show nahi hoga. */}
      {showDepartmentDialog &&
        departmentsList.length > 1 &&
        !isAdminLogin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Select Department
            </h3>
            <p className="text-gray-600 mb-6 text-base">
              You have access to multiple departments. Please select one to
              continue:
            </p>
            <div className="space-y-3 max-h-[500px] overflow-y-auto mb-6">
              {departmentsList.map((dept) => (
                <button
                  key={dept.Dpt_id}
                  onClick={() => handleDepartmentSelect(dept)}
                  className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="font-semibold text-gray-900 text-base">
                    {dept.Dpt_Name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {dept.Dpt_Desc || "No description available"}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => handleDepartmentSelect(null)}
              className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 font-medium text-base border-t border-gray-100 mt-2 pt-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
