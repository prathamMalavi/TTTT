# Understanding the Authentication Security Improvements

## What's Changing and What It Means for You

---

## Document Information

| Property | Value |
|----------|-------|
| **Version** | 1.0.0 |
| **Created** | April 22, 2026 |
| **Target Audience** | End Users, System Administrators |
| **Change Type** | Authentication Improvement |

---

## Table of Contents

1. [Overview: What's Changing?](#1-overview-whats-changing)
2. [Benefits for Users](#2-benefits-for-users)
3. [What You'll Notice](#3-what-youll-notice)
4. [Administrator Information](#4-administrator-information)
5. [If Something Goes Wrong](#5-if-something-goes-wrong)
6. [Frequently Asked Questions](#6-frequently-asked-questions)

---

# 1. Overview: What's Changing?

## 1.1 Simple Summary

We're making improvements to how OneCX handles your login session to provide:

- **Fewer interruptions** while you work
- **Better recovery** from temporary network issues
- **More stability** during long work sessions
- **Customizable settings** for different needs

## 1.2 The Improvements Being Made

### Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **When your session nears expiration** | Waited until next action | Proactively refreshes |
| **If refresh has a temporary problem** | Session might fail | Automatically retries |
| **Configuration flexibility** | Fixed settings | Configurable per environment |
| **Multiple quick actions** | Each triggered refresh check | Smarter, reduced redundancy |

## 1.3 In Plain Language

Think of your login session like a library card:

**Before the improvements**:
- Your card expires at a set time
- If you try to use it when expired, you have to get a new one
- No automatic renewal

**After the improvements**:
- The library notices when your card is about to expire
- They automatically renew it for you before it expires
- If the renewal system has a hiccup, they try again instead of giving up
- You keep using the library without interruption!

---

# 2. Benefits for Users

## 2.1 Smoother Work Experience

### Fewer Unexpected Logouts

**Old behavior**: You might be working on something important, and suddenly you're redirected to the login page because your session expired at just the wrong moment.

**New behavior**: The system proactively refreshes your session before it expires, so you're less likely to be interrupted.

```
Before:
┌─────────────────────────────────────────────────┐
│  Working...  Working...  SESSION EXPIRED!       │
│                          ↓                      │
│                    Login page :-(               │
└─────────────────────────────────────────────────┘

After:
┌─────────────────────────────────────────────────┐
│  Working...  [silent refresh]  Working...       │
│                    ↓                            │
│              (You don't notice!)                │
└─────────────────────────────────────────────────┘
```

### Better Handling of Network Issues

**Old behavior**: If a temporary network hiccup occurred during session refresh, you might get logged out.

**New behavior**: The system tries again automatically - up to a few times - before giving up.

```
Before:
┌─────────────────────────────────────────────────┐
│  Network hiccup during refresh                  │
│        ↓                                        │
│  FAILED! → "Please log in again"                │
└─────────────────────────────────────────────────┘

After:
┌─────────────────────────────────────────────────┐
│  Network hiccup during refresh                  │
│        ↓                                        │
│  Retry #1... Retry #2... SUCCESS!               │
│        ↓                                        │
│  You continue working normally                  │
└─────────────────────────────────────────────────┘
```

## 2.2 Real-World Scenarios

### Scenario 1: Working on a Complex Task

**You**: Filling out a detailed form that takes 30 minutes

**Old system**: Your session might expire mid-task, potentially losing unsaved data

**New system**: Session stays active throughout your work

### Scenario 2: Reading Documentation

**You**: Reading a long document without clicking anything

**Old system**: Session expires during reading, login required to continue

**New system**: Proactive refresh happens in the background

### Scenario 3: Brief Network Interruption

**You**: WiFi drops for 2 seconds while system refreshes

**Old system**: Refresh fails, you get logged out

**New system**: System retries, refresh succeeds, you're not affected

### Scenario 4: Preparing Multiple Reports

**You**: Clicking through multiple pages quickly to gather data

**Old system**: Each click might trigger separate session checks

**New system**: Smarter handling reduces unnecessary operations

## 2.3 What This Means Day-to-Day

| Your Activity | Old Experience | New Experience |
|---------------|----------------|----------------|
| Morning login | Same | Same |
| Working continuously | Occasional unexpected logouts | Smooth, uninterrupted |
| Quick break for coffee | Session might expire | Session stays active |
| Network glitch happens | Might need to re-login | Usually transparent |
| Long reading/review | Risk of timeout | Background maintenance |
| End of day logout | Same | Same |

---

# 3. What You'll Notice

## 3.1 Mostly Nothing (That's the Point!)

The best part about these improvements is that you **shouldn't notice major changes**. The goal is to make authentication more invisible and reliable.

**If everything is working correctly:**
- Login works the same
- Logout works the same
- Your session just... keeps working
- Fewer "unexpected" login prompts

## 3.2 Possible Changes You Might See

### Occasional Brief Pauses

You might occasionally notice a very brief pause (less than a second) when the system refreshes your session. This is normal.

### Different Behavior When Problems Occur

If there's a network problem, instead of immediately asking you to log in, the system might:
1. Try a few more times
2. Show a brief loading indicator
3. Only ask you to log in if it really can't recover

### Clearer Feedback (Future Enhancement)

The system may show clearer messages about what's happening:
- "Refreshing your session..."
- "Connection issue, retrying..."
- "Please log in again" (only when necessary)

## 3.3 Timeline of a Work Session

```
Before Improvements:
──────────────────────────────────────────────────────────────────
9:00 ────── Login ────── Work ────── Work ────── TOKEN EXPIRED!
              ↓                                        ↓
          Session starts                      Surprise login prompt

After Improvements:
──────────────────────────────────────────────────────────────────
9:00 ────── Login ────── Work ────── [Refresh] ────── Work ────── 
              ↓                         ↓                 ↓
          Session starts    Silent background      Seamless continuing
```

---

# 4. Administrator Information

## 4.1 New Configuration Options

The following new settings are now available to customize authentication behavior:

### Token Refresh Timing

**Setting**: `KC_UPDATE_TOKEN_MIN_VALIDITY`

**What it does**: Determines how early the system refreshes tokens before they expire.

**Options**:
| Value | Effect | Recommended For |
|-------|--------|-----------------|
| `5` | Refresh 5 seconds early | Fast, reliable networks |
| `30` | Refresh 30 seconds early | Standard environments |
| `60` | Refresh 60 seconds early | Slower or less reliable networks |

### Token Expiration Behavior

**Setting**: `KC_ON_TOKEN_EXPIRED_ACTION`

**What it does**: Controls what happens when a token expires.

**Options**:
| Value | Effect | Recommended For |
|-------|--------|-----------------|
| `refresh` | Automatically refresh | Standard use (default) |
| `logout` | Immediately log out | High-security needs |
| `ignore` | Wait for next action | Testing/debugging |

### Error Recovery

**Setting**: `KC_ON_AUTH_REFRESH_ERROR_ACTION`

**What it does**: Controls what happens when refresh fails.

**Options**:
| Value | Effect | Recommended For |
|-------|--------|-----------------|
| `retry` | Try again before giving up | Standard use (default) |
| `logout` | Immediately log out | High-security needs |
| `ignore` | Continue without action | Testing/debugging |

### Retry Configuration

**Setting**: `KC_REFRESH_RETRY_COUNT`

**What it does**: How many times to retry a failed refresh.

**Recommendation**: `3` for most environments, up to `5` for unreliable networks.

**Setting**: `KC_REFRESH_RETRY_DELAY`

**What it does**: How long to wait between retries (milliseconds).

**Recommendation**: `1000` (1 second) or `2000` (2 seconds).

## 4.2 Environment-Specific Recommendations

### Standard Office Environment

```
KC_UPDATE_TOKEN_MIN_VALIDITY=30
KC_ON_TOKEN_EXPIRED_ACTION=refresh
KC_ON_AUTH_REFRESH_ERROR_ACTION=retry
KC_REFRESH_RETRY_COUNT=3
KC_REFRESH_RETRY_DELAY=1000
```

### High-Security Environment

```
KC_UPDATE_TOKEN_MIN_VALIDITY=60
KC_ON_TOKEN_EXPIRED_ACTION=logout
KC_ON_AUTH_REFRESH_ERROR_ACTION=logout
```

### Unreliable Network Environment

```
KC_UPDATE_TOKEN_MIN_VALIDITY=60
KC_ON_TOKEN_EXPIRED_ACTION=refresh
KC_ON_AUTH_REFRESH_ERROR_ACTION=retry
KC_REFRESH_RETRY_COUNT=5
KC_REFRESH_RETRY_DELAY=2000
```

## 4.3 Monitoring Recommendations

After deploying, monitor:

1. **Login-related errors** in logs
2. **User complaints** about authentication
3. **Session timeout incidents** (should decrease)
4. **Token refresh success/failure rates**

---

# 5. If Something Goes Wrong

## 5.1 For Users: Quick Troubleshooting

### You're Asked to Log In More Than Before

**Possible causes**:
- Configuration is set to `logout` on token expiration
- Network issues preventing refresh
- Session really has expired (normal behavior)

**What to do**:
1. Log in again (your work should be saved)
2. If it keeps happening frequently, report to your administrator

### You See a "Retrying..." Message

**What's happening**: The system is trying to refresh your session but encountering a temporary issue.

**What to do**:
1. Wait a few moments
2. The system will usually recover automatically
3. If stuck, try refreshing the page
4. If that doesn't work, log in again

### The Application Seems Stuck

**What's happening**: Possibly waiting for a retry attempt.

**What to do**:
1. Wait 10-15 seconds
2. If still stuck, refresh the page
3. If that doesn't work, log in again

## 5.2 For Administrators: Troubleshooting

### Users Report More Frequent Logouts

**Investigate**:
1. Check `KC_ON_TOKEN_EXPIRED_ACTION` setting
2. Review Keycloak server logs
3. Check network connectivity between app and Keycloak
4. Verify Keycloak token lifetimes

### Users Report Authentication Errors

**Investigate**:
1. Check Keycloak server health
2. Review network stability
3. Check `KC_REFRESH_RETRY_COUNT` setting
4. Look for patterns (time of day, specific users)

### Users Report Application Feeling "Slow"

**Investigate**:
1. Check `KC_REFRESH_RETRY_DELAY` setting (might be too long)
2. Review network latency to Keycloak
3. Check for excessive retry attempts in logs

## 5.3 Emergency Rollback

If the new authentication behavior causes widespread issues:

**Quick fix** - revert to old behavior:
```
KC_ON_TOKEN_EXPIRED_ACTION=ignore
KC_ON_AUTH_REFRESH_ERROR_ACTION=ignore
```

This maintains backward compatibility while issues are investigated.

---

# 6. Frequently Asked Questions

## General Questions

### Q: Do I need to do anything differently after this change?

**A**: No! The changes happen behind the scenes. You'll log in and work the same as before, just with fewer interruptions.

### Q: Will my current session be affected?

**A**: No. If you're already logged in when this change is deployed, you'll continue working normally. The new behavior applies to new sessions and token refreshes.

### Q: Could this make my account less secure?

**A**: No. These changes improve reliability without reducing security. Your session is still protected and will still expire appropriately.

## About the Changes

### Q: What exactly is being refreshed automatically?

**A**: Your "access token" - a digital pass that proves you're logged in. It normally expires every few minutes, and now it's refreshed proactively before expiration.

### Q: Why weren't these improvements made before?

**A**: The original system was simple and worked well enough. As OneCX has grown and been used in more environments, we've identified opportunities to make the experience smoother.

### Q: Will this affect all OneCX environments equally?

**A**: The changes apply to all environments, but administrators can configure them differently for each environment based on specific needs.

## For Administrators

### Q: Do I need to configure anything, or will it work automatically?

**A**: It will work automatically with sensible defaults. Configuration is optional but available for environments with specific needs.

### Q: Can I keep the old behavior?

**A**: Yes, by setting:
```
KC_ON_TOKEN_EXPIRED_ACTION=ignore
KC_ON_AUTH_REFRESH_ERROR_ACTION=ignore
```

### Q: How do I know if the changes are working correctly?

**A**: Monitor:
- Fewer "session expired" errors
- Smooth user experience reports
- Successful token refreshes in logs
- No increase in unexpected logouts

### Q: What if I need help configuring this?

**A**: Consult the technical documentation or contact OneCX support for guidance on optimal settings for your environment.

## Troubleshooting

### Q: I'm being logged out more than before. Is this related?

**A**: Possibly. Check with your administrator about current configuration. The default settings should reduce logouts, not increase them.

### Q: The application seems to pause briefly sometimes. Is this the new refresh?

**A**: Possibly, but pauses should be very brief (under a second). If pauses are long or frequent, report to your administrator.

### Q: A colleague has different behavior than me. Why?

**A**: If you're in different user groups or environments, administrators might have configured different settings. This is intentional for different needs.

---

# Summary

## What's Happening

We're improving how OneCX handles your login session to provide:
- Smoother, uninterrupted work experience
- Better recovery from temporary issues
- Configurable settings for different needs

## What You'll Notice

Mostly nothing! That's the goal. The system will silently keep you logged in more reliably than before.

## If You Have Issues

1. Try refreshing the page
2. If needed, log in again
3. Report persistent issues to your administrator

## For Administrators

New configuration options are available:
- `KC_UPDATE_TOKEN_MIN_VALIDITY` - Refresh timing
- `KC_ON_TOKEN_EXPIRED_ACTION` - Expiration behavior
- `KC_ON_AUTH_REFRESH_ERROR_ACTION` - Error recovery
- `KC_REFRESH_RETRY_COUNT` and `KC_REFRESH_RETRY_DELAY` - Retry settings

Default settings should work well for most environments.

---

## Need Help?

- **Users**: Contact your IT help desk or system administrator
- **Administrators**: Refer to the technical documentation or contact OneCX support

## Related Documents

- [Authentication User Guide](./00-authentication-user-guide.md) - Complete guide to OneCX authentication
- [DEV_DOCS - Technical Implementation](../../DEV_DOCS/Authentication/) - Technical details for developers
