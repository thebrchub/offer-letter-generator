import { forwardRef, useMemo } from 'react';
import LetterPage from './LetterPage';

const Preview = forwardRef(function Preview({ formData, styles }, ref) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, ' / ');
  };

  // Build the intro paragraph
  const introHtml = useMemo(() => {
    const name = formData.candidateName || '[Candidate Name]';
    const email = formData.candidateEmail || '';
    const position = formData.position || '[Position]';
    const type = formData.engagementType;
    const company = formData.companyName;
    const address = formData.companyAddress;
    const date = formatDate(formData.date);

    return `
      <p style="margin-bottom:4px"><strong>Date:</strong> ${date}</p>
      <p style="margin-top:12px;margin-bottom:0"><strong>To,</strong></p>
      <p style="margin:0">${name}</p>
      ${email ? `<p style="margin:0">${email}</p>` : ''}
      <p style="margin-top:12px"><strong>Subject:</strong> Offer of Engagement for the Role of ${position} (${type})</p>
      <p style="margin-top:12px">Dear ${name.split(' ')[0]},</p>
      <p>We are pleased to offer you the position of <strong>${position} (${type})</strong> with <strong>${company}</strong>, a creative and technology-driven firm based in ${address}.</p>
      <p>We are excited to welcome passionate, growth-oriented individuals like you who share our vision of building something meaningful together.</p>
    `;
  }, [formData.candidateName, formData.candidateEmail, formData.position, formData.engagementType, formData.companyName, formData.companyAddress, formData.date]);

  // Build section HTML
  const sectionsHtml = useMemo(() => {
    return formData.sections.map((s, i) => {
      return `<h2><strong>${i + 1}. ${s.heading}</strong></h2>${s.content}`;
    }).join('');
  }, [formData.sections]);

  // Build signature HTML
  const signatureHtml = useMemo(() => {
    let html = '<div class="signature-block" style="margin-top:24px;display:flex;justify-content:space-between;align-items:flex-start;page-break-inside:avoid;break-inside:avoid">';

    // Left — company signatory
    html += '<div>';
    html += `<p style="margin-bottom:4px">For <strong>${formData.companyName}</strong></p>`;
    if (formData.signatorySignature) {
      html += `<img src="${formData.signatorySignature}" style="height:50px;object-fit:contain;margin:4px 0" />`;
    }
    if (formData.signatoryName) {
      html += `<p style="margin:0"><strong>${formData.signatoryName}</strong></p>`;
    }
    if (formData.signatoryTitle) {
      html += `<p style="margin:0">${formData.signatoryTitle}</p>`;
    }
    html += `<p style="margin:0;font-size:0.85em">${formData.companyAddress}</p>`;
    html += '</div>';

    // Right — candidate
    if (formData.showCandidateSignature) {
      html += '<div style="text-align:right">';
      html += `<p style="margin-bottom:4px"><strong>${formData.candidateName || '[Candidate Name]'}</strong></p>`;
      html += `<p style="margin:0">${formData.position || '[Position]'}</p>`;
      if (formData.candidateSignature) {
        html += `<img src="${formData.candidateSignature}" style="height:50px;object-fit:contain;margin:4px 0" />`;
      } else {
        html += '<div style="height:50px;border-bottom:1px solid #ccc;width:150px;margin-left:auto;margin-top:8px"></div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }, [formData.companyName, formData.signatorySignature, formData.signatoryName, formData.signatoryTitle, formData.companyAddress, formData.showCandidateSignature, formData.candidateName, formData.position, formData.candidateSignature]);

  const fullBodyHtml = introHtml + sectionsHtml + signatureHtml;

  return (
    <div ref={ref} className="inline-block">
      <LetterPage
        formData={formData}
        styles={styles}
        bodyHtml={fullBodyHtml}
      />
    </div>
  );
});

export default Preview;
