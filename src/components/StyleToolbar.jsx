const headerFonts = [
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Merriweather', value: 'Merriweather' },
];

const bodyFonts = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Segoe UI', value: 'Segoe UI' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Roboto', value: 'Roboto' },
];

export default function StyleToolbar({ styles, updateStyles }) {
  return (
    <div className="p-4 space-y-5 text-sm">
      {/* Accent Color */}
      <Field label="Accent Strip Color">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={styles.accentColor}
            onChange={(e) => updateStyles('accentColor', e.target.value)}
            className="w-10 h-8 rounded cursor-pointer border border-gray-300"
          />
          <input
            type="text"
            value={styles.accentColor}
            onChange={(e) => updateStyles('accentColor', e.target.value)}
            className="input-field w-28 font-mono text-xs"
          />
          <button
            onClick={() => updateStyles('accentColor', '#F97316')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Reset
          </button>
        </div>
      </Field>

      {/* Strip Style */}
      <Field label="Strip Style">
        <div className="flex gap-2">
          {['gradient', 'solid', 'none'].map((s) => (
            <button
              key={s}
              onClick={() => updateStyles('stripStyle', s)}
              className={`px-3 py-1.5 text-xs rounded capitalize ${
                styles.stripStyle === s
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>

      <hr className="border-gray-200" />

      {/* Header Font */}
      <Field label="Header Font">
        <select
          value={styles.headerFont}
          onChange={(e) => updateStyles('headerFont', e.target.value)}
          className="input-field"
        >
          {headerFonts.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400" style={{ fontFamily: styles.headerFont }}>
          Preview: {styles.headerFont}
        </p>
      </Field>

      {/* Body Font */}
      <Field label="Body Font">
        <select
          value={styles.bodyFont}
          onChange={(e) => updateStyles('bodyFont', e.target.value)}
          className="input-field"
        >
          {bodyFonts.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Body Font Size */}
      <Field label={`Body Font Size: ${styles.bodyFontSize}px`}>
        <input
          type="range"
          min="12"
          max="18"
          value={styles.bodyFontSize}
          onChange={(e) => updateStyles('bodyFontSize', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>12px</span>
          <span>18px</span>
        </div>
      </Field>

      <hr className="border-gray-200" />

      {/* Watermark */}
      <Field label="Watermark">
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={styles.watermarkEnabled}
              onChange={(e) => updateStyles('watermarkEnabled', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Enable watermark</span>
          </label>

          {styles.watermarkEnabled && (
            <>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={styles.watermarkFromLogo}
                  onChange={(e) => updateStyles('watermarkFromLogo', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Auto from logo</span>
              </label>

              {!styles.watermarkFromLogo && (
                <label className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs inline-block transition-colors">
                  Upload watermark
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => updateStyles('watermarkImage', ev.target.result);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              )}

              <Field label={`Opacity: ${styles.watermarkOpacity}%`}>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={styles.watermarkOpacity}
                  onChange={(e) => updateStyles('watermarkOpacity', Number(e.target.value))}
                  className="w-full"
                />
              </Field>
            </>
          )}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
