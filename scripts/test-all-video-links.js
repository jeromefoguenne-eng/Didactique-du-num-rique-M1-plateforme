import fs from 'fs';
import https from 'https';

const filesToInspect = [
  'docs/modules/01-2-education-aux-medias.md',
  'docs/modules/10-capsule-video.md',
  'docs/modules/02-referentiel-fmttn.md',
  'docs/modules/03-2-pedagogie-projet.md'
];

const urlRegex = /https?:\/\/[^\s\)\"\'><]+/g;
const links = [];

filesToInspect.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = urlRegex.exec(content)) !== null) {
    let u = m[0].replace(/[\.,;:]+$/, '');
    if (u.includes('youtube') || u.includes('youtu.be') || u.includes('drive.google.com/file')) {
      links.push({ file: f, url: u });
    }
  }
});

console.log(`Found ${links.length} video links to check.\n`);

function checkUrl(url) {
  return new Promise(resolve => {
    try {
      const parsed = new URL(url);
      const req = https.request({
        method: 'HEAD',
        host: parsed.host,
        path: parsed.pathname + parsed.search,
        rejectUnauthorized: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }, res => {
        resolve({
          status: res.statusCode,
          location: res.headers.location || null
        });
      });
      req.on('error', err => {
        resolve({ status: 'ERR', error: err.message });
      });
      req.setTimeout(8000, () => {
        req.destroy();
        resolve({ status: 'TIMEOUT' });
      });
      req.end();
    } catch (e) {
      resolve({ status: 'PARSE_ERR', error: e.message });
    }
  });
}

async function run() {
  let okCount = 0;
  let failCount = 0;
  for (let i = 0; i < links.length; i++) {
    const item = links[i];
    const res = await checkUrl(item.url);
    const ok = res.status >= 200 && res.status < 400;
    if (ok) okCount++; else failCount++;
    console.log(`[${ok ? 'OK' : 'FAIL'} ${res.status}] ${item.url}`);
    if (res.location) {
      console.log(`   -> Redirects to: ${res.location.substring(0, 80)}...`);
    }
    if (!ok) {
      console.log(`   File: ${item.file} | Error: ${res.error || res.status}`);
    }
  }
  console.log(`\nSummary: ${okCount} OK, ${failCount} FAIL out of ${links.length} links.`);
}

run();
