const fs = require('fs');
const path = require('path');

// Create a simple favicon data URL that works across all browsers
const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="15" fill="#ee3a57"/>
  <circle cx="16" cy="16" r="10" fill="#f8b7b6"/>
  <circle cx="12" cy="13" r="1.5" fill="#333"/>
  <circle cx="20" cy="13" r="1.5" fill="#333"/>
  <path d="M11 19 C13 21, 19 21, 21 19" stroke="#333" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M16 8 L14 6 M16 8 L18 6" stroke="#6dbf4d" stroke-width="1.5" stroke-linecap="round" fill="none"/>
</svg>`;

// Convert SVG to base64
const faviconBase64 = Buffer.from(faviconSvg).toString('base64');
const faviconDataUrl = `data:image/svg+xml;base64,${faviconBase64}`;

console.log('Generated favicon data URL:');
console.log(faviconDataUrl);

// Create a simple HTML test file
const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Favicon Test</title>
    <link rel="icon" href="${faviconDataUrl}" />
    <link rel="shortcut icon" href="${faviconDataUrl}" />
</head>
<body>
    <h1>Favicon Test</h1>
    <p>Check the browser tab for the favicon</p>
    <img src="${faviconDataUrl}" alt="Favicon" style="width: 64px; height: 64px;" />
</body>
</html>`;

// Write test file
fs.writeFileSync(path.join(__dirname, '../public/favicon-test-simple.html'), testHtml);

console.log('Created favicon-test-simple.html for testing');
