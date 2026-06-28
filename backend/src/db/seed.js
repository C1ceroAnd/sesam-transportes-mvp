require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./index');

const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_LOGIN || !ADMIN_PASSWORD) {
  console.error('Erro: ADMIN_LOGIN e ADMIN_PASSWORD devem ser definidos no .env');
  process.exit(1);
}
const SALT_ROUNDS = 10;

function seed() {
  const senhaHash = bcrypt.hashSync(ADMIN_PASSWORD, SALT_ROUNDS);

  db.prepare(`INSERT OR IGNORE INTO usuarios (login, senha_hash) VALUES (?, ?)`)
    .run(ADMIN_LOGIN, senhaHash);

  db.prepare(`INSERT OR IGNORE INTO motoristas (id, nome) VALUES (1, 'Henrique')`)
    .run();
  db.prepare(`INSERT OR IGNORE INTO motoristas (id, nome) VALUES (2, 'Claudio')`)
    .run();

  console.log('Seed concluído: Admin, Henrique, Claudio inseridos (ou já existiam).');
}

seed();
