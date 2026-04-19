import { useMemo } from 'react';

// SVG icons for footer
const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function LetterPage({ formData, styles, bodyHtml }) {
  const stripBg = useMemo(() => {
    if (styles.stripStyle === 'none') return 'transparent';
    if (styles.stripStyle === 'solid') return styles.accentColor;
    // gradient
    return `linear-gradient(90deg, ${styles.accentColor}, ${adjustColor(styles.accentColor, 30)})`;
  }, [styles.accentColor, styles.stripStyle]);

  const watermarkSrc = useMemo(() => {
    if (!styles.watermarkEnabled) return null;
    if (styles.watermarkFromLogo && formData.companyLogo) return formData.companyLogo;
    if (!styles.watermarkFromLogo && styles.watermarkImage) return styles.watermarkImage;
    return null;
  }, [styles.watermarkEnabled, styles.watermarkFromLogo, styles.watermarkImage, formData.companyLogo]);

  return (
    <div
      className="a4-page shadow-xl mx-auto"
      style={{ fontFamily: styles.bodyFont, fontSize: `${styles.bodyFontSize}px` }}
    >
      {/* Top strip */}
      {styles.stripStyle !== 'none' && (
        <div style={{ height: '6px', background: stripBg }} />
      )}

      {/* Header — matches sample PDF: large bold company name */}
      <div className="px-10 pt-5 pb-3">
        <div className="flex items-center gap-5">
          {formData.companyLogo && (
            <img
              src={formData.companyLogo}
              alt="Logo"
              style={{ height: '70px', width: '70px', objectFit: 'contain' }}
            />
          )}
          <div className="flex-1">
            <h1
              style={{
                fontFamily: styles.headerFont,
                fontSize: '32px',
                fontWeight: 900,
                color: '#000',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              {formData.companyName}
            </h1>
            <p
              style={{
                fontSize: '10px',
                color: '#666',
                letterSpacing: '1.5px',
                marginTop: '4px',
                textTransform: 'capitalize',
              }}
            >
              {formData.companyAddress}
            </p>
          </div>
        </div>
        {/* Separator line under header */}
        <div style={{ height: '1.5px', backgroundColor: '#333', marginTop: '10px' }} />
      </div>

      {/* Watermark */}
      {watermarkSrc && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <img
            src={watermarkSrc}
            alt=""
            style={{
              opacity: styles.watermarkOpacity / 100,
              maxWidth: '50%',
              maxHeight: '50%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Body content */}
      <div className="px-10 py-4 relative" style={{ zIndex: 1 }}>
        {/* Heading */}
        <h2
          className="text-base font-bold mb-4"
          style={{ fontFamily: styles.headerFont }}
        >
          {formData.heading}
        </h2>

        {/* Ref number */}
        {formData.refNumber && (
          <p className="text-xs text-gray-400 mb-3">Ref: {formData.refNumber}</p>
        )}

        {/* Letter body */}
        <div
          className="letter-body"
          style={{ lineHeight: '1.5' }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>

      {/* Spacer to push footer down */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="mt-auto letter-footer">
        <div className="px-10 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <GlobeIcon />
              <span>{formData.companyWebsite}</span>
            </div>
            <span className="font-medium text-gray-600">{formData.companyName}</span>
            <div className="flex items-center gap-1.5">
              <MailIcon />
              <span>{formData.companyEmail}</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-1">{formData.companyAddress}</p>
        </div>

        {/* Bottom strip */}
        {styles.stripStyle !== 'none' && (
          <div style={{ height: '6px', background: stripBg }} />
        )}
      </div>
    </div>
  );
}

// Helper to lighten/darken a hex color
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
