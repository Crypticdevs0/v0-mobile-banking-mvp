import { jest, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { app } from '../server.js';

import * as fineractServiceModule from '../services/fineractService.js';

describe('POST /api/auth/login', () => {
  it('should reject the hardcoded credentials', async () => {
    const loginSpy = jest.spyOn(fineractServiceModule.fineractService, 'login');
    loginSpy.mockRejectedValue(new Error('Invalid credentials'));

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@bank.com', password: 'password123' });

    expect(response.status).toBe(401);

    loginSpy.mockRestore();
  });

  it('should return a token for valid credentials', async () => {
    const loginSpy = jest.spyOn(fineractServiceModule.fineractService, 'login');
    loginSpy.mockResolvedValue({
      userId: 1,
      username: 'test@test.com',
      officeId: 1,
      officeName: 'Head Office',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();

    loginSpy.mockRestore();
  });
});
