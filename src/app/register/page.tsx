/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import BusinessRegistrationForm from "@/component/Register";
import { RegisterFormData, User } from "@/interfaces";
import React from "react";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";

function Page() {
  const [users, setUsers, removeUsers] = useLocalStorage<User[]>("users", []);

  const handleRegistrationComplete = (userData: RegisterFormData): void => {
    // Simulate storing user in database
    const newUser: User = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
    };

    setUsers([...(users ?? []), newUser]);

    // Show success message and switch to login
    toast.success(
      "Registration successful! Please sign in with your credentials."
    );
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  };
  return (
    <div>
      <BusinessRegistrationForm onComplete={handleRegistrationComplete} />
    </div>
  );
}

export default Page;
