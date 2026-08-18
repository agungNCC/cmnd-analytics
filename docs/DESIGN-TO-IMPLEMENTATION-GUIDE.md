# CMND Analytics - Design to Implementation Guide

**Step-by-step cara mengubah Claude Design mockups menjadi React components**

---

## 🎯 OVERVIEW: DESIGN → CODE WORKFLOW

```
Claude Design
    ↓
Generate Mockup (PNG visual)
    ↓
Export to Figma (detailed specs)
    ↓
Extract Design Tokens (colors, fonts, spacing)
    ↓
Build React Components (match mockup exactly)
    ↓
Test Responsive (mobile/tablet/desktop)
    ↓
Deploy to Server
```

---

## 📋 PHASE 1: DESIGN GENERATION & EXPORT

### Step 1: Generate Design in Claude Design

```
1. Paste prompt from CLAUDE-DESIGN-QUICK-PROMPTS.md
2. Claude Design generates mockup
3. Review all details (colors, spacing, components)
4. Request refinements if needed
```

### Step 2: Export Options

**Option A: PNG (For Documentation)**
```
Use for:
- README.md screenshots
- Design documentation
- Team presentations
- Design portfolio

How:
1. Click "Export" in Claude Design
2. Select "PNG" or "Download Image"
3. Save to: /docs/mockups/01-login-page.png
```

**Option B: Figma (For Development Team) ← RECOMMENDED**
```
Use for:
- Detailed measurements
- Color picker (exact hex codes)
- Typography specs
- Spacing/padding info
- Component library
- Developer handoff
- Collaborative refinement

How:
1. Click "Export to Figma" in Claude Design
2. Sign in to Figma account
3. Design opens in Figma editor
4. Share link with team
5. Developers can inspect colors, fonts, dimensions

Link format: https://www.figma.com/design/[file-id]/[page-name]
```

**Option C: Design Tokens (For Developers)**
```
Use for:
- Extract colors → Add to Tailwind config
- Extract fonts → Add to CSS
- Extract spacing → Add to CSS variables
- Extract shadows → Add to CSS

How:
1. Click "Export Tokens" or "Design System"
2. Get JSON file with all tokens
3. Import to: tailwind.config.js or CSS variables
```

---

## 📊 PHASE 2: EXTRACT DESIGN TOKENS

### What are Design Tokens?

Design tokens adalah **reusable values** untuk:
- Colors (#2563EB, #10B981, etc)
- Typography (font-size, font-weight, line-height)
- Spacing (4px, 8px, 16px, 24px, 32px)
- Shadows (0 1px 3px rgba(...), etc)
- Border radius (8px, 12px, etc)

### Extract from Figma Export

```json
{
  "colors": {
    "primary": "#2563EB",
    "secondary": "#10B981",
    "danger": "#EF4444",
    "warning": "#F59E0B",
    "dark": "#1F2937",
    "light": "#F3F4F6",
    "gray": "#6B7280",
    "border": "#E5E7EB"
  },
  "typography": {
    "h1": {
      "fontSize": "32px",
      "fontWeight": "bold",
      "lineHeight": "40px"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "600",
      "lineHeight": "32px"
    },
    "body": {
      "fontSize": "14px",
      "fontWeight": "400",
      "lineHeight": "20px"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "2xl": "32px"
  },
  "shadows": {
    "sm": "0 1px 3px rgba(0,0,0,0.1)",
    "md": "0 4px 6px rgba(0,0,0,0.1)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)"
  }
}
```

### Add to Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '14px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.1)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
      },
    },
  },
}
```

---

## 🎨 PHASE 3: BUILD REACT COMPONENTS

### Step 1: Map Design to Components

**Design Page:**
```
Login Page (mockup dari Claude Design)
├── Hero Section
│   ├── Logo
│   ├── Title
│   ├── Subtitle
│   └── Benefit List
└── Form Section
    ├── Title
    ├── Username Input
    ├── Password Input
    ├── Remember Me Checkbox
    ├── Forgot Password Link
    ├── Login Button
    └── Help Text
```

**React Components to Create:**
```
src/
├── components/
│   ├── HeroSection.jsx
│   ├── LoginForm.jsx
│   ├── Input.jsx (reusable)
│   ├── Button.jsx (reusable)
│   ├── Checkbox.jsx (reusable)
│   └── Link.jsx (reusable)
└── pages/
    └── Login.jsx
```

### Step 2: Create Reusable Components

**Button Component** (from design specs)

```jsx
// components/Button.jsx
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'font-bold rounded transition-colors';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300',
    danger: 'bg-danger text-white hover:bg-red-600 disabled:bg-gray-400',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg h-15',  // 60px tall (from design)
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

**Input Component** (from design specs)

```jsx
// components/Input.jsx
export const Input = ({ 
  label, 
  type = 'text', 
  placeholder,
  icon = null,
  error = null,
  required = false,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2 text-base
            border rounded-lg
            ${icon ? 'pl-10' : 'pl-4'}
            ${error 
              ? 'border-danger focus:border-danger focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary focus:ring-blue-500'
            }
            focus:outline-none focus:ring-2
            transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
};
```

### Step 3: Build Page Component

**Login Page** (matching mockup)

```jsx
// pages/Login.jsx
import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Checkbox } from '../components/Checkbox';
import { UserIcon, LockIcon } from 'lucide-react';

export const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store token, redirect to dashboard
      } else {
        setError('Login failed. Check credentials.');
      }
    } catch (err) {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Hero Section - Blue Gradient */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-blue-900 text-white p-12 flex-col justify-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">CMND Analytics</h1>
        </div>
        
        {/* Title & Subtitle */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Training Compliance Made Simple
          </h2>
          <p className="text-lg text-blue-100">
            Mandatory LOG+ & VR Learning Tracking System
          </p>
        </div>
        
        {/* Benefits */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <ShieldIcon className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Secure & Compliant</h3>
              <p className="text-sm text-blue-100">Enterprise-grade security for sensitive training data</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <TrendingUpIcon className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Real-time Analytics</h3>
              <p className="text-sm text-blue-100">Track completion rates across all departments</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Automated Reporting</h3>
              <p className="text-sm text-blue-100">Export reports with advanced Excel functionality</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right: Form Section - White */}
      <div className="flex-1 flex items-center justify-center bg-light p-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
            
            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-danger text-danger rounded">
                {error}
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <Input
                label="Username"
                type="text"
                placeholder="admin@cimb.local"
                icon={<UserIcon size={20} />}
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
              
              {/* Password */}
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<LockIcon size={20} />}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              
              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center">
                <Checkbox
                  label="Remember me"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                />
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Login
              </Button>
            </form>
            
            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Need access?{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                Contact administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 PHASE 4: RESPONSIVE IMPLEMENTATION

### Tailwind Breakpoints

```javascript
// From design specs: Mobile, Tablet, Desktop

Mobile (< 640px):
- Single column layout
- Full-width elements
- Touch-friendly 44px buttons
- Stack inputs vertically

Tablet (640px - 1024px):
- 2-column where applicable
- Medium spacing
- Adjusted typography

Desktop (> 1024px):
- Full layout
- Hero + Form side-by-side
- Optimal spacing
```

### Responsive Code Example

```jsx
// Login page responsive
<div className="min-h-screen flex flex-col md:flex-row">
  {/* Hero: hidden on mobile, visible on tablet+ */}
  <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-blue-900">
    {/* Hero content */}
  </div>
  
  {/* Form: full width on mobile, 50% on tablet+ */}
  <div className="w-full md:w-1/2 flex items-center justify-center">
    {/* Form content */}
  </div>
</div>
```

---

## 🧩 PHASE 5: COMPONENT MAPPING FOR ALL PAGES

### Login Page → Components

```
from Figma/Design:
├── Layout: Two-column (hero + form)
├── Hero Section: Brand, gradient bg, benefits
├── Form: Card with inputs, button, links
├── Inputs: With icons, labels, error states
├── Button: Primary style, loading state
└── Responsive: Stack on mobile

React Implementation:
└── pages/Login.jsx (uses reusable Button, Input, Checkbox components)
```

### Dashboard Page → Components

```
from Figma/Design:
├── Navbar: Logo, title, user menu
├── Sidebar: Navigation items
├── Tab Bar: 4 tabs (Summary, Mandatory, LOG+, VR)
├── Table: Headers, rows, pagination
├── Filters: Dropdowns, search, date range
├── Cards: Data cards with icons

React Implementation:
├── components/Navbar.jsx
├── components/Sidebar.jsx
├── components/TabBar.jsx
├── components/DataTable.jsx (reusable)
├── components/Filter.jsx
└── pages/Dashboard.jsx (combines all)
```

### Upload Page → Components

```
from Figma/Design:
├── Drag-drop zone: Visual dropzone
├── File inputs: Two upload areas
├── Progress bar: Upload progress indicator
├── Upload history: Table with past uploads
├── Buttons: Upload, Cancel, Download report

React Implementation:
├── components/FileDropZone.jsx
├── components/UploadProgress.jsx
├── components/UploadHistory.jsx
└── pages/Upload.jsx (combines all)
```

### Export Page → Components

```
from Figma/Design:
├── Sheet selection: Checkboxes
├── Options: Toggle switches
├── Filters: By-sheet filter groups
├── Preview: Collapsible preview table
├── Download button: With progress

React Implementation:
├── components/SheetSelector.jsx
├── components/ExportOptions.jsx
├── components/FilterPanel.jsx
├── components/Preview.jsx
└── pages/Export.jsx (combines all)
```

### Admin Panel → Components

```
from Figma/Design:
├── User table: List of users
├── Create modal: Form with fields
├── Edit modal: Pre-filled form
├── Delete modal: Confirmation dialog
├── Audit logs: Activity table
├── Action menus: Three-dot menus

React Implementation:
├── components/UserTable.jsx
├── components/UserModal.jsx
├── components/ConfirmModal.jsx
├── components/AuditLogViewer.jsx
└── pages/Admin.jsx (combines all)
```

---

## 🎨 PHASE 6: STYLING WITH TAILWIND

### Utility-First Approach

Instead of writing CSS, use Tailwind classes directly in JSX:

```jsx
// Button styling from design
<button className="
  px-6 py-3
  bg-primary text-white
  font-bold
  rounded-lg
  hover:bg-blue-700
  disabled:bg-gray-400
  transition-colors
  focus:outline-none focus:ring-2 focus:ring-primary
">
  Login
</button>
```

### Common Patterns from Design

```jsx
// Card styling (from design specs)
<div className="bg-white rounded-lg shadow-md p-6">
  {/* Content */}
</div>

// Input styling
<input className="
  border border-gray-300
  rounded-lg
  px-4 py-2
  focus:border-primary focus:ring-2 focus:ring-blue-500
  focus:outline-none
" />

// Badge styling
<span className="
  inline-block
  px-3 py-1
  rounded-full
  text-sm font-medium
  bg-green-100 text-green-800
">
  Completed
</span>

// Table row
<tr className="
  hover:bg-blue-50
  border-b border-gray-200
">
  <td className="px-4 py-3">Data</td>
</tr>
```

---

## 🔗 PHASE 7: FIGMA → CODE WORKFLOW (Detailed)

### Step 1: Open Design in Figma

```
1. Claude Design export to Figma
2. Share link with developers: https://www.figma.com/design/...
3. Developers can inspect all elements
```

### Step 2: Inspect Design in Figma

**For Colors:**
```
Right-click element → Inspect
→ Colors section shows hex values (#2563EB, etc)
→ Copy hex code
→ Use in tailwind.config.js or component
```

**For Typography:**
```
Right-click text element → Inspect
→ Typography section shows:
   - Font size (14px, 20px, etc)
   - Font weight (400, 600, 700)
   - Line height (20px, 28px, etc)
→ Add to tailwind.config.js
```

**For Spacing:**
```
Right-click element → Inspect
→ Measure distances in Figma
→ Note padding/margin values (16px, 24px, etc)
→ Use in component classes
```

**For Shadows:**
```
Right-click element with shadow → Inspect
→ Effects section shows shadow values
→ Copy to tailwind shadow config
```

### Step 3: Create Component from Specs

```
Developer workflow:

1. Open Figma design in one window
2. Code editor in another window
3. Create React component
4. Match colors: bg-primary, text-white, etc
5. Match typography: text-lg, font-bold, etc
6. Match spacing: px-6, py-3, gap-4, etc
7. Match styling: rounded-lg, shadow-md, etc
8. Check responsive: md:, lg: breakpoints
9. Test in browser: Compare with Figma
10. Iterate until matches exactly
```

---

## 📝 PHASE 8: COMPLETE EXAMPLE - DASHBOARD TAB

### Design from Claude Design/Figma

```
Shows: Summary All table
- Title: "Summary All" (20px bold)
- Subtitle: "Completion rates by directorate"
- Search box, Filter dropdown
- Table with columns: Directorate, Total, LOG+ %, VR %
- Rows with green/yellow/red completion rates
- Pagination at bottom
```

### React Implementation

```jsx
// pages/Dashboard.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { DataTable } from '../components/DataTable';
import { SearchIcon, FilterIcon } from 'lucide-react';

export const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [directorate, setDirectorate] = useState('all');
  
  const { data, isLoading } = useQuery({
    queryKey: ['summary-all', search, directorate],
    queryFn: () => fetch('/api/data/summary-all?search=' + search).then(r => r.json())
  });

  const columns = [
    { id: 'directorate', header: 'Directorate', size: 300 },
    { id: 'total', header: 'Total Employees', size: 150 },
    { id: 'log_plus_completed', header: 'LOG+ Completed', size: 150 },
    { id: 'log_plus_rate', header: 'LOG+ %', size: 150, 
      cell: (info) => (
        <div className={`
          px-3 py-1 rounded-lg font-bold text-center w-fit
          ${info.getValue() > 80 ? 'bg-green-100 text-green-800' : 
            info.getValue() > 50 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'}
        `}>
          {info.getValue()}%
        </div>
      )
    },
    { id: 'vr_rate', header: 'VR %', size: 150,
      cell: (info) => (
        <div className={`
          px-3 py-1 rounded-lg font-bold text-center w-fit
          ${info.getValue() > 80 ? 'bg-green-100 text-green-800' : 
            info.getValue() > 50 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'}
        `}>
          {info.getValue()}%
        </div>
      )
    },
  ];

  const table = useReactTable({
    data: data?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-6 bg-light min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Summary All</h1>
        <p className="text-gray-600">Completion rates by directorate</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex gap-4 items-end">
        <Input
          placeholder="Search directorate..."
          icon={<SearchIcon size={20} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        
        <select className="
          border border-gray-300 rounded-lg px-4 py-2
          focus:border-primary focus:ring-2 focus:outline-none
        ">
          <option value="all">All Directorates</option>
          {/* Options */}
        </select>
        
        <Button variant="secondary" size="md">
          <FilterIcon size={18} className="mr-2" />
          Filters
        </Button>
        
        <Button variant="primary" size="md">
          Export Excel
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-light border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-4 py-3 text-left text-sm font-bold text-gray-900"
                    >
                      {header.getContext().column.columnDef.header}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, idx) => (
                <tr 
                  key={row.id}
                  className={`
                    border-b border-gray-200
                    hover:bg-blue-50
                    ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  `}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                      {cell.renderCell()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {table.getState().pagination.pageIndex * 10 + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * 10, data?.total)} of {data?.total} directorates
            </span>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## ✅ CHECKLIST: DESIGN TO CODE

### Before Starting Code:
- [ ] Mockup generated from Claude Design
- [ ] Mockup exported to Figma
- [ ] Design tokens extracted (colors, fonts, spacing)
- [ ] Figma link shared with team
- [ ] All specifications understood

### During Development:
- [ ] Tailwind config updated with design tokens
- [ ] Reusable components created (Button, Input, etc)
- [ ] Page components built matching mockup
- [ ] Colors match exactly (#2563EB, not "blue")
- [ ] Spacing matches grid (8px increments)
- [ ] Typography matches specs (sizes, weights)
- [ ] Responsive breakpoints implemented (mobile/tablet/desktop)
- [ ] Interactive states work (hover, focus, disabled, loading)
- [ ] Tested in browser vs Figma

### After Development:
- [ ] All pages match design
- [ ] Responsive design works on all devices
- [ ] Colors consistent throughout
- [ ] Spacing consistent throughout
- [ ] Typography consistent throughout
- [ ] Performance optimized
- [ ] Accessibility checked (focus states, contrast)
- [ ] Ready for deployment

---

## 🚀 COMPLETE WORKFLOW SUMMARY

```
DESIGN PHASE (2-3 hours):
├─ Generate mockup (Claude Design)
├─ Export to PNG (documentation)
├─ Export to Figma (team reference)
└─ Extract design tokens (colors, fonts, spacing)

SETUP PHASE (1 hour):
├─ Add colors to tailwind.config.js
├─ Create reusable components (Button, Input, etc)
├─ Setup routing (React Router)
└─ Setup API client (Axios with auth)

DEVELOPMENT PHASE (1-2 weeks):
├─ Create page components
├─ Implement responsive design
├─ Connect to backend API
├─ Add form validation
├─ Test all interactions
└─ Fix bugs & polish

DEPLOYMENT PHASE (1-2 days):
├─ Build for production (npm run build)
├─ Deploy to Docker
├─ Setup SSL/HTTPS
├─ Verify all pages working
└─ Monitor performance
```

---

## 💡 BEST PRACTICES

✅ **Use Tailwind CSS** - Utility-first, matches design system  
✅ **Create reusable components** - Button, Input, Modal, etc  
✅ **Match colors exactly** - Use design token hex codes  
✅ **Use 8px grid** - All spacing in multiples of 8px  
✅ **Implement responsive** - Test on mobile/tablet/desktop  
✅ **Check focus states** - Important for accessibility  
✅ **Use design as source of truth** - Figma is reference  
✅ **Iterate with feedback** - Refine until matches perfectly  

---

## 📞 COMMON QUESTIONS

**Q: Do I copy Claude Design export directly into React?**
A: No. Export gives you PNG/Figma reference. You build React components that match it.

**Q: Can I auto-generate React from Claude Design?**
A: Claude Design can export code, but usually needs tweaking. Better to build custom components.

**Q: How do I make sure my code matches the design?**
A: Keep Figma open, compare colors/spacing/typography, test responsive views.

**Q: Should I use CSS or Tailwind?**
A: Use Tailwind - matches design tokens, faster development.

**Q: How do I handle hover/focus states from design?**
A: Build into components: hover:bg-blue-700, focus:ring-2, etc.

**Q: Can I change design while coding?**
A: Better to finalize design first, then code. Changes after code is expensive.

---

## 🎉 YOU'RE READY

Now you have:
- ✅ Design mockups (from Claude Design)
- ✅ Figma reference (for team)
- ✅ Design tokens (for styling)
- ✅ Component examples (code samples)
- ✅ Implementation guide (this document)

**Start building!** 🚀

---

**Next Steps:**
1. Generate mockups using CLAUDE-DESIGN-QUICK-PROMPTS.md
2. Export to Figma
3. Extract design tokens
4. Create tailwind.config.js
5. Build React components
6. Connect to backend API
7. Deploy to production

**You have everything needed!**
