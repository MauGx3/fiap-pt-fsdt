#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testSuites = {
  unit: 'tests/models tests/middleware tests/controllers',
  integration: 'tests/routes tests/integration',
  auth: 'tests/middleware/auth.test.js tests/routes/auth.test.js',
  posts: 'tests/models/Post.test.js tests/routes/posts.test.js tests/controllers/posts.test.js',
  users: 'tests/models/User.test.js tests/routes/users.test.js',
  all: 'tests/',
  coverage: '--coverage tests/',
  watch: '--watch tests/'
};

const args = process.argv.slice(2);
const command = args[0] || 'all';

if (!testSuites[command]) {
  console.log('Available test commands:');
  Object.keys(testSuites).forEach(key => {
    console.log(`  npm run test:script ${key}`);
  });
  process.exit(1);
}

const jestArgs = [
  'NODE_ENV=test',
  'NODE_OPTIONS=--experimental-vm-modules',
  'jest',
  ...testSuites[command].split(' ')
];

const additionalArgs = args.slice(1);
if (additionalArgs.length > 0) {
  jestArgs.push(...additionalArgs);
}

console.log(`Running: ${jestArgs.join(' ')}`);

const child = spawn('npx', jestArgs, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'test' }
});

child.on('close', (code) => {
  process.exit(code);
});
