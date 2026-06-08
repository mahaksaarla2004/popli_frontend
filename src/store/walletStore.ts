import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TransactionItem } from '../types';
import { apiClient } from '../api/client';
import { mmkvStoreStorage } from './storage';

// ==========================================
// WALLET & COINS STORE
// ==========================================

interface WalletState {
  coinBalance: number;
  inrEarnings: number;
  transactions: TransactionItem[];
  rechargeCoins: (coins: number) => Promise<boolean>;
  sendGiftCoins: (receiverId: string, giftId: string, cost: number, message?: string) => Promise<boolean>;
  receiveGiftCoins: (coins: number, desc: string) => void;
  withdrawEarnings: (amount: number, upiId: string) => Promise<boolean>;
  addTransaction: (tx: Omit<TransactionItem, 'id' | 'timestamp'>) => void;
  fetchWallet: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      coinBalance: 0,
      inrEarnings: 0,
      transactions: [],
      rechargeCoins: async (coins) => {
        try {
          const res = await apiClient.post('/wallet/recharge', { amount: coins });
          set({
            coinBalance: res.data.coinBalance,
            transactions: res.data.transactions || get().transactions
          });
          return true;
        } catch (e) {
          console.error("Recharge failed:", e);
          return false;
        }
      },
      sendGiftCoins: async (receiverId, giftId, cost, message) => {
        if (get().coinBalance >= cost) {
          // Optimistic update
          set((state) => ({ coinBalance: state.coinBalance - cost }));
          try {
            await apiClient.post('/gifts/send', {
              receiverId,
              giftId,
              cost,
              message
            });
            // Refresh wallet from server to get accurate transaction history
            get().fetchWallet();
            return true;
          } catch (e) {
            console.error("Gift failed:", e);
            // Revert on fail
            set((state) => ({ coinBalance: state.coinBalance + cost }));
            return false;
          }
        }
        return false;
      },
      receiveGiftCoins: (coins, desc) => {
        // Maintained for local mock purposes if needed. Real flow comes from fetchWallet()
        const convertedINR = coins * 0.50;
        set((state) => ({
          inrEarnings: state.inrEarnings + convertedINR
        }));
      },
      withdrawEarnings: async (amount, upiId) => {
        if (get().inrEarnings >= amount) {
          // Optimistic UI update
          set((state) => ({ inrEarnings: state.inrEarnings - amount }));
          try {
            await apiClient.post('/wallet/withdraw', { amount, upiId });
            get().fetchWallet();
            return true;
          } catch (e) {
            console.error("Withdrawal failed:", e);
            // Revert on fail
            set((state) => ({ inrEarnings: state.inrEarnings + amount }));
            return false;
          }
        }
        return false;
      },
      addTransaction: (tx) =>
        set((state) => {
          const dateStr = new Date()
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ');
          const newTx: TransactionItem = {
            id: `tx_${Date.now()}`,
            timestamp: dateStr,
            ...tx
          };
          return { transactions: [newTx, ...state.transactions] };
        }),
      fetchWallet: async () => {
        try {
          const res = await apiClient.get('/wallet');
          set({
            coinBalance: res.data.coinBalance || 0,
            inrEarnings: res.data.inrEarnings || 0,
            transactions: res.data.transactions || []
          });
        } catch (e) {
          console.error("Failed to fetch wallet:", e);
        }
      }
    }),
    {
      name: 'popli-wallet-store',
      storage: createJSONStorage(() => mmkvStoreStorage)
    }
  )
);
