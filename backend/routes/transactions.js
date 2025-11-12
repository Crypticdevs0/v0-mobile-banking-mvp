import express from 'express';
import { fineractService } from '../services/fineractService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const transactions = await fineractService.getAccountTransactions(req.user.accountId);

    // Transform Fineract transaction format to app format
    const formattedTransactions = (transactions.transactionItems || []).map((tx) => ({
      id: tx.id,
      type: tx.type?.value === 'DEPOSIT' ? 'received' : 'sent',
      amount: tx.amount,
      description: tx.description ?? (tx.type?.value === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'),
      timestamp: new Date(tx.date),
    }));

    const paginatedTransactions = formattedTransactions.slice((page - 1) * limit, page * limit);

    res.json({
      transactions: paginatedTransactions,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: formattedTransactions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
