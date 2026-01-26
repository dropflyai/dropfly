/**
 * TransactionCard - Swipeable card for transaction review
 * Features:
 * - Receipt image thumbnail
 * - Extracted fields (editable)
 * - Confidence badge with color coding
 * - Flag indicators
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Transaction, ConfidenceLevel, TransactionFlag, UpdateTransactionInput } from '@/hooks/useTransactions';
import { ScannedDocument } from '@/lib/scanner';

// ============================================================================
// Types
// ============================================================================

interface TransactionCardProps {
  /** Transaction data (may be null for new scans) */
  transaction: Transaction | null;
  /** Scanned document info */
  document: ScannedDocument;
  /** Whether interactions are disabled */
  disabled?: boolean;
  /** Callback when edit button is pressed */
  onEdit?: () => void;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Confidence badge with color coding
 */
function ConfidenceBadge({ level, value }: { level: ConfidenceLevel; value: number }) {
  const colors = {
    high: '#4CAF50',
    medium: '#FF9800',
    low: '#F44336',
  };

  const labels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  };

  return (
    <View style={[styles.confidenceBadge, { backgroundColor: colors[level] }]}>
      <Text style={styles.confidenceBadgeText}>{labels[level]}</Text>
      <Text style={styles.confidenceValue}>{Math.round(value * 100)}%</Text>
    </View>
  );
}

/**
 * Flag indicator chip
 */
function FlagChip({ flag }: { flag: TransactionFlag }) {
  const flagLabels: Record<TransactionFlag, string> = {
    duplicate_suspected: 'Possible Duplicate',
    amount_unusual: 'Unusual Amount',
    category_uncertain: 'Category Unclear',
    date_unclear: 'Date Unclear',
    vendor_unknown: 'Unknown Vendor',
  };

  return (
    <View style={styles.flagChip}>
      <Text style={styles.flagChipText}>{flagLabels[flag]}</Text>
    </View>
  );
}

/**
 * Data field row
 */
function DataField({
  label,
  value,
  placeholder = 'Not detected',
}: {
  label: string;
  value: string | null | undefined;
  placeholder?: string;
}) {
  return (
    <View style={styles.dataField}>
      <Text style={styles.dataFieldLabel}>{label}</Text>
      <Text style={[styles.dataFieldValue, !value && styles.dataFieldPlaceholder]}>
        {value || placeholder}
      </Text>
    </View>
  );
}

// ============================================================================
// Edit Modal
// ============================================================================

interface EditModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onSave: (updates: UpdateTransactionInput) => void;
  onClose: () => void;
}

function EditModal({ visible, transaction, onSave, onClose }: EditModalProps) {
  const [vendor, setVendor] = useState(transaction?.vendor ?? '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '');
  const [date, setDate] = useState(
    transaction?.date ? transaction.date.toISOString().split('T')[0] : ''
  );
  const [category, setCategory] = useState(transaction?.category ?? '');
  const [description, setDescription] = useState(transaction?.description ?? '');

  const handleSave = () => {
    onSave({
      vendor: vendor || null,
      amount: amount ? parseFloat(amount) : null,
      date: date ? new Date(date) : null,
      category: category || null,
      description: description || null,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.editModalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.editModalContent}>
          {/* Header */}
          <View style={styles.editModalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.editModalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.editModalTitle}>Edit Transaction</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.editModalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.editForm}>
            <View style={styles.editFormGroup}>
              <Text style={styles.editFormLabel}>Vendor</Text>
              <TextInput
                style={styles.editFormInput}
                value={vendor}
                onChangeText={setVendor}
                placeholder="Enter vendor name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.editFormGroup}>
              <Text style={styles.editFormLabel}>Amount</Text>
              <TextInput
                style={styles.editFormInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.editFormGroup}>
              <Text style={styles.editFormLabel}>Date</Text>
              <TextInput
                style={styles.editFormInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.editFormGroup}>
              <Text style={styles.editFormLabel}>Category</Text>
              <TextInput
                style={styles.editFormInput}
                value={category}
                onChangeText={setCategory}
                placeholder="Select or enter category"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.editFormGroup}>
              <Text style={styles.editFormLabel}>Description</Text>
              <TextInput
                style={[styles.editFormInput, styles.editFormTextarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TransactionCard({
  transaction,
  document,
  disabled = false,
  onEdit,
}: TransactionCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  // Format amount for display
  const formatAmount = (amount: number | null | undefined) => {
    if (amount == null) return null;
    return `$${amount.toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle edit save
  const handleEditSave = useCallback((updates: UpdateTransactionInput) => {
    // In production, this would call updateTransaction
    console.log('Saving updates:', updates);
    setShowEditModal(false);
  }, []);

  // Get confidence level
  const confidenceLevel: ConfidenceLevel = transaction
    ? transaction.confidence >= 0.85
      ? 'high'
      : transaction.confidence >= 0.6
      ? 'medium'
      : 'low'
    : 'low';

  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      {/* Receipt Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: document.thumbnailUri || document.processedUri }}
          style={styles.receiptImage}
          resizeMode="cover"
        />
        {/* Edit overlay button */}
        {!disabled && onEdit && (
          <TouchableOpacity style={styles.imageEditButton} onPress={onEdit}>
            <Text style={styles.imageEditButtonText}>View</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Confidence Badge */}
        <ConfidenceBadge level={confidenceLevel} value={transaction?.confidence ?? 0} />

        {/* Extracted Data Fields */}
        <View style={styles.dataFields}>
          <DataField label="Vendor" value={transaction?.vendor} />
          <DataField label="Amount" value={formatAmount(transaction?.amount)} />
          <DataField label="Date" value={formatDate(transaction?.date)} />
          <DataField label="Category" value={transaction?.category} />
        </View>

        {/* Flags */}
        {transaction?.flags && transaction.flags.length > 0 && (
          <View style={styles.flagsContainer}>
            {transaction.flags.map(flag => (
              <FlagChip key={flag} flag={flag} />
            ))}
          </View>
        )}

        {/* Edit Button */}
        {!disabled && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        transaction={transaction}
        onSave={handleEditSave}
        onClose={() => setShowEditModal(false)}
      />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a4e',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardDisabled: {
    opacity: 0.8,
  },

  // Image Section
  imageContainer: {
    height: 200,
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  imageEditButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  imageEditButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // Content Section
  content: {
    padding: 20,
  },

  // Confidence Badge
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  confidenceBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceValue: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },

  // Data Fields
  dataFields: {
    marginBottom: 16,
  },
  dataField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  dataFieldLabel: {
    color: '#888',
    fontSize: 14,
  },
  dataFieldValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  dataFieldPlaceholder: {
    color: '#666',
    fontStyle: 'italic',
  },

  // Flags
  flagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  flagChip: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  flagChipText: {
    color: '#F44336',
    fontSize: 11,
    fontWeight: '500',
  },

  // Edit Button
  editButton: {
    backgroundColor: '#3a3a5e',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Edit Modal
  editModalContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  editModalContent: {
    flex: 1,
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  editModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  editModalCancel: {
    color: '#888',
    fontSize: 16,
  },
  editModalSave: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  editForm: {
    padding: 16,
  },
  editFormGroup: {
    marginBottom: 20,
  },
  editFormLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  editFormInput: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  editFormTextarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default TransactionCard;
