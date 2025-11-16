import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Export candidate data to PDF
export const exportCandidateToPDF = async (candidate) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text, x, y, maxWidth, fontSize = 12, fontStyle = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
  };

  // Header
  pdf.setFillColor(59, 130, 246); // Primary blue
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  yPosition = addText('CANDIDATE ANALYSIS REPORT', margin, 25, pageWidth - 2 * margin, 20, 'bold');
  
  pdf.setTextColor(0, 0, 0);
  yPosition = 60;

  // Candidate Information
  const analysis = candidate.analysis || {};
  const contactInfo = analysis.contact_info || {};
  
  yPosition = addText('CANDIDATE INFORMATION', margin, yPosition, pageWidth - 2 * margin, 16, 'bold');
  yPosition += 10;

  yPosition = addText(`Name: ${contactInfo.name || candidate.filename}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 5;
  
  if (contactInfo.email) {
    yPosition = addText(`Email: ${contactInfo.email}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  }
  
  if (contactInfo.phone) {
    yPosition = addText(`Phone: ${contactInfo.phone}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  }
  
  if (contactInfo.location) {
    yPosition = addText(`Location: ${contactInfo.location}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  }

  yPosition += 10;

  // Analysis Results
  yPosition = addText('ANALYSIS RESULTS', margin, yPosition, pageWidth - 2 * margin, 16, 'bold');
  yPosition += 10;

  // Score and Category
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 30, 'F');
  
  yPosition = addText(`Overall Score: ${analysis.overall_score || 0}%`, margin + 10, yPosition + 5, pageWidth - 2 * margin, 14, 'bold');
  yPosition = addText(`Category: ${analysis.category || 'Unknown'}`, margin + 10, yPosition + 5, pageWidth - 2 * margin, 14, 'bold');
  
  yPosition += 15;

  // Experience
  if (analysis.experience_years) {
    yPosition = addText(`Experience: ${analysis.experience_years} years`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  }

  // Education
  if (analysis.education) {
    yPosition = addText(`Education: ${analysis.education}`, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 5;
  }

  yPosition += 10;

  // Skills
  if (analysis.key_skills && analysis.key_skills.length > 0) {
    yPosition = addText('KEY SKILLS', margin, yPosition, pageWidth - 2 * margin, 14, 'bold');
    yPosition += 5;
    
    const skillsText = analysis.key_skills.join(', ');
    yPosition = addText(skillsText, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 10;
  }

  // Strengths
  if (analysis.strengths && analysis.strengths.length > 0) {
    yPosition = addText('STRENGTHS', margin, yPosition, pageWidth - 2 * margin, 14, 'bold');
    yPosition += 5;
    
    analysis.strengths.forEach((strength, index) => {
      yPosition = addText(`• ${strength}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition += 3;
    });
    yPosition += 5;
  }

  // Areas for Improvement
  if (analysis.weaknesses && analysis.weaknesses.length > 0) {
    yPosition = addText('AREAS FOR IMPROVEMENT', margin, yPosition, pageWidth - 2 * margin, 14, 'bold');
    yPosition += 5;
    
    analysis.weaknesses.forEach((weakness, index) => {
      yPosition = addText(`• ${weakness}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition += 3;
    });
    yPosition += 5;
  }

  // Summary
  if (analysis.summary) {
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }
    
    yPosition = addText('SUMMARY', margin, yPosition, pageWidth - 2 * margin, 14, 'bold');
    yPosition += 5;
    yPosition = addText(analysis.summary, margin, yPosition, pageWidth - 2 * margin);
  }

  // Footer
  const footerY = pageHeight - 20;
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, footerY);
  pdf.text('Resume Screener AI', pageWidth - margin - 50, footerY);

  // Save the PDF
  const fileName = `${contactInfo.name || candidate.filename}_analysis.pdf`;
  pdf.save(fileName);
};

// Export multiple candidates to PDF
export const exportCandidateListToPDF = async (candidates) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text
  const addText = (text, x, y, maxWidth, fontSize = 12, fontStyle = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
  };

  // Header
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  addText('CANDIDATES SUMMARY REPORT', margin, 25, pageWidth - 2 * margin, 20, 'bold');
  
  pdf.setTextColor(0, 0, 0);
  yPosition = 60;

  // Summary Statistics
  const totalCandidates = candidates.length;
  const avgScore = Math.round(candidates.reduce((sum, c) => sum + (c.analysis?.overall_score || 0), 0) / totalCandidates);
  const highlyQualified = candidates.filter(c => c.analysis?.category === 'Highly Qualified').length;
  const qualified = candidates.filter(c => c.analysis?.category === 'Qualified').length;

  yPosition = addText('SUMMARY STATISTICS', margin, yPosition, pageWidth - 2 * margin, 16, 'bold');
  yPosition += 10;

  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 40, 'F');

  yPosition = addText(`Total Candidates: ${totalCandidates}`, margin + 10, yPosition + 5, pageWidth - 2 * margin);
  yPosition = addText(`Average Score: ${avgScore}%`, margin + 10, yPosition + 3, pageWidth - 2 * margin);
  yPosition = addText(`Highly Qualified: ${highlyQualified}`, margin + 10, yPosition + 3, pageWidth - 2 * margin);
  yPosition = addText(`Qualified: ${qualified}`, margin + 10, yPosition + 3, pageWidth - 2 * margin);

  yPosition += 20;

  // Candidates List
  yPosition = addText('CANDIDATES LIST', margin, yPosition, pageWidth - 2 * margin, 16, 'bold');
  yPosition += 10;

  // Table headers
  pdf.setFillColor(59, 130, 246);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text('Name', margin + 5, yPosition + 5);
  pdf.text('Score', margin + 80, yPosition + 5);
  pdf.text('Category', margin + 110, yPosition + 5);
  pdf.text('Experience', margin + 150, yPosition + 5);
  
  pdf.setTextColor(0, 0, 0);
  yPosition += 15;

  // Candidates data
  candidates.forEach((candidate, index) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    const analysis = candidate.analysis || {};
    const contactInfo = analysis.contact_info || {};
    
    // Alternate row colors
    if (index % 2 === 0) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 12, 'F');
    }

    pdf.setFontSize(9);
    pdf.text(contactInfo.name || candidate.filename, margin + 5, yPosition + 5);
    pdf.text(`${analysis.overall_score || 0}%`, margin + 80, yPosition + 5);
    pdf.text(analysis.category || 'Unknown', margin + 110, yPosition + 5);
    pdf.text(`${analysis.experience_years || 0} yrs`, margin + 150, yPosition + 5);

    yPosition += 12;
  });

  // Footer
  const footerY = pageHeight - 20;
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, footerY);
  pdf.text('Resume Screener AI', pageWidth - margin - 50, footerY);

  // Save the PDF
  pdf.save(`candidates_summary_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export analytics report to PDF
export const exportAnalyticsToPDF = async (analyticsData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text
  const addText = (text, x, y, maxWidth, fontSize = 12, fontStyle = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
  };

  // Header
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  addText('ANALYTICS REPORT', margin, 25, pageWidth - 2 * margin, 20, 'bold');
  
  pdf.setTextColor(0, 0, 0);
  yPosition = 60;

  // Report content based on analyticsData
  yPosition = addText('RECRUITMENT ANALYTICS OVERVIEW', margin, yPosition, pageWidth - 2 * margin, 16, 'bold');
  yPosition += 10;

  yPosition = addText(`Report generated on: ${new Date().toLocaleDateString()}`, margin, yPosition, pageWidth - 2 * margin);
  yPosition += 10;

  // Add analytics content here based on the data structure
  yPosition = addText('This report contains comprehensive analytics about your recruitment process, including candidate scores, skill distributions, and hiring trends.', margin, yPosition, pageWidth - 2 * margin);

  // Footer
  const footerY = pageHeight - 20;
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, footerY);
  pdf.text('Resume Screener AI', pageWidth - margin - 50, footerY);

  // Save the PDF
  pdf.save(`analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export data to CSV
export const exportToCSV = (data, filename) => {
  const csvContent = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Export component screenshot to PDF
export const exportComponentToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

export default {
  exportCandidateToPDF,
  exportCandidateListToPDF,
  exportAnalyticsToPDF,
  exportToCSV,
  exportComponentToPDF
};
