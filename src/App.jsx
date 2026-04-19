import { useState, useRef, useCallback, useEffect } from 'react';
import FormPanel from './components/FormPanel';
import Preview from './components/Preview';
import StyleToolbar from './components/StyleToolbar';
import StorageManager from './components/StorageManager';
import { generateRefNumber } from './utils/refNumber';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { exportToPdf } from './utils/pdfExport';

const today = new Date().toISOString().split('T')[0];

const defaultFormData = {
  refNumber: '',
  companyLogo: null,
  companyName: 'Blazing Render Creation Hub LLP',
  companyAddress: 'Toranagallu, Ballari (dist.), Sandur (taluk), Karnataka - 583123',
  companyWebsite: 'www.thebrchub.tech',
  companyEmail: 'info@thebrchub.tech',
  candidateName: '',
  candidateEmail: '',
  position: '',
  engagementType: 'Part-Time',
  date: today,
  heading: 'OFFER LETTER',
  sections: [],
  signatoryName: '',
  signatoryTitle: '',
  signatorySignature: null,
  showCandidateSignature: true,
  candidateSignature: null,
};

const defaultStyles = {
  accentColor: '#F97316',
  headerFont: 'Playfair Display',
  bodyFont: 'Inter',
  bodyFontSize: 14,
  watermarkEnabled: true,
  watermarkFromLogo: true,
  watermarkImage: null,
  watermarkOpacity: 15,
  stripStyle: 'gradient',
};

function App() {
  const [formData, setFormData] = useState(() => {
    const saved = loadFromStorage('current_draft');
    if (saved) return { ...defaultFormData, ...saved };
    return { ...defaultFormData, refNumber: generateRefNumber() };
  });

  const [styles, setStyles] = useState(() => {
    return loadFromStorage('styles', defaultStyles);
  });

  const [activeTab, setActiveTab] = useState('form');
  const previewRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const toSave = { ...formData };
      if (toSave.companyLogo && toSave.companyLogo.length > 500 * 1024) {
        toSave.companyLogo = null;
      }
      if (toSave.signatorySignature && toSave.signatorySignature.length > 500 * 1024) {
        toSave.signatorySignature = null;
      }
      saveToStorage('current_draft', toSave);
    }, 30000);
    return () => clearInterval(timer);
  }, [formData]);

  useEffect(() => {
    saveToStorage('styles', styles);
  }, [styles]);

  const updateForm = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateStyles = useCallback((field, value) => {
    setStyles((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleExportPdf = useCallback(async () => {
    if (!previewRef.current) return;
    await exportToPdf(previewRef.current);
  }, []);

  const handleNewLetter = useCallback(() => {
    setFormData({
      ...defaultFormData,
      refNumber: generateRefNumber(),
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companyWebsite: formData.companyWebsite,
      companyEmail: formData.companyEmail,
      companyLogo: formData.companyLogo,
    });
  }, [formData]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold text-gray-800">Offer Letter Generator</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewLetter}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
          >
            New Letter
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-1.5 text-sm text-white rounded-md transition-colors font-medium"
            style={{ backgroundColor: styles.accentColor }}
          >
            Download PDF
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="w-[420px] shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-0">
          <div className="flex border-b border-gray-200 shrink-0">
            {[
              { key: 'form', label: 'Details' },
              { key: 'style', label: 'Style' },
              { key: 'storage', label: 'Data' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === tab.key ? { borderBottomColor: styles.accentColor } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto form-panel">
            {activeTab === 'form' && (
              <FormPanel formData={formData} updateForm={updateForm} styles={styles} />
            )}
            {activeTab === 'style' && (
              <StyleToolbar styles={styles} updateStyles={updateStyles} />
            )}
            {activeTab === 'storage' && (
              <StorageManager
                formData={formData}
                setFormData={setFormData}
                defaultFormData={defaultFormData}
              />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-200 p-6">
          <Preview ref={previewRef} formData={formData} styles={styles} />
        </div>
      </div>
    </div>
  );
}

export default App;
