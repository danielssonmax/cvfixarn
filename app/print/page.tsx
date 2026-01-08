"use client"

import React, { useEffect, useState } from 'react'
import { generateCVHtml } from '@/lib/generate-cv-html'
import { generateCVHtmlModern } from '@/lib/generate-cv-html-modern'
import { generateCVHtmlMinimalist } from '@/lib/generate-cv-html-minimalist'
import { generateCVHtmlExecutive } from '@/lib/generate-cv-html-executive'
import { generateCVHtmlTimeline } from '@/lib/generate-cv-html-timeline'

export default function PrintPage() {
  const [cvData, setCvData] = useState<any>(null)
  const [htmlContent, setHtmlContent] = useState<string>('')

  useEffect(() => {
    // Get CV data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const dataParam = urlParams.get('data')
    
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam))
        setCvData(decodedData)
      } catch (error) {
        console.error('Failed to parse CV data:', error)
      }
    } else {
      // Fallback to localStorage
      const storedData = localStorage.getItem('cv-print-data')
      if (storedData) {
        try {
          setCvData(JSON.parse(storedData))
        } catch (error) {
          console.error('Failed to parse stored CV data:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (cvData) {
      // Use appropriate template generator based on selected template
      let html = ''
      if (cvData.selectedTemplate === 'modern') {
        html = generateCVHtmlModern(cvData.data, cvData.sectionOrder, cvData.sections)
      } else if (cvData.selectedTemplate === 'minimalist') {
        html = generateCVHtmlMinimalist(cvData.data, cvData.sectionOrder, cvData.sections)
      } else if (cvData.selectedTemplate === 'executive') {
        html = generateCVHtmlExecutive(cvData.data, cvData.sectionOrder, cvData.sections)
      } else if (cvData.selectedTemplate === 'timeline') {
        html = generateCVHtmlTimeline(cvData.data, cvData.sectionOrder, cvData.sections)
      } else {
        html = generateCVHtml(cvData.data, cvData.sectionOrder, cvData.sections)
      }
      setHtmlContent(html)
    }
  }, [cvData])

  // Listen for Paged.js completion
  useEffect(() => {
    if (!htmlContent) return

    const handlePagedRendered = () => {
      console.log('Paged.js rendering complete for print')
      
      // Signal to Puppeteer that page is ready
      if (typeof window !== 'undefined') {
        (window as any).pagedReady = true
        if ((window as any).Paged) {
          (window as any).Paged.ready = true
        }
      }
    }

    // Listen for Paged.js event
    document.addEventListener('pagedjs:rendered', handlePagedRendered)
    
    // Fallback: If Paged.js doesn't load or render in 5 seconds, signal ready anyway
    const fallbackTimer = setTimeout(() => {
      console.log('Paged.js fallback timeout - signaling ready')
      if (typeof window !== 'undefined') {
        (window as any).pagedReady = true
      }
    }, 5000)
    
    return () => {
      document.removeEventListener('pagedjs:rendered', handlePagedRendered)
      clearTimeout(fallbackTimer)
    }
  }, [htmlContent])

  if (!htmlContent) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Laddar CV-data...</p>
      </div>
    )
  }

  const selectedFont = cvData?.selectedFont || 'Helvetica'
  const fontSize = cvData?.fontSize || '14px'
  const fontFamily = selectedFont === 'Poppins' ? "'Poppins', sans-serif" : selectedFont === 'Inter' ? "'Inter', sans-serif" : selectedFont || "'Helvetica', sans-serif"
  const lineHeight = cvData?.lineHeight || '1.5'
  const headerColor = cvData?.headerColor || '#000000'
  const textColor = cvData?.textColor || '#000000'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Import Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Paged.js page configuration */
        @page {
          size: A4;
          margin: 18mm 15mm;
        }

        /* Page break utilities */
        [data-keep] {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .page-break-before {
          break-before: page;
          page-break-before: always;
        }

        .page-break-after {
          break-after: page;
          page-break-after: always;
        }

        /* Body styling */
        body {
          font-family: ${fontFamily};
          font-size: ${fontSize};
          color: ${textColor};
          line-height: ${lineHeight};
          background: white;
        }

        /* CV Container */
        .cv-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          font-family: ${fontFamily};
          font-size: ${fontSize};
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
          font-size: 28pt;
          font-weight: bold;
          margin-bottom: 10px;
          color: #000000;
          letter-spacing: -0.5px;
          line-height: 1.3;
        }

        .cv-title {
          font-size: 13pt;
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
          font-size: 10pt;
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
          /* Allow sections to break across pages */
        }

        .cv-section-title {
          font-size: 13pt;
          font-weight: bold;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1.5px solid #D1D5DB;
          text-transform: uppercase;
          color: ${headerColor};
          letter-spacing: 0.5px;
          /* Keep title with at least one item */
          break-after: avoid;
          page-break-after: avoid;
        }

        /* Items */
        .cv-item {
          margin-bottom: 16px;
          padding-left: 0;
          break-inside: avoid;
          page-break-inside: avoid;
          -webkit-column-break-inside: avoid;
        }

        .cv-experience-item {
          margin-bottom: 16px;
          padding-left: 0;
          break-inside: avoid;
          page-break-inside: avoid;
          -webkit-column-break-inside: avoid;
        }

        .cv-item-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          margin-bottom: 5px;
          align-items: baseline;
        }

        .cv-item-title {
          font-size: 12pt;
          font-weight: bold;
          color: #111827;
          flex: 1;
          margin-bottom: 4px;
        }

        .cv-item-date {
          font-size: 10pt;
          color: #6B7280;
          font-weight: normal;
          margin-left: 8px;
        }

        .cv-item-company {
          font-size: 11pt;
          margin-bottom: 3px;
          color: #374151;
          font-weight: normal;
        }

        .cv-item-location {
          font-size: 9pt;
          color: #9CA3AF;
          margin-bottom: 6px;
          font-style: italic;
        }

        .cv-item-description {
          font-size: 10pt;
          line-height: 1.5;
          color: #4B5563;
          white-space: pre-wrap;
        }

        /* Skills & Languages */
        .cv-skills-container {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .cv-skill-item {
          font-size: 10pt;
          background-color: #F3F4F6;
          padding: 6px 12px;
          margin-right: 6px;
          margin-bottom: 6px;
          border-radius: 3px;
          color: #374151;
          display: inline-block;
        }

        .cv-language-item {
          font-size: 10pt;
          background-color: #EFF6FF;
          padding: 6px 12px;
          margin-right: 6px;
          margin-bottom: 6px;
          border-radius: 3px;
          color: #1E40AF;
          display: inline-block;
        }
        
        /* Modern Template Styles */
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
          font-size: 20pt;
          font-weight: bold;
          margin-bottom: 8px;
          color: #FFFFFF;
          text-align: center;
          line-height: 1.2;
        }
        
        .cv-title-modern {
          font-size: 11pt;
          color: #BDC3C7;
          margin-bottom: 0;
          text-align: center;
          font-weight: normal;
          line-height: 1.4;
        }
        
        .cv-sidebar-title {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #34495E;
          text-transform: uppercase;
          color: #ECF0F1;
          letter-spacing: 1px;
        }
        
        .cv-sidebar-item {
          font-size: 9pt;
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
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .cv-section-title-modern {
          font-size: 13pt;
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
          font-size: 11pt;
          font-weight: bold;
          color: #2C3E50;
          flex: 1;
          margin-bottom: 4px;
        }
        
        .cv-item-date-modern {
          font-size: 9pt;
          color: #7F8C8D;
          font-weight: normal;
          margin-left: 8px;
          white-space: nowrap;
        }
        
        .cv-item-company-modern {
          font-size: 10pt;
          margin-bottom: 6px;
          color: #34495E;
          font-weight: normal;
          font-style: italic;
        }
        
        /* Minimalist Template Styles */
        .cv-container-minimalist {
          max-width: 100%;
          margin: 0 auto;
          font-family: ${fontFamily};
          font-size: ${fontSize};
          color: ${textColor};
          line-height: ${lineHeight};
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
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .cv-profile-image-minimalist {
          width: 100px;
          height: 100px;
          border-radius: 50px;
          object-fit: cover;
          border: 2px solid #E5E7EB;
          display: block;
          margin: 0;
        }
        
        .cv-name-minimalist {
          font-size: 20pt;
          font-weight: 300;
          margin-top: 0;
          margin-bottom: 6px;
          color: #111827;
          letter-spacing: 1.5px;
        }
        
        .cv-title-minimalist {
          font-size: 10pt;
          color: #6B7280;
          margin-bottom: 12px;
          font-weight: 300;
        }
        
        .cv-contact-minimalist {
          font-size: 8.5pt;
          color: #6B7280;
          margin-top: 6px;
          font-weight: 300;
        }
        
        .cv-section-minimalist {
          margin-bottom: 28px;
        }
        
        .cv-section-title-minimalist {
          font-size: 9pt;
          font-weight: 600;
          margin-bottom: 14px;
          text-transform: uppercase;
          color: ${cvData?.headerColor || '#111827'};
          letter-spacing: 2px;
        }
        
        .cv-item-minimalist {
          margin-bottom: 18px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .cv-item-header-minimalist {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        
        .cv-item-title-minimalist {
          font-size: 10.5pt;
          font-weight: 500;
          color: #111827;
        }
        
        .cv-item-date-minimalist {
          font-size: 9pt;
          color: #9CA3AF;
          font-weight: 300;
        }
        
        .cv-item-subtitle-minimalist {
          font-size: 9.5pt;
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
          font-size: 9pt;
          color: #374151;
          font-weight: 300;
        }
        
        /* Executive Template Styles */
        .cv-container-executive {
          max-width: 100%;
          margin: 0 auto;
          font-family: ${fontFamily};
          font-size: ${fontSize};
          color: ${textColor};
          line-height: ${lineHeight};
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
          font-size: 28pt;
          font-weight: 700;
          margin-bottom: 8px;
          color: #111827;
          letter-spacing: -0.5px;
        }
        
        .cv-title-executive {
          font-size: 13pt;
          color: #6B7280;
          font-weight: 400;
        }
        
        .cv-contact-executive {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 9pt;
          color: #4B5563;
        }
        
        .cv-contact-item-executive {
          display: inline-flex;
          align-items: center;
        }
        
        .cv-section-executive {
          margin-bottom: 36px;
        }
        
        .cv-section-title-executive {
          font-size: 11pt;
          font-weight: 700;
          margin-bottom: 20px;
          text-transform: uppercase;
          color: ${headerColor || '#1F2937'};
          letter-spacing: 1.5px;
          padding-bottom: 8px;
          border-bottom: 2px solid ${headerColor || '#1F2937'};
        }
        
        .cv-section-content-executive {
          padding-left: 0;
        }
        
        .cv-item-executive {
          margin-bottom: 24px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .cv-item-header-executive {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
        }
        
        .cv-item-title-executive {
          font-size: 11pt;
          font-weight: 600;
          color: #111827;
        }
        
        .cv-item-date-executive {
          font-size: 9pt;
          color: #6B7280;
          font-weight: 500;
        }
        
        .cv-item-subtitle-executive {
          font-size: 10pt;
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
          font-size: 9.5pt;
          color: #374151;
          font-weight: 500;
        }
        
        /* Timeline Template Styles */
        .cv-container-timeline {
          max-width: 100%;
          margin: 0 auto;
          font-family: ${fontFamily};
          font-size: ${fontSize};
          color: ${textColor};
          line-height: ${lineHeight};
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
        
        .cv-photo-timeline {
          flex-shrink: 0;
        }
        
        .cv-profile-image-timeline {
          width: 100px;
          height: 100px;
          border-radius: 50px;
          object-fit: cover;
          border: 3px solid ${headerColor || '#3B82F6'};
          display: block;
        }
        
        .cv-header-text-timeline {
          flex: 1;
        }
        
        .cv-name-timeline {
          font-size: 22pt;
          font-weight: 700;
          margin-bottom: 6px;
          color: #111827;
        }
        
        .cv-title-timeline {
          font-size: 11pt;
          color: #6B7280;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .cv-contact-timeline {
          font-size: 9pt;
          color: #6B7280;
          margin-top: 6px;
        }
        
        .cv-section-timeline {
          margin-bottom: 32px;
        }
        
        .cv-section-title-timeline {
          font-size: 10pt;
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
          break-inside: avoid;
          page-break-inside: avoid;
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
          font-size: 8.5pt;
          color: ${headerColor || '#3B82F6'};
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .cv-timeline-title {
          font-size: 10.5pt;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .cv-timeline-subtitle {
          font-size: 9.5pt;
          color: #6B7280;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .cv-item-timeline {
          margin-bottom: 20px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .cv-item-title-timeline {
          font-size: 10.5pt;
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
          font-size: 9pt;
          color: #374151;
          font-weight: 500;
        }
        
        /* Compact Template Styles */
        .cv-container-compact {
          max-width: 100%;
          margin: 0 auto;
          font-family: ${fontFamily};
          font-size: ${fontSize};
          color: ${textColor};
          line-height: ${lineHeight};
        }
        
        .cv-header-compact {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid ${headerColor || '#374151'};
        }
        
        .cv-header-left-compact {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .cv-profile-image-compact {
          width: 70px;
          height: 70px;
          border-radius: 4px;
          object-fit: cover;
          border: 2px solid ${headerColor || '#374151'};
        }
        
        .cv-header-text-compact {
          flex: 1;
        }
        
        .cv-name-compact {
          font-size: 18pt;
          font-weight: 700;
          margin-bottom: 4px;
          color: #111827;
        }
        
        .cv-title-compact {
          font-size: 10pt;
          color: #6B7280;
          font-weight: 500;
        }
        
        .cv-header-right-compact {
          text-align: right;
          font-size: 8.5pt;
          color: #6B7280;
        }
        
        .cv-contact-item-compact {
          margin-bottom: 3px;
        }
        
        .cv-two-column-compact {
          display: flex;
          gap: 20px;
        }
        
        .cv-column-left-compact {
          width: 35%;
          flex-shrink: 0;
        }
        
        .cv-column-right-compact {
          width: 65%;
          flex: 1;
        }
        
        .cv-section-compact {
          margin-bottom: 20px;
        }
        
        .cv-section-title-compact {
          font-size: 9pt;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
          color: ${headerColor || '#374151'};
          letter-spacing: 0.5px;
          border-bottom: 1px solid ${headerColor || '#374151'};
          padding-bottom: 4px;
        }
        
        .cv-item-compact {
          font-size: 9pt;
          margin-bottom: 6px;
          color: #374151;
        }
        
        .cv-experience-compact {
          margin-bottom: 16px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .cv-item-title-compact {
          font-size: 10pt;
          font-weight: 600;
          color: #111827;
          margin-bottom: 3px;
        }
        
        .cv-item-date-compact {
          font-size: 8pt;
          color: #6B7280;
          font-weight: 500;
          display: block;
          margin-bottom: 3px;
        }
        
        .cv-item-subtitle-compact {
          font-size: 9pt;
          color: #6B7280;
          margin-bottom: 6px;
          font-weight: 500;
        }
      `}} />
      
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      
      <script 
        src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"
        onLoad={() => {
          console.log('Paged.js script loaded')
        }}
      ></script>
      <script dangerouslySetInnerHTML={{ __html: `
        console.log('Initializing Paged.js...');
        
        // Wait for Paged.js to load
        function initPaged() {
          if (typeof window.PagedPolyfill !== 'undefined') {
            console.log('Paged.js found, initializing...');
            const paged = new window.PagedPolyfill();
            
            // Listen for completion
            document.addEventListener('pagedjs:rendered', () => {
              console.log('Paged.js rendered event fired');
            });
            
          } else {
            console.log('Paged.js not loaded yet, retrying...');
            setTimeout(initPaged, 100);
          }
        }
        
        // Start initialization when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initPaged);
        } else {
          initPaged();
        }
      `}} />
    </>
  )
}

