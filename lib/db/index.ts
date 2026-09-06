import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Fix Node.js 22 IPv6 Happy Eyeballs bug in undici/fetch without importing Node native HTTP/HTTPS modules into Next.js
if (typeof window === 'undefined') {
  try {
    /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
    const { Agent, setGlobalDispatcher } = require('undici')
    const dns = require('dns')
    setGlobalDispatcher(
      new Agent({
        connect: {
          lookup: (hostname: string, _options: any, cb: any) => {
            dns.lookup(hostname, { family: 4 }, (err: any, address: string, family: number) => {
              cb(err, [{ address, family }])
            })
          },
        },
      })
    )
    /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
  } catch {
    // Ignore in non-Node environments
  }
}

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
