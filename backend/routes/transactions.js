import express from 'express';
import { fineractService } from '../services/fineractService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const transactions = await fineractService.getAccountTransactions(req.user.accountId);

    // Transform Fineract transaction format to app format
    const formattedTransactions = (transactions.transactionItems || []).map((tx) => ({
      id: tx.id,
      type: tx.type?.value === 'DEPOSIT' ? 'received' : 'sent',
      amount: tx.amount,
      description: tx.description ?? (tx.type?.value === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'),
      timestamp: new Date(tx.date),
    }));

    res.json({
      transactions: formattedTransactions,
      pagination: {
        page: 1,
        limit: 10,
        total: formattedTransactions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
