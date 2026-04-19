// Deep-clone element with ALL computed styles inlined on every node.
function cloneWithInlineStyles(source) {
  const clone = source.cloneNode(false);
  const cs = window.getComputedStyle(source);
  for (let i = 0; i < cs.length; i++) {
    const prop = cs[i];
    clone.style.setProperty(prop, cs.getPropertyValue(prop));
  }
  for (const child of source.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      clone.appendChild(cloneWithInlineStyles(child));
    } else {
      clone.appendChild(child.cloneNode(true));
    }
  }
  return clone;
}

export async function exportToPdf(element) {
  const styledClone = cloneWithInlineStyles(element);

  // Reset page container for print flow
  styledClone.style.minHeight = 'auto';
  styledClone.style.maxHeight = 'none';
  styledClone.style.height = 'auto';
  styledClone.style.boxShadow = 'none';
  styledClone.style.margin = '0';
  styledClone.style.width = '100%';
  styledClone.style.maxWidth = '210mm';
  styledClone.style.padding = '0';
  styledClone.style.boxSizing = 'border-box';
  styledClone.style.display = 'block';
  styledClone.style.overflow = 'visible';
  styledClone.style.position = 'relative';
  styledClone.style.background = 'transparent';
  styledClone.style.backgroundColor = 'transparent';

  // Remove ALL box-shadows and fix overflow on children
  styledClone.querySelectorAll('*').forEach((el) => {
    if (el.style.boxShadow && el.style.boxShadow !== 'none') {
      el.style.boxShadow = 'none';
    }
    // Fix overflow hidden that can cause blank pages
    if (el.style.overflow === 'hidden' || el.style.overflow === 'auto') {
      el.style.overflow = 'visible';
    }
  });

  // Extract footer from clone — position:fixed at bottom of every page
  const footer = styledClone.querySelector('.letter-footer');
  let footerHtml = '';
  if (footer) {
    const footerClone = footer.cloneNode(true);
    footerClone.style.position = 'fixed';
    footerClone.style.bottom = '0';
    footerClone.style.left = '0';
    footerClone.style.right = '0';
    footerClone.style.width = '100%';
    footerClone.style.boxSizing = 'border-box';
    footerClone.style.margin = '0';
    footerClone.style.padding = '0';
    footerClone.style.zIndex = '100';
    footerClone.style.background = 'white';

    Array.from(footerClone.children).forEach((child) => {
      child.style.width = '100%';
      child.style.maxWidth = '100%';
      child.style.boxSizing = 'border-box';
    });

    footerHtml = footerClone.outerHTML;
    footer.remove();
  }

  // Extract watermark and make it fixed (repeats on every printed page)
  // Look for the watermark div: has position:absolute, contains an img, covers the page
  let watermarkDiv = styledClone.querySelector('[class*="absolute"][class*="inset-0"]');
  if (!watermarkDiv) {
    // Fallback: find by inlined styles (absolute + has img child)
    watermarkDiv = Array.from(styledClone.children).find(
      (el) => el.style.position === 'absolute' && el.querySelector('img')
    ) || null;
  }
  let watermarkHtml = '';
  if (watermarkDiv) {
    const wmClone = watermarkDiv.cloneNode(true);
    wmClone.style.position = 'fixed';
    wmClone.style.top = '0';
    wmClone.style.left = '0';
    wmClone.style.right = '0';
    wmClone.style.bottom = '0';
    wmClone.style.width = '100%';
    wmClone.style.height = '100%';
    wmClone.style.display = 'flex';
    wmClone.style.alignItems = 'center';
    wmClone.style.justifyContent = 'center';
    wmClone.style.pointerEvents = 'none';
    wmClone.style.zIndex = '1';
    watermarkHtml = wmClone.outerHTML;
    watermarkDiv.remove();
  }

  // Extract the top strip and make it a fixed header on every page
  const topStrip = styledClone.children[0];
  let topStripHtml = '';
  if (topStrip && topStrip.style.height === '6px') {
    const stripClone = topStrip.cloneNode(true);
    stripClone.style.position = 'fixed';
    stripClone.style.top = '0';
    stripClone.style.left = '0';
    stripClone.style.right = '0';
    stripClone.style.width = '100%';
    stripClone.style.zIndex = '100';
    topStripHtml = stripClone.outerHTML;
    topStrip.remove();
  }

  // Remove empty spacer divs (direct children with no content/children)
  // cloneWithInlineStyles bakes computed height on flex-1 spacers, causing blank pages
  Array.from(styledClone.children).forEach((child) => {
    if (!child.textContent.trim() && child.children.length === 0) {
      child.remove();
    }
  });

  // Also zero out margin-top:auto and collapse any remaining hidden spacers
  styledClone.querySelectorAll('*').forEach((el) => {
    if (el.style.marginTop === 'auto') {
      el.style.marginTop = '0';
    }
    // Collapse any remaining empty flex-grow elements
    const fg = el.style.getPropertyValue('flex-grow');
    if (fg && parseFloat(fg) >= 1 && !el.textContent.trim() && el.children.length === 0) {
      el.style.height = '0';
      el.style.minHeight = '0';
      el.style.maxHeight = '0';
      el.style.overflow = 'hidden';
    }
  });

  // Collect Google Fonts links
  const fontLinks = [];
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.href && link.href.includes('fonts.googleapis.com')) {
      fontLinks.push(link.outerHTML);
    }
  });

  // Build iframe
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:210mm;height:297mm;border:none;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  // Add negative top margin to content so the thead space is cancelled on page 1
  styledClone.style.marginTop = '-10mm';

  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Offer Letter</title>
  ${fontLinks.join('\n')}
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html {
      background: white;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent;
      width: 210mm;
      overflow: visible !important;
    }
    .signature-block {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .print-table {
      width: 100%;
      border-collapse: collapse;
    }
    .print-table td {
      padding: 0;
      border: none;
    }
    .print-header-space { height: 10mm; }
    .print-footer-space { height: 24mm; }
  </style>
</head>
<body>
  <!-- Fixed elements repeat on every printed page -->
  ${topStripHtml}
  ${watermarkHtml}
  ${footerHtml}

  <table class="print-table">
    <thead><tr><td><div class="print-header-space"></div></td></tr></thead>
    <tfoot><tr><td><div class="print-footer-space"></div></td></tr></tfoot>
    <tbody><tr><td style="position:relative;z-index:2;">
      ${styledClone.outerHTML}
    </td></tr></tbody>
  </table>
</body>
</html>`);
  iframeDoc.close();

  // Wait for iframe load + fonts
  await new Promise((resolve) => {
    iframe.contentWindow.addEventListener('load', resolve);
    setTimeout(resolve, 3000);
  });
  await new Promise((r) => setTimeout(r, 800));

  iframe.contentWindow.focus();
  iframe.contentWindow.print();

  setTimeout(() => document.body.removeChild(iframe), 5000);
}
