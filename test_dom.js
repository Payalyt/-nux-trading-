const fs = require('fs');

// We can't really parse the live DOM easily without JSDOM, but we can look for specific class names.
// Alternatively, let me use the exact CSS selector on the generated HTML using JSDOM.
