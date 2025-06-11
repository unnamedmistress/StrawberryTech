const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create strawberry favicon as PNG buffers
async function createFavicons() {
  // Define the SVG content
  const svgContent = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#ee3a57"/>
  <circle cx="24" cy="24" r="15" fill="#f8b7b6"/>
  <circle cx="18" cy="19" r="2" fill="#333"/>
  <circle cx="30" cy="19" r="2" fill="#333"/>
  <path d="M16 28 C19 32, 29 32, 32 28" stroke="#333" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M24 10 L21 7 M24 10 L27 7" stroke="#6dbf4d" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;

  try {
    // Create PNG versions
    const svgBuffer = Buffer.from(svgContent);
    
    // Create 16x16 favicon
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(__dirname, '../public/favicon-16x16.png'));
    
    // Create 32x32 favicon  
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/favicon-32x32.png'));
    
    // Create 48x48 favicon
    await sharp(svgBuffer)
      .resize(48, 48)
      .png()
      .toFile(path.join(__dirname, '../public/favicon-48x48.png'));
    
    // Create 180x180 Apple touch icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon-180x180.png'));
    
    // Create 192x192 Android icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, '../public/android-chrome-192x192.png'));
    
    // Create 512x512 Android icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '../public/android-chrome-512x512.png'));

    console.log('✅ All favicon PNG files created successfully!');
    
    // Create the data URL fallback
    const compactSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="15" fill="#ee3a57"/><circle cx="16" cy="16" r="10" fill="#f8b7b6"/><circle cx="12" cy="13" r="1.5" fill="#333"/><circle cx="20" cy="13" r="1.5" fill="#333"/><path d="M11 19 C13 21, 19 21, 21 19" stroke="#333" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M16 8 L14 6 M16 8 L18 6" stroke="#6dbf4d" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`;
    const faviconDataUrl = `data:image/svg+xml;base64,${Buffer.from(compactSvg).toString('base64')}`;
    
    console.log('✅ Favicon data URL created for fallback support');
    
    return faviconDataUrl;
    
  } catch (error) {
    console.error('Error creating favicons:', error);
  }
}

createFavicons();
