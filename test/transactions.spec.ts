import request from 'supertest'
import { app } from '../src/app'
import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest'
import knex from 'knex'
import { config } from '../knexfile'

const db = knex({
  ...config.test
})

beforeEach(async () => {
    await db('transactions').truncate()
})

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
  await db.destroy()
})

describe('Transaction routes', () => {
  it('should be able to create a new transaction', async () => {
    const response = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all transactions', async () => {
    const createResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createResponse.get('Set-Cookie') ?? [] // <- PEGA OS COOKIES

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies) // <- ENVIA OS COOKIES
      .expect(200)

      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createResponse.get('Set-Cookie') ?? [] // <- PEGA OS COOKIES

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies) // <- ENVIA OS COOKIES
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies) // <- ENVIA OS COOKIES
      .expect(200)

      expect(getTransactionResponse.body.transaction).toEqual(
        expect.objectContaining({
          ...createResponse.body
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createResponse.get('Set-Cookie') ?? [] // <- PEGA OS COOKIES

     await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit Transaction',
        amount: 2000,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies) // <- ENVIA OS COOKIES
      .expect(200)

      expect(summaryResponse.body.summary).toEqual({
        amount: 3000,
      })    
  })
})