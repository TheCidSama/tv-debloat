// Capture screenshots of the AeroTizen launcher running on a Samsung TV.
//
// 1. In another terminal: aerotizen --tv TV_IP inspect launcher
//    (forwards the launcher's DevTools to http://127.0.0.1:9222; retry once if it times out)
// 2. node tv_screenshots.mjs <out-dir> [port]
//
// It walks the screens with simulated remote keys: Home, a focused app, the inputs row,
// All apps and Settings. The weather location is hidden while capturing (nothing is
// saved on the TV). Check every image before sharing: app names and clock are visible.
// Needs Node 22+ (global WebSocket). Stop the inspector afterwards and relaunch the
// launcher normally: aerotizen --tv TV_IP launch DclHome001.Home
import { mkdirSync, writeFileSync } from 'node:fs';

const out = process.argv[2] || 'tv-screenshots';
const port = process.argv[3] || '9222';
mkdirSync(out, { recursive: true });

const [target] = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject); });
let id = 0; const pending = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
});
const send = (method, params = {}) => new Promise(resolve => { const n = ++id; pending.set(n, resolve); ws.send(JSON.stringify({ id: n, method, params })); });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value;
const CODES = { Left: 37, Up: 38, Right: 39, Down: 40 };
const key = async name => {
  const c = CODES[name], base = { windowsVirtualKeyCode: c, nativeVirtualKeyCode: c, key: 'Arrow' + name, code: 'Arrow' + name };
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await sleep(700);
};
const shot = async name => {
  await sleep(900);
  const result = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${out}/${name}.png`, Buffer.from(result.result.data, 'base64'));
  console.log('saved', `${out}/${name}.png`);
};
const page = () => evaluate("document.querySelector('.home-page-surface')?.dataset.page");

await evaluate("(function(){var s=document.createElement('style');s.id='shot-privacy';s.textContent='#weather > span{display:none}';document.head.appendChild(s);})()");
if (await evaluate('AeroTizen.settingsUi.isOpen()')) { await evaluate('AeroTizen.settingsUi.close()'); }
// Start from the first Home app, wherever focus was left.
for (let i = 0; i < 3 && await evaluate("!document.querySelector('#grid .tile.focused')"); i++) {
  if (await page() === 'apps') { await key('Up'); for (let j = 0; j < 3; j++) await key('Left'); }
  await key('Down');
}
for (let i = 0; i < 6; i++) await key('Left');
await sleep(1500);

await shot('01-home');
await key('Right'); await key('Right');
await shot('02-focus-halo');
await key('Down');
await shot('03-inputs');
await key('Up'); await key('Up'); await key('Right');
await shot('04-all-apps');
await key('Left');
await evaluate('AeroTizen.settingsUi.open()');
await shot('05-settings');
await evaluate('AeroTizen.settingsUi.close()');
await evaluate("document.getElementById('shot-privacy')?.remove()");
ws.close();
