# OneCX Angular Frontend Developer Guide

> **Version:** 6.x (Angular 19+)  
> **Last Updated:** February 2026  
> **Target Audience:** Frontend Developers, Angular Developers, UI Engineers  
> **Prerequisite**: Angular 19+ knowledge, TypeScript, Webpack Module Federation basics

---

## Table of Contents

### Getting Started
1. [Introduction](#introduction)
2. [OneCX Portal UI Libraries](#onecx-portal-ui-libraries)
3. [Development Environment Setup](#development-environment-setup)
4. [Creating Your First Microfrontend](#creating-your-first-microfrontend)

### Core Libraries
5. [@onecx/angular-integration-interface](#onecxangular-integration-interface)
6. [@onecx/angular-accelerator](#onecxangular-accelerator)
7. [@onecx/angular-auth](#onecxangular-auth)
8. [@onecx/angular-remote-components](#onecxangular-remote-components)
9. [@onecx/angular-webcomponents](#onecxangular-webcomponents)

### Architecture Patterns
10. [Module Federation Setup](#module-federation-setup)
11. [Component Architecture](#component-architecture)
12. [State Management](#state-management)
13. [Routing in Microfrontends](#routing-in-microfrontends)
14. [Topic-Based Communication](#topic-based-communication)

### UI Components
15. [OneCX Angular Components](#onecx-angular-components)
16. [PrimeNG Integration](#primeng-integration)
17. [Portal Page Component](#portal-page-component)
18. [Data Tables and Lists](#data-tables-and-lists)
19. [Forms and Validation](#forms-and-validation)

### Advanced Topics
20. [Remote Components](#remote-components)
21. [Slots and Extension Points](#slots-and-extension-points)
22. [Internationalization (i18n)](#internationalization-i18n)
23. [Theming and Styling](#theming-and-styling)
24. [Performance Optimization](#performance-optimization)

### Testing
25. [Unit Testing](#unit-testing)
26. [Integration Testing](#integration-testing)
27. [E2E Testing](#e2e-testing)

### Deployment
28. [Building for Production](#building-for-production)
29. [Docker Configuration](#docker-configuration)
30. [CI/CD Integration](#cicd-integration)

### Best Practices
31. [Code Organization](#code-organization)
32. [Error Handling](#error-handling)
33. [Security](#security)
34. [Accessibility](#accessibility)

### Reference
35. [API Reference](#api-reference)
36. [Common Issues](#common-issues)
37. [Migration Guides](#migration-guides)

---

## Introduction

### What is OneCX Frontend?

OneCX uses a **microfrontend architecture** built on:
- **Angular 19+**: Modern Angular with standalone components
- **Webpack Module Federation**: Runtime loading of microfrontends
- **PrimeNG 19**: UI component library
- **@onecx/portal-ui-libs**: OneCX Angular libraries

### Why Microfrontends?

**Pattern Purpose - Microfrontend Architecture**:

**Why Microfrontends?**
- **Independent Deployment**: Deploy frontend without rebuilding entire portal
- **Technology Isolation**: Each microfrontend can use different versions
- **Team Autonomy**: Different teams own different microfrontends
- **Faster Development**: Smaller codebases, faster builds
- **Runtime Integration**: Shell loads microfrontends dynamically

**What Is a Microfrontend?**
A microfrontend is an independently deployable Angular application that:
- Has its own `package.json` and dependencies
- Exposes routes or components via Module Federation
- Can be loaded by the Shell at runtime
- Communicates with other microfrontends via Topics

**How It Works**:
```
Shell Application (Host)
         ↓
Loads workspace configuration
         ↓
Discovers microfrontends from Product Store
         ↓
Dynamically loads via Module Federation:
  - Workspace UI (http://workspace-ui:8080/remoteEntry.js)
  - IAM UI (http://iam-ui:8080/remoteEntry.js)
  - Theme UI (http://theme-ui:8080/remoteEntry.js)
         ↓
User navigates → Shell routes to appropriate microfrontend
```

**When to Use**: Building any UI feature for OneCX platform.

---

## OneCX Portal UI Libraries

### Overview

**Pattern Purpose - Shared Angular Libraries**:

**Why Shared Libraries?**
- **Consistency**: Same components, services, utilities across all microfrontends
- **Reusability**: Don't reinvent the wheel (tables, forms, layouts)
- **Updates**: Fix once, all microfrontends benefit
- **Smaller Bundles**: Shared dependencies loaded once by Shell

**What Libraries?**
OneCX provides 12+ Angular libraries in the `@onecx/portal-ui-libs` monorepo:

| Library | Purpose |
|---------|---------|
| **@onecx/angular-integration-interface** | Core interfaces for Shell integration (Topics, Services) |
| **@onecx/angular-accelerator** | Reusable UI components (tables, forms, dialogs) |
| **@onecx/angular-auth** | Authentication and authorization utilities |
| **@onecx/angular-remote-components** | Remote component loading utilities |
| **@onecx/angular-webcomponents** | Web component wrappers for Angular components |
| **@onecx/angular-utils** | Common utilities (date formatting, validation) |
| **@onecx/angular-testing** | Testing utilities and mocks |
| **@onecx/integration-interface** | TypeScript interfaces (shared with Shell) |
| **@onecx/ngrx-accelerator** | NgRx utilities (if using Redux) |
| **@onecx/angular-standalone-shell** | Standalone shell for development |

**How to Install**:
```bash
npm install @onecx/angular-integration-interface@^6.0.0
npm install @onecx/angular-accelerator@^6.0.0
npm install @onecx/angular-auth@^6.0.0
npm install @onecx/angular-remote-components@^6.0.0
```

**When to Use**: Install these libraries in every OneCX microfrontend.

### Library Versions

**Current Versions**:
- **v6.x**: Angular 19+, PrimeNG 19 (latest)
- **v5.x**: Angular 18, PrimeNG 18 (maintenance mode)
- **v4.x**: Angular 17 (deprecated)

**Version Compatibility**:
```
Angular 19 → @onecx/*@^6.0.0
Angular 18 → @onecx/*@^5.0.0
Angular 17 → @onecx/*@^4.0.0
```

### Updating Libraries

**Update to Latest Minor Version**:
```bash
# Automated migration script
curl -sL https://raw.githubusercontent.com/onecx/onecx-portal-ui-libs/main/update_libs.sh | bash -
```

**This script**:
- Updates all `@onecx/*` packages to latest minor version
- Runs Angular migrations
- Updates peer dependencies
- Fixes breaking changes automatically

---

## Development Environment Setup

### Prerequisites

**Required Tools**:
```bash
# Node.js 20+ (LTS)
node --version  # v20.x.x

# npm 10+
npm --version   # 10.x.x

# Angular CLI 19+
npm install -g @angular/cli@19
ng version

# OneCX CLI (optional but recommended)
npm install -g @onecx/cli
```

### Project Setup

**Pattern Purpose - Microfrontend Project Structure**:

**Why This Structure?**
- **NX Workspace**: Manages multiple libraries, build caching, dependency graph
- **Standalone Components**: Angular 19 modern architecture
- **Module Federation**: Webpack plugin for runtime loading
- **Shared Libraries**: Common code extracted to `/libs`

**What It Provides**:
- Monorepo setup with NX
- Pre-configured Module Federation
- OneCX library integration
- Testing infrastructure (Jest, Cypress)
- Build scripts and CI/CD templates

**How to Create Project**:

#### Option 1: Using NX Generator (Recommended)
```bash
# Create NX workspace
npx create-nx-workspace@latest myapp \
  --preset=@onecx/nx-plugin:onecx-app \
  --name=myapp \
  --routing=true \
  --style=scss

cd myapp
```

#### Option 2: Manual Setup
```bash
# Create Angular workspace
ng new myapp --routing --style=scss --standalone

cd myapp

# Install OneCX libraries
npm install @onecx/angular-integration-interface@^6.0.0
npm install @onecx/angular-accelerator@^6.0.0
npm install @onecx/angular-auth@^6.0.0
npm install primeng@^19.0.0
npm install primeicons@^7.0.0

# Install Module Federation
npm install @angular-architects/module-federation@^19.0.0
```

**Project Structure**:
```
myapp/
├── apps/
│   └── myapp/
│       ├── src/
│       │   ├── app/
│       │   │   ├── myapp/
│       │   │   │   ├── pages/
│       │   │   │   │   ├── myresource-search/
│       │   │   │   │   │   ├── myresource-search.component.ts
│       │   │   │   │   │   ├── myresource-search.component.html
│       │   │   │   │   │   ├── myresource-search.component.scss
│       │   │   │   │   │   └── myresource-search.component.spec.ts
│       │   │   │   │   ├── myresource-detail/
│       │   │   │   │   └── myresource-create/
│       │   │   │   ├── services/
│       │   │   │   │   └── myresource-api.service.ts
│       │   │   │   ├── models/
│       │   │   │   │   └── myresource.model.ts
│       │   │   │   └── myapp.routes.ts
│       │   │   ├── shared/
│       │   │   │   ├── generated/  # OpenAPI generated code
│       │   │   │   ├── components/
│       │   │   │   └── utils/
│       │   │   ├── app.component.ts
│       │   │   ├── app.config.ts
│       │   │   └── app.routes.ts
│       │   ├── assets/
│       │   ├── environments/
│       │   ├── index.html
│       │   ├── main.ts
│       │   └── bootstrap.ts  # Module Federation bootstrap
│       ├── webpack.config.js  # Module Federation config
│       ├── project.json
│       └── tsconfig.app.json
├── libs/  # Shared libraries (optional)
├── nx.json
├── package.json
└── tsconfig.base.json
```

**When to Use This Structure**: Every OneCX microfrontend should follow this structure.

---

## Creating Your First Microfrontend

### Step 1: Generate Application

**Using NX Generator**:
```bash
nx generate @onecx/nx-plugin:onecx-microfrontend \
  --name=myapp \
  --directory=apps/myapp \
  --routing=true
```

**This generates**:
- Angular application with Module Federation
- OneCX library imports
- Bootstrap configuration
- Webpack Module Federation config
- Routes and example components

### Step 2: Configure Module Federation

**Pattern Purpose - Module Federation Configuration**:

**Why Module Federation?**
- **Runtime Loading**: Shell loads microfrontend without rebuild
- **Shared Dependencies**: Angular, OneCX libs loaded once
- **Version Independence**: Each microfrontend can have its own versions
- **Dynamic Discovery**: Shell discovers microfrontends from Product Store

**What It Configures**:
- `name`: Unique microfrontend identifier
- `filename`: Entry point (remoteEntry.js)
- `exposes`: What this microfrontend makes available
- `shared`: Dependencies shared with Shell

**How Configuration Works**:

**webpack.config.js**:
```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');

module.exports = {
  output: {
    uniqueName: 'myapp',
    publicPath: 'auto'
  },
  optimization: {
    runtimeChunk: false
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'myapp',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './apps/myapp/src/bootstrap.ts'
      },
      shared: mf.shareAll({
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto'
      })
    })
  ]
};
```

**bootstrap.ts** (Entry Point):
```typescript
import { bootstrap} from './app/app.config';

export default bootstrap;
```

**app.config.ts** (Application Configuration):
```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// OneCX imports
import { 
  providePortalDialogService,
  createRemoteComponentInterceptor
} from '@onecx/angular-integration-interface';
import { providePortalAuthToken } from '@onecx/angular-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([createRemoteComponentInterceptor()])
    ),
    providePortalAuthToken(),
    providePortalDialogService()
  ]
};

export function bootstrap() {
  return import('./app/app.component').then((m) => m.AppComponent);
}
```

**app.routes.ts** (Routing Configuration):
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => 
      import('./myapp/myapp.routes').then((m) => m.MY_APP_ROUTES)
  }
];
```

**myapp.routes.ts** (Feature Routes):
```typescript
import { Routes } from '@angular/router';

export const MY_APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/myresource-search/myresource-search.component')
        .then(m => m.MyResourceSearchComponent)
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./pages/myresource-detail/myresource-detail.component')
        .then(m => m.MyResourceDetailComponent)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/myresource-create/myresource-create.component')
        .then(m => m.MyResourceCreateComponent)
  }
];
```

**When to Use**: Every microfrontend needs Module Federation configuration.

---

## @onecx/angular-integration-interface

### Overview

**Pattern Purpose - Shell Integration Library**:

**Why This Library?**
- **Shell Communication**: Microfrontends talk to Shell via Topics
- **Services**: Access workspace, theme, user, permissions from Shell
- **Dialog Service**: Open dialogs in Shell context
- **Message Service**: Display toast messages

**What It Provides**:
- `CurrentWorkspaceTopic`: Subscribe to workspace changes
- `CurrentThemeTopic`: Subscribe to theme changes
- `CurrentUserTopic`: Subscribe to user changes
- `CurrentPermissionsTopic`: Subscribe to permission changes
- `AppStateService`: Access current app state
- `PortalMessageService`: Show toast messages
- `PortalDialogService`: Open dialogs
- `ConfigurationService`: Access configuration

**How to Use**:

### Topics (Publish-Subscribe Pattern)

**Pattern Purpose - Topic-Based Communication**:

**Why Topics?**
- **Loose Coupling**: Microfrontends don't directly call each other
- **Reactive**: Automatic updates when data changes
- **Scalable**: New microfrontends can subscribe without changes to publishers

**What Topics Available**:
- `CurrentWorkspaceTopic`: Workspace data (name, theme, products, menu)
- `CurrentThemeTopic`: Active theme (CSS variables, logo, colors)
- `CurrentUserTopic`: User profile (name, email, roles, avatar)
- `CurrentPermissionsTopic`: User permissions (granted permissions list)
- `CurrentPageInfoTopic`: Current page metadata

**How Topics Work**:
```
Shell loads workspace
        ↓
Shell publishes to CurrentWorkspaceTopic
        ↓
All subscribed microfrontends receive update
        ↓
Microfrontends update UI based on new workspace
```

**Example - Subscribe to Workspace**:
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentWorkspaceTopic } from '@onecx/integration-interface';

@Component({
  selector: 'app-my-component',
  standalone: true,
  template: `
    <div *ngIf="workspace$ | async as workspace">
      <h1>{{ workspace.workspaceName }}</h1>
      <p>Theme: {{ workspace.theme }}</p>
    </div>
  `
})
export class MyComponent implements OnInit {
  private currentWorkspace$ = inject(CurrentWorkspaceTopic);
  
  workspace$: Observable<Workspace>;
  
  ngOnInit() {
    // Subscribe to workspace changes
    this.workspace$ = this.currentWorkspace$.asObservable();
    
    // Or get current value once
    const currentWorkspace = this.currentWorkspace$.getValue();
    console.log('Current workspace:', currentWorkspace);
  }
}
```

**Example - Subscribe to User**:
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CurrentUserTopic } from '@onecx/integration-interface';

@Component({
  selector: 'app-user-info',
  standalone: true,
  template: `
    <div *ngIf="user$ | async as user">
      <img [src]="user.avatar" alt="Avatar">
      <span>{{ user.displayName }}</span>
      <span>{{ user.email }}</span>
    </div>
  `
})
export class UserInfoComponent implements OnInit {
  private currentUser$ = inject(CurrentUserTopic);
  
  user$ = this.currentUser$.asObservable();
  
  ngOnInit() {
    // Access user roles
    this.currentUser$.asObservable().subscribe(user => {
      console.log('User roles:', user.roles);
      console.log('User has admin role:', user.roles.includes('admin'));
    });
  }
}
```

**Example - Subscribe to Theme**:
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CurrentThemeTopic } from '@onecx/integration-interface';

@Component({
  selector: 'app-themed-component',
  standalone: true,
  template: `<div [style.background-color]="primaryColor">Themed</div>`
})
export class ThemedComponent implements OnInit {
  private currentTheme$ = inject(CurrentThemeTopic);
  
  primaryColor: string;
  
  ngOnInit() {
    this.currentTheme$.asObservable().subscribe(theme => {
      // Apply theme colors
      this.primaryColor = theme.properties?.['--primary-color'] || '#007bff';
    });
  }
}
```

**When to Use**: Use Topics whenever you need Shell-provided data (workspace, user, theme, permissions).

---

### Services

#### AppStateService

**Pattern Purpose - Application State Access**:

**Why AppStateService?**
- Centralized access to app state
- Portal-wide settings
- Workspace information
- Current microfrontend context

**What It Provides**:
```typescript
interface AppStateService {
  currentPortal$: BehaviorSubject<Portal>;
  currentWorkspace$: BehaviorSubject<Workspace>;
  currentMfe$: BehaviorSubject<Microfrontend>;
  globalLoading$: BehaviorSubject<boolean>;
}
```

**Example Usage**:
```typescript
import { Component, inject } from '@angular/core';
import { AppStateService } from '@onecx/angular-integration-interface';

@Component({
  selector: 'app-my-component',
  standalone: true,
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
  `
})
export class MyComponent {
  private appState = inject(AppStateService);
  
  loading$ = this.appState.globalLoading$;
  workspace$ = this.appState.currentWorkspace$;
  
  showWorkspace() {
    this.workspace$.subscribe(workspace => {
      console.log('Workspace name:', workspace.name);
      console.log('Base URL:', workspace.baseUrl);
    });
  }
}
```

#### PortalMessageService

**Pattern Purpose - Toast Notifications**:

**Why PortalMessageService?**
- Consistent toast messages across all microfrontends
- Success/Error/Warning/Info messages
- Automatic translation support
- Portal-wide positioning

**What It Provides**:
```typescript
interface PortalMessageService {
  success(params: MessageParams): void;
  error(params: MessageParams): void;
  warning(params: MessageParams): void;
  info(params: MessageParams): void;
}

interface MessageParams {
  summaryKey?: string;     // Translation key for summary
  detailKey?: string;      // Translation key for details
  summary?: string;        // Direct text for summary
  detail?: string;         // Direct text for details
}
```

**Example Usage**:
```typescript
import { Component, inject } from '@angular/core';
import { PortalMessageService } from '@onecx/angular-integration-interface';

@Component({
  selector: 'app-resource-form',
  standalone: true
})
export class ResourceFormComponent {
  private msgService = inject(PortalMessageService);
  
  onSave() {
    this.resourceApi.save(this.resource).subscribe({
      next: () => {
        this.msgService.success({
          summaryKey: 'RESOURCE.SAVE_SUCCESS_SUMMARY',
          detailKey: 'RESOURCE.SAVE_SUCCESS_DETAIL'
        });
      },
      error: (err) => {
        this.msgService.error({
          summaryKey: 'RESOURCE.SAVE_ERROR_SUMMARY',
          detail: err.message
        });
      }
    });
  }
}
```

#### PortalDialogService

**Pattern Purpose - Modal Dialogs in Shell**:

**Why PortalDialogService?**
- Opens dialogs in Shell context (not microfrontend)
- Dialogs overlay entire portal
- Consistent positioning and styling
- Can load remote components in dialogs

**What It Provides**:
```typescript
interface PortalDialogService {
  openDialog(config: DialogConfig): DialogRef;
}

interface DialogConfig {
  type: 'info' | 'error' | 'delete' | 'save';
  header: string;
  message: string;
  primaryButton?: string;
  secondaryButton?: string;
}
```

**Example Usage**:
```typescript
import { Component, inject } from '@angular/core';
import { PortalDialogService } from '@onecx/angular-integration-interface';

@Component({
  selector: 'app-resource-list',
  standalone: true
})
export class ResourceListComponent {
  private dialogService = inject(PortalDialogService);
  
  onDelete(resource: Resource) {
    this.dialogService.openDialog({
      type: 'delete',
      header: 'Delete Resource',
      message: `Are you sure you want to delete "${resource.name}"?`,
      primaryButton: 'Delete',
      secondaryButton: 'Cancel'
    }).subscribe((result: boolean) => {
      if (result) {
        this.resourceApi.delete(resource.id).subscribe();
      }
    });
  }
}
```

**When to Use**: Use PortalMessageService for all user notifications, PortalDialogService for confirmation dialogs.

---

---

### ConfigurationService

**Pattern Purpose - Application Configuration**:

**Why ConfigurationService?**
- Access runtime configuration (API URLs, feature flags)
- Environment-specific settings
- Dynamic configuration without rebuilds

**What It Provides**:
```typescript
interface ConfigurationService {
  getProperty(key: string): Observable<string>;
  getPortal(): Observable<Portal>;
}
```

**Example Usage**:
```typescript
import { Component, inject } from '@angular/core';
import { ConfigurationService } from '@onecx/angular-integration-interface';

@Component({
  selector: 'app-api-client',
  standalone: true
})
export class ApiClientComponent {
  private configService = inject(ConfigurationService);
  
  private apiUrl: string;
  
  ngOnInit() {
    // Get configuration property
    this.configService.getProperty('API_BASE_URL').subscribe(url => {
      this.apiUrl = url;
      console.log('API URL:', this.apiUrl);
    });
    
    // Get portal information
    this.configService.getPortal().subscribe(portal => {
      console.log('Portal name:', portal.portalName);
      console.log('Portal version:', portal.version);
    });
  }
}
```

**When to Use**: Access configuration values that differ between environments (DEV/PROD).

---

## @onecx/angular-accelerator

### Overview

**Pattern Purpose - Reusable UI Components**:

**Why This Library?**
- **Consistency**: Same components across all microfrontends
- **Productivity**: Don't reinvent data tables, forms, dialogs
- **Maintainability**: Fix bugs once, all apps benefit
- **OneCX Integration**: Components understand Shell, Topics, permissions

**What It Provides**:
- `PortalPageComponent`: Standard page layout (header, breadcrumbs, actions)
- `DataTableComponent`: Advanced tables with sorting, filtering, pagination
- `DataViewComponent`: Grid/list view toggle with templates
- `DataListGridComponent`: Responsive data display
- `PortalDialogComponent`: Modal dialogs with standard buttons
- `ColumnGroupSelectionComponent`: Table column visibility control
- `PageHeaderComponent`: Page titles with actions
- `PortalMenuItem`: Context menus and action buttons
- `SearchHeaderComponent`: Search bars with criteria
- `GroupByCountDiagramComponent`: Data visualization

**How to Install**:
```bash
npm install @onecx/angular-accelerator@^6.0.0
```

**When to Use**: Building any OneCX page with standard layout patterns.

---

### PortalPageComponent

**Pattern Purpose - Standard Page Layout**:

**Why PortalPageComponent?**
- **Consistency**: All OneCX pages have same structure
- **Features Included**: Breadcrumbs, page header, permission checking, loading states
- **Responsive**: Mobile-friendly layout
- **Accessible**: ARIA labels, keyboard navigation

**What It Provides**:
```typescript
@Component({
  selector: 'ocx-portal-page',
  inputs: [
    'objectType',           // Type of object for breadcrumb
    'objectInfo',           // Object details for breadcrumb
    'permission',           // Required permission to view
    'helpArticleId',        // Link to help article
    'loading'               // Show loading spinner
  ]
})
```

**How to Use**:

**Basic Page Layout**:
```typescript
import { Component } from '@angular/core';
import { PortalPageComponent } from '@onecx/angular-accelerator';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [PortalPageComponent],
  template: `
    <ocx-portal-page
      [permission]="'USER#VIEW'"
      [helpArticleId]="'user-search-help'"
      [loading]="loading">
      
      <!-- Page Header -->
      <ng-container slot="page-header">
        <h1>User Management</h1>
        <p>Search and manage users</p>
      </ng-container>
      
      <!-- Page Actions -->
      <ng-container slot="page-actions">
        <p-button 
          label="Create User" 
          icon="pi pi-plus"
          (onClick)="onCreate()">
        </p-button>
      </ng-container>
      
      <!-- Page Content -->
      <ng-container slot="page-content">
        <app-user-search-form></app-user-search-form>
        <app-user-results-table></app-user-results-table>
      </ng-container>
      
    </ocx-portal-page>
  `
})
export class UserSearchComponent {
  loading = false;
  
  onCreate() {
    // Navigate to create page
  }
}
```

**With Breadcrumbs**:
```typescript
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [PortalPageComponent],
  template: `
    <ocx-portal-page
      [objectType]="'User'"
      [objectInfo]="user"
      [permission]="'USER#VIEW'">
      
      <ng-container slot="page-header">
        <h1>{{ user?.displayName }}</h1>
        <p>User Details</p>
      </ng-container>
      
      <ng-container slot="page-actions">
        <p-button 
          label="Edit" 
          icon="pi pi-pencil"
          (onClick)="onEdit()">
        </p-button>
        <p-button 
          label="Delete" 
          icon="pi pi-trash"
          severity="danger"
          (onClick)="onDelete()">
        </p-button>
      </ng-container>
      
      <ng-container slot="page-content">
        <app-user-detail-form [user]="user"></app-user-detail-form>
      </ng-container>
      
    </ocx-portal-page>
  `
})
export class UserDetailComponent {
  user: User;
}
```

**Slots Available**:
- `page-header`: Title and description
- `page-actions`: Buttons, dropdowns (top-right)
- `page-content`: Main page content
- `page-breadcrumbs`: Custom breadcrumbs (optional)

**When to Use**: Every top-level page in your microfrontend.

---

### DataTableComponent

**Pattern Purpose - Advanced Data Tables**:

**Why DataTableComponent?**
- **Rich Features**: Sort, filter, paginate, export, column selection
- **Performance**: Virtual scrolling for large datasets
- **OneCX Integration**: Permission checks, translation, themes
- **Flexible**: Custom columns, templates, actions

**What It Provides**:
```typescript
@Component({
  selector: 'ocx-data-table',
  inputs: [
    'data',                   // Array of data items
    'columns',                // Column definitions
    'titleKey',               // Translation key for title
    'emptyResultsMessageKey', // Translation for empty state
    'paginator',              // Enable pagination
    'rows',                   // Rows per page
    'sortField',              // Default sort column
    'sortOrder',              // 1 (asc) or -1 (desc)
    'deletePermission',       // Permission for delete action
    'editPermission',         // Permission for edit action
    'viewPermission'          // Permission for view action
  ],
  outputs: [
    'selectionChange',        // Selected rows changed
    'deleteItem',             // Delete button clicked
    'editItem',               // Edit button clicked
    'viewItem'                // View button clicked
  ]
})
```

**How to Use**:

**Basic Data Table**:
```typescript
import { Component } from '@angular/core';
import { DataTableComponent, DataTableColumn } from '@onecx/angular-accelerator';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <ocx-data-table
      [data]="users"
      [columns]="columns"
      [titleKey]="'USER.TABLE_TITLE'"
      [emptyResultsMessageKey]="'USER.NO_USERS_FOUND'"
      [paginator]="true"
      [rows]="10"
      [sortField]="'lastName'"
      [sortOrder]="1"
      [deletePermission]="'USER#DELETE'"
      [editPermission]="'USER#EDIT'"
      [viewPermission]="'USER#VIEW'"
      (deleteItem)="onDelete($event)"
      (editItem)="onEdit($event)"
      (viewItem)="onView($event)">
    </ocx-data-table>
  `
})
export class UserTableComponent {
  users: User[] = [];
  
  columns: DataTableColumn[] = [
    {
      field: 'lastName',
      header: 'USER.LAST_NAME',  // Translation key
      sortable: true,
      filterable: true
    },
    {
      field: 'firstName',
      header: 'USER.FIRST_NAME',
      sortable: true,
      filterable: true
    },
    {
      field: 'email',
      header: 'USER.EMAIL',
      sortable: true
    },
    {
      field: 'role',
      header: 'USER.ROLE',
      sortable: true,
      filterable: true
    },
    {
      field: 'createdAt',
      header: 'USER.CREATED_AT',
      sortable: true,
      type: 'date'  // Auto-formats as date
    }
  ];
  
  ngOnInit() {
    this.loadUsers();
  }
  
  loadUsers() {
    this.userApi.getUsers().subscribe(users => {
      this.users = users;
    });
  }
  
  onDelete(user: User) {
    // Confirm and delete
  }
  
  onEdit(user: User) {
    // Navigate to edit page
  }
  
  onView(user: User) {
    // Navigate to detail page
  }
}
```

**With Custom Column Templates**:
```typescript
@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <ocx-data-table
      [data]="users"
      [columns]="columns">
      
      <!-- Custom status column -->
      <ng-template #status let-rowData="rowData">
        <p-tag 
          [value]="rowData.status"
          [severity]="getStatusSeverity(rowData.status)">
        </p-tag>
      </ng-template>
      
      <!-- Custom avatar column -->
      <ng-template #avatar let-rowData="rowData">
        <p-avatar 
          [image]="rowData.avatarUrl"
          [label]="rowData.initials"
          shape="circle">
        </p-avatar>
      </ng-template>
      
      <!-- Custom actions column -->
      <ng-template #actions let-rowData="rowData">
        <p-button 
          icon="pi pi-pencil" 
          (onClick)="onEdit(rowData)">
        </p-button>
        <p-button 
          icon="pi pi-trash" 
          severity="danger"
          (onClick)="onDelete(rowData)">
        </p-button>
      </ng-template>
      
    </ocx-data-table>
  `
})
export class UserTableComponent {
  columns: DataTableColumn[] = [
    { field: 'avatar', header: '', template: 'avatar' },
    { field: 'firstName', header: 'USER.FIRST_NAME', sortable: true },
    { field: 'lastName', header: 'USER.LAST_NAME', sortable: true },
    { field: 'status', header: 'USER.STATUS', template: 'status' },
    { field: 'actions', header: 'ACTIONS', template: 'actions' }
  ];
  
  getStatusSeverity(status: string): string {
    const severities: Record<string, string> = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      BLOCKED: 'danger'
    };
    return severities[status] || 'info';
  }
}
```

**When to Use**: Any list/table of data with sorting, filtering, pagination needs.

---

## @onecx/angular-auth

### Overview

**Pattern Purpose - Authentication & Authorization**:

**Why This Library?**
- **JWT Token Management**: Auto-inject tokens in HTTP requests
- **Permission Checking**: Guard routes, hide UI elements
- **User Context**: Access current user information
- **Session Management**: Handle token refresh, logout

**What It Provides**:
- `providePortalAuthToken()`: Configure JWT interceptor
- `UserService`: Access user permissions
- `CanActivateFunctionAuthPermissions`: Route guard for permissions
- HTTP Interceptor: Auto-adds Authorization header

**How to Install**:
```bash
npm install @onecx/angular-auth@^6.0.0
```

---

### Setup Authentication

**Configure in app.config.ts**:
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePortalAuthToken } from '@onecx/angular-auth';
import { createRemoteComponentInterceptor } from '@onecx/angular-integration-interface';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        createRemoteComponentInterceptor()
      ])
    ),
    providePortalAuthToken() // ← JWT interceptor
  ]
};
```

**What This Does**:
- Reads JWT token from Shell (stored in Topics)
- Automatically adds `Authorization: Bearer <token>` to all HTTP requests
- Handles token refresh logic
- Integrates with OneCX permission system

---

### Permission Checking

**Pattern Purpose - Permission-Based UI**:

**Why Permission Checking?**
- **Security**: Hide features user shouldn't access
- **UX**: Don't show disabled buttons
- **Compliance**: Enforce role-based access control

**How to Check Permissions**:

#### 1. In Component (Programmatic)

```typescript
import { Component, inject } from '@angular/core';
import { UserService } from '@onecx/angular-auth';

@Component({
  selector: 'app-user-actions',
  standalone: true,
  template: `
    <p-button 
      *ngIf="canDelete"
      label="Delete User"
      icon="pi pi-trash"
      (onClick)="onDelete()">
    </p-button>
    
    <p-button 
      *ngIf="canEdit"
      label="Edit User"
      icon="pi pi-pencil"
      (onClick)="onEdit()">
    </p-button>
  `
})
export class UserActionsComponent {
  private userService = inject(UserService);
  
  canDelete = false;
  canEdit = false;
  
  ngOnInit() {
    // Check single permission
    this.canDelete = this.userService.hasPermission('USER#DELETE');
    
    // Check multiple permissions (user needs ALL)
    this.canEdit = this.userService.hasPermission([
      'USER#EDIT',
      'USER#VIEW'
    ]);
  }
}
```

#### 2. Route Guards

**Protect routes with permissions**:
```typescript
import { Routes } from '@angular/router';
import { CanActivateFunctionAuthPermissions } from '@onecx/angular-auth';

export const USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/user-search/user-search.component')
      .then(m => m.UserSearchComponent),
    canActivate: [
      CanActivateFunctionAuthPermissions(['USER#VIEW'])
    ]
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/user-create/user-create.component')
      .then(m => m.UserCreateComponent),
    canActivate: [
      CanActivateFunctionAuthPermissions(['USER#CREATE'])
    ]
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./pages/user-detail/user-detail.component')
      .then(m => m.UserDetailComponent),
    canActivate: [
      CanActivateFunctionAuthPermissions(['USER#VIEW', 'USER#EDIT'])
    ]
  }
];
```

**What This Does**:
- User navigates to `/user/create`
- Guard checks if user has `USER#CREATE` permission
- If YES: Route loads normally
- If NO: Redirect to 403 Forbidden page

#### 3. Get All Permissions

```typescript
import { Component, inject } from '@angular/core';
import { UserService } from '@onecx/angular-auth';

@Component({
  selector: 'app-permission-debug',
  standalone: true
})
export class PermissionDebugComponent {
  private userService = inject(UserService);
  
  permissions: string[] = [];
  
  ngOnInit() {
    // Get all permissions for current user
    this.userService.getPermissions().subscribe(perms => {
      this.permissions = perms;
      console.log('User permissions:', perms);
      // Example output: ['USER#VIEW', 'USER#EDIT', 'WORKSPACE#VIEW']
    });
  }
}
```

**When to Use**: Every feature that requires authorization.

---

## Module Federation Setup

### Overview

**Pattern Purpose - Microfrontend Runtime Loading**:

**Why Module Federation?**
- **Independent Deployment**: Deploy frontend without redeploying Shell
- **Lazy Loading**: Only load microfrontend when user navigates to it
- **Version Independence**: Each microfrontend can use different Angular/library versions
- **Runtime Discovery**: Shell discovers microfrontends from Product Store at runtime

**What It Configures**:
- `name`: Unique microfrontend identifier
- `filename`: Entry point JavaScript file (`remoteEntry.js`)
- `exposes`: What this microfrontend exports (routes, components)
- `shared`: Dependencies shared with Shell (Angular, OneCX libs, PrimeNG)

**How It Works**:
```
User navigates to /workspace/users
         ↓
Shell checks route table
         ↓
Route belongs to "workspace-ui" microfrontend
         ↓
Shell loads http://workspace-ui:8080/remoteEntry.js
         ↓
remoteEntry.js exposes "./Module" → bootstrap function
         ↓
Shell calls bootstrap(), receives Angular routes
         ↓
Shell renders microfrontend in router-outlet
```

---

### Webpack Configuration

**webpack.config.js** (Development):
```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');

module.exports = {
  output: {
    uniqueName: 'myapp',               // Unique identifier
    publicPath: 'auto'                 // Auto-detect base URL
  },
  optimization: {
    runtimeChunk: false                // Required for Module Federation
  },
  resolve: {
    alias: {
      '@onecx': path.resolve(__dirname, 'node_modules/@onecx')
    }
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'myapp',                   // Must match uniqueName
      filename: 'remoteEntry.js',      // Entry point file
      
      // What this microfrontend exposes
      exposes: {
        './Module': './apps/myapp/src/bootstrap.ts'
      },
      
      // Dependencies shared with Shell
      shared: mf.shareAll({
        singleton: true,                // Only one version loaded
        strictVersion: true,            // Enforce version compatibility
        requiredVersion: 'auto',        // Use package.json version
        eager: false                    // Lazy load when needed
      })
    })
  ]
};
```

**webpack.prod.config.js** (Production):
```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');

module.exports = {
  output: {
    uniqueName: 'myapp',
    publicPath: 'auto',
    scriptType: 'text/javascript'     // Required for older browsers
  },
  optimization: {
    runtimeChunk: false,
    minimize: true                     // Minify for production
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'myapp',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './apps/myapp/src/bootstrap.ts'
      },
      shared: mf.shareAll({
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto',
        eager: false
      })
    })
  ]
};
```

---

### Bootstrap Files

**Pattern Purpose - Microfrontend Entry Points**:

**Why Two Entry Files?**
- `main.ts`: Entry point for Webpack, imports `bootstrap.ts` dynamically
- `bootstrap.ts`: Actual application bootstrap code
- **Reason**: Module Federation requires async imports to establish shared dependencies before app starts

**src/main.ts**:
```typescript
import('./bootstrap').catch((err) => console.error(err));
```

**src/bootstrap.ts**:
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { 
  providePortalDialogService,
  createRemoteComponentInterceptor
} from '@onecx/angular-integration-interface';
import { providePortalAuthToken } from '@onecx/angular-auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([createRemoteComponentInterceptor()])
    ),
    providePortalAuthToken(),
    providePortalDialogService()
  ]
};

// Export bootstrap function for Module Federation
export function bootstrap() {
  return import('./app/app.component').then((m) => m.AppComponent);
}
```

**src/app/app.routes.ts**:
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => 
      import('./myapp/myapp.routes').then((m) => m.MY_APP_ROUTES)
  }
];
```

**src/app/myapp/myapp.routes.ts**:
```typescript
import { Routes } from '@angular/router';

export const MY_APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/myresource-search/myresource-search.component')
        .then(m => m.MyResourceSearchComponent)
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./pages/myresource-detail/myresource-detail.component')
        .then(m => m.MyResourceDetailComponent)
  }
];
```

---

### Shared Dependencies

**Pattern Purpose - Optimized Bundle Sizes**:

**Why Shared Dependencies?**
- **Performance**: Angular loaded once, not per microfrontend
- **Memory**: Single instance of libraries
- **Compatibility**: Ensures version consistency

**What Gets Shared**:
```javascript
shared: mf.shareAll({
  singleton: true,         // Only one version in memory
  strictVersion: true,     // Fail if versions incompatible
  requiredVersion: 'auto', // Use package.json version
  eager: false             // Lazy load
})
```

**This shares**:
- `@angular/*`: Core, common, forms, router, platform-browser
- `@onecx/*`: All OneCX libraries
- `primeng`: UI components
- `primeicons`: Icons
- `rxjs`: Reactive programming
- `tslib`: TypeScript helpers

**Version Resolution**:
```
Shell: Angular 19.0.0
Microfrontend A: Angular 19.0.1 → Uses Shell's 19.0.0 (compatible)
Microfrontend B: Angular 18.0.0 → Loads own 18.0.0 (incompatible)
```

**When to Use**: Every microfrontend must configure Module Federation.

---

## Component Architecture

### Pattern Purpose - Smart vs Dumb Components

**Why This Architecture?**
- **Separation of Concerns**: Logic vs presentation
- **Reusability**: Dumb components can be reused
- **Testability**: Easier to test isolated components
- **Maintainability**: Changes localized to specific layer

**What Are Smart/Dumb Components?**

**Smart Components** (Container Components):
- Know about business logic
- Connect to services, APIs, state
- Handle user actions
- Pass data to dumb components
- Minimal HTML template

**Dumb Components** (Presentational Components):
- Pure presentation logic
- Receive data via `@Input()`
- Emit events via `@Output()`
- No service dependencies
- Reusable across features

---

### Example: User Management

**Smart Component** (`user-search-page.component.ts`):
```typescript
import { Component, inject } from '@angular/core';
import { UserApiService } from '../../services/user-api.service';
import { User } from '../../models/user.model';
import { UserSearchFormComponent } from '../../components/user-search-form/user-search-form.component';
import { UserTableComponent } from '../../components/user-table/user-table.component';

@Component({
  selector: 'app-user-search-page',
  standalone: true,
  imports: [UserSearchFormComponent, UserTableComponent],
  template: `
    <ocx-portal-page [permission]="'USER#VIEW'">
      
      <ng-container slot="page-header">
        <h1>User Management</h1>
      </ng-container>
      
      <ng-container slot="page-content">
        <!-- Dumb: receives criteria, emits search event -->
        <app-user-search-form
          (onSearch)="handleSearch($event)">
        </app-user-search-form>
        
        <!-- Dumb: receives data, emits action events -->
        <app-user-table
          [users]="users"
          [loading]="loading"
          (onEdit)="handleEdit($event)"
          (onDelete)="handleDelete($event)">
        </app-user-table>
      </ng-container>
      
    </ocx-portal-page>
  `
})
export class UserSearchPageComponent {
  private userApi = inject(UserApiService);
  
  users: User[] = [];
  loading = false;
  
  handleSearch(criteria: UserSearchCriteria) {
    this.loading = true;
    this.userApi.search(criteria).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
  
  handleEdit(user: User) {
    // Navigate to edit page
  }
  
  handleDelete(user: User) {
    // Confirm and delete
  }
}
```

**Dumb Component** (`user-search-form.component.ts`):
```typescript
import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

export interface UserSearchCriteria {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

@Component({
  selector: 'app-user-search-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
      <div class="grid">
        <div class="col-3">
          <input 
            pInputText 
            formControlName="firstName"
            placeholder="First Name">
        </div>
        <div class="col-3">
          <input 
            pInputText 
            formControlName="lastName"
            placeholder="Last Name">
        </div>
        <div class="col-3">
          <input 
            pInputText 
            formControlName="email"
            placeholder="Email">
        </div>
        <div class="col-3">
          <p-button 
            type="submit"
            label="Search"
            icon="pi pi-search">
          </p-button>
        </div>
      </div>
    </form>
  `
})
export class UserSearchFormComponent {
  @Output() onSearch = new EventEmitter<UserSearchCriteria>();
  
  searchForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    role: new FormControl('')
  });
  
  onSubmit() {
    this.onSearch.emit(this.searchForm.value);
  }
}
```

**Dumb Component** (`user-table.component.ts`):
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../models/user.model';
import { DataTableComponent, DataTableColumn } from '@onecx/angular-accelerator';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <ocx-data-table
      [data]="users"
      [columns]="columns"
      [loading]="loading"
      [emptyResultsMessageKey]="'USER.NO_RESULTS'"
      (editItem)="onEdit.emit($event)"
      (deleteItem)="onDelete.emit($event)">
    </ocx-data-table>
  `
})
export class UserTableComponent {
  @Input() users: User[] = [];
  @Input() loading = false;
  
  @Output() onEdit = new EventEmitter<User>();
  @Output() onDelete = new EventEmitter<User>();
  
  columns: DataTableColumn[] = [
    { field: 'firstName', header: 'USER.FIRST_NAME', sortable: true },
    { field: 'lastName', header: 'USER.LAST_NAME', sortable: true },
    { field: 'email', header: 'USER.EMAIL', sortable: true },
    { field: 'role', header: 'USER.ROLE', sortable: true }
  ];
}
```

**Benefits**:
- `UserSearchFormComponent` can be reused in other pages
- `UserTableComponent` can display different data types with different columns
- `UserSearchPageComponent` can be tested by mocking API service
- Dumb components can be tested with simple inputs, no API mocking needed

---

## Topic-Based Communication

### Pattern Purpose - Microfrontend Communication

**Why Topics?**
- **Loose Coupling**: Microfrontends don't know about each other
- **Scalability**: New microfrontends can subscribe without changes
- **Reactivity**: Auto-updates when data changes
- **Shell-Provided**: Workspace, theme, user data from Shell

**What Topics Exist**:
- `CurrentWorkspaceTopic`: Workspace configuration
- `CurrentThemeTopic`: Active theme styles
- `CurrentUserTopic`: User profile and roles
- `CurrentPermissionsTopic`: User permissions
- `CurrentPageInfoTopic`: Current page metadata

**How Topics Work**:
```
Shell bootstraps
        ↓
Shell loads workspace from API
        ↓
Shell publishes to CurrentWorkspaceTopic
        ↓
All microfrontends subscribed receive update
        ↓
Microfrontends update their UI
```

---

### Creating Custom Topics

**When to Create Custom Topics**:
- Share data between microfrontends
- Broadcast events across app
- Synchronize state

**Example: Shopping Cart Topic**:

**1. Define Topic Interface** (`cart.topic.ts`):
```typescript
import { Topic } from '@onecx/integration-interface';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CartData {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Create Topic instance
export const CartTopic = new Topic<CartData>({
  items: [],
  total: 0,
  itemCount: 0
});
```

**2. Publish to Topic** (Product Microfrontend):
```typescript
import { Component, inject } from '@angular/core';
import { CartTopic, CartData } from '../topics/cart.topic';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  template: `
    <p-button 
      label="Add to Cart"
      (onClick)="addToCart()">
    </p-button>
  `
})
export class ProductDetailComponent {
  product: Product;
  
  addToCart() {
    // Get current cart
    const currentCart = CartTopic.getValue();
    
    // Add item
    const newCart: CartData = {
      items: [
        ...currentCart.items,
        {
          productId: this.product.id,
          quantity: 1,
          price: this.product.price
        }
      ],
      total: currentCart.total + this.product.price,
      itemCount: currentCart.itemCount + 1
    };
    
    // Publish updated cart
    CartTopic.publish(newCart);
  }
}
```

**3. Subscribe to Topic** (Header Microfrontend):
```typescript
import { Component, inject } from '@angular/core';
import { CartTopic } from '../topics/cart.topic';

@Component({
  selector: 'app-cart-badge',
  standalone: true,
  template: `
    <p-button 
      icon="pi pi-shopping-cart"
      [badge]="(cart$ | async)?.itemCount"
      (onClick)="viewCart()">
    </p-button>
  `
})
export class CartBadgeComponent {
  // Subscribe to cart updates
  cart$ = CartTopic.asObservable();
  
  viewCart() {
    // Navigate to cart page
  }
}
```

**4. Subscribe in Multiple Places** (Checkout Microfrontend):
```typescript
import { Component } from '@angular/core';
import { CartTopic, CartData } from '../topics/cart.topic';

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  template: `
    <div *ngIf="cart$ | async as cart">
      <h2>Order Summary</h2>
      <div *ngFor="let item of cart.items">
        {{ item.productId }} - {{ item.quantity }} x {{ item.price | currency }}
      </div>
      <hr>
      <strong>Total: {{ cart.total | currency }}</strong>
    </div>
  `
})
export class CheckoutSummaryComponent {
  cart$ = CartTopic.asObservable();
}
```

**Result**: When user adds item in Product microfrontend, badge updates in Header and summary updates in Checkout – all without direct communication!

**When to Use**: Share data across microfrontends that don't have parent/child relationship.

---

## Internationalization (i18n)

### Overview

**Pattern Purpose - Multi-Language Support**:

**Why i18n?**
- **Global Reach**: Support users in their native language
- **Compliance**: Legal requirements for some regions
- **UX**: Users prefer their own language
- **Maintainability**: Centralized translation management

**What OneCX Provides**:
- `@ngx-translate/core`: Angular translation library
- Automatic language detection from user preferences
- Remote translation loading from BFF
- Fallback to default language

---

### Setup Translations

**1. Install Dependencies**:
```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

**2. Configure in app.config.ts**:
```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { createTranslateLoader } from '@onecx/angular-accelerator';

// Translation loader function
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        isolate: true,  // Isolate microfrontend translations
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,  // OneCX loader with BFF support
          deps: [HttpClient]
        }
      })
    )
  ]
};
```

**3. Create Translation Files**:

**src/assets/i18n/en.json**:
```json
{
  "USER": {
    "SEARCH": {
      "TITLE": "User Search",
      "FIRST_NAME": "First Name",
      "LAST_NAME": "Last Name",
      "EMAIL": "Email Address",
      "SEARCH_BUTTON": "Search",
      "NO_RESULTS": "No users found matching your criteria"
    },
    "DETAIL": {
      "TITLE": "User Details",
      "EDIT_BUTTON": "Edit User",
      "DELETE_BUTTON": "Delete User",
      "CONFIRM_DELETE": "Are you sure you want to delete this user?"
    }
  },
  "COMMON": {
    "SAVE": "Save",
    "CANCEL": "Cancel",
    "DELETE": "Delete",
    "EDIT": "Edit",
    "VIEW": "View",
    "CLOSE": "Close"
  }
}
```

**src/assets/i18n/de.json**:
```json
{
  "USER": {
    "SEARCH": {
      "TITLE": "Benutzersuche",
      "FIRST_NAME": "Vorname",
      "LAST_NAME": "Nachname",
      "EMAIL": "E-Mail-Adresse",
      "SEARCH_BUTTON": "Suchen",
      "NO_RESULTS": "Keine Benutzer gefunden"
    },
    "DETAIL": {
      "TITLE": "Benutzerdetails",
      "EDIT_BUTTON": "Benutzer bearbeiten",
      "DELETE_BUTTON": "Benutzer löschen",
      "CONFIRM_DELETE": "Möchten Sie diesen Benutzer wirklich löschen?"
    }
  },
  "COMMON": {
    "SAVE": "Speichern",
    "CANCEL": "Abbrechen",
    "DELETE": "Löschen",
    "EDIT": "Bearbeiten",
    "VIEW": "Ansehen",
    "CLOSE": "Schließen"
  }
}
```

---

### Using Translations

**1. In Templates (Translate Pipe)**:
```typescript
@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <ocx-portal-page>
      <ng-container slot="page-header">
        <!-- Simple translation -->
        <h1>{{ 'USER.SEARCH.TITLE' | translate }}</h1>
      </ng-container>
      
      <ng-container slot="page-content">
        <form>
          <!-- Translation in placeholder -->
          <input 
            pInputText 
            [placeholder]="'USER.SEARCH.FIRST_NAME' | translate">
          
          <input 
            pInputText 
            [placeholder]="'USER.SEARCH.LAST_NAME' | translate">
          
          <!-- Translation in button -->
          <p-button 
            [label]="'USER.SEARCH.SEARCH_BUTTON' | translate"
            icon="pi pi-search">
          </p-button>
        </form>
        
        <!-- Translation with fallback -->
        <p *ngIf="users.length === 0">
          {{ 'USER.SEARCH.NO_RESULTS' | translate:'No users found' }}
        </p>
      </ng-container>
    </ocx-portal-page>
  `
})
export class UserSearchComponent {
  users: User[] = [];
}
```

**2. In TypeScript (TranslateService)**:
```typescript
import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalMessageService } from '@onecx/angular-integration-interface';

@Component({
  selector: 'app-user-delete',
  standalone: true
})
export class UserDeleteComponent {
  private translate = inject(TranslateService);
  private msgService = inject(PortalMessageService);
  
  confirmDelete(user: User) {
    // Translate confirmation message
    this.translate.get('USER.DETAIL.CONFIRM_DELETE').subscribe(message => {
      if (confirm(message)) {
        this.deleteUser(user);
      }
    });
  }
  
  deleteUser(user: User) {
    this.userApi.delete(user.id).subscribe({
      next: () => {
        // Show success message (translated)
        this.msgService.success({
          summaryKey: 'USER.DELETE.SUCCESS_SUMMARY',
          detailKey: 'USER.DELETE.SUCCESS_DETAIL'
        });
      },
      error: () => {
        // Show error message (translated)
        this.msgService.error({
          summaryKey: 'USER.DELETE.ERROR_SUMMARY',
          detailKey: 'USER.DELETE.ERROR_DETAIL'
        });
      }
    });
  }
}
```

**3. With Parameters**:

**Translation File**:
```json
{
  "USER": {
    "WELCOME": "Welcome, {{name}}!",
    "ITEMS_SELECTED": "{{count}} items selected",
    "LAST_LOGIN": "Last login: {{date}}"
  }
}
```

**Component**:
```typescript
@Component({
  selector: 'app-user-welcome',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <!-- Pass parameters to translation -->
    <h1>{{ 'USER.WELCOME' | translate:{ name: user.displayName } }}</h1>
    
    <p>{{ 'USER.ITEMS_SELECTED' | translate:{ count: selectedCount } }}</p>
    
    <p>{{ 'USER.LAST_LOGIN' | translate:{ date: user.lastLogin | date } }}</p>
  `
})
export class UserWelcomeComponent {
  user: User;
  selectedCount = 5;
}
```

**Output (English)**:
```
Welcome, John Doe!
5 items selected
Last login: Feb 19, 2026
```

**Output (German)**:
```
Willkommen, John Doe!
5 Elemente ausgewählt
Letzter Login: 19. Feb. 2026
```

---

### Change Language

**Switching Language at Runtime**:
```typescript
import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  template: `
    <p-dropdown
      [options]="languages"
      [(ngModel)]="selectedLanguage"
      (onChange)="changeLanguage($event.value)"
      optionLabel="label"
      optionValue="code">
    </p-dropdown>
  `
})
export class LanguageSelectorComponent {
  private translate = inject(TranslateService);
  
  languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' }
  ];
  
  selectedLanguage = 'en';
  
  ngOnInit() {
    // Set default language
    this.translate.setDefaultLang('en');
    
    // Use browser language if available
    const browserLang = this.translate.getBrowserLang();
    this.selectedLanguage = browserLang?.match(/en|de|fr|es/) ? browserLang : 'en';
    this.translate.use(this.selectedLanguage);
  }
  
  changeLanguage(lang: string) {
    this.translate.use(lang);
  }
}
```

**When to Use**: Every user-facing text must be translatable.

---

## Testing

### Unit Testing

**Pattern Purpose - Component Isolation Testing**:

**Why Unit Tests?**
- **Fast**: No browser, no HTTP requests
- **Focused**: Test one component/service at a time
- **Reliable**: No flaky network/timing issues
- **TDD**: Write tests before implementation

**What to Test**:
- Component logic (calculations, conditionals)
- Service methods (data transformation)
- Pipes (formatting, filtering)
- Directives (DOM manipulation)

---

### Testing Components

**Example: UserSearchFormComponent Test**:
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserSearchFormComponent } from './user-search-form.component';

describe('UserSearchFormComponent', () => {
  let component: UserSearchFormComponent;
  let fixture: ComponentFixture<UserSearchFormComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSearchFormComponent, ReactiveFormsModule]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should emit search criteria on form submit', () => {
    // Spy on output
    spyOn(component.onSearch, 'emit');
    
    // Fill form
    component.searchForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
    
    // Submit form
    component.onSubmit();
    
    // Verify event emitted with correct data
    expect(component.onSearch.emit).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: ''
    });
  });
  
  it('should emit empty criteria when form is empty', () => {
    spyOn(component.onSearch, 'emit');
    
    component.onSubmit();
    
    expect(component.onSearch.emit).toHaveBeenCalledWith({
      firstName: '',
      lastName: '',
      email: '',
      role: ''
    });
  });
});
```

---

### Testing Services

**Example: UserApiService Test**:
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserApiService } from './user-api.service';
import { User } from '../models/user.model';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserApiService]
    });
    
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });
  
  it('should fetch users', () => {
    const mockUsers: User[] = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
    ];
    
    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });
    
    // Expect HTTP GET request
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockUsers);
  });
  
  it('should handle error when fetching users fails', () => {
    service.getUsers().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });
    
    const req = httpMock.expectOne('/api/users');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
  
  it('should delete user', () => {
    const userId = '123';
    
    service.deleteUser(userId).subscribe(response => {
      expect(response).toBeNull();
    });
    
    const req = httpMock.expectOne(`/api/users/${userId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
```

---

### Testing with OneCX Libraries

**Mocking OneCX Services**:
```typescript
import { TestBed } from '@angular/core/testing';
import { PortalMessageService } from '@onecx/angular-integration-interface';
import { UserService } from '@onecx/angular-auth';
import { UserDeleteComponent } from './user-delete.component';

describe('UserDeleteComponent', () => {
  let component: UserDeleteComponent;
  let msgServiceSpy: jasmine.SpyObj<PortalMessageService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  
  beforeEach(() => {
    // Create spies
    const msgSpy = jasmine.createSpyObj('PortalMessageService', ['success', 'error']);
    const userSpy = jasmine.createSpyObj('UserService', ['hasPermission']);
    
    TestBed.configureTestingModule({
      imports: [UserDeleteComponent],
      providers: [
        { provide: PortalMessageService, useValue: msgSpy },
        { provide: UserService, useValue: userSpy }
      ]
    });
    
    component = TestBed.createComponent(UserDeleteComponent).componentInstance;
    msgServiceSpy = TestBed.inject(PortalMessageService) as jasmine.SpyObj<PortalMessageService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });
  
  it('should show success message after delete', () => {
    userServiceSpy.hasPermission.and.returnValue(true);
    
    component.deleteUser({ id: '123' } as User);
    
    expect(msgServiceSpy.success).toHaveBeenCalledWith({
      summaryKey: 'USER.DELETE.SUCCESS_SUMMARY',
      detailKey: 'USER.DELETE.SUCCESS_DETAIL'
    });
  });
});
```

---

## Building for Production

### Overview

**Pattern Purpose - Production Optimization**:

**Why Build Process?**
- **Minification**: Reduce bundle size
- **Tree Shaking**: Remove unused code
- **Ahead-of-Time (AOT) Compilation**: Faster startup
- **Source Maps**: Debug production issues
- **Environment Configuration**: API URLs, feature flags

**Build Commands**:
```bash
# Development build
npm run build

# Production build
npm run build -- --configuration=production

# Production with source maps
npm run build -- --configuration=production --source-map
```

---

### Configuration

**angular.json / project.json**:
```json
{
  "targets": {
    "build": {
      "executor": "@angular-architects/module-federation:build",
      "options": {
        "outputPath": "dist/myapp",
        "index": "src/index.html",
        "main": "src/main.ts",
        "tsConfig": "tsconfig.app.json",
        "extraWebpackConfig": "webpack.config.js"
      },
      "configurations": {
        "production": {
          "optimization": true,
          "outputHashing": "all",
          "sourceMap": false,
          "namedChunks": false,
          "aot": true,
          "extractLicenses": true,
          "vendorChunk": false,
          "buildOptimizer": true,
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "2mb",
              "maximumError": "5mb"
            },
            {
              "type": "anyComponentStyle",
              "maximumWarning": "6kb",
              "maximumError": "10kb"
            }
          ],
          "extraWebpackConfig": "webpack.prod.config.js",
          "fileReplacements": [
            {
              "replace": "src/environments/environment.ts",
              "with": "src/environments/environment.prod.ts"
            }
          ]
        }
      }
    }
  }
}
```

**Key Options**:
- `optimization: true`: Enable minification, tree-shaking
- `outputHashing: "all"`: Cache-busting filenames (main.abc123.js)
- `aot: true`: Ahead-of-time compilation
- `buildOptimizer: true`: Advanced optimization
- `budgets`: Fail build if bundles too large

---

### Environment Files

**src/environments/environment.ts** (Development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  logLevel: 'debug'
};
```

**src/environments/environment.prod.ts** (Production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.production.com',
  logLevel: 'error'
};
```

**Using Environment Variables**:
```typescript
import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-api-client',
  standalone: true
})
export class ApiClientComponent {
  private apiUrl = environment.apiUrl;
  
  ngOnInit() {
    console.log('API URL:', this.apiUrl);
    // Development: http://localhost:8080
    // Production: https://api.production.com
  }
}
```

---

### Docker Configuration

**Dockerfile**:
```dockerfile
# Stage 1: Build Angular app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build -- --configuration=production

# Stage 2: Serve with nginx
FROM nginxinc/nginx-unprivileged:1.25-alpine

# Copy built app to nginx
COPY --from=builder /app/dist/myapp /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
worker_processes auto;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  
  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  
  server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    # Serve static files with cache headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
    
    # Angular routing: serve index.html for all routes
    location / {
      try_files $uri $uri/ /index.html;
      add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # remoteEntry.js for Module Federation
    location = /remoteEntry.js {
      add_header Cache-Control "no-cache, no-store, must-revalidate";
      add_header Access-Control-Allow-Origin *;
    }
  }
}
```

**Build and Run**:
```bash
# Build Docker image
docker build -t myapp-ui:latest .

# Run container
docker run -p 8080:8080 myapp-ui:latest

# Access app
open http://localhost:8080
```

---

## Best Practices

### Code Organization

**Pattern Purpose - Maintainable Project Structure**:

**Folder Structure**:
```
myapp/
├── src/
│   ├── app/
│   │   ├── myapp/                    # Feature module
│   │   │   ├── pages/                # Smart components (pages)
│   │   │   │   ├── myresource-search/
│   │   │   │   │   ├── myresource-search.component.ts
│   │   │   │   │   ├── myresource-search.component.html
│   │   │   │   │   ├── myresource-search.component.scss
│   │   │   │   │   └── myresource-search.component.spec.ts
│   │   │   │   ├── myresource-detail/
│   │   │   │   └── myresource-create/
│   │   │   ├── components/           # Dumb components (reusable)
│   │   │   │   ├── myresource-form/
│   │   │   │   ├── myresource-table/
│   │   │   │   └── myresource-card/
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── myresource-api.service.ts
│   │   │   │   └── myresource-state.service.ts
│   │   │   ├── models/               # TypeScript interfaces
│   │   │   │   ├── myresource.model.ts
│   │   │   │   └── myresource-search-criteria.model.ts
│   │   │   ├── guards/               # Route guards
│   │   │   │   └── myresource-permission.guard.ts
│   │   │   ├── pipes/                # Custom pipes
│   │   │   │   └── myresource-status.pipe.ts
│   │   │   └── myapp.routes.ts       # Feature routes
│   │   ├── shared/                   # Shared across features
│   │   │   ├── generated/            # OpenAPI generated code
│   │   │   ├── components/           # Shared components
│   │   │   ├── services/             # Shared services
│   │   │   └── utils/                # Utility functions
│   │   ├── app.component.ts          # Root component
│   │   ├── app.config.ts             # App configuration
│   │   └── app.routes.ts             # Root routes
│   ├── assets/
│   │   ├── i18n/                     # Translation files
│   │   │   ├── en.json
│   │   │   ├── de.json
│   │   │   └── fr.json
│   │   └── images/
│   ├── environments/
│   │   ├── environment.ts            # Development config
│   │   └── environment.prod.ts       # Production config
│   ├── index.html
│   ├── main.ts                       # Entry point
│   └── bootstrap.ts                  # Bootstrap logic
├── webpack.config.js                 # Module Federation config
├── webpack.prod.config.js            # Production webpack config
├── tsconfig.json                     # TypeScript config
├── package.json
└── README.md
```

**Naming Conventions**:
- Components: `kebab-case.component.ts` (e.g., `user-search.component.ts`)
- Services: `kebab-case.service.ts` (e.g., `user-api.service.ts`)
- Models: `kebab-case.model.ts` (e.g., `user.model.ts`)
- Guards: `kebab-case.guard.ts` (e.g., `auth.guard.ts`)
- Pipes: `kebab-case.pipe.ts` (e.g., `user-status.pipe.ts`)

---

### Error Handling

**Pattern Purpose - Graceful Failure**:

**HTTP Error Interceptor**:
```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { PortalMessageService } from '@onecx/angular-integration-interface';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const msgService = inject(PortalMessageService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Client-side error
      if (error.error instanceof ErrorEvent) {
        msgService.error({
          summary: 'Client Error',
          detail: error.error.message
        });
      }
      // Server-side error
      else {
        switch (error.status) {
          case 401:
            msgService.error({
              summary: 'Unauthorized',
              detail: 'Please log in again'
            });
            // Redirect to login
            break;
          
          case 403:
            msgService.error({
              summary: 'Forbidden',
              detail: 'You do not have permission for this action'
            });
            break;
          
          case 404:
            msgService.error({
              summary: 'Not Found',
              detail: 'The requested resource was not found'
            });
            break;
          
          case 500:
            msgService.error({
              summary: 'Server Error',
              detail: 'An unexpected error occurred. Please try again later.'
            });
            break;
          
          default:
            msgService.error({
              summary: `Error ${error.status}`,
              detail: error.message
            });
        }
      }
      
      return throwError(() => error);
    })
  );
};
```

**Global Error Handler**:
```typescript
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { PortalMessageService } from '@onecx/angular-integration-interface';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private msgService = inject(PortalMessageService);
  
  handleError(error: Error) {
    console.error('Global error:', error);
    
    this.msgService.error({
      summary: 'Application Error',
      detail: error.message || 'An unexpected error occurred'
    });
    
    // Log to monitoring service (e.g., Sentry)
    // this.monitoringService.logError(error);
  }
}

// Register in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // ... other providers
  ]
};
```

---

## API Reference

### @onecx/angular-integration-interface

**Services**:
- `AppStateService`: Application state management
- `PortalMessageService`: Toast notifications
- `PortalDialogService`: Modal dialogs
- `ConfigurationService`: Runtime configuration
- `UserService`: Current user information

**Topics**:
- `CurrentWorkspaceTopic`: Workspace data
- `CurrentThemeTopic`: Theme styles
- `CurrentUserTopic`: User profile
- `CurrentPermissionsTopic`: User permissions
- `CurrentPageInfoTopic`: Page metadata

**Interceptors**:
- `createRemoteComponentInterceptor()`: Remote component loading

---

### @onecx/angular-accelerator

**Components**:
- `PortalPageComponent`: Standard page layout
- `DataTableComponent`: Advanced data tables
- `DataViewComponent`: Grid/list view toggle
- `PageHeaderComponent`: Page titles with actions
- `PortalDialogComponent`: Modal dialogs
- `SearchHeaderComponent`: Search bars
- `ColumnGroupSelectionComponent`: Column visibility

**Interfaces**:
- `DataTableColumn`: Table column definition
- `DataViewColumn`: View column definition
- `PageHeaderAction`: Header action button

---

### @onecx/angular-auth

**Services**:
- `UserService`: Permission checking

**Functions**:
- `providePortalAuthToken()`: JWT interceptor configuration
- `CanActivateFunctionAuthPermissions(permissions)`: Route guard

---

### @onecx/angular-remote-components

**Functions**:
- `createRemoteComponent()`: Load remote component
- `loadRemoteModule()`: Load remote module
- `isRemoteComponent()`: Check if remote

---

### @onecx/angular-webcomponents

**Functions**:
- `createAppEntrypoint()`: Create web component entrypoint
- `initializeRouter()`: Initialize router integration
- `startsWith()`: Route matcher for microfrontends
- `bootstrap()`: Bootstrap function

---

## Migration from Vanilla Angular

### Overview

**This section covers**:
- Converting existing Angular app to OneCX microfrontend
- Module Federation setup
- OneCX library integration
- Testing migration

**Prerequisites**:
- Angular 19+ application
- Existing feature modules (lazy-loaded)
- Working application (tests passing)

---

### Step-by-Step Migration

**1. Install OneCX Dependencies**:
```bash
npm install @onecx/angular-integration-interface@^6.0.0
npm install @onecx/angular-accelerator@^6.0.0
npm install @onecx/angular-auth@^6.0.0
npm install @onecx/angular-webcomponents@^6.0.0
npm install @angular/elements@19
npm install @angular-architects/module-federation@19
npm install @webcomponents/webcomponentsjs
```

**2. Configure Module Federation** (see Module Federation section above)

**3. Create Remote Bootstrap Files**:
- Create `src/bootstrap.ts` with OneCX configuration
- Modify `src/main.ts` to import bootstrap dynamically
- Update `tsconfig.app.json` to include bootstrap.ts

**4. Integrate OneCX Services**:
- Replace Angular HttpClient interceptors with OneCX interceptors
- Add PortalMessageService for notifications
- Add permission checking with UserService

**5. Adopt OneCX Components**:
- Replace custom page layouts with `PortalPageComponent`
- Replace custom tables with `DataTableComponent`
- Use `PortalDialogService` for modals

**6. Add Translations**:
- Setup `@ngx-translate/core`
- Create translation files
- Replace hardcoded strings with translation keys

**7. Test Migration**:
- Run unit tests
- Test in Shell (load as microfrontend)
- Verify permissions work
- Check translations load correctly

---

## Summary

This guide covered:

✅ **Getting Started**: Environment setup, project creation, first microfrontend
✅ **Core Libraries**: @onecx/angular-integration-interface, @onecx/angular-accelerator, @onecx/angular-auth
✅ **Module Federation**: Webpack configuration, bootstrap files, shared dependencies
✅ **Component Architecture**: Smart vs dumb components, separation of concerns
✅ **Topic Communication**: Microfrontend data sharing
✅ **i18n**: Multi-language support
✅ **Testing**: Unit tests, component tests, mocking OneCX services
✅ **Building**: Production optimization, Docker deployment
✅ **Best Practices**: Code organization, error handling, security

**Next Steps**:
1. Create your first OneCX microfrontend
2. Explore example applications in workspace
3. Review OneCX documentation portal
4. Join OneCX developer community

**Resources**:
- **OneCX Portal UI Libs**: [GitHub Repository](https://github.com/onecx/onecx-portal-ui-libs)
- **Example Apps**: Check `/docs-guides-ui` folder
- **Angular Docs**: [angular.io](https://angular.io)
- **Module Federation**: [@angular-architects/module-federation](https://github.com/angular-architects/module-federation-plugin)
