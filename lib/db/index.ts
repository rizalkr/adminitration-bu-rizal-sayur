import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import fetch from 'node-fetch'
import https from 'https'
import * as schema from './schema'

// Fix for Node.js 22 IPv6 Happy Eyeballs bug in this environment
const agent = new https.Agent({ family: 4 })
neonConfig.fetchFunction = (url: any, init: any) => {
  return fetch(url, { ...init, agent })
}

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })
