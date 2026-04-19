import { useCallback } from 'react';
import SectionEditor from './SectionEditor';
import SignatureBlock from './SignatureBlock';
import { compressImage } from '../utils/imageCompress';
import { defaultTemplates, applyTemplateVariables } from '../utils/templates';

const engagementTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];

export default function FormPanel({ formData, updateForm, styles }) {
  const handleLogoUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const compressed = await compressImage(file, 400, 0.7);
      updateForm('companyLogo', compressed);
    },
    [updateForm]
  );

  const handleTemplateSelect = useCallback(
    (templateName) => {
      const template = defaultTemplates[templateName];
      if (!template) return;
      const variables = {
        position: formData.position || '[Position]',
        engagementType: formData.engagementType,
        companyName: formData.companyName,
      };
      const sections = applyTemplateVariables(template, variables);
      updateForm('sections', sections);
    },
    [formData.position, formData.engagementType, formData.companyName, updateForm]
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, ' / ');
  };

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Reference Number */}
      <Field label="Reference Number">
        <input
          type="text"
          value={formData.refNumber}
          onChange={(e) => updateForm('refNumber', e.target.value)}
          className="input-field"
        />
      </Field>

      {/* Company Logo */}
      <Field label="Company Logo">
        <div className="flex items-center gap-2">
          {formData.companyLogo && (
            <img src={formData.companyLogo} alt="Logo" className="h-10 object-contain" />
          )}
          <label className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs transition-colors">
            {formData.companyLogo ? 'Change' : 'Upload'}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
          {formData.companyLogo && (
            <button
              onClick={() => updateForm('companyLogo', null)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>
      </Field>

      {/* Company Details */}
      <Field label="Company Name">
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => updateForm('companyName', e.target.value)}
          className="input-field"
        />
      </Field>

      <Field label="Company Address">
        <textarea
          value={formData.companyAddress}
          onChange={(e) => updateForm('companyAddress', e.target.value)}
          className="input-field resize-none"
          rows={2}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Website">
          <input
            type="text"
            value={formData.companyWebsite}
            onChange={(e) => updateForm('companyWebsite', e.target.value)}
            className="input-field"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={formData.companyEmail}
            onChange={(e) => updateForm('companyEmail', e.target.value)}
            className="input-field"
          />
        </Field>
      </div>

      <hr className="border-gray-200" />

      {/* Candidate Details */}
      <Field label="Candidate Name">
        <input
          type="text"
          value={formData.candidateName}
          onChange={(e) => updateForm('candidateName', e.target.value)}
          className="input-field"
          placeholder="Full name"
        />
      </Field>

      <Field label="Candidate Email">
        <input
          type="email"
          value={formData.candidateEmail}
          onChange={(e) => updateForm('candidateEmail', e.target.value)}
          className="input-field"
          placeholder="email@example.com"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Position / Role">
          <input
            type="text"
            value={formData.position}
            onChange={(e) => updateForm('position', e.target.value)}
            className="input-field"
            placeholder="e.g. Sales Associate"
          />
        </Field>
        <Field label="Engagement Type">
          <select
            value={formData.engagementType}
            onChange={(e) => updateForm('engagementType', e.target.value)}
            className="input-field"
          >
            {engagementTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            value={formData.date}
            onChange={(e) => updateForm('date', e.target.value)}
            className="input-field"
          />
          <p className="text-xs text-gray-400 mt-0.5">
            Preview: {formatDate(formData.date)}
          </p>
        </Field>
        <Field label="Heading / Title">
          <input
            type="text"
            value={formData.heading}
            onChange={(e) => updateForm('heading', e.target.value)}
            className="input-field"
          />
        </Field>
      </div>

      <hr className="border-gray-200" />

      {/* Template selector */}
      <Field label="Load Template">
        <div className="flex gap-2 flex-wrap">
          {Object.keys(defaultTemplates).map((name) => (
            <button
              key={name}
              onClick={() => handleTemplateSelect(name)}
              className="px-2.5 py-1 text-xs rounded-md border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </Field>

      {/* Body Sections */}
      <SectionEditor
        sections={formData.sections}
        onChange={(sections) => updateForm('sections', sections)}
        accentColor={styles.accentColor}
      />

      <hr className="border-gray-200" />

      {/* Signatory */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Signatory Name">
          <input
            type="text"
            value={formData.signatoryName}
            onChange={(e) => updateForm('signatoryName', e.target.value)}
            className="input-field"
            placeholder="e.g. Benki"
          />
        </Field>
        <Field label="Signatory Title">
          <input
            type="text"
            value={formData.signatoryTitle}
            onChange={(e) => updateForm('signatoryTitle', e.target.value)}
            className="input-field"
            placeholder="e.g. Co-Founder, CPPO"
          />
        </Field>
      </div>

      <SignatureBlock
        label="Signatory Signature"
        value={formData.signatorySignature}
        onChange={(val) => updateForm('signatorySignature', val)}
      />

      {/* Candidate signature toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showCandSig"
          checked={formData.showCandidateSignature}
          onChange={(e) => updateForm('showCandidateSignature', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="showCandSig" className="text-sm text-gray-700">
          Show candidate signature block
        </label>
      </div>
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
