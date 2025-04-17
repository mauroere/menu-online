const crypto = require('crypto')

// Generar un secret seguro
const secret = crypto.randomBytes(32).toString('base64')

console.log('🔑 Generated secure NEXTAUTH_SECRET:')
console.log(secret)

console.log('\n⚠️ IMPORTANT: Make sure to set this secret in your production environment!')
console.log('Add this to your .env file:')
console.log(`NEXTAUTH_SECRET="${secret}"`) 