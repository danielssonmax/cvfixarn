import React, { useMemo } from 'react'
import { generateCVHtml } from '@/lib/generate-cv-html'
import { generateCVHtmlModern } from '@/lib/generate-cv-html-modern'
import { generateCVHtmlMinimalist } from '@/lib/generate-cv-html-minimalist'
import { generateCVHtmlExecutive } from '@/lib/generate-cv-html-executive'
import { generateCVHtmlTimeline } from '@/lib/generate-cv-html-timeline'

interface CVThumbnailProps {
  cvData: any
}

export function CVThumbnail({ cvData }: CVThumbnailProps) {
  if (!cvData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-400 text-xs">
          Ingen data
        </div>
      </div>
    )
  }

  const cvId = cvData.id || 'default'
  const scopeClass = `cv-thumb-${cvId.substring(0, 8)}` // Unique class per CV
  const template = cvData.selected_template || 'default'
  const selectedFont = cvData.selected_font || 'Poppins'
  const fontSize = `${cvData.font_size || 11}px`
  const lineHeight = (cvData.line_height || 1.5).toString()
  const textColor = cvData.selected_color || '#000000'
  const headerColor = cvData.header_color || '#000000'
  
  // Convert CV data to format expected by generators
  const data = {
    personalInfo: cvData.personal_info || {},
    workExperience: cvData.work_experience || [],
    education: cvData.education || [],
    skills: cvData.skills || [],
    languages: cvData.languages || [],
    sections: {
      profile: cvData.profile,
      courses: { items: cvData.courses || [] },
      internship: { items: cvData.internships || [] },
      certificates: { items: cvData.certificates || [] },
      achievements: { items: cvData.achievements || [] },
      references: { items: cvData.references || [] },
      traits: { items: cvData.traits || [] },
      hobbies: { items: cvData.hobbies || [] },
    }
  }
  
  const sectionOrder = cvData.section_order || ['personalInfo', 'profile', 'experience', 'education', 'skills', 'languages']
  const sections = sectionOrder.map((id: string) => ({
    id,
    title: cvData.section_names?.[id] || id,
    hidden: false
  }))
  
  // Generate HTML using the same generator as preview
  const cvHtml = useMemo(() => {
    let html = ''
    if (template === 'modern') {
      html = generateCVHtmlModern(data, sectionOrder, sections)
    } else if (template === 'minimalist') {
      html = generateCVHtmlMinimalist(data, sectionOrder, sections)
    } else if (template === 'executive') {
      html = generateCVHtmlExecutive(data, sectionOrder, sections)
    } else if (template === 'timeline') {
      html = generateCVHtmlTimeline(data, sectionOrder, sections)
    } else {
      html = generateCVHtml(data, sectionOrder, sections)
    }
    
    // Inject inline styles for colors to ensure they override any cached CSS
    if (template === 'modern') {
      // Replace sidebar background color
      html = html.replace(
        'class="cv-sidebar"',
        `class="cv-sidebar" style="background-color: ${headerColor || '#2C3E50'} !important;"`
      )
    }
    
    return html
  }, [JSON.stringify(data), sectionOrder.join(','), template, headerColor])

  // Memoize CSS with color dependencies
  const thumbnailCSS = useMemo(() => `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        .${scopeClass} .cv-thumbnail-wrapper {
          width: 210mm;
          height: 297mm;
          transform: scale(0.37);
          transform-origin: center center;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .${scopeClass} .cv-thumbnail-page {
          width: 210mm;
          height: 297mm;
          background: white;
          padding: 18mm 15mm;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .cv-thumbnail-page:has(.cv-container-modern) {
          padding: 0;
        }
        
        .cv-container,
        .cv-container-modern,
        .cv-container-minimalist,
        .cv-container-executive,
        .cv-container-timeline {
          font-family: '${selectedFont}', sans-serif;
          font-size: ${fontSize};
          color: ${textColor};
          line-height: ${lineHeight};
        }
        
        /* Header */
        .cv-header {
          margin-bottom: 30px;
          border-bottom: 2px solid #000000;
          padding-bottom: 20px;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
        }
        
        .cv-header-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        
        .cv-name {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 10px;
          color: #000000;
          letter-spacing: -0.5px;
          line-height: 1.3;
        }
        
        .cv-title {
          font-size: 1.15em;
          color: #4B5563;
          margin-bottom: 10px;
          margin-top: 0;
          font-weight: normal;
          line-height: 1.5;
        }
        
        .cv-contact {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          font-size: 0.9em;
          color: #6B7280;
          margin-top: 8px;
        }
        
        .cv-contact-item {
          margin-right: 16px;
        }
        
        .cv-profile-image {
          width: 120px;
          height: 120px;
          border-radius: 60px;
          object-fit: cover;
          margin-left: 20px;
          flex-shrink: 0;
        }
        
        /* Sections */
        .cv-section {
          margin-bottom: 24px;
        }
        
        .cv-section-title {
          font-size: 1.15em;
          font-weight: bold;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1.5px solid #D1D5DB;
          text-transform: uppercase;
          color: ${headerColor || '#111827'};
          letter-spacing: 0.5px;
        }
        
        /* Items */
        .cv-item {
          margin-bottom: 16px;
          padding-left: 0;
        }
        
        .cv-experience-item {
          margin-bottom: 16px;
          padding-left: 0;
        }
        
        .cv-item-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          margin-bottom: 5px;
          align-items: baseline;
        }
        
        .cv-item-title {
          font-size: 1.1em;
          font-weight: bold;
          color: #111827;
          flex: 1;
          margin-bottom: 4px;
        }
        
        .cv-item-date {
          font-size: 0.9em;
          color: #6B7280;
          font-weight: normal;
          margin-left: 8px;
        }
        
        .cv-item-company {
          font-size: 1em;
          margin-bottom: 3px;
          color: #374151;
          font-weight: normal;
        }
        
        .cv-item-location {
          font-size: 0.85em;
          color: #9CA3AF;
          margin-bottom: 6px;
          font-style: italic;
        }
        
        .cv-item-description {
          font-size: 0.95em;
          line-height: 1.5;
          color: #4B5563;
          white-space: pre-wrap;
        }
        
        /* Skills */
        .cv-skills-container {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        
        .cv-skill-item {
          font-size: 0.9em;
          background-color: #F3F4F6;
          padding: 6px 12px;
          margin-right: 6px;
          margin-bottom: 6px;
          border-radius: 3px;
          color: #374151;
          display: inline-block;
        }
        
        .cv-language-item {
          font-size: 0.9em;
          background-color: #EFF6FF;
          padding: 6px 12px;
          margin-right: 6px;
          margin-bottom: 6px;
          border-radius: 3px;
          color: #1E40AF;
          display: inline-block;
        }
        
        /* Modern Template */
        .cv-container-modern {
          display: flex;
          flex-direction: row;
          min-height: 297mm;
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        
        .cv-sidebar {
          width: 35%;
          background-color: ${headerColor || '#2C3E50'};
          color: #FFFFFF;
          padding: 30px 25px;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }
        
        .cv-photo-container {
          text-align: center;
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .cv-profile-image-modern {
          width: 140px;
          height: 140px;
          border-radius: 70px;
          object-fit: cover;
          border: 4px solid #FFFFFF;
          display: block;
        }
        
        .cv-sidebar-section {
          margin-bottom: 30px;
        }
        
        .cv-name-modern {
          font-size: 1.8em;
          font-weight: bold;
          margin-bottom: 8px;
          color: #FFFFFF;
          text-align: center;
          line-height: 1.2;
        }
        
        .cv-title-modern {
          font-size: 1em;
          color: #BDC3C7;
          margin-bottom: 0;
          text-align: center;
          font-weight: normal;
          line-height: 1.4;
        }
        
        .cv-sidebar-title {
          font-size: 0.95em;
          font-weight: bold;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid rgba(255,255,255,0.2);
          text-transform: uppercase;
          color: #ECF0F1;
          letter-spacing: 1px;
        }
        
        .cv-sidebar-item {
          font-size: 0.85em;
          color: #ECF0F1;
          margin-bottom: 8px;
          line-height: 1.5;
        }
        
        .cv-main-content {
          width: 65%;
          padding: 30px 30px 30px 25px;
          background-color: #FFFFFF;
          min-height: 100%;
        }
        
        .cv-section-modern {
          margin-bottom: 28px;
        }
        
        .cv-section-title-modern {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #2C3E50;
          text-transform: uppercase;
          color: #2C3E50;
          letter-spacing: 0.5px;
        }
        
        .cv-item-header-modern {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          margin-bottom: 6px;
          align-items: baseline;
        }
        
        .cv-item-title-modern {
          font-size: 1.05em;
          font-weight: bold;
          color: #2C3E50;
          flex: 1;
          margin-bottom: 4px;
        }
        
        .cv-item-date-modern {
          font-size: 0.85em;
          color: #7F8C8D;
          font-weight: normal;
          margin-left: 8px;
          white-space: nowrap;
        }
        
        .cv-item-company-modern {
          font-size: 0.95em;
          margin-bottom: 6px;
          color: #34495E;
          font-weight: normal;
          font-style: italic;
        }
        
        /* Minimalist Template */
        .cv-container-minimalist {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .cv-header-minimalist {
          text-align: center;
          margin-top: 0;
          margin-bottom: 24px;
          padding-top: 0;
          padding-bottom: 20px;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .cv-photo-container-minimalist {
          text-align: center;
          margin-bottom: 16px;
          margin-top: 0;
        }
        
        .cv-profile-image-minimalist {
          width: 100px;
          height: 100px;
          border-radius: 50px;
          object-fit: cover;
          border: 2px solid #E5E7EB;
        }
        
        .cv-name-minimalist {
          font-size: 2em;
          font-weight: 300;
          margin-top: 0;
          margin-bottom: 6px;
          color: #111827;
          letter-spacing: 1.5px;
        }
        
        .cv-title-minimalist {
          font-size: 1em;
          color: #6B7280;
          margin-bottom: 12px;
          font-weight: 300;
        }
        
        .cv-contact-minimalist {
          font-size: 0.85em;
          color: #6B7280;
          margin-top: 6px;
          font-weight: 300;
        }
        
        .cv-section-minimalist {
          margin-bottom: 28px;
        }
        
        .cv-section-title-minimalist {
          font-size: 0.85em;
          font-weight: 600;
          margin-bottom: 14px;
          text-transform: uppercase;
          color: ${headerColor || '#111827'};
          letter-spacing: 2px;
        }
        
        .cv-item-minimalist {
          margin-bottom: 18px;
        }
        
        .cv-item-header-minimalist {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        
        .cv-item-title-minimalist {
          font-size: 1.05em;
          font-weight: 500;
          color: #111827;
        }
        
        .cv-item-date-minimalist {
          font-size: 0.85em;
          color: #9CA3AF;
          font-weight: 300;
        }
        
        .cv-item-subtitle-minimalist {
          font-size: 0.95em;
          color: #6B7280;
          margin-bottom: 8px;
          font-weight: 300;
        }
        
        .cv-skills-minimalist {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .cv-skill-item-minimalist {
          font-size: 0.9em;
          color: #374151;
          font-weight: 300;
        }
        
        /* Executive Template */
        .cv-container-executive {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .cv-header-executive {
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 3px solid ${headerColor || '#1F2937'};
        }
        
        .cv-header-content-executive {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 20px;
        }
        
        .cv-photo-executive {
          flex-shrink: 0;
        }
        
        .cv-profile-image-executive {
          width: 140px;
          height: 140px;
          border-radius: 4px;
          object-fit: cover;
          border: 3px solid ${headerColor || '#1F2937'};
          display: block;
        }
        
        .cv-header-text-executive {
          flex: 1;
        }
        
        .cv-name-executive {
          font-size: 2.8em;
          font-weight: 700;
          margin-bottom: 8px;
          color: #111827;
          letter-spacing: -0.5px;
        }
        
        .cv-title-executive {
          font-size: 1.3em;
          color: #6B7280;
          font-weight: 400;
        }
        
        .cv-contact-executive {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 0.9em;
          color: #4B5563;
        }
        
        .cv-section-executive {
          margin-bottom: 36px;
        }
        
        .cv-section-title-executive {
          font-size: 1.1em;
          font-weight: 700;
          margin-bottom: 20px;
          text-transform: uppercase;
          color: ${headerColor || '#1F2937'};
          letter-spacing: 1.5px;
          padding-bottom: 8px;
          border-bottom: 2px solid ${headerColor || '#1F2937'};
        }
        
        .cv-item-executive {
          margin-bottom: 24px;
        }
        
        .cv-item-header-executive {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
        }
        
        .cv-item-title-executive {
          font-size: 1.1em;
          font-weight: 600;
          color: #111827;
        }
        
        .cv-item-date-executive {
          font-size: 0.9em;
          color: #6B7280;
          font-weight: 500;
        }
        
        .cv-item-subtitle-executive {
          font-size: 1em;
          color: #4B5563;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .cv-skills-executive {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .cv-skill-item-executive {
          font-size: 0.95em;
          color: #374151;
          font-weight: 500;
        }
        
        /* Timeline Template */
        .cv-container-timeline {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .cv-header-timeline {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #E5E7EB;
        }
        
        .cv-header-content-timeline {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        
        .cv-profile-image-timeline {
          width: 100px;
          height: 100px;
          border-radius: 50px;
          object-fit: cover;
          border: 3px solid ${headerColor || '#3B82F6'};
          display: block;
        }
        
        .cv-name-timeline {
          font-size: 2.2em;
          font-weight: 700;
          margin-bottom: 6px;
          color: #111827;
        }
        
        .cv-title-timeline {
          font-size: 1.1em;
          color: #6B7280;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .cv-contact-timeline {
          font-size: 0.9em;
          color: #6B7280;
          margin-top: 6px;
        }
        
        .cv-section-timeline {
          margin-bottom: 32px;
        }
        
        .cv-section-title-timeline {
          font-size: 1em;
          font-weight: 700;
          margin-bottom: 20px;
          text-transform: uppercase;
          color: ${headerColor || '#3B82F6'};
          letter-spacing: 1px;
        }
        
        .cv-timeline {
          position: relative;
          padding-left: 40px;
        }
        
        .cv-timeline::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: ${headerColor || '#3B82F6'};
        }
        
        .cv-timeline-item {
          position: relative;
          margin-bottom: 28px;
        }
        
        .cv-timeline-marker {
          position: absolute;
          left: -36px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${headerColor || '#3B82F6'};
          border: 3px solid white;
          box-shadow: 0 0 0 2px ${headerColor || '#3B82F6'};
        }
        
        .cv-timeline-content {
          padding-left: 8px;
        }
        
        .cv-timeline-date {
          display: inline-block;
          font-size: 0.85em;
          color: ${headerColor || '#3B82F6'};
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .cv-timeline-title {
          font-size: 1.05em;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .cv-timeline-subtitle {
          font-size: 0.95em;
          color: #6B7280;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .cv-item-timeline {
          margin-bottom: 20px;
        }
        
        .cv-item-title-timeline {
          font-size: 1.05em;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }
        
        .cv-skills-timeline {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }
        
        .cv-skill-item-timeline {
          font-size: 0.9em;
          color: #374151;
          font-weight: 500;
        }
      `, [selectedFont, fontSize, lineHeight, textColor, headerColor, template])

  return (
    <div className={`w-full h-full overflow-hidden bg-gray-50 flex items-center justify-center ${scopeClass}`}>
      {/* Copy exact same CSS from resume-preview.tsx */}
      <style key={`cv-thumbnail-${cvId}`} dangerouslySetInnerHTML={{ __html: thumbnailCSS }} />
      
      <div className="cv-thumbnail-wrapper">
        <div className="cv-thumbnail-page" dangerouslySetInnerHTML={{ __html: cvHtml }} />
      </div>
    </div>
  )
}
