import { useState } from 'react';
import {
  saveToStorage,
  loadFromStorage,
  clearAllStorage,
  getStorageSizeMB,
  removeFromStorage,
} from '../utils/storage';

export default function StorageManager({ formData, setFormData, defaultFormData }) {
  const [templates, setTemplates] = useState(() => loadFromStorage('templates', []));
  const [drafts, setDrafts] = useState(() => loadFromStorage('drafts', []));
  const [templateName, setTemplateName] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const storageMB = getStorageSizeMB();

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const template = {
      name: templateName.trim(),
      date: new Date().toISOString(),
      data: {
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyWebsite: formData.companyWebsite,
        companyEmail: formData.companyEmail,
        sections: formData.sections,
        signatoryName: formData.signatoryName,
        signatoryTitle: formData.signatoryTitle,
      },
    };
    const updated = [...templates, template];
    setTemplates(updated);
    saveToStorage('templates', updated);
    setTemplateName('');
  };

  const handleLoadTemplate = (template) => {
    setFormData((prev) => ({ ...prev, ...template.data }));
  };

  const handleDeleteTemplate = (index) => {
    const updated = templates.filter((_, i) => i !== index);
    setTemplates(updated);
    saveToStorage('templates', updated);
  };

  const handleSaveDraft = () => {
    const draft = {
      name: `${formData.candidateName || 'Untitled'} — ${formData.position || 'Draft'}`,
      date: new Date().toISOString(),
      data: { ...formData },
    };
    // Remove large images from draft storage
    if (draft.data.companyLogo && draft.data.companyLogo.length > 500 * 1024) {
      draft.data.companyLogo = null;
    }
    let updated = [...drafts, draft];
    if (updated.length > 5) updated = updated.slice(-5); // keep last 5
    setDrafts(updated);
    saveToStorage('drafts', updated);
  };

  const handleLoadDraft = (draft) => {
    setFormData({ ...defaultFormData, ...draft.data });
  };

  const handleDeleteDraft = (index) => {
    const updated = drafts.filter((_, i) => i !== index);
    setDrafts(updated);
    saveToStorage('drafts', updated);
  };

  const handleExportConfig = () => {
    const config = {
      templates,
      styles: loadFromStorage('styles'),
      company: {
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyWebsite: formData.companyWebsite,
        companyEmail: formData.companyEmail,
      },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'offer-letter-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target.result);
        if (config.templates) {
          setTemplates(config.templates);
          saveToStorage('templates', config.templates);
        }
        if (config.styles) {
          saveToStorage('styles', config.styles);
        }
        if (config.company) {
          setFormData((prev) => ({ ...prev, ...config.company }));
        }
      } catch {
        alert('Invalid config file');
      }
    };
    reader.readAsText(file);
  };

  const handleStartFresh = () => {
    clearAllStorage();
    setTemplates([]);
    setDrafts([]);
    setFormData({ ...defaultFormData });
    setShowConfirmReset(false);
  };

  return (
    <div className="p-4 space-y-5 text-sm">
      {/* Storage usage */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Storage Used: {storageMB} MB / 5 MB
        </label>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all"
            style={{ width: `${Math.min((parseFloat(storageMB) / 5) * 100, 100)}%` }}
          />
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Templates */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Saved Templates</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="input-field flex-1"
          />
          <button
            onClick={handleSaveTemplate}
            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            Save
          </button>
        </div>
        {templates.length === 0 && (
          <p className="text-xs text-gray-400">No templates saved yet</p>
        )}
        <div className="space-y-1">
          {templates.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
              <div>
                <span className="font-medium">{t.name}</span>
                <span className="text-gray-400 ml-2">
                  {new Date(t.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleLoadTemplate(t)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDeleteTemplate(i)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Drafts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-gray-500">Drafts (max 5)</label>
          <button
            onClick={handleSaveDraft}
            className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
          >
            Save Draft
          </button>
        </div>
        {drafts.length === 0 && (
          <p className="text-xs text-gray-400">No drafts saved yet</p>
        )}
        <div className="space-y-1">
          {drafts.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
              <div>
                <span className="font-medium">{d.name}</span>
                <span className="text-gray-400 ml-2">
                  {new Date(d.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleLoadDraft(d)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDeleteDraft(i)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Export / Import */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Backup & Restore</label>
        <div className="flex gap-2">
          <button
            onClick={handleExportConfig}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Export Config
          </button>
          <label className="cursor-pointer px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
            Import Config
            <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
          </label>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Start Fresh */}
      <div>
        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full py-2 text-xs text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
          >
            Start Fresh
          </button>
        ) : (
          <div className="p-3 bg-red-50 rounded-md border border-red-200">
            <p className="text-xs text-red-600 mb-2">
              This will clear all saved templates, drafts, and settings. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleStartFresh}
                className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Yes, clear everything
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs bg-white text-gray-600 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
