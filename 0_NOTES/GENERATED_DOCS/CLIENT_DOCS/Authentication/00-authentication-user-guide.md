# OneCX Authentication Guide

## A User's Guide to Understanding How Login and Sessions Work

---

## Document Information

| Property | Value |
|----------|-------|
| **Version** | 1.0.0 |
| **Created** | April 22, 2026 |
| **Target Audience** | End Users, System Administrators, Business Analysts |
| **Prerequisites** | Basic understanding of web applications |

---

## Table of Contents

1. [What is Authentication?](#1-what-is-authentication)
2. [How OneCX Login Works](#2-how-onecx-login-works)
3. [Understanding Your Session](#3-understanding-your-session)
4. [Common Scenarios](#4-common-scenarios)
5. [Troubleshooting](#5-troubleshooting)
6. [Administrator Guide](#6-administrator-guide)
7. [Security Best Practices](#7-security-best-practices)
8. [Frequently Asked Questions](#8-frequently-asked-questions)

---

# 1. What is Authentication?

## 1.1 Simple Explanation

**Authentication** is the process of proving who you are to a computer system. Just like showing your ID card to enter a secure building, authentication verifies your identity before giving you access to OneCX.

When you log in to OneCX, you're telling the system "I am [your username], and here's my password to prove it."

## 1.2 Why We Need Authentication

| Reason | Benefit to You |
|--------|----------------|
| **Security** | Only you can access your account and data |
| **Privacy** | Your information stays private from others |
| **Accountability** | Actions are tracked to the right person |
| **Customization** | System knows your preferences and permissions |

## 1.3 The Login Process Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Your Login Journey                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. You open OneCX          →  Website loads                        │
│                                                                      │
│  2. System checks           →  "Are you already logged in?"         │
│     If YES → Go to step 6                                           │
│     If NO  → Continue to step 3                                     │
│                                                                      │
│  3. Login page appears      →  You enter username & password        │
│                                                                      │
│  4. System verifies         →  Checks if credentials are correct    │
│     If CORRECT → Continue                                           │
│     If WRONG   → Show error, try again                              │
│                                                                      │
│  5. Session created         →  You get a "digital pass"             │
│                                                                      │
│  6. Access granted          →  You can use OneCX!                   │
│                                                                      │
│  7. Time passes...          →  System keeps your session active     │
│                                                                      │
│  8. You log out / timeout   →  Session ends, return to step 1       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 1.4 What is Keycloak?

OneCX uses a system called **Keycloak** to manage logins. Think of Keycloak as a trusted security guard:

- It checks your credentials
- It remembers that you're logged in
- It keeps your session secure
- It logs you out when necessary

You don't interact with Keycloak directly - it works behind the scenes. When you see a login page, that's Keycloak doing its job.

---

# 2. How OneCX Login Works

## 2.1 Step-by-Step Login Process

### Step 1: Opening OneCX

When you open OneCX in your web browser:
1. The application loads
2. It checks if you're already logged in
3. If you have a valid session, you'll see the main application
4. If not, you'll be redirected to the login page

### Step 2: The Login Page

The login page is provided by Keycloak. Here's what you'll see:

```
┌─────────────────────────────────────────┐
│           Welcome to OneCX              │
│                                         │
│  Username: [________________]           │
│                                         │
│  Password: [________________]           │
│                                         │
│  [ ] Remember me                        │
│                                         │
│         [  Log In  ]                    │
│                                         │
│  Forgot password?                       │
└─────────────────────────────────────────┘
```

### Step 3: Entering Your Credentials

- **Username**: Usually your email or employee ID
- **Password**: Your secure password

> **Tip**: If you've forgotten your password, click "Forgot password?" to reset it.

### Step 4: Successful Login

After entering correct credentials:
1. Keycloak verifies your identity
2. Creates a secure session for you
3. Redirects you back to OneCX
4. You can now use all features you have access to

### Step 5: Working in OneCX

While you work:
- Your session is automatically maintained
- The system keeps you logged in as long as you're active
- You don't need to log in again for each action

## 2.2 Single Sign-On (SSO)

### What is SSO?

**Single Sign-On** means you log in once and can access multiple applications without logging in again.

**Example**: 
- You log in to OneCX at 9:00 AM
- You then open another connected application
- You're automatically logged in there too - no need to enter password again!

### How SSO Works

```
┌────────────────────────────────────────────────────────────────────┐
│                  Single Sign-On Experience                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   9:00 AM - Log in to OneCX                                        │
│   ┌──────────┐                                                     │
│   │ OneCX    │  ←→  Keycloak (login)                               │
│   └──────────┘                                                     │
│        ↓                                                            │
│   Session Created ✓                                                 │
│                                                                     │
│   10:00 AM - Open Related App                                      │
│   ┌──────────┐                                                     │
│   │ App #2   │  ←→  Keycloak ("Already logged in!")                │
│   └──────────┘                                                     │
│        ↓                                                            │
│   Automatic Access ✓ (No password needed!)                          │
│                                                                     │
│   11:00 AM - Open Another App                                      │
│   ┌──────────┐                                                     │
│   │ App #3   │  ←→  Keycloak ("Already logged in!")                │
│   └──────────┘                                                     │
│        ↓                                                            │
│   Automatic Access ✓                                                │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Benefits of SSO

| Benefit | What it Means for You |
|---------|----------------------|
| Convenience | Log in once, access everything |
| Fewer passwords | Don't need different passwords for each app |
| Time savings | No repeated login prompts |
| Security | Centralized, strong authentication |

## 2.3 What Happens Behind the Scenes

When you log in, the system:

1. **Verifies your identity** with Keycloak
2. **Issues tokens** (digital passes) that prove you're logged in
3. **Stores tokens securely** in your browser
4. **Uses tokens** for every action you take
5. **Refreshes tokens** automatically to keep you logged in
6. **Expires tokens** for security when you're inactive

> **Think of tokens like a wristband at an amusement park**: Once you get it, you can go on all the rides without buying a new ticket each time. It expires at the end of the day for safety.

---

# 3. Understanding Your Session

## 3.1 What is a Session?

A **session** is the time period during which you're logged in. It starts when you successfully log in and ends when you log out or it expires.

### Session Timeline Example

```
9:00 AM    ────  You log in
                  │
9:30 AM    ────  Working in OneCX
                  │
10:00 AM   ────  Still working (session automatically maintained)
                  │
10:30 AM   ────  Go to lunch (inactive)
                  │
11:00 AM   ────  Session might be refreshed automatically
                  │
12:00 PM   ────  Return from lunch
                  │
                  If session expired → Login again
                  If session active  → Continue working
```

## 3.2 Session Tokens Explained

### Tokens in Simple Terms

| Token Type | Simple Explanation | Analogy |
|------------|-------------------|---------|
| **Access Token** | Proves you can access features | Your building access badge |
| **ID Token** | Contains who you are | Your employee ID card |
| **Refresh Token** | Gets you new access tokens | A stamp that lets you get a new badge |

### How Tokens Work Together

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Token Lifecycle                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LOGIN SUCCESS                                                       │
│       │                                                              │
│       ▼                                                              │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│  │ Access Token    │   │ ID Token        │   │ Refresh Token   │   │
│  │                 │   │                 │   │                 │   │
│  │ Valid: 5-15 min │   │ Valid: 5-15 min │   │ Valid: 30min-8h │   │
│  │                 │   │                 │   │                 │   │
│  │ Used for:       │   │ Used for:       │   │ Used for:       │   │
│  │ API access      │   │ Your identity   │   │ Getting new     │   │
│  │                 │   │                 │   │ access tokens   │   │
│  └────────┬────────┘   └─────────────────┘   └────────┬────────┘   │
│           │                                           │             │
│           ▼                                           │             │
│  ACCESS TOKEN EXPIRES                                 │             │
│           │                                           │             │
│           └──────────── AUTOMATIC REFRESH ◄──────────┘             │
│                               │                                      │
│                               ▼                                      │
│                   NEW ACCESS TOKEN ISSUED                            │
│                   (You don't notice anything!)                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### What You Experience

**You don't see any of this!** The system handles tokens automatically. You just continue working, and the system keeps you logged in seamlessly.

**What you might notice:**
- Occasional brief pauses (token refresh happening)
- Being asked to log in again if you've been away too long

## 3.3 Session Duration

### Typical Session Lengths

| Setting | Typical Value | What it Means |
|---------|--------------|---------------|
| Access Token | 5-15 minutes | How often the system refreshes your "badge" |
| Session Timeout | 30 min - 8 hours | How long until you need to log in again |
| Idle Timeout | 15-30 minutes | How long of inactivity before session ends |

> **Note**: These values are set by your system administrator and may vary.

### Keeping Your Session Active

Your session stays active when you:
- Click buttons or links
- Type in forms
- Navigate between pages
- Load new data

Your session may expire when you:
- Leave the browser idle for too long
- Close all OneCX tabs
- Manually log out
- Your administrator ends your session

## 3.4 Automatic Session Maintenance

OneCX automatically:
1. Checks if your session is still valid
2. Refreshes your access before it expires
3. Keeps you logged in while you're working
4. Logs you out only when necessary

**This all happens in the background** - you don't need to do anything!

---

# 4. Common Scenarios

## 4.1 Normal Day Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    A Normal Day with OneCX                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  8:55 AM  │ Arrive at work, open OneCX                              │
│           │ → Login page appears                                    │
│           │ → Enter username and password                           │
│           │ → Welcome to OneCX!                                     │
│           │                                                         │
│  9:00 AM  │ Start working                                           │
│   to      │ → View dashboards                                       │
│  12:00 PM │ → Edit data                                             │
│           │ → Generate reports                                      │
│           │ (Session automatically maintained)                      │
│           │                                                         │
│  12:00 PM │ Go to lunch, leave browser open                         │
│   to      │ → Session stays active (for a while)                    │
│  1:00 PM  │                                                         │
│           │                                                         │
│  1:00 PM  │ Return from lunch                                       │
│           │ → Click something                                       │
│           │ → System refreshes session automatically                │
│           │ → Continue working!                                     │
│           │                                                         │
│  5:00 PM  │ End of day                                              │
│           │ → Click "Logout"                                        │
│           │ → Session ended securely                                │
│           │                                                         │
└─────────────────────────────────────────────────────────────────────┘
```

## 4.2 Session Expired While Working

**Scenario**: You've been reading a long document without clicking anything. When you try to take an action, you're asked to log in again.

**Why it happened**:
- You were inactive for too long
- The refresh token expired
- For security, the system requires re-authentication

**What to do**:
1. Don't worry - your work before the pause is saved
2. Log in again
3. Continue where you left off

**How to avoid**:
- Take occasional actions (even scrolling helps)
- Save your work frequently if you plan long reading

## 4.3 Unexpected Logout

**Scenario**: You're suddenly taken to the login page without clicking logout.

**Possible reasons**:
1. Session timeout reached
2. Administrator ended your session
3. Network connectivity issues
4. Browser cleared your session data
5. Logged in from another location (single session policy)

**What to do**:
1. Log in again
2. If it keeps happening, contact your administrator

## 4.4 "Something Went Wrong" Errors

**Scenario**: You see an error message related to authentication.

**Common errors and solutions**:

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Session expired" | You were inactive too long | Log in again |
| "Unable to refresh token" | Temporary network issue | Wait a moment, try again |
| "Invalid credentials" | Wrong username/password | Check and re-enter |
| "Account locked" | Too many wrong attempts | Contact administrator |
| "Access denied" | Insufficient permissions | Contact administrator |

## 4.5 Multiple Browser Tabs

**Scenario**: You have OneCX open in multiple tabs.

**How it works**:
- All tabs share the same session
- Actions in one tab don't affect others
- Logging out in one tab logs you out everywhere
- If session expires, all tabs are affected

**Best practices**:
- It's fine to use multiple tabs
- Don't log out if you have unsaved work in other tabs
- If one tab logs you out, refresh other tabs

## 4.6 Different Browsers or Devices

**Scenario**: You want to access OneCX from your phone or different browser.

**How it works**:
- Each browser/device has its own session
- You can be logged in on multiple devices
- Logging out on one doesn't affect others (usually)

**Policy variations** (depends on your organization):
- Some organizations allow multiple sessions
- Some only allow one session at a time
- Ask your administrator about your policy

---

# 5. Troubleshooting

## 5.1 Login Problems

### "Invalid username or password"

**Causes**:
- Typo in username or password
- Caps Lock is on
- Password was recently changed
- Account doesn't exist

**Solutions**:
1. Double-check your username (usually email)
2. Check Caps Lock
3. Try your most recent password
4. Use "Forgot Password" to reset
5. Contact administrator if account is new

### "Account locked"

**Causes**:
- Too many failed login attempts
- Administrator locked your account
- Security policy triggered

**Solutions**:
1. Wait 15-30 minutes, then try again
2. Contact administrator to unlock
3. Use "Forgot Password" to reset

### Login page doesn't appear

**Causes**:
- Network connectivity issues
- Keycloak server is down
- Browser settings blocking redirects

**Solutions**:
1. Check your internet connection
2. Try refreshing the page
3. Clear browser cache
4. Try a different browser
5. Contact IT support

## 5.2 Session Problems

### Constantly being logged out

**Causes**:
- Session timeout is too short
- Browser is blocking cookies
- Network connection is unstable
- Another session kicked you out

**Solutions**:
1. Check browser cookie settings
2. Disable private/incognito mode
3. Check network stability
4. Ask administrator about session settings

### "Unable to refresh token"

**Causes**:
- Network connectivity issue
- Keycloak server temporarily unavailable
- Session completely expired

**Solutions**:
1. Wait a few seconds, try again
2. Check your internet connection
3. If persists, log in again

### Stuck on loading screen

**Causes**:
- Authentication process stuck
- Redirect loop
- Browser cache issues

**Solutions**:
1. Wait 30 seconds
2. Refresh the page
3. Clear browser cache and cookies
4. Try incognito/private mode
5. Contact IT support

## 5.3 Browser-Specific Issues

### Chrome

| Issue | Solution |
|-------|----------|
| Cookies blocked | Settings → Privacy → Allow cookies |
| Redirect blocked | Allow pop-ups for OneCX |
| Cached old state | Clear cache (Ctrl+Shift+Delete) |

### Firefox

| Issue | Solution |
|-------|----------|
| Enhanced tracking | Add OneCX to exceptions |
| Cookies blocked | Settings → Privacy → Standard mode |
| Container tabs | Use same container for OneCX |

### Safari

| Issue | Solution |
|-------|----------|
| Cross-site tracking | Preferences → Privacy → Allow |
| Cookies blocked | Allow cookies from visited websites |
| Private mode issues | Try regular browsing mode |

### Edge

| Issue | Solution |
|-------|----------|
| InPrivate mode | Use regular mode for persistent login |
| Strict tracking | Add OneCX to allowed sites |
| Cache issues | Clear browsing data |

## 5.4 When to Contact Support

Contact your IT administrator or help desk when:

- [ ] You can't log in after multiple attempts
- [ ] Your account appears to be locked
- [ ] You see unfamiliar error messages
- [ ] Problems persist after trying all solutions
- [ ] You suspect unauthorized access to your account
- [ ] You need your password reset
- [ ] You need different access permissions

**Information to provide**:
1. Your username
2. Time the problem occurred
3. Exact error message (screenshot if possible)
4. What you were trying to do
5. Browser and device you're using

---

# 6. Administrator Guide

## 6.1 Configuration Overview

As an administrator, you can configure how authentication behaves in OneCX.

### Available Configuration Options

| Setting | What it Controls | Where to Set |
|---------|-----------------|--------------|
| Session Timeout | How long sessions last | Keycloak Admin Console |
| Token Validity | How often tokens refresh | Keycloak + env.json |
| SSO Settings | Single sign-on behavior | Keycloak Realm settings |
| Login Themes | Look of login page | Keycloak themes |
| Password Policy | Password requirements | Keycloak Realm settings |

### Environment Configuration (env.json)

```json
{
  "KEYCLOAK_URL": "https://keycloak.your-company.com/",
  "KEYCLOAK_REALM": "your-realm",
  "KEYCLOAK_CLIENT_ID": "onecx-shell-ui-client",
  "KEYCLOAK_ENABLE_SILENT_SSO": "true",
  "KC_UPDATE_TOKEN_MIN_VALIDITY": "30",
  "KC_ON_TOKEN_EXPIRED_ACTION": "refresh",
  "KC_ON_AUTH_REFRESH_ERROR_ACTION": "retry",
  "KC_REFRESH_RETRY_COUNT": "3",
  "KC_REFRESH_RETRY_DELAY": "1000"
}
```

## 6.2 New Configuration Options

### KC_UPDATE_TOKEN_MIN_VALIDITY

**What it does**: Sets how early the system refreshes tokens before they expire.

| Value | Behavior | Recommended For |
|-------|----------|-----------------|
| `"5"` | Refresh 5 seconds before expiry | Low-latency networks (default) |
| `"30"` | Refresh 30 seconds before expiry | Normal networks |
| `"60"` | Refresh 60 seconds before expiry | High-latency or unreliable networks |

### KC_ON_TOKEN_EXPIRED_ACTION

**What it does**: Defines what happens when an access token expires.

| Value | Behavior | Use Case |
|-------|----------|----------|
| `"refresh"` | Automatically refresh the token | Default, seamless experience |
| `"logout"` | Log out the user | High-security environments |
| `"ignore"` | Wait for next API call | Debugging, testing |

### KC_ON_AUTH_REFRESH_ERROR_ACTION

**What it does**: Defines what happens when token refresh fails.

| Value | Behavior | Use Case |
|-------|----------|----------|
| `"retry"` | Try again up to configured attempts | Default, resilient |
| `"logout"` | Immediately log out | Strict security |
| `"ignore"` | Do nothing | Testing only |

### KC_REFRESH_RETRY_COUNT / KC_REFRESH_RETRY_DELAY

**What they do**: Configure retry behavior for failed refreshes.

| Setting | Value | Meaning |
|---------|-------|---------|
| `KC_REFRESH_RETRY_COUNT` | `"3"` | Try 3 times before giving up |
| `KC_REFRESH_RETRY_DELAY` | `"1000"` | Wait 1 second between retries |

### KC_TIME_SKEW

**What it does**: Manually sets the time difference between client and server.

| Value | Meaning |
|-------|---------|
| Not set | Auto-calculated (recommended) |
| `"30"` | Server is 30 seconds ahead of clients |
| `"-30"` | Server is 30 seconds behind clients |

> **When to use**: Only if you have known clock synchronization issues in your environment.

## 6.3 Recommended Settings by Environment

### Development

```json
{
  "KC_UPDATE_TOKEN_MIN_VALIDITY": "5",
  "KC_ON_TOKEN_EXPIRED_ACTION": "ignore",
  "KC_ON_AUTH_REFRESH_ERROR_ACTION": "ignore"
}
```

### Staging/QA

```json
{
  "KC_UPDATE_TOKEN_MIN_VALIDITY": "30",
  "KC_ON_TOKEN_EXPIRED_ACTION": "refresh",
  "KC_ON_AUTH_REFRESH_ERROR_ACTION": "retry",
  "KC_REFRESH_RETRY_COUNT": "3"
}
```

### Production

```json
{
  "KC_UPDATE_TOKEN_MIN_VALIDITY": "30",
  "KC_ON_TOKEN_EXPIRED_ACTION": "refresh",
  "KC_ON_AUTH_REFRESH_ERROR_ACTION": "retry",
  "KC_REFRESH_RETRY_COUNT": "5",
  "KC_REFRESH_RETRY_DELAY": "2000"
}
```

### High-Security Production

```json
{
  "KC_UPDATE_TOKEN_MIN_VALIDITY": "60",
  "KC_ON_TOKEN_EXPIRED_ACTION": "logout",
  "KC_ON_AUTH_REFRESH_ERROR_ACTION": "logout"
}
```

## 6.4 Keycloak Admin Console Settings

### Accessing the Admin Console

1. Go to `https://your-keycloak-url/admin`
2. Log in with admin credentials
3. Select your realm (e.g., "onecx")

### Important Realm Settings

| Setting | Location | Description |
|---------|----------|-------------|
| Session Timeouts | Realm Settings → Tokens | How long sessions last |
| Access Token Lifespan | Realm Settings → Tokens | Token validity period |
| SSO Session Idle | Realm Settings → Tokens | Idle timeout |
| Password Policy | Authentication → Policies | Password requirements |

### Client Settings

For the OneCX client (`onecx-shell-ui-client`):

| Setting | Recommended Value |
|---------|-------------------|
| Access Type | public |
| Standard Flow | ON |
| Direct Access Grants | OFF |
| Valid Redirect URIs | `https://your-app.com/*` |
| Web Origins | `https://your-app.com` |

## 6.5 Monitoring Authentication

### Keycloak Events

Enable event logging in Keycloak to monitor:
- Login attempts (success/failure)
- Logout events
- Token refresh activity
- Account lockouts

**To enable**: Realm Settings → Events → Save Events → ON

### What to Monitor

| Event Type | Why it Matters |
|------------|----------------|
| LOGIN_ERROR | Detect brute force attacks |
| REFRESH_TOKEN_ERROR | Identify session issues |
| LOGOUT | Track session terminations |
| UPDATE_PASSWORD | Monitor password changes |

## 6.6 Common Administrative Tasks

### Resetting a User's Password

1. Keycloak Admin → Users → Search for user
2. Credentials tab → Reset Password
3. Set temporary password → User must change on next login

### Unlocking a Locked Account

1. Keycloak Admin → Users → Search for user
2. Details tab → Enabled → ON
3. Save

### Viewing Active Sessions

1. Keycloak Admin → Users → Search for user
2. Sessions tab
3. View or terminate sessions

### Terminating All Sessions for a User

1. Keycloak Admin → Users → Search for user
2. Sessions tab → Logout all sessions

---

# 7. Security Best Practices

## 7.1 For Users

### Password Best Practices

| Do | Don't |
|----|-------|
| ✅ Use a unique password | ❌ Reuse passwords |
| ✅ Use mix of characters | ❌ Use personal info |
| ✅ Change periodically | ❌ Write it down visibly |
| ✅ Use a password manager | ❌ Share with colleagues |

**Strong password example**: `K3yc!0ak_SecUr3#2024`

### Session Security

| Do | Don't |
|----|-------|
| ✅ Log out when done | ❌ Leave logged in on shared computers |
| ✅ Lock your computer when away | ❌ Keep session active overnight |
| ✅ Use "Remember me" only on personal devices | ❌ Trust public computers |
| ✅ Report suspicious activity | ❌ Ignore unusual behavior |

### Recognizing Phishing

**Warning signs**:
- Email asking for your password
- Login page with unusual URL
- Urgent messages threatening account closure
- Misspelled company name or unusual formatting

**What to do**:
1. Don't click suspicious links
2. Verify the URL before entering credentials
3. Report to your IT department

## 7.2 For Administrators

### Keycloak Security

| Practice | Implementation |
|----------|----------------|
| Strong admin password | Use unique, complex password |
| Limit admin access | Only necessary personnel |
| Enable audit logging | Monitor suspicious activity |
| Regular updates | Keep Keycloak version current |
| HTTPS only | Force secure connections |

### Password Policy Recommendations

| Policy | Recommended Setting |
|--------|---------------------|
| Minimum length | 12 characters |
| Require special character | Yes |
| Require digit | Yes |
| Require uppercase | Yes |
| Password history | Last 5 passwords |
| Expiration | 90 days |

### Session Security Settings

| Setting | Recommended Value | Reason |
|---------|-------------------|--------|
| SSO Session Idle | 30 minutes | Balance security/convenience |
| SSO Session Max | 8 hours | Reasonable work day |
| Access Token Lifespan | 5-10 minutes | Minimize exposure |
| Refresh Token Lifespan | 30 minutes | Allow reasonable work |

### Brute Force Protection

| Setting | Recommended Value |
|---------|-------------------|
| Max login failures | 5 attempts |
| Wait time | 15 minutes |
| Max lockout duration | 1 hour |

---

# 8. Frequently Asked Questions

## General Questions

### Q: How long will I stay logged in?

**A**: Typically 30 minutes to 8 hours, depending on your organization's settings. The system refreshes your session automatically while you're working. If you're inactive for too long, you'll need to log in again.

### Q: Why do I have to log in again?

**A**: This happens when:
- You've been inactive too long (session timeout)
- For security, after a certain period
- Your administrator ended your session
- You're on a new browser/device

### Q: Can I be logged in on multiple devices?

**A**: Usually yes, but this depends on your organization's policy. Check with your administrator if you're unsure.

### Q: What happens to my work if my session expires?

**A**: Data you've already saved is safe. However, any unsaved work in progress might be lost. The system usually saves your work automatically, but it's good practice to save frequently.

## Login Issues

### Q: I forgot my password. What do I do?

**A**: Click "Forgot password?" on the login page. You'll receive instructions by email to reset your password. If you don't receive the email, check your spam folder or contact your administrator.

### Q: My account is locked. How do I unlock it?

**A**: Wait 15-30 minutes and try again. If it's still locked, contact your administrator to manually unlock your account.

### Q: The login page isn't loading. What should I do?

**A**: Try these steps:
1. Check your internet connection
2. Refresh the page
3. Clear your browser cache
4. Try a different browser
5. Contact IT support if the problem persists

## Session Questions

### Q: Why was I logged out unexpectedly?

**A**: Possible reasons:
- Session timeout due to inactivity
- Your administrator ended your session
- Network connectivity issues
- Browser cleared your session data

### Q: Can I prevent automatic logout?

**A**: The best way is to stay active. Occasional clicks, scrolls, or navigation will keep your session alive. However, for security reasons, all sessions eventually expire.

### Q: I have multiple tabs open. What happens when I log out?

**A**: Logging out in one tab will log you out in all tabs. If you have unsaved work in other tabs, save it before logging out.

## Technical Questions

### Q: What are "tokens" in authentication?

**A**: Tokens are like digital passes that prove you're logged in. They're managed automatically - you don't need to do anything with them. The system uses them to verify your identity for every action.

### Q: What is "SSO" and how does it help me?

**A**: Single Sign-On (SSO) means you log in once to access multiple connected applications. You won't need to enter your password each time you switch between OneCX and related apps.

### Q: Why does my browser ask to save my password?

**A**: That's a browser feature, not OneCX. While convenient, consider:
- Only save passwords on personal devices
- Use your browser's password manager securely
- Never save passwords on shared computers

## Security Questions

### Q: Is my password visible to administrators?

**A**: No. Passwords are stored securely using encryption. Administrators can reset your password but cannot see what it is.

### Q: What happens if someone else tries to log into my account?

**A**: After several failed attempts, the account will be temporarily locked. If you notice suspicious activity, change your password immediately and report it to your administrator.

### Q: Is my data safe?

**A**: Yes. OneCX uses industry-standard security:
- Encrypted connections (HTTPS)
- Secure token management
- Regular session expiration
- Access controls and permissions

---

# Summary

This guide has covered everything you need to know about authentication in OneCX:

1. **Basic Concepts**: What authentication is and why it's important
2. **Login Process**: Step-by-step guide to logging in
3. **Session Management**: How sessions work and stay active
4. **Common Scenarios**: What to expect in daily use
5. **Troubleshooting**: Solutions for common problems
6. **Administration**: How to configure authentication (for admins)
7. **Security**: Best practices to keep your account safe
8. **FAQs**: Answers to frequently asked questions

## Quick Reference

| Action | How To |
|--------|--------|
| Log in | Enter username + password at login page |
| Log out | Click "Logout" in user menu |
| Reset password | Click "Forgot password?" on login page |
| Stay logged in | Remain active, avoid long idle periods |
| Get help | Contact your IT administrator |

## Related Documents

- [DEV_DOCS - Technical Authentication Guide](../DEV_DOCS/Authentication/) - For developers
- Your organization's specific IT policies
- Keycloak documentation (for administrators)
