/**
 * Seed script — creates the initial admin user.
 * Run once after pushing the schema:
 *   npm run seed
 *
 * Reads credentials from environment variables:
 *   SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */
import { db } from '../lib/db'
import { users } from '../lib/db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function seed() {
  const name = process.env.SEED_ADMIN_NAME
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!name || !email || !password) {
    console.error(
      'Error: SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD must be set in .env.local',
    )
    process.exit(1)
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Check if admin already exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (existing[0]) {
    console.log(`Admin user with email "${normalizedEmail}" already exists. Skipping.`)
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.insert(users).values({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'admin',
    isActive: true,
  })

  console.log(`Admin user created successfully.`)
  console.log(`  Email: ${normalizedEmail}`)
  console.log(`  Name:  ${name}`)
  console.log(`  Role:  admin`)
  console.log(`\nIMPORTANT: Change the password immediately after first login.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
