const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('dist/index.html', 'utf8');
// This won't work because it's a React SPA and dist/index.html has no content.
// We need to render the React app to string, or just render it using JSDOM by loading the script.
