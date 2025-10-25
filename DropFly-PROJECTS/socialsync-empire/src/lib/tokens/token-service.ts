import { createClient } from '@/lib/supabase/server';
import {
  TokenBalance,
  TokenTransaction,
  TokenOperation,
  TokenOperationRequest,
  TokenOperationResult,
} from '@/types/token-system';
import { calculateTokenCost } from './token-config';

export class TokenService {
  // Check and reset daily limit if needed
  private async checkAndResetDailyLimit(userId: string): Promise<void> {
    const supabase = await createClient();

    const { data: balance } = await supabase
      .from('token_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!balance) return;

    // Check if we need to reset daily_spent (new day)
    const lastReset = new Date(balance.last_reset_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastReset.setHours(0, 0, 0, 0);

    if (today > lastReset) {
      // Reset daily spending
      await supabase
        .from('token_balances')
        .update({
          daily_spent: 0,
          last_reset_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    }
  }

  // Get user's current token balance
  async getBalance(userId: string): Promise<TokenBalance | null> {
    const supabase = await createClient();

    // Reset daily limit if needed before fetching balance
    await this.checkAndResetDailyLimit(userId);

    const { data, error } = await supabase
      .from('token_balances')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching token balance:', error);
      return null;
    }

    return data;
  }

  // Check if user has sufficient tokens
  async hasSufficientTokens(userId: string, requiredTokens: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance ? balance.balance >= requiredTokens : false;
  }

  // Deduct tokens for an operation
  async deductTokens(request: TokenOperationRequest): Promise<TokenOperationResult> {
    const supabase = await createClient();

    try {
      // Get current balance (this will auto-reset daily limit if needed)
      const balance = await this.getBalance(request.userId);

      if (!balance) {
        return {
          success: false,
          error: 'User token balance not found',
          errorCode: 'USER_NOT_FOUND',
        };
      }

      // Check daily limit
      if (balance.daily_spent + request.cost > balance.daily_limit) {
        return {
          success: false,
          error: `Daily token limit exceeded. You've used ${balance.daily_spent}/${balance.daily_limit} tokens today. Limit resets tomorrow.`,
          errorCode: 'DAILY_LIMIT_EXCEEDED',
        };
      }

      // Check sufficient balance
      if (balance.balance < request.cost) {
        return {
          success: false,
          error: `Insufficient tokens. Required: ${request.cost}, Available: ${balance.balance}`,
          errorCode: 'INSUFFICIENT_TOKENS',
        };
      }

      // Calculate new balance
      const newBalance = balance.balance - request.cost;
      const newLifetimeSpent = balance.lifetime_spent + request.cost;
      const newDailySpent = balance.daily_spent + request.cost;

      // Update balance in transaction
      const { error: updateError } = await supabase
        .from('token_balances')
        .update({
          balance: newBalance,
          lifetime_spent: newLifetimeSpent,
          daily_spent: newDailySpent,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', request.userId);

      if (updateError) {
        throw updateError;
      }

      // Log transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: request.userId,
          amount: -request.cost,
          type: 'spend',
          reason: request.description,
          operation: request.operation,
          metadata: request.metadata || {},
          balance_after: newBalance,
        })
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      return {
        success: true,
        transaction,
        newBalance,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Token deduction error:', err);
      return {
        success: false,
        error: err.message || 'Failed to deduct tokens',
        errorCode: 'INVALID_OPERATION',
      };
    }
  }

  // Add tokens (purchase, bonus, refund)
  async addTokens(
    userId: string,
    amount: number,
    type: 'earn' | 'bonus' | 'purchase' | 'refund',
    operation: TokenOperation,
    reason: string,
    metadata?: Record<string, unknown>
  ): Promise<TokenOperationResult> {
    const supabase = await createClient();

    try {
      // Get current balance
      const balance = await this.getBalance(userId);

      if (!balance) {
        return {
          success: false,
          error: 'User token balance not found',
          errorCode: 'USER_NOT_FOUND',
        };
      }

      // Calculate new balance
      const newBalance = balance.balance + amount;
      const newLifetimeEarned = balance.lifetime_earned + amount;

      // Update balance
      const { error: updateError } = await supabase
        .from('token_balances')
        .update({
          balance: newBalance,
          lifetime_earned: newLifetimeEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Log transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: type,
          reason: reason,
          operation: operation,
          metadata: metadata || {},
          balance_after: newBalance,
        })
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      return {
        success: true,
        transaction,
        newBalance,
      };
    } catch (error) {
      const err = error as Error;
      console.error('Token addition error:', err);
      return {
        success: false,
        error: err.message || 'Failed to add tokens',
        errorCode: 'INVALID_OPERATION',
      };
    }
  }

  // Get transaction history
  async getTransactions(userId: string, limit: number = 50): Promise<TokenTransaction[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data;
  }

  // Calculate cost for an operation (wrapper for config function)
  calculateCost(operation: TokenOperation, params?: Record<string, unknown>): number {
    return calculateTokenCost(operation, params);
  }

  // Get daily limit information for display
  async getDailyLimitInfo(userId: string): Promise<{
    dailySpent: number;
    dailyLimit: number;
    dailyRemaining: number;
    percentageUsed: number;
    resetsAt: string;
  } | null> {
    const balance = await this.getBalance(userId);

    if (!balance) return null;

    const dailyRemaining = Math.max(0, balance.daily_limit - balance.daily_spent);
    const percentageUsed = (balance.daily_spent / balance.daily_limit) * 100;

    // Calculate when the limit resets (midnight tonight)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return {
      dailySpent: balance.daily_spent,
      dailyLimit: balance.daily_limit,
      dailyRemaining,
      percentageUsed: Math.round(percentageUsed),
      resetsAt: tomorrow.toISOString(),
    };
  }

  // Refund tokens for a failed operation
  async refundTokens(
    userId: string,
    originalTransactionId: string,
    reason: string
  ): Promise<TokenOperationResult> {
    const supabase = await createClient();

    try {
      // Get the original transaction
      const { data: originalTransaction, error: fetchError } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('id', originalTransactionId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !originalTransaction) {
        return {
          success: false,
          error: 'Original transaction not found',
          errorCode: 'INVALID_OPERATION',
        };
      }

      // Only refund spend transactions
      if (originalTransaction.type !== 'spend') {
        return {
          success: false,
          error: 'Can only refund spend transactions',
          errorCode: 'INVALID_OPERATION',
        };
      }

      // Refund the amount (original amount was negative, so we add absolute value)
      const refundAmount = Math.abs(originalTransaction.amount);

      return await this.addTokens(
        userId,
        refundAmount,
        'refund',
        'failed_operation_refund',
        reason,
        {
          original_transaction_id: originalTransactionId,
          original_operation: originalTransaction.operation,
        }
      );
    } catch (error) {
      const err = error as Error;
      console.error('Token refund error:', err);
      return {
        success: false,
        error: err.message || 'Failed to refund tokens',
        errorCode: 'INVALID_OPERATION',
      };
    }
  }
}

// Singleton instance
export const tokenService = new TokenService();
