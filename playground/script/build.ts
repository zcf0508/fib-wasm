import * as fs from 'node:fs';

// copy wasm
fs.cpSync('../build/release.wasm', '.output/server/release.wasm');
