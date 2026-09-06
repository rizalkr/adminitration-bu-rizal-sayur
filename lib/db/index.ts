import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Fix for Node.js 22 IPv6 Happy Eyeballs bug in development environment
if (typeof process !== 'undefined' && process.release?.name === 'node') {
  try {
    // Use dynamic requires to hide these from Next.js Edge Runtime static analysis
    const nodeFetch = require('node' + '-fetch')
    const https = require('ht' + 'tps')
    const agent = new https.Agent({ family: 4 })
    neonConfig.fetchFunction = (url: any, init: any) => {
      return nodeFetch(url, { ...init, agent })
    }
  } catch (err) {
    console.error("Failed to inject IPv4 fetch agent", err)
  }
}

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
