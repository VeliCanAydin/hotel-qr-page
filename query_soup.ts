import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id, template_id, name, allergens FROM menu_template_items WHERE name ILIKE '%mercimek%' OR name ILIKE '%lentil%'`;
  console.log(rows);
}
main().catch(console.error);
