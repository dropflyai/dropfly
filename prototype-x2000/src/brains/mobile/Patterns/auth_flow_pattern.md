# Pattern: Mobile Authentication Flow

## Context

This pattern applies when a mobile application requires user authentication.
Mobile auth has unique requirements: biometric authentication, secure token
storage, background token refresh, and seamless session restoration after
process death.

---

## Problem

Authentication on mobile must balance security with convenience. Users
expect to log in once and stay logged in for weeks or months. Sessions
must survive app termination, process death, and device restarts while
protecting credentials from device compromise.

---

## Solution

Token-based authentication with secure storage, automatic refresh, and
biometric re-authentication for sensitive operations.

```
┌─────────────────────────────────────────────────────────┐
│               MOBILE AUTH FLOW                           │
│                                                          │
│  App Launch                                              │
│  │                                                       │
│  ├── Check Keychain/Keystore for tokens                 │
│  │                                                       │
│  ├── Tokens found?                                      │
│  │   ├── YES → Validate access token                    │
│  │   │         ├── Valid → Navigate to home              │
│  │   │         └── Expired → Refresh token              │
│  │   │                      ├── Success → Home          │
│  │   │                      └── Failure → Login screen  │
│  │   │                                                   │
│  │   └── NO → Navigate to login/onboarding              │
│  │                                                       │
│  Login                                                   │
│  │                                                       │
│  ├── Email/Password → Server → Tokens → Keychain        │
│  ├── OAuth (Apple/Google) → Server → Tokens → Keychain  │
│  └── Biometric → Retrieve stored tokens from Keychain   │
│                                                          │
│  Token Refresh (background)                             │
│  │                                                       │
│  ├── Interceptor detects 401 response                   │
│  ├── Pause all requests                                 │
│  ├── Refresh token with server                          │
│  ├── Update stored tokens                               │
│  ├── Retry original request with new token              │
│  └── Resume queued requests                             │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation

### Auth State Management

```typescript
// Auth context with secure storage
type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: User; accessToken: string };

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');

      if (!accessToken || !refreshToken) {
        setAuthState({ status: 'unauthenticated' });
        return;
      }

      if (isTokenExpired(accessToken)) {
        const tokens = await authApi.refresh(refreshToken);
        await saveTokens(tokens);
        const user = await userApi.getCurrentUser(tokens.accessToken);
        setAuthState({ status: 'authenticated', user, accessToken: tokens.accessToken });
      } else {
        const user = await userApi.getCurrentUser(accessToken);
        setAuthState({ status: 'authenticated', user, accessToken });
      }
    } catch {
      await clearTokens();
      setAuthState({ status: 'unauthenticated' });
    }
  }

  async function signIn(email: string, password: string) {
    const tokens = await authApi.signIn(email, password);
    await saveTokens(tokens);
    const user = await userApi.getCurrentUser(tokens.accessToken);
    setAuthState({ status: 'authenticated', user, accessToken: tokens.accessToken });
  }

  async function signOut() {
    try {
      await authApi.signOut();
    } finally {
      await clearTokens();
      setAuthState({ status: 'unauthenticated' });
    }
  }

  return (
    <AuthContext.Provider value={{ ...authState, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Biometric Authentication

```swift
// iOS: Face ID / Touch ID for sensitive operations
import LocalAuthentication

class BiometricAuth {
    static func authenticate(reason: String) async throws -> Bool {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            throw BiometricError.notAvailable(error)
        }

        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        )
    }

    static var biometricType: BiometricType {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        switch context.biometryType {
        case .faceID: return .faceID
        case .touchID: return .touchID
        case .opticID: return .opticID
        default: return .none
        }
    }
}
```

### Token Storage Security Rules

| Storage | Acceptable For | NOT Acceptable For |
|---------|---------------|-------------------|
| Keychain (iOS) | Access tokens, refresh tokens, API keys | N/A (use it) |
| Keystore (Android) | Encryption keys | Tokens directly |
| EncryptedSharedPrefs | Access tokens, refresh tokens | N/A (use it) |
| UserDefaults / SharedPrefs | User preferences, theme | Tokens, passwords, ANY secrets |
| AsyncStorage | Non-sensitive cache | Tokens, passwords, ANY secrets |
| MMKV (encrypted) | Tokens (with encryption enabled) | Without encryption |

---

## Navigation Architecture

```typescript
// Conditional navigation based on auth state
function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <SplashScreen />;
  }

  return (
    <Stack>
      {status === 'unauthenticated' ? (
        <Stack.Screen name="(auth)" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="(app)" component={AppNavigator} />
      )}
    </Stack>
  );
}
```

---

## Trade-offs

### Gains
- Seamless session persistence (user logs in once)
- Biometric convenience for sensitive operations
- Secure credential storage
- Automatic token refresh (no manual re-login)

### Costs
- Complexity of token lifecycle management
- Keychain/Keystore API differences across platforms
- Edge cases: expired refresh token, revoked session, password change

---

## Known Pitfalls

1. **Race condition on token refresh**: Multiple simultaneous 401 responses
   can trigger multiple refresh attempts. Use a mutex/actor to serialize.
2. **Storing tokens in plain text**: NEVER use UserDefaults, SharedPreferences,
   or AsyncStorage for tokens. Always use platform secure storage.
3. **Not handling token revocation**: Server may revoke tokens (password
   change, admin action). App must handle and redirect to login.
4. **Biometric fallback**: Always provide a non-biometric fallback (PIN,
   password). Not all devices support biometrics.

---

**Auth is the front door. Make it secure, seamless, and resilient.**
