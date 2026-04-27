# OneCX Platform - Complete Technical Documentation for Developers

> **Version:** 6.x  
> **Last Updated:** February 2026  
> **Target Audience:** Developers, DevOps Engineers, Solutions Architects

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Platform Overview](#platform-overview)
3. [Core Architecture](#core-architecture)
4. [Key Components](#key-components)
5. [Features and Capabilities](#features-and-capabilities)
6. [Development Guide](#development-guide)
7. [Deployment and Operations](#deployment-and-operations)
8. [Real-World Use Cases](#real-world-use-cases)
9. [Best Practices](#best-practices)
10. [Technical Reference](#technical-reference)

---

## Executive Summary

OneCX (One Customer Experience) is an innovative, open-source **Smart Factory Platform** designed to build and personalize digital workspace solutions for enterprises. It enhances enterprise agility and fosters collaboration across multiple teams and organizations through a modern, cloud-native architecture.

### Key Value Propositions

- **Rapid Time-to-Market**: Deploy applications in days/weeks instead of months/years
- **Scalability**: Cloud-native design that scales on demand
- **Agile Architecture**: Support for multiple independent development teams
- **Developer Joy**: Comprehensive tooling, documentation, and automation
- **Enterprise-Grade Security**: Built-in multi-tenancy, RBAC, and IAM integration

### Technology Stack

```
Frontend:     Angular 19+, Module Federation, Web Components
Backend:      Quarkus (Java), Microservices Architecture
Container:    Docker, Kubernetes, Operators
Database:     PostgreSQL with Multi-tenancy
Identity:     Keycloak, OpenID Connect (OIDC)
CI/CD:        GitHub Actions, Helm Charts
```

---

## Platform Overview

### What is OneCX?

OneCX is built on the **MACH architecture** principles:
- **M**icroservices-based
- **A**PI-first
- **C**loud-native
- **H**eadless

### Core Pillars

#### 1. Enterprise Application Store
A centralized repository for custom-built and third-party applications, functioning like a marketplace for discovering and integrating software solutions.

**Technical Implementation:**
- Product Store Service (`onecx-product-store-svc`)
- Product Store BFF (`onecx-product-store-bff`)
- Product Store UI (`onecx-product-store-ui`)
- Product Store Operator (Kubernetes CRD controller)

**Key Features:**
- Microfrontend and Microservice registration
- Version management and metadata
- Application discovery and catalog
- Automatic deployment via Kubernetes operators

**Code Purpose - Microfrontend Registration API**:

**Why This Code?**
- Makes microfrontends discoverable by Shell
- Enables dynamic loading without code changes
- Centralized catalog for all UI components

**What It Does**:
- Accepts microfrontend metadata (URL, entry point, app name)
- Stores registration in Product Store database
- Returns created resource with generated ID
- Makes microfrontend available for workspace assignment

**How It Works**:
1. Admin/Operator calls POST endpoint with microfrontend details
2. Creates Microfrontend entity with metadata
3. DAO persists to database
4. Returns 201 Created with resource location
5. Shell can now query and load this microfrontend

**When to Use**: When deploying a new microfrontend that needs to be available in OneCX workspaces.

**Example: Registering a Microfrontend**
```java
// ProductStoreService.java - Register Microfrontend
@POST
@Path("/microfrontends")
public Response createMicrofrontend(CreateMicrofrontendRequest request) {
    Microfrontend mfe = new Microfrontend();
    mfe.setAppId(request.getAppId());
    mfe.setAppName(request.getAppName());
    mfe.setRemoteBaseUrl(request.getRemoteBaseUrl());
    mfe.setRemoteEntry(request.getRemoteEntry());
    mfe.setProductName(request.getProductName());
    
    mfe = dao.create(mfe);
    return Response.created(URI.create("/microfrontends/" + mfe.getId()))
        .entity(mfe).build();
}
```

#### 2. Workspace Management
Creates tailored workspaces for different user roles or personas, ensuring relevant tools and services are accessible.

**Technical Components:**
- Workspace Service (`onecx-workspace-svc`)
- Workspace BFF (`onecx-workspace-bff`)
- Workspace UI (`onecx-workspace-ui`)
- Menu Management
- Slot Configuration

**Code Purpose - Workspace Configuration**:

**Why This Configuration?**
- Defines what users see when accessing a workspace
- Controls menu structure and navigation
- Configures theme and branding per workspace
- Specifies which components load in specific slots

**What It Defines**:
- `name`: Unique workspace identifier
- `baseUrl`: URL path for accessing workspace
- `theme`: Applied theme for visual branding
- `menuItems`: Hierarchical navigation structure with role-based visibility
- `slots`: Extension points for pluggable components

**How It's Used**:
1. Shell loads workspace configuration on user login
2. Constructs navigation menu based on user roles
3. Applies specified theme
4. Loads components into defined slots
5. Routes URLs under baseUrl to appropriate microfrontends

**When to Use**: When creating or configuring a workspace for specific user groups or business units.

**Workspace Structure:**
```yaml
workspace:
  name: "admin-workspace"
  baseUrl: "/admin"
  theme: "capgemini-theme"
  homePage: "/dashboard"
  companyName: "Capgemini Engineering"
  menuItems:
    - key: "USERS"
      name: "User Management"
      url: "/iam/users"
      badge: "Admin"
      roles: ["admin", "user-manager"]
    - key: "SETTINGS"
      name: "Settings"
      children:
        - key: "THEMES"
          name: "Theme Management"
          url: "/theme"
  slots:
    header:
      - name: "user-avatar"
        component: "@onecx/user-profile/avatar"
    footer:
      - name: "announcement-banner"
        component: "@onecx/announcement/banner"
```

**Real-World Use Case:**
A company has three workspaces:
- **Admin Workspace**: For system administrators with access to user management, permissions, themes
- **Sales Workspace**: For sales team with CRM, reports, customer data
- **Support Workspace**: For support staff with ticketing, knowledge base, customer communication tools

Each workspace has different themes, menus, and accessible applications based on user roles.

### 4. User Profile Management

**Purpose:** Manage user information, preferences, and account settings.

**Components:**
- User Profile Service (`onecx-user-profile-svc`)
- User Profile BFF (`onecx-user-profile-bff`)
- User Profile UI (`onecx-user-profile-ui`)

**Code Purpose - User Profile Data Model**:

**Why This Structure?**
- Separates personal info from account settings
- Flexible settings storage via JSON
- Supports menu customization and theme preferences
- Locale and timezone for internationalization

**What It Stores**:
- `person`: Name, email, contact details
- `accountSettings`: UI preferences (menu mode, color scheme, locale)
- `settings`: Free-form JSON for custom preferences
- `organization`: User's company/department

**How It's Used**:
1. User logs in → profile loaded from database
2. If no profile exists → auto-created from JWT token
3. User changes preferences → updates settings
4. Settings applied immediately to UI (menu mode, theme, language)
5. Preferences persist across sessions and devices

**When to Use**: Every user needs a profile for personalized experience across the platform.

**User Profile Structure:**
```typescript
interface UserProfile {
  userId: string;
  organization?: string;
  person: UserPerson;
  accountSettings: UserProfileAccountSettings;
  settings: object;  // JSON settings
}

interface UserPerson {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  address?: UserPersonAddress;
  phone?: UserPersonPhone;
}

interface UserProfileAccountSettings {
  layoutAndThemeSettings?: {
    menuMode?: 'HORIZONTAL' | 'STATIC' | 'OVERLAY' | 'SLIM' | 'SLIMPLUS';
    colorScheme?: 'AUTO' | 'LIGHT' | 'DARK';
  };
  localeAndTimeSettings?: {
    locale?: string;
    timezone?: string;
  };
}
```

**Code Purpose - User Profile Backend Logic**:

**Why This Implementation?**
- Auto-creates profile on first login from JWT token
- Lazy loading prevents unnecessary database queries
- Settings migration strategy for backward compatibility
- Principal (user ID) extracted from security context

**What It Does**:
- Gets current user ID from authentication token
- Queries database for existing profile
- If not found: creates new profile from JWT claims
- Migrates legacy account settings to new settings JSON
- Returns complete profile to frontend

**How It Works**:
```
User request arrives with JWT token
         ↓
Extract userId from ApplicationContext
         ↓
Query database: getUserProfileByUserId()
         ↓
Not found? → createProfileFromToken()
         ↓
Migrate settings if needed
         ↓
Return profile DTO
```

**When to Use**: Called on every user login and settings page load.

**Backend Implementation:**
```java
@ApplicationScoped
public class UserProfileRestController implements UserProfileApi {
    
    @Inject UserProfileDAO userProfileDAO;
    @Inject UserProfileService jwtService;
    @Inject UserProfileMapper userProfileMapper;
    
    @Override
    public Response getMyUserProfile() {
        var userId = ApplicationContext.get().getPrincipal();
        var userProfile = userProfileDAO.getUserProfileByUserId(userId, 
            UserProfile.ENTITY_GRAPH_LOAD_PERSON);
        
        if (userProfile == null) {
            // Auto-create profile from JWT token
            var createUserProfile = jwtService.createProfileFromToken();
            userProfile = userProfileDAO.create(createUserProfile);
        }
        
        // Mirror account settings to new settings JSON (sunset strategy)
        if (userProfile.getSettings() == null) {
            userProfile = jwtService.mirrorSettings(userProfile);
            userProfileDAO.update(userProfile);
        }
        
        return Response.ok(userProfileMapper.mapProfile(userProfile)).build();
    }
    
    @Override
    @Transactional
    public Response updateMyUserProfile(UpdateUserProfileRequestDTO dto) {
        var userId = ApplicationContext.get().getPrincipal();
        var userProfile = userProfileDAO.getUserProfileByUserId(userId);
        
        userProfileMapper.updateProfile(userProfile, dto);
        userProfile = userProfileDAO.update(userProfile);
        
        return Response.ok(userProfileMapper.mapProfile(userProfile)).build();
    }
}
```

**Creating Profile from Token:**
```java
@RequestScoped
public class UserProfileService {
    
    @Inject UserProfileConfig config;
    
    public UserProfile createProfileFromToken() {
        var userId = ApplicationContext.get().getPrincipal();
        var token = ApplicationContext.get().getPrincipalToken();
        
        UserProfile userProfile = new UserProfile();
        userProfile.setPerson(new UserPerson());
        userProfile.setUserId(userId);
        userProfile.setOrganization(claim(token, config.claims().organization()));
        userProfile.setIssuer(token.getIssuer());
        
        // Extract from JWT claims
        userProfile.getPerson().setDisplayName(claim(token, config.claims().displayName()));
        userProfile.getPerson().setFirstName(claim(token, config.claims().firstName()));
        userProfile.getPerson().setLastName(claim(token, config.claims().lastName()));
        userProfile.getPerson().setEmail(claim(token, config.claims().email()));
        
        // Initialize default settings
        userProfile.setAccountSettings(new UserProfileAccountSettings());
        userProfile.getAccountSettings()
            .setLocaleAndTimeSettings(new UserProfileAccountSettingsLocaleAndTimeSettings());
        userProfile.getAccountSettings().getLocaleAndTimeSettings()
            .setLocale(getClaimOrConfig(token, config.claims().locale(), config.defaults().locale()));
        
        return userProfile;
    }
}
```

**Code Purpose - User Settings UI Component**:

**Why This Component?**
- Centralized UI for user preferences
- Instant feedback on settings changes
- Automatic page reload to apply new settings
- Optimistic updates with error handling

**What It Does**:
- Loads current user profile and settings
- Provides UI controls for locale, color scheme, menu mode
- Saves changes back to backend
- Reloads page to apply new settings immediately

**How It Works**:
1. `ngOnInit()` loads current profile
2. User changes setting (e.g., color scheme)
3. `colorSchemeChange()` updates local settings object
4. `saveUserSettingsInfo()` calls backend API
5. Success → display message + reload page
6. Page reload applies new theme/locale/menu mode

**Why Reload?** Many settings (theme, locale, menu mode) require re-initialization of Shell and microfrontends.

**When to Use**: Every OneCX application should include user settings page for personalization.

**Frontend - Account Settings:**
```typescript
@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent implements OnInit {
  profile: UserProfile;
  settings: any = {};
  
  constructor(
    private userProfileService: UserProfileAPIService,
    private msgService: PortalMessageService,
    private location: Location
  ) {}
  
  ngOnInit() {
    this.userProfileService.getMyUserProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        if (profile.settings) {
          this.settings = profile.settings;
        }
      }
    });
  }
  
  localeChange(locale: string) {
    this.settings = { ...this.settings, locale };
    this.saveUserSettingsInfo();
  }
  
  colorSchemeChange(colorScheme: string) {
    this.settings = { ...this.settings, colorScheme };
    this.saveUserSettingsInfo();
  }
  
  menuModeChange(menuMode: string) {
    this.settings = { ...this.settings, menuMode };
    this.saveUserSettingsInfo();
  }
  
  saveUserSettingsInfo() {
    const updateRequest: UpdateUserProfileRequest = {
      modificationCount: this.profile.modificationCount!,
      organization: this.profile.organization,
      person: this.profile.person,
      settings: { ...this.settings }
    };
    
    this.userProfileService.updateMyUserProfile({ updateUserProfileRequest: updateRequest })
      .subscribe({
        next: (res) => {
          this.settings = res.settings!;
          this.msgService.success({ summaryKey: 'USER_SETTINGS.SUCCESS' });
          this.reloadPage();  // Apply new settings
        },
        error: (error) => {
          this.msgService.error({ summaryKey: 'USER_SETTINGS.ERROR' });
        }
      });
  }
  
  reloadPage() {
    this.location.historyGo(0);  // Reload current page
  }
}
```

**Real-World Use Case:**
User preferences follow them across devices:
- **Locale**: User sets language to German, all interfaces switch to German
- **Timezone**: User in Tokyo sees times in JST
- **Color Scheme**: User prefers dark mode
- **Menu Mode**: Power user prefers slim menu for more screen space
- **Avatar**: Custom profile picture

### 5. Announcement Management

**Purpose:** Display important messages, news, and system maintenance notifications.

**Components:**
- Announcement Service (`onecx-announcement-svc`)
- Announcement BFF (`onecx-announcement-bff`)
- Announcement UI (`onecx-announcement-ui`)

**Announcement Types:**
- **INFO**: General information
- **EVENT**: Upcoming events
- **SYSTEM_MAINTENANCE**: Scheduled maintenance

**Priority Levels:**
- **IMPORTANT**: Red, high visibility
- **NORMAL**: Yellow, standard visibility
- **LOW**: Blue, low visibility

**Code Purpose - Announcement Data Model**:

**Why This Structure?**
- Supports different message types (info, events, maintenance)
- Priority-based visual styling (IMPORTANT=red, NORMAL=yellow, LOW=blue)
- Time-based display (start/end dates)
- Scoped targeting (specific product or workspace)
- Status control (ACTIVE/INACTIVE for publishing)

**What It Stores**:
- `title` and `content`: Message to display
- `type`: INFO, EVENT, or SYSTEM_MAINTENANCE
- `priority`: Visual importance (IMPORTANT/NORMAL/LOW)
- `status`: ACTIVE (visible) or INACTIVE (hidden)
- `startDate/endDate`: When announcement should display
- `productName/workspaceName`: Optional scoping to specific areas

**How It's Used**:
1. Admin creates announcement with details
2. System checks current time against start/end dates
3. Filters by workspace/product if specified
4. Displays active announcements sorted by priority
5. Users can dismiss (frontend stores dismissed IDs)

**When to Use**: System maintenance notices, feature announcements, company news, event reminders.

**Announcement Model:**
```java
@Entity
@Table(name = "announcement")
public class Announcement extends TraceableEntity {
    @Id
    private String id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "content")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private AnnouncementType type;  // INFO, EVENT, SYSTEM_MAINTENANCE
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private AnnouncementPriorityType priority;  // IMPORTANT, NORMAL, LOW
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AnnouncementStatus status;  // ACTIVE, INACTIVE
    
    @Column(name = "start_date")
    private OffsetDateTime startDate;
    
    @Column(name = "end_date")
    private OffsetDateTime endDate;
    
    @Column(name = "product_name")
    private String productName;  // Scope to specific product
    
    @Column(name = "workspace_name")
    private String workspaceName;  // Scope to specific workspace
}
```

**Creating Announcements:**
```java
@POST
@Transactional
public Response createAnnouncement(CreateAnnouncementRequestDTO dto) {
    var announcement = mapper.create(dto);
    announcement = dao.create(announcement);
    return Response.created(URI.create("/announcements/" + announcement.getId()))
        .entity(mapper.map(announcement))
        .build();
}
```

**Banner Search (Active Announcements):**
```java
@POST
@Path("/banner/search")
public Response searchAnnouncementBanners(AnnouncementBannerSearchCriteriaDTO criteriaDTO) {
    var criteria = mapper.map(criteriaDTO);
    
    // Find active announcements within date range
    var results = dao.loadAnnouncementByCriteria(criteria);
    
    return Response.ok(mapper.mapToPageResult(results)).build();
}
```

**Frontend - Banner Component:**
```typescript
@Component({
  selector: 'ocx-announcement-banner',
  templateUrl: './announcement-banner.component.html'
})
export class OneCXAnnouncementBannerComponent implements OnInit {
  announcements: Announcement[] = [];
  hiddenAnnouncementIds: string[] = [];
  
  constructor(
    private announcementApi: AnnouncementInternalAPIService,
    private appStateService: AppStateService
  ) {}
  
  ngOnInit() {
    this.loadAnnouncements();
  }
  
  loadAnnouncements() {
    const workspace = this.appStateService.currentWorkspace$.getValue();
    
    this.announcementApi.searchAnnouncementBanners({
      announcementBannerSearchCriteria: {
        currentDate: new Date().toISOString(),
        workspaceName: workspace?.workspaceName,
        productName: workspace?.portalName
      }
    }).subscribe({
      next: (result) => {
        this.announcements = result.stream || [];
        this.filterVisibleAnnouncements();
      }
    });
  }
  
  filterVisibleAnnouncements() {
    this.announcements = this.announcements
      .filter(a => !this.hiddenAnnouncementIds.includes(a.id!))
      .sort((a, b) => this.sortByPriority(a, b));
  }
  
  sortByPriority(a: Announcement, b: Announcement): number {
    const priorityOrder = {
      'IMPORTANT': 1,
      'NORMAL': 2,
      'LOW': 3
    };
    return priorityOrder[a.priority!] - priorityOrder[b.priority!];
  }
  
  hide(announcementId: string) {
    this.hiddenAnnouncementIds.push(announcementId);
    localStorage.setItem('hiddenAnnouncements', 
      JSON.stringify(this.hiddenAnnouncementIds));
    this.filterVisibleAnnouncements();
  }
}
```

**Real-World Use Case:**
- **System Maintenance**: "Scheduled maintenance on Saturday 2AM-4AM EST. System will be unavailable."
- **New Feature**: "New analytics dashboard is now available in the Reports section!"
- **Event**: "Quarterly business review meeting on Friday at 10 AM"
- **Scoped Announcement**: Show banking-specific news only in banking workspace

### 6. Search Configuration

**Purpose:** Save and manage search criteria and column configurations for complex searches.

**Components:**
- Search Config Service (`onecx-search-config-svc`)
- Search Config BFF (`onecx-search-config-bff`)
- Search Config UI (`onecx-search-config-ui`)

**Search Config Model:**
```java
@Entity
@Table(name = "search_config")
public class SearchConfig extends TraceableEntity {
    @Id
    private String id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "product_name")
    private String productName;
    
    @Column(name = "app_id")
    private String appId;
    
    @Column(name = "page")
    private String page;
    
    @Column(name = "is_read_only")
    private Boolean readOnly;
    
    @Column(name = "is_advanced")
    private Boolean advanced;
    
    @Type(JsonType.class)
    @Column(name = "columns", columnDefinition = "jsonb")
    private List<String> columns;  // Selected columns
    
    @Type(JsonType.class)
    @Column(name = "values", columnDefinition = "jsonb")
    private Map<String, Object> values;  // Search criteria values
    
    @Column(name = "field_list_version")
    private Integer fieldListVersion;
}
```

**Creating Search Config:**
```java
@POST
@Transactional
public Response createConfig(CreateSearchConfigRequestDTO dto) {
    // Check if config with same name already exists
    var existingConfigs = dao.findByProductAppAndPage(
        new SearchConfigLoadCriteria()
            .productName(dto.getProductName())
            .appId(dto.getAppId())
            .page(dto.getPage())
    );
    
    boolean nameExists = existingConfigs.stream()
        .anyMatch(c -> c.getName().equals(dto.getName()));
    
    if (nameExists) {
        throw new ConstraintViolationException("Config with name already exists", null);
    }
    
    var searchConfig = mapper.create(dto);
    searchConfig = dao.create(searchConfig);
    
    return Response.created(URI.create("/configs/" + searchConfig.getId()))
        .entity(mapper.map(searchConfig))
        .build();
}
```

**Loading Configs:**
```java
@POST
@Path("/load")
public Response loadByProductAppAndPage(SearchConfigLoadRequestDTO dto) {
    var criteria = mapper.map(dto);
    var results = dao.findByProductAppAndPage(criteria);
    return Response.ok(mapper.mapToSearchConfigLoadResultList(results)).build();
}
```

**Frontend Integration:**
```typescript
@Component({
  selector: 'app-ocx-search-config',
  templateUrl: './search-config.component.html'
})
export class SearchConfigComponent implements OnInit {
  searchConfigs: SearchConfigInfo[] = [];
  currentConfig: SearchConfigInfo | undefined;
  
  constructor(
    private searchConfigService: SearchConfigAPIService,
    private msgService: PortalMessageService
  ) {}
  
  ngOnInit() {
    this.loadSearchConfigs();
  }
  
  loadSearchConfigs() {
    this.searchConfigService.getSearchConfigInfos({
      getSearchConfigInfosRequest: {
        productName: 'onecx-user-profile',
        appId: 'onecx-user-profile',
        page: 'user-search'
      }
    }).subscribe({
      next: (response) => {
        this.searchConfigs = response.configs || [];
      }
    });
  }
  
  selectConfig(config: SearchConfigInfo) {
    this.searchConfigService.getSearchConfig(config.id).subscribe({
      next: (response) => {
        this.currentConfig = response.config;
        this.applyConfig(response.config!);
      }
    });
  }
  
  applyConfig(config: SearchConfig) {
    // Apply saved search criteria
    if (config.values) {
      Object.keys(config.values).forEach(key => {
        this.searchForm.get(key)?.setValue(config.values![key]);
      });
    }
    
    // Apply saved column configuration
    if (config.columns && config.columns.length > 0) {
      this.displayedColumns = config.columns;
    }
    
    // Apply view mode
    this.viewMode = config.isAdvanced ? 'advanced' : 'basic';
  }
  
  saveAsNewConfig(name: string) {
    const request: CreateSearchConfigRequest = {
      searchConfig: {
        name: name,
        productName: 'onecx-user-profile',
        appId: 'onecx-user-profile',
        page: 'user-search',
        columns: this.displayedColumns,
        values: this.searchForm.value,
        isAdvanced: this.viewMode === 'advanced',
        isReadonly: false
      }
    };
    
    this.searchConfigService.createSearchConfig(request).subscribe({
      next: () => {
        this.msgService.success({ summaryKey: 'SEARCH_CONFIG.CREATED' });
        this.loadSearchConfigs();
      }
    });
  }
}
```

**Real-World Use Case:**
Power users create complex search configurations:
- **Active Users Filter**: Status=ACTIVE, LastLogin>30days, Columns=[Name,Email,Department,LastLogin]
- **Pending Approvals**: Status=PENDING, Type=APPROVAL, SortBy=CreatedDate DESC
- **My Team**: Department=Engineering, Manager=CurrentUser

Save these configurations for quick reuse instead of re-entering criteria every time.

### 7. Parameter Management

**Purpose:** Store application-specific configuration parameters.

**Components:**
- Parameter Service (`onecx-parameter-svc`)
- Parameter BFF (`onecx-parameter-bff`)
- Parameter UI (`onecx-parameter-ui`)
- Parameter Operator

**Parameter Model:**
```java
@Entity
@Table(name = "parameter")
public class Parameter extends TraceableEntity {
    @Id
    private String id;
    
    @Column(name = "application_id")
    private String applicationId;
    
    @Column(name = "product_name")
    private String productName;
    
    @Column(name = "key", nullable = false)
    private String key;
    
    @Column(name = "value")
    private String value;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "unit")
    private String unit;
    
    @Column(name = "range_from")
    private Integer rangeFrom;
    
    @Column(name = "range_to")
    private Integer rangeTo;
}
```

**Usage Example:**
```java
// Load parameters for application
@Inject ParameterService parameterService;

public void configureApplication() {
    String maxUploadSize = parameterService.getParameter(
        "onecx-document", "MAX_UPLOAD_SIZE", "10MB"
    );
    
    String sessionTimeout = parameterService.getParameter(
        "onecx-portal", "SESSION_TIMEOUT", "3600"
    );
}
```

### 8. Help Management

**Purpose:** Context-sensitive help documentation.

**Components:**
- Help Service (`onecx-help-sff`)
- Help BFF (`onecx-help-bff`)
- Help UI (`onecx-help-ui`)

**Help Article Model:**
```java
@Entity
@Table(name = "help")
public class Help extends TraceableEntity {
    @Id
    private String id;
    
    @Column(name = "item_id", unique = true)
    private String itemId;
    
    @Column(name = "product_name")
    private String productName;
    
    @Column(name = "context")
    private String context;
    
    @Column(name = "base_url")
    private String baseUrl;
    
    @Column(name = "resource_url")
    private String resourceUrl;
}
```

**Frontend Integration:**
```typescript
<ocx-portal-page [helpArticleId]="'user-management-list'">
  <!-- Page content -->
</ocx-portal-page>
```

### 9. Data Orchestrator

**Purpose:** Automate data import/export across OneCX resources.

**Components:**
- Data Orchestrator Service (`onecx-data-orchestrator-svc`)
- Data Orchestrator BFF (`onecx-data-orchestrator-bff`)
- Data Orchestrator UI (`onecx-data-orchestrator-ui`)
- Data Orchestrator Operator

**Supported Data Types:**
- Workspaces
- Themes
- Permissions
- Parameters
- Slots
- Products
- Microfrontends
- Microservices
- KeyCloak clients

**Usage:**
```yaml
# Export workspace configuration
apiVersion: onecx.tkit.org/v1
kind: DataOrchestrator
metadata:
  name: export-workspace-config
spec:
  operation: EXPORT
  dataTypes:
    - WORKSPACE
    - THEME
    - PERMISSION
  targetWorkspace: "admin-workspace"
  outputFormat: JSON
```

#### 3. Portal Shell
The orchestration layer that provides a unified interface and coordinates interaction between microfrontends.

**Technical Architecture:**
- Client-side workspace construction
- Dynamic routing and module loading
- Data sharing via Topics (publish-subscribe)
- Authentication and authorization handling

**URL Structure:**
```
<protocol>://<host>[:<port>]/[<shell-path>/]<workspace-name>/<mfe-path>/<mfe-internal-path>

Example:
https://portal.company.com/admin/iam/users/create
                           ^^^^^ ^^^^^  workspace  | mfe | internal
```

---

## Core Architecture

### Architecture Principles

1. **Microservices and Microfrontends**
   - Independent deployment and scaling
   - Technology diversity (polyglot)
   - Team autonomy
   - Fault isolation

2. **Backend for Frontend (BFF) Pattern**
   - One BFF per UI application
   - Aggregation of backend services
   - Security enforcement
   - API adaptation for frontend needs

3. **API-First Design**
   - OpenAPI specifications
   - Contract-first development
   - Auto-generated clients
   - Versioned APIs

4. **Containerization & Orchestration**
   - Docker containers
   - Kubernetes deployment
   - Custom Resource Definitions (CRDs)
   - Operators for automation

### Application Structure

Every OneCX **Application** consists of:
```
Product/Application
├── UI (Microfrontend)          # Angular SPA, exposed as Web Component
├── BFF (Backend for Frontend)   # Quarkus service, security layer
├── SVC (Backend Services)       # Quarkus microservices, business logic
└── Operator (Optional)          # Kubernetes operator for CRD management
```

**Example: Bookmark Application**
```
onecx-bookmark/
├── onecx-bookmark-ui           # Angular microfrontend
├── onecx-bookmark-bff          # Quarkus BFF (security, orchestration)
├── onecx-bookmark-svc          # Quarkus service (CRUD operations)
└── docs/                       # Antora documentation
```

### Communication Patterns

**Code Purpose - Communication Patterns**:

**Why These Patterns?**
- Separation of concerns (UI, security, business logic)
- Security enforcement at BFF layer
- Type-safe communication via generated clients
- Testable and maintainable architecture

**What They Demonstrate**:
- Frontend → BFF: HTTP calls with observables
- BFF → Backend: REST client with error handling
- Backend → Database: DAO pattern with criteria API

**How They Work Together**:
```
User clicks "Create Bookmark"
       ↓
Angular Service calls BFF
       ↓
BFF validates token & permissions
       ↓
BFF calls backend service via REST client
       ↓
Backend DAO persists to database
       ↓
Response flows back through layers
```

**When to Use**: Standard pattern for every OneCX application - always separate UI, security, and business logic.

#### Frontend ↔ BFF

**Why This Pattern?**
- Frontend never calls backend services directly
- Observable-based for reactive programming
- Type-safe with DTOs

```typescript
// Angular Service calling BFF
export class BookmarkService {
  constructor(private http: HttpClient) {}
  
  createBookmark(bookmark: CreateBookmarkDTO): Observable<BookmarkDTO> {
    return this.http.post<BookmarkDTO>(
      `${this.basePath}/bookmarks`,
      bookmark,
      { headers: this.headers }
    );
  }
}
```

#### BFF ↔ Backend Services

**Why This Pattern?**
- BFF acts as security gateway and orchestration layer
- Uses generated REST clients for type safety
- Handles errors and transforms responses
- Can aggregate multiple backend calls

**What It Does**:
- Receives request from frontend
- Validates authentication and authorization
- Calls backend service via REST client
- Transforms backend response to BFF DTO
- Returns response to frontend

**How It Works**:
- `@RestClient` injects generated client pointing to backend service
- `mapper.map()` converts between BFF and backend DTOs
- `try-with-resources` ensures proper connection handling
- `handleException()` provides consistent error responses

```java
// BFF Controller calling backend service
@ApplicationScoped
@LogService
public class BookmarkRestController implements BookmarksApiService {
    
    @Inject
    @RestClient
    BookmarksInternalApi client;  // Generated REST client
    
    @Override
    public Response createBookmark(CreateBookmarkDTO dto) {
        try (Response response = client.createBookmark(mapper.map(dto))) {
            Bookmark bookmark = response.readEntity(Bookmark.class);
            return Response.status(response.getStatus())
                .entity(mapper.map(bookmark))
                .build();
        } catch (WebApplicationException ex) {
            return handleException(ex);
        }
    }
}
```

#### Microservice ↔ Database
```java
// DAO Pattern with Hibernate
@ApplicationScoped
public class BookmarkDAO extends AbstractDAO<Bookmark> {
    
    public PageResult<Bookmark> findByCriteria(BookmarkSearchCriteria criteria) {
        try {
            CriteriaQuery<Bookmark> cq = criteriaQuery();
            Root<Bookmark> root = cq.from(Bookmark.class);
            
            List<Predicate> predicates = new ArrayList<>();
            if (criteria.getUserId() != null) {
                predicates.add(cb.equal(root.get("userId"), criteria.getUserId()));
            }
            
            cq.where(predicates.toArray(new Predicate[0]));
            return createPageQuery(cq, criteria).getPageResult();
        } catch (Exception e) {
            throw new DAOException(ErrorKeys.ERROR_FIND_BY_CRITERIA, e);
        }
    }
}
```

---

## Key Components

### 1. OneCX Shell

**Purpose:** The heart of the OneCX platform - orchestrates all applications into a single-page experience.

**Responsibilities:**
- Client-side workspace construction
- Routing and remote module loading
- Data sharing between microfrontends
- Authentication handling
- Theme application
- Toast message display

**Technical Implementation:**

**Shell UI** (`onecx-shell-ui`)
```typescript
// Workspace construction on startup
export class ShellComponent implements OnInit {
  constructor(
    private workspaceService: WorkspaceService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // 1. Load workspace configuration
    const workspaceName = this.extractWorkspaceName();
    
    this.workspaceService.loadWorkspace(workspaceName)
      .subscribe(workspace => {
        // 2. Construct routing rules
        this.configureRoutes(workspace.products);
        
        // 3. Load theme
        this.applyTheme(workspace.themeId);
        
        // 4. Configure menu
        this.configureMenu(workspace.menuItems);
        
        // 5. Publish workspace data to topics
        this.publishWorkspaceData(workspace);
      });
  }
  
  private configureRoutes(products: Product[]) {
    const routes: Routes = products
      .flatMap(p => p.microfrontends)
      .map(mfe => ({
        path: mfe.basePath,
        loadChildren: () => loadRemoteModule({
          type: 'module',
          remoteEntry: mfe.remoteEntry,
          exposedModule: mfe.exposedModule
        })
      }));
    
    this.router.resetConfig(routes);
  }
}
```

**Code Purpose - Shell Workspace Construction & Topic Communication**:

**Why This Pattern?**
- Shell loads workspace once on startup
- All microfrontends need access to workspace data
- Publish-subscribe pattern for loose coupling
- Microfrontends don't directly call workspace service

**What It Does**:
- Shell fetches workspace configuration
- Publishes workspace data to CurrentWorkspaceTopic
- Any microfrontend subscribes to this topic
- When workspace changes, all subscribers notified

**How It Works**:
```
Shell startup
      ↓
Load workspace from backend
      ↓
Publish to CurrentWorkspaceTopic
      ↓
Microfrontends subscribe
      ↓
Receive workspace data
      ↓
Update UI based on workspace
```

**Topics Available**:
- `CurrentWorkspaceTopic`: Workspace config
- `CurrentThemeTopic`: Active theme
- `CurrentUserTopic`: User profile
- `CurrentPermissionsTopic`: User permissions

**When to Use**: Anytime microfrontends need shared context (workspace, theme, user, permissions).

**Information Sharing via Topics:**
```typescript
// Publishing workspace data
import { CurrentWorkspaceTopic } from '@onecx/integration-interface';

export class WorkspaceService {
  constructor(private currentWorkspace$: CurrentWorkspaceTopic) {}
  
  publishWorkspace(workspace: Workspace) {
    this.currentWorkspace$.publish({
      workspaceName: workspace.name,
      baseUrl: workspace.baseUrl,
      theme: workspace.theme,
      products: workspace.products,
      menuItems: workspace.menuItems,
      portalName: workspace.portalName
    });
  }
}

// Consuming in a microfrontend
export class MyMfeComponent {
  workspace$ = this.currentWorkspace$.asObservable();
  
  constructor(private currentWorkspace$: CurrentWorkspaceTopic) {
    this.workspace$.subscribe(workspace => {
      console.log('Current workspace:', workspace.workspaceName);
      // React to workspace changes
    });
  }
}
```

**Code Purpose - Shell BFF Aggregation**:

**Why Aggregation?**
- Single Shell API call instead of 4 separate calls
- Reduces frontend complexity
- Better performance (parallel backend calls)
- Consistent error handling
- Atomic workspace loading

**What It Aggregates**:
- Workspace configuration (menu, slots, baseUrl)
- Theme (CSS variables, logo, colors)
- Products (available microfrontends)
- User profile (name, preferences, avatar)

**How It Works**:
1. Shell calls single endpoint: `/workspace/admin`
2. BFF makes parallel calls to 4 backend services
3. Aggregates responses into single DTO
4. Returns complete workspace data
5. Shell publishes to topics for microfrontends

**Benefits**:
- Fewer network round trips
- Transactional consistency
- Easier frontend code
- Better caching opportunities

**When to Use**: When frontend needs data from multiple backend services - always aggregate in BFF.

**Shell BFF** (`onecx-shell-bff`)
```java
// Aggregates workspace data from multiple services
@ApplicationScoped
public class ShellRestController {
    
    @Inject @RestClient WorkspaceInternalApi workspaceClient;
    @Inject @RestClient ThemeInternalApi themeClient;
    @Inject @RestClient ProductStoreInternalApi productClient;
    @Inject @RestClient UserProfileInternalApi userClient;
    
    @GET
    @Path("/workspace/{name}")
    public Response getWorkspaceData(@PathParam("name") String name) {
        // Aggregate data from multiple services
        Workspace workspace = workspaceClient.getWorkspaceByName(name);
        Theme theme = themeClient.getThemeById(workspace.getThemeId());
        List<Product> products = productClient.getProductsByWorkspace(name);
        UserProfile user = userClient.getCurrentUser();
        
        // Build aggregated response
        WorkspaceDataDTO response = new WorkspaceDataDTO()
            .workspace(workspace)
            .theme(theme)
            .products(products)
            .user(user);
            
        return Response.ok(response).build();
    }
}
```

### 2. Microfrontends (MFE)

**Purpose:** Independent UI modules loaded dynamically by the Shell.

**Types of Exposed Content:**
1. **Module**: Full UI application with routing
2. **Remote Component**: Smaller reusable UI component

**Code Purpose - Module Federation Configuration**:

**Why Module Federation?**
- Runtime loading without rebuilding Shell
- Independent deployment of microfrontends
- Version independence (each MFE has own dependencies)
- Shared dependencies for smaller bundle sizes

**What It Configures**:
- `name`: Unique identifier for this microfrontend
- `filename`: Entry point file (remoteEntry.js)
- `exposes`: What this MFE makes available to Shell
  - `./Module`: Full application with routing
  - `./Component`: Individual component
- `shared`: Libraries shared with Shell (Angular, RxJS)

**How It Works**:
```
Build time:
  MFE builds with Module Federation
      ↓
  Creates remoteEntry.js manifest
      ↓
Runtime:
  Shell reads remoteEntry.js
      ↓
  Dynamically imports exposed module
      ↓
  Loads MFE into route or component slot
```

**When to Use**: Every OneCX microfrontend must configure Module Federation to be loadable by Shell.

**Exposing a Microfrontend:**

**webpack.config.js**
```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'onecx_bookmark_ui',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './src/bootstrap.ts',
        './BookmarkListComponent': './src/app/bookmark/bookmark-list-remote.component.ts'
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: false },
        '@angular/common': { singleton: true, strictVersion: false },
        '@angular/router': { singleton: true, strictVersion: false }
      }
    })
  ]
};
```

**bootstrap.ts - Module Exposure**
```typescript
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

export default AppModule;
```

**Remote Component Exposure as Web Component:**
```typescript
// bookmark-list-remote.component.ts
import { Component } from '@angular/core';
import { bootstrapRemoteComponent } from '@onecx/angular-webcomponents';

@Component({
  selector: 'app-bookmark-list-remote',
  templateUrl: './bookmark-list.component.html'
})
export class BookmarkListRemoteComponent {
  // Component logic
}

bootstrapRemoteComponent(
  BookmarkListRemoteComponent,
  'onecx-bookmark-list',
  environment.production,
  []
);
```

**Real-World Example:**
A company wants to show bookmarks in multiple locations:
1. **As a Module**: Full bookmark management page at `/bookmarks`
2. **As Remote Component**: Quick bookmark list in the header
3. **As Remote Component**: Bookmark widget in dashboard

Same codebase, different exposures!

### 3. Backend for Frontend (BFF)

**Purpose:** Security layer and API aggregator between UI and backend services.

**Key Responsibilities:**
- Authentication and authorization
- Permission checking (RBAC)
- API aggregation
- Request/response transformation
- Error handling

**Code Purpose - BFF Security Layer**:

**Why These Security Measures?**
- BFF is the ONLY entry point from frontend to backend
- Token validation prevents unauthorized access
- Role-based security (@RolesAllowed) for coarse control
- Permission checking for fine-grained authorization
- Multi-tenancy ensures data isolation

**What Security Layers?**
1. **OIDC Authentication** (Keycloak)
2. **Role-Based Access** (@RolesAllowed)
3. **Permission Checks** (RESOURCE#ACTION)
4. **Tenant Isolation** (tenant_id discriminator)

**How Security Flows**:
```
Frontend request with JWT
       ↓
Quarkus validates JWT with Keycloak
       ↓
@RolesAllowed checks user roles
       ↓
Extract user ID from SecurityContext
       ↓
Check specific permissions if needed
       ↓
Tenant filter applied to all queries
       ↓
Call backend with validated context
```

**When to Use**: Every BFF endpoint must have authentication and authorization configured.

**Security Implementation:**

**application.properties**
```properties
# Authentication
quarkus.oidc.auth-server-url=http://keycloak:8080/realms/onecx
quarkus.oidc.client-id=onecx-bookmark-bff
quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET}

# Permission checking
tkit.rs.context.token.enabled=true
tkit.rs.context.token.header-param=apm-principal-token
tkit.rs.context.token.public-key-location.suffix=/protocol/openid-connect/certs

# Multi-tenancy
tkit.rs.context.tenant-id.enabled=true
quarkus.hibernate-orm.multitenant=DISCRIMINATOR
```

**Securing Endpoints:**
```java
@Path("/bookmarks")
@ApplicationScoped
@LogService
public class BookmarkRestController {
    
    @POST
    @RolesAllowed("ocx-bookmark:write")  // Role-based security
    public Response createBookmark(
        @Context SecurityContext securityContext,
        CreateBookmarkDTO dto
    ) {
        // Get current user from security context
        String userId = securityContext.getUserPrincipal().getName();
        dto.setUserId(userId);
        
        // Check permissions programmatically if needed
        if (!hasPermission("BOOKMARK#CREATE")) {
            return Response.status(403).build();
        }
        
        // Call backend service
        try (Response response = bookmarkClient.createBookmark(mapper.map(dto))) {
            return Response.status(response.getStatus())
                .entity(response.readEntity(Bookmark.class))
                .build();
        }
    }
    
    private boolean hasPermission(String permission) {
        // Permission checking logic using OneCX permission service
        return permissionService.hasPermission(permission);
    }
}
```

**Permission Validation:**
```java
@ApplicationScoped
public class PermissionService {
    
    @Inject @RestClient PermissionInternalApi permissionClient;
    @Inject JWTParser jwtParser;
    
    @CacheResult(cacheName = "user-permissions")
    public Set<String> getUserPermissions(String token) {
        // Extract user roles from JWT
        Set<String> roles = jwtParser.parseRoles(token);
        
        // Get permissions for roles from permission service
        Set<String> permissions = new HashSet<>();
        for (String role : roles) {
            Response response = permissionClient.getPermissionsByRole(role);
            List<Permission> rolePerms = response.readEntity(
                new GenericType<List<Permission>>() {}
            );
            rolePerms.forEach(p -> permissions.add(
                p.getResource() + "#" + p.getAction()
            ));
        }
        
        return permissions;
    }
}
```

### 4. Microservices (Backend Services)

**Purpose:** Business logic and data persistence.

**Structure:**
```
onecx-bookmark-svc/
├── src/main/java/
│   ├── domain/
│   │   ├── daos/              # Data Access Objects
│   │   ├── models/            # JPA Entities
│   │   └── criteria/          # Search criteria
│   ├── rs/                    # REST endpoints
│   │   ├── internal/          # Internal API (for BFF)
│   │   ├── external/          # External API (for integrations)
│   │   └── exim/              # Export/Import API
│   └── rs/mappers/            # DTO mappers (MapStruct)
├── src/main/resources/
│   ├── application.properties
│   ├── db/                    # Liquibase migrations
│   └── openapi/               # OpenAPI specs
└── src/main/helm/             # Helm charts
```

**JPA Entity with Multi-Tenancy:**
```java
@Entity
@Table(name = "bookmark")
public class Bookmark extends TraceableEntity {
    
    @Id
    @Column(name = "guid")
    private String id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "product_name")
    private String productName;
    
    @Column(name = "app_id")
    private String appId;
    
    @Column(name = "url")
    private String url;
    
    @Column(name = "display_name")
    private String displayName;
    
    @Column(name = "position")
    private Integer position;
    
    // Multi-tenancy discriminator
    @Column(name = "tenant_id", insertable = false, updatable = false)
    private String tenantId;
    
    // Getters and setters
}
```

**DAO with Search Criteria:**
```java
@ApplicationScoped
public class BookmarkDAO extends AbstractDAO<Bookmark> {
    
    public PageResult<Bookmark> findByCriteria(BookmarkSearchCriteria criteria) {
        CriteriaQuery<Bookmark> cq = criteriaQuery();
        Root<Bookmark> root = cq.from(Bookmark.class);
        
        List<Predicate> predicates = new ArrayList<>();
        
        // User filter
        if (criteria.getUserId() != null) {
            predicates.add(cb.equal(root.get(BOOKMARK.USER_ID), criteria.getUserId()));
        }
        
        // Product filter
        if (criteria.getProductName() != null) {
            predicates.add(cb.equal(root.get(BOOKMARK.PRODUCT_NAME), criteria.getProductName()));
        }
        
        // Full-text search on display name
        if (criteria.getDisplayName() != null) {
            predicates.add(cb.like(
                cb.lower(root.get(BOOKMARK.DISPLAY_NAME)),
                "%" + criteria.getDisplayName().toLowerCase() + "%"
            ));
        }
        
        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.asc(root.get(BOOKMARK.POSITION)));
        
        return createPageQuery(cq, criteria).getPageResult();
    }
    
    @Transactional
    public void updatePositions(List<String> bookmarkIds) {
        for (int i = 0; i < bookmarkIds.size(); i++) {
            em.createQuery("UPDATE Bookmark b SET b.position = :pos WHERE b.id = :id")
                .setParameter("pos", i)
                .setParameter("id", bookmarkIds.get(i))
                .executeUpdate();
        }
    }
}
```

**REST Controller:**
```java
@Path("/internal/bookmarks")
@ApplicationScoped
@LogService
public class BookmarkRestController implements BookmarksInternalApi {
    
    @Inject BookmarkDAO dao;
    @Inject BookmarkMapper mapper;
    @Inject ExceptionMapper exceptionMapper;
    
    @POST
    @Path("/search")
    public Response searchBookmarks(BookmarkSearchCriteriaDTO criteriaDTO) {
        var criteria = mapper.map(criteriaDTO);
        var result = dao.findByCriteria(criteria);
        return Response.ok(mapper.mapPage(result)).build();
    }
    
    @POST
    @Transactional
    public Response createBookmark(CreateBookmarkDTO dto) {
        var bookmark = mapper.create(dto);
        bookmark = dao.create(bookmark);
        return Response
            .created(URI.create("/bookmarks/" + bookmark.getId()))
            .entity(mapper.map(bookmark))
            .build();
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateBookmark(
        @PathParam("id") String id,
        UpdateBookmarkDTO dto
    ) {
        var bookmark = dao.findById(id);
        if (bookmark == null) {
            return Response.status(404).build();
        }
        
        mapper.update(dto, bookmark);
        dao.update(bookmark);
        
        return Response.ok(mapper.map(bookmark)).build();
    }
    
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteBookmark(@PathParam("id") String id) {
        dao.deleteQueryById(id);
        return Response.noContent().build();
    }
    
    @ServerExceptionMapper
    public RestResponse<ProblemDetailResponseDTO> constraintViolation(
        ConstraintViolationException ex
    ) {
        return exceptionMapper.constraint(ex);
    }
}
```

### 5. Kubernetes Operators

**Purpose:** Automate deployment and management of OneCX resources using Custom Resource Definitions (CRDs).

**Example: Product Store Operator**

**Custom Resource Definition:**
```yaml
apiVersion: onecx.tkit.org/v1
kind: Microfrontend
metadata:
  name: bookmark-mfe
  namespace: onecx
spec:
  appId: onecx-bookmark
  appName: Bookmark Management
  version: 2.0.0
  productName: onecx-bookmark
  remoteBaseUrl: http://onecx-bookmark-ui:8080
  remoteEntry: remoteEntry.js
  exposedModule: ./Module
  type: MODULE
  technology: ANGULAR
  contact: bookmark-team@company.com
  classifications:
    - PRODUCTIVITY
  endpoints:
    - name: bookmark-bff
      path: /bff/bookmarks
      url: http://onecx-bookmark-bff:8080
```

**Operator Controller:**
```java
@ControllerConfiguration(
    name = "microfrontend",
    namespaces = Constants.WATCH_CURRENT_NAMESPACE
)
public class MicrofrontendController implements Reconciler<Microfrontend> {
    
    @Inject ProductStoreService productStoreService;
    @Inject KubernetesClient client;
    
    @Override
    public UpdateControl<Microfrontend> reconcile(
        Microfrontend resource,
        Context<Microfrontend> context
    ) {
        log.info("Reconciling microfrontend: {}", resource.getMetadata().getName());
        
        try {
            // Create or update in product store
            var mfeData = MicrofrontendData.builder()
                .appId(resource.getSpec().getAppId())
                .appName(resource.getSpec().getAppName())
                .version(resource.getSpec().getVersion())
                .productName(resource.getSpec().getProductName())
                .remoteBaseUrl(resource.getSpec().getRemoteBaseUrl())
                .remoteEntry(resource.getSpec().getRemoteEntry())
                .exposedModule(resource.getSpec().getExposedModule())
                .build();
            
            productStoreService.registerMicrofrontend(mfeData);
            
            // Update status
            resource.setStatus(new MicrofrontendStatus()
                .state(OperatorState.DEPLOYED)
                .message("Microfrontend registered successfully"));
            
            return UpdateControl.updateStatus(resource);
            
        } catch (Exception e) {
            log.error("Failed to reconcile microfrontend", e);
            
            resource.setStatus(new MicrofrontendStatus()
                .state(OperatorState.FAILED)
                .message("Failed: " + e.getMessage()));
            
            return UpdateControl.updateStatus(resource)
                .rescheduleAfter(Duration.ofMinutes(5));
        }
    }
}
```

**Using the Operator:**
```bash
# Apply the microfrontend CRD
kubectl apply -f microfrontend-crd.yaml

# Operator automatically:
# 1. Reads the CRD
# 2. Calls Product Store API
# 3. Registers the microfrontend
# 4. Updates the CRD status
# 5. Makes it available in workspaces
```

---

## Features and Capabilities

### 1. Theme Management

**Purpose:** Customize visual appearance to match brand identity.

**Components:**
- Theme Service (`onecx-theme-svc`)
- Theme BFF (`onecx-theme-bff`)
- Theme UI (`onecx-theme-ui`)
- Theme Operator

**Theme Structure:**
```typescript
interface Theme {
  name: string;
  displayName: string;
  description?: string;
  cssFile?: string;  // External CSS file URL
  assetsUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  previewImageUrl?: string;
  properties?: ThemeProperties;  // CSS variables
}

interface ThemeProperties {
  general?: Record<string, string>;
  topbar?: Record<string, string>;
  // Other property groups
}
```

**Creating a Theme:**

**UI - Theme Designer:**
```typescript
export class ThemeDesignerComponent {
  themeForm = new FormGroup({
    name: new FormControl('', Validators.required),
    displayName: new FormControl('', Validators.required),
    description: new FormControl(''),
    properties: new FormGroup({
      general: new FormGroup({
        'primary-color': new FormControl('#1976d2'),
        'font-family': new FormControl('Roboto, sans-serif'),
        'font-size': new FormControl('14px')
      }),
      topbar: new FormGroup({
        'background-color': new FormControl('#1976d2'),
        'text-color': new FormControl('#ffffff')
      })
    })
  });
  
  onSaveTheme() {
    this.themeApi.createTheme({
      createThemeRequest: this.themeForm.value
    }).subscribe({
      next: (theme) => {
        this.msgService.success({ summaryKey: 'THEME_CREATED' });
        this.router.navigate(['/theme', theme.name]);
      },
      error: (err) => this.msgService.error({ summaryKey: 'THEME_CREATION_FAILED' })
    });
  }
  
  onPreviewTheme() {
    // Apply theme temporarily for preview
    const themeData = this.themeForm.value;
    this.applyThemeVariables(themeData.properties);
  }
  
  private applyThemeVariables(properties: ThemeProperties) {
    Object.entries(properties).forEach(([group, vars]) => {
      Object.entries(vars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    });
  }
}
```

**Backend Service:**
```java
@ApplicationScoped
public class ThemesRestController implements ThemesInternalApi {
    
    @Inject ThemeDAO dao;
    @Inject ThemeMapper mapper;
    
    @POST
    @Transactional
    public Response createNewTheme(CreateThemeDTO dto) {
        var theme = mapper.create(dto);
        
        // Validate theme properties
        validateThemeProperties(theme.getProperties());
        
        // Save theme
        theme = dao.create(theme);
        
        // Publish theme creation event
        eventPublisher.publishThemeCreated(theme);
        
        return Response
            .created(URI.create("/themes/" + theme.getId()))
            .entity(mapper.map(theme))
            .build();
    }
    
    private void validateThemeProperties(Map<String, Map<String, String>> properties) {
        // Validate CSS variable names and values
        for (var group : properties.values()) {
            for (var entry : group.entrySet()) {
                if (!isValidCssVariable(entry.getKey())) {
                    throw new ValidationException("Invalid CSS variable: " + entry.getKey());
                }
                if (!isValidCssValue(entry.getValue())) {
                    throw new ValidationException("Invalid CSS value: " + entry.getValue());
                }
            }
        }
    }
}
```

**Theme Application in Shell:**
```typescript
export class ThemeService {
  constructor(
    private currentTheme$: CurrentThemeTopic,
    private http: HttpClient
  ) {
    // Listen to theme changes
    this.currentTheme$.asObservable().subscribe(theme => {
      this.applyTheme(theme);
    });
  }
  
  private applyTheme(theme: Theme) {
    if (!theme) return;
    
    // Apply CSS variables
    if (theme.properties) {
      Object.entries(theme.properties).forEach(([group, vars]) => {
        Object.entries(vars).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--${key}`, value);
        });
      });
    }
    
    // Load external CSS file if provided
    if (theme.cssFile) {
      this.loadExternalCss(theme.cssFile);
    }
    
    // Update favicon
    if (theme.faviconUrl) {
      this.updateFavicon(theme.faviconUrl);
    }
  }
}
```

**Real-World Use Case:**
A global company operates in multiple regions with different branding requirements:

1. **North America Theme**: Blue primary color, modern sans-serif font
2. **Europe Theme**: Green primary color, corporate font
3. **Asia Theme**: Red primary color, specific cultural design elements

Each workspace can be configured with a different theme, allowing the same application to look different based on region or business unit.

### 2. Tenant Management (Multi-Tenancy)

**Purpose:** Support multiple isolated tenants within a single platform instance.

**Components:**
- Tenant Service (`onecx-tenant-svc`)
- Tenant BFF (`onecx-tenant-bff`)
- Tenant UI (`onecx-tenant-ui`)
- Tenant Resolution Service

**Multi-Tenancy Strategy:**
OneCX uses **Discriminator-based multi-tenancy** with Hibernate:

```properties
# Enable multi-tenancy
quarkus.hibernate-orm.multitenant=DISCRIMINATOR
tkit.rs.context.tenant-id.enabled=true
```

**Tenant Resolution:**

**Token-based Tenant Resolution:**
```java
@ApplicationScoped
@RequestScoped
public class TenantService {
    
    @Inject @RestClient TenantV1Api tenantClient;
    @Inject TenantConfig config;
    
    @CacheResult(cacheName = "onecx-tenant")
    public String getTenant(String token) {
        // Extract organization ID from JWT token
        JWTParser parser = new JWTParser();
        String orgId = parser.parse(token).getClaim("orgId");
        
        // Resolve tenant ID from organization ID
        try (Response response = tenantClient.getTenantByOrgId(orgId)) {
            if (response.getStatus() == 200) {
                TenantId tenantId = response.readEntity(TenantId.class);
                return tenantId.getTenantId();
            }
            
            // Return default tenant if enabled
            if (config.defaultTenantEnabled()) {
                return config.defaultTenantId();
            }
            
            throw new TenantException("Tenant not found for orgId: " + orgId);
        }
    }
}
```

**Entity with Tenant Discriminator:**
```java
@Entity
@Table(name = "workspace")
public class Workspace {
    
    @Id
    @Column(name = "guid")
    private String id;
    
    @Column(name = "name", unique = true)
    private String name;
    
    @Column(name = "tenant_id", insertable = false, updatable = false)
    private String tenantId;  // Managed by Hibernate
    
    @Column(name = "theme_id")
    private String themeId;
    
    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL)
    private List<MenuItem> menuItems;
    
    // Getters and setters
}
```

**Code Purpose - Multi-Tenancy with Discriminator**:

**Why Discriminator Pattern?**
- Single database for all tenants (cost effective)
- Data isolation without separate schemas
- Automatic tenant filtering by Hibernate
- Prevents cross-tenant data leaks

**What It Does**:
- `tenant_id` column added to every table
- Hibernate automatically filters all queries by tenant
- JWT token contains tenant information
- ApplicationContext stores current tenant ID

**How It Works**:
```
User JWT contains: tenant_id = "tenant-a"
           ↓
Request arrives, extract tenant from token
           ↓
ApplicationContext.setTenantId("tenant-a")
           ↓
Hibernate intercepts ALL queries
           ↓
Automatically adds: WHERE tenant_id = 'tenant-a'
           ↓
User only sees their tenant's data
```

**Properties**:
- `insertable = false, updatable = false`: Hibernate manages it
- No manual tenant_id handling in code
- TenantResolver provides current tenant ID
- Works with all queries (find, search, update, delete)

**When to Use**: Every SaaS application needs multi-tenancy - discriminator is simplest and most cost-effective.

**Hibernate Configuration:**
```java
@ApplicationScoped
public class TenantResolver implements TenantIdentifierResolver {
    
    @Override
    public String resolveCurrentTenantIdentifier() {
        // Get tenant from request context
        return ApplicationContext.get().getTenantId();
    }
    
    @Override
    public boolean validateExistingCurrentSessions() {
        return false;
    }
}
```

**Real-World Use Case:**
A SaaS platform serves multiple customers:

- **Customer A (tenant-a)**: Insurance company with 500 users
- **Customer B (tenant-b)**: Bank with 1000 users
- **Customer C (tenant-c)**: Retail chain with 2000 users

Each tenant has:
- Isolated data (workspaces, users, configurations)
- Custom themes and branding
- Different workspace configurations
- Separate permissions and roles
- Independent application catalog

All running on the same infrastructure, with data isolation enforced at the database level.

### 3. Permission Management (RBAC)

**Purpose:** Role-Based Access Control for fine-grained authorization.

**Components:**
- Permission Service (`onecx-permission-svc`)
- Permission BFF (`onecx-permission-bff`)
- Permission UI (`onecx-permission-ui`)
- Permission Operator

**Permission Model:**

**Code Purpose - RBAC Permission Model**:

**Why This Model?**
- Flexible: Resource#Action format (e.g., USER#DELETE, THEME#UPDATE)
- Granular: Control at action level, not just page level
- Scalable: Easy to add new resources and actions
- Auditable: Clear permission assignments

**What It Defines**:
- **Permission**: RESOURCE#ACTION (e.g., "WORKSPACE#CREATE")
- **Role**: Collection of permissions (e.g., "Admin" role)
- **Assignment**: Linking roles to users
- **Resource**: Entity type (USER, THEME, WORKSPACE)
- **Action**: Operation (CREATE, READ, UPDATE, DELETE)

**How It Works**:
```
Application registers permissions:
  - USER#CREATE
  - USER#READ
  - USER#UPDATE
  - USER#DELETE
       ↓
Admin creates roles:
  - Admin: All USER permissions
  - User Manager: USER#CREATE, USER#READ, USER#UPDATE
  - Viewer: USER#READ only
       ↓
Admin assigns roles to users
       ↓
User logs in → JWT contains roles
       ↓
Frontend/Backend check permissions
       ↓
Show/hide UI + enforce API access
```

**When to Use**: Every OneCX application registers its permissions for admin to assign to roles.

```
User → has → Roles → have → Permissions
                              ↓
                         Resource#Action
```

**Permission Structure:****
```java
@Entity
@Table(name = "permission")
public class Permission {
    @Id
    private String id;
    
    @Column(name = "app_id")
    private String appId;
    
    @Column(name = "product_name")
    private String productName;
    
    @Column(name = "resource")
    private String resource;  // e.g., "USER", "THEME", "WORKSPACE"
    
    @Column(name = "action")
    private String action;    // e.g., "CREATE", "READ", "UPDATE", "DELETE"
    
    @Column(name = "description")
    private String description;
    
    // Permission key format: RESOURCE#ACTION (e.g., "USER#DELETE")
    public String getKey() {
        return resource + "#" + action;
    }
}

@Entity
@Table(name = "role")
public class Role {
    @Id
    private String id;
    
    @Column(name = "name", unique = true)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @ManyToMany
    @JoinTable(
        name = "assignment",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();
}
```

**Creating Permissions:**
```java
@POST
@Path("/permissions")
@Transactional
public Response createPermission(CreatePermissionDTO dto) {
    var permission = new Permission();
    permission.setId(UUID.randomUUID().toString());
    permission.setAppId(dto.getAppId());
    permission.setProductName(dto.getProductName());
    permission.setResource(dto.getResource());
    permission.setAction(dto.getAction());
    permission.setDescription(dto.getDescription());
    
    permissionDAO.create(permission);
    
    return Response.created(URI.create("/permissions/" + permission.getId()))
        .entity(permission)
        .build();
}
```

**Assigning Permissions to Roles:**
```java
@POST
@Path("/roles/{roleId}/assignments")
@Transactional
public Response grantPermissions(
    @PathParam("roleId") String roleId,
    List<String> permissionIds
) {
    Role role = roleDAO.findById(roleId);
    if (role == null) {
        return Response.status(404).build();
    }
    
    List<Permission> permissions = permissionDAO.findByIds(permissionIds);
    
    // Create assignments
    for (Permission permission : permissions) {
        Assignment assignment = new Assignment();
        assignment.setRole(role);
        assignment.setPermission(permission);
        assignment.setMandatory(false);
        assignmentDAO.create(assignment);
    }
    
    return Response.status(201).build();
}
```

**Permission Checking in UI:**
```typescript
export class UserManagementComponent implements OnInit {
  canCreateUser = false;
  canDeleteUser = false;
  canEditUser = false;
  
  constructor(private userService: UserService) {}
  
  ngOnInit() {
    // Check permissions
    this.canCreateUser = this.userService.hasPermission('USER#CREATE');
    this.canDeleteUser = this.userService.hasPermission('USER#DELETE');
    this.canEditUser = this.userService.hasPermission('USER#EDIT');
  }
  
  onCreateUser() {
    if (!this.canCreateUser) {
      this.msgService.error({ summaryKey: 'PERMISSION_DENIED' });
      return;
    }
    // Create user logic
  }
}
```

```html
<!-- user-management.component.html -->
<button 
  *ngIf="canCreateUser"
  (click)="onCreateUser()"
  class="p-button"
>
  Create User
</button>

<ocx-data-table
  [data]="users"
  [actions]="actions"
/>
```

```typescript
// Define actions with permission requirements
actions: DataAction[] = [
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    permission: 'USER#EDIT',
    actionCallback: (user) => this.onEditUser(user)
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    permission: 'USER#DELETE',
    actionCallback: (user) => this.onDeleteUser(user),
    conditional: true,
    showCondition: (user) => user.status !== 'ACTIVE'
  }
];
```

**Permission Checking in Backend:**
```java
@Path("/users")
@ApplicationScoped
public class UserRestController {
    
    @POST
    @RolesAllowed("user-manager")  // Keycloak role
    public Response createUser(
        @PermissionRequired("USER#CREATE")  // OneCX permission
        CreateUserDTO dto
    ) {
        // Create user logic
        return Response.created(URI.create("/users/" + user.getId()))
            .entity(user)
            .build();
    }
    
    @DELETE
    @Path("/{id}")
    @RolesAllowed("user-manager")
    public Response deleteUser(
        @PermissionRequired("USER#DELETE")
        @PathParam("id") String id
    ) {
        userService.deleteUser(id);
        return Response.noContent().build();
    }
}
```

**Real-World Use Case:**
An enterprise application has different user roles:

**Admin Role:**
- USER#CREATE, USER#READ, USER#UPDATE, USER#DELETE
- WORKSPACE#CREATE, WORKSPACE#READ, WORKSPACE#UPDATE, WORKSPACE#DELETE
- THEME#CREATE, THEME#READ, THEME#UPDATE, THEME#DELETE
- PERMISSION#CREATE, PERMISSION#READ, PERMISSION#UPDATE, PERMISSION#DELETE

**User Manager Role:**
- USER#CREATE, USER#READ, USER#UPDATE
- WORKSPACE#READ

**Viewer Role:**
- USER#READ
- WORKSPACE#READ
- THEME#READ

**Developer Role:**
- THEME#CREATE, THEME#READ, THEME#UPDATE
- WORKSPACE#READ

Each role sees only the UI elements and has access only to the APIs they're permitted to use.

---

## Development Guide

### Setting Up Development Environment

**Prerequisites:**
```bash
# Required tools
- JDK 17 or higher
- Node.js 18 or higher
- Docker Desktop
- Maven 3.8+
- Angular CLI 17+
- Kubectl
- Helm 3
```

**Clone OneCX:**
```bash
# Clone all repositories
git clone https://github.com/onecx/onecx-all.git
cd onecx-all

# Run clone script
./clone-onecx-all.sh
```

**Local Development Environment:**
```bash
# Start OneCX infrastructure (Keycloak, PostgreSQL, etc.)
cd onecx-local-env
docker-compose up -d

# Verify services
docker-compose ps
```

### Creating a New OneCX Application

**1. Generate Application Structure:**
```bash
# Use OneCX NX plugins
npx create-nx-workspace@latest myapp \
  --preset=@onecx/nx-plugin:onecx-app \
  --appName=myapp \
  --style=scss \
  --routing=true

cd myapp
```

**2. Project Structure:**
```
myapp/
├── myapp-ui/                  # Angular microfrontend
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   ├── webpack.config.js
│   └── package.json
├── myapp-bff/                 # Quarkus BFF
│   ├── src/main/java/
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── openapi/
│   └── pom.xml
├── myapp-svc/                 # Quarkus Service
│   ├── src/main/java/
│   ├── src/main/resources/
│   │   ├── db/changelog/
│   │   └── openapi/
│   └── pom.xml
└── docs/                      # Antora documentation
```

**Code Purpose - OpenAPI Contract-First Development**:

**Why OpenAPI First?**
- Contract defines API before implementation
- Frontend and backend teams work in parallel
- Auto-generated clients eliminate manual coding
- API documentation automatically generated
- Changes to contract caught early

**What It Defines**:
- **paths**: API endpoints (URLs, HTTP methods)
- **operationId**: Unique identifier for each operation
- **requestBody/responses**: Input and output schemas
- **components/schemas**: Reusable data models (DTOs)

**How It's Used**:
```
1. Write OpenAPI YAML specification
        ↓
2. Maven plugin generates:
   - Java interfaces (for backend)
   - Java DTOs (for backend)
   - TypeScript services (for frontend)
   - TypeScript models (for frontend)
        ↓
3. Implement generated interfaces
        ↓
4. Swagger UI auto-generated for testing
```

**Benefits**:
- Type safety across frontend/backend
- No manual DTO writing
- API changes = compilation errors (safety)
- Consistent naming and structure

**When to Use**: ALWAYS define OpenAPI specification BEFORE writing any code.

**3. Define OpenAPI Specification:**

**myapp-bff/src/main/resources/openapi/myapp-bff-openapi.yaml**
```yaml
openapi: 3.0.3
info:
  title: MyApp BFF API
  version: 1.0.0
  
paths:
  /myresources:
    post:
      tags:
        - myresources
      operationId: searchMyResources
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MyResourceSearchCriteria'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MyResourcePageResult'
    
components:
  schemas:
    MyResource:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        creationDate:
          type: string
          format: date-time
    
    MyResourceSearchCriteria:
      type: object
      properties:
        name:
          type: string
        pageNumber:
          type: integer
          format: int32
        pageSize:
          type: integer
          format: int32
    
    MyResourcePageResult:
      type: object
      properties:
        totalElements:
          type: integer
          format: int64
        number:
          type: integer
          format: int32
        size:
          type: integer
          format: int32
        stream:
          type: array
          items:
            $ref: '#/components/schemas/MyResource'
```

**4. Generate Client Code:**

**pom.xml**
```xml
<plugin>
    <groupId>org.openapitools</groupId>
    <artifactId>openapi-generator-maven-plugin</artifactId>
    <version>7.0.1</version>
    <executions>
        <execution>
            <id>internal-api</id>
            <goals>
                <goal>generate</goal>
            </goals>
            <configuration>
                <inputSpec>${project.basedir}/src/main/resources/openapi/myapp-bff-openapi.yaml</inputSpec>
                <generatorName>jaxrs-spec</generatorName>
                <apiPackage>gen.org.mycompany.myapp.bff.rs.internal</apiPackage>
                <modelPackage>gen.org.mycompany.myapp.bff.rs.internal.model</modelPackage>
            </configuration>
        </execution>
    </executions>
</plugin>
```

```bash
# Generate
mvn clean compile
```

**5. Implement REST Controller:**

**MyResourceRestController.java**
```java
package org.mycompany.myapp.bff.rs.controllers;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.tkit.quarkus.log.cdi.LogService;

import gen.org.mycompany.myapp.bff.rs.internal.MyResourcesApiService;
import gen.org.mycompany.myapp.bff.rs.internal.model.*;
import gen.org.mycompany.myapp.client.api.MyResourcesInternalApi;
import gen.org.mycompany.myapp.client.model.MyResourcePageResult;

@ApplicationScoped
@Transactional(value = Transactional.TxType.NOT_SUPPORTED)
@LogService
public class MyResourceRestController implements MyResourcesApiService {
    
    @Inject
    @RestClient
    MyResourcesInternalApi client;
    
    @Inject
    MyResourceMapper mapper;
    
    @Inject
    ExceptionMapper exceptionMapper;
    
    @Override
    public Response searchMyResources(MyResourceSearchCriteriaDTO criteriaDTO) {
        try (Response response = client.searchMyResources(mapper.map(criteriaDTO))) {
            MyResourcePageResult result = response.readEntity(MyResourcePageResult.class);
            return Response.status(response.getStatus())
                .entity(mapper.map(result))
                .build();
        } catch (WebApplicationException ex) {
            return exceptionMapper.clientException(ex);
        }
    }
}
```

**6. Create Angular Service:**

```bash
cd myapp-ui
npm install @openapitools/openapi-generator-cli --save-dev

# Generate Angular client
npx openapi-generator-cli generate \
  -i ../myapp-bff/src/main/resources/openapi/myapp-bff-openapi.yaml \
  -g typescript-angular \
  -o src/app/shared/generated
```

**7. Implement Angular Component:**

**my-resource-list.component.ts**
```typescript
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MyResource, MyResourceSearchCriteria } from '../../shared/generated';
import { MyResourcesAPIService } from '../../shared/generated';

@Component({
  selector: 'app-my-resource-list',
  templateUrl: './my-resource-list.component.html',
  styleUrls: ['./my-resource-list.component.scss']
})
export class MyResourceListComponent implements OnInit {
  resources$: Observable<MyResource[]>;
  loading = false;
  
  searchCriteria: MyResourceSearchCriteria = {
    pageNumber: 0,
    pageSize: 10
  };
  
  constructor(private myResourceApi: MyResourcesAPIService) {}
  
  ngOnInit() {
    this.loadResources();
  }
  
  loadResources() {
    this.loading = true;
    this.resources$ = this.myResourceApi.searchMyResources({
      myResourceSearchCriteria: this.searchCriteria
    }).pipe(
      map(result => result.stream || []),
      finalize(() => this.loading = false)
    );
  }
  
  onSearch(name: string) {
    this.searchCriteria.name = name;
    this.loadResources();
  }
}
```

**my-resource-list.component.html**
```html
<ocx-portal-page
  [permission]="'MYRESOURCE#VIEW'"
  [helpArticleId]="'myresource-list'"
>
  <ocx-page-header
    [header]="'MY_RESOURCES.LIST.HEADER' | translate"
    [subheader]="'MY_RESOURCES.LIST.SUBHEADER' | translate"
  >
    <button
      ocxButton
      [label]="'ACTIONS.CREATE' | translate"
      icon="pi pi-plus"
      (click)="onCreate()"
      *ngIf="'MYRESOURCE#CREATE' | hasPermission"
    ></button>
  </ocx-page-header>
  
  <ocx-page-content>
    <ocx-search-header
      [searchConfig]="searchConfig"
      (search)="onSearch($event)"
      (reset)="onReset()"
    ></ocx-search-header>
    
    <ocx-data-table
      [data]="resources$ | async"
      [columns]="columns"
      [actions]="actions"
      [loading]="loading"
      [paginator]="true"
      [rows]="searchCriteria.pageSize"
      (page)="onPageChange($event)"
    ></ocx-data-table>
  </ocx-page-content>
</ocx-portal-page>
```

### Testing

**Backend Testing:**

**MyResourceRestControllerTest.java**
```java
@QuarkusTest
@TestHTTPEndpoint(MyResourceRestController.class)
class MyResourceRestControllerTest extends AbstractTest {
    
    @InjectMockServerClient
    MockServerClient mockServerClient;
    
    @Test
    void searchMyResourcesTest() {
        // Prepare mock data
        MyResourceSearchCriteria criteria = new MyResourceSearchCriteria();
        criteria.setPageSize(10);
        
        MyResource resource1 = new MyResource()
            .id("1")
            .name("Resource 1")
            .description("Test resource");
        
        MyResourcePageResult result = new MyResourcePageResult()
            .totalElements(1L)
            .size(10)
            .stream(List.of(resource1));
        
        // Mock backend service
        mockServerClient
            .when(request()
                .withPath("/internal/myresources/search")
                .withMethod(HttpMethod.POST))
            .respond(response()
                .withStatusCode(200)
                .withContentType(MediaType.APPLICATION_JSON)
                .withBody(JsonBody.json(result)));
        
        // Test
        var response = given()
            .auth().oauth2(keycloakClient.getAccessToken(ADMIN))
            .contentType(APPLICATION_JSON)
            .body(criteria)
            .post("/search")
            .then()
            .statusCode(200)
            .extract().as(MyResourcePageResultDTO.class);
        
        assertThat(response.getTotalElements()).isEqualTo(1L);
        assertThat(response.getStream()).hasSize(1);
    }
}
```

**Code Purpose - Quarkus Integration Testing**:

**Why Integration Tests?**
- Tests real HTTP endpoints (not mocked)
- Validates request/response serialization
- Catches integration issues early
- Tests with real database (Testcontainers)
- Verifies authentication and authorization

**What It Tests**:
- REST endpoint behavior
- HTTP status codes
- JSON serialization/deserialization
- Database queries and transactions
- Error handling and validation

**How It Works**:
- `@QuarkusTest`: Starts Quarkus app in test mode
- `@TestHTTPEndpoint`: Base URL for controller
- `given().when().then()`: REST-assured fluent API
- `contentType/accept`: HTTP headers
- `statusCode()`: Validates response code
- `extract().as()`: Deserializes response to DTO

**Test Database**: Quarkus automatically starts PostgreSQL Testcontainer for each test run.

**When to Use**: Write integration tests for every REST controller to ensure APIs work end-to-end.

**Frontend Testing:**

**Code Purpose - Angular Component Testing**:

**Code Purpose - Angular Component Testing**:

**Why Component Tests?**
- Isolate component logic from external dependencies
- Fast execution (no HTTP calls)
- Verify component behavior without full app
- Test user interactions and state changes

**What It Tests**:
- Component initialization (ngOnInit)
- Service method calls
- Observable subscriptions
- Data binding and transformations
- User interactions (clicks, inputs)

**How It Works**:
- `TestBed`: Angular testing module configuration
- `jasmine.createSpyObj`: Mock service dependencies
- `and.returnValue(of())`: Stub service responses
- `fixture.componentInstance`: Access component
- `expect().toHaveBeenCalled()`: Verify method calls
- Observable testing with subscription assertions

**Pattern**:
```
1. Create spy for service
2. Configure TestBed with spy
3. Create component fixture
4. Stub service responses
5. Trigger component method
6. Assert expectations
```

**When to Use**: Write unit tests for every component to ensure logic correctness before integration.

**my-resource-list.component.spec.ts**
```typescript
describe('MyResourceListComponent', () => {
  let component: MyResourceListComponent;
  let fixture: ComponentFixture<MyResourceListComponent>;
  let myResourceApiSpy: jasmine.SpyObj<MyResourcesAPIService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('MyResourcesAPIService', ['searchMyResources']);
    
    TestBed.configureTestingModule({
      declarations: [MyResourceListComponent],
      providers: [
        { provide: MyResourcesAPIService, useValue: spy }
      ]
    });
    
    fixture = TestBed.createComponent(MyResourceListComponent);
    component = fixture.componentInstance;
    myResourceApiSpy = TestBed.inject(MyResourcesAPIService) as jasmine.SpyObj<MyResourcesAPIService>;
  });
  
  it('should load resources on init', () => {
    const mockResult: MyResourcePageResult = {
      totalElements: 1,
      size: 10,
      stream: [
        { id: '1', name: 'Resource 1', description: 'Test' }
      ]
    };
    
    myResourceApiSpy.searchMyResources.and.returnValue(of(mockResult));
    
    component.ngOnInit();
    
    expect(myResourceApiSpy.searchMyResources).toHaveBeenCalled();
    component.resources$.subscribe(resources => {
      expect(resources.length).toBe(1);
      expect(resources[0].name).toBe('Resource 1');
    });
  });
});
```

---

## Deployment and Operations

**Code Purpose - Containerization Strategy**:

**Why Docker Containers?**
- Consistent environment across dev/test/prod
- Easy deployment to Kubernetes
- Resource isolation and limits
- Standard OneCX base images with security patches

**Two Build Modes**:
1. **JVM Mode**: Faster build (~2 min), larger image (~200MB)
2. **Native Mode**: Slower build (~10 min), smaller image (~50MB), faster startup

**What Base Images Provide**:
- Java runtime (JVM) or native runtime
- Security patches and updates
- Standard user (non-root: 1001)
- Health check endpoints
- Logging configuration

**How Docker Build Works**:
```
Maven/Gradle builds application
        ↓
Quarkus creates quarkus-app/ directory
        ↓
Dockerfile copies to /deployments/
        ↓
Base image provides runtime
        ↓
Exposes port 8080
        ↓
Runs as non-root user (security)
```

**When to Use**:
- **JVM**: Development, most production deployments
- **Native**: High-scale production, serverless, fast startup needs

### Docker Build

**Dockerfile.jvm** (for JVM mode)
```dockerfile
FROM ghcr.io/onecx/docker-quarkus-jvm:latest

COPY --chown=1001:0 target/quarkus-app/lib/ /deployments/lib/
COPY --chown=1001:0 target/quarkus-app/*.jar /deployments/
COPY --chown=1001:0 target/quarkus-app/app/ /deployments/app/
COPY --chown=1001:0 target/quarkus-app/quarkus/ /deployments/quarkus/

EXPOSE 8080
USER 1001

ENV JAVA_OPTS_APPEND="-Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"
```

**Dockerfile.native** (for native mode)
```dockerfile
FROM ghcr.io/onecx/docker-quarkus-native:latest

WORKDIR /work/
COPY --chown=1001:0 target/*-runner /work/application

EXPOSE 8080
USER 1001

CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
```

**Build and Push:**
```bash
# JVM mode
mvn clean package -Dquarkus.container-image.build=true \
  -Dquarkus.container-image.push=true \
  -Dquarkus.container-image.registry=ghcr.io \
  -Dquarkus.container-image.group=mycompany \
  -Dquarkus.container-image.name=myapp-svc \
  -Dquarkus.container-image.tag=1.0.0

# Native mode (longer build time, smaller image)
mvn clean package -Pnative \
  -Dquarkus.native.container-build=true \
  -Dquarkus.container-image.build=true \
  -Dquarkus.container-image.push=true
```

### Helm Deployment

**Chart.yaml**
```yaml
apiVersion: v2
name: myapp
version: 1.0.0
appVersion: 1.0.0
description: MyApp OneCX Application

dependencies:
  - name: helm-quarkus-app
    version: 0.4.0
    repository: oci://ghcr.io/onecx/charts
    alias: svc
  - name: helm-quarkus-app
    version: 0.4.0
    repository: oci://ghcr.io/onecx/charts
    alias: bff
  - name: helm-angular-app
    version: 0.4.0
    repository: oci://ghcr.io/onecx/charts
    alias: ui
```

**values.yaml**
```yaml
# Service Configuration
svc:
  enabled: true
  app:
    name: myapp-svc
    image:
      registry: ghcr.io
      repository: mycompany/myapp-svc
      tag: 1.0.0
    db:
      enabled: true
      name: myapp
    envCustom:
      - name: QUARKUS_DATASOURCE_JDBC_MAX_SIZE
        value: "30"
      - name: QUARKUS_HIBERNATE_ORM_MULTITENANT
        value: DISCRIMINATOR
  
# BFF Configuration
bff:
  enabled: true
  app:
    name: myapp-bff
    image:
      registry: ghcr.io
      repository: mycompany/myapp-bff
      tag: 1.0.0
    envCustom:
      - name: QUARKUS_REST_CLIENT_MYAPP_SVC_URL
        value: http://myapp-svc:8080
      - name: QUARKUS_OIDC_CLIENT_ID
        value: myapp-bff
    operator:
      permission:
        enabled: true
        spec:
          appId: myapp
          productName: myapp
          permissions:
            MYRESOURCE:
              CREATE: {}
              READ: {}
              UPDATE: {}
              DELETE: {}

# UI Configuration
ui:
  enabled: true
  app:
    name: myapp-ui
    image:
      registry: ghcr.io
      repository: mycompany/myapp-ui
      tag: 1.0.0
    operator:
      microfrontend:
        enabled: true
        spec:
          appId: myapp
          appName: MyApp
          remoteEntry: remoteEntry.js
          exposedModule: "./Module"
          type: MODULE
          technology: ANGULAR
          endpoints:
            - name: bff
              path: /bff/myapp
              url: http://myapp-bff:8080
```

**Deploy:**
```bash
# Install
helm install myapp ./helm \
  --namespace onecx \
  --create-namespace

# Upgrade
helm upgrade myapp ./helm \
  --namespace onecx

# Uninstall
helm uninstall myapp --namespace onecx
```

### CI/CD Pipeline

**GitHub Actions Workflow:**

**.github/workflows/build.yml**
```yaml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven
      
      - name: Build with Maven
        run: mvn clean verify
      
      - name: Run tests
        run: mvn test
      
      - name: SonarCloud Scan
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        run: mvn sonar:sonar
  
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: myapp-ui/package-lock.json
      
      - name: Install dependencies
        working-directory: myapp-ui
        run: npm ci
      
      - name: Lint
        working-directory: myapp-ui
        run: npm run lint
      
      - name: Test
        working-directory: myapp-ui
        run: npm run test:ci
      
      - name: Build
        working-directory: myapp-ui
        run: npm run build
```

**.github/workflows/release.yml**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  docker:
    uses: onecx/ci-common/.github/workflows/docker-release.yml@v1
    secrets: inherit
  
  helm:
    uses: onecx/ci-common/.github/workflows/helm-release.yml@v1
    needs: docker
    secrets: inherit
  
  changelog:
    uses: onecx/ci-common/.github/workflows/generate-changelog.yml@v1
    needs: helm
    secrets: inherit
```

### Kubernetes Operators

**Registering with Operators:**

Once deployed, the Kubernetes operators automatically:

1. **Register Microfrontend** in Product Store
2. **Create Permissions** in Permission Management
3. **Configure Database** schema

**Microfrontend CRD:**
```yaml
apiVersion: onecx.tkit.org/v1
kind: Microfrontend
metadata:
  name: myapp-mfe
  namespace: onecx
spec:
  appId: myapp
  appName: MyApp
  productName: myapp
  version: 1.0.0
  remoteBaseUrl: http://myapp-ui:8080
  remoteEntry: remoteEntry.js
  exposedModule: ./Module
  type: MODULE
  technology: ANGULAR
```

**Permission CRD:**
```yaml
apiVersion: onecx.tkit.org/v1
kind: Permission
metadata:
  name: myapp-permissions
  namespace: onecx
spec:
  appId: myapp
  productName: myapp
  permissions:
    MYRESOURCE#CREATE:
      description: Create MyResource
      resource: MYRESOURCE
      action: CREATE
    MYRESOURCE#READ:
      description: Read MyResource
      resource: MYRESOURCE
      action: READ
    MYRESOURCE#UPDATE:
      description: Update MyResource
      resource: MYRESOURCE
      action: UPDATE
    MYRESOURCE#DELETE:
      description: Delete MyResource
      resource: MYRESOURCE
      action: DELETE
```

**Check Status:**
```bash
# Check microfrontend registration
kubectl get microfrontends -n onecx

# Check permission creation
kubectl get permissions -n onecx

# View details
kubectl describe microfrontend myapp-mfe -n onecx
```

### Monitoring and Observability

**Prometheus Metrics:**

OneCX services expose Prometheus metrics at `/q/metrics`:

```properties
# Enable metrics
quarkus.micrometer.enabled=true
quarkus.micrometer.export.prometheus.enabled=true
quarkus.micrometer.binder.http-server.enabled=true
quarkus.micrometer.binder.jvm.enabled=true
```

**Custom Metrics:**
```java
@ApplicationScoped
public class MyResourceService {
    
    @Inject
    MeterRegistry registry;
    
    private Counter resourceCreations;
    private Timer resourceSearchTimer;
    
    @PostConstruct
    void init() {
        resourceCreations = registry.counter("myapp.resources.created");
        resourceSearchTimer = registry.timer("myapp.resources.search.time");
    }
    
    @Transactional
    public MyResource createResource(CreateResourceDTO dto) {
        MyResource resource = mapper.create(dto);
        resource = dao.create(resource);
        
        // Increment counter
        resourceCreations.increment();
        
        return resource;
    }
    
    public PageResult<MyResource> searchResources(SearchCriteria criteria) {
        // Time the search operation
        return resourceSearchTimer.record(() -> 
            dao.findByCriteria(criteria)
        );
    }
}
```

**Jaeger Tracing:**

```properties
# Enable tracing
quarkus.opentelemetry.enabled=true
quarkus.opentelemetry.tracer.exporter.otlp.endpoint=http://jaeger:4317
```

**Grafana Dashboards:**

OneCX provides pre-built Grafana dashboards for:
- Application metrics (requests, response times, errors)
- JVM metrics (heap, threads, GC)
- Database metrics (connection pool, query times)
- Business metrics (user actions, resource usage)

---

## Real-World Use Cases

### Use Case 1: Multi-Brand Enterprise Portal

**Scenario:**
A global conglomerate with multiple brands (Insurance, Banking, Retail) needs a unified platform while maintaining brand identities.

**Solution:**
```
Brands (Tenants):
├── Insurance (tenant-insurance)
│   ├── Workspace: Insurance Admin
│   │   ├── Theme: Blue corporate theme
│   │   ├── Apps: Policy Management, Claims, Underwriting
│   │   └── Menu: Customized for insurance operations
│   └── Workspace: Insurance Sales
│       ├── Theme: Customer-facing blue theme
│       └── Apps: Quote Engine, Customer Portal
├── Banking (tenant-banking)
│   ├── Workspace: Banking Admin
│   │   ├── Theme: Green banking theme
│   │   └── Apps: Account Management, Loan Processing
│   └── Workspace: Banking Customer
│       └── Apps: Online Banking, Investment Portal
└── Retail (tenant-retail)
    └── Workspace: Retail Operations
        ├── Theme: Red retail theme
        └── Apps: Inventory, POS, Customer Management
```

**Benefits:**
- Single infrastructure, multiple brands
- Isolated data per tenant
- Brand-specific themes and configurations
- Shared development team
- Centralized user management with federated identity

### Use Case 2: Scaled Agile Development

**Scenario:**
A large enterprise with 10 development teams building different business applications.

**Team Structure:**
```
Team 1: User Management (onecx-iam)
├── 3 developers
├── Own Git repository
├── Independent CI/CD pipeline
└── Deploys: IAM UI, BFF, SVC

Team 2: Document Management (onecx-document)
├── 4 developers
├── Own deployment schedule
└── Consumes: IAM for user authentication

Team 3: Workflow Engine (onecx-workflow)
├── 5 developers
├── Different technology stack (React instead of Angular)
└── Integrates via: Microfrontend Web Component

... (7 more teams)
```

**Benefits:**
- Parallel development without coordination overhead
- Independent deployment cycles
- Technology flexibility per team
- Shared infrastructure and common services
- Automatic integration via Product Store

### Use Case 3: Gradual Legacy Modernization

**Scenario:**
A bank modernizing a 20-year-old monolithic application gradually.

**Migration Strategy:**
```
Phase 1: Extract User Management
├── Keep legacy app running
├── Build new: onecx-iam (UI, BFF, SVC)
├── Redirect: /users → new IAM microfrontend
└── Legacy app calls IAM API for authentication

Phase 2: Extract Customer Management
├── Build: onecx-customer
├── Migrate data incrementally
├── Legacy and new system run in parallel
└── Phase out legacy customer module

Phase 3-10: Continue extracting modules
└── Eventually: Complete modernization
```

**Benefits:**
- No "big bang" migration
- Reduce risk with incremental approach
- Business continuity maintained
- Learn and adapt during migration
- Modern and legacy coexist

### Use Case 4: SaaS Product Platform

**Scenario:**
A software vendor offering a SaaS platform to multiple customers.

**Architecture:**
```
Platform (Multi-tenant)
├── Customer A (tenant-customerA)
│   ├── 500 users
│   ├── Custom theme
│   ├── Custom workflows
│   └── Industry: Healthcare
├── Customer B (tenant-customerB)
│   ├── 2000 users
│   ├── Standard theme
│   └── Industry: Finance
└── Customer C (tenant-customerC)
    ├── 100 users
    ├── Custom integrations
    └── Industry: Retail

All sharing:
- Same infrastructure
- Same application versions
- Same Kubernetes cluster
- Isolated data
```

**Billing Model:**
- Base price per tenant
- Per-user pricing
- Feature-based pricing (enable/disable apps per tenant)
- Usage-based pricing (API calls, storage)

**Benefits:**
- Cost-effective infrastructure
- Easy to onboard new customers
- Consistent updates across all customers
- Data isolation and security
- Scalable business model

### Use Case 5: Partner Ecosystem

**Scenario:**
A company integrating applications from multiple partners into a unified portal.

**Partners:**
```
Main Company (Platform Owner)
├── Core Apps: Authentication, User Profile, Notifications
└── Provides: Shell, Infrastructure, Common Services

Partner 1 (CRM Vendor)
├── Provides: CRM Microfrontend
├── Technology: Angular
└── Integration: Via Product Store API

Partner 2 (Analytics Vendor)
├── Provides: Analytics Dashboard
├── Technology: React
└── Integration: Web Component

Partner 3 (Document Management)
├── Provides: DMS Microfrontend
├── Technology: Vue.js
└── Integration: Custom wrapper

Internal Team
├── Develops: Industry-specific applications
└── Uses: All partner applications
```

**Benefits:**
- Ecosystem of integrated applications
- Best-of-breed approach
- Flexible vendor relationships
- Technology diversity
- Unified user experience

---

## Best Practices

### 1. API Design

**OpenAPI First:**
Always define OpenAPI specifications before implementation:

```yaml
# Good: Clear, versioned, documented API
openapi: 3.0.3
info:
  title: Bookmark API
  version: 2.0.0
  description: |
    API for managing user bookmarks.
    
    ## Change History
    - 2.0.0: Added support for folders
    - 1.0.0: Initial release

paths:
  /bookmarks:
    post:
      summary: Search bookmarks
      description: Search bookmarks with pagination and filtering
      tags: [Bookmarks]
      operationId: searchBookmarks
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BookmarkSearchCriteria'
      responses:
        '200':
          description: Successful search
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookmarkPageResult'
        '400':
          $ref: '#/components/responses/BadRequest'
```

**Versioning:**
- Use API versioning (v1, v2)
- Maintain backward compatibility within a major version
- Deprecate old versions gracefully

**Error Handling:**
Use RFC 7807 Problem Details:

```json
{
  "type": "https://api.mycompany.com/problems/constraint-violation",
  "title": "Constraint Violation",
  "status": 400,
  "detail": "Bookmark name is required",
  "instance": "/bookmarks",
  "invalidParams": [
    {
      "name": "name",
      "message": "must not be blank"
    }
  ]
}
```

### 2. Security

**Always Use BFF:**
Never expose backend services directly to the internet:

```
✓ Good:
UI → BFF (auth, permission check) → Service

✗ Bad:
UI → Service (no security layer)
```

**Token Handling:**
```java
// Good: Token is validated and permissions checked
@POST
@RolesAllowed("user")
@PermissionRequired("BOOKMARK#CREATE")
public Response createBookmark(CreateBookmarkDTO dto) {
    // Implementation
}

// Bad: No security
@POST
public Response createBookmark(CreateBookmarkDTO dto) {
    // Anyone can call this!
}
```

**Secrets Management:**
```properties
# Good: Use environment variables
quarkus.datasource.username=${DB_USERNAME}
quarkus.datasource.password=${DB_PASSWORD}
quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET}

# Bad: Hardcoded secrets
# quarkus.datasource.password=admin123
```

### 3. Performance

**Database Query Optimization:**
```java
// Good: Paginated query with proper indexing
public PageResult<Bookmark> findByCriteria(BookmarkSearchCriteria criteria) {
    CriteriaQuery<Bookmark> cq = criteriaQuery();
    Root<Bookmark> root = cq.from(Bookmark.class);
    
    // Build predicates
    List<Predicate> predicates = buildPredicates(root, criteria);
    cq.where(predicates.toArray(new Predicate[0]));
    
    // Pagination
    return createPageQuery(cq, criteria).getPageResult();
}

// Bad: Load all data
public List<Bookmark> getAllBookmarks() {
    return em.createQuery("SELECT b FROM Bookmark b", Bookmark.class)
        .getResultList(); // Could be millions!
}
```

**Caching:**
```java
// Good: Cache frequently accessed data
@CacheResult(cacheName = "themes")
public Theme getThemeById(String id) {
    return themeDAO.findById(id);
}

@CacheInvalidate(cacheName = "themes")
public void updateTheme(String id, UpdateThemeDTO dto) {
    // Update logic
}
```

**Lazy Loading:**
```typescript
// Good: Lazy load microfrontends
const routes: Routes = [
  {
    path: 'bookmark',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://bookmark-ui/remoteEntry.js',
      exposedModule: './Module'
    })
  }
];

// Bad: Load everything upfront
// import { BookmarkModule } from './bookmark/bookmark.module';
```

### 4. Error Handling

**Graceful Degradation:**
```typescript
// Good: Handle errors gracefully
export class BookmarkService {
  getBookmarks(): Observable<Bookmark[]> {
    return this.http.get<Bookmark[]>('/api/bookmarks').pipe(
      catchError(error => {
        console.error('Failed to load bookmarks', error);
        this.msgService.error({ summaryKey: 'ERRORS.LOAD_BOOKMARKS' });
        return of([]); // Return empty array instead of breaking
      })
    );
  }
}

// Bad: Let errors propagate
// return this.http.get<Bookmark[]>('/api/bookmarks');
```

**Retry Logic:**
```java
// Good: Retry with exponential backoff
@Retry(maxRetries = 3, delay = 1000, maxDuration = 10000)
@Fallback(fallbackMethod = "fallbackGetUser")
public User getUser(String id) {
    return userClient.getUser(id);
}

public User fallbackGetUser(String id) {
    // Return cached data or default
    return userCache.get(id).orElse(createGuestUser());
}
```

### 5. Testing

**Test Pyramid:**
```
        /\
       /  \      E2E Tests (few, expensive)
      /____\
     /      \    Integration Tests (moderate)
    /________\
   /          \  Unit Tests (many, fast)
  /____________\
```

**Unit Tests:**
```java
@Test
void shouldCreateBookmark() {
    // Arrange
    CreateBookmarkDTO dto = new CreateBookmarkDTO()
        .name("GitHub")
        .url("https://github.com");
    
    Bookmark bookmark = new Bookmark();
    bookmark.setId(UUID.randomUUID().toString());
    when(dao.create(any())).thenReturn(bookmark);
    
    // Act
    Response response = controller.createBookmark(dto);
    
    // Assert
    assertEquals(201, response.getStatus());
    verify(dao).create(any());
}
```

**Integration Tests:**
```java
@QuarkusTest
class BookmarkRestControllerIT {
    @Test
    void shouldCreateBookmarkViaAPI() {
        given()
            .auth().oauth2(getToken())
            .contentType(APPLICATION_JSON)
            .body(new CreateBookmarkDTO()
                .name("Test")
                .url("https://test.com"))
            .post("/bookmarks")
            .then()
            .statusCode(201)
            .body("name", equalTo("Test"));
    }
}
```

### 6. Documentation

**Code Documentation:**
```java
/**
 * Searches bookmarks based on criteria.
 * 
 * @param criteria Search criteria containing filters and pagination
 * @return PageResult containing matching bookmarks
 * @throws DAOException if database query fails
 * 
 * @example
 * BookmarkSearchCriteria criteria = new BookmarkSearchCriteria();
 * criteria.setUserId("user123");
 * criteria.setPageSize(10);
 * PageResult<Bookmark> results = dao.findByCriteria(criteria);
 */
public PageResult<Bookmark> findByCriteria(BookmarkSearchCriteria criteria) {
    // Implementation
}
```

**API Documentation:**
Use OpenAPI/Swagger with examples:

```yaml
components:
  schemas:
    Bookmark:
      type: object
      required: [name, url]
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        name:
          type: string
          minLength: 1
          maxLength: 255
          example: "GitHub"
        url:
          type: string
          format: uri
          example: "https://github.com"
```

**Antora Documentation:**
Maintain comprehensive documentation:

```
docs/
└── modules/
    └── myapp/
        ├── pages/
        │   ├── index.adoc          # Overview
        │   ├── getting-started.adoc
        │   ├── user-guide.adoc
        │   └── api-reference.adoc
        └── images/
            └── architecture-diagram.png
```

---

## Technical Reference

### OneCX Libraries

**Quarkus Extensions:**
- `onecx-quarkus` - Core Quarkus extensions
- `onecx-tenant` - Multi-tenancy support
- `onecx-parameters` - Parameter management
- `onecx-operator` - Kubernetes operator utilities

**Angular Libraries:**
- `@onecx/angular-integration-interface` - Shell integration
- `@onecx/angular-accelerator` - UI components
- `@onecx/portal-integration-angular` - Portal integration
- `@onecx/angular-remote-components` - Remote component utilities
- `@onecx/angular-auth` - Authentication
- `@onecx/angular-webcomponents` - Web component wrapper

### Configuration Properties

**Common Quarkus Properties:**
```properties
# Server
quarkus.http.port=8080
quarkus.http.host=0.0.0.0

# Database
quarkus.datasource.db-kind=postgresql
quarkus.datasource.jdbc.url=${DB_URL}
quarkus.datasource.username=${DB_USERNAME}
quarkus.datasource.password=${DB_PASSWORD}
quarkus.hibernate-orm.database.generation=none
quarkus.liquibase.migrate-at-start=true

# Multi-tenancy
quarkus.hibernate-orm.multitenant=DISCRIMINATOR
tkit.rs.context.tenant-id.enabled=true

# Authentication
quarkus.oidc.auth-server-url=${KEYCLOAK_URL}/realms/onecx
quarkus.oidc.client-id=${CLIENT_ID}
quarkus.oidc.credentials.secret=${CLIENT_SECRET}

# Logging
quarkus.log.level=INFO
quarkus.log.console.format=%d{HH:mm:ss} %-5p [%c{2.}] (%t) %s%e%n

# Metrics
quarkus.micrometer.enabled=true
quarkus.micrometer.export.prometheus.enabled=true

# Tracing
quarkus.opentelemetry.enabled=true
```

### REST Client Configuration

```properties
# Define REST clients
quarkus.rest-client.bookmark-svc.url=http://onecx-bookmark-svc:8080
quarkus.rest-client.bookmark-svc.scope=javax.inject.Singleton

# Timeouts
quarkus.rest-client.bookmark-svc.connect-timeout=5000
quarkus.rest-client.bookmark-svc.read-timeout=30000

# Logging
quarkus.rest-client.logging.scope=request-response
quarkus.rest-client.logging.body-limit=1024
```

### Environment Variables

**Standard OneCX Environment Variables:**
```bash
# Database
DB_URL=jdbc:postgresql://postgres:5432/onecx
DB_USERNAME=onecx
DB_PASSWORD=<secret>

# Authentication
KEYCLOAK_URL=http://keycloak:8080
CLIENT_ID=onecx-bookmark-bff
CLIENT_SECRET=<secret>

# Multi-tenancy
ONECX_TENANT_ENABLED=true
ONECX_TENANT_DEFAULT_ID=default

# Logging
JSON_LOGGER_ENABLED=true
LOG_LEVEL=INFO

# Feature Flags
FEATURE_BOOKMARKS_ENABLED=true
FEATURE_FOLDERS_ENABLED=false
```

### Database Schema

**Standard Tables:**
```sql
-- Trackable base columns (in every entity)
CREATE TABLE my_entity (
    guid VARCHAR(255) PRIMARY KEY,
    creation_date TIMESTAMP,
    creation_user VARCHAR(255),
    modification_date TIMESTAMP,
    modification_user VARCHAR(255),
    optlock INTEGER,
    tenant_id VARCHAR(255),  -- Multi-tenancy discriminator
    
    -- Entity-specific columns
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50)
);

-- Indexes
CREATE INDEX idx_my_entity_tenant ON my_entity(tenant_id);
CREATE INDEX idx_my_entity_name ON my_entity(name);
CREATE INDEX idx_my_entity_status ON my_entity(status);
```

**Liquibase Changelog:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">
    
    <changeSet id="1.0.0-create-my-entity" author="developer">
        <createTable tableName="my_entity">
            <column name="guid" type="VARCHAR(255)">
                <constraints primaryKey="true"/>
            </column>
            <column name="creation_date" type="TIMESTAMP"/>
            <column name="creation_user" type="VARCHAR(255)"/>
            <column name="modification_date" type="TIMESTAMP"/>
            <column name="modification_user" type="VARCHAR(255)"/>
            <column name="optlock" type="INTEGER"/>
            <column name="tenant_id" type="VARCHAR(255)"/>
            <column name="name" type="VARCHAR(255)">
                <constraints nullable="false"/>
            </column>
            <column name="description" type="TEXT"/>
            <column name="status" type="VARCHAR(50)"/>
        </createTable>
        
        <createIndex tableName="my_entity" indexName="idx_my_entity_tenant">
            <column name="tenant_id"/>
        </createIndex>
    </changeSet>
</databaseChangeLog>
```

---

## Summary

OneCX is a comprehensive enterprise platform that enables:

1. **Rapid Development**: Standardized project structure, generators, and libraries
2. **Scalability**: Microservices and microfrontends architecture
3. **Multi-Tenancy**: Secure data isolation for multiple customers
4. **Flexibility**: Technology diversity and independent deployment
5. **Enterprise Features**: RBAC, themes, workspaces, audit trails
6. **DevOps Excellence**: CI/CD automation, Kubernetes operators, monitoring
7. **Developer Experience**: Excellent documentation, tooling, and community

### Key Takeaways for Developers

- **Start with the Shell**: Understanding the Shell is key to understanding OneCX
- **Follow the BFF Pattern**: Always use BFF for security and API aggregation
- **Use Operators**: Leverage Kubernetes operators for automation
- **Test Thoroughly**: Unit, integration, and E2E tests are essential
- **Document Everything**: Code, APIs, and architecture
- **Monitor Actively**: Use metrics, tracing, and logging
- **Security First**: Always implement proper authentication and authorization

### Next Steps

1. Set up local development environment
2. Create a sample application following the guide
3. Read the specific component documentation
4. Join the OneCX community
5. Contribute to the project

### Resources

- **Documentation**: https://onecx.github.io/docs/
- **GitHub**: https://github.com/onecx
- **Docker Images**: https://github.com/orgs/onecx/packages
- **Helm Charts**: oci://ghcr.io/onecx/charts

---

**Document Version:** 1.0.0  
**Last Updated:** February 2026  
**License:** Apache 2.0

