# CMND Analytics - Design Prompts untuk Claude Design

**Complete UI/UX design specifications untuk semua pages dan components**

Gunakan prompts ini dengan **Claude Design** untuk membuat professional mockups dan prototypes.

---

## 🎨 DESIGN SYSTEM

### Color Palette

```
Primary:      #2563EB (Blue)     - Buttons, links, highlights
Secondary:    #10B981 (Green)    - Success, completion
Danger:       #EF4444 (Red)      - Errors, incomplete
Warning:      #F59E0B (Amber)    - Warnings, pending
Neutral:      #6B7280 (Gray)     - Text, backgrounds
Light:        #F3F4F6 (Off-white) - Card backgrounds
Dark:         #1F2937 (Dark gray) - Text on light bg

Success Green:    #10B981 (> 80% completion)
Warning Yellow:   #F59E0B (50-80% completion)
Danger Red:       #EF4444 (< 50% completion)
```

### Typography

```
Font Family:      Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Font Sizes:
  H1: 32px / 40px (bold)
  H2: 24px / 32px (semibold)
  H3: 18px / 28px (semibold)
  Body: 14px / 20px (regular)
  Caption: 12px / 16px (regular)
  
Font Weights:
  Regular: 400
  Medium: 500
  Semibold: 600
  Bold: 700
```

### Spacing

```
4px   (xs)
8px   (sm)
12px  (md)
16px  (lg)
24px  (xl)
32px  (2xl)
```

### Border & Shadows

```
Border radius: 8px (default), 12px (cards), 4px (inputs)
Box shadow:    0 1px 3px rgba(0,0,0,0.1) (subtle)
              0 4px 6px rgba(0,0,0,0.1) (medium)
              0 10px 15px rgba(0,0,0,0.1) (elevated)
```

---

## 1️⃣ LOGIN PAGE PROMPT

### Prompt for Claude Design:

```
Create a professional login page for "CMND Analytics" - 
a bank employee training compliance dashboard for CIMB Niaga.

Layout:
- Left side: Hero section with brand, tagline, and benefits
- Right side: Login form (50% width)
- Responsive: Stack vertically on mobile

Left Hero Section:
- Logo at top-left
- Title: "Mandatory Completion Analytics"
- Subtitle: "Mandatory LOG+ & VR Learning Tracking System"
- 3 benefit bullets with icons (security, efficiency, analytics)
- Background: Linear gradient from blue (#2563EB) to indigo
- Text: White

Right Form Section:
- Card with white background, rounded 12px, subtle shadow
- Title: "Login"
- Username input field:
  - Label: "Username"
  - Placeholder: "admin@cimb.local"
  - Icon: User icon on left
  - Border: 1px gray, focus: blue border
- Password input field:
  - Label: "Password"
  - Placeholder: "••••••••"
  - Icon: Lock icon on left
  - Show/hide password toggle
- "Remember me" checkbox
- "Forgot password?" link (gray text, right aligned)
- Login button:
  - Full width
  - Background: Blue (#2563EB)
  - Text: White, bold
  - Hover: Darker blue
  - Loading state: Spinner + "Logging in..."
- Error message area (red text) if login fails
- Bottom: "Need access? Contact administrator"

Colors:
- Background: Light gray (#F3F4F6)
- Form background: White
- Text: Dark gray (#1F2937)
- Inputs: Light border, focus blue
- Buttons: Blue (#2563EB)

Typography:
- Logo: Bold 24px
- Title: Bold 20px
- Labels: Medium 12px gray
- Body text: Regular 14px

Interactive States:
- Input focus: Blue border, blue shadow
- Button hover: Darker blue
- Button loading: Disabled state with spinner
- Error state: Red border on input + red error text below
- Success state (before redirect): Green checkmark
```

---

## 2️⃣ DASHBOARD - MAIN LAYOUT PROMPT

### Prompt for Claude Design:

```
Create the main dashboard layout for CMND Analytics with left sidebar navigation 
and top navbar.

Top Navbar (full width, 64px height):
- Left side: Logo + "CMND Analytics" text (16px bold)
- Center: Page title (20px semibold, dark)
- Right side: 
  - Search icon (for global search)
  - Bell icon for notifications (with red badge showing count)
  - User avatar + dropdown menu
    - Dropdown items: Profile, Settings, Audit Logs, Logout

Left Sidebar (280px width, sticky):
- Background: White with subtle top border accent (#2563EB)
- Header: Collapse toggle on right
- Navigation items:
  1. Dashboard (icon: bar-chart-2)
     - Sub-items: Summary All, Mandatory 2026, LOG+, VR Learning
  2. Upload (icon: upload-cloud)
  3. Export (icon: download)
  4. Admin (icon: settings, visible only for admin role)
     - Sub-items: Users, Audit Logs
  5. Help (icon: help-circle)

Sidebar Styling:
- Active item: Blue background (#2563EB), white text
- Hover: Light gray background
- Sub-items: Smaller text, 16px left padding
- Icons: 20px size, left margin 12px
- Text: 14px medium

Main Content Area:
- Background: Light gray (#F3F4F6)
- Padding: 24px
- Takes remaining width after sidebar

States:
- Sidebar collapsed: Icons only, 80px width
- Responsive: Sidebar becomes mobile drawer on <1024px
- Mobile drawer: Full width overlay, slide in from left

Colors:
- Sidebar bg: White (#FFFFFF)
- Active item: Blue (#2563EB)
- Hover bg: Light gray (#F9FAFB)
- Dividers: Light gray border (#E5E7EB)
- Text: Dark gray (#1F2937)
```

---

## 3️⃣ DASHBOARD - TABBED CONTENT PROMPT

### Prompt for Claude Design:

```
Create the dashboard tabbed content area with 4 tabs and a data table for each tab.

Tab Bar (just below navbar):
- Tabs: "Summary All" | "Mandatory 2026" | "LOG+" | "VR Learning"
- Active tab: Blue text (#2563EB) with bottom border
- Inactive tabs: Gray text (#6B7280)
- Tab height: 48px, padding: 0 24px
- Border: Bottom gray line

Tab Content: Summary All (shown on first tab)

Card Header (above table):
- Left side:
  - Title: "Summary All" (20px semibold)
  - Subtitle: "Completion rates by directorate" (14px gray)
- Right side:
  - Search box: Placeholder "Search directorate..."
  - Filter dropdown: "All Directorates" with checkboxes
  - "Refresh" button (icon only)
  - Export button: "Export to Excel" (blue background)

Data Table:
- Columns:
  1. Directorate (25% width)
  2. Total Employees (15%)
  3. LOG+ Completed (12%)
  4. LOG+ % (12%)
  5. VR Completed (12%)
  6. VR % (12%)
  7. Combined % (12%)

- Row styling:
  - Alternating white/light gray backgrounds
  - Hover: Light blue highlight
  - Padding: 16px per row
  
- Completion rate cells (% columns):
  - Green background + white text if > 80%
  - Yellow background + dark text if 50-80%
  - Red background + white text if < 50%
  - Percentage value centered

- Header row:
  - Background: Light gray (#F3F4F6)
  - Bold text
  - Sortable: Click to sort, arrow icon appears

Table Footer:
- Left: "Showing 1-10 of 19 directorates"
- Right: Pagination buttons (Previous, 1-2-3..., Next)

Loading state:
- Skeleton loaders for each row
- Pulse animation
- "Loading..." text in center

Empty state:
- Icon: Empty inbox
- Text: "No data available"
- Subtext: "Try adjusting your filters"
```

---

## 4️⃣ DASHBOARD - OTHER TABS PROMPT

### Prompt for Claude Design:

```
Design the Mandatory 2026 and LOG+ tabs (similar table structure but different columns).

Mandatory 2026 Tab:

Filters (above table):
- Search: "Search by employee ID or name..."
- Status filter: Dropdown "All Status" → Completed, Incompleted
- Directorate filter: Dropdown "All Directorates"
- Apply button

Table columns:
1. Employee ID (12%)
2. Employee Name (20%)
3. Directorate (20%)
4. LOG+ Status (12%) → "Completed"/"Incompleted" badge
5. LOG+ % (10%) → Percentage with color
6. VR Status (12%) → Badge
7. Overall Status (12%) → Badge with color
8. Action (2%) → Eye icon (view details)

Status badges:
- "Completed": Green background (#10B981), white text
- "Incompleted": Red background (#EF4444), white text

LOG+ Tab:

Additional features:
- Course name filter (dropdown with 20+ courses)
- Date range filter: "From" and "To" date inputs
- Quick filters: "Completed Today", "Last 7 Days", "This Month"

Table columns:
1. Employee ID (12%)
2. Name (15%)
3. Directorate (18%)
4. Course (25%)
5. Status (10%) → Badge
6. Score (8%) → Percentage
7. Completion Date (10%) → Formatted date
8. Action (2%) → Details icon

Course name examples:
- BUSINESS CONTINUITY MANAGEMENT (BCM)
- CODE OF ETHICS
- DATA MANAGEMENT
- REFRESHMENT AML, CFT & CPF
- ANTI FRAUD MANAGEMENT

Row highlighting:
- If score = 100: Light green background
- If score < 50: Light red background
- Hover: Blue highlight

VR Learning Tab:

Additional features:
- Region filter (dropdown, 29 regions)
- Branch filter (dropdown, 415 branches)
- Score range slider: "Min score 0 → 100"

Table columns:
1. Employee ID (12%)
2. Name (15%)
3. Directorate (15%)
4. Region (12%)
5. Branch (12%)
6. Forward 30 Score (12%) → Score with color
7. Status (15%) → Badge
8. Completion Time (10%) → Date format

Score coloring:
- > 80: Green
- 50-80: Yellow
- < 50: Red
- Not completed: Gray

Pagination (all tabs):
- Show 10, 25, 50, 100 rows per page
- Current page info: "Page 1 of 5"
- Load more button option for large tables
```

---

## 5️⃣ UPLOAD PAGE PROMPT

### Prompt for Claude Design:

```
Create the File Upload page with drag-and-drop zone and upload history.

Page Header:
- Title: "Upload Training Data" (28px bold)
- Subtitle: "Upload LOG+ and VR Learning XLSX files for processing" (14px gray)
- Info alert: "Files are processed in background. You can track progress below." (blue background)

Upload Zone (main section):

Drag-Drop Area:
- Background: Light blue (#EFF6FF)
- Border: 2px dashed blue (#2563EB)
- Border radius: 12px
- Padding: 48px vertical, 32px horizontal
- Centered content:
  - Upload icon (large, 48px)
  - Title: "Drag & drop files here or click to browse" (16px medium)
  - Subtitle: "Supports XLSX format, max 50MB per file" (14px gray)

Two file input sections (side by side on desktop, stacked on mobile):

Section 1 - LOG+ File:
- Label: "Mandatory 2026 LOG+ Sheet" (14px bold)
- Requirement: "Required - XLSX file" (12px red)
- File input area with folder icon
- Selected file display:
  - Filename (14px bold blue)
  - File size (12px gray)
  - Remove button (x icon, red hover)

Section 2 - VR Learning File:
- Label: "VR Learning Sheet" (14px bold)
- Requirement: "Required - XLSX file" (12px red)
- File input area with folder icon
- Selected file display (same as above)

Action Buttons (below inputs):
- Upload button: 
  - Full width or 200px
  - Blue background (#2563EB)
  - White text, bold
  - Disabled if files not selected
  - Hover: Darker blue
- Cancel button: Outlined style (gray border, gray text)

Upload Progress (appears after clicking Upload):
- Progress container (white bg, card style)
- Progress title: "Uploading files..." (16px semibold)
- 2 progress bars (one for each file):
  - Filename (14px)
  - Progress bar: 
    - Background: Light gray (#E5E7EB)
    - Fill: Blue (#2563EB), animated
    - Percentage text: Right aligned (bold)
  - Status: "Uploading..." or "Processing..." or "Complete ✓"

Upload History Section (below):

Header:
- Title: "Recent Uploads" (18px bold)
- Refresh button
- Filter: "Show last 7 days" dropdown

Upload History Table:
- Columns:
  1. Upload Date & Time (formatted: "Jan 15, 2026 14:30")
  2. Files (LOG+ + VR count)
  3. Total Rows (count)
  4. Status (badge: Processing, Complete, Failed)
  5. Uploaded By (username)
  6. Action (eye icon for details)

Status badges:
- Processing: Yellow with spinner
- Complete: Green checkmark
- Failed: Red with error icon

Row click → Show upload details modal:
- Files processed
- Number of rows inserted
- Processing time
- Any errors (if failed)
- Download report button

Responsive:
- Mobile: Single column upload, stack file inputs
- Tablet: 2 columns
- Desktop: Side-by-side with history below
```

---

## 6️⃣ EXPORT PAGE PROMPT

### Prompt for Claude Design:

```
Create the Export/Download page with sheet selection, filters, and export options.

Page Header:
- Title: "Export Data" (28px bold)
- Subtitle: "Select sheets and apply filters before downloading" (14px gray)

Main Container (2 columns on desktop, 1 on mobile):

Left Column - Sheet Selection (300px):

Card 1: Select Sheets
- Background: White, rounded 12px, subtle shadow
- Title: "Select Sheets" (16px bold)
- Checkboxes for each sheet:
  ☑ Summary All (checked by default)
  ☑ Mandatory 2026
  ☑ LOG+
  ☑ VR Learning
- Icon before each: 📊📋📝📊
- Text size: 14px
- Interactive: Check/uncheck
- Counter: "3 sheets selected" (12px gray)

Card 2: Export Options
- Title: "Export Options" (16px bold)
- Checkbox: "Include formulas and lookups" (checked by default)
  Help text: "Preserves calculations in Excel cells"
- Checkbox: "Include conditional formatting"
  Help text: "Color-code completion rates"
- Toggle: "Include charts" (default off)
  Help text: "Summary visualizations (takes more time)"

Card 3: File Name
- Input field:
  - Label: "Filename" (12px)
  - Placeholder: "VR_Learning_Report_2026-01-15"
  - Text: 14px
- Dropdown: File format
  - XLSX (default)
  - CSV (for each sheet separately)

Right Column - Filters (remaining width):

Card 1: General Filters
- Search input: "Search by directorate, employee..."
- Last upload date display: "Data as of Jan 15, 2026 14:30"
- Info: "You can further filter in the tabs below"

Card 2: By Sheet Filters

Filter Set for Summary All:
- Completion Rate Filter:
  - Dropdown: "All Directorates"
  - Checkbox: "Only > 80% completion"
  - Checkbox: "Only < 50% completion"

Filter Set for Mandatory 2026:
- Status: Dropdown "All Status" → Completed, Incompleted
- Directorate: Dropdown "All Directorates"
- Employee ID: Text search

Filter Set for LOG+:
- Course: Dropdown with all 20+ courses
- Status: Dropdown "All Status"
- Date range: "From" and "To" date inputs

Filter Set for VR Learning:
- Region: Dropdown
- Branch: Dropdown
- Score range: Min-Max slider
- Status: Dropdown

Apply Filters Button: Blue, below filters

Bottom Section - Export Actions:

Preview section (expandable):
- Title: "Preview" (14px bold, click to expand)
- Shows first 5 rows of each selected sheet
- Scrollable table preview
- Text: "Preview limited to first 5 rows"

Action Buttons (sticky at bottom):
- Download button:
  - Full width or 300px
  - Blue background (#2563EB)
  - Icon: Download icon
  - Text: "Download XLSX" (bold)
  - Loading state: Spinner + "Generating file..."
  - Success state: Green checkmark "Downloaded!"
- Cancel button: Outlined style

Export Status:
- Real-time progress: "Generating file... (45%)"
- Estimated time: "~30 seconds remaining"
- Current sheet: "Processing: LOG+ sheet"

After download:
- Success message: "File downloaded successfully" (green background)
- File details: 
  - Filename (bold)
  - File size: "2.5 MB"
  - Sheets included: List
- "Download again" link or button
- "Export another file" button

Responsive:
- Desktop: 2 columns
- Tablet: 1 column, stacked
- Mobile: Full width, filters collapse
```

---

## 7️⃣ ADMIN PANEL - USER MANAGEMENT PROMPT

### Prompt for Claude Design:

```
Create the Admin Panel for User Management (accessible only to admin role).

Sidebar indicator: Add "Admin Panel" section with icon (settings/shield)

Admin User Management Page:

Header:
- Title: "User Management" (28px bold)
- Subtitle: "Manage application users and their roles" (14px gray)

Action Bar:
- Left: Search box "Search by username or email..."
- Right: 
  - Filter dropdown: "All Roles" → Admin, Uploader, Viewer
  - Create User button: Blue, "+ Add User"

User List Table:

Columns:
1. Username (20%)
2. Email (25%)
3. Full Name (20%)
4. Role (12%) → Badge
5. Department (15%)
6. Status (8%) → Badge
7. Created (15%)
8. Actions (8%)

Row styling:
- White background
- Hover: Light blue highlight
- Alternating gray stripes
- Padding: 16px

Role badges:
- Admin: Purple background
- Uploader: Blue background
- Viewer: Gray background

Status badges:
- Active: Green background, "Active"
- Inactive: Gray background, "Inactive"

Actions column:
- Edit icon (pencil) → Opens edit modal
- Delete icon (trash) → Opens delete confirmation
- More menu (three dots) → Options: Reset password, Resend invite, View audit logs

Create/Edit User Modal:

Modal size: 500px wide, centered

Fields:
- Username: Text input (must be unique, lowercase)
- Email: Email input (must be unique)
- Full Name: Text input
- Department: Text input (optional)
- Password: Password input (required for new users)
  - Strength indicator: Weak → Strong (color coded)
  - Show/hide toggle
- Role: Radio buttons or Dropdown
  - Admin
  - Uploader
  - Viewer
- Status: Toggle "Active/Inactive"

Buttons:
- Save button: Blue, disabled until required fields filled
- Cancel button: Outlined

Delete Confirmation Modal:

- Icon: Warning triangle (red)
- Title: "Delete User" (18px bold)
- Message: "Are you sure? This action cannot be undone. User {username} will lose access to the system."
- Warning: "All their upload history and audit logs will be preserved."
- Buttons:
  - Delete button: Red background
  - Cancel button: Gray background

Pagination & Results:
- Rows per page: Dropdown "10, 25, 50, 100"
- Page info: "Showing 1-10 of 45 users"
- Pagination buttons: Previous, number buttons, Next

Empty state:
- Icon: Users icon
- Text: "No users found"
- Subtext: "Create the first user with the + Add User button"
- Create User button
```

---

## 8️⃣ ADMIN PANEL - AUDIT LOGS PROMPT

### Prompt for Claude Design:

```
Create the Admin Audit Logs Viewer page.

Page Header:
- Title: "Audit Logs" (28px bold)
- Subtitle: "Track all user activities and system events" (14px gray)

Filter Bar:

Background: White, padding 16px, rounded 12px, subtle shadow
Filters (flex wrap on mobile):
- Action filter: Dropdown "All Actions"
  Options: Login, Logout, Upload, Download, User Created, User Deleted, etc.
  
- User filter: Dropdown "All Users"
  Options: Searchable list of usernames
  
- Status filter: Dropdown "All Status"
  Options: Success, Failure, In Progress
  
- Date range:
  - From: Date input, calendar picker
  - To: Date input, calendar picker
  - Presets: Today, Last 7 days, Last 30 days, Custom
  
- Search: Text input "Search resource name..."

- Apply button: Blue
- Clear filters button: Text button (gray)

Results Summary:
- "Showing 1-10 of 234 audit entries" (gray text)
- Last updated: "Updated 2 minutes ago" (gray text)

Audit Logs Table:

Columns:
1. Timestamp (18%) → "Jan 15, 2026 14:30:45"
2. User (15%) → Username with blue link
3. Action (15%) → With icon before (upload, download, login, etc)
4. Resource (20%) → File name, user name, etc
5. Status (10%) → Badge (Success/Failure)
6. IP Address (10%) → Gray text
7. Details (5%) → Info icon (click to expand)

Row styling:
- White background
- Hover: Light gray highlight
- Alternating gray row backgrounds
- Padding: 12px 16px

Action badges/icons:
- upload_started: Upload icon, blue
- upload_completed: Checkmark, green
- download: Download icon, blue
- login: Lock icon, green
- logout: Sign out icon, gray
- user_created: User plus icon, blue
- user_deleted: User minus icon, red

Status badges:
- Success: Green background, "✓ Success"
- Failure: Red background, "✗ Failure"
- In Progress: Yellow background, "⟳ In Progress"

Details Row (click on details icon):
- Expands to show full details in JSON format (code block style)
- Example for upload:
  ```
  {
    "upload_id": "uuid-123",
    "files": ["log_plus.xlsx", "vr_learning.xlsx"],
    "rows_processed": { "log_plus": 11414, "vr_learning": 10340 },
    "file_sizes": { "log_plus": "2.5 MB", "vr_learning": "2.1 MB" },
    "processing_time": "45 seconds",
    "filters_applied": {}
  }
  ```

- Example for download:
  ```
  {
    "sheets": ["summary_all", "mandatory_2026"],
    "file_size": "1.8 MB",
    "file_name": "VR_Learning_Report_2026-01-15.xlsx",
    "filters_applied": { "directorate": "IT Division", "status": "Completed" }
  }
  ```

Pagination:
- Rows per page: Dropdown "10, 25, 50, 100"
- Page buttons: 1-2-3...
- Next/Previous buttons

Export Audit Logs:
- Button at top right: "Export CSV"
- Generates CSV with all visible/filtered logs
- Filename: "audit_logs_YYYY-MM-DD.csv"

Loading state:
- Skeleton rows with pulse animation
- "Loading audit logs..." text

Empty state:
- Icon: Empty box
- Text: "No audit logs found"
- Subtext: "Try adjusting your filters or date range"

Real-time updates (optional):
- Badge: "New entries" (red dot)
- "Refresh" button to load latest entries
- Auto-refresh every 30 seconds (indicator: "Auto-refresh on")
```

---

## 9️⃣ MODALS & COMPONENTS PROMPT

### Prompt for Claude Design:

```
Design common modals, alerts, and reusable components for CMND Analytics.

Alert Messages:

Success Alert:
- Background: Light green (#ECFDF5)
- Border left: 4px green (#10B981)
- Icon: Checkmark in green circle
- Title: "Success" (bold)
- Message: Success message text
- Close button: X
- Example: "File uploaded successfully. Processing started."

Error Alert:
- Background: Light red (#FEF2F2)
- Border left: 4px red (#EF4444)
- Icon: Alert icon in red circle
- Title: "Error" (bold)
- Message: Error details
- Close button: X
- Example: "Upload failed. File format is invalid."

Warning Alert:
- Background: Light amber (#FFFBEB)
- Border left: 4px amber (#F59E0B)
- Icon: Alert triangle in amber
- Title: "Warning" (bold)
- Message: Warning message
- Close button: X
- Example: "Large file detected. Upload may take longer."

Info Alert:
- Background: Light blue (#EFF6FF)
- Border left: 4px blue (#2563EB)
- Icon: Info icon in blue circle
- Title: "Information" (bold)
- Message: Info message
- Close button: X
- Example: "This action is being logged for audit purposes."

Loading Spinner:

Style: Rotating circle with blue gradient
Size options: Small (24px), Medium (40px), Large (56px)
Animation: Smooth 1 second rotation, infinite
Text below (optional): "Loading..." or custom message

Confirmation Dialog:

Modal size: 400px, centered
- Icon at top: Large icon (warning/question)
- Title: 18px bold
- Message: Body text, centered
- Two buttons at bottom:
  - Confirmation button: Blue (delete shows red)
  - Cancel button: Gray outline

Examples:
1. Delete confirmation
   - Icon: Red trash icon
   - Title: "Confirm Delete"
   - Message: "Are you sure? This cannot be undone."
   - Buttons: "Delete" (red) | "Cancel"

2. Logout confirmation
   - Icon: Sign out icon
   - Title: "Sign Out"
   - Message: "Are you sure you want to log out?"
   - Buttons: "Sign Out" (blue) | "Cancel"

Buttons Styles:

Primary Button:
- Background: Blue (#2563EB)
- Text: White, bold
- Padding: 10px 24px
- Hover: Darker blue (#1D4ED8)
- Disabled: Gray with opacity

Secondary Button:
- Background: Gray (#F3F4F6)
- Text: Dark gray (#1F2937), bold
- Border: 1px gray
- Hover: Light gray

Danger Button:
- Background: Red (#EF4444)
- Text: White, bold
- Hover: Darker red

Ghost Button:
- Background: Transparent
- Text: Blue (#2563EB)
- Border: 1px blue
- Hover: Light blue background

Form Inputs:

Text Input:
- Border: 1px gray (#D1D5DB)
- Padding: 10px 12px
- Border radius: 8px
- Focus: Blue border, blue shadow
- Placeholder: Light gray text
- Font: 14px

Select Dropdown:
- Similar styling to text input
- Arrow icon on right (gray)
- Hover: Light gray background
- Open: Shows options list with white background

Checkbox:
- Square 16px
- Border: 1px gray
- Checked: Blue background, white checkmark
- Label: 14px, left margin 8px

Radio Button:
- Circle 16px
- Border: 1px gray
- Selected: Blue background, white dot
- Label: 14px, left margin 8px

Toggle Switch:
- Background: Gray (#D1D5DB)
- Circle: White, with smooth animation
- Enabled: Blue background, circle on right
- Size: 44px width, 24px height

Badges:

Status badges (existing):
- Completed: Green background, white text
- Incompleted: Red background, white text
- Processing: Yellow background, dark text
- Active: Green background, white text
- Inactive: Gray background, white text

Role badges:
- Admin: Purple background, white text
- Uploader: Blue background, white text
- Viewer: Gray background, white text

Count badges (e.g., notification count):
- Red circular background
- White number, bold, centered
- Size: 20px diameter (fit on icon)

Cards & Containers:

Basic Card:
- Background: White
- Border radius: 12px
- Padding: 20px
- Shadow: Subtle (0 1px 3px rgba(0,0,0,0.1))
- Hover: Slightly elevated shadow

Interactive Card:
- Same as basic card
- Hover: Slight lift, darker shadow
- Cursor: Pointer

Cards with Actions (top right):
- Three dot menu icon (dark gray)
- Hover: Show action menu

Dividers:
- Horizontal: 1px light gray border
- Margin: 12px 0 or 16px 0

Empty States:

Icon: Large, light gray color
Title: Bold 16px
Message: Gray 14px
Action button: Optional, blue
Centered, with vertical spacing

Loading Skeleton:

- Similar shape to actual content
- Gray gradient background
- Pulse animation (opacity fade in/out)
- Rounded corners, similar to actual element
```

---

## 🔟 MOBILE RESPONSIVE DESIGN PROMPT

### Prompt for Claude Design:

```
Ensure all pages are responsive and work well on mobile devices.

Breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Mobile Adaptations:

1. Navigation:
   - Sidebar → Bottom tab bar or hamburger menu
   - Navbar remains at top but more compact
   - Hamburger icon on mobile opens slide-out menu

2. Layout:
   - Dashboard tabs → Horizontal scroll if needed
   - Two-column layouts → Single column stack
   - Filters → Collapse into "Show Filters" button
   - Table columns → Prioritize important columns, hide if needed
   - Horizontal tables → Horizontal scroll or card view

3. Input Fields:
   - Full width inputs
   - Touch-friendly: Minimum 44px height
   - Keyboard-aware: Input doesn't get hidden by virtual keyboard

4. Buttons:
   - Full width or minimum 44px height
   - Larger spacing between buttons (easier touch target)
   - Stack vertically if multiple buttons

5. Upload Page:
   - Drag-drop area remains large for touch
   - File inputs large and clearly tappable

6. Tables:
   - On mobile: Consider card view instead of table
   - Card per row with all info displayed
   - Swipe for actions (edit, delete)

7. Modals:
   - Full width on mobile with padding
   - Scrollable content if needed
   - Bottom sheet style for action menus

8. Pagination:
   - Page number buttons smaller or hidden
   - Show Previous/Next and current page only
   - "1 of 5" format

9. Search/Filter:
   - Full width search bars
   - Dropdown filters → Expandable buttons

10. Colors & Contrast:
    - Maintain color contrast for readability
    - Text size: Minimum 14px on mobile
    - Touch targets: Minimum 44x44px

Specific Mobile Examples:

Mobile Dashboard:
- Top navbar with hamburger menu
- Tab bar horizontal scrollable
- Table → Card view
  Each card shows:
    - Title (bold)
    - Subtitle
    - 2-3 key metrics
    - Status badge
    - Action button or menu

Mobile Upload:
- Large drag-drop area
- File inputs stacked vertically
- Upload history: Card view with file names and status
- Card can be swiped for actions

Mobile Export:
- Filters in collapsible section
- "Show Filters" toggle button
- Sheet selection: Checkboxes stacked
- Export options: Toggles stacked
- Full-width download button at bottom

Mobile Admin:
- User list: Card view
- Each card: Username, email, role badge, status
- Tap card to expand or tap menu icon for actions
- Add user button: Fixed at bottom
```

---

## 🛠️ HOW TO USE THESE PROMPTS WITH CLAUDE DESIGN

### Option 1: One-by-One Mockups (Recommended)

```
For Login Page:
1. Open Claude Design
2. Copy the "LOGIN PAGE PROMPT" above
3. Paste into Claude Design
4. Click "Generate Design"
5. Review and refine
6. Export as PNG/Figma

Repeat for each page.
```

### Option 2: Complete System Design

```
1. Copy all prompts
2. Send to Claude Design as: "Create comprehensive UI mockups for the entire CMND Analytics dashboard following these specifications: [paste all prompts]"
3. Claude Design will create all screens as a connected design system
```

### Option 3: Design Components Library

```
Copy the "MODALS & COMPONENTS" section
Use as foundation for reusable component library
All pages should use these consistent components
```

---

## 📊 DESIGN HANDOFF CHECKLIST

When design is complete:

- [ ] All 8 main pages designed
- [ ] Mobile responsive versions created
- [ ] All interactive states defined (hover, focus, active, disabled)
- [ ] Loading states for all async operations
- [ ] Error states and validation messages
- [ ] Empty states for no-data scenarios
- [ ] Color palette matches specification
- [ ] Typography follows spec
- [ ] Spacing consistent (8px grid)
- [ ] Component library documented
- [ ] Design tokens exported (colors, fonts, shadows)
- [ ] Responsive breakpoints tested
- [ ] Accessibility considered (contrast, focus states)
- [ ] Design file exported (Figma, XD, or Sketch)
- [ ] Component specs documented for developers

---

## 🎨 CLAUDE DESIGN EXPORT OPTIONS

After creating mockups:

1. **Export as Images**: PNG/SVG for documentation
2. **Export to Figma**: For collaborative design refinement
3. **Generate React Components**: Claude Design can generate JSX code
4. **Export Design Tokens**: JSON file for developers
5. **Component Library**: Reusable component specs for implementation

---

## 📝 ADDITIONAL DESIGN NOTES

### Accessibility Requirements

- Color contrast ratio: 4.5:1 for text
- Focus visible: Blue outline 2px
- Button minimum 44x44px (mobile)
- Keyboard navigation support
- ARIA labels for screen readers
- Form validation messages clear

### Performance Considerations

- Minimize animations on mobile
- Lazy load table data
- Skeleton loaders for slow networks
- Compress images
- Progressive enhancement

### Brand Guidelines

- Logo: CMND Analytics (blue color)
- Primary color: Blue #2563EB
- Professional, clean aesthetic
- Banking industry context (trustworthy)
- Enterprise SaaS style
- No rounded corners for data heavy tables (12px for cards only)

---

**Ready to generate UI mockups!** 🎨

Use these prompts directly with Claude Design to create professional mockups for your development team.
