import fs from 'fs';
import * as cheerio from 'cheerio';

let html = fs.readFileSync('public/ET_base.html', 'utf8');

const $ = cheerio.load(html);

// Remove headers
$('header').remove();
$('nav').remove();
$('.styles_logo_part__i4M1o').remove();
$('.styles_headerWrap__7gTKQ').remove();

// Remove all iframes (kills all 3rd party ads, doubleclick, etc)
$('iframe').remove();

// Remove top ad and arbitrary ad containers
$('.topAdContainer').remove();
$('.adContainer').remove();
$('[class*="AdContainer"]').remove();
$('[class*="adContainer"]').remove();
$('[id*="div-gpt-ad"]').remove();
$('[id*="google_ads"]').remove();
$('.bgImg').removeClass('bgImg');
$('.gutter').removeClass('gutter'); // sometimes used for skinning ads

// Add CSS to force background images away and remove paddings
$('head').append(`
<style>
/* Ensure no ad background skinning survives */
body, html, .pageWrap {
    background-image: none !important;
    background-color: transparent !important;
    padding-top: 0 !important;
    margin-top: 0 !important;
}
</style>
`);

// Block scripts from dynamically adding ads
$('head').append(`
<script>
window.googletag = { cmd: { push: function() {} } };
</script>
`);

fs.writeFileSync('public/ET_clean.html', $.html());
console.log("ET_clean.html rebuilt successfully with Cheerio!");
