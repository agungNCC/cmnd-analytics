# CMND Analytics - Quick Copy-Paste Design Prompts

**Use one prompt at a time with Claude Design tool**

---

## 1️⃣ LOGIN PAGE - COPY & PASTE THIS

```
Create a professional login page for "CMND Analytics" - 
a bank employee training compliance dashboard for CIMB Niaga.

Layout:
- Left side: Hero section with brand, tagline, and benefits (blue gradient background #2563EB to indigo)
- Right side: Login form (50% width)
- Responsive: Stack vertically on mobile

Right Form Section:
- Card with white background, rounded 12px, subtle shadow
- Title: "Login" (20px bold)
- Username input:
  - Label: "Username"
  - Placeholder: "admin@cimb.local"
  - User icon on left
  - Border: 1px gray, focus: blue border
- Password input:
  - Label: "Password"
  - Placeholder: "••••••••"
  - Lock icon on left
  - Show/hide password toggle
- "Remember me" checkbox
- "Forgot password?" link (right aligned)
- Login button:
  - Full width
  - Blue background (#2563EB)
  - White bold text
  - Hover: Darker blue
  - Loading state: Spinner + "Logging in..."
- Error message area (red text)

Left Hero:
- Logo at top-left
- Title: "CMND Analytics"
- Subtitle: "Mandatory LOG+ & VR Learning Tracking System"
- 3 benefit bullets with icons
- Text: White

Color scheme:
- Primary: Blue #2563EB
- Text: Dark gray #1F2937
- Input borders: Gray
- Background: Light gray #F3F4F6
```

---

## 2️⃣ DASHBOARD LAYOUT - COPY & PASTE THIS

```
Create the main dashboard layout for CMND Analytics.

Top Navbar (full width, 64px height):
- Left: Logo + "CMND Analytics" text (bold 16px)
- Center: Page title (bold 20px, dark)
- Right: Search icon, notifications (red badge), user avatar + dropdown menu

Left Sidebar (280px, sticky):
- Background: White with blue top border
- Navigation items with icons:
  1. Dashboard → Sub: Summary All, Mandatory 2026, LOG+, VR Learning
  2. Upload
  3. Export
  4. Admin (admin only) → Sub: Users, Audit Logs
  5. Help

Sidebar styling:
- Active item: Blue background (#2563EB), white text
- Hover: Light gray
- Sub-items: Smaller, indented
- Icons: 20px
- Text: 14px medium

Main Content:
- Background: Light gray (#F3F4F6)
- Padding: 24px
- Takes remaining width

Tab Bar (below navbar):
- Tabs: "Summary All" | "Mandatory 2026" | "LOG+" | "VR Learning"
- Active: Blue text with blue bottom border
- Height: 48px
- Padding: 0 24px

Responsive:
- Desktop: Sidebar visible
- Tablet: Sidebar can collapse
- Mobile: Hamburger menu, sidebar becomes drawer

Colors:
- Sidebar: White
- Active: Blue #2563EB
- Hover: Light gray #F9FAFB
- Text: Dark gray #1F2937
- Borders: Light gray #E5E7EB
```

---

## 3️⃣ DASHBOARD - SUMMARY ALL TAB - COPY & PASTE THIS

```
Create the Summary All data table for dashboard.

Table Header (above table):
- Left: Title "Summary All" (20px bold), Subtitle "Completion rates by directorate"
- Right: Search box, Filter dropdown, Refresh button, Export button (blue)

Data Table:
Columns: Directorate | Total Employees | LOG+ Completed | LOG+ % | VR Completed | VR % | Combined %

Row styling:
- White/light gray alternating
- Hover: Light blue highlight
- Padding: 16px

Completion % cells:
- Green background (#10B981) + white text if > 80%
- Yellow background (#F59E0B) + dark text if 50-80%
- Red background (#EF4444) + white text if < 50%
- Percentage centered

Header row:
- Light gray background (#F3F4F6)
- Bold text
- Sortable (click for arrow)

Table footer:
- Left: "Showing 1-10 of 19 directorates"
- Right: Pagination (Previous, numbers, Next)

Loading state:
- Skeleton loaders with pulse animation

Empty state:
- Icon: Empty inbox
- Text: "No data available"
- Button: "Try adjusting filters"

Responsive: Horizontal scroll on mobile
```

---

## 4️⃣ DASHBOARD - MANDATORY 2026 TAB - COPY & PASTE THIS

```
Create the Mandatory 2026 data table with filters.

Filters (above table):
- Search: "Search by employee ID or name..."
- Status dropdown: "All Status" → Completed, Incompleted
- Directorate dropdown: "All Directorates"
- Apply button (blue)

Table Columns:
Employee ID | Employee Name | Directorate | LOG+ Status | LOG+ % | VR Status | Overall Status | Action (eye icon)

Status badges styling:
- "Completed": Green background (#10B981), white text, checkmark
- "Incompleted": Red background (#EF4444), white text

Row styling:
- Alternating white/light gray
- Hover: Blue highlight
- Padding: 16px

% cells:
- Green: > 80%
- Yellow: 50-80%
- Red: < 50%

Pagination:
- "Showing 1-10 of 11,414"
- Previous, page numbers, Next

Responsive: Column hiding on mobile (hide directorate, keep ID and name)
```

---

## 5️⃣ DASHBOARD - LOG+ TAB - COPY & PASTE THIS

```
Create the LOG+ data table with course filters.

Filters:
- Search: "Search..."
- Course dropdown: 20+ courses listed (BUSINESS CONTINUITY MANAGEMENT, CODE OF ETHICS, etc)
- Status dropdown: All Status → Completed, Incompleted
- Date range: "From" and "To" date inputs
- Quick filters: "Completed Today", "Last 7 Days", "This Month"

Table Columns:
Employee ID | Name | Directorate | Course | Status | Score | Completion Date | Action

Status badges:
- Green if completed
- Red if incompleted

Score styling:
- Show percentage (0-100%)
- Light green background if score = 100
- Light red background if score < 50
- Otherwise normal

Rows: Alternating colors, hover blue

Course examples:
- BUSINESS CONTINUITY MANAGEMENT (BCM) - 4 modules
- CODE OF ETHICS - 2 modules
- DATA MANAGEMENT
- REFRESHMENT AML, CFT & CPF - 3 modules
- ANTI FRAUD MANAGEMENT - 5 modules
- REFRESHMENT INFORMATION SECURITY AWARENESS - 5 modules

Pagination: Show 10/25/50/100 rows

Responsive: Hide directorate on mobile
```

---

## 6️⃣ DASHBOARD - VR LEARNING TAB - COPY & PASTE THIS

```
Create the VR Learning data table with region/branch filters.

Filters:
- Search: "Search..."
- Region dropdown: 29 regions
- Branch dropdown: 415 branches
- Score range slider: "Min score 0 → 100"
- Status dropdown: All Status
- Apply button (blue)

Table Columns:
Employee ID | Name | Directorate | Region | Branch | Forward 30 Score | Status | Completion Time

Score styling (Forward 30):
- > 80: Green background, white text
- 50-80: Yellow background, dark text
- < 50: Red background, white text
- Not completed: Gray background

Status badges:
- "Completed": Green
- "Incompleted": Red
- "In Progress": Yellow with spinner

Completion Time column:
- Format: "20 Jul 2026" or "Not completed"
- Gray text if not completed

Rows: Alternating white/gray, hover blue

Pagination: "Showing 1-10 of 10,340"

Responsive: Hide region/branch on mobile, show only branch
```

---

## 7️⃣ UPLOAD PAGE - COPY & PASTE THIS

```
Create the File Upload page.

Page Header:
- Title: "Upload Training Data" (28px bold)
- Subtitle: "Upload LOG+ and VR Learning XLSX files for processing"
- Info alert (blue bg): "Files are processed in background. You can track progress below."

Upload Zone (main):

Drag-Drop Area:
- Background: Light blue (#EFF6FF)
- Border: 2px dashed blue (#2563EB)
- Rounded: 12px
- Padding: 48px vertical, 32px horizontal
- Centered:
  - Upload icon (large, 48px)
  - Title: "Drag & drop files here or click to browse"
  - Subtitle: "Supports XLSX format, max 50MB per file"

Two sections side by side (desktop) / stacked (mobile):

Section 1 - LOG+ File:
- Label: "Mandatory 2026 LOG+ Sheet" (14px bold)
- Required: "Required - XLSX file" (12px red)
- File input with folder icon
- Selected file display: Filename (blue), file size, remove button (x)

Section 2 - VR Learning File:
- Same as Section 1

Buttons (below):
- Upload button: Blue, full width or 200px, bold, disabled if files not selected
- Cancel button: Gray outlined

Upload Progress (appears after upload):
- Title: "Uploading files..." (16px bold)
- 2 progress bars:
  - Filename
  - Progress bar: Gray bg, blue fill, animated
  - Percentage (right): "45%"
  - Status: "Uploading..." or "Processing..." or "Complete ✓"

Upload History (below):

Header:
- Title: "Recent Uploads" (18px bold)
- Refresh button
- Filter: "Show last 7 days"

Table:
Columns: Upload Date | Files | Total Rows | Status | Uploaded By | Action

Status badges:
- Processing: Yellow with spinner
- Complete: Green checkmark
- Failed: Red error icon

Rows: Hover highlights, click to see details

Responsive: Single column upload on mobile
```

---

## 8️⃣ EXPORT PAGE - COPY & PASTE THIS

```
Create the Export/Download page.

Page Header:
- Title: "Export Data" (28px bold)
- Subtitle: "Select sheets and apply filters before downloading"

Left Column (300px) on desktop, full width on mobile:

Card 1 - Select Sheets:
- Title: "Select Sheets" (16px bold)
- Checkboxes:
  ☑ Summary All (checked by default)
  ☑ Mandatory 2026
  ☑ LOG+
  ☑ VR Learning
- Counter: "3 sheets selected"

Card 2 - Export Options:
- Checkbox: "Include formulas and lookups" (checked)
  Help: "Preserves calculations in Excel cells"
- Checkbox: "Include conditional formatting"
  Help: "Color-code completion rates"
- Toggle: "Include charts" (off by default)
  Help: "Summary visualizations"

Card 3 - File Name:
- Input: Placeholder "VR_Learning_Report_2026-01-15"
- Dropdown: XLSX (default) or CSV

Right Column - Filters:

Card 1 - General:
- Search: "Search by directorate, employee..."
- Last upload date: "Data as of Jan 15, 2026 14:30"

Card 2 - By Sheet Filters:

For Summary All:
- Directorate dropdown: "All Directorates"
- Checkbox: "Only > 80% completion"
- Checkbox: "Only < 50% completion"

For Mandatory 2026:
- Status dropdown: "All Status"
- Directorate dropdown: "All Directorates"
- Search: "Search employee ID"

For LOG+:
- Course dropdown: All 20+ courses
- Status dropdown
- Date range: From/To

For VR Learning:
- Region dropdown
- Branch dropdown
- Score slider: Min-Max
- Status dropdown

Bottom Section:

Preview (expandable):
- Title: "Preview" (click to expand)
- Shows first 5 rows per sheet
- Text: "Preview limited to first 5 rows"

Action Buttons (sticky):
- Download button: Full width, blue, "Download XLSX"
  Loading: "Generating file... (45%)"
  Success: Green checkmark "Downloaded!"
- Cancel button: Gray outlined

Responsive: 1 column on mobile, 2 on desktop
```

---

## 9️⃣ ADMIN - USER MANAGEMENT - COPY & PASTE THIS

```
Create the Admin User Management page.

Header:
- Title: "User Management" (28px bold)
- Subtitle: "Manage application users and their roles"

Action Bar:
- Left: Search "Search by username or email..."
- Right: Filter "All Roles" dropdown, "+ Add User" button (blue)

User List Table:

Columns: Username | Email | Full Name | Role | Department | Status | Created | Actions

Role badges:
- Admin: Purple
- Uploader: Blue
- Viewer: Gray

Status badges:
- Active: Green
- Inactive: Gray

Actions column:
- Edit icon (pencil)
- Delete icon (trash)
- Three-dot menu

Rows: Hover blue, padding 16px

Pagination: Show 10/25/50/100 rows, "Showing 1-10 of 45 users"

Create User Button ➜ Modal:

Modal (500px wide, centered):
- Fields:
  - Username (text, lowercase, unique)
  - Email (email input, unique)
  - Full Name (text)
  - Department (text, optional)
  - Password (password input, strength indicator)
  - Role (radio buttons: Admin, Uploader, Viewer)
  - Status (toggle: Active/Inactive)
- Save button (blue, disabled until required fields filled)
- Cancel button (gray)

Delete Modal:

- Icon: Red warning triangle
- Title: "Delete User"
- Message: "Are you sure? This action cannot be undone. User {username} will lose access."
- Info: "All their upload history and audit logs will be preserved."
- Delete button (red)
- Cancel button (gray)

Responsive: Full width on mobile
```

---

## 🔟 ADMIN - AUDIT LOGS - COPY & PASTE THIS

```
Create the Admin Audit Logs viewer page.

Header:
- Title: "Audit Logs" (28px bold)
- Subtitle: "Track all user activities and system events"

Filter Bar (white card, padding 16px):

Filters:
- Action dropdown: "All Actions" → Login, Logout, Upload, Download, User Created, User Deleted
- User dropdown: "All Users" (searchable)
- Status dropdown: "All Status" → Success, Failure, In Progress
- Date range: From date input, To date input
  Presets: Today, Last 7 days, Last 30 days, Custom
- Search: "Search resource name..."
- Apply button (blue)
- Clear filters button (text, gray)

Results Summary:
- "Showing 1-10 of 234 audit entries"
- "Updated 2 minutes ago"

Audit Logs Table:

Columns: Timestamp | User | Action | Resource | Status | IP Address | Details

Timestamp: Format "Jan 15, 2026 14:30:45"

User: Username as blue link

Action: With icon
- upload_started: Upload icon, blue
- upload_completed: Checkmark, green
- download: Download icon, blue
- login: Lock icon, green
- logout: Sign out icon, gray
- user_created: Plus icon, blue
- user_deleted: Minus icon, red

Resource: File name, user name, etc

Status badges:
- Success: Green "✓ Success"
- Failure: Red "✗ Failure"
- In Progress: Yellow "⟳ In Progress"

IP Address: Gray text

Details: Info icon (click to expand and show JSON)

Row styling: Alternating white/gray, hover highlight

Pagination: Show 10/25/50/100, page numbers

Export:
- "Export CSV" button (top right)
- Filename: "audit_logs_YYYY-MM-DD.csv"

Real-time: "New entries" badge, Refresh button

Responsive: Horizontal scroll on mobile, show key columns
```

---

## 🎯 HOW TO USE

### Step 1: Open Claude Design
Go to Claude Design tool (available in Claude interface)

### Step 2: Copy One Prompt
Select and copy one prompt above (e.g., "LOGIN PAGE")

### Step 3: Paste in Claude Design
Paste the prompt into Claude Design chat

### Step 4: Generate
Click "Generate Design" or let Claude create it

### Step 5: Review & Refine
- Review the mockup
- Suggest changes if needed
- Export as PNG or Figma file

### Step 6: Repeat
Go to Step 2 for next page

---

## 📋 RECOMMENDED ORDER

1. **Login Page** - Foundation
2. **Dashboard Layout** - Core container
3. **Summary All Tab** - First table design
4. **Other tabs** (Mandatory 2026, LOG+, VR Learning) - Similar to Summary
5. **Upload Page** - Upload flow
6. **Export Page** - Export flow
7. **Admin User Management** - Admin feature
8. **Admin Audit Logs** - Admin feature

---

## 💡 TIPS FOR BEST RESULTS

✅ **Be specific** - Prompts have all details needed
✅ **One at a time** - Design one page/component at a time
✅ **Review carefully** - Check colors, spacing, typography
✅ **Request changes** - "Make the button larger", "Change color to red"
✅ **Export frequently** - Save designs as you go
✅ **Iterate** - Refine based on feedback
✅ **Reference system** - All use same colors and spacing

---

## 🎨 DESIGN SYSTEM REFERENCE

Keep these constant across all designs:

**Colors:**
- Primary Blue: #2563EB
- Success Green: #10B981
- Danger Red: #EF4444
- Warning Yellow: #F59E0B
- Gray Text: #6B7280
- Dark Gray: #1F2937

**Fonts:**
- Family: Inter, system fonts
- Headings: Bold/Semibold
- Body: Regular 14px
- Small: Regular 12px

**Spacing:**
- Use 8px increments: 8, 16, 24, 32px

**Borders:**
- Radius: 8px (default), 12px (cards)
- Color: Light gray #E5E7EB

---

**Ready to design!** 🎨 Copy a prompt above and start creating beautiful mockups.
