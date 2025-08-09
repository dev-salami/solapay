/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Bank } from "@/interfaces";
import { Label } from "@/components/ui/label";
import { RegisterFormData } from "@/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import { useBusinessData, useToken } from "@/lib/utils";
// Type definitions

// Mock data
export const nigerianBanks: Bank[] = [
  { id: "044150", name: "Access Bank", code: "044" },
  { id: "070150", name: "Fidelity Bank", code: "070" },
  { id: "011150", name: "First Bank of Nigeria", code: "011" },
  { id: "058150", name: "Guaranty Trust Bank", code: "058" },
  { id: "030150", name: "Heritage Bank", code: "030" },
  { id: "082150", name: "Keystone Bank", code: "082" },
  { id: "076150", name: "Polaris Bank", code: "076" },
  { id: "221150", name: "Stanbic IBTC Bank", code: "221" },
  { id: "232150", name: "Sterling Bank", code: "232" },
  { id: "033150", name: "United Bank for Africa", code: "033" },
  { id: "215150", name: "Unity Bank", code: "215" },
  { id: "035150", name: "Wema Bank", code: "035" },
  { id: "057150", name: "Zenith Bank", code: "057" },
];

const businessTypes: string[] = [
  "Technology/Software",
  "E-commerce",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Agriculture",
  "Transportation",
  "Hospitality",
  "Construction",
  "Consulting",
  "Other",
];

// Mock account names for simulation
const mockAccountNames: string[] = [
  "Adebayo Johnson",
  "Chioma Okafor",
  "Ibrahim Mohammed",
  "Funmi Adeleke",
  "Emeka Nwosu",
  "Aisha Bello",
  "Tunde Ogundimu",
  "Grace Okoro",
  "Hassan Yusuf",
  "Blessing Udeh",
];

interface Step {
  title: string;
  content: React.ReactNode;
}

const BusinessRegistrationForm = () => {
  const { storeToken } = useToken();
  const { storeBusinessData } = useBusinessData();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    // Step 1: Business Details
    businessLogo: null,
    businessName: "",
    email: "",
    phone: "",
    address: "",
    businessType: "",

    // Step 2: Bank Details
    accountNumber: "",
    bankId: "",
    accountName: "",

    // Step 3: Authentication
    password: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof RegisterFormData,
    value: string | null
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange("businessLogo", e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateBankValidation = async (
    accountNumber: string,
    bankId: string
  ): Promise<string | null> => {
    if (accountNumber.length === 10 && bankId) {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const randomName =
        mockAccountNames[Math.floor(Math.random() * mockAccountNames.length)];
      handleInputChange("accountName", randomName);
      setIsLoading(false);
      return randomName;
    }
    return null;
  };

  const handleBankDetailsChange = async (
    field: "accountNumber" | "bankId",
    value: string
  ): Promise<void> => {
    handleInputChange(field, value);

    if (field === "accountNumber" || field === "bankId") {
      const currentAccountNumber =
        field === "accountNumber" ? value : formData.accountNumber;
      const currentBankId = field === "bankId" ? value : formData.bankId;

      if (currentAccountNumber.length === 10 && currentBankId) {
        await simulateBankValidation(currentAccountNumber, currentBankId);
      } else {
        handleInputChange("accountName", "");
      }
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(
          formData.businessName &&
          formData.email &&
          formData.phone &&
          formData.address &&
          formData.businessType
        );
      case 1:
        return !!(
          formData.accountNumber.length === 10 &&
          formData.bankId &&
          formData.accountName
        );
      case 2:
        return !!(
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword
        );
      default:
        return false;
    }
  };

  const handleNext = (): void => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handleBack = (): void => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (): Promise<void> => {
    if (validateStep(2)) {
      toast.loading("Registering your business...", { duration: 0 });

      try {
        const res = await axios.post("/api/business/auth/register", {
          ...formData,
          businessLogo:
            "https://res.cloudinary.com/drphqvmfe/image/upload/v1754203697/jeet/venmo-svgrepo-com_pvksx4.svg",
        });

        console.log("Registration Response:", res.data);
        setIsLoading(false);
        toast.dismiss();
        toast.success("Business registered successfully!", {
          duration: 3000,
        });
        storeToken(res.data.data.token);
        storeBusinessData(res.data.data.business);
        // res.data.data.token is the JWT token
        // res.data.data.business contains the business data
      } catch (error: any) {
        console.error("Registration error:", error);
        toast.dismiss();

        toast.error(
          error?.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    }
  };

  const containerVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.4, ease: [0.55, 0.06, 0.68, 0.19] },
    },
  };

  const stepVariants: Variants = {
    initial: { opacity: 0, x: 50 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.3, ease: [0.55, 0.06, 0.68, 0.19] },
    },
  };

  const steps: Step[] = [
    {
      title: "Business Details",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Business Logo</Label>
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.businessLogo ? (
                  <div className="w-full h-full relative overflow-hidden rounded-lg">
                    <Image
                      src={formData.businessLogo}
                      alt="Business Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs text-center">
                    Click to upload
                  </span>
                )}
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="business@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+234 xxx xxx xxxx"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="address">Address/Location *</Label>
            <Input
              id="address"
              placeholder="Enter your business address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="businessType">Business Type *</Label>

            <Select
              value={formData.businessType}
              onValueChange={(value) =>
                handleInputChange("businessType", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type: string) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: "Bank Details",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bankId">Select Bank *</Label>
            <Select
              onValueChange={(value) =>
                handleBankDetailsChange("bankId", value)
              }
              value={formData.bankId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent>
                {nigerianBanks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              placeholder="Enter 10-digit account number"
              value={formData.accountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleBankDetailsChange("accountNumber", value);
              }}
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <div className="relative">
              <Input
                id="accountName"
                placeholder="Account name will appear here"
                value={formData.accountName}
                onChange={() => {}} // Disabled input
                disabled
                className="bg-gray-50"
              />
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Authentication",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="emailAuth">Email Address</Label>
            <Input
              id="emailAuth"
              type="email"
              value={formData.email}
              onChange={() => {}} // Disabled input
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
            />
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  Passwords do not match
                </motion.p>
              )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-md mx-auto flex h-screen items-center w-full"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Business Registration</CardTitle>
          <div className="flex items-center justify-between mt-4">
            {steps.map((_, index: number) => (
              <div key={index} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      index <= currentStep ? "#3B82F6" : "#E5E7EB",
                    scale: index === currentStep ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                >
                  {index + 1}
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor:
                        index < currentStep ? "#3B82F6" : "#E5E7EB",
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="w-32 h-1 mx-2"
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            <div className="flex space-x-2">
              {currentStep < 2 ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                  >
                    Next
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep(currentStep) || isLoading}
                  >
                    {isLoading ? "Registering..." : "Complete Registration"}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
            </span>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/login"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Sign in here
            </motion.a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// const App: React.FC = () => {
//   const [currentForm, setCurrentForm] = useState<"register" | "login">(
//     "register"
//   );
//   const [users, setUsers] = useState<User[]>([]); // Mock database

//   const handleRegistrationComplete = (userData: RegisterFormData): void => {
//     // Simulate storing user in database
//     const newUser: User = {
//       id: Date.now(),
//       ...userData,
//       createdAt: new Date().toISOString(),
//     };

//     setUsers((prev) => [...prev, newUser]);

//     // Show success message and switch to login
//     alert("Registration successful! Please sign in with your credentials.");
//     setCurrentForm("login");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
//       <div className="container mx-auto">
//         <motion.h1
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
//           className="text-3xl font-bold text-center text-gray-800 mb-8"
//         >
//           Business Portal
//         </motion.h1>

//         <AnimatePresence mode="wait">
//           {currentForm === "register" ? (
//             <BusinessRegistrationForm
//               key="register"
//               onComplete={handleRegistrationComplete}
//               onSwitchToLogin={() => setCurrentForm("login")}
//             />
//           ) : (
//             <LoginForm
//               key="login"
//               onSwitchToRegister={() => setCurrentForm("register")}
//               users={users}
//             />
//           )}
//         </AnimatePresence>

//         {users.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//             className="mt-8 p-4 bg-white rounded-lg shadow-sm max-w-md mx-auto"
//           >
//             <h3 className="text-sm font-medium text-gray-700 mb-2">
//               Registered Users:
//             </h3>
//             <div className="space-y-1">
//               {users.map((user: User) => (
//                 <p key={user.id} className="text-xs text-gray-600">
//                   {user.email} - {user.businessName}
//                 </p>
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// };

export default BusinessRegistrationForm;
