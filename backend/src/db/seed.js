const bcrypt = require('bcryptjs');
const db = require('./index');

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'Admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminTransportes';
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
