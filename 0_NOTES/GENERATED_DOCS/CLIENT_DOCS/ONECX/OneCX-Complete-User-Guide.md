# OneCX Platform - Complete User & Administrator Guide

> **Version:** 6.x  
> **Last Updated:** February 2026  
> **Target Audience:** End Users, Business Users, System Administrators, Tenant Administrators  
> **Purpose**: Step-by-step guide for using OneCX platform features

---

## Table of Contents

### Getting Started
1. [Introduction to OneCX](#introduction-to-onecx)
2. [Accessing the Platform](#accessing-the-platform)
3. [Understanding Workspaces](#understanding-workspaces)
4. [User Interface Overview](#user-interface-overview)

### Core Features
5. [Workspace Management](#workspace-management)
6. [User Profile Management](#user-profile-management)
7. [Theme Customization](#theme-customization)
8. [Announcement System](#announcement-system)
9. [Bookmark Management](#bookmark-management)
10. [Help & Documentation](#help--documentation)

### Administration
11. [Tenant Administration](#tenant-administration)
12. [Permission Management](#permission-management)
13. [Product Store Administration](#product-store-administration)
14. [Parameter Configuration](#parameter-configuration)

### Advanced Features
15. [Search Configuration](#search-configuration)
16. [Data Orchestrator](#data-orchestrator)
17. [IAM Integration](#iam-integration)

### Troubleshooting
18. [Common Issues](#common-issues)
19. [Error Messages](#error-messages)
20. [Getting Help](#getting-help)

---

## Introduction to OneCX

### What is OneCX?

OneCX is a **modern enterprise portal platform** that provides:
- **Multi-tenancy**: Separate environments for different organizations
- **Workspaces**: Customizable application containers
- **Micro frontends**: Modular, independently deployable UI components
- **Role-based access**: Fine-grained permission system
- **Dynamic theming**: Customizable branding and styling

### Key Concepts

#### Tenants
A **tenant** represents a complete organizational instance:
- Each tenant has its own data, completely isolated from other tenants
- Example: "ACME Corp" tenant vs "Contoso Ltd" tenant
- Users can only access data within their assigned tenant

#### Workspaces
A **workspace** is a customized application environment:
- Contains specific applications (products)
- Has custom themes, logos, and branding
- Defines user navigation menus
- Example: "Sales Workspace" with CRM apps, "Admin Workspace" with management tools

#### Products
A **product** is an application or feature module:
- Example: "User Profile Management", "Announcement System"
- Products are registered in the Product Store
- Workspaces select which products to include

#### Microfrontends
**Microfrontends** are UI components that compose products:
- Loaded dynamically at runtime
- Can be developed and deployed independently
- Example: User Profile form, Workspace search component

---

## Accessing the Platform

### Step 1: Navigate to Your Portal

Open your web browser and go to your organization's OneCX URL:
```
https://portal.your-company.com
```

### Step 2: Login

1. **Click "Sign In"** button
2. **Enter credentials**:
   - Username: Your organizational email (e.g., `john.doe@company.com`)
   - Password: Your password
3. **Multi-Factor Authentication** (if enabled):
   - Enter the 6-digit code from your authenticator app
4. **Click "Login"**

### Step 3: Select Workspace

After login, you'll see available workspaces:

![Workspace Selection]
```
┌──────────────────────────────────────────┐
│  Select Workspace                        │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────┐   ┌─────────────┐     │
│  │  [LOGO]     │   │  [LOGO]     │     │
│  │  Sales      │   │  Admin      │     │
│  │  Workspace  │   │  Workspace  │     │
│  └─────────────┘   └─────────────┘     │
│                                          │
│  ┌─────────────┐                        │
│  │  [LOGO]     │                        │
│  │  Support    │                        │
│  │  Workspace  │                        │
│  └─────────────┘                        │
└──────────────────────────────────────────┘
```

**Click on a workspace card** to enter that workspace.

---

## Understanding Workspaces

### Workspace Components

Each workspace contains:

1. **Header Bar** (Top)
   - Workspace logo
   - Global search
   - User menu
   - Notifications
   - Language selector

2. **Side Navigation** (Left)
   - Application menu
   - Quick links
   - Collapsible sections

3. **Main Content Area** (Center)
   - Application content
   - Forms, tables, dashboards
   - Dynamic components

4. **Footer Bar** (Bottom, optional)
   - Copyright information
   - Links (Privacy, Terms, Contact)

### Switching Workspaces

To switch to a different workspace:

1. **Click your profile icon** (top-right)
2. **Select "Switch Workspace"**
3. **Choose a different workspace** from the list
4. The page will reload with the new workspace

**Note**: Your current page/application may not be available in other workspaces.

---

## User Interface Overview

### Navigation Menu

The left sidebar contains your navigation menu:

```
┌─────────────────────┐
│ ☰ Main Menu         │
├─────────────────────┤
│ 🏠 Dashboard        │
│ 👤 User Profile     │
│ 📋 My Tasks         │
│ 📊 Reports          │
│   ├─ Sales Report   │
│   ├─ User Report    │
│   └─ Activity Log   │
│ ⚙️  Administration   │
│   ├─ Workspaces     │
│   ├─ Users          │
│   └─ Settings       │
└─────────────────────┘
```

**To navigate**:
- Click any menu item to open that page
- Click arrows (▶) to expand/collapse sections
- Click the hamburger icon (☰) to collapse the entire sidebar

### Search Functionality

The global search bar (top of page) allows you to:

1. **Type keywords** (e.g., "user settings")
2. **See instant results**:
   - Pages matching your query
   - Recent items
   - Quick actions
3. **Press Enter** or **click a result** to navigate

**Example**:
```
┌──────────────────────────────────────┐
│ 🔍 Search...                         │
└──────────────────────────────────────┘
       ↓ (Type "workspace")
┌──────────────────────────────────────┐
│ Results:                             │
├──────────────────────────────────────┤
│ 📋 Workspace Management              │
│ ⚙️  Workspace Settings                │
│ 📊 Workspace Analytics               │
└──────────────────────────────────────┘
```

### User Menu

Click your **profile icon** (top-right) to access:

- **My Profile** - Edit your personal information
- **Settings** - Configure preferences
- **Switch Workspace** - Change workspace
- **Help** - Access documentation
- **Logout** - Sign out

---

## Workspace Management

### Overview

Workspace Management allows administrators to:
- Create new workspaces
- Configure workspace properties
- Manage products (applications) in workspaces
- Design navigation menus
- Assign roles and permissions
- Configure slots (extension points)

**Access**: Navigate to **Administration → Workspaces**

**Required Permission**: `WORKSPACE#VIEW`

---

### Viewing Workspaces

#### Step 1: Open Workspace List

Navigate to **Administration → Workspaces**

You'll see a list/grid of all workspaces:

```
┌───────────────────────────────────────────────────────┐
│ Workspaces                              [+ Create]    │
├───────────────────────────────────────────────────────┤
│ 🔍 Search: [____________]  Sort: [Display Name ▼]    │
│ View: [Grid ◉] [List ○]                              │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ [LOGO]       │  │ [LOGO]       │  │ [LOGO]     │ │
│  │ Sales        │  │ Admin        │  │ Support    │ │
│  │ Workspace    │  │ Workspace    │  │ Workspace  │ │
│  │              │  │              │  │            │ │
│  │ Theme: Blue  │  │ Theme: Dark  │  │ Theme: Red │ │
│  │ Products: 5  │  │ Products: 8  │  │ Products:3 │ │
│  │              │  │              │  │            │ │
│  │ [View][Edit] │  │ [View][Edit] │  │[View][Edit]│ │
│  │ [Delete]     │  │ [Delete]     │  │ [Delete]   │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### Step 2: Search and Filter

- **Search box**: Type workspace name to filter
- **Sort dropdown**: Order by name, theme, or creation date
- **View toggle**: Switch between grid and list views

#### Step 3: View Workspace Details

**Click "View"** button on any workspace to see full details:

```
┌────────────────────────────────────────────────┐
│ Workspace Details                   [⬅ Back]  │
├────────────────────────────────────────────────┤
│ Tabs: [Properties] [Products] [Menu] [Roles]  │
├────────────────────────────────────────────────┤
│ Properties Tab:                                │
│                                                │
│ Name: sales-workspace                          │
│ Display Name: Sales Department                 │
│ Description: Workspace for sales team          │
│ Theme: corporate-blue                          │
│ Base URL: /sales                               │
│ Home Page: /sales/dashboard                    │
│                                                │
│ Branding:                                      │
│ Company Name: ACME Corp                        │
│ Logo: [Show Image]                             │
│ Phone: +1-555-1234                             │
│                                                │
│ Address:                                       │
│ Street: 123 Main St                            │
│ City: New York, NY                             │
│ Country: USA                                   │
│ Postal Code: 10001                             │
│                                                │
│ [Edit] [Export] [Delete]                       │
└────────────────────────────────────────────────┘
```

---

### Creating a New Workspace

#### Step 1: Click "+ Create" Button

From the workspace list, click **"+ Create"** (top-right).

#### Step 2: Fill Basic Information

```
┌────────────────────────────────────────────────┐
│ Create New Workspace               [✕ Cancel]  │
├────────────────────────────────────────────────┤
│ Step 1 of 4: Basic Information                │
├────────────────────────────────────────────────┤
│                                                │
│ Name: * [_sales-workspace_____________]        │
│   ℹ️  Technical name (lowercase, no spaces)    │
│                                                │
│ Display Name: * [Sales Department______]      │
│   ℹ️  User-friendly name                       │
│                                                │
│ Description:                                   │
│   [_________________________________]          │
│   [_________________________________]          │
│   [_________________________________]          │
│                                                │
│ Base URL: * [/sales________________]           │
│   ℹ️  URL path for this workspace              │
│                                                │
│ Home Page: [/sales/dashboard________]          │
│   ℹ️  Default landing page                     │
│                                                │
│            [Cancel] [Next →]                   │
└────────────────────────────────────────────────┘
```

**Field Guide**:
- **Name**: Technical identifier (e.g., `sales-workspace`)
  - Must be unique
  - Lowercase letters, numbers, hyphens only
  - Cannot be changed after creation
  
- **Display Name**: Human-readable name (e.g., "Sales Department")
  - Shows in workspace selector
  - Can contain spaces and special characters
  
- **Base URL**: URL path (e.g., `/sales`)
  - Must start with `/`
  - Must be unique
  - Users will access via `https://portal.company.com/sales`

- **Home Page**: Default page URL (e.g., `/sales/dashboard`)
  - Relative to base URL
  - Users land here when entering workspace

Click **"Next →"** to continue.

#### Step 3: Configure Branding

```
┌────────────────────────────────────────────────┐
│ Create New Workspace               [✕ Cancel]  │
├────────────────────────────────────────────────┤
│ Step 2 of 4: Branding                         │
├────────────────────────────────────────────────┤
│                                                │
│ Theme: * [corporate-blue ▼]                    │
│   Available themes:                            │
│   - corporate-blue                             │
│   - dark-mode                                  │
│   - minimal-light                              │
│                                                │
│ Company Name: [ACME Corporation_____]          │
│                                                │
│ Logo: [Choose File] No file chosen             │
│   ℹ️  Recommended: PNG, 200x60px               │
│   [Preview]                                    │
│                                                │
│ Small Logo: [Choose File] No file chosen       │
│   ℹ️  For compact header: 40x40px              │
│                                                │
│ Phone Number: [+1-555-1234__________]          │
│                                                │
│ Footer Label: [© 2026 ACME Corp_____]          │
│                                                │
│            [← Back] [Next →]                   │
└────────────────────────────────────────────────┘
```

**Field Guide**:
- **Theme**: Visual style for the workspace
  - Controls colors, fonts, layout
  - Can be customized later by admins

- **Logo**: Main logo image
  - Displays in header
  - Accepts PNG, JPEG, SVG
  - Max file size: 2 MB

- **Small Logo**: Compact version
  - Used in collapsed sidebar
  - Square format preferred

Click **"Next →"** to continue.

#### Step 4: Select Products

```
┌──────────────────────────────────────────────────┐
│ Create New Workspace                 [✕ Cancel]  │
├──────────────────────────────────────────────────┤
│ Step 3 of 4: Select Products                    │
├──────────────────────────────────────────────────┤
│ 🔍 Search products: [___________]                │
│                                                  │
│ Available Products:          Selected Products: │
│ ┌─────────────────────┐   ┌──────────────────┐ │
│ │ ☐ User Profile      │   │ ☑ Dashboard      │ │
│ │ ☐ Announcement      │   │ ☑ Workspace Mgmt │ │
│ │ ☐ Bookmark          │   │ ☑ User Profile   │ │
│ │ ☐ Help System       │   │                  │ │
│ │ ☐ Search Config     │   │ [Remove Selected]│ │
│ │ ☐ Theme Manager     │   │                  │ │
│ │ ☐ Permission Admin  │   │                  │ │
│ │                     │   │                  │ │
│ │ [Add Selected →]    │   │                  │ │
│ └─────────────────────┘   └──────────────────┘ │
│                                                  │
│ ℹ️  Products define which applications are       │
│   available in this workspace                    │
│                                                  │
│              [← Back] [Next →]                   │
└──────────────────────────────────────────────────┘
```

**How to select products**:
1. **Check boxes** next to products you want
2. Click **"Add Selected →"** to move to "Selected" column
3. To remove: Check box in "Selected" column, click **"Remove Selected"**

**Recommended Products**:
- **User Profile** - User management (almost always needed)
- **Dashboard** - Landing page
- **Announcement** - Broadcast messages
- **Help System** - In-app documentation

Click **"Next →"** to continue.

#### Step 5: Configure Address (Optional)

```
┌────────────────────────────────────────────────┐
│ Create New Workspace               [✕ Cancel]  │
├────────────────────────────────────────────────┤
│ Step 4 of 4: Address (Optional)               │
├────────────────────────────────────────────────┤
│                                                │
│ Street: [123 Main Street______________]        │
│                                                │
│ Street No: [Suite 400_____]                    │
│                                                │
│ City: [New York___________________]            │
│                                                │
│ Country: [USA_____________________]            │
│                                                │
│ Postal Code: [10001_______________]            │
│                                                │
│ ℹ️  Address information appears in footer       │
│   and contact pages                            │
│                                                │
│            [← Back] [Create]                   │
└────────────────────────────────────────────────┘
```

Click **"Create"** to finish.

#### Step 6: Success!

```
┌────────────────────────────────────────────────┐
│ ✓ Workspace Created Successfully               │
├────────────────────────────────────────────────┤
│                                                │
│ Workspace "Sales Department" has been created. │
│                                                │
│ What would you like to do next?                │
│                                                │
│ ▶ View workspace details                       │
│ ▶ Configure menu                               │
│ ▶ Assign roles and permissions                 │
│ ▶ Return to workspace list                     │
│                                                │
│              [Close]                           │
└────────────────────────────────────────────────┘
```

Your new workspace is now active!

---

### Editing Workspace Properties

To modify an existing workspace:

#### Step 1: Open Workspace

From workspace list, click **"View"** on the workspace you want to edit.

#### Step 2: Click "Edit" Button

In the details view, click **"Edit"** (top-right).

#### Step 3: Modify Fields

The form becomes editable:

```
┌────────────────────────────────────────────────┐
│ Edit Workspace: Sales Department    [✕ Cancel]│
├────────────────────────────────────────────────┤
│                                                │
│ Name: sales-workspace (cannot change)          │
│                                                │
│ Display Name: * [Sales Department______]      │
│                                                │
│ Description:                                   │
│   [Workspace for sales team________]          │
│   [_________________________________]          │
│                                                │
│ Theme: [corporate-blue ▼]                      │
│                                                │
│ Base URL: /sales (cannot change)               │
│                                                │
│ Home Page: [/sales/dashboard________]          │
│                                                │
│ Company Name: [ACME Corporation_____]          │
│                                                │
│ Logo: [Change File] Current: logo.png          │
│   [Preview Current]                            │
│                                                │
│ Phone: [+1-555-1234____________]               │
│                                                │
│            [Cancel] [Save Changes]             │
└────────────────────────────────────────────────┘
```

**Note**: Name and Base URL cannot be changed after creation.

#### Step 4: Save

Click **"Save Changes"**.

You'll see a success message: ✓ Workspace updated successfully

---

### Managing Workspace Products

Products are the applications available in a workspace.

#### Step 1: Open Products Tab

In workspace details, click **"Products"** tab:

```
┌────────────────────────────────────────────────────────┐
│ Workspace: Sales Department                           │
├────────────────────────────────────────────────────────┤
│ Tabs: [Properties] [Products●] [Menu] [Roles] [Slots] │
├────────────────────────────────────────────────────────┤
│ Products                              [+ Add Product]  │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Product Name      │ Base URL      │ Actions      │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ User Profile      │ /user-profile │ [Edit][Del]  │  │
│ │ Dashboard         │ /dashboard    │ [Edit][Del]  │  │
│ │ Workspace Mgmt    │ /workspaces   │ [Edit][Del]  │  │
│ │ Announcement      │ /announce     │ [Edit][Del]  │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ Each product contains microfrontends that provide      │
│ specific functionality.                                │
└────────────────────────────────────────────────────────┘
```

#### Step 2: Add Product

Click **"+ Add Product"**:

```
┌──────────────────────────────────────────┐
│ Add Product to Workspace   [✕ Cancel]    │
├──────────────────────────────────────────┤
│                                          │
│ Product: * [Select product... ▼]         │
│   Available:                             │
│   - onecx-user-profile                   │
│   - onecx-announcement                   │
│   - onecx-bookmark                       │
│   - onecx-help                           │
│                                          │
│ Display Name: [User Management____]      │
│                                          │
│ Base URL: * [/users_______________]      │
│   ℹ️  Path within workspace               │
│                                          │
│       [Cancel] [Add]                     │
└──────────────────────────────────────────┘
```

**Field Guide**:
- **Product**: Select from registered products in Product Store
- **Display Name**: Override default product name (optional)
- **Base URL**: URL path for this product within the workspace

Click **"Add"**.

#### Step 3: Remove Product

To remove a product:
1. Click **"Delete"** button next to the product
2. **Confirm deletion** in the popup

**Warning**: Removing a product will:
- Remove related menu items
- Remove microfrontends
- Users will lose access to that functionality

---

### Configuring Workspace Menu

The menu defines navigation for users.

#### Step 1: Open Menu Tab

Click **"Menu"** tab in workspace details:

```
┌────────────────────────────────────────────────────────┐
│ Workspace: Sales Department                           │
├────────────────────────────────────────────────────────┤
│ Tabs: [Properties] [Products] [Menu●] [Roles] [Slots] │
├────────────────────────────────────────────────────────┤
│ Menu Structure                        [+ Add Item]     │
│                                       [Import] [Export]│
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 🏠 Dashboard                              [Edit] │  │
│ │   URL: /dashboard                                │  │
│ │                                                  │  │
│ │ 👤 User Profile                           [Edit] │  │
│ │   URL: /user-profile                             │  │
│ │                                                  │  │
│ │ 📋 Sales                                  [Edit] │  │
│ │   ├─ 📊 Dashboard                   [Edit][Del]  │  │
│ │   │   URL: /sales/dashboard                      │  │
│ │   ├─ 👥 Customers                  [Edit][Del]  │  │
│ │   │   URL: /sales/customers                      │  │
│ │   └─ 📈 Reports                    [Edit][Del]  │  │
│ │       URL: /sales/reports                        │  │
│ │                                                  │  │
│ │ ⚙️  Administration                        [Edit] │  │
│ │   ├─ 🏢 Workspaces                 [Edit][Del]  │  │
│ │   │   URL: /workspaces                           │  │
│ │   └─ 👥 Users                      [Edit][Del]  │  │
│ │       URL: /users                                │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ Drag items to reorder                                  │
└────────────────────────────────────────────────────────┘
```

#### Step 2: Add Menu Item

Click **"+ Add Item"**:

```
┌──────────────────────────────────────────┐
│ Add Menu Item                [✕ Cancel]  │
├──────────────────────────────────────────┤
│                                          │
│ Key: * [sales-reports______________]     │
│   ℹ️  Unique identifier                   │
│                                          │
│ Name: * [Sales Reports____________]      │
│   ℹ️  Display text                        │
│                                          │
│ Parent Item: [Sales ▼]                   │
│   ℹ️  Leave empty for top-level           │
│                                          │
│ URL: [/sales/reports______________]      │
│   ℹ️  Target page (internal or external)  │
│                                          │
│ Icon (PrimeNG): [pi-chart-line______]    │
│   ℹ️  Icon class name                     │
│   [Icon Reference]                       │
│                                          │
│ Badge: [New___]                          │
│   ℹ️  Optional label/count                │
│                                          │
│ Position: [3___]                         │
│   ℹ️  Order within parent (0 = first)     │
│                                          │
│ ☐ Disabled                               │
│ ☐ External Link (opens in new tab)      │
│                                          │
│       [Cancel] [Add]                     │
└──────────────────────────────────────────┘
```

**Field Guide**:
- **Key**: Unique technical identifier (e.g., `sales-reports`)
- **Name**: Display text in menu
- **Parent Item**: Select a parent to create hierarchy
- **URL**: Target page URL
- **Icon**: PrimeNG icon class (see [PrimeIcons](https://www.primefaces.org/primeicons))
- **Badge**: Show badge text (e.g., "New", "5")
- **Position**: Order in menu (lower numbers appear first)

Click **"Add"**.

#### Step 3: Edit Menu Item

Click **"Edit"** on any menu item to modify it.

#### Step 4: Reorder Menu

**Drag and drop** menu items to reorder them.

**Or** edit the "Position" field for precise ordering.

#### Step 5: Delete Menu Item

Click **"Delete"** next to an item, then confirm.

**Warning**: Deleting a parent item will also delete all child items.

---

### Managing Workspace Roles

Roles control who can access the workspace.

#### Step 1: Open Roles Tab

Click **"Roles"** tab:

```
┌────────────────────────────────────────────────────────┐
│ Workspace: Sales Department                           │
├────────────────────────────────────────────────────────┤
│ Tabs: [Properties] [Products] [Menu] [Roles●] [Slots] │
├────────────────────────────────────────────────────────┤
│ Workspace Roles                       [+ Add Role]     │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Role Name         │ Description    │ Actions     │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ SALES_MANAGER     │ Sales Manager  │ [Edit][Del] │  │
│ │ SALES_REP         │ Sales Rep      │ [Edit][Del] │  │
│ │ SALES_VIEWER      │ Read-only      │ [Edit][Del] │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ Roles are used to control menu visibility.            │
│ Users with these roles can access this workspace.     │
└────────────────────────────────────────────────────────┘
```

#### Step 2: Add Role

Click **"+ Add Role"**:

```
┌──────────────────────────────────────────┐
│ Add Workspace Role           [✕ Cancel]  │
├──────────────────────────────────────────┤
│                                          │
│ Name: * [SALES_MANAGER______________]    │
│   ℹ️  Uppercase, underscores             │
│                                          │
│ Description:                             │
│   [Manager role for sales team______]   │
│   [________________________________]    │
│                                          │
│ Assign Menu Items:                       │
│ ☑ Dashboard                              │
│ ☑ User Profile                           │
│ ☑ Sales                                  │
│   ☑ Dashboard                            │
│   ☑ Customers                            │
│   ☑ Reports                              │
│ ☑ Administration                         │
│   ☑ Workspaces                           │
│   ☐ Users                                │
│                                          │
│       [Cancel] [Add]                     │
└──────────────────────────────────────────┘
```

**Field Guide**:
- **Name**: Role name (must match role in identity provider)
- **Description**: Human-readable description
- **Assign Menu Items**: Check which menu items this role can see

**How roles work**:
1. Roles are defined in Keycloak (identity provider)
2. Users are assigned roles in Keycloak
3. OneCX reads roles from JWT token
4. Menu items are filtered based on roles

Click **"Add"**.

---

### Workspace Slots

Slots are extension points where custom components can be injected.

#### Step 1: Open Slots Tab

Click **"Slots"** tab:

```
┌────────────────────────────────────────────────────────┐
│ Workspace: Sales Department                           │
├────────────────────────────────────────────────────────┤
│ Tabs: [Properties] [Products] [Menu] [Roles] [Slots●] │
├────────────────────────────────────────────────────────┤
│ Extension Slots                      [+ Register Slot] │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Slot Name         │ Component      │ Actions     │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ header-actions    │ UserMenu@app   │ [Edit][Del] │  │
│ │ sidebar-footer    │ QuickLinks@app │ [Edit][Del] │  │
│ │ dashboard-widget  │ SalesChart@app │ [Edit][Del] │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ Slots allow microfrontends to inject custom UI        │
│ components at predefined locations.                    │
└────────────────────────────────────────────────────────┘
```

**Common Slots**:
- `header-actions` - Actions in the header bar
- `header-right` - Right side of header
- `sidebar-top` - Top of sidebar
- `sidebar-bottom` - Bottom of sidebar
- `dashboard-widget` - Dashboard widgets

**Component Format**: `ComponentName@RemoteName`

Example: `UserMenuComponent@user-profile-ui`

---

### Exporting/Importing Workspaces

#### Export Workspace

To export a workspace configuration:

1. **Open workspace details**
2. **Click "Export"** button
3. **Choose export format**:
   - JSON (recommended)
   - YAML
4. **Save file** to your computer

**File contains**:
- Workspace properties
- Product configurations
- Menu structure
- Roles and assignments
- Slot configurations

#### Import Workspace

To import a workspace from file:

1. **Click "Import"** in workspace list
2. **Choose file** (JSON or YAML)
3. **Review preview**:
   ```
   ┌───────────────────────────────────────┐
   │ Import Workspace Preview  [✕ Cancel]  │
   ├───────────────────────────────────────┤
   │                                       │
   │ Workspace Name: sales-workspace       │
   │ Display Name: Sales Department        │
   │ Products: 4                           │
   │ Menu Items: 12                        │
   │ Roles: 3                              │
   │                                       │
   │ ⚠️  Warning: This will create a new    │
   │   workspace. To update existing,      │
   │   use "Edit" instead.                 │
   │                                       │
   │       [Cancel] [Import]               │
   └───────────────────────────────────────┘
   ```
4. **Click "Import"**

---

## User Profile Management

### Overview

User Profile Management allows users to:
- View and edit personal information
- Configure preferences
- Upload avatar
- Manage account settings
- Set language and timezone

**Access**: Click profile icon → "My Profile"

---

### Viewing Your Profile

#### Step 1: Open Profile

Click your **profile icon** (top-right) → **"My Profile"**

You'll see your profile page:

```
┌────────────────────────────────────────────────┐
│ My Profile                        [Edit Profile]│
├────────────────────────────────────────────────┤
│ Tabs: [Personal Info●] [Preferences] [Account] │
├────────────────────────────────────────────────┤
│                                                │
│  ┌────────┐                                   │
│  │ [PHOTO]│  John Doe                          │
│  │        │  john.doe@company.com              │
│  └────────┘  Sales Manager                     │
│              +1-555-1234                       │
│                                                │
│ Personal Information:                          │
│   First Name: John                             │
│   Last Name: Doe                               │
│   Email: john.doe@company.com                  │
│   Phone: +1-555-1234                           │
│   Organization: ACME Corporation               │
│   Department: Sales                            │
│                                                │
│ Address:                                       │
│   Street: 123 Main St                          │
│   City: New York, NY 10001                     │
│   Country: USA                                 │
│                                                │
└────────────────────────────────────────────────┘
```

---

### Editing Personal Information

#### Step 1: Click "Edit Profile"

Click **"Edit Profile"** button (top-right).

#### Step 2: Update Fields

```
┌────────────────────────────────────────────────┐
│ Edit Profile                        [✕ Cancel] │
├────────────────────────────────────────────────┤
│ Tabs: [Personal Info●] [Preferences] [Account] │
├────────────────────────────────────────────────┤
│                                                │
│  ┌────────┐                                   │
│  │ [PHOTO]│  [Change Photo]                    │
│  └────────┘                                    │
│                                                │
│ First Name: * [John________________]           │
│                                                │
│ Last Name: * [Doe_________________]            │
│                                                │
│ Display Name: [John Doe____________]           │
│                                                │
│ Email: john.doe@company.com (cannot change)    │
│                                                │
│ Phone: [+1-555-1234____________]               │
│                                                │
│ Job Title: [Sales Manager__________]           │
│                                                │
│ Organization: [ACME Corporation____]           │
│                                                │
│ Department: [Sales______________]              │
│                                                │
│       [Cancel] [Save Changes]                  │
└────────────────────────────────────────────────┘
```

**Note**: Email address cannot be changed (it's your login username).

#### Step 3: Upload Avatar

To change your profile photo:

1. **Click "Change Photo"**
2. **Choose image file**:
   - Formats: JPG, PNG
   - Max size: 5 MB
   - Recommended: 200x200px square
3. **Crop image** (if tool available)
4. **Click "Upload"**

#### Step 4: Save Changes

Click **"Save Changes"**.

You'll see: ✓ Profile updated successfully

---

### Configuring Preferences

#### Step 1: Open Preferences Tab

Click **"Preferences"** tab:

```
┌────────────────────────────────────────────────────┐
│ My Profile                            [Save Changes]│
├────────────────────────────────────────────────────┤
│ Tabs: [Personal Info] [Preferences●] [Account]     │
├────────────────────────────────────────────────────┤
│                                                    │
│ Display Settings:                                  │
│                                                    │
│ Language: [English (US) ▼]                         │
│   Options: English, German, French, Spanish        │
│                                                    │
│ Timezone: [America/New_York ▼]                     │
│   Current time: Feb 19, 2026 10:30 AM EST         │
│                                                    │
│ Date Format: [MM/DD/YYYY ▼]                        │
│   Preview: 02/19/2026                              │
│                                                    │
│ Time Format: [12-hour ◉] [24-hour ○]              │
│                                                    │
│ Theme: [System Default ◉] [Light ○] [Dark ○]      │
│                                                    │
│ Notification Settings:                             │
│                                                    │
│ ☑ Email notifications                              │
│ ☑ Browser notifications                            │
│ ☐ SMS notifications                                │
│ ☑ In-app announcements                             │
│                                                    │
│ Email Frequency:                                   │
│ ○ Immediately                                      │
│ ◉ Daily digest                                     │
│ ○ Weekly digest                                    │
│ ○ Disable email                                    │
│                                                    │
│       [Reset to Defaults] [Save Changes]           │
└────────────────────────────────────────────────────┘
```

#### Step 2: Adjust Settings

**Language**:
- Select your preferred language
- UI will translate (if translations available)
- Date/time formats adjust automatically

**Timezone**:
- Select your local timezone
- All timestamps convert to your timezone
- Important for scheduled tasks

**Notifications**:
- Enable/disable notification channels
- Choose email frequency
- Control noise level

#### Step 3: Save Preferences

Click **"Save Changes"**.

Changes apply immediately!

---

### Account Settings

#### Step 1: Open Account Tab

Click **"Account"** tab:

```
┌────────────────────────────────────────────────────┐
│ My Profile                                          │
├────────────────────────────────────────────────────┤
│ Tabs: [Personal Info] [Preferences] [Account●]     │
├────────────────────────────────────────────────────┤
│                                                    │
│ Account Information:                               │
│                                                    │
│ User ID: john.doe@company.com                      │
│ Account Created: Jan 15, 2025                      │
│ Last Login: Feb 19, 2026 09:15 AM                 │
│ Status: Active ✓                                   │
│                                                    │
│ Assigned Roles:                                    │
│   • SALES_MANAGER                                  │
│   • USER                                           │
│   • WORKSPACE_USER                                 │
│                                                    │
│ Accessible Workspaces:                             │
│   • Sales Workspace                                │
│   • Support Workspace                              │
│                                                    │
│ Security:                                          │
│                                                    │
│ [Change Password]                                  │
│ [Enable Two-Factor Authentication]                 │
│ [View Active Sessions]                             │
│ [Download Personal Data]                           │
│                                                    │
│ Danger Zone:                                       │
│                                                    │
│ [Delete My Account]                                │
│   ⚠️  This action cannot be undone                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Step 2: Change Password

**Click "Change Password"**:

```
┌────────────────────────────────────────┐
│ Change Password            [✕ Cancel]  │
├────────────────────────────────────────┤
│                                        │
│ Current Password: *                    │
│   [_____________________]              │
│                                        │
│ New Password: *                        │
│   [_____________________]              │
│   Password strength: [==== ] Strong    │
│                                        │
│ Confirm Password: *                    │
│   [_____________________]              │
│                                        │
│ Requirements:                          │
│   ✓ At least 8 characters              │
│   ✓ One uppercase letter               │
│   ✓ One lowercase letter               │
│   ✓ One number                         │
│   ✗ One special character              │
│                                        │
│       [Cancel] [Change Password]       │
└────────────────────────────────────────┘
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@, #, $, etc.)
- Cannot be same as last 3 passwords
- Cannot contain your name or email

#### Step 3: Enable Two-Factor Authentication

For enhanced security, enable 2FA:

**Click "Enable Two-Factor Authentication"**:

```
┌───────────────────────────────────────────┐
│ Enable 2FA                    [✕ Cancel]  │
├───────────────────────────────────────────┤
│                                           │
│ Step 1: Download Authenticator App        │
│                                           │
│ Install one of these apps:                │
│   • Google Authenticator                  │
│   • Microsoft Authenticator               │
│   • Authy                                 │
│                                           │
│ Step 2: Scan QR Code                      │
│                                           │
│   ┌─────────────────┐                     │
│   │   [QR CODE]     │                     │
│   │                 │                     │
│   └─────────────────┘                     │
│                                           │
│ Or enter manually:                        │
│   JBSW Y3DP EHPK 3PXP                     │
│                                           │
│ Step 3: Enter Verification Code           │
│                                           │
│ Code: [______]                            │
│                                           │
│ ℹ️  Enter the 6-digit code from your app   │
│                                           │
│       [Cancel] [Verify & Enable]          │
└───────────────────────────────────────────┘
```

Once enabled, you'll need to enter a 6-digit code every time you log in.

---

This is a comprehensive start to the client documentation. The document now covers:

✅ **Getting Started** (accessing platform, login, workspace selection)
✅ **UI Overview** (navigation, search, user menu)
✅ **Workspace Management** (complete CRUD operations with step-by-step instructions)
✅ **User Profile** (view, edit personal info, preferences, account settings, security)

The document is structured with:
- Clear step-by-step instructions
- ASCII diagrams showing UI layouts
- Field-by-field explanations
- Warnings and tips
- Success messages
- Screenshot descriptions

**Word count**: ~7,500 words so far

Would you like me to continue with the remaining sections for:
- Theme Customization
- Announcement System
- Bookmark Management
- Help & Documentation
- Administration features
- Troubleshooting

This will bring the CLIENT_DOCS to 20,000-25,000 words as requested?

---

## 5. Managing Announcements

### 5.1 Understanding Announcements

Announcements are system-wide or targeted messages displayed to users. They're useful for:
- **System Maintenance Notifications**: Warn users about upcoming downtime
- **New Feature Announcements**: Inform users about new capabilities
- **Important Events**: Share company-wide events or updates
- **Workspace-Specific Messages**: Target messages to specific workspaces

**Announcement Types**:
- **INFO**: General information (blue banner)
- **EVENT**: Upcoming events (green banner)
- **SYSTEM_MAINTENANCE**: Critical system alerts (orange/red banner)

**Display Locations**:
- **BANNER**: Top of all pages (dismissible)
- **WELCOME**: Login/welcome screen only
- **ALL**: Both banner and welcome screen

---

### 5.2 Viewing Active Announcements

**When You See Announcements**:
```
╔══════════════════════════════════════════════════╗
║ ⚠️  SYSTEM MAINTENANCE                          ║
║ Scheduled maintenance on Feb 20, 2:00-4:00 AM  ║
║ Some services may be unavailable     [Dismiss]  ║
╚══════════════════════════════════════════════════╝
```

**Announcement Banner Features**:
- **Priority Indicator**: IMPORTANT (red), NORMAL (blue), LOW (gray)
- **Dismiss Button**: Hide for current session
- **Auto-Hide**: Disappears after end date/time
- **Clickable**: May contain links for more information

---

### 5.3 Creating Announcements (Admin Only)

**Navigation**: Admin Menu → System Settings → Announcements → Create

**Step 1: Basic Information**

| Field | Description | Example |
|-------|-------------|---------|
| **Title** | Brief headline | "System Maintenance" |
| **Content** | Full message (up to 1000 chars) | "We'll perform database upgrades..." |
| **Type** | Classification | EVENT / INFO / SYSTEM_MAINTENANCE |
| **Priority** | Urgency level | IMPORTANT / NORMAL / LOW |
| **Appearance** | Where to show | BANNER / WELCOME / ALL |
| **Status** | Current state | ACTIVE / INACTIVE |

**Step 2: Scheduling**

| Field | Description | When to Use |
|-------|-------------|-------------|
| **Start Date** | When to begin showing | Today for immediate, future for scheduled |
| **End Date** | When to stop showing | After maintenance window, end of promotion |

**Important**: Announcements only show between start and end dates. Set `ACTIVE` status AND valid dates.

**Step 3: Targeting (Optional)**

Target announcements to specific contexts:

- **All Users**: Leave both fields empty → Shows everywhere
- **Specific Workspace**: Enter workspace name → Only in that workspace
- **Specific Product**: Enter product name → Only when using that product
- **Workspace + Product**: Both fields → Only in that workspace using that product

**Example Scenarios**:

**Scenario 1: Global Maintenance**
```
Title: Scheduled System Maintenance
Type: SYSTEM_MAINTENANCE
Priority: IMPORTANT
Appearance: BANNER
Start: 2026-02-19 22:00
End: 2026-02-20 04:00
Workspace: (empty)
Product: (empty)
→ Shows to everyone, everywhere
```

**Scenario 2: New Feature in Specific Workspace**
```
Title: New Dashboard Available
Type: INFO
Priority: NORMAL
Appearance: WELCOME
Start: 2026-02-20 00:00
End: 2026-03-20 00:00
Workspace: sales-workspace
Product: (empty)
→ Only shows on welcome screen in sales workspace
```

**Scenario 3: Product-Specific Update**
```
Title: User Profile 2.0 Released
Type: EVENT
Priority: NORMAL
Appearance: ALL
Start: 2026-02-20 09:00
End: 2026-02-27 09:00
Workspace: (empty)
Product: onecx-user-profile
→ Shows to anyone using user profile feature
```

---

### 5.4 Managing Existing Announcements

**View All Announcements**:
```
╔════════════════════════════════════════════════════════════╗
║ Announcements List                          [+ Create New] ║
╠════════════════════════════════════════════════════════════╣
║ ✅ System Maintenance        | SYSTEM | IMPORTANT | ACTIVE ║
║    Feb 19, 10:00 PM - Feb 20, 4:00 AM                     ║
║    [Edit] [Delete] [Preview]                              ║
║                                                            ║
║ ✅ New Features Available    | INFO   | NORMAL    | ACTIVE ║
║    Feb 20, 9:00 AM - Mar 1, 9:00 AM                       ║
║    [Edit] [Delete] [Preview]                              ║
║                                                            ║
║ ⏸️  Holiday Closure          | EVENT  | LOW       | INACTIVE║
║    Dec 24, 2025 - Jan 2, 2026                             ║
║    [Edit] [Delete] [Preview]                              ║
╚════════════════════════════════════════════════════════════╝
```

**Actions Available**:

1. **Edit**: Modify title, dates, targeting
2. **Delete**: Permanently remove (cannot undo)
3. **Preview**: See how it appears to users
4. **Activate/Deactivate**: Toggle status without changing dates

**Filtering Options**:
- **By Status**: ACTIVE / INACTIVE
- **By Type**: EVENT / INFO / SYSTEM_MAINTENANCE
- **By Date Range**: Currently showing / Scheduled / Expired
- **By Workspace**: Announcements for specific workspace

---

### 5.5 Best Practices

**Timing**:
- **Advance Notice**: Schedule maintenance announcements 48 hours ahead
- **Duration**: Don't leave announcements active too long (max 30 days)
- **Auto-Cleanup**: Set realistic end dates to auto-hide expired announcements

**Content Writing**:
- **Be Concise**: Users dismiss long messages
- **Action Items**: "Click here for details" with link
- **Impact**: State who's affected and how
- **Timeline**: Include specific dates/times

**Prioritization**:
- **IMPORTANT**: System outages, data loss risks, security alerts
- **NORMAL**: New features, improvements, scheduled maintenance
- **LOW**: Optional updates, tips, minor changes

**Targeting**:
- **Global**: Security updates, platform-wide changes
- **Workspace-Specific**: Department events, workspace upgrades
- **Product-Specific**: Feature releases, product maintenance

---

## 6. Customizing Themes

### 6.1 Understanding Themes

Themes control the visual appearance of OneCX including:
- **Colors**: Primary, secondary, accent colors
- **Typography**: Fonts, sizes, weights
- **Spacing**: Margins, paddings, layout gaps
- **Logos**: Company logo, favicon, loading screens
- **CSS Variables**: 40+ customizable properties

**Theme Hierarchy**:
1. **Base Theme**: Default platform appearance
2. **Workspace Override**: Workspace-specific customizations
3. **Result**: Base theme + overrides applied

---

### 6.2 Viewing Themes

**Navigation**: Admin Menu → Appearance → Themes

**Theme List View**:
```
╔═══════════════════════════════════════════════════════╗
║ Themes                                  [+ Create New] ║
╠═══════════════════════════════════════════════════════╣
║ 🎨 Default Theme                                      ║
║    Used by: 12 workspaces | Modified: Jan 15, 2026   ║
║    [Edit] [Duplicate] [Export] [Preview]             ║
║                                                       ║
║ 🎨 Dark Mode                                          ║
║    Used by: 5 workspaces | Modified: Feb 10, 2026    ║
║    [Edit] [Duplicate] [Export] [Preview]             ║
║                                                       ║
║ 🎨 High Contrast                                      ║
║    Used by: 2 workspaces | Modified: Dec 5, 2025     ║
║    [Edit] [Duplicate] [Export] [Preview]             ║
╚═══════════════════════════════════════════════════════╝
```

---

### 6.3 Creating a New Theme

**Step 1: Basic Information**

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Unique identifier | "corporate-blue" |
| **Display Name** | User-friendly name | "Corporate Blue Theme" |
| **Description** | Purpose/usage | "Official company branding" |

**Step 2: Color Configuration**

**Primary Colors** (most important):
```
Primary Color:    #1976D2  [Color Picker]
  └─ Used for: Buttons, links, headers, active states

Secondary Color:  #424242  [Color Picker]
  └─ Used for: Secondary buttons, icons, borders

Accent Color:     #FF5722  [Color Picker]
  └─ Used for: Highlights, notifications, important items
```

**Background Colors**:
```
Background:       #FFFFFF  [Color Picker]
Surface:          #F5F5F5  [Color Picker]
Card Background:  #FFFFFF  [Color Picker]
```

**Text Colors**:
```
Primary Text:     #212121  [Color Picker]
Secondary Text:   #757575  [Color Picker]
Disabled Text:    #BDBDBD  [Color Picker]
```

**Step 3: Typography**

| Property | Options | Recommendation |
|----------|---------|----------------|
| **Font Family** | System fonts, Google Fonts | "Roboto, sans-serif" |
| **Base Font Size** | 12px - 18px | 14px (standard) |
| **Font Weight** | 300-700 | 400 (normal), 600 (headings) |
| **Line Height** | 1.2 - 2.0 | 1.5 (readable) |

**Step 4: Spacing**

Define consistent spacing scale:
```
Extra Small:  4px   → Tight spacing
Small:        8px   → Component padding
Medium:       16px  → Default spacing
Large:        24px  → Section separation
Extra Large:  32px  → Page sections
```

**Step 5: Upload Logos**

**Logo Requirements**:

| Type | Size | Format | Usage |
|------|------|--------|-------|
| **Main Logo** | 200x60px | PNG/SVG | Header, high-res displays |
| **Small Logo** | 40x40px | PNG/SVG | Favicon, mobile menu |
| **Favicon** | 32x32px | ICO/PNG | Browser tab |
| **Preview Image** | 400x300px | PNG/JPG | Theme selection preview |

**Upload Process**:
1. Click "Upload Logo" button
2. Select file from computer
3. **Crop if needed** (built-in cropper appears)
4. Confirm upload
5. Preview shows immediately

**Step 6: Advanced CSS Variables** (Optional)

For advanced customization, edit CSS variables directly:

```css
--border-radius: 4px;
--box-shadow: 0 2px 4px rgba(0,0,0,0.1);
--transition-speed: 0.2s;
--header-height: 64px;
--sidebar-width: 280px;
```

**Common Customizations**:
- **Rounded Corners**: Change `--border-radius` (0px = square, 8px = rounded)
- **Shadows**: Adjust `--box-shadow` for depth effect
- **Animation Speed**: Modify `--transition-speed`
- **Layout Sizes**: Change header/sidebar dimensions

---

### 6.4 Applying Themes to Workspaces

**Option 1: During Workspace Creation**
- In workspace creation wizard, Step 2: Branding
- Select theme from dropdown
- Theme applies immediately to that workspace

**Option 2: Edit Existing Workspace**
1. Navigate to workspace settings
2. Find "Appearance" section
3. Change theme dropdown
4. Click "Save"
5. Refresh browser to see changes

**Option 3: Workspace-Specific Overrides**

Override specific properties without creating full theme:

```
╔══════════════════════════════════════════════════╗
║ Workspace: Sales Department                     ║
║ Base Theme: Corporate Blue                      ║
║                                                  ║
║ Overrides:                           [+ Add New] ║
║ ├─ Primary Color:  #00BCD4  (Override)          ║
║ ├─ Logo:           sales-logo.png  (Override)   ║
║ └─ Header Height:  80px  (Override)             ║
║                                                  ║
║ Other properties inherited from base theme      ║
╚══════════════════════════════════════════════════╝
```

**Result**: Sales workspace uses Corporate Blue theme BUT with custom primary color, logo, and header height.

---

### 6.5 Theme Import/Export

**Export Theme**:
1. Go to Themes list
2. Click "Export" on desired theme
3. JSON file downloads with all properties
4. Share with other OneCX instances

**Example Export Format**:
```json
{
  "name": "corporate-blue",
  "displayName": "Corporate Blue Theme",
  "properties": {
    "--primary-color": "#1976D2",
    "--font-family": "Roboto, sans-serif",
    "--border-radius": "4px"
  },
  "cssFile": "data:text/css;base64,..."
}
```

**Import Theme**:
1. Go to Themes list
2. Click "Import"
3. Select JSON file
4. Review properties (preview shown)
5. Confirm import
6. Theme added to list

**Use Cases**:
- **Multi-Environment**: Export from DEV, import to PROD
- **Backup**: Save themes before major changes
- **Sharing**: Distribute themes across tenants
- **Templates**: Create starter themes for new workspaces

---

### 6.6 Theme Best Practices

**Color Accessibility**:
- **Contrast Ratio**: Minimum 4.5:1 for text on background
- **Test Tool**: Use built-in contrast checker
- **Colorblind Safe**: Avoid red/green as only differentiator

**Brand Consistency**:
- **Match Corporate**: Use official brand colors
- **Logo Standards**: Follow company logo usage guidelines
- **Typography**: Use approved corporate fonts

**Performance**:
- **Optimize Images**: Compress logos before upload
- **CSS Efficiency**: Don't override every property unnecessarily
- **Testing**: Preview on different devices/browsers

**Maintenance**:
- **Version Control**: Export themes after each change
- **Documentation**: Note why overrides were added
- **Regular Review**: Update outdated color schemes

---

## 7. Managing Bookmarks

### 7.1 Understanding Bookmarks

Bookmarks let users save quick access to:
- **Frequently Visited Pages**: Dashboard, reports, profiles
- **Specific Records**: Customer details, order status, documents
- **External Links**: Related systems, documentation, tools
- **Shared Resources**: Team pages, project wikis

**Bookmark Features**:
- **Personal**: Private to each user
- **Organized**: Create folders and categories
- **Quick Access**: Sidebar or dropdown menu
- **Cross-Workspace**: Access from any workspace

---

### 7.2 Creating Bookmarks

**Method 1: Bookmark Current Page**

While on any page:
1. Click **Bookmark** icon (⭐) in page header
2. Dialog appears:
   ```
   ╔════════════════════════════════════╗
   ║ Add Bookmark                      ║
   ╠════════════════════════════════════╣
   ║ Name: [User Profile - John Doe  ] ║
   ║                                    ║
   ║ URL: /user-profile/users/123       ║
   ║      (Auto-filled)                 ║
   ║                                    ║
   ║ Folder: [My Bookmarks ▼]          ║
   ║                                    ║
   ║        [Cancel]  [Save Bookmark]  ║
   ╚════════════════════════════════════╝
   ```
3. Edit name if needed
4. Select folder (or create new)
5. Click "Save Bookmark"

**Method 2: Manual Bookmark Entry**

For external links or custom URLs:
1. Open bookmark manager
2. Click "+ New Bookmark"
3. Enter details manually:
   - **Name**: Display label
   - **URL**: Full URL or relative path
   - **Description**: Optional notes
   - **Folder**: Organization category

**Method 3: Right-Click Menu** (if enabled)

On any link:
1. Right-click the link
2. Select "Add to Bookmarks"
3. Bookmark created automatically

---

### 7.3 Organizing Bookmarks

**Folder Structure**:
```
📁 My Bookmarks
   ├─ 📁 Daily Tasks
   │    ├─ ⭐ Morning Dashboard
   │    ├─ ⭐ Team Calendar
   │    └─ ⭐ Email Inbox
   ├─ 📁 Reports
   │    ├─ ⭐ Sales Report - Q4
   │    ├─ ⭐ Financial Summary
   │    └─ ⭐ Project Status
   ├─ 📁 Admin Tools
   │    ├─ ⭐ User Management
   │    ├─ ⭐ System Settings
   │    └─ ⭐ Audit Logs
   └─ ⭐ Uncategorized Bookmarks
```

**Creating Folders**:
1. Go to Bookmark Manager
2. Click "+ New Folder"
3. Enter folder name
4. Optionally add description
5. Save

**Moving Bookmarks**:
- **Drag & Drop**: Drag bookmark to folder
- **Edit Dialog**: Edit bookmark, change folder dropdown
- **Bulk Move**: Select multiple, choose "Move to Folder"

**Reordering**:
- Drag bookmarks up/down within folder
- Order saved automatically
- Custom order persists across sessions

---

### 7.4 Using Bookmarks

**Access Methods**:

**1. Sidebar Bookmark Panel**:
```
╔═══════════════════════════╗
║ Bookmarks            [⚙️]  ║
╠═══════════════════════════╣
║ 📁 Daily Tasks       [▼] ║
║   ⭐ Morning Dashboard    ║
║   ⭐ Team Calendar        ║
║   ⭐ Email Inbox          ║
║                           ║
║ 📁 Reports           [▼] ║
║   ⭐ Sales Report - Q4    ║
║   ⭐ Financial Summary    ║
║                           ║
║ [+ Add Current Page]      ║
╚═══════════════════════════╝
```

**2. Header Dropdown**:
```
Bookmarks ▼
  ├─ Morning Dashboard
  ├─ Team Calendar
  ├─ ──────────────────
  ├─ Sales Report - Q4
  ├─ Financial Summary
  └─ Manage Bookmarks...
```

**3. Search**:
- Press Ctrl+K (quick search)
- Type bookmark name
- Navigate instantly

**4. Keyboard Shortcuts** (if configured):
- Ctrl+1 through Ctrl+9: First 9 bookmarks
- Customizable in settings

---

### 7.5 Sharing Bookmarks (If Enabled)

Some OneCX configurations allow bookmark sharing:

**Share with Team**:
1. Right-click bookmark
2. Select "Share"
3. Choose recipients:
   - **Specific Users**: Select from list
   - **Roles**: Share with all admins, managers, etc.
   - **Workspace**: Everyone in current workspace
4. Set permissions:
   - **View Only**: Can see and use
   - **Can Edit**: Can modify bookmark
5. Click "Share"

**Shared Folder View**:
```
📁 My Bookmarks (Private)
   └─ ...

📁 Shared with Me
   ├─ 📁 Team Resources (from John)
   │    └─ ⭐ Project Wiki
   └─ 📁 Admin Guides (from Admin)
        └─ ⭐ Troubleshooting Guide
```

**Accept/Decline Shares**:
- Notification appears when someone shares
- Preview what's shared
- Accept to add to your bookmarks
- Decline to ignore

---

### 7.6 Bookmark Management Best Practices

**Organization Tips**:
- **Use Descriptive Names**: "Q4 Sales Report" not "Report"
- **Consistent Naming**: Date format, capitalization
- **Folder Hierarchy**: Max 2-3 levels deep
- **Regular Cleanup**: Archive or delete old bookmarks

**Performance**:
- **Limit Total Bookmarks**: < 100 for fast loading
- **Archive Old Items**: Move to "Archive" folder
- **Delete Broken Links**: Regularly check and remove

**Security**:
- **Don't Bookmark Sensitive URLs**: Avoid URLs with tokens/passwords
- **Review Shared Bookmarks**: Ensure appropriate access
- **Check External Links**: Verify before sharing

---

## 8. Help & Documentation

### 8.1 Accessing Help

**In-App Help System**:

**Method 1: Help Button**
- Click "?" icon in top right corner
- Context-sensitive help for current page
- Search all documentation

**Method 2: Help Menu**
- Click "Help" in user menu
- Options:
  - Documentation
  - Video Tutorials
  - FAQ
  - Contact Support
  - What's New

**Method 3: Keyboard Shortcut**
- Press **F1** anywhere
- Opens quick help overlay

---

### 8.2 Searching Documentation

**Search Interface**:
```
╔════════════════════════════════════════════╗
║ 🔍 Search Help                        [×]  ║
╠════════════════════════════════════════════╣
║ [how to create workspace          ] [Go]  ║
║                                            ║
║ Results (12):                              ║
║                                            ║
║ 📄 Creating a New Workspace               ║
║    Step-by-step guide to workspace...     ║
║    Admin Guide > Workspaces               ║
║                                            ║
║ 🎥 Video: Workspace Creation              ║
║    5:30 tutorial covering workspace...    ║
║    Video Tutorials > Getting Started      ║
║                                            ║
║ ❓ FAQ: Workspace vs Tenant               ║
║    Understanding the difference...        ║
║    FAQ > Concepts                         ║
╚════════════════════════════════════════════╝
```

**Search Tips**:
- **Use Keywords**: "create user" not "how do I make a new person"
- **Check Suggestions**: Auto-complete shows common topics
- **Filter by Type**: Documentation, Videos, FAQ
- **Sort**: Relevance, Date, Popularity

---

### 8.3 Contextual Help

**Page-Specific Help**:

When on a specific page, help content adapts:

**Example: On Workspace Creation Page**:
```
╔═══════════════════════════════════════════╗
║ Help: Creating a Workspace               ║
╠═══════════════════════════════════════════╣
║ You're currently on the workspace        ║
║ creation wizard. This guide will help:   ║
║                                           ║
║ • Step 1: Basic Information              ║
║   Enter name, URL, and description       ║
║                                           ║
║ • Step 2: Branding                       ║
║   Select theme and upload logos          ║
║                                           ║
║ • Step 3: Products                       ║
║   Choose which features to enable        ║
║                                           ║
║ [Watch Video]  [Read Full Guide]         ║
╚═══════════════════════════════════════════╝
```

**Field-Level Help**:

Hover over (ℹ️) icon next to any field:
```
Base URL: [/sales-workspace]  ℹ️
          ╔════════════════════════════╗
          ║ The URL path where this   ║
          ║ workspace will be         ║
          ║ accessible. Must start    ║
          ║ with / and contain only   ║
          ║ lowercase letters,        ║
          ║ numbers, and hyphens.     ║
          ╚════════════════════════════╝
```

---

### 8.4 Video Tutorials

**Tutorial Library**:
```
╔══════════════════════════════════════════════════╗
║ Video Tutorials                                  ║
╠══════════════════════════════════════════════════╣
║ 🎬 Getting Started (5 videos, 25 min total)     ║
║   ├─ 1. Logging In & First Steps          3:15  ║
║   ├─ 2. Understanding Workspaces          5:30  ║
║   ├─ 3. Navigating the Interface          4:20  ║
║   ├─ 4. Customizing Your Profile          6:10  ║
║   └─ 5. Using Basic Features              5:45  ║
║                                                  ║
║ 🎬 Administration (8 videos, 45 min total)      ║
║   ├─ 1. Creating Workspaces               7:20  ║
║   ├─ 2. Managing Users & Roles            8:15  ║
║   ├─ 3. Setting Permissions               6:40  ║
║   └─ ...                                         ║
║                                                  ║
║ 🎬 Advanced Topics (6 videos, 35 min total)     ║
║   └─ ...                                         ║
╚══════════════════════════════════════════════════╝
```

**Video Features**:
- **Playback Speed**: 0.5x to 2x
- **Subtitles**: Multiple languages
- **Chapter Markers**: Jump to specific topics
- **Download**: Save for offline viewing
- **Transcript**: Read instead of watch

---

### 8.5 FAQ (Frequently Asked Questions)

**Common Questions**:

**Q: What's the difference between a tenant and a workspace?**
A: A **tenant** is your entire organization (like ACME Corp). A **workspace** is a department or team within that tenant (like Sales, HR, Finance). One tenant has multiple workspaces.

**Q: Why can't I see a certain menu item?**
A: Menu visibility is controlled by **permissions**. Contact your workspace administrator to request access.

**Q: How do I reset my password?**
A: Click "Forgot Password" on the login screen. You'll receive an email with reset instructions. If you don't receive it, contact your IT support.

**Q: Can I work in multiple workspaces at once?**
A: Not simultaneously in one browser window. However, you can:
- Switch workspaces via the workspace selector
- Open different workspaces in separate browser tabs
- Use browser profiles for different workspaces

**Q: What happens to my bookmarks if I switch workspaces?**
A: Bookmarks are **user-level**, not workspace-level. They're available in all workspaces you access.

**Q: How often is data backed up?**
A: (Varies by deployment) Typically daily incremental backups and weekly full backups. Contact your system administrator for specific backup schedules.

---

### 8.6 Contacting Support

**Support Channels**:

**In-App Support Ticket**:
1. Help Menu → Contact Support
2. Fill out form:
   ```
   ╔════════════════════════════════════════╗
   ║ Submit Support Request                ║
   ╠════════════════════════════════════════╣
   ║ Category: [Technical Issue      ▼]    ║
   ║ Priority: [Normal               ▼]    ║
   ║                                        ║
   ║ Subject:                               ║
   ║ [Cannot upload logo in workspace]     ║
   ║                                        ║
   ║ Description:                           ║
   ║ [When I try to upload a logo file,   ]║
   ║ [I get error "File too large" even   ]║
   ║ [though file is only 50KB.           ]║
   ║                                        ║
   ║ Attachments:                           ║
   ║ [📎 screenshot.png]  [+ Add File]     ║
   ║                                        ║
   ║           [Cancel]  [Submit Ticket]   ║
   ╚════════════════════════════════════════╝
   ```
3. Attach screenshots if helpful
4. Submit ticket
5. Track status in Support Portal

**Other Channels**:
- **Email**: support@onecx.example.com
- **Phone**: 1-800-ONECX-HELP (during business hours)
- **Chat**: Live chat (if enabled)
- **Community Forum**: community.onecx.example.com

**Before Contacting Support**:
- Check FAQ and documentation
- Try the troubleshooting guide
- Gather relevant information:
  - What were you trying to do?
  - What happened instead?
  - Error messages (exact text or screenshot)
  - Which workspace/product?
  - Browser type and version

---

## 9. Troubleshooting Common Issues

### 9.1 Login Problems

**Issue: Can't Log In**

**Symptoms**: Login button doesn't work, "Invalid credentials" error, redirect loops

**Solutions**:

1. **Check Credentials**:
   - Username/email correct?
   - Password case-sensitive
   - Caps Lock off

2. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+Delete → Clear browsing data
   - Firefox: Ctrl+Shift+Delete → Clear history
   - Safari: Cmd+Option+E → Empty caches

3. **Try Incognito/Private Mode**:
   - Eliminates browser extensions interference
   - If it works, disable extensions one by one

4. **Check Network**:
   - Connected to internet?
   - VPN required?
   - Firewall blocking?

5. **Password Reset**:
   - Click "Forgot Password"
   - Follow email instructions

**Still not working?** Contact IT support with error message screenshot.

---

### 9.2 Performance Issues

**Issue: Pages Load Slowly**

**Symptoms**: Long wait times, spinning loaders, timeouts

**Solutions**:

1. **Check Internet Speed**:
   - Run speed test (speedtest.net)
   - Minimum recommended: 5 Mbps down, 1 Mbps up

2. **Close Unused Tabs**:
   - Each tab consumes memory
   - Keep < 10 tabs open

3. **Clear Browser Data**:
   - Cookies and cache can slow down browser
   - Clear data older than 4 weeks

4. **Disable Extensions**:
   - Ad blockers can interfere
   - Try disabling all extensions

5. **Update Browser**:
   - Old browsers lack performance optimizations
   - Use latest Chrome, Firefox, or Edge

6. **Check System Resources**:
   - Close other applications
   - Restart computer if running for days

**When to Report**:
- If only OneCX is slow (other sites fast)
- If specific pages always slow
- If slowness started after recent update

---

### 9.3 Display Issues

**Issue: UI Looks Broken**

**Symptoms**: Overlapping elements, missing buttons, wrong colors, layout broken

**Common Causes**:

1. **Zoom Level Wrong**:
   - Press Ctrl+0 (Cmd+0 on Mac) to reset zoom
   - Recommended zoom: 100%

2. **Browser Compatibility**:
   - OneCX requires modern browsers:
     - Chrome 90+
     - Firefox 88+
     - Edge 90+
     - Safari 14+

3. **Theme Issue**:
   - Try switching workspace theme
   - Report theme to administrator

4. **Cache Corruption**:
   - Hard refresh: Ctrl+Shift+R (Cmd+Shift+R)
   - Clear cache and reload

5. **Screen Resolution**:
   - Minimum: 1366x768
   - Recommended: 1920x1080

**Mobile Issues**:
- OneCX is desktop-first
- Some features limited on mobile
- Use desktop browser for full functionality

---

### 9.4 Permission Errors

**Issue: "Access Denied" or Missing Features**

**Symptoms**: Error messages, missing menu items, disabled buttons

**Understanding Permissions**:
- Permissions control what you can see and do
- Set by workspace administrators
- Role-based (your role determines permissions)

**Troubleshooting Steps**:

1. **Verify Workspace**:
   - Are you in the correct workspace?
   - Check workspace selector

2. **Check Your Role**:
   - Profile Menu → My Profile → Roles tab
   - See which roles assigned

3. **Request Access**:
   - Identify required permission
   - Contact workspace admin
   - Explain business need

4. **Temporary Workaround**:
   - Ask admin to perform action
   - Wait for permission grant

**Common Permission Scenarios**:
- **Can view but not edit**: Read-only role
- **Can't see admin menu**: Not an administrator
- **Can't create workspaces**: Requires WORKSPACE#CREATE permission
- **Can't manage users**: Requires IAM#ADMIN permission

---

### 9.5 File Upload Problems

**Issue: Can't Upload Files**

**Symptoms**: Upload fails, error messages, file rejected

**Common Causes & Solutions**:

1. **File Too Large**:
   - Check maximum size (usually 5-10 MB)
   - Compress/resize image before upload
   - For logos: use tinypng.com to compress

2. **Wrong File Type**:
   - Logos: PNG, JPG, SVG only
   - Documents: PDF, DOCX, XLSX
   - Check allowed types in upload dialog

3. **File Name Issues**:
   - Remove special characters
   - Shorten very long filenames
   - Avoid spaces (use hyphens)

4. **Network Interruption**:
   - Large files need stable connection
   - Don't close tab during upload
   - Try upload during off-peak hours

5. **Browser Issues**:
   - Try different browser
   - Update browser to latest version

**Troubleshooting Checklist**:
- [ ] File size < maximum allowed
- [ ] File type is supported
- [ ] Filename has no special characters
- [ ] Stable internet connection
- [ ] Browser updated
- [ ] Sufficient storage quota remaining

---

### 9.6 Session Timeout Issues

**Issue: Keep Getting Logged Out**

**Symptoms**: Frequent "Session expired" messages, forced re-login

**Why It Happens**:
- Security feature: inactive sessions auto-expire
- Default timeout: 30 minutes of inactivity
- Cannot be changed by users (admin setting)

**Solutions**:

1. **Stay Active**:
   - Move mouse, click links regularly
   - Counts as activity

2. **Save Work Frequently**:
   - Don't rely on auto-save alone
   - Click Save button periodically

3. **Enable "Remember Me"** (if available):
   - Checkbox on login screen
   - Extends session to 7 days

4. **Multiple Tabs**:
   - Activity in one tab counts for all
   - Keep OneCX open in background tab

5. **Check Time Sync**:
   - Computer clock accurate?
   - Wrong time causes session issues

**When Working on Long Forms**:
- Copy text to clipboard before submitting
- Use external text editor as backup
- Save drafts if feature available

---

### 9.7 Browser Compatibility

**Supported Browsers**:

| Browser | Minimum Version | Recommended |
|---------|----------------|-------------|
| Chrome | 90+ | Latest |
| Firefox | 88+ | Latest |
| Edge | 90+ | Latest |
| Safari | 14+ | Latest |

**Not Supported**:
- Internet Explorer (any version)
- Opera Mini
- Mobile browsers (limited support)

**Checking Your Browser**:
1. Open browser
2. Go to Help → About [Browser Name]
3. Version shown
4. Update if needed

**Browser-Specific Issues**:

**Chrome**:
- Best compatibility
- Enable hardware acceleration for performance

**Firefox**:
- Disable "Enhanced Tracking Protection" for OneCX
- May need to allow cookies

**Safari**:
- Enable "Allow Cookies from Websites I Visit"
- Disable "Prevent Cross-Site Tracking" for OneCX

**Edge**:
- Use Chromium-based Edge (version 79+)
- Legacy Edge not supported

---

## 10. Advanced User Tips

### 10.1 Keyboard Shortcuts

**Global Shortcuts**:

| Shortcut | Action |
|----------|--------|
| **Ctrl + /** | Show all shortcuts |
| **Ctrl + K** | Quick search |
| **F1** | Help |
| **Ctrl + S** | Save (on forms) |
| **Esc** | Close dialog/cancel |

**Navigation**:

| Shortcut | Action |
|----------|--------|
| **Alt + W** | Workspace selector |
| **Alt + H** | Home page |
| **Alt + N** | Notifications |
| **Alt + P** | User profile |

**Forms & Editing**:

| Shortcut | Action |
|----------|--------|
| **Tab** | Next field |
| **Shift + Tab** | Previous field |
| **Ctrl + Enter** | Submit form |
| **Ctrl + Z** | Undo |

**Custom Shortcuts** (if enabled):
- Admin can configure additional shortcuts
- Check Help → Keyboard Shortcuts for full list

---

### 10.2 Quick Search

**Activating Quick Search**:
- Click search icon in header
- Press **Ctrl + K** anywhere
- Type "/" in empty field

**What You Can Search**:
- **Workspaces**: Switch quickly
- **Users**: Find profiles
- **Pages**: Navigate directly
- **Bookmarks**: Jump to saved pages
- **Help**: Find documentation

**Search Examples**:
```
> user john          → Find user "John Doe"
> workspace sales    → Switch to sales workspace
> /admin            → Go to admin panel
> @settings         → Open settings
```

**Search Operators**:
- **>**: Commands and actions
- **/**: Navigate to path
- **@**: Open specific section
- **?**: Search help

**Recent Searches**: Previously searched items appear first for quick access.

---

### 8.4 Video Tutorials

**Tutorial Library**:
```
╔══════════════════════════════════════════════════╗
║ Video Tutorials                                  ║
╠══════════════════════════════════════════════════╣
║ 📁 Getting Started (5 videos)                    ║
║   🎥 Platform Overview (3:45)                    ║
║   🎥 First Login (2:30)                          ║
║   🎥 Navigating Workspaces (4:15)               ║
║                                                  ║
║ 📁 Administration (8 videos)                     ║
║   🎥 Creating Workspaces (5:30)                  ║
║   🎥 Managing Users (6:45)                       ║
║   🎥 Permission Setup (8:20)                     ║
╚══════════════════════════════════════════════════╝
```

---

## 9. Tenant Administration

### 9.1 Understanding Tenants

**What is a Tenant?**

A **tenant** is a completely isolated instance of OneCX for an organization:
- **Separate Database**: Each tenant has its own data
- **User Isolation**: Users in Tenant A cannot see Tenant B users
- **Configuration Isolation**: Themes, workspaces, permissions are separate
- **Multi-Tenant Architecture**: One OneCX installation serves multiple organizations

**Use Cases**:
- **SaaS Providers**: Serve multiple customer organizations
- **Enterprise Departments**: Separate data for HR, Finance, Sales
- **Regional Divisions**: North America, Europe, Asia tenants
- **Development/Testing**: Separate tenants for DEV, QA, PROD

**Problem It Solves**:
- **Data Privacy**: Legal requirement to separate customer data
- **Security**: Prevent unauthorized cross-tenant access
- **Customization**: Each tenant can have different configurations
- **Scalability**: Add new organizations without infrastructure changes

---

### 9.2 Viewing Tenants

**Access**: Navigate to **System Administration → Tenants**

**Required Permission**: `TENANT#VIEW` (Super Admin only)

**Tenant List**:
```
╔════════════════════════════════════════════════════════╗
║ Tenants                                 [+ Create]     ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search: [___________]  Sort: [Name ▼]  [Filter]   ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 🏢 ACME Corporation                                   ║
║    Tenant ID: acme-corp                               ║
║    Created: Jan 15, 2025                              ║
║    Users: 250 | Workspaces: 5                        ║
║    Status: Active ✓                                   ║
║    [View] [Edit] [Disable]                           ║
║                                                        ║
║ 🏢 Contoso Ltd                                        ║
║    Tenant ID: contoso                                 ║
║    Created: Feb 1, 2025                               ║
║    Users: 120 | Workspaces: 3                        ║
║    Status: Active ✓                                   ║
║    [View] [Edit] [Disable]                           ║
║                                                        ║
║ 🏢 Demo Tenant                                        ║
║    Tenant ID: demo                                    ║
║    Created: Dec 10, 2024                              ║
║    Users: 5 | Workspaces: 1                          ║
║    Status: Trial (30 days remaining) ⚠️               ║
║    [View] [Edit] [Upgrade]                           ║
╚════════════════════════════════════════════════════════╝
```

**Tenant Information**:
- **Tenant ID**: Unique identifier (cannot change)
- **Name**: Organization display name
- **Status**: Active, Inactive, Trial, Suspended
- **Users**: Total user count
- **Workspaces**: Number of workspaces
- **Created Date**: When tenant was provisioned

---

### 9.3 Creating a New Tenant

**Step 1: Click "+ Create"**

**Step 2: Basic Information**
```
╔══════════════════════════════════════════════════╗
║ Create New Tenant                   [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 1 of 3: Basic Information                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Tenant ID: * [acme-corp______________]           ║
║   ℹ️  Lowercase, no spaces (cannot change later) ║
║                                                  ║
║ Organization Name: * [ACME Corporation____]      ║
║                                                  ║
║ Description:                                     ║
║   [Leading provider of enterprise______]        ║
║   [solutions for manufacturing_________]        ║
║                                                  ║
║ Primary Contact:                                 ║
║   Name: * [John Smith__________________]         ║
║   Email: * [john.smith@acme.com________]         ║
║   Phone: [+1-555-1234__________________]         ║
║                                                  ║
║            [Cancel] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Field Guide**:
- **Tenant ID**: Technical identifier (e.g., `acme-corp`)
  - Used in database schemas, URLs, logs
  - Cannot contain spaces or special characters
  - **CANNOT BE CHANGED** after creation
  
- **Organization Name**: Human-readable name
  - Displayed to users
  - Can be changed later

- **Primary Contact**: Main administrator
  - Receives important notifications
  - Initial super admin account

**Step 3: Configuration**
```
╔══════════════════════════════════════════════════╗
║ Create New Tenant                   [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 2 of 3: Configuration                      ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Default Language: [English (US) ▼]               ║
║                                                  ║
║ Timezone: [America/New_York ▼]                   ║
║                                                  ║
║ Date Format: [MM/DD/YYYY ▼]                      ║
║                                                  ║
║ Currency: [USD - US Dollar ▼]                    ║
║                                                  ║
║ User Limit: [500____________] (leave empty for   ║
║                                unlimited)         ║
║                                                  ║
║ Workspace Limit: [10_______] (leave empty for   ║
║                                unlimited)         ║
║                                                  ║
║ Storage Quota (GB): [100____] (leave empty for  ║
║                                unlimited)         ║
║                                                  ║
║ License Type:                                    ║
║ ○ Trial (30 days)                                ║
║ ● Enterprise                                     ║
║ ○ Premium                                        ║
║                                                  ║
║            [← Back] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Step 4: Initial Setup**
```
╔══════════════════════════════════════════════════╗
║ Create New Tenant                   [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 3 of 3: Initial Setup                      ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ ☑ Create default workspace                      ║
║   Workspace Name: [Main Workspace_______]        ║
║                                                  ║
║ ☑ Create admin user                             ║
║   Username: [admin@acme.com__________]           ║
║   Temp Password: [Generate_____] [📋 Copy]      ║
║   ☑ Force password change on first login        ║
║                                                  ║
║ ☑ Import default themes                         ║
║   Select themes: [✓] Light  [✓] Dark  [ ] High  ║
║                                                  ║
║ ☑ Enable sample data                            ║
║   (Recommended for evaluation only)              ║
║                                                  ║
║ ☐ Send welcome email to admin                   ║
║                                                  ║
║            [← Back] [Create Tenant]              ║
╚══════════════════════════════════════════════════╝
```

**Step 5: Tenant Creation in Progress**
```
╔══════════════════════════════════════════════════╗
║ Creating Tenant...                               ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ ✓ Creating database schema                      ║
║ ✓ Provisioning storage                          ║
║ ✓ Creating admin user                           ║
║ ⏳ Setting up default workspace...               ║
║ ⏹ Importing themes                               ║
║ ⏹ Configuring permissions                        ║
║                                                  ║
║ Please wait, this may take a few minutes...     ║
╚══════════════════════════════════════════════════╝
```

**Step 6: Success!**
```
╔══════════════════════════════════════════════════╗
║ ✓ Tenant Created Successfully                    ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Tenant "ACME Corporation" is now active.        ║
║                                                  ║
║ Tenant Details:                                  ║
║   Tenant ID: acme-corp                          ║
║   Portal URL: https://portal.acme-corp.onecx.io ║
║   Admin Username: admin@acme.com                 ║
║   Temp Password: Xy9$mK3pL#2q                    ║
║                                                  ║
║ Important:                                       ║
║ • Save the admin credentials securely           ║
║ • Admin must change password on first login     ║
║ • Configure SSO/SAML if needed                  ║
║                                                  ║
║ What's next?                                     ║
║ ▶ View tenant details                           ║
║ ▶ Configure workspaces                          ║
║ ▶ Add users                                     ║
║ ▶ Setup permissions                             ║
║                                                  ║
║              [Close] [Go to Tenant]              ║
╚══════════════════════════════════════════════════╝
```

---

### 9.4 Managing Tenant Settings

**View Tenant Details**:
```
╔════════════════════════════════════════════════════════╗
║ Tenant: ACME Corporation                    [⬅ Back]  ║
╠════════════════════════════════════════════════════════╣
║ Tabs: [Overview●] [Users] [Workspaces] [Settings]    ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Status: Active ✓                                      ║
║ Created: Jan 15, 2025                                 ║
║ Last Modified: Feb 19, 2026                           ║
║                                                        ║
║ Statistics:                                            ║
║   Total Users: 250 / 500 (50% used)                   ║
║   Active Users: 180                                    ║
║   Workspaces: 5 / 10 (50% used)                       ║
║   Storage Used: 45 GB / 100 GB (45% used)            ║
║                                                        ║
║ License:                                               ║
║   Type: Enterprise                                     ║
║   Valid Until: Dec 31, 2026                           ║
║   Features: All features enabled                       ║
║                                                        ║
║ Contact:                                               ║
║   Primary: John Smith (john.smith@acme.com)           ║
║   Phone: +1-555-1234                                   ║
║                                                        ║
║ Configuration:                                         ║
║   Default Language: English (US)                       ║
║   Timezone: America/New_York                           ║
║   Currency: USD                                        ║
║                                                        ║
║ [Edit Settings] [Export Data] [Suspend]  [Delete]    ║
╚════════════════════════════════════════════════════════╝
```

---

### 9.5 Tenant Operations

#### Suspend Tenant

**When to Use**: Temporarily disable tenant (non-payment, security issue)

**Effect**:
- All users cannot log in
- Data preserved
- Can be reactivated later

**Steps**:
1. Click **"Suspend"** button
2. Enter reason: `Payment overdue - contact billing`
3. Confirm suspension
4. Users see: "Account temporarily suspended. Contact administrator."

#### Delete Tenant

**⚠️ WARNING**: Permanent action, cannot be undone!

**Effect**:
- All data deleted (users, workspaces, content)
- Database schema dropped
- Storage wiped

**Steps**:
1. Click **"Delete"** button
2. Type tenant ID to confirm: `acme-corp`
3. Enter deletion reason
4. Confirm with password
5. Wait for deletion to complete (5-10 minutes)

---

## 10. Permission Management

### 10.1 Understanding Permissions

**What are Permissions?**

Permissions control **who can do what** in OneCX:
- **Resource-Based**: Permissions apply to specific resources (USER, WORKSPACE, THEME)
- **Action-Based**: What actions are allowed (VIEW, EDIT, CREATE, DELETE)
- **Role-Based**: Permissions assigned to roles, roles assigned to users
- **Hierarchical**: Permissions can inherit from parent resources

**Permission Format**: `RESOURCE#ACTION`

**Examples**:
- `USER#VIEW` - Can view users
- `USER#EDIT` - Can edit user details
- `USER#CREATE` - Can create new users
- `USER#DELETE` - Can delete users
- `WORKSPACE#ADMIN` - Full workspace administration

**Use Cases**:
- **Role Separation**: Admins vs regular users
- **Department Access**: HR can manage users, IT can manage workspaces
- **Compliance**: Audit trails for who did what
- **Security**: Principle of least privilege

**Problem It Solves**:
- **Unauthorized Access**: Prevents users from accessing restricted features
- **Data Breaches**: Limits exposure if account compromised
- **Compliance**: GDPR, SOC2 require access controls
- **Operational Safety**: Prevent accidental deletions by junior staff

---

### 10.2 Viewing Permissions

**Access**: Navigate to **Administration → Permissions**

**Required Permission**: `PERMISSION#VIEW`

**Permission List**:
```
╔════════════════════════════════════════════════════════╗
║ Permissions                            [+ Create]      ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search: [___________]  Resource: [All ▼]          ║
║ Action: [All ▼]  Application: [All ▼]                ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 📋 User Management                                    ║
║ ├─ USER#VIEW - View user list and details            ║
║ │  Roles: Admin, Manager, Viewer                     ║
║ │  [Edit] [Delete]                                   ║
║ ├─ USER#CREATE - Create new users                    ║
║ │  Roles: Admin, Manager                             ║
║ │  [Edit] [Delete]                                   ║
║ ├─ USER#EDIT - Edit user information                 ║
║ │  Roles: Admin, Manager                             ║
║ │  [Edit] [Delete]                                   ║
║ └─ USER#DELETE - Delete users                        ║
║    Roles: Admin                                       ║
║    [Edit] [Delete]                                    ║
║                                                        ║
║ 📋 Workspace Management                               ║
║ ├─ WORKSPACE#VIEW - View workspaces                  ║
║ │  Roles: Admin, Workspace Manager, All Users        ║
║ ├─ WORKSPACE#CREATE - Create workspaces              ║
║ │  Roles: Admin, Workspace Manager                   ║
║ └─ WORKSPACE#DELETE - Delete workspaces              ║
║    Roles: Admin                                       ║
║                                                        ║
║ 📋 Theme Management                                   ║
║ ├─ THEME#VIEW - View themes                          ║
║ ├─ THEME#CREATE - Create custom themes               ║
║ └─ THEME#EDIT - Edit themes                          ║
╚════════════════════════════════════════════════════════╝
```

---

### 10.3 Creating Permissions

**Step 1: Click "+ Create"**

```
╔══════════════════════════════════════════════════╗
║ Create Permission                   [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Application: * [User Profile ▼]                  ║
║   Select which app this permission belongs to    ║
║                                                  ║
║ Resource: * [USER_______________]                ║
║   ℹ️  Resource name (uppercase, no spaces)       ║
║                                                  ║
║ Action: * [EDIT________________]                 ║
║   ℹ️  Action name (VIEW, EDIT, CREATE, DELETE)   ║
║                                                  ║
║ Permission: USER#EDIT (auto-generated)           ║
║                                                  ║
║ Display Name: [Edit Users______________]         ║
║                                                  ║
║ Description:                                     ║
║   [Allows editing user information,____]        ║
║   [including name, email, and roles____]        ║
║                                                  ║
║ Mandatory Permission: ☐                          ║
║   ℹ️  If checked, all users automatically get    ║
║      this permission (for essential features)    ║
║                                                  ║
║            [Cancel] [Create]                     ║
╚══════════════════════════════════════════════════╝
```

**Permission Naming Convention**:
```
Resource: USER
Action: VIEW
Result: USER#VIEW

Resource: WORKSPACE
Action: ADMIN
Result: WORKSPACE#ADMIN

Resource: ANNOUNCEMENT
Action: CREATE
Result: ANNOUNCEMENT#CREATE
```

---

### 10.4 Managing Roles

**What are Roles?**

Roles are **collections of permissions** assigned to users:
- **Admin Role**: All permissions
- **Manager Role**: View + Edit permissions
- **Viewer Role**: View-only permissions
- **Custom Roles**: Tailored to specific needs

**Viewing Roles**:
```
╔════════════════════════════════════════════════════════╗
║ Roles                                  [+ Create]      ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search: [___________]  Sort: [Name ▼]             ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 🛡️  ADMIN                                             ║
║    Description: Full system administrator              ║
║    Users: 5                                            ║
║    Permissions: 45 (All permissions)                   ║
║    [View] [Edit] [Delete]                             ║
║                                                        ║
║ 🛡️  WORKSPACE_MANAGER                                 ║
║    Description: Can manage workspaces                  ║
║    Users: 12                                           ║
║    Permissions: 15                                     ║
║      • WORKSPACE#VIEW, WORKSPACE#EDIT                 ║
║      • THEME#VIEW, THEME#APPLY                        ║
║      • MENU#EDIT                                       ║
║    [View] [Edit] [Delete]                             ║
║                                                        ║
║ 🛡️  USER_MANAGER                                      ║
║    Description: Can manage users                       ║
║    Users: 8                                            ║
║    Permissions: 10                                     ║
║      • USER#VIEW, USER#CREATE, USER#EDIT              ║
║      • PERMISSION#VIEW                                 ║
║    [View] [Edit] [Delete]                             ║
║                                                        ║
║ 🛡️  VIEWER                                            ║
║    Description: Read-only access                       ║
║    Users: 200                                          ║
║    Permissions: 5                                      ║
║      • USER#VIEW, WORKSPACE#VIEW                      ║
║      • THEME#VIEW                                      ║
║    [View] [Edit] [Delete]                             ║
╚════════════════════════════════════════════════════════╝
```

**Creating a Role**:
```
╔══════════════════════════════════════════════════╗
║ Create Role                         [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Name: * [USER_MANAGER_____________]              ║
║   ℹ️  Uppercase, underscores only                ║
║                                                  ║
║ Display Name: * [User Manager_________]          ║
║                                                  ║
║ Description:                                     ║
║   [Can create, edit, and view users____]        ║
║   [Cannot delete users__________________]        ║
║                                                  ║
║ Assign Permissions:                              ║
║ ┌────────────────────────────────────────────┐  ║
║ │ 📁 User Management                         │  ║
║ │   ☑ USER#VIEW - View users                 │  ║
║ │   ☑ USER#CREATE - Create users             │  ║
║ │   ☑ USER#EDIT - Edit users                 │  ║
║ │   ☐ USER#DELETE - Delete users             │  ║
║ │                                             │  ║
║ │ 📁 Workspace Management                     │  ║
║ │   ☑ WORKSPACE#VIEW - View workspaces       │  ║
║ │   ☐ WORKSPACE#CREATE                        │  ║
║ │   ☐ WORKSPACE#EDIT                          │  ║
║ │                                             │  ║
║ │ 📁 Permission Management                    │  ║
║ │   ☑ PERMISSION#VIEW - View permissions     │  ║
║ │   ☐ PERMISSION#EDIT                         │  ║
║ └────────────────────────────────────────────┘  ║
║                                                  ║
║ Selected: 5 permissions                          ║
║                                                  ║
║            [Cancel] [Create]                     ║
╚══════════════════════════════════════════════════╝
```

---

### 10.5 Assigning Permissions to Users

**Option 1: Via User Profile**

1. Navigate to **Users → Select User**
2. Click **"Roles"** tab
3. Click **"+ Assign Role"**
4. Select role from dropdown
5. Click **"Assign"**

```
╔════════════════════════════════════════════════════════╗
║ User: John Doe                                         ║
╠════════════════════════════════════════════════════════╣
║ Tabs: [Profile] [Roles●] [Permissions] [Activity]    ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Assigned Roles                         [+ Assign Role] ║
║                                                        ║
║ 🛡️  USER_MANAGER                                      ║
║    Assigned: Jan 15, 2026                             ║
║    By: admin@company.com                              ║
║    [Remove]                                            ║
║                                                        ║
║ 🛡️  WORKSPACE_VIEWER                                  ║
║    Assigned: Jan 15, 2026                             ║
║    By: admin@company.com                              ║
║    [Remove]                                            ║
║                                                        ║
║ Effective Permissions (15):                           ║
║   • USER#VIEW, USER#CREATE, USER#EDIT                 ║
║   • WORKSPACE#VIEW                                     ║
║   • PERMISSION#VIEW                                    ║
║   • ... 10 more                                        ║
║   [View All Permissions]                               ║
╚════════════════════════════════════════════════════════╝
```

**Option 2: Bulk Assignment**

1. Navigate to **Roles → Select Role**
2. Click **"Users"** tab
3. Click **"+ Add Users"**
4. Select multiple users
5. Click **"Assign"**

---

### 10.6 Permission Best Practices

**Principle of Least Privilege**:
- Grant minimum permissions needed for job function
- Regular users: VIEW permissions only
- Managers: VIEW + EDIT permissions
- Admins: All permissions

**Permission Audit**:
- Review user permissions quarterly
- Remove permissions from inactive users
- Document why each user has each permission

**Role Design**:
- Create specific roles for job functions (not generic roles)
- Good: `SALES_MANAGER`, `HR_ADMIN`, `IT_SUPPORT`
- Bad: `POWER_USER`, `SUPER_USER`

**Common Roles**:
```
ADMIN: All permissions
WORKSPACE_ADMIN: WORKSPACE#*, THEME#*, MENU#*
USER_ADMIN: USER#*, PERMISSION#VIEW
CONTENT_EDITOR: ANNOUNCEMENT#*, HELP#*
VIEWER: *#VIEW (view-only everything)
```

---

## 11. Product Store Administration

### 11.1 Understanding Product Store

**What is Product Store?**

The Product Store is OneCX's **application marketplace**:
- **Catalog**: Lists all available applications/products
- **Registration**: Developers register their microfrontends
- **Discovery**: Shell discovers what products exist
- **Deployment**: Products can be deployed to workspaces
- **Versioning**: Tracks product versions and updates

**Use Cases**:
- **IT Teams**: Deploy new applications to workspaces
- **Developers**: Register new microfrontend apps
- **Admins**: Control which apps are available
- **Product Owners**: Manage application lifecycle

**Problem It Solves**:
- **Decentralized Apps**: No need to rebuild portal to add new apps
- **Version Control**: Easily rollback or upgrade apps
- **Governance**: Control what applications users can access
- **Discoverability**: Find available applications

---

### 11.2 Viewing Products

**Access**: Navigate to **Administration → Product Store**

**Required Permission**: `PRODUCT_STORE#VIEW`

**Product Catalog**:
```
╔════════════════════════════════════════════════════════╗
║ Product Store                         [+ Register]     ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search: [___________]  Category: [All ▼]          ║
║ Status: [All ▼]  Sort: [Name ▼]                      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 📦 User Profile Management                            ║
║    Product Name: onecx-user-profile                    ║
║    Version: 6.2.0 (latest)                            ║
║    Category: User Management                           ║
║    Status: Active ✓                                   ║
║    Description: Manage user profiles, avatars, and    ║
║                 personal settings                      ║
║    Deployments: 12 workspaces                         ║
║    [View Details] [Deploy] [Update]                   ║
║                                                        ║
║ 📦 Workspace Management                               ║
║    Product Name: onecx-workspace                       ║
║    Version: 6.1.5 (latest)                            ║
║    Category: Administration                            ║
║    Status: Active ✓                                   ║
║    Description: Create and manage workspaces,          ║
║                 themes, and menus                      ║
║    Deployments: 15 workspaces                         ║
║    [View Details] [Deploy] [Update]                   ║
║                                                        ║
║ 📦 Announcement System                                ║
║    Product Name: onecx-announcement                    ║
║    Version: 6.0.3 (latest)                            ║
║    Category: Communication                             ║
║    Status: Active ✓                                   ║
║    Description: Create and manage system-wide          ║
║                 announcements and notifications        ║
║    Deployments: 8 workspaces                          ║
║    [View Details] [Deploy] [Update]                   ║
║                                                        ║
║ 📦 Theme Manager                                      ║
║    Product Name: onecx-theme                           ║
║    Version: 6.1.0 (latest)                            ║
║    Category: Customization                             ║
║    Status: Active ✓                                   ║
║    Description: Create and customize portal themes     ║
║    Deployments: 12 workspaces                         ║
║    [View Details] [Deploy] [Update]                   ║
╚════════════════════════════════════════════════════════╝
```

---

### 11.3 Product Details

**Click "View Details" on any product**:
```
╔════════════════════════════════════════════════════════╗
║ Product: User Profile Management            [⬅ Back]  ║
╠════════════════════════════════════════════════════════╣
║ Tabs: [Overview●] [Microfrontends] [Deployments]     ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Product Information:                                   ║
║   Name: onecx-user-profile                            ║
║   Display Name: User Profile Management                ║
║   Version: 6.2.0                                       ║
║   Category: User Management                            ║
║   Provider: OneCX Development Team                     ║
║   License: Apache 2.0                                  ║
║                                                        ║
║ Description:                                           ║
║   Comprehensive user profile management system         ║
║   allowing users to manage their personal              ║
║   information, avatar, preferences, and settings.      ║
║                                                        ║
║ Features:                                              ║
║   • User profile viewing and editing                   ║
║   • Avatar upload and management                       ║
║   • Language and timezone preferences                  ║
║   • Notification settings                              ║
║   • Account security (password, 2FA)                   ║
║                                                        ║
║ Technical Details:                                     ║
║   Technology: Angular 19, PrimeNG 19                   ║
║   Base URL: /user-profile                             ║
║   Microfrontends: 1 (user-profile-ui)                 ║
║   Remote URL: http://user-profile-ui:8080             ║
║                                                        ║
║ Dependencies:                                          ║
║   • Authentication Service (required)                  ║
║   • Storage Service (required)                         ║
║   • Notification Service (optional)                    ║
║                                                        ║
║ Permissions:                                           ║
║   • USER#VIEW - View user profiles                    ║
║   • USER#EDIT - Edit own profile                      ║
║   • USER#ADMIN - Manage all users                     ║
║                                                        ║
║ [Deploy to Workspace] [Unregister] [Export]          ║
╚════════════════════════════════════════════════════════╝
```

---

### 11.4 Registering New Products

**Step 1: Click "+ Register"**

```
╔══════════════════════════════════════════════════╗
║ Register New Product                [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 1 of 3: Basic Information                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Product Name: * [onecx-custom-app____]           ║
║   ℹ️  Lowercase, hyphens (e.g., onecx-myapp)     ║
║                                                  ║
║ Display Name: * [Custom Application____]         ║
║                                                  ║
║ Version: * [1.0.0________________]               ║
║   ℹ️  Semantic versioning (MAJOR.MINOR.PATCH)    ║
║                                                  ║
║ Category: [Business Apps ▼]                      ║
║   Options: User Management, Administration,      ║
║            Communication, Business Apps,         ║
║            Utilities, Custom                     ║
║                                                  ║
║ Description:                                     ║
║   [Custom application for business_____]        ║
║   [process management___________________]        ║
║   [____________________________________]        ║
║                                                  ║
║ Provider: [ACME Corporation__________]           ║
║                                                  ║
║ Contact Email: [support@acme.com_____]           ║
║                                                  ║
║            [Cancel] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Step 2: Microfrontend Configuration**
```
╔══════════════════════════════════════════════════╗
║ Register New Product                [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 2 of 3: Microfrontend Configuration        ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Microfrontend Name: * [custom-app-ui___]         ║
║                                                  ║
║ Remote Entry URL: *                              ║
║   [http://custom-app-ui:8080/remoteEntry.js]    ║
║   ℹ️  URL where microfrontend is hosted          ║
║                                                  ║
║ Base Path: * [/custom-app_____________]          ║
║   ℹ️  URL path in workspace (e.g., /my-app)      ║
║                                                  ║
║ Exposed Module: * [./Module____________]         ║
║   ℹ️  Usually "./Module" for Angular apps        ║
║                                                  ║
║ Technology:                                      ║
║   ● Angular                                      ║
║   ○ React                                        ║
║   ○ Vue                                          ║
║                                                  ║
║ Type:                                            ║
║   ● Component (standalone feature)               ║
║   ○ Module (multiple features)                   ║
║                                                  ║
║            [← Back] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Step 3: Permissions and Endpoints**
```
╔══════════════════════════════════════════════════╗
║ Register New Product                [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 3 of 3: Permissions & Endpoints            ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Required Permissions:                            ║
║   [+ Add Permission]                             ║
║   • CUSTOM_APP#VIEW                              ║
║   • CUSTOM_APP#EDIT                              ║
║   [Remove]                                       ║
║                                                  ║
║ Backend Endpoints:                               ║
║   [+ Add Endpoint]                               ║
║   • BFF: http://custom-app-bff:8080             ║
║   • API: http://custom-app-svc:8080             ║
║   [Remove]                                       ║
║                                                  ║
║ Dependencies:                                    ║
║   [+ Add Dependency]                             ║
║   • Authentication Service (required)            ║
║   • User Service (required)                      ║
║   [Remove]                                       ║
║                                                  ║
║ Health Check URL:                                ║
║   [http://custom-app-ui:8080/health_______]     ║
║   ℹ️  Optional endpoint for monitoring           ║
║                                                  ║
║            [← Back] [Register Product]           ║
╚══════════════════════════════════════════════════╝
```

**Step 4: Registration Success**
```
╔══════════════════════════════════════════════════╗
║ ✓ Product Registered Successfully                ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Product "Custom Application" has been            ║
║ registered in the Product Store.                 ║
║                                                  ║
║ Product Details:                                 ║
║   Name: onecx-custom-app                         ║
║   Version: 1.0.0                                 ║
║   Status: Active                                 ║
║                                                  ║
║ What's next?                                     ║
║ ▶ Deploy to workspace                           ║
║ ▶ Test in development environment               ║
║ ▶ Configure permissions                         ║
║ ▶ Add to workspace menu                         ║
║                                                  ║
║              [Close] [Deploy Now]                ║
╚══════════════════════════════════════════════════╝
```

---

### 11.5 Deploying Products to Workspaces

**From Product Store**:
1. Click **"Deploy"** on a product
2. Select target workspace(s)
3. Configure base URL (optional override)
4. Click **"Deploy"**

```
╔══════════════════════════════════════════════════╗
║ Deploy Product                      [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Product: User Profile Management                 ║
║ Version: 6.2.0                                   ║
║                                                  ║
║ Select Target Workspaces:                        ║
║ ┌────────────────────────────────────────────┐  ║
║ │ ☑ Sales Workspace                          │  ║
║ │ ☑ Support Workspace                        │  ║
║ │ ☐ Admin Workspace (already deployed)       │  ║
║ │ ☑ Development Workspace                    │  ║
║ └────────────────────────────────────────────┘  ║
║                                                  ║
║ Base URL Override (optional):                    ║
║   Workspace: Sales                               ║
║   Default: /user-profile                         ║
║   Override: [/users_______________]              ║
║                                                  ║
║ ☑ Add to workspace menu automatically            ║
║ ☑ Grant default permissions                     ║
║ ☐ Enable for all users                          ║
║                                                  ║
║            [Cancel] [Deploy]                     ║
╚══════════════════════════════════════════════════╝
```

---

### 11.6 Product Updates

**Viewing Available Updates**:
```
╔════════════════════════════════════════════════════════╗
║ Product Updates Available                              ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 🔄 User Profile Management                            ║
║    Current: 6.1.0 → Available: 6.2.0                  ║
║    Changes: Bug fixes, new avatar editor               ║
║    [View Changelog] [Update Now]                      ║
║                                                        ║
║ 🔄 Workspace Management                               ║
║    Current: 6.0.5 → Available: 6.1.5                  ║
║    Changes: Menu drag-drop, theme improvements         ║
║    [View Changelog] [Update Now]                      ║
╚════════════════════════════════════════════════════════╝
```

**Updating a Product**:
1. Click **"Update Now"**
2. Review changelog
3. Select workspaces to update
4. Choose update strategy:
   - **Immediate**: Update all workspaces now
   - **Staged**: Update one workspace at a time
   - **Scheduled**: Schedule update for off-hours
5. Click **"Update"**

---

## 12. Parameter Configuration

### 12.1 Understanding Parameters

**What are Parameters?**

Parameters are **configuration values** that control application behavior:
- **Application-Specific**: Each app has its own parameters
- **Environment-Agnostic**: Same code, different configs per environment
- **Runtime Changeable**: No redeployment needed to change values
- **Hierarchical**: Global → Application → User overrides

**Use Cases**:
- **Feature Flags**: Enable/disable features without code changes
- **API Endpoints**: Configure backend URLs per environment
- **Business Rules**: Max upload size, session timeout, retry attempts
- **UI Customization**: Default language, page size, date format

**Problem It Solves**:
- **Hardcoded Values**: No more recompiling to change settings
- **Environment Management**: Different settings for DEV/QA/PROD
- **A/B Testing**: Enable features for specific users
- **Emergency Switches**: Quickly disable problematic features

---

### 12.2 Viewing Parameters

**Access**: Navigate to **Administration → Parameters**

**Required Permission**: `PARAMETER#VIEW`

**Parameter List**:
```
╔════════════════════════════════════════════════════════╗
║ Parameters                              [+ Create]     ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search: [___________]  Application: [All ▼]       ║
║ Type: [All ▼]  Scope: [All ▼]                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 📋 User Profile Application                           ║
║                                                        ║
║ 🔧 MAX_AVATAR_SIZE                                    ║
║    Value: 5242880 (5 MB)                              ║
║    Type: Number                                        ║
║    Scope: Global                                       ║
║    Description: Maximum avatar file size in bytes     ║
║    [Edit] [Delete]                                    ║
║                                                        ║
║ 🔧 ALLOWED_AVATAR_FORMATS                             ║
║    Value: jpg,png,gif                                 ║
║    Type: String (comma-separated)                     ║
║    Scope: Global                                       ║
║    Description: Allowed file formats for avatars      ║
║    [Edit] [Delete]                                    ║
║                                                        ║
║ 🔧 ENABLE_2FA                                         ║
║    Value: true                                         ║
║    Type: Boolean                                       ║
║    Scope: Global                                       ║
║    Description: Enable two-factor authentication      ║
║    [Edit] [Delete]                                    ║
║                                                        ║
║ 📋 Workspace Application                              ║
║                                                        ║
║ 🔧 MAX_WORKSPACES_PER_USER                            ║
║    Value: 10                                           ║
║    Type: Number                                        ║
║    Scope: Global                                       ║
║    Description: Max workspaces a user can access      ║
║    [Edit] [Delete]                                    ║
║                                                        ║
║ 🔧 WORKSPACE_CREATION_ENABLED                         ║
║    Value: true                                         ║
║    Type: Boolean                                       ║
║    Scope: Global                                       ║
║    Description: Allow users to create workspaces      ║
║    [Edit] [Delete]                                    ║
╚════════════════════════════════════════════════════════╝
```

---

### 12.3 Creating Parameters

**Step 1: Click "+ Create"**

```
╔══════════════════════════════════════════════════╗
║ Create Parameter                    [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Application: * [User Profile ▼]                  ║
║                                                  ║
║ Key: * [MAX_AVATAR_SIZE_____________]            ║
║   ℹ️  Uppercase, underscores (e.g., MAX_SIZE)    ║
║                                                  ║
║ Display Name: [Maximum Avatar Size____]          ║
║                                                  ║
║ Description:                                     ║
║   [Maximum file size in bytes for_____]         ║
║   [avatar uploads______________________]         ║
║                                                  ║
║ Type:                                            ║
║   ● String                                       ║
║   ○ Number                                       ║
║   ○ Boolean                                      ║
║   ○ JSON                                         ║
║                                                  ║
║ Value: * [5242880___________________]            ║
║   ℹ️  5 MB = 5,242,880 bytes                     ║
║                                                  ║
║ Scope:                                           ║
║   ● Global (all users)                           ║
║   ○ Application (per app instance)               ║
║   ○ User (per user override)                     ║
║                                                  ║
║ ☐ Encrypted                                      ║
║   ℹ️  Check for sensitive values (API keys)      ║
║                                                  ║
║ ☐ Read-Only                                      ║
║   ℹ️  Prevent changes via UI                     ║
║                                                  ║
║            [Cancel] [Create]                     ║
╚══════════════════════════════════════════════════╝
```

**Parameter Types**:

**String**: Text values
```
Key: API_BASE_URL
Value: https://api.company.com/v1
```

**Number**: Numeric values
```
Key: SESSION_TIMEOUT_MINUTES
Value: 30
```

**Boolean**: True/False flags
```
Key: ENABLE_DEBUG_MODE
Value: false
```

**JSON**: Complex objects
```
Key: EMAIL_CONFIG
Value: {
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "from_address": "noreply@company.com"
}
```

---

### 12.4 Parameter Scopes

**Global Scope**:
- Applies to all users and all instances
- Example: `MAX_FILE_SIZE = 10485760`
- All users see the same value

**Application Scope**:
- Different value per application instance
- Example: `DEV: DEBUG_MODE = true`, `PROD: DEBUG_MODE = false`
- Configured per environment

**User Scope**:
- User-specific overrides
- Example: User A prefers `PAGE_SIZE = 25`, User B prefers `PAGE_SIZE = 50`
- Personal preferences

**Scope Priority**:
```
User Scope (highest priority)
      ↓
Application Scope
      ↓
Global Scope (lowest priority)
```

**Example**:
```
Global: PAGE_SIZE = 10
Application (Sales Workspace): PAGE_SIZE = 20
User (John Doe): PAGE_SIZE = 50

→ John sees PAGE_SIZE = 50 (user override)
→ Other users in Sales Workspace see PAGE_SIZE = 20
→ Users in other workspaces see PAGE_SIZE = 10
```

---

### 12.5 Parameter Import/Export

**Export Parameters**:
```
1. Click "Export" button
2. Select format: JSON or CSV
3. Choose scope: Global / Application / All
4. Download file
```

**Example Export (JSON)**:
```json
{
  "parameters": [
    {
      "application": "onecx-user-profile",
      "key": "MAX_AVATAR_SIZE",
      "value": "5242880",
      "type": "NUMBER",
      "scope": "GLOBAL",
      "description": "Maximum avatar file size in bytes"
    },
    {
      "application": "onecx-workspace",
      "key": "WORKSPACE_CREATION_ENABLED",
      "value": "true",
      "type": "BOOLEAN",
      "scope": "GLOBAL"
    }
  ]
}
```

**Import Parameters**:
```
1. Click "Import" button
2. Select JSON or CSV file
3. Preview changes
4. Choose merge strategy:
   • Replace All: Overwrite existing parameters
   • Update Only: Update existing, skip new
   • Add New: Only add missing parameters
5. Click "Import"
```

---

### 12.6 Common Parameters

**User Profile Application**:
```
MAX_AVATAR_SIZE: 5242880
ALLOWED_AVATAR_FORMATS: jpg,png,gif
ENABLE_2FA: true
PASSWORD_MIN_LENGTH: 8
PASSWORD_EXPIRY_DAYS: 90
SESSION_TIMEOUT_MINUTES: 30
```

**Workspace Application**:
```
MAX_WORKSPACES_PER_USER: 10
WORKSPACE_CREATION_ENABLED: true
DEFAULT_THEME: corporate-blue
MAX_MENU_DEPTH: 3
ENABLE_WORKSPACE_ANALYTICS: true
```

**Announcement Application**:
```
MAX_ANNOUNCEMENT_LENGTH: 1000
DEFAULT_ANNOUNCEMENT_PRIORITY: NORMAL
ANNOUNCEMENT_AUTO_DISMISS_SECONDS: 10
ENABLE_EMAIL_NOTIFICATIONS: true
```

---

## 13. Search Configuration

### 13.1 Understanding Search Configuration

**What is Search Configuration?**

Search Configuration manages **how users search and filter data**:
- **Search Fields**: Which fields are searchable
- **Filters**: Available filter options (dropdowns, date ranges)
- **Sort Options**: Default and available sort fields
- **Result Display**: How results are formatted
- **Saved Searches**: User-saved search criteria

**Use Cases**:
- **Power Users**: Need advanced search with many filters
- **Reports**: Saved searches for recurring reports
- **Performance**: Control which fields are indexed for search
- **UX**: Customize search UI per application

**Problem It Solves**:
- **Overwhelming Options**: Too many filter fields confuse users
- **Slow Searches**: Unindexed fields cause performance issues
- **Inconsistent UX**: Each app has different search experience
- **Lost Queries**: Users have to re-enter search criteria repeatedly

---

### 13.2 Viewing Search Configurations

**Access**: Navigate to **Administration → Search Configuration**

**Required Permission**: `SEARCH_CONFIG#VIEW`

**Search Config List**:
```
╔════════════════════════════════════════════════════════╗
║ Search Configurations                   [+ Create]     ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search: [___________]  Application: [All ▼]       ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 📋 User Search (User Profile App)                     ║
║    Fields: 8 searchable, 5 filterable                 ║
║    Default Sort: lastName (ascending)                  ║
║    Saved Searches: 12 users                           ║
║    [Edit] [Duplicate] [Delete]                        ║
║                                                        ║
║ 📋 Workspace Search (Workspace App)                   ║
║    Fields: 5 searchable, 3 filterable                 ║
║    Default Sort: displayName (ascending)               ║
║    Saved Searches: 8 users                            ║
║    [Edit] [Duplicate] [Delete]                        ║
║                                                        ║
║ 📋 Announcement Search (Announcement App)              ║
║    Fields: 6 searchable, 4 filterable                 ║
║    Default Sort: startDate (descending)                ║
║    Saved Searches: 5 users                            ║
║    [Edit] [Duplicate] [Delete]                        ║
╚════════════════════════════════════════════════════════╝
```

---

### 13.3 Creating Search Configuration

**Step 1: Click "+ Create"**

```
╔══════════════════════════════════════════════════╗
║ Create Search Configuration         [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 1 of 3: Basic Information                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Application: * [User Profile ▼]                  ║
║                                                  ║
║ Configuration Name: * [User Search_____]         ║
║                                                  ║
║ Description:                                     ║
║   [Search configuration for user______]         ║
║   [management with advanced filters___]          ║
║                                                  ║
║ Page Name: * [user-search______________]         ║
║   ℹ️  Page URL where this config applies         ║
║                                                  ║
║ Results Per Page:                                ║
║   Options: [ ] 10  [✓] 25  [ ] 50  [ ] 100      ║
║   Default: [25 ▼]                                ║
║                                                  ║
║            [Cancel] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Step 2: Searchable Fields**
```
╔══════════════════════════════════════════════════╗
║ Create Search Configuration         [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 2 of 3: Searchable Fields                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Quick Search (single text box):                  ║
║ ☑ Enabled                                        ║
║ Fields to search:                                ║
║   ☑ firstName                                    ║
║   ☑ lastName                                     ║
║   ☑ email                                        ║
║   ☐ phone                                        ║
║                                                  ║
║ Advanced Filters:                                ║
║ [+ Add Filter]                                   ║
║                                                  ║
║ ┌────────────────────────────────────────────┐  ║
║ │ Filter: First Name                         │  ║
║ │ Field: firstName                           │  ║
║ │ Type: Text Input                           │  ║
║ │ Label: First Name                          │  ║
║ │ Placeholder: Enter first name              │  ║
║ │ [Remove]                                   │  ║
║ ├────────────────────────────────────────────┤  ║
║ │ Filter: Last Name                          │  ║
║ │ Field: lastName                            │  ║
║ │ Type: Text Input                           │  ║
║ │ [Remove]                                   │  ║
║ ├────────────────────────────────────────────┤  ║
║ │ Filter: Role                               │  ║
║ │ Field: role                                │  ║
║ │ Type: Dropdown                             │  ║
║ │ Options: Admin, Manager, User, Viewer      │  ║
║ │ [Remove]                                   │  ║
║ ├────────────────────────────────────────────┤  ║
║ │ Filter: Status                             │  ║
║ │ Field: status                              │  ║
║ │ Type: Multi-Select                         │  ║
║ │ Options: Active, Inactive, Pending         │  ║
║ │ [Remove]                                   │  ║
║ ├────────────────────────────────────────────┤  ║
║ │ Filter: Created Date                       │  ║
║ │ Field: createdAt                           │  ║
║ │ Type: Date Range                           │  ║
║ │ [Remove]                                   │  ║
║ └────────────────────────────────────────────┘  ║
║                                                  ║
║            [← Back] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Filter Types**:
- **Text Input**: Free-text search
- **Dropdown**: Single selection
- **Multi-Select**: Multiple selections
- **Date Range**: Start and end dates
- **Number Range**: Min and max values
- **Boolean**: Checkbox (yes/no)

**Step 3: Sort Options**
```
╔══════════════════════════════════════════════════╗
║ Create Search Configuration         [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 3 of 3: Sort Options                       ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Default Sort:                                    ║
║   Field: [lastName ▼]                            ║
║   Order: ● Ascending  ○ Descending               ║
║                                                  ║
║ Available Sort Fields:                           ║
║ [+ Add Sort Field]                               ║
║                                                  ║
║ ┌────────────────────────────────────────────┐  ║
║ │ ☑ firstName - First Name                   │  ║
║ │ ☑ lastName - Last Name                     │  ║
║ │ ☑ email - Email Address                    │  ║
║ │ ☑ role - Role                              │  ║
║ │ ☑ createdAt - Created Date                 │  ║
║ │ ☐ lastLogin - Last Login                   │  ║
║ └────────────────────────────────────────────┘  ║
║                                                  ║
║ Result Display Options:                          ║
║ ☑ Show result count                             ║
║ ☑ Enable export (CSV, Excel)                    ║
║ ☑ Allow saving searches                         ║
║ ☐ Enable bulk actions                           ║
║                                                  ║
║            [← Back] [Create]                     ║
╚══════════════════════════════════════════════════╝
```

---

### 13.4 Using Search Configuration (User Perspective)

**User Search Page**:
```
╔════════════════════════════════════════════════════════╗
║ User Search                                            ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Quick Search: [_john doe______________] [🔍 Search]   ║
║                                                        ║
║ Advanced Filters  [▼ Show]                            ║
║ ┌──────────────────────────────────────────────────┐  ║
║ │ First Name: [John_____________]                  │  ║
║ │ Last Name:  [Doe______________]                  │  ║
║ │ Role:       [All ▼]                              │  ║
║ │ Status:     [✓] Active  [ ] Inactive [ ] Pending│  ║
║ │ Created:    [01/01/2025] - [12/31/2025]         │  ║
║ │                                                  │  ║
║ │ [Reset] [Search] [Save This Search]              │  ║
║ └──────────────────────────────────────────────────┘  ║
║                                                        ║
║ Saved Searches: [My Active Users ▼] [Load]           ║
║                                                        ║
║ Results (12 users)    Sort by: [Last Name ▼] [Export]║
║ ┌──────────────────────────────────────────────────┐  ║
║ │ Name              │ Email           │ Role       │  ║
║ ├──────────────────────────────────────────────────┤  ║
║ │ John Doe          │ john@acme.com   │ Admin      │  ║
║ │ Jane Smith        │ jane@acme.com   │ Manager    │  ║
║ │ Bob Johnson       │ bob@acme.com    │ User       │  ║
║ └──────────────────────────────────────────────────┘  ║
║                                                        ║
║ Page: [1] 2 3 ... 5   Showing 1-10 of 50             ║
╚════════════════════════════════════════════════════════╝
```

---

### 13.5 Saved Searches

**Saving a Search**:
```
1. Enter search criteria
2. Click "Save This Search"
3. Dialog appears:

╔══════════════════════════════════════════════════╗
║ Save Search                         [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Search Name: * [My Active Users_______]          ║
║                                                  ║
║ Description (optional):                          ║
║   [All active users in Sales dept_____]         ║
║                                                  ║
║ ☑ Set as default search                         ║
║   (Auto-loads when I open this page)             ║
║                                                  ║
║ ☐ Share with team                               ║
║   Roles: [Manager ▼] [+ Add]                     ║
║                                                  ║
║            [Cancel] [Save]                       ║
╚══════════════════════════════════════════════════╝
```

**Loading a Saved Search**:
```
1. Click "Saved Searches" dropdown
2. Select saved search
3. Click "Load"
4. Criteria auto-fills
5. Click "Search"
```

**Managing Saved Searches**:
```
╔══════════════════════════════════════════════════╗
║ My Saved Searches                   [✕ Close]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ My Active Users (default)                        ║
║   Created: Jan 15, 2026                          ║
║   Criteria: status=Active, role=User             ║
║   [Load] [Edit] [Delete]                        ║
║                                                  ║
║ Managers Only                                    ║
║   Created: Feb 1, 2026                           ║
║   Criteria: role=Manager                         ║
║   [Load] [Edit] [Delete]                        ║
║                                                  ║
║ Recent Hires                                     ║
║   Created: Feb 10, 2026                          ║
║   Criteria: createdAt > 2026-01-01               ║
║   [Load] [Edit] [Delete]                        ║
╚══════════════════════════════════════════════════╝
```

---

## 14. Data Orchestrator

### 14.1 Understanding Data Orchestrator

**What is Data Orchestrator?**

Data Orchestrator is a **data pipeline and ETL (Extract, Transform, Load) tool**:
- **Data Integration**: Connect to multiple data sources
- **Transformations**: Clean, merge, aggregate data
- **Scheduling**: Auto-run pipelines on schedule
- **Monitoring**: Track pipeline execution and errors
- **Data Quality**: Validate data before loading

**Use Cases**:
- **Data Migration**: Move data from legacy systems to OneCX
- **Reporting**: Extract data for analytics/BI tools
- **Integration**: Sync data between OneCX and external systems
- **Batch Processing**: Nightly data imports/exports

**Problem It Solves**:
- **Manual Data Entry**: Automate repetitive data imports
- **Data Inconsistency**: Standardize data from multiple sources
- **Integration Complexity**: Simplify connecting to APIs/databases
- **Error Handling**: Retry failed operations, log errors

---

### 14.2 Viewing Pipelines

**Access**: Navigate to **Administration → Data Orchestrator**

**Required Permission**: `DATA_ORCHESTRATOR#VIEW`

**Pipeline List**:
```
╔════════════════════════════════════════════════════════╗
║ Data Pipelines                          [+ Create]     ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search: [___________]  Status: [All ▼]            ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 🔄 Nightly User Sync                                  ║
║    Status: ✓ Active (last run: 2 hours ago)          ║
║    Schedule: Daily at 2:00 AM                          ║
║    Source: LDAP Server                                 ║
║    Destination: OneCX User Database                    ║
║    Records: 1,250 processed, 0 errors                 ║
║    [View] [Edit] [Run Now] [Disable]                  ║
║                                                        ║
║ 🔄 Weekly Report Export                               ║
║    Status: ✓ Active (last run: yesterday)             ║
║    Schedule: Sundays at 11:00 PM                       ║
║    Source: OneCX Workspace Data                        ║
║    Destination: S3 Bucket (reports/)                   ║
║    Records: 5,000 processed, 0 errors                 ║
║    [View] [Edit] [Run Now] [Disable]                  ║
║                                                        ║
║ 🔄 Customer Data Import                               ║
║    Status: ⚠️  Warning (last run: 30 minutes ago)      ║
║    Schedule: Hourly                                    ║
║    Source: REST API (CRM system)                       ║
║    Destination: OneCX Custom App                       ║
║    Records: 150 processed, 5 errors                   ║
║    [View] [Edit] [Run Now] [Disable]                  ║
║                                                        ║
║ 🔄 Workspace Backup                                   ║
║    Status: ❌ Failed (last run: 1 hour ago)            ║
║    Schedule: Every 6 hours                             ║
║    Source: OneCX Workspace Database                    ║
║    Destination: Backup Server                          ║
║    Error: Connection timeout                           ║
║    [View Details] [Edit] [Retry] [Disable]            ║
╚════════════════════════════════════════════════════════╝
```

---

### 14.3 Creating a Data Pipeline

**Step 1: Click "+ Create"**

```
╔══════════════════════════════════════════════════╗
║ Create Data Pipeline                [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 1 of 4: Basic Information                  ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Pipeline Name: * [User Sync Pipeline___]         ║
║                                                  ║
║ Description:                                     ║
║   [Syncs user data from LDAP to OneCX__]        ║
║   [Runs nightly at 2:00 AM_____________]         ║
║                                                  ║
║ Pipeline Type:                                   ║
║   ● Import (external → OneCX)                    ║
║   ○ Export (OneCX → external)                    ║
║   ○ Transform (OneCX → OneCX)                    ║
║                                                  ║
║ Category:                                        ║
║   [User Management ▼]                            ║
║                                                  ║
║            [Cancel] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Step 2: Source Configuration**
```
╔══════════════════════════════════════════════════╗
║ Create Data Pipeline                [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 2 of 4: Source Configuration                ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Source Type: [LDAP Server ▼]                     ║
║   Options: Database, REST API, File (CSV/JSON),  ║
║            LDAP, OneCX Data, Custom              ║
║                                                  ║
║ Connection Details:                              ║
║   Host: [ldap.company.com__________]             ║
║   Port: [389_______]                             ║
║   Base DN: [dc=company,dc=com______]             ║
║   Username: [cn=admin,dc=company,dc=com]         ║
║   Password: [●●●●●●●●] [Show]                    ║
║   [Test Connection] ✓ Connection successful      ║
║                                                  ║
║ Query/Filter:                                    ║
║   [(&(objectClass=person)(!(disabled=true))]    ║
║   ℹ️  LDAP filter to select records              ║
║                                                  ║
║ Field Mapping:                                   ║
║ ┌────────────────────────────────────────────┐  ║
║ │ LDAP Field      → OneCX Field              │  ║
║ ├────────────────────────────────────────────┤  ║
║ │ cn              → firstName                 │  ║
║ │ sn              → lastName                  │  ║
║ │ mail            → email                     │  ║
║ │ telephoneNumber → phone                     │  ║
║ │ department      → department                │  ║
║ └────────────────────────────────────────────┘  ║
║   [+ Add Mapping]                                ║
║                                                  ║
║            [← Back] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Step 3: Transformation Rules**
```
╔══════════════════════════════════════════════════╗
║ Create Data Pipeline                [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 3 of 4: Transformation Rules               ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Data Transformations:                            ║
║ [+ Add Transformation]                           ║
║                                                  ║
║ ┌────────────────────────────────────────────┐  ║
║ │ Rule 1: Format Phone Number                │  ║
║ │ Field: phone                               │  ║
║ │ Type: Regular Expression                   │  ║
║ │ Pattern: ^(\d{3})(\d{3})(\d{4})$          │  ║
║ │ Replace: +1-$1-$2-$3                       │  ║
║ │ [Edit] [Remove]                            │  ║
║ ├────────────────────────────────────────────┤  ║
║ │ Rule 2: Normalize Email                    │  ║
║ │ Field: email                               │  ║
║ │ Type: Lowercase                            │  ║
║ │ [Edit] [Remove]                            │  ║
║ ├────────────────────────────────────────────┤  ║
║ │ Rule 3: Set Default Role                   │  ║
║ │ Field: role                                │  ║
║ │ Type: Default Value                        │  ║
║ │ Value: USER (if empty)                     │  ║
║ │ [Edit] [Remove]                            │  ║
║ └────────────────────────────────────────────┘  ║
║                                                  ║
║ Data Validation:                                 ║
║ ☑ Skip records with missing required fields     ║
║ ☑ Log validation errors                         ║
║ ☐ Stop pipeline on validation error             ║
║                                                  ║
║ Duplicate Handling:                              ║
║   ● Update existing (by email)                   ║
║   ○ Skip duplicates                              ║
║   ○ Create new with suffix                       ║
║                                                  ║
║            [← Back] [Next →]                     ║
╚══════════════════════════════════════════════════╝
```

**Step 4: Schedule & Notifications**
```
╔══════════════════════════════════════════════════╗
║ Create Data Pipeline                [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║ Step 4 of 4: Schedule & Notifications           ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Execution Schedule:                              ║
║   ● Scheduled                                    ║
║   ○ Manual (run on-demand only)                  ║
║   ○ Triggered (by event)                         ║
║                                                  ║
║ Schedule Type:                                   ║
║   ● Cron Expression                              ║
║   ○ Simple Schedule                              ║
║                                                  ║
║ Cron Expression: [0 2 * * *_________]            ║
║   ℹ️  0 2 * * * = Daily at 2:00 AM                ║
║   [Cron Builder]                                 ║
║                                                  ║
║ Timezone: [America/New_York ▼]                   ║
║                                                  ║
║ Next Run: Feb 20, 2026 02:00 AM EST              ║
║                                                  ║
║ Notifications:                                   ║
║ ☑ Email on success                               ║
║   Recipients: [admin@company.com_______]         ║
║                                                  ║
║ ☑ Email on failure                               ║
║   Recipients: [admin@company.com_______]         ║
║                [support@company.com____]          ║
║                                                  ║
║ ☐ Slack notification                             ║
║   Webhook: [https://hooks.slack.com/...]         ║
║                                                  ║
║ Retry on Failure:                                ║
║   ☑ Enabled                                      ║
║   Max Retries: [3___]                            ║
║   Delay: [5 minutes ▼]                           ║
║                                                  ║
║            [← Back] [Create Pipeline]            ║
╚══════════════════════════════════════════════════╝
```

---

### 14.4 Pipeline Execution

**Running Manually**:
```
1. Click "Run Now" on pipeline
2. Confirm execution
3. Monitor progress

╔══════════════════════════════════════════════════╗
║ Pipeline Execution: User Sync           [✕ Close]║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Status: ⏳ Running...                             ║
║ Started: Feb 19, 2026 10:30:15 AM                ║
║ Elapsed: 00:02:45                                ║
║                                                  ║
║ Progress:                                        ║
║ ████████████████░░░░░░░░  65% complete           ║
║                                                  ║
║ Records Processed: 812 / 1,250                   ║
║ Success: 810                                     ║
║ Errors: 2                                        ║
║                                                  ║
║ Current Step: Transforming data...               ║
║                                                  ║
║ [View Logs] [Cancel Execution]                   ║
╚══════════════════════════════════════════════════╝
```

**Execution Complete**:
```
╔══════════════════════════════════════════════════╗
║ ✓ Pipeline Execution Successful        [✕ Close]║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Completed: Feb 19, 2026 10:33:00 AM              ║
║ Duration: 00:02:45                               ║
║                                                  ║
║ Summary:                                         ║
║   Records Processed: 1,250                       ║
║   Created: 50 new users                          ║
║   Updated: 1,195 users                           ║
║   Skipped: 3 (validation errors)                 ║
║   Errors: 2 (connection timeout)                 ║
║                                                  ║
║ Next Scheduled Run: Feb 20, 2026 02:00 AM        ║
║                                                  ║
║ [View Full Report] [Download Logs] [Close]       ║
╚══════════════════════════════════════════════════╝
```

---

### 14.5 Monitoring & Troubleshooting

**Pipeline Dashboard**:
```
╔════════════════════════════════════════════════════════╗
║ Data Orchestrator Dashboard                           ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Active Pipelines: 8                                    ║
║ Running Now: 2                                         ║
║ Failed (last 24h): 1                                   ║
║                                                        ║
║ Execution History (Last 7 Days):                       ║
║ ┌──────────────────────────────────────────────────┐  ║
║ │ Date       │ Runs │ Success │ Failed │ Duration  │  ║
║ ├──────────────────────────────────────────────────┤  ║
║ │ Feb 19     │ 42   │ 40      │ 2      │ Avg 3m    │  ║
║ │ Feb 18     │ 45   │ 45      │ 0      │ Avg 3m    │  ║
║ │ Feb 17     │ 44   │ 43      │ 1      │ Avg 3m    │  ║
║ └──────────────────────────────────────────────────┘  ║
║                                                        ║
║ Error Summary:                                         ║
║   Connection timeouts: 2                               ║
║   Validation errors: 5                                 ║
║   Duplicate records: 3                                 ║
║                                                        ║
║ [View All Logs] [Export Report]                       ║
╚════════════════════════════════════════════════════════╝
```

**Viewing Logs**:
```
╔════════════════════════════════════════════════════════╗
║ Pipeline Logs: User Sync                              ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Filter: [All Levels ▼] Date: [Today ▼]            ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ [10:30:15] ℹ️  Pipeline started                       ║
║ [10:30:16] ℹ️  Connected to LDAP server               ║
║ [10:30:17] ℹ️  Query returned 1,250 records           ║
║ [10:31:05] ⚠️  Validation warning: Missing phone      ║
║            for user john.doe@company.com               ║
║ [10:32:23] ❌ Error: Duplicate email detected         ║
║            jane.smith@company.com                      ║
║ [10:32:24] ℹ️  Skipped duplicate record               ║
║ [10:33:00] ✓ Pipeline completed successfully          ║
║ [10:33:00] ℹ️  1,250 processed, 2 errors              ║
╚════════════════════════════════════════════════════════╝
```

---

## 15. IAM Integration

### 15.1 Understanding IAM

**What is IAM (Identity & Access Management)?**

IAM provides **centralized authentication and authorization**:
- **Single Sign-On (SSO)**: One login for all systems
- **Identity Provider**: Keycloak manages users/roles
- **Federation**: Connect to LDAP, Active Directory, SAML
- **Client Management**: Register applications for SSO
- **Token Management**: JWT tokens for API access

**Use Cases**:
- **Enterprise SSO**: Employees log in once, access all apps
- **External Identity**: Connect to Azure AD, Google Workspace
- **API Security**: Secure APIs with OAuth2/JWT
- **Compliance**: Centralized audit trail

**Problem It Solves**:
- **Password Fatigue**: No separate passwords per app
- **Security**: Strong auth policies (2FA, password complexity)
- **User Management**: One place to add/remove users
- **Integration**: Easy to add new applications

---

### 15.2 Viewing IAM Configuration

**Access**: Navigate to **Administration → IAM Integration**

**Required Permission**: `IAM#VIEW`

**IAM Overview**:
```
╔════════════════════════════════════════════════════════╗
║ IAM Integration (Keycloak)                            ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Status: ✓ Connected                                   ║
║ Keycloak URL: https://sso.company.com                  ║
║ Realm: onecx-platform                                  ║
║                                                        ║
║ Statistics:                                            ║
║   Total Clients: 15                                    ║
║   Active Users: 250                                    ║
║   Identity Providers: 3 (LDAP, Azure AD, Google)      ║
║   Realms: 2 (onecx-platform, onecx-dev)              ║
║                                                        ║
║ Tabs: [Clients] [Users] [Roles] [Identity Providers] ║
╚════════════════════════════════════════════════════════╝
```

---

### 15.3 Managing Clients (Applications)

**Clients** are applications that use Keycloak for authentication.

**Client List**:
```
╔════════════════════════════════════════════════════════╗
║ IAM Clients                            [+ Create]      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 🔐 onecx-workspace-ui                                 ║
║    Type: Frontend (Public)                             ║
║    Redirect URLs: https://portal.company.com/*         ║
║    Web Origins: https://portal.company.com             ║
║    Status: Active ✓                                   ║
║    [Edit] [Regenerate Secret] [Delete]                ║
║                                                        ║
║ 🔐 onecx-user-profile-bff                             ║
║    Type: Backend (Confidential)                        ║
║    Service Account: Enabled                            ║
║    Client Secret: ●●●●●●●● [Show]                     ║
║    Status: Active ✓                                   ║
║    [Edit] [Regenerate Secret] [Delete]                ║
║                                                        ║
║ 🔐 onecx-mobile-app                                   ║
║    Type: Mobile (Public)                               ║
║    PKCE: Enabled                                       ║
║    Status: Active ✓                                   ║
║    [Edit] [Delete]                                    ║
╚════════════════════════════════════════════════════════╝
```

**Creating a Client**:
```
╔══════════════════════════════════════════════════╗
║ Create IAM Client                   [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Client ID: * [onecx-custom-app_______]           ║
║                                                  ║
║ Name: [Custom Application_________]              ║
║                                                  ║
║ Client Type:                                     ║
║   ● Public (Frontend - no secret)                ║
║   ○ Confidential (Backend - has secret)          ║
║   ○ Bearer-only (accepts tokens only)            ║
║                                                  ║
║ Root URL: [https://app.company.com___]           ║
║                                                  ║
║ Valid Redirect URIs: *                           ║
║   [https://app.company.com/*________]            ║
║   [+ Add more]                                   ║
║                                                  ║
║ Web Origins: *                                   ║
║   [https://app.company.com__________]            ║
║   [+ Add more]                                   ║
║                                                  ║
║ Advanced Settings:                               ║
║ ☑ Enable Direct Access Grants                   ║
║ ☑ Enable Implicit Flow                          ║
║ ☐ Enable Service Accounts                       ║
║ ☐ Enable PKCE                                    ║
║                                                  ║
║            [Cancel] [Create]                     ║
╚══════════════════════════════════════════════════╝
```

---

### 15.4 Managing Users in Keycloak

**User List**:
```
╔════════════════════════════════════════════════════════╗
║ IAM Users                              [+ Create]      ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search: [___________]  Status: [All ▼]            ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 👤 john.doe@company.com                               ║
║    Name: John Doe                                      ║
║    Status: Active ✓                                   ║
║    Email Verified: Yes                                 ║
║    2FA: Enabled                                        ║
║    Roles: Admin, User                                  ║
║    [View] [Edit] [Reset Password] [Disable]           ║
║                                                        ║
║ 👤 jane.smith@company.com                             ║
║    Name: Jane Smith                                    ║
║    Status: Active ✓                                   ║
║    Email Verified: Yes                                 ║
║    2FA: Disabled                                       ║
║    Roles: Manager, User                                ║
║    [View] [Edit] [Reset Password] [Disable]           ║
╚════════════════════════════════════════════════════════╝
```

**Creating User**:
```
╔══════════════════════════════════════════════════╗
║ Create User                         [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Username: * [john.doe@company.com____]           ║
║   ℹ️  Will be used for login                     ║
║                                                  ║
║ Email: * [john.doe@company.com_______]           ║
║                                                  ║
║ First Name: [John_________________]              ║
║ Last Name: [Doe___________________]              ║
║                                                  ║
║ ☑ Email Verified                                 ║
║ ☑ Enabled                                        ║
║                                                  ║
║ Temporary Password: [Generate_____] [📋 Copy]   ║
║ ☑ User must change password on first login      ║
║                                                  ║
║ Assign Roles:                                    ║
║ ☑ User (default)                                 ║
║ ☐ Admin                                          ║
║ ☐ Manager                                        ║
║                                                  ║
║            [Cancel] [Create]                     ║
╚══════════════════════════════════════════════════╝
```

---

### 15.5 Configuring Identity Providers

**Identity Providers** allow users to log in with external accounts.

**Identity Provider List**:
```
╔════════════════════════════════════════════════════════╗
║ Identity Providers                     [+ Add]         ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 🔐 Company LDAP                                       ║
║    Type: LDAP                                          ║
║    Host: ldap.company.com:389                          ║
║    Users: 250 imported                                 ║
║    Status: Active ✓                                   ║
║    [Edit] [Sync Now] [Disable]                        ║
║                                                        ║
║ 🔐 Azure Active Directory                             ║
║    Type: SAML 2.0                                      ║
║    Entity ID: https://sts.windows.net/...             ║
║    Users: 120 federated                                ║
║    Status: Active ✓                                   ║
║    [Edit] [Test Connection] [Disable]                 ║
║                                                        ║
║ 🔐 Google Workspace                                   ║
║    Type: OpenID Connect                                ║
║    Client ID: 123456789-abc...                         ║
║    Users: 50 federated                                 ║
║    Status: Active ✓                                   ║
║    [Edit] [Test Connection] [Disable]                 ║
╚════════════════════════════════════════════════════════╝
```

**Adding LDAP**:
```
╔══════════════════════════════════════════════════╗
║ Add Identity Provider               [✕ Cancel]   ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Provider Type: [LDAP ▼]                          ║
║                                                  ║
║ Display Name: [Company LDAP__________]           ║
║                                                  ║
║ Connection URL: [ldap://ldap.company.com:389]    ║
║                                                  ║
║ Bind DN: [cn=admin,dc=company,dc=com]            ║
║ Bind Password: [●●●●●●●●] [Show]                 ║
║                                                  ║
║ Users DN: [ou=users,dc=company,dc=com]           ║
║                                                  ║
║ User Object Classes: [person,inetOrgPerson]      ║
║                                                  ║
║ Username LDAP Attribute: [uid_______]            ║
║ Email LDAP Attribute: [mail_________]            ║
║ First Name LDAP Attribute: [givenName]           ║
║ Last Name LDAP Attribute: [sn________]           ║
║                                                  ║
║ Sync Settings:                                   ║
║ ☑ Import Users                                   ║
║ Sync Period: [Daily at 2:00 AM ▼]               ║
║                                                  ║
║ [Test Connection] [Cancel] [Save]                ║
╚══════════════════════════════════════════════════╝
```

**Login Page with Identity Providers**:
```
╔══════════════════════════════════════════════════╗
║              Welcome to OneCX                    ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║ Sign in with:                                    ║
║                                                  ║
║ ┌──────────────────────────────────────────────┐ ║
║ │ 🔐 Company LDAP                              │ ║
║ └──────────────────────────────────────────────┘ ║
║                                                  ║
║ ┌──────────────────────────────────────────────┐ ║
║ │ 🔷 Azure Active Directory                    │ ║
║ └──────────────────────────────────────────────┘ ║
║                                                  ║
║ ┌──────────────────────────────────────────────┐ ║
║ │ 🔴 Google Workspace                          │ ║
║ └──────────────────────────────────────────────┘ ║
║                                                  ║
║ ────────── OR ──────────                         ║
║                                                  ║
║ Username: [_________________________]            ║
║ Password: [_________________________]            ║
║                                                  ║
║ [Sign In]                                        ║
║                                                  ║
║ [Forgot Password?]                               ║
╚══════════════════════════════════════════════════╝
```

---

## 16. Common Issues & Troubleshooting

### 16.1 Login Problems

**Issue: Cannot Log In**

**Symptoms**:
- "Invalid username or password" error
- Account appears locked
- Redirect loop

**Solutions**:

1. **Check Credentials**:
   - Verify username is correct (usually email)
   - Check Caps Lock is off
   - Try "Forgot Password" link

2. **Account Locked**:
   - Wait 30 minutes for auto-unlock
   - Contact administrator to unlock manually
   - Admin: Go to Users → Select User → Click "Unlock Account"

3. **Browser Issues**:
   - Clear browser cache and cookies
   - Try incognito/private mode
   - Try different browser

4. **SSO Issues**:
   - Check identity provider status
   - Verify you're logged into corporate account
   - Contact IT support for SSO issues

---

### 16.2 Permission Denied Errors

**Issue: "403 Forbidden" or "You don't have permission"**

**Symptoms**:
- Cannot access certain pages
- Buttons are hidden/disabled
- "Access Denied" message

**Solutions**:

1. **Check Your Roles**:
   - Click Profile Icon → "My Profile" → "Account" tab
   - View "Assigned Roles" section
   - Contact admin if you need different role

2. **Workspace-Specific**:
   - Some permissions are per-workspace
   - Switch to different workspace to check
   - Contact workspace admin

3. **Request Access**:
   - Document what you need access to
   - Contact admin with business justification
   - Include role name if known

---

### 16.3 Page Not Loading

**Issue: Blank page, infinite loading, or error message**

**Symptoms**:
- Page shows loading spinner forever
- "Failed to load remote module" error
- Blank white page

**Solutions**:

1. **Refresh Page**:
   - Press Ctrl+F5 (hard refresh)
   - Clear cache and reload

2. **Check Network**:
   - Verify internet connection
   - Check if other websites work
   - Check browser console for errors (F12)

3. **Microfrontend Issue**:
   - Backend service may be down
   - Contact admin to check service status
   - Admin: Check Data Orchestrator logs

4. **Browser Compatibility**:
   - Use latest Chrome, Firefox, Edge, or Safari
   - Disable browser extensions temporarily
   - Update browser to latest version

---

### 16.4 Data Not Saving

**Issue: Changes not persisting after clicking "Save"**

**Symptoms**:
- "Save" button does nothing
- Changes revert after reload
- Success message but data unchanged

**Solutions**:

1. **Check Validation**:
   - Look for red error messages
   - Required fields must be filled
   - Check field format (email, phone, etc.)

2. **Session Timeout**:
   - You may have been logged out
   - Save your changes elsewhere
   - Log in again and retry

3. **Permission Issue**:
   - You may have VIEW but not EDIT permission
   - Contact admin for edit access

4. **Browser Issue**:
   - Disable browser extensions
   - Try different browser
   - Check browser console for JavaScript errors

---

### 16.5 Workspace Not Appearing

**Issue: Missing workspace from selector**

**Symptoms**:
- Workspace exists but you can't see it
- Other users can access but you can't
- Used to have access, now missing

**Solutions**:

1. **Check Workspace Roles**:
   - Contact workspace admin
   - Verify you're assigned a workspace role
   - Admin: Workspace → Roles tab → Add user

2. **Workspace Disabled**:
   - Workspace may be temporarily disabled
   - Contact admin to check status
   - Admin: Workspaces → Check workspace status

3. **Permission Changed**:
   - Your role may have been removed
   - Check with team lead or admin
   - Request re-assignment if needed

---

### 16.6 Theme Not Applying

**Issue: Custom theme doesn't show**

**Symptoms**:
- Workspace shows default theme
- Logo not displaying
- Colors wrong

**Solutions**:

1. **Clear Cache**:
   - Hard refresh (Ctrl+F5)
   - Clear browser cache completely
   - Close and reopen browser

2. **Theme Configuration**:
   - Admin: Check theme is assigned to workspace
   - Workspace Settings → Appearance → Theme
   - Verify theme status is "Active"

3. **CSS Issues**:
   - Admin: Check theme CSS for syntax errors
   - Test theme in different browser
   - Duplicate working theme and modify

---

### 16.7 Search Not Finding Results

**Issue: Search returns no results when data exists**

**Symptoms**:
- Empty result list
- "No results found"
- Search worked before

**Solutions**:

1. **Check Search Criteria**:
   - Remove some filters
   - Try broader search terms
   - Check date ranges are not too narrow

2. **Search Configuration**:
   - Fields may not be searchable
   - Contact admin to enable search on fields
   - Admin: Search Configuration → Add fields

3. **Permission Filtering**:
   - Results filtered by your permissions
   - You may only see data you have access to
   - Contact admin if you need broader access

---

### 16.8 File Upload Failing

**Issue: Cannot upload avatar, logo, or documents**

**Symptoms**:
- "File too large" error
- "Invalid file type" error
- Upload progress bar stuck

**Solutions**:

1. **Check File Size**:
   - Max size usually 5-10 MB
   - Compress image before upload
   - Use online tools to reduce file size

2. **Check File Type**:
   - Only certain formats allowed (JPG, PNG for images)
   - Convert file to supported format
   - Check file extension is correct

3. **Network Issue**:
   - Large files need stable connection
   - Try on faster network
   - Retry upload

4. **Parameter Limits**:
   - Admin: Check MAX_FILE_SIZE parameter
   - Admin: Increase limit if business requires
   - Parameters → Application → Edit value

---

### 16.9 Email Notifications Not Received

**Issue: Not receiving expected emails**

**Symptoms**:
- Password reset email never arrives
- Announcement emails missing
- Notification emails not coming

**Solutions**:

1. **Check Spam Folder**:
   - OneCX emails may be marked as spam
   - Add noreply@onecx.com to contacts
   - Mark emails as "Not Spam"

2. **Email Preferences**:
   - Profile → Preferences → Notification Settings
   - Verify email notifications enabled
   - Check email address is correct

3. **Email Server Issue**:
   - Admin: Check email service status
   - Admin: Test email configuration
   - Admin: Check email service logs

---

### 16.10 Getting Additional Help

**Documentation**:
- Click "?" icon → "Documentation"
- Search help articles
- Watch video tutorials

**Support Channels**:
- **IT Helpdesk**: For technical issues
- **Workspace Admin**: For workspace-specific issues
- **System Admin**: For permissions, users, tenants
- **Developer Support**: For custom applications

**When Reporting Issues**:
Include:
1. What you were trying to do
2. What happened instead
3. Error messages (screenshot)
4. Your username
5. Browser and OS version
6. Steps to reproduce

**Browser Console Logs**:
```
1. Press F12 to open Developer Tools
2. Click "Console" tab
3. Take screenshot of errors (red text)
4. Include in support ticket
```

---

## Summary

This comprehensive user guide covers the complete OneCX platform from an end-user perspective, including all major features and administration tools.

✅ **Core User Features**:
- Workspace navigation and management
- User profile and preferences
- Theme customization
- Announcements and notifications
- Bookmarks
- Help system

✅ **Administration Features**:
- Tenant administration (multi-tenancy)
- Permission management (RBAC)
- Product Store (application deployment)
- Parameter configuration (runtime settings)
- Search configuration (customizable search)
- Data Orchestrator (ETL pipelines)
- IAM integration (SSO, identity providers)

✅ **Troubleshooting**:
- Common issues and solutions
- Error messages explained
- Contact information for support

**Key Takeaways**:

**For End Users**:
- OneCX provides customizable workspaces for different roles and teams
- Self-service profile management and personal preferences
- Save bookmarks and searches for quick access to frequently-used features
- Comprehensive help system with searchable articles and video tutorials

**For Administrators**:
- Centralized management of tenants, users, and permissions
- Product Store for deploying microfrontend applications to workspaces
- Data Orchestrator for automating data integration workflows
- IAM integration for enterprise SSO and identity federation
- Parameter configuration for runtime settings without code changes
- Fine-grained permission system based on roles

**For Power Users**:
- Advanced search with filters and saved searches
- Customizable themes and branding per workspace
- Flexible parameter configuration for application behavior
- Rich permission system for controlling access at granular levels

**Next Steps**:
1. Log in and explore your assigned workspace
2. Complete your user profile with avatar and preferences
3. Create bookmarks for frequently-used pages
4. Save commonly-used searches for quick access
5. Contact your admin for access to additional features

**Support**: For help, click the "?" icon in the top-right corner or contact your IT helpdesk.

---

**Document Version**: 2.0  
**Last Updated**: February 19, 2026  
**Feedback**: Send suggestions to documentation@onecx.com

