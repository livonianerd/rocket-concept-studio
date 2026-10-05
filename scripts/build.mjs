import { cp, mkdir, rm } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
const project = new URL('../', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'src']) {
  await cp(new URL(entry, project), new URL(entry, output), { recursive: true });
}
console.log('Static site built in dist/');
