const http = require('http');

http.get('http://localhost:3000/', res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const regex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      console.log('Stylesheet link:', match[0]);
    }
  });
});
