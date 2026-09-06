import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import nodeFetch from 'node-fetch'
import https from 'https'

const agent = new https.Agent({ family: 4 })

neonConfig.fetchFunction = (url: any, init: any) => {
  return (nodeFetch as any)(url, { ...init, agent })
}

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
