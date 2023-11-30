#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const codegen = require('../lib/cjs/codegen').codegen;

(async () => {
  await codegen(
    path.join(__dirname, '..'),
    JSON.parse(fs.readFileSync('.ojotasrc.json').toString()),
    process.argv[2],
  );
})();
