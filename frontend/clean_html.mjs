import fs from 'fs';

const path = './public/ET_base.html';
console.log(`Reading ${path}...`);
let html = fs.readFileSync(path, 'utf8');

// The nuclear option: Remove all scripts
html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// The Ad-Killer CSS injected into head
const adKillerCSS = `
<style>
/* The "Ad-Killer" CSS */
[id^="div-gpt-ad"], 
[class*="ad-container"], 
[class*="ad-slot"],
.ad-wrapper,
#top-ad-banner {
    display: none !important;
    height: 0 !important;
    visibility: hidden !important;
}
</style>
`;
html = html.replace('</head>', adKillerCSS + '</head>');

fs.writeFileSync(path, html);
console.log('Cleaned ET_base.html successfully.');
