/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { LoginFormData, User } from "@/interfaces";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";
import axios from "axios";
import { useBusinessData, useToken } from "@/lib/utils";

const LoginForm: React.FC = () => {
  const { storeToken } = useToken();
  const { storeBusinessData } = useBusinessData();

  const [users] = useLocalStorage<User[]>("users", []);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (): Promise<void> => {
    toast.loading("Logging in...", {
      duration: 0,
    });

    try {
      const res = await axios.post("/api/business/auth/login", formData);

      console.log("Login Response:", res.data);
      setIsLoading(false);
      toast.dismiss();
      toast.success(" Log in successful!", {
        duration: 3000,
      });
      window.location.href = "/"; // Redirect to home page
      storeToken(res.data.data.token);
      storeBusinessData(res.data.data.business);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.dismiss();

      toast.error(
        error?.response?.data?.message || "Login failed. Please try again."
      );
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

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-md mx-auto flex h-screen items-center w-full"
    >
      <Card className=" w-full">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to your business account
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="loginEmail">Email Address</Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="loginPassword">Password</Label>
              <Input
                id="loginPassword"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full"
                disabled={isLoading || !formData.email || !formData.password}
                onClick={handleSubmit}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </motion.div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              {` Don't have an account?`}
            </span>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/register"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Register here
            </motion.a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoginForm;
