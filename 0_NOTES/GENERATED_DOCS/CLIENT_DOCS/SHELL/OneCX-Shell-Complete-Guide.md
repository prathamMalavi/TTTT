# OneCX Shell - Complete User & Product Guide

> Audience: Product owners, business users, and power users who want to understand what the "Shell" is, how it behaves in day-to-day work, and how different OneCX apps appear as one coherent portal.

> Status: Initial version created on February 19, 2026. Will be expanded with more screenshots and user journeys.

## 1. What is OneCX and the Shell?

### 1.1 OneCX in Simple Words

OneCX is a platform that lets your organization run many business applications inside one common portal. Instead of having separate URLs and logins for every tool, your users:
- Go to a single URL (the OneCX portal).
- Sign in once.
- Access different business functions (bookmarks, help center, search, user profile, etc.) as if they were one big application.

Each of those functions is actually delivered by a separate product, but the platform hides that complexity.

### 1.2 The Role of the Shell

The "Shell" is the main web application that users see when they open the OneCX portal. You can think of it as:
- The frame or "portal" that holds all your business applications.
- The place where the header (logo, search, user menu), side menus, and footer are defined.
- The component that decides which app to show when you click in the menu.

In practice, the Shell:
- Shows the global layout (header, body, footer).
- Loads the correct applications based on your role and workspace.
- Applies your company branding (logo, colors, fonts).
- Applies your personal preferences (language, theme, menu layout).

## 2. How the Shell Looks and Feels

### 2.1 Typical Layout

When you log into OneCX, the Shell usually shows:
- **Top Header**
  - Company logo (top-left).
  - Global search or workspace switcher (center or near center).
  - User menu (top-right) with options like profile, language, logout.
- **Main Body Area**
  - Navigation menu (top or side depending on configuration).
  - The current application content (e.g., a list of bookmarks, help articles, parameter configuration, etc.).
- **Footer**
  - Links like "About", "Imprint", "Privacy".
  - Version information or environment hint (e.g., "Test" vs "Production").

All of this is delivered by the Shell, but many parts (logo, search bar, help menu, etc.) can actually come from individual products plugged into predefined places.

### 2.2 Workspaces

A "workspace" in OneCX is like a dedicated portal area for a particular group or purpose.

Examples:
- "Employee Workspace" – employees see HR apps, self-service, help center.
- "Admin Workspace" – admins see configuration tools, product management, permission management.

The Shell:
- Knows which workspace you are in based on the URL.
- Loads the correct menu and apps for that workspace.
- Applies the workspace name and theme (colors, logo, home page).

From a user perspective:
- Switching workspace can change the set of apps in the menu.
- The URL path (like /employee or /admin) often indicates the active workspace.

## 3. Logging In and Security

### 3.1 Single Sign-On (SSO) with Keycloak

When you open the OneCX portal:
- You are redirected to a login page (usually Keycloak, the identity provider).
- After you log in, you are sent back to the Shell.
- The Shell uses this login to call all backend services.

Benefits for users:
- One username and password for all apps.
- If your company uses SSO (e.g., corporate login), you may not even see the login form once you’re logged into your workstation.

### 3.2 Permissions and What You Can See

Behind the scenes, there is a permission system. The Shell cooperates with backend services to decide:
- Which menu entries to show you.
- Which pages or functions inside an app you can access.

Real-world examples:
- A regular employee might see "My Profile" and "My Bookmarks" but not "User Management".
- A system administrator sees additional menu points like "Permission Management" or "Tenant Administration".

If you don’t see an app you expect, it may be because:
- You don’t have permissions.
- The product is not assigned to your workspace.

## 4. How Applications Appear Inside the Shell

### 4.1 Apps as "Tiles" Inside the Portal

Every visible feature (Bookmarks, Search, Help, User Profile, etc.) is provided by a product. Each product has its own dedicated UI application, but:
- The Shell loads these applications inside its own layout.
- Navigating the menu simply tells the Shell which app to show.

For example:
- Clicking "Bookmarks" loads the bookmark application in the center content area.
- Clicking "Help" replaces that with the help center application.
- The header and footer usually remain the same.

### 4.2 Slots – Where Apps Can Plug In

The Shell layout defines special "slots", which are named areas in the screen:
- Header slots (start/center/end).
- Body slots (start/body-header/body-footer/end).
- Footer slots (start/center/end).
- Extension slots (used for overlays or notifications).

Product teams can register their components into these slots. For example:
- A "Help" product can put a small help icon into the right side of the header.
- A "Notification" product can show popup messages via an invisible extensions slot.

Benefits for users:
- Features added over time can appear at consistent locations without redesigning the Shell.
- Your admin/product owner can decide which features appear in each workspace’s header/body/footer.

### 4.3 Real-World Example – New Feature Rollout

Imagine your company introduces a new "Employee Feedback" app.
- The app team delivers a feedback UI and plugs a "Give Feedback" button into the header’s center slot.
- Once the workspace config is updated, the Shell shows this button for all or specific users/workspaces.
- No need to redeploy the Shell – it automatically picks up the new app based on configuration.

## 5. Personalization: Profile, Theme, Layout

### 5.1 User Profile

Each user has a profile in the platform that includes:
- Name, email, organization.
- Notification and privacy settings (implementation may vary over time).
- Display preferences (language, time zone, theme, menu mode).

When you log in:
- The Shell asks the backend for your profile.
- It then adapts the UI according to your settings.

### 5.2 Layout and Menu Mode

Many OneCX UIs support different menu layouts, for example:
- Horizontal top menu.
- Static side menu (always visible on the left).
- Slim or slim-plus menu (compact, collapsible side menu).

You can usually configure this in the "Account Settings" or "Profile" area. The Shell reads these preferences and:
- Adjusts how the navigation looks.
- Sometimes adjusts behavior on smaller screens.

Example:
- A user who prefers maximum workspace using a compact sidebar chooses "SLIM" menu mode.
- When they log in, the Shell layout uses a narrow vertical menu instead of a big horizontal one.

### 5.3 Color Scheme and Theme

You may be able to choose:
- Light theme (bright backgrounds).
- Dark theme (dark backgrounds).
- Automatic (follows system preference).

The Shell cooperates with theme services to:
- Load the company theme (logo, font, brand colors).
- Apply your chosen color scheme.

From a user’s perspective:
- Changing the color scheme in your account settings takes effect across the whole portal.
- Applications inside the Shell automatically use the same theme.

### 5.4 Language and Time Zone

The profile also holds:
- Preferred language (e.g., English, German).
- Time zone.

When you log in:
- The Shell sets the language for all texts shown (if translations are available).
- Dates and times displayed in apps can be localized using your time zone.

Example:
- A user in Europe sees dates in DD.MM.YYYY, local time.
- A user in the US might see MM/DD/YYYY and their own local time.

## 6. Error Messages and What They Mean

### 6.1 Startup / Initialization Errors

If something goes wrong when the portal starts (for example, a service is not reachable), you might see a special "Initialization Error" page.

This page can show:
- A general message (e.g., "Something went wrong during startup.").
- Technical details like an error code, invalid parameters, or raw messages.

Common situations:
- The workspace configuration service is misconfigured or temporarily down.
- Your session is invalid and needs to be refreshed.

What you can do as a user:
- Use the "Logout" button on the error page and log in again.
- If the problem persists, contact your support team and provide the error code.

### 6.2 Remote Application Load Errors

Sometimes an individual application (like "Bookmarks" or "Help") might fail to load, while the rest of the portal works.

Then you might see:
- A toast or popup message saying the application could not be loaded.
- A specific error page instead of the usual application content.

In this case:
- Try refreshing the page.
- If it continues, it is usually an issue with that particular service, not the entire portal.

### 6.3 Network Issues

If your network connection is unstable:
- Requests can fail.
- The Shell often retries operations a few times.
- Failing repeatedly may result in error pages or messages.

For persistent issues:
- Check your internet connection.
- If on VPN/corporate network, contact your IT support.

## 7. Typical Day-in-the-Life Scenarios

### 7.1 Employee Self-Service

1. Employee opens the OneCX portal URL.
2. Logs in via the corporate login.
3. Lands in the "Employee" workspace.
4. Sees:
   - Company logo and search in the header.
   - A menu with "My Profile", "My Bookmarks", "Help", possibly other apps.
5. Clicks "My Profile":
   - The Shell loads the User Profile app and shows profile details.
   - Employee updates language, theme to dark mode, and menu style to slim.
6. Returns to the home page:
   - The header and theme now reflect the dark theme.
   - The menu switches to the new layout, but navigation continues to work as usual.

### 7.2 Admin Configuring a New Workspace

1. An administrator uses workspace management tools (separate applications) to:
   - Create a new workspace, e.g., "Partner Portal".
   - Assign applications to it (e.g., Partner Management, Reports, Help).
   - Configure which app appears in which slot (e.g., a partner logo component in the header).
2. The Shell automatically uses this workspace configuration when a user opens its URL.
3. The result is:
   - A customized portal experience for partners.
   - Same Shell code, but different menu, branding, and apps.

### 7.3 Rolling Out a New Feature Without Downtime

1. Product team delivers a new app "Knowledge Base".
2. Operations add it to the workspace configuration:
   - Add route and menu entry.
   - Optionally add a small header quick-link to the header slots.
3. Users suddenly see a new menu entry "Knowledge Base" appear in their portal after deployment.
4. No Shell change was required; the Shell simply reads the updated configuration.

## 8. How the Shell Fits Into the Larger OneCX Ecosystem

Behind the scenes, Shell interacts with many services:
- **Workspace Service** – defines which products and apps make up each workspace and how menus look.
- **User Profile Service** – stores user preferences and profile data.
- **Permission Service** – defines who can see or do what.
- **Theme Service** – holds brand themes, logos, and color definitions.
- **Product Store** – catalog of products and their frontends.

As a user, you don’t need to know the technical details, but it helps to understand:
- If something is missing, it may be a product/permission issue, not a portal bug.
- When your organization adds a new app, the Shell is the place where it becomes visible.

## 9. Tips for New OneCX Users

- **Remember the workspace name** – It tells you which set of applications you are using.
- **Check your profile settings** – Language, theme, menu layout can make the portal more comfortable.
- **Use the menu search (if available)** – Some configurations include a global search for quick navigation.
- **Note any error codes** – If you see an error page, copy the code or message for support.
- **Log out and in again after changes** – When big configuration changes happen, a fresh login can help.

## 10. Summary

From a user and product owner perspective, the OneCX Shell is:
- The main entry point to the entire OneCX platform.
- The application that
  - handles login,
  - shows workspaces, menus, and layout,
  - loads all business applications inside a unified portal.
- The layer that applies corporate branding and user personalization.
- A flexible framework that lets operations and product teams plug in new apps and header/footer elements without redesigning the portal.

For you as a new OneCX user:
- Think of the Shell as your "home" portal.
- Everything you do—bookmarks, help, search, profile—is orchestrated by the Shell.
- As your organization grows, new applications can appear seamlessly in this portal, preserving a consistent look and feel.

Future improvements to this guide can include:
- Screenshots of typical layouts.
- Step-by-step walkthroughs for common tasks (changing theme, switching workspaces, finding apps).
- FAQ based on real support questions.
