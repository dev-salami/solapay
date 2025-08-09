# Crypto-to-Naira Platform API Documentation

## Overview

This platform allows businesses to accept stablecoin payments and receive naira disbursements to their bank accounts.

## Base URL

```
https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Business Endpoints

### 1. Business Registration

**POST** `/business/auth/register`

Register a new business account.

**Request Body:**

```json
{
  "businessLogo": "https://example.com/logo.png", // optional
  "businessName": "My Business",
  "email": "business@example.com",
  "phone": "+234XXXXXXXXXX",
  "address": "Business Address",
  "businessType": "E-commerce",
  "accountNumber": "1234567890",
  "bankId": "001",
  "accountName": "Business Account Name",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "Business registered successfully",
  "data": {
    "business": {
      "id": "...",
      "businessName": "My Business",
      "email": "business@example.com"
      // ... other business fields (password excluded)
    },
    "token": "jwt-token-here"
  }
}
```

### 2. Business Login

**POST** `/business/auth/login`

**Request Body:**

```json
{
  "email": "business@example.com",
  "password": "securePassword123"
}
```

### 3. Get Business Profile

**GET** `/business/profile` (Protected)

Get current business profile information.

### 4. Update Business Profile

**PUT** `/business/profile` (Protected)

**Request Body:**

```json
{
  "businessLogo": "https://example.com/new-logo.png",
  "businessName": "Updated Business Name",
  "phone": "+234XXXXXXXXXX"
  // ... other updateable fields
}
```

### 5. Get Business Transactions

**GET** `/business/transactions` (Protected)

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (PENDING, COMPLETED, FAILED, FINALIZED, RESOLVED)

---

## Webhook Endpoints

### 1. Helius Webhook

**POST** `/webhook/helius`

Receives notifications from Helius when stablecoin transactions are detected.

**Expected Request Body:**

```json
{
  "trackingId": "unique-tracking-id",
  "businessEmail": "business@example.com",
  "amount_usd": 100.5,
  "amount_naira": 150750.0,
  "senderWalletAddress": "wallet-address-here"
}
```

### 2. Disbursement Endpoint

**POST** `/disbursement`

Internal endpoint to trigger naira disbursement to business bank accounts.

**Request Body:**

```json
{
  "transactionId": "transaction-id-here"
}
```

---

## Admin Endpoints

### 1. Admin Login

**POST** `/admin/auth/login`

**Request Body:**

```json
{
  "email": "admin@yourcompany.com",
  "password": "admin-password"
}
```

### 2. Get All Businesses

**GET** `/admin/businesses` (Admin Protected)

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by business name or email

### 3. Toggle Business Active Status

**PATCH** `/admin/businesses/[id]/toggle-active` (Admin Protected)

**Request Body:**

```json
{
  "isActive": true
}
```

### 4. Get Business Summary

**GET** `/admin/businesses/[id]/summary` (Admin Protected)

Returns transaction summary for a specific business.

### 5. Get All Transactions

**GET** `/admin/transactions` (Admin Protected)

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `businessId` (optional): Filter by business ID
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)
- `search` (optional): Search by tracking ID, business name, etc.

### 6. Retry Failed Disbursement

**POST** `/admin/transactions/[id]/retry-disbursement` (Admin Protected)

Manually retry a failed disbursement.

### 7. Dashboard Statistics

**GET** `/admin/dashboard/stats` (Admin Protected)

Returns platform-wide statistics and recent transactions.

---

## Transaction Status Flow

1. **PENDING** - Transaction created from webhook, disbursement in progress
2. **COMPLETED** - Disbursement successful
3. **FAILED** - Disbursement failed
4. **FINALIZED** - Transaction finalized (custom status)
5. **RESOLVED** - Transaction resolved (custom status)

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description"
}
```

**Common HTTP Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Setup Instructions

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   Copy `.env.example` to `.env` and fill in your values.

3. **Setup Database:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Database Schema

The platform uses MongoDB with Prisma ORM. See the Prisma schema for complete database structure including:

- `Business` model for business accounts
- `Transaction` model for payment transactions
- Proper relationships and indexes

 
