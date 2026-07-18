const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  console.log("Connecting to:", process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@'));
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    
    const email = 'buyer@artcraft.com';
    const hashedPassword = await bcrypt.hash('password123', 10);
    const id = 'cl' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    await client.query(`
      INSERT INTO "User" (id, name, email, password, role, "updatedAt") 
      VALUES ($1, $2, $3, $4, 'BUYER', NOW())
      ON CONFLICT (email) DO NOTHING
    `, [id, 'Test Buyer', email, hashedPassword]);
    
    console.log('Successfully created test buyer user: buyer@artcraft.com (password: password123)');
  } catch (error) {
    console.error('Database Error:', error);
  } finally {
    await client.end();
  }
}

main();
