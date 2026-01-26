/**
 * ClientPicker - Bottom sheet modal for client selection
 * Features:
 * - Bottom sheet presentation
 * - Search input
 * - Client list with icons
 * - Quick switch functionality
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  SafeAreaView,
  Dimensions,
  Pressable,
} from 'react-native';

import { Client, SyncStatus } from '@/hooks/useClients';

// ============================================================================
// Types
// ============================================================================

interface ClientPickerProps {
  /** Whether the picker is visible */
  visible: boolean;
  /** List of clients to display */
  clients: Client[];
  /** Currently selected client ID */
  selectedClientId: string | null;
  /** Callback when a client is selected */
  onSelect: (clientId: string) => void;
  /** Callback when the picker is closed */
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Sync status indicator dot
 */
function SyncStatusDot({ status }: { status: SyncStatus }) {
  const colors: Record<SyncStatus, string> = {
    synced: '#4CAF50',
    pending: '#FF9800',
    syncing: '#2196F3',
    error: '#F44336',
  };

  return <View style={[styles.syncDot, { backgroundColor: colors[status] }]} />;
}

/**
 * Client list item
 */
function ClientListItem({
  client,
  isSelected,
  onPress,
}: {
  client: Client;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.clientItem, isSelected && styles.clientItemSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
        <Text style={styles.avatarText}>{client.name.charAt(0).toUpperCase()}</Text>
      </View>

      {/* Info */}
      <View style={styles.clientInfo}>
        <Text style={[styles.clientName, isSelected && styles.clientNameSelected]} numberOfLines={1}>
          {client.name}
        </Text>
        {client.company && (
          <Text style={styles.clientCompany} numberOfLines={1}>
            {client.company}
          </Text>
        )}
      </View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        <SyncStatusDot status={client.syncStatus} />
        {client.pendingTransactions > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{client.pendingTransactions}</Text>
          </View>
        )}
      </View>

      {/* Selected Checkmark */}
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ClientPicker({
  visible,
  clients,
  selectedClientId,
  onSelect,
  onClose,
}: ClientPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return clients.filter(c => c.status !== 'archived');
    }

    const query = searchQuery.toLowerCase();
    return clients.filter(
      c =>
        c.status !== 'archived' &&
        (c.name.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query))
    );
  }, [clients, searchQuery]);

  // Handle client selection
  const handleSelect = useCallback(
    (clientId: string) => {
      onSelect(clientId);
      setSearchQuery(''); // Reset search
    },
    [onSelect]
  );

  // Handle close
  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose();
  }, [onClose]);

  // Render client item
  const renderItem = useCallback(
    ({ item }: { item: Client }) => (
      <ClientListItem
        client={item}
        isSelected={item.id === selectedClientId}
        onPress={() => handleSelect(item.id)}
      />
    ),
    [selectedClientId, handleSelect]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop - tap to close */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* Bottom Sheet */}
        <SafeAreaView style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Client</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search clients..."
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Client List */}
          {filteredClients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No clients match your search' : 'No clients available'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredClients}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    height: MODAL_HEIGHT,
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // Handle
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    fontSize: 16,
    color: '#fff',
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3a3a5e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Client Item
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a4e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  clientItemSelected: {
    backgroundColor: '#3a3a5e',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },

  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3a3a5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarSelected: {
    backgroundColor: '#4CAF50',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Client Info
  clientInfo: {
    flex: 1,
    marginRight: 8,
  },
  clientName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  clientNameSelected: {
    color: '#4CAF50',
  },
  clientCompany: {
    color: '#888',
    fontSize: 13,
  },

  // Status
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Checkmark
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ClientPicker;
