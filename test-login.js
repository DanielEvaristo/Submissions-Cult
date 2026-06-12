const bcrypt = require('bcryptjs');

// Hash de la BD
const hashDB = '$2b$12$gVYzY8LndaSnJzQkmgV4Uej8O9cFHbtDeYmFChhuJuhE7j/tlt37m';

// Contraseña de prueba
const testPassword = '123';

bcrypt.compare(testPassword, hashDB, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password "123" matches:', result);
  }
});
