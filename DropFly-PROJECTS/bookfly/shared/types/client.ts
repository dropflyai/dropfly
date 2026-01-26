/**
 * Client and Connection Types for BookFly
 *
 * These types define the core client entities and their connections
 * to external accounting providers.
 */

/**
 * Supported accounting software providers
 */
export type ConnectionProvider = 'quickbooks' | 'xero' | 'freshbooks';

/**
 * Represents a BookFly client (a business using the service)
 */
export interface Client {
  /** Unique identifier for the client */
  id: string;

  /** Reference to the user who owns this client */
  userId: string;

  /** Display name for the client/business */
  name: string;

  /** Timestamp when the client was created */
  createdAt: Date;

  /** Timestamp when the client was last updated */
  updatedAt?: Date;

  /** Optional metadata for the client */
  metadata?: Record<string, unknown>;
}

/**
 * Represents a connection to an external accounting provider
 */
export interface AccountingConnection {
  /** Unique identifier for the connection */
  id: string;

  /** Reference to the client this connection belongs to */
  clientId: string;

  /** The accounting software provider */
  provider: ConnectionProvider;

  /** OAuth access token for API calls */
  accessToken: string;

  /** OAuth refresh token for obtaining new access tokens */
  refreshToken: string;

  /** Provider-specific company/realm identifier (e.g., QuickBooks realmId) */
  realmId: string;

  /** Human-readable company name from the provider */
  companyName: string;

  /** Timestamp when the access token expires */
  expiresAt: Date;

  /** Timestamp when the connection was created */
  createdAt: Date;

  /** Timestamp when the connection was last updated */
  updatedAt?: Date;

  /** Whether the connection is currently active */
  isActive: boolean;

  /** Last successful sync timestamp */
  lastSyncAt?: Date;

  /** Provider-specific scopes granted */
  scopes?: string[];
}

/**
 * Input type for creating a new client
 */
export interface CreateClientInput {
  userId: string;
  name: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input type for updating a client
 */
export interface UpdateClientInput {
  name?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input type for creating a new accounting connection
 */
export interface CreateConnectionInput {
  clientId: string;
  provider: ConnectionProvider;
  accessToken: string;
  refreshToken: string;
  realmId: string;
  companyName: string;
  expiresAt: Date;
  scopes?: string[];
}
