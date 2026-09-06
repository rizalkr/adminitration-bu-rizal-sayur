import { db } from "./lib/db/index";
import { users } from "./lib/db/schema";
async function run() {
  try {
    const res = await db.select().from(users);
    console.log("DB SUCCESS:", res.length, "users found.");
  } catch (e) {
    console.log("DB ERROR:", e);
  }
}
run();
