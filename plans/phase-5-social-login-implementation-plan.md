# Phase 5: Social Login & Enhanced Security Implementation Plan

## Overview

Phase 5 focuses on enhancing the authentication system with social login capabilities (OAuth providers) and implementing advanced security features to protect user accounts from suspicious activities and unauthorized access attempts.

**Current Status**: Phase 4 Complete - Role-Based Access Control (RBAC) Implemented and Tested

**Phase 5 Goals**:

1. Implement social login with OAuth providers (Google, GitHub, etc.)
2. Add IP intelligence and geolocation tracking
3. Implement CAPTCHA integration for sign-up and sign-in
4. Add device fingerprinting for enhanced security
5. Implement automatic account locking for suspicious activity
6. Add audit logging for permission denials

## Phase 5 Scope

### 5.1 Social Login (OAuth Providers)

**Objective**: Allow users to sign in using their existing social media accounts (Google, GitHub, etc.) in addition to email/password authentication.

**Features to Implement**:

- Google OAuth provider integration
- GitHub OAuth provider integration
- Option to add more providers (Microsoft, Facebook, etc.)
- Link/unlink social accounts to existing email accounts
- Social account display in user profile
- Consistent user experience across all sign-in methods

**Technical Approach**:

- Use NextAuth.js OAuth provider support (already installed)
- Configure OAuth providers in `lib/auth.config.ts`
- Handle OAuth callbacks and account linking
- Store OAuth account information in `Account` table
- Merge accounts when user signs in with multiple methods

**Files to Create**:

- `app/auth/link-social/page.tsx` - Page to link social accounts
- `components/auth/social-login-buttons.tsx` - Social login button components
- `components/auth/linked-accounts.tsx` - Display linked social accounts in user profile

**Files to Modify**:

- `lib/auth.config.ts` - Add OAuth provider configurations
- `app/auth/signin/page.tsx` - Add social login buttons
- `app/admin/users/[id]/page.tsx` - Show linked social accounts
- `app/settings/page.tsx` - Add social account management section

**Database Schema Changes**:

- Already has `Account` table for OAuth providers
- No schema changes needed

**API Routes to Create**:

- `POST /api/auth/link-social` - Link social account to existing user
- `POST /api/auth/unlink-social` - Unlink social account from user

**Success Criteria**:

- ✅ Users can sign in with Google account
- ✅ Users can sign in with GitHub account
- ✅ Users can link social accounts to existing email accounts
- ✅ Users can unlink social accounts
- ✅ Social accounts display in user profile
- ✅ OAuth flow handles errors gracefully
- ✅ Consistent user experience across all sign-in methods

### 5.2 IP Intelligence and Geolocation

**Objective**: Track and analyze IP addresses to detect suspicious sign-in attempts and provide users with security insights.

**Features to Implement**:

- IP geolocation lookup (country, city, region)
- IP reputation scoring (VPN/proxy detection)
- Sign-in location history display
- New location alerts
- Suspicious IP detection (multiple failed attempts from same IP)

**Technical Approach**:

- Use IP intelligence service (e.g., MaxMind GeoIP2, IPQualityScore)
- Store geolocation data in `SignInHistory` table
- Implement IP reputation scoring algorithm
- Create security alert system for new locations

**Files to Create**:

- `lib/ip-intelligence.ts` - IP intelligence helper functions
- `components/auth/sign-in-history.tsx` - Sign-in history with geolocation
- `components/auth/security-alerts.tsx` - Security alerts display
- `app/settings/security/page.tsx` - Security settings page

**Files to Modify**:

- `prisma/schema.prisma` - Add geolocation fields to `SignInHistory`
- `app/api/auth/signin/route.ts` - Track geolocation on sign-in
- `app/admin/users/[id]/page.tsx` - Show sign-in history with geolocation

**Database Schema Changes**:

```prisma
model SignInHistory {
  id          String   @id @default(uuid())
  userId      String
  ipAddress   String?
  userAgent   String?
  success     Boolean
  failureReason String?
  country     String?  // New field
  city        String?  // New field
  region      String?  // New field
  isVpn       Boolean?  // New field
  isProxy     Boolean?  // New field
  reputation  Int?     // New field
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

**API Routes to Create**:

- `GET /api/auth/sign-in-history` - Get user's sign-in history
- `GET /api/auth/security-alerts` - Get user's security alerts

**Success Criteria**:

- ✅ IP geolocation tracked on sign-in
- ✅ IP reputation scoring implemented
- ✅ Sign-in history displays geolocation
- ✅ Security alerts for new locations
- ✅ VPN/proxy detection working
- ✅ Suspicious IP detection implemented

### 5.3 CAPTCHA Integration

**Objective**: Add CAPTCHA verification to sign-up and sign-in flows to prevent automated bot attacks.

**Features to Implement**:

- CAPTCHA on sign-up form
- CAPTCHA on sign-in form (after failed attempts)
- CAPTCHA on forgot password form
- CAPTCHA on password reset form
- Invisible CAPTCHA for better UX
- CAPTCHA validation on server-side

**Technical Approach**:

- Use reCAPTCHA v3 (Google) or hCaptcha
- Implement CAPTCHA validation middleware
- Show CAPTCHA after multiple failed attempts
- Store CAPTCHA validation status in session

**Files to Create**:

- `components/auth/captcha.tsx` - CAPTCHA component
- `lib/captcha.ts` - CAPTCHA validation helper functions

**Files to Modify**:

- `components/auth/sign-up-form.tsx` - Add CAPTCHA
- `components/auth/sign-in-form.tsx` - Add CAPTCHA after failed attempts
- `components/auth/forgot-password-form.tsx` - Add CAPTCHA
- `components/auth/reset-password-form.tsx` - Add CAPTCHA
- `app/api/auth/signup/route.ts` - Validate CAPTCHA
- `app/api/auth/signin/route.ts` - Validate CAPTCHA
- `app/api/auth/forgot-password/route.ts` - Validate CAPTCHA
- `app/api/auth/reset-password/route.ts` - Validate CAPTCHA

**Environment Variables**:

```env
# CAPTCHA (Google reCAPTCHA v3)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key"
RECAPTCHA_SECRET_KEY="your-secret-key"
```

**Success Criteria**:

- ✅ CAPTCHA displayed on sign-up form
- ✅ CAPTCHA displayed on sign-in after failed attempts
- ✅ CAPTCHA validated on server-side
- ✅ Invisible CAPTCHA working
- ✅ CAPTCHA prevents automated bot attacks
- ✅ Graceful error handling for CAPTCHA failures

### 5.4 Device Fingerprinting

**Objective**: Identify and track user devices to detect unauthorized access from unknown devices.

**Features to Implement**:

- Device fingerprint generation on sign-in
- Device history tracking
- New device alerts
- Trusted device management
- Device-based authentication (optional)

**Technical Approach**:

- Use device fingerprinting library (e.g., FingerprintJS)
- Generate unique device identifier
- Store device information in database
- Implement trusted device system

**Files to Create**:

- `lib/device-fingerprint.ts` - Device fingerprinting helper functions
- `components/auth/device-list.tsx` - Display user's devices
- `components/auth/trust-device-dialog.tsx` - Dialog to trust device

**Files to Modify**:

- `prisma/schema.prisma` - Add `Device` model
- `app/api/auth/signin/route.ts` - Track device on sign-in
- `app/settings/security/page.tsx` - Add device management section

**Database Schema Changes**:

```prisma
model Device {
  id           String   @id @default(uuid())
  userId       String
  fingerprint  String   @unique  // Device fingerprint
  name         String?  // Device name (e.g., "MacBook Pro - Chrome")
  userAgent    String?
  lastSeenAt  DateTime @default(now())
  isTrusted    Boolean  @default(false)
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([fingerprint])
}

// Add to User model
model User {
  // ... existing fields
  devices      Device[]
}
```

**API Routes to Create**:

- `GET /api/auth/devices` - Get user's devices
- `POST /api/auth/trust-device` - Trust a device
- `DELETE /api/auth/device/[id]` - Remove a device

**Success Criteria**:

- ✅ Device fingerprint generated on sign-in
- ✅ Device history tracked
- ✅ New device alerts implemented
- ✅ Trusted device management working
- ✅ Device-based authentication optional

### 5.5 Automatic Account Locking

**Objective**: Automatically lock user accounts after detecting suspicious activity to prevent unauthorized access.

**Features to Implement**:

- Account locking after multiple failed sign-in attempts
- Account locking after sign-in from suspicious location
- Account locking after sign-in from unknown device
- Account unlocking by email verification
- Admin account unlocking
- Account locking history

**Technical Approach**:

- Implement suspicious activity detection algorithm
- Lock accounts automatically based on rules
- Send email notifications when accounts are locked
- Provide account unlocking mechanisms

**Files to Create**:

- `lib/account-locking.ts` - Account locking helper functions
- `components/auth/account-locked-message.tsx` - Display locked account message
- `app/auth/unlock-account/page.tsx` - Account unlock page

**Files to Modify**:

- `prisma/schema.prisma` - Add `AccountLock` model
- `app/api/auth/signin/route.ts` - Check account lock status
- `app/api/auth/unlock-account/route.ts` - Handle account unlocking
- `app/admin/users/[id]/page.tsx` - Show account lock status
- `lib/email.ts` - Add account locked email template

**Database Schema Changes**:

```prisma
model AccountLock {
  id              String   @id @default(uuid())
  userId          String
  reason          String   // "failed_attempts", "suspicious_location", "unknown_device"
  lockedAt        DateTime @default(now())
  unlockedAt      DateTime?
  unlockedBy      String?  // User ID or "admin"
  ipAddress       String?
  deviceFingerprint String?
  createdAt       DateTime @default(now())

  @@index([userId])
  @@index([lockedAt])
}

// Add to User model
model User {
  // ... existing fields
  isLocked       Boolean  @default(false)
  lockedAt       DateTime?
  accountLocks   AccountLock[]
}
```

**API Routes to Create**:

- `GET /api/auth/account-status` - Check if account is locked
- `POST /api/auth/unlock-account` - Unlock account via email verification
- `POST /api/admin/users/[id]/unlock-account` - Admin unlock account

**Success Criteria**:

- ✅ Account locks after multiple failed attempts
- ✅ Account locks after suspicious location
- ✅ Account locks after unknown device
- ✅ Email notifications sent when accounts locked
- ✅ Users can unlock accounts via email verification
- ✅ Admins can unlock accounts
- ✅ Account locking history tracked

### 5.6 Audit Logging

**Objective**: Log all permission denials and security events for audit trail and security monitoring.

**Features to Implement**:

- Log all permission denials
- Log all security events (account locks, suspicious activity)
- Audit log viewer for admins
- Audit log export functionality
- Audit log filtering and search

**Technical Approach**:

- Create audit logging middleware
- Log all permission checks
- Store audit logs in database
- Implement audit log viewer

**Files to Create**:

- `lib/audit-logging.ts` - Audit logging helper functions
- `components/admin/audit-log-table.tsx` - Audit log table component
- `components/admin/audit-log-filters.tsx` - Audit log filters
- `app/admin/audit-logs/page.tsx` - Audit logs viewer page

**Files to Modify**:

- `prisma/schema.prisma` - Add `AuditLog` model
- `lib/authorization.ts` - Add audit logging to permission checks
- `components/layout/navigation.tsx` - Add Audit Logs link for admins

**Database Schema Changes**:

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String   // "permission_denied", "account_locked", "suspicious_activity"
  resource    String?  // "contact", "activity", "task", "deal", "user"
  resourceId  String?
  details     String?  // JSON string with additional details
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

**API Routes to Create**:

- `GET /api/admin/audit-logs` - Get audit logs with filtering
- `GET /api/admin/audit-logs/export` - Export audit logs as CSV

**Success Criteria**:

- ✅ All permission denials logged
- ✅ All security events logged
- ✅ Audit log viewer for admins
- ✅ Audit log export functionality
- ✅ Audit log filtering and search working

## Implementation Order

### Week 1: Social Login (5.1)

1. Configure OAuth providers in `lib/auth.config.ts`
2. Create social login button components
3. Update sign-in page with social login buttons
4. Implement OAuth account linking/unlinking
5. Test OAuth flows for Google and GitHub
6. Update documentation

### Week 2: IP Intelligence (5.2)

1. Implement IP intelligence service integration
2. Update database schema with geolocation fields
3. Track geolocation on sign-in
4. Create sign-in history display
5. Implement security alerts for new locations
6. Test IP reputation scoring

### Week 3: CAPTCHA Integration (5.3)

1. Integrate CAPTCHA service
2. Create CAPTCHA component
3. Add CAPTCHA to sign-up form
4. Add CAPTCHA to sign-in after failed attempts
5. Add CAPTCHA to password reset forms
6. Test CAPTCHA validation

### Week 4: Device Fingerprinting (5.4)

1. Integrate device fingerprinting library
2. Create Device model in database
3. Track devices on sign-in
4. Create device management UI
5. Implement trusted device system
6. Test device tracking

### Week 5: Account Locking (5.5)

1. Create AccountLock model in database
2. Implement account locking logic
3. Create account unlock flow
4. Add email notifications for locked accounts
5. Implement admin account unlocking
6. Test account locking scenarios

### Week 6: Audit Logging (5.6)

1. Create AuditLog model in database
2. Implement audit logging middleware
3. Add audit logging to permission checks
4. Create audit log viewer
5. Implement audit log export
6. Test audit logging

## Configuration Requirements

### Social Login Providers

**Google OAuth**:

1. Create Google Cloud project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

**GitHub OAuth**:

1. Create GitHub OAuth App
2. Configure callback URL
3. Add to `.env.local`:
   ```env
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

### IP Intelligence

**MaxMind GeoIP2**:

1. Create MaxMind account
2. Download GeoIP2 database
3. Add to `.env.local`:
   ```env
   MAXMIND_LICENSE_KEY="your-maxmind-license-key"
   ```

**IPQualityScore**:

1. Create IPQualityScore account
2. Get API key
3. Add to `.env.local`:
   ```env
   IPQUALITYSCORE_API_KEY="your-ipqualityscore-api-key"
   ```

### CAPTCHA

**Google reCAPTCHA v3**:

1. Create reCAPTCHA site key
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
   RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
   ```

### Device Fingerprinting

**FingerprintJS**:

1. Install FingerprintJS package
2. Add to `.env.local`:
   ```env
   FINGERPRINTJS_API_KEY="your-fingerprintjs-api-key"  # Optional, for Pro features
   ```

## Known Limitations

- Social login requires OAuth provider setup (Google, GitHub, etc.)
- IP intelligence services may have API rate limits
- CAPTCHA may impact user experience
- Device fingerprinting is not 100% reliable
- Account locking may cause false positives
- Audit logging increases database storage requirements

## Success Criteria (Phase 5)

- ✅ Social login implemented with at least 2 providers (Google, GitHub)
- ✅ IP intelligence and geolocation tracking working
- ✅ CAPTCHA integration on sign-up and sign-in
- ✅ Device fingerprinting implemented
- ✅ Automatic account locking for suspicious activity
- ✅ Audit logging for permission denials and security events
- ✅ All features tested and documented
- ✅ Configuration requirements documented

## Migration Plan

### Database Migration

```bash
# Apply schema changes
npx prisma db push --accept-data-loss

# Generate Prisma client
npx prisma generate
```

### Data Migration

No data migration needed for Phase 5 (new features only).

## Testing Plan

### Social Login Testing

1. Test sign-up with Google OAuth
2. Test sign-up with GitHub OAuth
3. Test sign-in with existing social account
4. Test linking social account to existing email account
5. Test unlinking social account
6. Test error handling for OAuth failures

### IP Intelligence Testing

1. Test geolocation tracking on sign-in
2. Test IP reputation scoring
3. Test sign-in history with geolocation
4. Test security alerts for new locations
5. Test VPN/proxy detection

### CAPTCHA Testing

1. Test CAPTCHA on sign-up
2. Test CAPTCHA on sign-in after failed attempts
3. Test CAPTCHA validation
4. Test CAPTCHA error handling

### Device Fingerprinting Testing

1. Test device fingerprint generation
2. Test device tracking
3. Test new device alerts
4. Test trusted device management
5. Test device-based authentication

### Account Locking Testing

1. Test account locking after failed attempts
2. Test account locking after suspicious location
3. Test account unlocking via email
4. Test admin account unlocking
5. Test account locking history

### Audit Logging Testing

1. Test permission denial logging
2. Test security event logging
3. Test audit log viewer
4. Test audit log export
5. Test audit log filtering

## Documentation Updates

### Files to Update

- `.env.example` - Add Phase 5 environment variables
- `README.md` - Add Phase 5 features documentation
- `docs/API_DOCUMENTATION.md` - Add Phase 5 API endpoints
- `docs/security.md` - Update with Phase 5 security features
- `.kilocode/rules/memory-bank/authentication.md` - Add Phase 5 details
- `.kilocode/rules/memory-bank/architecture.md` - Update architecture with Phase 5 features
- `.kilocode/rules/memory-bank/tech.md` - Update tech stack with Phase 5 dependencies

### Documentation to Create

- `docs/setup-social-login.md` - Social login setup guide
- `docs/setup-ip-intelligence.md` - IP intelligence setup guide
- `docs/setup-captcha.md` - CAPTCHA setup guide
- `docs/setup-device-fingerprinting.md` - Device fingerprinting setup guide
- `docs/phase-5-completion-summary.md` - Phase 5 completion summary

## Rollback Plan

If Phase 5 features cause issues:

1. Disable OAuth providers in `lib/auth.config.ts`
2. Disable IP intelligence in sign-in flow
3. Disable CAPTCHA in auth forms
4. Disable device fingerprinting
5. Disable automatic account locking
6. Disable audit logging
7. Revert database schema changes if necessary

## Next Steps (Phase 6 - Future)

Potential future enhancements:

- Multi-factor authentication (SMS, WebAuthn)
- Advanced security analytics
- Machine learning for fraud detection
- Biometric authentication
- Advanced audit reporting
- Security dashboard for admins
