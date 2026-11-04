// Prints bcrypt hashes for the passwords given on the command line.
// Usage: node scripts/hash-passwords.js "Password1" "Password2"
import bcrypt from 'bcryptjs';

for (const password of process.argv.slice(2)) {
  console.log(`${password}\t${bcrypt.hashSync(password, 10)}`);
}
