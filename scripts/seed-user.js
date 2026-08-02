const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedUser() {
  try {
    const email = 'familyvania02@gmail.com';
    const password = 'F@mily2O26';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a user ID
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    
    // Insert user
    await pool.query(
      'INSERT INTO "user" (id, email, emailVerified, name, createdAt, updatedAt) VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [userId, email, true, 'Vania Family']
    );
    
    // Insert account with hashed password
    await pool.query(
      'INSERT INTO "account" (id, userId, providerId, accountId, password, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
      ['account_' + Math.random().toString(36).substr(2, 9), userId, 'credential', email, hashedPassword]
    );
    
    console.log('User created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', userId);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding user:', error);
    process.exit(1);
  }
}

seedUser();
