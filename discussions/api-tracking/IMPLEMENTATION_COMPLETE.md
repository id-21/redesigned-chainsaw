# API Cost Tracking Implementation - COMPLETE ✅

This document summarizes the completed implementation of API usage and cost tracking for Gemini API calls.

## 📋 Implementation Summary

All planned features have been implemented successfully. The system now tracks all Gemini API calls with complete token usage and cost analytics.

---

## 🗂️ Files Created/Modified

### **1. Type Definitions**
- **File**: `lib/features/virtual-tryon/types.ts`
- **Added**:
  - `ApiUsageLog` interface
  - `CreateApiUsageLogInput` interface

### **2. Database Queries**
- **File**: `lib/features/virtual-tryon/queries.ts`
- **Added**:
  - `createApiUsageLog()` - Create usage log entry (fire-and-forget)
  - `getApiUsageLogs()` - Fetch logs with filters
  - `updateApiUsageLogCost()` - Update cost for a log
  - `getUnpricedApiUsageLogs()` - Get logs without costs

### **3. Cost Calculator Utility**
- **File**: `lib/features/virtual-tryon/utils/cost-calculator.ts`
- **Features**:
  - `calculateImageTokens()` - Calculate image tokens based on dimensions
  - `calculateApiCost()` - Calculate cost from usage log
  - `getUsdToInrRate()` - Get exchange rate
  - `convertUsdToInr()` - Convert currency
  - `formatCost()` - Format cost for display
  - Configurable pricing per model (TODO: Add actual pricing)
  - USD to INR conversion (currently 85.0)

### **4. Updated API Routes**

#### `/api/virtual-tryon/generate/route.ts`
- Added import for `createApiUsageLog` and `calculateImageTokens`
- Logs API usage immediately after Gemini API call (non-blocking)
- Tracks: user_id, generated_asset_id, product_id, endpoint, model, tokens

#### `/api/virtual-tryon/analyze-product/route.ts`
- Added import for `createApiUsageLog` and `calculateImageTokens`
- Logs API usage immediately after Gemini API call (non-blocking)
- Tracks: user_id, endpoint, model, tokens

### **5. Background Worker**
- **File**: `lib/features/virtual-tryon/workers/cost-calculator-worker.ts`
- **Function**: `processCostCalculations(batchSize)`
  - Fetches unpriced logs
  - Calculates costs using pricing config
  - Converts to INR
  - Updates logs with costs
  - Returns processing stats

### **6. Admin API Endpoints**

#### `/api/admin/cost-calculator/route.ts`
- **POST** - Manually trigger cost calculation worker
- **GET** - Check count of unpriced logs
- Admin authentication required

#### `/api/admin/analytics/route.ts`
- **GET** - Comprehensive cost analytics
- Query parameters:
  - `type`: summary | endpoints | users | trends | generation-types | all
  - `days`: Number of days for trends (default 30)
  - `limit`: Number of top users (default 20)

### **7. Analytics Module**
- **File**: `lib/features/virtual-tryon/analytics.ts`
- **Functions**:
  - `getCostSummary()` - Overall cost summary
  - `getCostsByEndpoint()` - Cost breakdown by endpoint/model
  - `getTopSpendingUsers()` - Top spending users
  - `getTokenUsageTrends()` - Token usage over time
  - `getCostsByGenerationType()` - Costs by generation type

### **8. Database Schema**
- **File**: `discussions/setup-files/api-usage-logs-schema.sql`
- Complete SQL schema for `api_usage_logs` table
- Includes indexes, RLS policies, and comments
- Ready to run in Supabase SQL Editor

---

## 🚀 Getting Started

### **Step 1: Create Database Table**

Run the SQL schema in Supabase SQL Editor:

```bash
# File location:
discussions/setup-files/api-usage-logs-schema.sql
```

This creates:
- `api_usage_logs` table
- Indexes for performance
- Row Level Security policies
- Comments for documentation

### **Step 2: Configure Pricing**

Update pricing in `lib/features/virtual-tryon/utils/cost-calculator.ts`:

```typescript
const GEMINI_PRICING: GeminiPricing = {
  'gemini-2.5-flash-image': {
    inputPerMillion: 0.00,  // ← Update with actual pricing
    outputPerMillion: 0.00, // ← Update with actual pricing
  },
  'gemini-2.0-flash-exp': {
    inputPerMillion: 0.00,  // ← Update with actual pricing
    outputPerMillion: 0.00, // ← Update with actual pricing
  },
};
```

Get pricing from: https://ai.google.dev/pricing

### **Step 3: Configure Exchange Rate**

Update USD to INR rate in `lib/features/virtual-tryon/utils/cost-calculator.ts`:

```typescript
const USD_TO_INR_RATE = 85.0; // ← Update with current rate
```

### **Step 4: Test API Logging**

Make a Gemini API call through your application:
1. Generate a virtual try-on image
2. Analyze a product image
3. Check Supabase for new rows in `api_usage_logs`

### **Step 5: Run Cost Calculator**

#### Option A: Manual Trigger (Admin Dashboard)
```bash
POST /api/admin/cost-calculator
```

#### Option B: Check Status
```bash
GET /api/admin/cost-calculator
```

Returns count of unpriced logs.

#### Option C: Set up Cron Job (Optional)

Create `vercel.json` for automated cost calculation:

```json
{
  "crons": [
    {
      "path": "/api/admin/cost-calculator",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour.

### **Step 6: View Analytics**

Access admin analytics:

```bash
# Get all analytics
GET /api/admin/analytics?type=all

# Get cost summary only
GET /api/admin/analytics?type=summary

# Get top 10 users
GET /api/admin/analytics?type=users&limit=10

# Get 7-day trends
GET /api/admin/analytics?type=trends&days=7
```

---

## 📊 Admin Dashboard Analytics

The implementation provides comprehensive analytics queries:

### **1. Cost Summary**
- Total API calls
- Total tokens used
- Total cost (USD & INR)
- Average cost per call
- Average tokens per call

### **2. Cost by Endpoint**
- Calls per endpoint/model
- Average tokens per call
- Average cost (USD & INR)
- Total cost (USD & INR)

### **3. Top Spending Users**
- User ID
- Total API calls
- Total tokens
- Total spent (USD & INR)

### **4. Token Usage Trends**
- Daily token usage by endpoint
- Input, output, thinking tokens breakdown

### **5. Cost by Generation Type**
- Cost breakdown by generation type (model_shot, lifestyle, etc.)
- Average tokens and costs
- Total costs per type

---

## 🔍 How It Works

### **API Call Flow**

```
1. User makes API request
   ↓
2. API route calls Gemini API
   ↓
3. Gemini returns response with usageMetadata
   ↓
4. API route logs usage (fire-and-forget, non-blocking)
   ↓
5. Usage log created with NULL cost
   ↓
6. User receives response (no delay)
   ↓
7. Background worker calculates costs (async)
   ↓
8. Usage log updated with costs
```

### **Non-Blocking Design**

API logging uses fire-and-forget pattern:
```typescript
createApiUsageLog({...}).catch((err) => {
  console.error('Failed to log API usage:', err);
  // Don't throw - we don't want to fail the request
});
```

This ensures:
- User response times are unaffected
- Failed logging doesn't break API calls
- Logs are processed in background

---

## 📝 TODO Before Production

- [ ] Add actual Gemini API pricing to `cost-calculator.ts`
- [ ] Update USD to INR exchange rate (or fetch from API)
- [ ] Implement actual image dimension detection in `getImageDimensions()`
- [ ] Set up cron job for cost calculation worker
- [ ] Create admin dashboard UI for analytics
- [ ] Add alerts for unusual spending patterns
- [ ] Configure data retention policy
- [ ] Test with real API calls in production

---

## 🎯 Key Features

✅ **Complete audit trail** - Raw JSON + parsed fields
✅ **Non-blocking** - Usage logged immediately, cost calculated async
✅ **Future-proof** - Can recalculate costs if pricing changes
✅ **Analytics-ready** - Indexed for fast complex queries
✅ **No user impact** - Response speed unchanged
✅ **Comprehensive** - Tracks all API endpoints separately
✅ **Scalable** - Background worker prevents backlog
✅ **INR Support** - Track costs in INR for user pricing
✅ **Admin Dashboard** - Complete analytics API

---

## 📚 Reference

### **Database Schema**
- Location: `discussions/setup-files/api-usage-logs-schema.sql`
- Original Plan: `discussions/api-tracking/cost-tracking-implementation-plan.md`

### **API Endpoints**
- `/api/virtual-tryon/generate` - Logs image generation usage
- `/api/virtual-tryon/analyze-product` - Logs image analysis usage
- `/api/admin/cost-calculator` - Trigger cost calculation
- `/api/admin/analytics` - Get analytics data

### **Files Modified**
1. `lib/features/virtual-tryon/types.ts`
2. `lib/features/virtual-tryon/queries.ts`
3. `app/api/virtual-tryon/generate/route.ts`
4. `app/api/virtual-tryon/analyze-product/route.ts`

### **Files Created**
1. `lib/features/virtual-tryon/utils/cost-calculator.ts`
2. `lib/features/virtual-tryon/workers/cost-calculator-worker.ts`
3. `lib/features/virtual-tryon/analytics.ts`
4. `app/api/admin/cost-calculator/route.ts`
5. `app/api/admin/analytics/route.ts`
6. `discussions/setup-files/api-usage-logs-schema.sql`

---

## 🎉 Implementation Complete!

The API cost tracking system is now fully implemented and ready for testing. Follow the "Getting Started" steps above to activate the system.

For questions or issues, refer to the implementation plan at:
`discussions/api-tracking/cost-tracking-implementation-plan.md`
