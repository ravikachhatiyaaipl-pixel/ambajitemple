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
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Key,
  ShieldCheck,
  Heart,
  Store,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const Registration = () => {
  const [formData, setFormData] = useState({
    Usr_Name: "",
    Usr_Email: "",
    Usr_Mobile: "",
    Usr_Pas: "",
    Usr_Pas_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("devotee");

  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Department selection removed from registration - admin will map departments later.

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber == 1) {
      if (!formData.Usr_Name?.trim()) {
        newErrors.Usr_Name = "Username is required";
      } else if (formData.Usr_Name.length > 50) {
        newErrors.Usr_Name = "Maximum 50 characters allowed";
      }

      if (!formData.Usr_Email?.trim()) {
        newErrors.Usr_Email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Usr_Email)) {
        newErrors.Usr_Email = "Invalid email format";
      } else if (formData.Usr_Email.length > 100) {
        newErrors.Usr_Email = "Maximum 100 characters allowed";
      }

      if (!formData.Usr_Mobile?.trim()) {
        newErrors.Usr_Mobile = "Mobile number is required";
      } else if (formData.Usr_Mobile.length > 15) {
        newErrors.Usr_Mobile = "Maximum 15 characters allowed";
      }
    }

    if (stepNumber == 2) {
      if (!formData.Usr_Pas?.trim()) {
        newErrors.Usr_Pas = "Password is required";
      } else if (formData.Usr_Pas.length < 8) {
        newErrors.Usr_Pas = "Minimum 8 characters required";
      }
      if (!formData.Usr_Pas_confirmation?.trim()) {
        newErrors.Usr_Pas_confirmation = "Confirm password is required";
      } else if (formData.Usr_Pas != formData.Usr_Pas_confirmation) {
        newErrors.Usr_Pas_confirmation = "Passwords do not match";
      }
    }

    if (stepNumber == 3) {
      if (!acceptTerms) {
        newErrors.terms = "You must accept the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setFormData((prev) => ({
      ...prev,
      Usr_Pas: password,
      Usr_Pas_confirmation: password,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);

    const result = await Swal.fire({
      title: "Create Account?",
      text: "Are you sure you want to create this account?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E53935",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, create account!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      setIsLoading(false);
      return;
    }

    try {
      const submitData = {
        Usr_Name: formData.Usr_Name,
        Usr_Email: formData.Usr_Email,
        Usr_Mobile: formData.Usr_Mobile,
        Usr_Pas: formData.Usr_Pas,
        Usr_Pas_confirmation: formData.Usr_Pas_confirmation,
        user_type: userType,
      };

      // Public endpoint - no auth token needed (new user is not logged in).
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        submitData
      );

      if (response.data.success) {
        const isApplicant = userType === "applicant";
        Swal.fire({
          title: "Registration Successful!",
          html: `
            <div class="text-left">
              <p class="mb-3">Your account has been created successfully!</p>
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p class="text-sm text-red-800"><strong>Username:</strong> ${formData.Usr_Name}</p>
                <p class="text-sm text-red-800"><strong>Email:</strong> ${formData.Usr_Email}</p>
                <p class="text-sm text-red-800"><strong>Registered as:</strong> ${isApplicant ? "Applicant (Shop Application)" : "Devotee"}</p>
              </div>
              <p class="text-sm text-gray-600">You can now login with your credentials.</p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#E53935",
          confirmButtonText: "Proceed to Login",
        }).then(() => {
          navigate("/login");
        });
      } else {
        toast.error(
          response.data.message || "Registration failed. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error creating account:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Account", icon: User },
    { number: 2, title: "Security", icon: Lock },
    { number: 3, title: "Terms", icon: Check },
  ];

  const stepHeadings = [
    {
      title: "Create your account",
      subtitle: "Enter your basic details to get started.",
    },
    {
      title: "Set your password",
      subtitle: "Choose a strong password to protect your account.",
    },
    {
      title: "Review & accept terms",
      subtitle: "Please read the terms before creating your account.",
    },
  ];

  // Shared styling helpers
  const labelCls = "block text-sm font-medium text-white mb-1.5";
  const hintCls = "mt-1.5 text-xs text-white/70";
  const inputCls = (hasError, rightPad = "pr-4") =>
    `block w-full h-12 pl-11 ${rightPad} rounded-lg border bg-white/15 text-sm text-white placeholder-white/60 transition-colors focus:outline-none focus:ring-2 ${hasError
      ? "border-red-300 focus:ring-red-200/40 focus:border-red-300"
      : "border-white/40 hover:border-white/60 focus:ring-white/30 focus:border-white"
    }`;
  const iconWrapCls =
    "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";
  const iconCls = "h-[18px] w-[18px] text-white/70";

  const FieldError = ({ message }) =>
    message ? (
      <p className="mt-1.5 text-xs text-red-200 flex items-center">
        <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        {message}
      </p>
    ) : null;

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ---------- Background image (put Ambaji-Temple.jpg in /public) ---------- */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Golden Shikhara.png')" }}
      ></div>
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/55 via-black/30 to-[#B71C1C]/40"></div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 xl:gap-20 px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
        {/* ---------- Left: branding text (desktop only) ---------- */}
        {!isMobile && (
          <div className="flex-1 max-w-xl text-white">
            <img
              src="/ambajilogo.png"
              alt="Shree Ambaji Mata Temple"
              className="h-35 w-35 xl:h-35 xl:w-35 object-contain mb-6 drop-shadow-lg"
            />
            <h1 className="text-4xl xl:text-4xl font-semibold leading-tight">
              Shree Ambaji Mata
              <br />
              Temple Trust Management
            </h1>

          </div>
        )}

        {/* ---------- Right: form card ---------- */}
        <div className="w-full max-w-[480px]">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 sm:p-8">
            {/* Mobile brand header */}
            {isMobile && (
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-11 w-11 bg-gradient-to-br from-[#E53935] to-[#B71C1C] rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white leading-tight">
                    AMT Portal
                  </h1>
                  <p className="text-sm text-white/80 leading-tight">
                    Ambaji Mata Temple
                  </p>
                </div>
              </div>
            )}

            {/* Stepper */}
            <ol className="flex items-center mb-8" aria-label="Progress">
              {steps.map((stepItem, index) => {
                const done = step > stepItem.number;
                const active = step == stepItem.number;
                return (
                  <li
                    key={stepItem.number}
                    className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${done || active
                            ? "bg-[#E53935] text-white"
                            : "bg-white/10 text-white/80 border border-white/40"
                          } ${active ? "ring-4 ring-white/30" : ""}`}
                      >
                        {done ? <Check className="h-4 w-4" /> : stepItem.number}
                      </span>
                      <span
                        className={`text-sm font-medium ${active || done ? "text-white" : "text-white/70"
                          }`}
                      >
                        {stepItem.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-3 ${done ? "bg-[#E53935]" : "bg-white/30"
                          }`}
                      ></div>
                    )}
                  </li>
                );
              })}
            </ol>

            {/* Card */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {stepHeadings[step - 1].title}
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  {stepHeadings[step - 1].subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {step == 1 && (
                  <>
                    <div>
                      <label className={labelCls}>Register as *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setUserType("devotee")}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            userType === "devotee"
                              ? "border-red-600 bg-red-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Heart className={`h-5 w-5 ${userType === "devotee" ? "text-red-600" : "text-gray-400"}`} />
                            <span className={`font-semibold text-sm ${userType === "devotee" ? "text-red-700" : "text-gray-700"}`}>
                              Devotee
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Bhakt / devotee login
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setUserType("applicant")}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            userType === "applicant"
                              ? "border-red-600 bg-red-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Store className={`h-5 w-5 ${userType === "applicant" ? "text-red-600" : "text-gray-400"}`} />
                            <span className={`font-semibold text-sm ${userType === "applicant" ? "text-red-700" : "text-gray-700"}`}>
                              Applicant
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Shop / rental application
                          </p>
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {userType === "applicant"
                          ? "Aap shop rental ke liye apply kar sakte ho."
                          : "Aap devotee portal me login kar sakte ho."}
                      </p>
                    </div>

                    <div>
                      <label className={labelCls}>Username *</label>
                      <div className="relative">
                        <div className={iconWrapCls}>
                          <User className={iconCls} />
                        </div>
                        <input
                          type="text"
                          name="Usr_Name"
                          value={formData.Usr_Name}
                          onChange={handleInputChange}
                          className={inputCls(errors.Usr_Name)}
                          placeholder="Enter username"
                          maxLength={50}
                          autoComplete="off"
                        />
                      </div>
                      <FieldError message={errors.Usr_Name} />
                      {!errors.Usr_Name && (
                        <p className={hintCls}>
                          Unique username for login (max 50 characters)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Email address *</label>
                      <div className="relative">
                        <div className={iconWrapCls}>
                          <Mail className={iconCls} />
                        </div>
                        <input
                          type="email"
                          name="Usr_Email"
                          value={formData.Usr_Email}
                          onChange={handleInputChange}
                          className={inputCls(errors.Usr_Email)}
                          placeholder="name@example.com"
                          maxLength={100}
                          autoComplete="off"
                        />
                      </div>
                      <FieldError message={errors.Usr_Email} />
                      {!errors.Usr_Email && (
                        <p className={hintCls}>
                          Your email address (max 100 characters)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Mobile number *</label>
                      <div className="relative">
                        <div className={iconWrapCls}>
                          <Phone className={iconCls} />
                        </div>
                        <input
                          type="tel"
                          name="Usr_Mobile"
                          value={formData.Usr_Mobile}
                          onChange={handleInputChange}
                          className={inputCls(errors.Usr_Mobile)}
                          placeholder="+911234567890"
                          maxLength={15}
                          autoComplete="off"
                        />
                      </div>
                      <FieldError message={errors.Usr_Mobile} />
                      {!errors.Usr_Mobile && (
                        <p className={hintCls}>
                          Include country code, e.g. +91
                        </p>
                      )}
                    </div>
                  </>
                )}

                {step == 2 && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-white">
                          Password *
                        </label>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="inline-flex items-center text-sm font-medium text-red-200 hover:text-white transition-colors"
                        >
                          <Key className="h-4 w-4 mr-1.5" />
                          Generate password
                        </button>
                      </div>
                      <div className="relative">
                        <div className={iconWrapCls}>
                          <Lock className={iconCls} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="Usr_Pas"
                          value={formData.Usr_Pas}
                          onChange={handleInputChange}
                          className={inputCls(errors.Usr_Pas, "pr-11")}
                          placeholder="Enter password"
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-[18px] w-[18px] text-white/70 hover:text-white" />
                          ) : (
                            <Eye className="h-[18px] w-[18px] text-white/70 hover:text-white" />
                          )}
                        </button>
                      </div>
                      <FieldError message={errors.Usr_Pas} />
                      {!errors.Usr_Pas && (
                        <p className={hintCls}>
                          Minimum 8 characters with letters, numbers and special
                          characters
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Confirm password *</label>
                      <div className="relative">
                        <div className={iconWrapCls}>
                          <Lock className={iconCls} />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="Usr_Pas_confirmation"
                          value={formData.Usr_Pas_confirmation}
                          onChange={handleInputChange}
                          className={inputCls(
                            errors.Usr_Pas_confirmation,
                            "pr-11",
                          )}
                          placeholder="Re-enter password"
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-[18px] w-[18px] text-white/70 hover:text-white" />
                          ) : (
                            <Eye className="h-[18px] w-[18px] text-white/70 hover:text-white" />
                          )}
                        </button>
                      </div>
                      <FieldError message={errors.Usr_Pas_confirmation} />
                    </div>
                  </>
                )}

                {step == 3 && (
                  <>
                    <div className="rounded-lg border border-white/30 bg-black/20 p-4">
                      <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">
                            1. Account usage
                          </h4>
                          <p className="text-xs text-white/80 leading-relaxed">
                            You are responsible for keeping your account and
                            password confidential, and for notifying us
                            immediately of any unauthorised use.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">
                            2. Data privacy
                          </h4>
                          <p className="text-xs text-white/80 leading-relaxed">
                            We collect and process your data in accordance with
                            our Privacy Policy. Your personal information is
                            protected and encrypted.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">
                            3. Service usage
                          </h4>
                          <p className="text-xs text-white/80 leading-relaxed">
                            You agree to use the portal only for lawful
                            purposes. Misuse of the system may result in account
                            termination.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-1">
                            4. Device registration
                          </h4>
                          <p className="text-xs text-white/80 leading-relaxed">
                            First login requires device approval for security.
                            Unauthorised device access will be blocked.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start">
                        <input
                          id="accept-terms"
                          name="accept-terms"
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="h-4 w-4 text-[#E53935] focus:ring-[#E53935] border-gray-300 rounded mt-0.5"
                        />
                        <label
                          htmlFor="accept-terms"
                          className="ml-3 block text-sm text-white"
                        >
                          I have read and agree to the Terms & Conditions and
                          Privacy Policy
                        </label>
                      </div>
                      <FieldError message={errors.terms} />
                    </div>

                    <div className="flex items-start rounded-lg border border-amber-300/40 bg-amber-500/20 p-3.5">
                      <ShieldCheck className="h-5 w-5 text-amber-300 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-xs text-amber-100 leading-relaxed">
                        Your account needs device approval on first login. Use a
                        trusted device when you sign in.
                      </p>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 h-12 flex justify-center items-center px-4 border border-white/40 rounded-lg text-sm font-semibold text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 h-12 flex justify-center items-center px-4 rounded-lg text-sm font-semibold text-white bg-[#E53935] hover:bg-[#C62828] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E53935] transition-colors"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex-1 h-12 flex justify-center items-center px-4 rounded-lg text-sm font-semibold text-white bg-[#E53935] hover:bg-[#C62828] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E53935] transition-colors ${isLoading ? "opacity-75 cursor-not-allowed" : ""
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
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Sign-in link (now on desktop too) */}
            <p className="text-center text-sm text-white/80 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-red-200 hover:text-white"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Aark InfoSoft Pvt Ltd. All rights
        reserved.
      </footer>
    </div>
  );
};

export default Registration;
