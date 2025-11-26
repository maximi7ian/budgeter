# Custom Budget Report Feature - Changes Summary

## Overview
Added custom date range budget reporting with optional budget override functionality.

**Status**: ✅ Successfully merged with `ui-update` branch featuring new design system.

## Merge Summary (Latest)
The custom report feature has been integrated with the new "Cosmic Glass" design system from the `ui-update` branch:
- **Modal styles**: Moved from `ui_modal.ts` to `src/ui/design-system.ts` for consistency
- **UI Integration**: Custom report button added to Quick Actions grid using new design system components
- **Styling**: All components now use design system tokens (COLORS, SPACING, BORDER_RADIUS, FONTS)
- **Build Status**: ✅ Successful compilation with zero TypeScript errors

## Files Changed

### New Files
- **src/ui_modal.ts** - Modal component for custom report inputs
  - Dark-themed modal with glassmorphism
  - Date range inputs (start/end)
  - Optional budget input field
  - Modal CSS and JavaScript handlers

### Modified Files

#### src/ui/design-system.ts (from ui-update merge)
- **New file from merge** - Centralized design system
- Added modal styles (lines 322-477):
  - `.modal-overlay`, `.modal`, `.modal-header`, `.modal-title`
  - `.modal-close`, `.modal-body`, `.modal-form-group`, `.modal-label`
  - `.modal-input`, `.modal-hint`, `.modal-footer`
  - `.modal-btn`, `.modal-btn-primary`, `.modal-btn-secondary`
- Uses design tokens: COLORS, SPACING, BORDER_RADIUS, FONTS

#### src/ui_modal.ts
- **Refactored**: Removed duplicate CSS (now in design-system.ts)
- Kept only `renderCustomReportModal()` function
- Modal HTML uses design system CSS classes

#### src/ui.ts
- **Merged**: Combined ui-update branch with custom report feature
- Import `renderCustomReportModal` from ui_modal
- Import design system from `./ui/design-system`
- Added custom report button to Quick Actions grid (line 206-208)
- Render modal before footer (line 217)
- Uses new design system throughout

#### src/types.ts
- Extended `WindowMode` type: `"weekly" | "monthly" | "custom"`
- Updated `TransactionOutput.window` interface:
  - Changed `mode` from `"weekly" | "monthly"` to `WindowMode`
  - Added optional `customBudget?: number` field

#### src/ui.ts
- Added import: `import { MODAL_CSS, renderCustomReportModal } from "./ui_modal"`
- Injected modal CSS into main CSS constant
- Added "Custom Report" button to home page action grid (line ~1032)
- Added modal HTML render call before footer (line ~1048)

#### src/server.ts
- **New route**: `GET /transactions/custom` (lines 357-474)
  - Query params: `start` (required), `end` (required), `budget` (optional)
  - Validates date format (YYYY-MM-DD) and range
  - Auto-calculates budget if not provided: `(weeklyAllowance / 7) × days`
  - Returns enhanced transactions page with custom date range
- Fixed type narrowing for "weekly" | "monthly" in existing routes

#### src/data.ts
- Updated `calculateDateWindow()` signature: restricted to `"weekly" | "monthly"` (custom mode uses direct dates)
- Updated `getDummyData()` signature: restricted to `"weekly" | "monthly"`
- Updated `fetchAllTransactions()` signature: restricted to `"weekly" | "monthly"`

#### src/alertService.ts
- Updated `sendBudgetAlertForPeriod()` signature: restricted to `"weekly" | "monthly"`

## How It Works

1. User clicks **"Custom Report"** button on home page
2. Modal opens with default date range (last 7 days)
3. User selects custom dates and optionally enters budget
4. Form submits to `/transactions/custom?start=YYYY-MM-DD&end=YYYY-MM-DD&budget=XXX`
5. Backend validates and fetches transactions for exact date range
6. Budget auto-calculates if not provided: `(WEEKLY_ALLOWANCE / 7) × numberOfDays`
7. Results displayed in enhanced transactions page

## UI Features

### Modal
- Auto-fills last 7 days by default
- Date inputs restricted to past dates (max = today)
- Budget input optional with 0.01 step precision
- Closes via: X button, Cancel button, Escape key, or clicking outside
- Dark theme matching app design

### Custom Report Button
- Located in home page action grid
- Icon: 📋
- Positioned between "Last Month" and "Add More" buttons

## Type Safety Notes

- `WindowMode` now includes "custom" for type system completeness
- Functions that only support scheduled reports still use `"weekly" | "monthly"`
- Custom report endpoint explicitly uses `"custom" as const` for type inference
- No breaking changes to existing alert/scheduler functionality

## Testing Checklist

- [ ] Modal opens/closes correctly
- [ ] Date validation works (end > start, format validation)
- [ ] Custom budget calculation accurate
- [ ] Auto-budget calculation: `(weekly / 7) × days`
- [ ] Custom report displays in enhanced transactions page
- [ ] Works in both live and dummy mode
- [ ] Compatible with excluded expenses from Google Sheets
