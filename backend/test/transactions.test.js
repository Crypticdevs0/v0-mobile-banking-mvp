import { jest, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import * as fineractServiceModule from '../services/fineractService.js';

// Mock the verifyToken middleware
const verifyToken = (req, res, next) => {
  req.user = { accountId: '123' };
  next();
};

// Create a new express app for testing
const app = express();
app.use(express.json());

// Import the transactions route
import transactionsRouter from '../routes/transactions.js';
app.use('/api/transactions', verifyToken, transactionsRouter);

describe('GET /api/transactions', () => {
  it('should preserve an empty description', async () => {
    // Mock the fineractService to return a transaction with an empty description
    const getAccountTransactionsSpy = jest.spyOn(fineractServiceModule.fineractService, 'getAccountTransactions');
    getAccountTransactionsSpy.mockResolvedValue({
      transactionItems: [
        {
          id: 1,
          type: { value: 'DEPOSIT' },
          amount: 100,
          description: '',
          date: new Date().toISOString(),
        },
      ],
    });

    const response = await request(app).get('/api/transactions');

    expect(response.status).toBe(200);
    expect(response.body.transactions[0].description).toBe('');

    getAccountTransactionsSpy.mockRestore();
  });

  it('should use a default description when the description is null', async () => {
    // Mock the fineractService to return a transaction with a null description
    const getAccountTransactionsSpy = jest.spyOn(fineractServiceModule.fineractService, 'getAccountTransactions');
    getAccountTransactionsSpy.mockResolvedValue({
      transactionItems: [
        {
          id: 1,
          type: { value: 'DEPOSIT' },
          amount: 100,
          description: null,
          date: new Date().toISOString(),
        },
      ],
    });

    const response = await request(app).get('/api/transactions');

    expect(response.status).toBe(200);
    expect(response.body.transactions[0].description).toBe('Deposit');

    getAccountTransactionsSpy.mockRestore();
  });
});
