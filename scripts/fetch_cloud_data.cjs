process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');
const fs = require('fs');

const url = 'https://script.google.com/macros/s/AKfycbyXrQliTRTuzUZHcP54tjGb9KMRlznKHODC08561nTw1_5h1wjHYa_GpBc30UfrcUFg9w/exec?action=syncAll';

function get(u) {
  https.get(u, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return get(res.headers.location);
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Status:', json.status);
        if (json.data) {
          fs.writeFileSync('scripts/cloud_dump.json', JSON.stringify(json.data, null, 2), 'utf8');
          console.log('Cloud data written to scripts/cloud_dump.json');
          console.log('Users:', (json.data.users || []).length);
          console.log('Files:', (json.data.submittedFiles || []).length);
          console.log('Submissions:', (json.data.submissions || []).length);
          console.log('Quizzes:', (json.data.quizAttempts || []).length);
        }
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    });
  }).on('error', err => console.error(err));
}

get(url);
