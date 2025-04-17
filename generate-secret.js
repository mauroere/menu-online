const crypto = require('crypto')

// Genera un secreto seguro de 32 bytes (256 bits) y lo codifica en base64
const secret = crypto.randomBytes(32).toString('base64')

console.log('Generated NEXTAUTH_SECRET:')
console.log(secret)

console.log('\nAdd this to your .env file or Railway environment variables:')
console.log(`NEXTAUTH_SECRET=${secret}`) 