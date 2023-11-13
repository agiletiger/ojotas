#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires
var codegen = require('../lib/cjs/codegen').codegen;

(async () => {
  await codegen(__dirname, process.argv[2]);
})();
