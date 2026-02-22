const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let changes = 0;

// The issue: In the original HTML, the images are wrapped in <a> tags like this:
// <a class="lazyImage..." href="?utm_source=organic...">
// Or the href attribute is empty / pointing to the current page, which causes a reload / scroll to top.

// We need to find all <a> tags that are NOT the checkout button and either:
// 1. Remove them entirely (unwrap the image)
// OR 2. Change their href to "javascript:void(0)" so they don't do anything

// Let's go with option 2: change href to javascript:void(0) for all lazyImage links
// This is safer than unwrapping because it preserves the exact HTML structure and CSS classes.

html = html.replace(/<a([^>]*class="lazyImage"[^>]*)href="([^"]*)"([^>]*)>/gi, (match, prefix, oldHref, suffix) => {
    changes++;
    return `<a${prefix}href="javascript:void(0)"${suffix} style="cursor: default;">`;
});

// What if class comes after href?
html = html.replace(/<a([^>]*)href="([^"]*)"([^>]*class="lazyImage"[^>]*)>/gi, (match, prefix, oldHref, suffix) => {
    if (match.includes('javascript:void(0)')) return match; // Already fixed
    changes++;
    return `<a${prefix}href="javascript:void(0)"${suffix} style="cursor: default;">`;
});

// Let's also find ANY generic `href=""` or `href="?"` or `href="#"` tags that aren't the checkout
html = html.replace(/<a([^>]*)href="(\?|#|)"([^>]*)>/gi, (match, prefix, oldHref, suffix) => {
    if (match.includes('pay.tatamedeferro.com')) return match;
    changes++;
    return `<a${prefix}href="javascript:void(0)"${suffix} style="cursor: default;">`;
});

// Finally, make sure all theme-button links (the actual CTA) still have the right link
const ctaLink = "https://pay.tatamedeferro.com/checkout/v5/nvqWVFz7oWCPEGQZJDw0";
let ctaCount = 0;
html = html.replace(/<a([^>]*)class="theme-button([^"]*)"([^>]*)href="([^"]*)"([^>]*)>/gi, (match, p1, p2, p3, oldHref, p4) => {
    ctaCount++;
    return `<a${p1}class="theme-button${p2}"${p3}href="${ctaLink}"${p4}>`;
});
// And if href comes before class
html = html.replace(/<a([^>]*)href="([^"]*)"([^>]*)class="theme-button([^"]*)"([^>]*)>/gi, (match, p1, oldHref, p2, p3, p4) => {
    if (match.includes(ctaLink)) { return match; } // Already handled
    ctaCount++;
    return `<a${p1}href="${ctaLink}"${p2}class="theme-button${p3}"${p4}>`;
});

console.log(`Fixed ${changes} image/empty links to javascript:void(0)`);
console.log(`Ensured ${ctaCount} CTA buttons point to checkout`);

fs.writeFileSync('index.html', html, 'utf8');
