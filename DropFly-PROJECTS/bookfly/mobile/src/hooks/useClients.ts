/**
 * Clients hook for BookFly
 * Manages CRUD operations for client data
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Types
// ============================================================================

/** Client status in the system */
export type ClientStatus = 'active' | 'inactive' | 'pending' | 'archived';

/** Sync status for client data */
export type SyncStatus = 'synced' | 'pending' | 'error' | 'syncing';

/** Client entity */
export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  status: ClientStatus;
  syncStatus: SyncStatus;
  pendingTransactions: number;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

/** Input for creating a new client */
export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  metadata?: Record<string, unknown>;
}

/** Input for updating a client */
export interface UpdateClientInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  status?: ClientStatus;
  metadata?: Record<string, unknown>;
}

/** Filter options for client queries */
export interface ClientFilters {
  status?: ClientStatus;
  search?: string;
  hasPendingTransactions?: boolean;
}

/** Hook state */
export interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  activeClientId: string | null;
  activeClient: Client | null;
}

/** Hook actions */
export interface ClientsActions {
  fetchClients: (filters?: ClientFilters) => Promise<void>;
  createClient: (input: CreateClientInput) => Promise<Client>;
  updateClient: (id: string, input: UpdateClientInput) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  setActiveClient: (id: string | null) => void;
  refreshClient: (id: string) => Promise<Client | null>;
  searchClients: (query: string) => Promise<Client[]>;
}

export type UseClientsReturn = ClientsState & ClientsActions;

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing clients data
 *
 * @example
 * ```tsx
 * const {
 *   clients,
 *   activeClient,
 *   isLoading,
 *   createClient,
 *   setActiveClient
 * } = useClients();
 *
 * // Create new client
 * const newClient = await createClient({ name: 'Acme Corp' });
 *
 * // Set as active
 * setActiveClient(newClient.id);
 * ```
 */
export function useClients(): UseClientsReturn {
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  // Computed active client
  const activeClient = clients.find(c => c.id === activeClientId) ?? null;

  // ============================================================================
  // Data Fetching
  // ============================================================================

  /**
   * Fetch clients with optional filters
   */
  const fetchClients = useCallback(async (filters?: ClientFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Transform database records to Client type
      const transformedClients: Client[] = (data ?? []).map(record => ({
        id: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone,
        company: record.company,
        address: record.address,
        status: record.status as ClientStatus,
        syncStatus: record.sync_status as SyncStatus,
        pendingTransactions: record.pending_transactions ?? 0,
        lastSyncedAt: record.last_synced_at ? new Date(record.last_synced_at) : null,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
        metadata: record.metadata,
      }));

      setClients(transformedClients);

      // Filter by pending transactions if requested (client-side)
      if (filters?.hasPendingTransactions !== undefined) {
        const filtered = transformedClients.filter(c =>
          filters.hasPendingTransactions
            ? c.pendingTransactions > 0
            : c.pendingTransactions === 0
        );
        setClients(filtered);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clients';
      setError(message);
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Create a new client
   */
  const createClient = useCallback(
    async (input: CreateClientInput): Promise<Client> => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from('clients')
          .insert({
            name: input.name,
            email: input.email ?? null,
            phone: input.phone ?? null,
            company: input.company ?? null,
            address: input.address ?? null,
            status: 'active',
            sync_status: 'synced',
            pending_transactions: 0,
            metadata: input.metadata ?? {},
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        const newClient: Client = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          address: data.address,
          status: data.status as ClientStatus,
          syncStatus: data.sync_status as SyncStatus,
          pendingTransactions: data.pending_transactions ?? 0,
          lastSyncedAt: data.last_synced_at ? new Date(data.last_synced_at) : null,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          metadata: data.metadata,
        };

        setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));

        return newClient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create client';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update an existing client
   */
  const updateClient = useCallback(
    async (id: string, input: UpdateClientInput): Promise<Client> => {
      setIsLoading(true);
      setError(null);

      try {
        // Build update object with snake_case keys
        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.email !== undefined) updateData.email = input.email;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.company !== undefined) updateData.company = input.company;
        if (input.address !== undefined) updateData.address = input.address;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.metadata !== undefined) updateData.metadata = input.metadata;
        updateData.updated_at = new Date().toISOString();

        const { data, error: updateError } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        const updatedClient: Client = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          address: data.address,
          status: data.status as ClientStatus,
          syncStatus: data.sync_status as SyncStatus,
          pendingTransactions: data.pending_transactions ?? 0,
          lastSyncedAt: data.last_synced_at ? new Date(data.last_synced_at) : null,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          metadata: data.metadata,
        };

        setClients(prev =>
          prev.map(c => (c.id === id ? updatedClient : c))
        );

        return updatedClient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update client';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Delete a client (soft delete by setting status to archived)
   */
  const deleteClient = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Soft delete - set status to archived
      const { error: deleteError } = await supabase
        .from('clients')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Remove from local state
      setClients(prev => prev.filter(c => c.id !== id));

      // Clear active client if it was deleted
      if (activeClientId === id) {
        setActiveClientId(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeClientId]);

  /**
   * Set the active client for scanning/transactions
   */
  const setActiveClient = useCallback((id: string | null) => {
    setActiveClientId(id);
  }, []);

  /**
   * Refresh a single client's data
   */
  const refreshClient = useCallback(async (id: string): Promise<Client | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data) {
        return null;
      }

      const refreshedClient: Client = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        address: data.address,
        status: data.status as ClientStatus,
        syncStatus: data.sync_status as SyncStatus,
        pendingTransactions: data.pending_transactions ?? 0,
        lastSyncedAt: data.last_synced_at ? new Date(data.last_synced_at) : null,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        metadata: data.metadata,
      };

      setClients(prev =>
        prev.map(c => (c.id === id ? refreshedClient : c))
      );

      return refreshedClient;
    } catch (err) {
      console.error('Error refreshing client:', err);
      return null;
    }
  }, []);

  /**
   * Search clients by name, company, or email
   */
  const searchClients = useCallback(async (query: string): Promise<Client[]> => {
    if (!query.trim()) {
      return clients;
    }

    try {
      const { data, error: searchError } = await supabase
        .from('clients')
        .select('*')
        .or(
          `name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`
        )
        .neq('status', 'archived')
        .order('name', { ascending: true });

      if (searchError) {
        throw new Error(searchError.message);
      }

      return (data ?? []).map(record => ({
        id: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone,
        company: record.company,
        address: record.address,
        status: record.status as ClientStatus,
        syncStatus: record.sync_status as SyncStatus,
        pendingTransactions: record.pending_transactions ?? 0,
        lastSyncedAt: record.last_synced_at ? new Date(record.last_synced_at) : null,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
        metadata: record.metadata,
      }));
    } catch (err) {
      console.error('Error searching clients:', err);
      return [];
    }
  }, [clients]);

  // ============================================================================
  // Return Value
  // ============================================================================

  return {
    // State
    clients,
    isLoading,
    error,
    activeClientId,
    activeClient,

    // Actions
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    setActiveClient,
    refreshClient,
    searchClients,
  };
}

export default useClients;
