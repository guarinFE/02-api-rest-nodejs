import { FastifyInstance } from 'fastify';
import { date, z } from 'zod';
import { randomUUID } from 'node:crypto';
import { db } from '../database';
import knex from 'knex';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method}] [${request.url}]`)
  })

  app.get('/', {preHandler: [checkSessionIdExists]}, async (request, reply) => {
    const { sessionId } = request.cookies

    const transactions = await db('transactions')
      .where('session_id', sessionId)
      .select()

    return { transactions }
  })



  app.get('/:id', {preHandler: [checkSessionIdExists]}, async (request) =>{
    const getTransactionParamsSchema = z.object ({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const { sessionId } = request.cookies

    const transaction = await db('transactions').where('id', id)
    .where({
      session_id: sessionId,
      id: id,
    })

    return { transaction }
  })



  app.get('/summary', {preHandler: [checkSessionIdExists]}, async (request) =>{
    
    const { sessionId } = request.cookies

    const summary = await db('transactions')
    .where('session_id', sessionId)
    .sum('amount', { as: 'amount'})
    .first()

    return { summary };
  })



  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(request.body,)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID() 

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 Days
      })
    }

    await db('transactions').insert({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })

      return reply.status(201).send()
  });


}
