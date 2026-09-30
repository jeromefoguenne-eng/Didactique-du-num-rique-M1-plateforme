import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.md') || file.endsWith('.vue')) {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = getFiles('docs');
const urlRegex = /https?:\/\/[^\s\)\"\'><]+/g;

// Also look for mentions of videos, youtube, etc.
const foundUrls = new Map();

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    let url = match[0];
    // Clean trailing punctuation
    url = url.replace(/[\.,;:]+$/, '');
    if (!foundUrls.has(url)) {
      foundUrls.set(url, []);
    }
    foundUrls.get(url).push(file);
  }
});

console.log(`Total unique URLs in docs: ${foundUrls.size}`);

// Filter video or media URLs
const videoUrls = [];
const docDriveUrls = [];
const otherUrls = [];

for (const [url, files] of foundUrls.entries()) {
  const low = url.toLowerCase();
  if (low.includes('youtube') || low.includes('youtu.be') || low.includes('vimeo') || low.includes('dailymotion') || low.includes('video') || low.includes('watch?v=')) {
    videoUrls.push({ url, files });
  } else if (low.includes('drive.google.com') || low.includes('docs.google.com')) {
    docDriveUrls.push({ url, files });
  } else {
    otherUrls.push({ url, files });
  }
}

console.log('\n--- VIDEO URLS FOUND ---');
videoUrls.forEach(v => {
  console.log(`${v.url} (in ${v.files.join(', ')})`);
});

console.log('\n--- GOOGLE DOCS / DRIVE URLS FOUND ---');
docDriveUrls.forEach(v => {
  console.log(`${v.url} (in ${v.files.join(', ')})`);
});
