import bcrypt from 'bcryptjs';

const password = 'Demo!234';
const hash = await bcrypt.hash(password, 10);
console.log('Password hash:', hash);
