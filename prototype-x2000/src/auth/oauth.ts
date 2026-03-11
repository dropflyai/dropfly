/**
 * X2000 OAuth Authentication
 *
 * Implements OAuth flow similar to Claude Code to allow users to
 * authenticate with their existing Claude subscription.
 *
 * Flow:
 * 1. User runs `x2000 login`
 * 2. Browser opens Anthropic OAuth authorization page
 * 3. User authorizes X2000 to access their Claude account
 * 4. Callback receives OAuth token
 * 5. Token is stored securely for API calls
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir, platform } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

const X2000_DIR = join(homedir(), '.x2000');
const CREDENTIALS_PATH = join(X2000_DIR, 'credentials.json');

// OAuth configuration
// Note: These would need to be registered with Anthropic
const OAUTH_CONFIG = {
  clientId: 'x2000-ai-fleet',
  authUrl: 'https://console.anthropic.com/oauth/authorize',
  tokenUrl: 'https://console.anthropic.com/oauth/token',
  callbackPort: 19283,
  scopes: [
    'anthropic.profile.read',
    'anthropic.subscription.usage',
    'anthropic.code.sessions',
    'anthropic.connectors.manage',
  ],
};

interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  accountEmail?: string;
  createdAt: number;
}

interface AuthState {
  codeVerifier: string;
  state: string;
}

/**
 * Generate PKCE code verifier and challenge
 */
function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  // Generate random code verifier (43-128 characters)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');

  // Generate code challenge using SHA-256
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

/**
 * Generate random state for CSRF protection
 */
function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Open URL in the default browser
 */
async function openBrowser(url: string): Promise<void> {
  const os = platform();

  try {
    if (os === 'darwin') {
      await execAsync(`open "${url}"`);
    } else if (os === 'win32') {
      await execAsync(`start "" "${url}"`);
    } else {
      // Linux and others
      await execAsync(`xdg-open "${url}"`);
    }
  } catch (error) {
    console.log('\nCould not open browser automatically.');
    console.log('Please open this URL manually:');
    console.log(url);
  }
}

/**
 * Start OAuth login flow
 */
export async function login(): Promise<OAuthCredentials | null> {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                          X2000 Authentication                              ║');
  console.log('║              Connect to your Claude subscription                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Generate PKCE and state
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = generateState();

  // Build authorization URL
  const authParams = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: `http://localhost:${OAUTH_CONFIG.callbackPort}/callback`,
    scope: OAUTH_CONFIG.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `${OAUTH_CONFIG.authUrl}?${authParams.toString()}`;

  console.log('Opening browser for authentication...\n');
  console.log('Your account will be used to:');
  console.log('  • Access your Anthropic profile information');
  console.log('  • Contribute to your Claude subscription usage');
  console.log('  • Access your Claude Code sessions');
  console.log('  • Use and manage your connectors');
  console.log('');

  // Start local callback server
  return new Promise((resolve) => {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (!req.url) {
        res.end('Invalid request');
        return;
      }

      const url = new URL(req.url, `http://localhost:${OAUTH_CONFIG.callbackPort}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const returnedState = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>Authentication Failed</h1>
                <p>Error: ${error}</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          resolve(null);
          return;
        }

        if (returnedState !== state) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>Authentication Failed</h1>
                <p>Invalid state parameter. This may be a security issue.</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          resolve(null);
          return;
        }

        if (!code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>Authentication Failed</h1>
                <p>No authorization code received.</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          resolve(null);
          return;
        }

        // Exchange code for token
        try {
          const tokenResponse = await fetch(OAUTH_CONFIG.tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code,
              redirect_uri: `http://localhost:${OAUTH_CONFIG.callbackPort}/callback`,
              client_id: OAUTH_CONFIG.clientId,
              code_verifier: codeVerifier,
            }).toString(),
          });

          if (!tokenResponse.ok) {
            throw new Error(`Token exchange failed: ${tokenResponse.status}`);
          }

          const tokenData = await tokenResponse.json() as {
            access_token: string;
            refresh_token?: string;
            expires_in?: number;
          };

          const credentials: OAuthCredentials = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in
              ? Date.now() + tokenData.expires_in * 1000
              : undefined,
            createdAt: Date.now(),
          };

          // Save credentials
          await saveCredentials(credentials);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center; background: #0a0a0a; color: white;">
                <h1 style="color: #22c55e;">✓ X2000 Authenticated</h1>
                <p>You're now connected to your Claude subscription.</p>
                <p style="color: #888;">You can close this window.</p>
              </body>
            </html>
          `);

          console.log('\n✓ Authentication successful!');
          console.log('  Your Claude subscription is now connected to X2000.');
          console.log('');

          server.close();
          resolve(credentials);

        } catch (err) {
          console.error('Token exchange failed:', err);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>Authentication Failed</h1>
                <p>Could not complete authentication.</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          resolve(null);
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(OAUTH_CONFIG.callbackPort, () => {
      // Open browser to authorization URL
      openBrowser(authUrl);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      console.log('\nAuthentication timed out.');
      server.close();
      resolve(null);
    }, 5 * 60 * 1000);
  });
}

/**
 * Save credentials securely
 */
async function saveCredentials(credentials: OAuthCredentials): Promise<void> {
  if (!existsSync(X2000_DIR)) {
    mkdirSync(X2000_DIR, { recursive: true });
  }

  // In production, this should use OS keychain (Keychain on macOS, Credential Manager on Windows)
  // For now, we'll save to a file with restricted permissions
  writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2), {
    mode: 0o600, // Owner read/write only
  });
}

/**
 * Load saved credentials
 */
export function loadCredentials(): OAuthCredentials | null {
  if (!existsSync(CREDENTIALS_PATH)) {
    return null;
  }

  try {
    const data = readFileSync(CREDENTIALS_PATH, 'utf-8');
    const credentials = JSON.parse(data) as OAuthCredentials;

    // Check if expired
    if (credentials.expiresAt && Date.now() > credentials.expiresAt) {
      // Token expired - would need to refresh
      // For now, return null to trigger re-auth
      return null;
    }

    return credentials;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const credentials = loadCredentials();
  return credentials !== null;
}

/**
 * Logout - remove stored credentials
 */
export function logout(): void {
  if (existsSync(CREDENTIALS_PATH)) {
    unlinkSync(CREDENTIALS_PATH);
    console.log('Logged out successfully.');
  } else {
    console.log('Not logged in.');
  }
}

/**
 * Get current authentication status
 */
export function getAuthStatus(): {
  authenticated: boolean;
  email?: string;
  expiresAt?: Date;
} {
  const credentials = loadCredentials();

  if (!credentials) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    email: credentials.accountEmail,
    expiresAt: credentials.expiresAt ? new Date(credentials.expiresAt) : undefined,
  };
}
