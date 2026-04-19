import { useRef, useState, useEffect, useCallback } from 'react';
import SignaturePad from 'signature_pad';
import { compressImage } from '../utils/imageCompress';

export default function SignatureBlock({ label, value, onChange }) {
  const [mode, setMode] = useState('upload'); // upload | draw
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current && !padRef.current) {
      padRef.current = new SignaturePad(canvasRef.current, {
        penColor: '#000',
        backgroundColor: 'rgba(255,255,255,0)',
      });
    }
    return () => {
      if (padRef.current) {
        padRef.current.off();
        padRef.current = null;
      }
    };
  }, [mode]);

  const handleUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const compressed = await compressImage(file, 300, 0.8);
      onChange(compressed);
    },
    [onChange]
  );

  const handleSaveDrawing = useCallback(() => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    const data = padRef.current.toDataURL('image/png');
    onChange(data);
  }, [onChange]);

  const handleClearDrawing = useCallback(() => {
    if (padRef.current) padRef.current.clear();
    onChange(null);
  }, [onChange]);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setMode('upload')}
          className={`px-2 py-1 text-xs rounded ${
            mode === 'upload' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setMode('draw')}
          className={`px-2 py-1 text-xs rounded ${
            mode === 'draw' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Draw
        </button>
      </div>

      {mode === 'upload' && (
        <div className="flex items-center gap-2">
          {value && <img src={value} alt="Signature" className="h-12 object-contain" />}
          <label className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs transition-colors">
            {value ? 'Change' : 'Upload Image'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          {value && (
            <button onClick={() => onChange(null)} className="text-xs text-red-500 hover:text-red-700">
              Remove
            </button>
          )}
        </div>
      )}

      {mode === 'draw' && (
        <div>
          <canvas
            ref={canvasRef}
            width={350}
            height={120}
            className="signature-canvas w-full bg-white"
          />
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleSaveDrawing}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Save
            </button>
            <button
              onClick={handleClearDrawing}
              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Clear
            </button>
          </div>
          {value && (
            <div className="mt-2">
              <p className="text-xs text-gray-400">Saved signature:</p>
              <img src={value} alt="Signature" className="h-12 object-contain mt-1" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
