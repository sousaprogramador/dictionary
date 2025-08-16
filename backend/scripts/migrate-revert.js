const path = require('path');
const dsModule = require(
  path.join(__dirname, '..', 'dist', 'infra', 'database', 'data-source.js'),
);
const dataSource = dsModule.default || dsModule.dataSource || dsModule;

(async () => {
  try {
    await dataSource.initialize();
    await dataSource.undoLastMigration();
    await dataSource.destroy();
    process.exit(0);
  } catch (e) {
    console.error('Migration revert error:', e);
    process.exit(1);
  }
})();
