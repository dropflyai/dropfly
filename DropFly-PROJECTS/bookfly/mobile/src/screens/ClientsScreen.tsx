/**
 * ClientsScreen - Client management and selection
 * Features:
 * - List of clients with status indicators
 * - Search and filter
 * - Add new client
 * - Tap to switch active client
 * - Sync status per client
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useClients, Client, ClientStatus, SyncStatus, CreateClientInput } from '@/hooks/useClients';

// ============================================================================
// Types
// ============================================================================

type RootStackParamList = {
  Clients: undefined;
  Scanner: { clientId?: string };
  Dashboard: undefined;
};

type ClientsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Clients'>;

type FilterOption = 'all' | 'active' | 'pending' | 'inactive';

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: ClientStatus }) {
  const colors = {
    active: '#4CAF50',
    inactive: '#888',
    pending: '#FF9800',
    archived: '#666',
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: colors[status] }]}>
      <Text style={styles.statusBadgeText}>{status}</Text>
    </View>
  );
}

/**
 * Sync status indicator
 */
function SyncIndicator({ status }: { status: SyncStatus }) {
  const config = {
    synced: { color: '#4CAF50', text: 'Synced' },
    pending: { color: '#FF9800', text: 'Pending' },
    syncing: { color: '#2196F3', text: 'Syncing...' },
    error: { color: '#F44336', text: 'Error' },
  };

  const { color, text } = config[status];

  return (
    <View style={styles.syncIndicator}>
      <View style={[styles.syncDot, { backgroundColor: color }]} />
      <Text style={[styles.syncText, { color }]}>{text}</Text>
    </View>
  );
}

/**
 * Client list item
 */
function ClientItem({
  client,
  isActive,
  onPress,
  onLongPress,
}: {
  client: Client;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.clientItem, isActive && styles.clientItemActive]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.clientItemContent}>
        {/* Avatar / Initial */}
        <View style={[styles.avatar, isActive && styles.avatarActive]}>
          <Text style={styles.avatarText}>{client.name.charAt(0).toUpperCase()}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <View style={styles.clientNameRow}>
            <Text style={styles.clientName} numberOfLines={1}>
              {client.name}
            </Text>
            <StatusBadge status={client.status} />
          </View>
          {client.company && (
            <Text style={styles.clientCompany} numberOfLines={1}>
              {client.company}
            </Text>
          )}
          <View style={styles.clientMeta}>
            <SyncIndicator status={client.syncStatus} />
            {client.pendingTransactions > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>
                  {client.pendingTransactions} pending
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Active Indicator */}
        {isActive && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeIndicatorText}>Active</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Add Client Modal
 */
function AddClientModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientInput) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a client name');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        company: company.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      // Reset form
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Client</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={isLoading || !name.trim()}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text
                  style={[
                    styles.modalSaveButton,
                    !name.trim() && styles.modalSaveButtonDisabled,
                  ]}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Client name"
                placeholderTextColor="#666"
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Company</Text>
              <TextInput
                style={styles.formInput}
                value={company}
                onChangeText={setCompany}
                placeholder="Company name (optional)"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.formInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ClientsScreen() {
  const navigation = useNavigation<ClientsScreenNavigationProp>();

  // Clients hook
  const {
    clients,
    isLoading,
    error,
    activeClientId,
    createClient,
    setActiveClient,
    deleteClient,
  } = useClients();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ============================================================================
  // Filtered Data
  // ============================================================================

  const filteredClients = useMemo(() => {
    let result = clients;

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(c => c.status === filter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [clients, filter, searchQuery]);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handle client selection
   */
  const handleSelectClient = useCallback(
    (client: Client) => {
      setActiveClient(client.id);
      // Navigate to scanner with this client
      navigation.navigate('Scanner', { clientId: client.id });
    },
    [setActiveClient, navigation]
  );

  /**
   * Handle long press - show options
   */
  const handleLongPress = useCallback(
    (client: Client) => {
      Alert.alert(client.name, 'Choose an action', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set as Active',
          onPress: () => setActiveClient(client.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Client',
              `Are you sure you want to delete ${client.name}? This cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteClient(client.id),
                },
              ]
            );
          },
        },
      ]);
    },
    [setActiveClient, deleteClient]
  );

  /**
   * Handle add client
   */
  const handleAddClient = useCallback(
    async (data: CreateClientInput) => {
      setIsCreating(true);
      try {
        const newClient = await createClient(data);
        // Optionally set as active
        setActiveClient(newClient.id);
      } catch (error) {
        Alert.alert('Error', 'Failed to create client');
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [createClient, setActiveClient]
  );

  // ============================================================================
  // Render
  // ============================================================================

  const renderClient = useCallback(
    ({ item }: { item: Client }) => (
      <ClientItem
        client={item}
        isActive={item.id === activeClientId}
        onPress={() => handleSelectClient(item)}
        onLongPress={() => handleLongPress(item)}
      />
    ),
    [activeClientId, handleSelectClient, handleLongPress]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
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
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearSearch} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchText}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'pending', 'inactive'] as FilterOption[]).map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.filterTab, filter === option && styles.filterTabActive]}
            onPress={() => setFilter(option)}
          >
            <Text style={[styles.filterTabText, filter === option && styles.filterTabTextActive]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Client List */}
      {isLoading && clients.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredClients.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No clients match your search' : 'No clients yet'}
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.emptyButtonText}>Add Your First Client</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          renderItem={renderClient}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Client Modal */}
      <AddClientModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddClient}
        isLoading={isCreating}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
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
    fontSize: 16,
    color: '#fff',
  },
  clearSearch: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  clearSearchText: {
    color: '#888',
    fontSize: 14,
  },

  // Filters
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a4e',
  },
  filterTabActive: {
    backgroundColor: '#4CAF50',
  },
  filterTabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Client Item
  clientItem: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  clientItemActive: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  clientItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3a3a5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarActive: {
    backgroundColor: '#4CAF50',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    flex: 1,
  },
  clientCompany: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Sync Indicator
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  syncText: {
    fontSize: 12,
  },

  // Pending Badge
  pendingBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },

  // Empty State
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalCancelButton: {
    color: '#888',
    fontSize: 16,
  },
  modalSaveButton: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButtonDisabled: {
    color: '#666',
  },

  // Form
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
});

export default ClientsScreen;
