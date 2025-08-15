/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { toast } from "sonner";
import { useBusinessData, useToken } from "@/lib/utils";
import {
  Edit2,
  Save,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  User,
  Calendar,
  Shield,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { BANK_LIST } from "@/Payment/bank";
import { Transaction } from "@/interfaces";

interface BusinessProfile {
  id: string;
  businessLogo: string;
  business_name: string;
  business_email: string;
  phone: string;
  address: string;
  businessType: string;
  account_number: string;
  bankId: string;
  accountName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const Page = () => {
  const { token } = useToken();
  const { storeBusinessData } = useBusinessData();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [editData, setEditData] = useState<Partial<BusinessProfile>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [transactionStats, setTransactionStats] = useState({
    creditedBalance: 0,
    failedBalance: 0,
    totalBalance: 0,
    pendingBalance: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
    fetchTransactions();
  }, []);

  // Fetch transactions when page or filter changes
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/business/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data.data);
      toast.dismiss();
      toast.success("Profile loaded successfully");
    } catch (error: any) {
      toast.dismiss();
      console.error("Fetch profile error:", error);
      toast.error(error?.response?.data?.message || "Failed to load profile");
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await axios.get(
        `/api/business/transactions?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: TransactionResponse = response.data.data;
      setTransactions(data.transactions);
      setTotalPages(data.pagination.pages);

      // Calculate stats
      const stats = data.transactions.reduce(
        (acc, transaction) => {
          if (transaction.status === "COMPLETED") {
            acc.creditedBalance += transaction.amount_naira;
          }

          if (transaction.status === "PENDING") {
            acc.pendingBalance += transaction.amount_naira;
          }

          if (transaction.status === "FAILED") {
            acc.failedBalance += transaction.amount_naira;
          }
          acc.totalBalance += transaction.amount_naira;
          return acc;
        },
        {
          creditedBalance: 0,
          failedBalance: 0,
          totalBalance: 0,
          pendingBalance: 0,
        }
      );

      setTransactionStats(stats);
    } catch (error: any) {
      console.error("Fetch transactions error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load transactions"
      );
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof BusinessProfile,
    value: string | null
  ): void => {
    setEditData((prev) => ({ ...prev, [field]: value }));
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

  const startEditing = () => {
    setIsEditing(true);
    setEditData(profile || {});
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
  };

  const saveProfile = async () => {
    try {
      toast.loading("Updating profile...");
      setIsLoading(true);

      // If no logo is selected, use the default
      const dataToSend = {
        ...editData,
        businessLogo:
          editData.businessLogo ||
          "https://res.cloudinary.com/drphqvmfe/image/upload/v1754203697/jeet/venmo-svgrepo-com_pvksx4.svg",
      };

      const response = await axios.put("/api/business/profile", dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(response.data.data);
      storeBusinessData(response.data.data);

      setProfile(response.data.data);
      setIsEditing(false);
      setEditData({});
      toast.dismiss();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getBankName = (bankId: string) => {
    return (
      BANK_LIST.find((bank) => bank.code === bankId)?.name || "Unknown Bank"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <Loader2 size={30} className="  animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Business Profile Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your business information and view transactions
          </p>
        </motion.div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {/* Main Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="   ">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white rounded-full p-2">
                        <div className="w-full h-full relative overflow-hidden rounded-full">
                          <Image
                            src={
                              isEditing
                                ? editData.businessLogo || profile.businessLogo
                                : profile.businessLogo
                            }
                            alt="Business Logo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {isEditing
                            ? editData.business_name || profile.business_name
                            : profile.business_name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge
                            variant={profile.isActive ? "default" : "secondary"}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {profile.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-white/20 text-white border-white/30"
                          >
                            ID: {profile.id.slice(-6)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isEditing ? (
                        <Button
                          onClick={startEditing}
                          variant="secondary"
                          size="sm"
                          className="bg-gray-800 text-white  hover:bg-gray-700"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            onClick={saveProfile}
                            disabled={isLoading}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            variant="outline"
                            size="sm"
                            className="bg-gray-800 text-white  hover:bg-gray-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="edit-mode"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Edit Mode */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Business Logo */}
                          <div className="md:col-span-2">
                            <Label>Business Logo</Label>
                            <div className="flex items-center space-x-4 mt-2">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <div className="w-full h-full relative overflow-hidden rounded-lg">
                                  <Image
                                    src={
                                      editData.businessLogo ||
                                      profile.businessLogo
                                    }
                                    alt="Business Logo"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              </motion.div>
                              <div>
                                <p className="text-sm text-gray-600 mb-2">
                                  Click the image to change logo
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  Upload New Logo
                                </Button>
                              </div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>
                          </div>

                          {/* Business Name */}
                          <div>
                            <Label htmlFor="business_name">Business Name</Label>
                            <Input
                              id="business_name"
                              value={editData.business_name || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "business_name",
                                  e.target.value
                                )
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Phone */}
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={editData.phone || ""}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Address */}
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={editData.address || ""}
                              onChange={(e) =>
                                handleInputChange("address", e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Business Type */}
                          {/* <div>
                            <Label htmlFor="businessType">Business Type</Label>
                            <Select
                              value={editData.businessType}
                              onValueChange={(value) =>
                                handleInputChange("businessType", value)
                              }
                            >
                              <SelectTrigger className="mt-1">
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
                          </div> */}

                          {/* Bank */}
                          <div>
                            <Label htmlFor="bankId">Bank</Label>
                            <Select
                              value={editData.bankId || ""}
                              onValueChange={(value) =>
                                handleInputChange("bankId", value)
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select bank" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANK_LIST.map((bank) => (
                                  <SelectItem key={bank.id} value={bank.code}>
                                    {bank.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Account Number */}
                          <div>
                            <Label htmlFor="account_number">
                              Account Number
                            </Label>
                            <Input
                              id="account_number"
                              value={editData.account_number || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 10);
                                handleInputChange("account_number", value);
                              }}
                              maxLength={10}
                              className="mt-1"
                            />
                          </div>

                          {/* Account Name */}
                          <div>
                            <Label htmlFor="accountName">Account Name</Label>
                            <Input
                              id="accountName"
                              value={editData.accountName || ""}
                              onChange={(e) =>
                                handleInputChange("accountName", e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view-mode"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        {/* View Mode */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Contact Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                              Contact Information
                            </h3>

                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">
                                  {profile.business_email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Phone className="w-5 h-5 text-green-500" />
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{profile.phone}</p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <MapPin className="w-5 h-5 text-red-500 mt-1" />
                              <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">{profile.address}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Briefcase className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Business Type
                                </p>
                                <p className="font-medium">
                                  {profile.businessType}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Banking Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                              Banking Information
                            </h3>

                            <div className="flex items-center space-x-3">
                              <Building2 className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Bank</p>
                                <p className="font-medium">
                                  {getBankName(profile.bankId)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <CreditCard className="w-5 h-5 text-orange-500" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Account Number
                                </p>
                                <p className="font-medium font-mono">
                                  {profile.account_number}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-teal-500" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Account Name
                                </p>
                                <p className="font-medium">
                                  {profile.accountName}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Account Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Account Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-indigo-500" />
                              <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="font-medium">
                                  {formatDate(profile.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-indigo-500" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Last Updated
                                </p>
                                <p className="font-medium">
                                  {formatDate(profile.updatedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">
                      <Shield className="w-4 h-4 mr-2" />
                      Security Settings
                    </Button>
                    <Button variant="outline" size="sm">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Methods
                    </Button>
                    <Button variant="outline" size="sm">
                      <Building2 className="w-4 h-4 mr-2" />
                      Business Verification
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="transactions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm   mb-1 text-blue-500">
                        Total Balance
                      </p>
                      <p className={`text-lg font-bold text-blue-500 `}>
                        {formatCurrency(transactionStats.totalBalance)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Credited Balance
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(transactionStats.creditedBalance)}
                      </p>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Failed Balance
                      </p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(transactionStats.failedBalance)}
                      </p>
                    </div>
                    <ArrowDownLeft className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm  mb-1 text-yellow-600">
                        Pending Balance
                      </p>
                      <p className="text-lg font-bold text-yellow-600">
                        {formatCurrency(transactionStats.pendingBalance)}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Transactions Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      Transaction History
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <Select
                        value={statusFilter || "all"}
                        onValueChange={(value) => {
                          setStatusFilter(value === "all" ? "" : value);
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>{" "}
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => fetchTransactions()}
                        variant="outline"
                        size="sm"
                        disabled={transactionLoading}
                      >
                        {transactionLoading ? "Loading..." : "Refresh"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {transactionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">
                        Loading transactions...
                      </span>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full  bg-gray-100`}>
                              <ArrowUpRight className={`w-4 h-4  `} />
                            </div>
                            <div>
                              <p className="font-medium">Transaction</p>
                              <p className="text-sm text-gray-500">
                                Ref: {transaction.id}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p
                                className={`font-bold bg-white  ${getStatusColor(
                                  transaction.status
                                )}
                               
                               
                                }`}
                              >
                                {formatCurrency(transaction.amount_naira)}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transaction.status)}
                              <Badge
                                className={`${getStatusColor(
                                  transaction.status
                                )} border`}
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1 || transactionLoading}
                          variant="outline"
                          size="sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={
                            currentPage === totalPages || transactionLoading
                          }
                          variant="outline"
                          size="sm"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
