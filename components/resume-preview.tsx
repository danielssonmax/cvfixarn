"use client"

import React, { useEffect, useState, useMemo } from "react"
import { generateCVHtml } from "@/lib/generate-cv-html"
import { generateCVHtmlModern } from "@/lib/generate-cv-html-modern"
import { generateCVHtmlMinimalist } from "@/lib/generate-cv-html-minimalist"
import { generateCVHtmlExecutive } from "@/lib/generate-cv-html-executive"
import { generateCVHtmlTimeline } from "@/lib/generate-cv-html-timeline"

interface Template { id: string; name: string }
interface ResumePreviewProps {
  data: any
  selectedTemplate: string
  selectedFont: string
  fontSize: string
  lineHeight: string
  textColor: string
  headerColor: string
  zoomLevel: number
  hasChangedTemplate: boolean
  sectionOrder: string[]
  sections?: { id: string; title: string; hidden?: boolean }[]
  templates: Template[]
  onSelectTemplate: (templateId: string) => void
}

export function ResumePreview({
  data,
  sectionOrder,
  sections = [],
  selectedFont,
  fontSize,
  lineHeight,
  textColor,
  headerColor,
  zoomLevel,
  selectedTemplate,
}: ResumePreviewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [pages, setPages] = useState<string[]>([])
  const measureRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Generate static HTML from CV data
  const cvHtml = useMemo(() => {
    if (!data) return '<div class="cv-container"><p>Laddar CV-data...</p></div>'
    // Use appropriate template generator based on selected template
    if (selectedTemplate === 'modern') {
      return generateCVHtmlModern(data, sectionOrder, sections)
    }
    if (selectedTemplate === 'minimalist') {
      return generateCVHtmlMinimalist(data, sectionOrder, sections)
    }
    if (selectedTemplate === 'executive') {
      return generateCVHtmlExecutive(data, sectionOrder, sections)
    }
    if (selectedTemplate === 'timeline') {
      return generateCVHtmlTimeline(data, sectionOrder, sections)
    }
    return generateCVHtml(data, sectionOrder, sections)
  }, [data, sectionOrder, sections, selectedTemplate])

  // Split content into A4 pages
  useEffect(() => {
    if (!measureRef.current || !cvHtml || !isMounted) return

    // Wait for content to render
    setTimeout(() => {
      if (!measureRef.current) return

      const A4_HEIGHT_PX = 1123 // 297mm at 96 DPI
      const PADDING_PX = 68 // 18mm at 96 DPI
      const BOTTOM_SAFE_SPACE = 40 // Extra space at bottom to avoid cutting text
      const MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - (PADDING_PX * 2) - BOTTOM_SAFE_SPACE

      const container = measureRef.current
      
      // Check which template is being used
      const isModernTemplate = container.querySelector('.cv-container-modern') !== null
      const isMinimalistTemplate = container.querySelector('.cv-container-minimalist') !== null
      const isExecutiveTemplate = container.querySelector('.cv-container-executive') !== null
      const isTimelineTemplate = container.querySelector('.cv-container-timeline') !== null
      
      // For modern template, handle pagination with sidebar
      if (isModernTemplate) {
        // Modern template has no padding on the page, so we can use more height
        // Only account for internal padding in the main content area
        const MODERN_CONTENT_PADDING = 60 // 30px top + 30px bottom padding in cv-main-content
        const MODERN_SAFE_SPACE = 20 // Smaller safe space since we have padding
        const MODERN_MAX_HEIGHT = A4_HEIGHT_PX - MODERN_CONTENT_PADDING - MODERN_SAFE_SPACE
        const modernContainer = container.querySelector('.cv-container-modern') as HTMLElement
        if (!modernContainer) {
          setPages([cvHtml])
          return
        }
        
        const sidebar = modernContainer.querySelector('.cv-sidebar') as HTMLElement
        const mainContent = modernContainer.querySelector('.cv-main-content') as HTMLElement
        
        if (!sidebar || !mainContent) {
          setPages([cvHtml])
          return
        }
        
        // Get sidebar sections and paginate them intelligently
        const sidebarSections = Array.from(sidebar.querySelectorAll('.cv-sidebar-section, .cv-photo-container'))
        
        const sidebarPages: string[][] = [[]]
        let sidebarPageIndex = 0
        let sidebarPageHeight = 0
        
        // Add each sidebar section, breaking to new page if needed
        sidebarSections.forEach((section) => {
          const sectionEl = section as HTMLElement
          const sectionHeight = sectionEl.offsetHeight
          
          // If this section would exceed page height, start new page
          if (sidebarPageHeight + sectionHeight > MODERN_MAX_HEIGHT && sidebarPages[sidebarPageIndex].length > 0) {
            sidebarPageIndex++
            sidebarPages[sidebarPageIndex] = []
            sidebarPageHeight = 0
          }
          
          sidebarPages[sidebarPageIndex].push(sectionEl.outerHTML)
          sidebarPageHeight += sectionHeight
        })
        
        const totalSidebarPages = sidebarPages.length
        
        // Get all sections in main content
        const sections = Array.from(mainContent.querySelectorAll('.cv-section-modern'))
        
        const mainContentPages: string[][] = [[]]
        let currentPageHeight = 0
        let currentPageIndex = 0
        
        sections.forEach((section) => {
          const sectionEl = section as HTMLElement
          
          // Check if this is a section with items
          const items = Array.from(sectionEl.querySelectorAll('.cv-item, .cv-experience-item, .cv-page-break'))
          
          if (items.length > 0) {
            // Section with items - handle title separately, then each item
            const sectionTitle = sectionEl.querySelector('.cv-section-title-modern')
            const sectionTitleHeight = sectionTitle ? (sectionTitle as HTMLElement).offsetHeight + 16 : 0
            
            // Check if we need to add section title
            if (currentPageHeight + sectionTitleHeight > MODERN_MAX_HEIGHT && mainContentPages[currentPageIndex].length > 0) {
              currentPageIndex++
              mainContentPages[currentPageIndex] = []
              currentPageHeight = 0
            }
            
            // Add section opening with title
            const sectionClasses = sectionEl.className
            if (sectionTitle) {
              mainContentPages[currentPageIndex].push(`<div class="${sectionClasses}"><h2 class="cv-section-title-modern">${sectionTitle.textContent}</h2>`)
              currentPageHeight += sectionTitleHeight
            }
            
            // Add each item individually
            items.forEach((item, itemIndex) => {
              const itemEl = item as HTMLElement
              const itemHeight = itemEl.offsetHeight
              
              // If adding this item would exceed page height, close section and start new page
              if (currentPageHeight + itemHeight > MODERN_MAX_HEIGHT && mainContentPages[currentPageIndex].length > 0) {
                // Close current section
                mainContentPages[currentPageIndex].push('</div>')
                
                // Start new page
                currentPageIndex++
                mainContentPages[currentPageIndex] = []
                currentPageHeight = 0
                
                // Re-open section on new page WITHOUT title
                mainContentPages[currentPageIndex].push(`<div class="${sectionClasses}">`)
              }
              
              mainContentPages[currentPageIndex].push(itemEl.outerHTML)
              currentPageHeight += itemHeight
              
              // Close section after last item
              if (itemIndex === items.length - 1) {
                mainContentPages[currentPageIndex].push('</div>')
              }
            })
          } else {
            // Section without items - keep as one unit
            const sectionHeight = sectionEl.offsetHeight
            
            if (currentPageHeight + sectionHeight > MODERN_MAX_HEIGHT && mainContentPages[currentPageIndex].length > 0) {
              currentPageIndex++
              mainContentPages[currentPageIndex] = []
              currentPageHeight = 0
            }
            
            mainContentPages[currentPageIndex].push(sectionEl.outerHTML)
            currentPageHeight += sectionHeight
          }
        })
        
        // Build final pages: combine sidebar pages with main content pages
        const totalPages = Math.max(mainContentPages.length, totalSidebarPages)
        
        const finalPages = []
        for (let i = 0; i < totalPages; i++) {
          // Get sidebar content for this page (or empty if no more sidebar content)
          const sidebarContent = i < totalSidebarPages ? sidebarPages[i].join('') : ''
          const hasSidebarContent = sidebarContent.length > 0
          
          // Get main content for this page (or empty if no more main content)
          const mainContent = i < mainContentPages.length ? mainContentPages[i].join('') : ''
          
          // Build the page with sidebar (always for color) and main content
          const sidebarHtml = hasSidebarContent 
            ? `<div class="cv-sidebar">${sidebarContent}</div>`
            : `<div class="cv-sidebar"></div>`
          
          const page = `<div class="cv-container-modern">${sidebarHtml}<div class="cv-main-content">${mainContent}</div></div>`
          finalPages.push(page)
        }
        
        setPages(finalPages)
        return
      }
      
      // Get all sections (for default, minimalist, executive, and timeline templates)
      const sections = Array.from(container.querySelectorAll('.cv-section, .cv-header, .cv-section-minimalist, .cv-header-minimalist, .cv-section-executive, .cv-header-executive, .cv-section-timeline, .cv-header-timeline'))
      
      const newPages: string[][] = [[]]
      let currentPageHeight = 0
      let currentPageIndex = 0

      sections.forEach((section) => {
        const sectionEl = section as HTMLElement
        
        // Check if this is a section with items (experience, education, etc.)
        const items = Array.from(sectionEl.querySelectorAll('.cv-item, .cv-experience-item, .cv-page-break, .cv-item-minimalist, .cv-item-executive, .cv-timeline-item, .cv-item-timeline'))
        
        if (items.length > 0) {
          // Section with items - handle title separately, then each item
          const sectionTitle = sectionEl.querySelector('.cv-section-title, .cv-section-title-minimalist, .cv-section-title-executive, .cv-section-title-timeline')
          const sectionTitleHeight = sectionTitle ? (sectionTitle as HTMLElement).offsetHeight + 12 : 0 // +12 for margin
          
          // Check if we need to add section title
          if (currentPageHeight + sectionTitleHeight > MAX_CONTENT_HEIGHT && newPages[currentPageIndex].length > 0) {
            currentPageIndex++
            newPages[currentPageIndex] = []
            currentPageHeight = 0
          }
          
          // Add section opening with title
          const sectionClasses = sectionEl.className
          const titleClass = sectionTitle?.className || 'cv-section-title'
          if (sectionTitle) {
            newPages[currentPageIndex].push(`<div class="${sectionClasses}"><h2 class="${titleClass}">${sectionTitle.textContent}</h2>`)
            currentPageHeight += sectionTitleHeight
          }
          
          // Add each item individually
          items.forEach((item, itemIndex) => {
            const itemEl = item as HTMLElement
            const itemHeight = itemEl.offsetHeight
            
            // If adding this item would exceed page height, close section and start new page
            if (currentPageHeight + itemHeight > MAX_CONTENT_HEIGHT && newPages[currentPageIndex].length > 0) {
              // Close current section
              newPages[currentPageIndex].push('</div>')
              
              // Start new page
              currentPageIndex++
              newPages[currentPageIndex] = []
              currentPageHeight = 0
              
              // Re-open section on new page WITHOUT title (just continue the section)
              newPages[currentPageIndex].push(`<div class="${sectionClasses}">`)
            }
            
            newPages[currentPageIndex].push(itemEl.outerHTML)
            currentPageHeight += itemHeight
            
            // Close section after last item
            if (itemIndex === items.length - 1) {
              newPages[currentPageIndex].push('</div>')
            }
          })
        } else {
          // Section without items (header, profile, skills, languages) - keep as one unit
          const sectionHeight = sectionEl.offsetHeight
          
          if (currentPageHeight + sectionHeight > MAX_CONTENT_HEIGHT && newPages[currentPageIndex].length > 0) {
            currentPageIndex++
            newPages[currentPageIndex] = []
            currentPageHeight = 0
          }
          
          newPages[currentPageIndex].push(sectionEl.outerHTML)
          currentPageHeight += sectionHeight
        }
      })

      // Convert to HTML strings
      const pageStrings = newPages.map(pageElements => 
        `<div class="cv-container">${pageElements.join('')}</div>`
      )
      
      setPages(pageStrings.length > 0 ? pageStrings : [cvHtml])
    }, 100)
  }, [cvHtml, isMounted, selectedFont, fontSize, lineHeight, textColor, headerColor, zoomLevel])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <p className="text-gray-600">Laddar CV preview...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto" style={{ backgroundColor: "#f3f2ef", padding: "40px 20px" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Import Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        /* CV HTML Preview Styles - CSS-based pagination */
        
        .cv-pages-wrapper {
          max-width: 210mm;
          margin: 0 auto;
          transform: scale(${zoomLevel});
          transform-origin: top center;
        }
        
        .cv-preview-page {
          width: 210mm;
          height: 297mm;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 18mm 15mm;
          box-sizing: border-box;
          margin-bottom: 20px;
          overflow: hidden;
        }
        
        /* Remove padding for modern template */
        .cv-preview-page:has(.cv-container-modern) {
          padding: 0;
        }
        
        .cv-measure-container {
          position: absolute;
          left: -9999px;
          top: 0;
          width: 210mm;
          padding: 18mm 15mm;
          box-sizing: border-box;
          visibility: hidden;
        }
        
        .cv-container,
        .cv-container-modern,
        .cv-container-minimalist,
        .cv-container-executive,
        .cv-container-timeline {
          font-family: '${selectedFont}', sans-serif;
          font-size: ${fontSize || '14px'};
          color: ${textColor || '#000000'};
          line-height: ${lineHeight || '1.5'};
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
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .cv-header {
          break-inside: avoid;
          page-break-inside: avoid;
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
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .cv-experience-item {
          margin-bottom: 16px;
          padding-left: 0;
          break-inside: avoid;
          page-break-inside: avoid;
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
        
        /* Skills & Languages */
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
        
        /* Page Break */
        .cv-page-break {
          width: 100%;
          height: 0;
          border-top: 1.5px solid #D1D5DB;
          margin: 8px 0;
          break-inside: avoid;
          page-break-inside: avoid;
          display: block;
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
          border-bottom: 2px solid #34495E;
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
          break-inside: avoid;
          page-break-inside: avoid;
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
        
        /* Minimalist Template Styles */
        .cv-container-minimalist {
          max-width: 100%;
          margin: 0 auto;
          font-family: '${selectedFont}', sans-serif;
          font-size: ${fontSize || '14px'};
          color: ${textColor || '#000000'};
          line-height: ${lineHeight || '1.5'};
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
        
        /* Executive Template Styles */
        .cv-container-executive {
          max-width: 100%;
          margin: 0 auto;
          font-family: '${selectedFont}', sans-serif;
          font-size: ${fontSize || '14px'};
          color: ${textColor || '#000000'};
          line-height: ${lineHeight || '1.5'};
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
        
        .cv-contact-item-executive {
          display: inline-flex;
          align-items: center;
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
        
        /* Timeline Template Styles */
        .cv-container-timeline {
          max-width: 100%;
          margin: 0 auto;
          font-family: '${selectedFont}', sans-serif;
          font-size: ${fontSize || '14px'};
          color: ${textColor || '#000000'};
          line-height: ${lineHeight || '1.5'};
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
          break-inside: avoid;
          page-break-inside: avoid;
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
        
        /* Compact Template Styles */
        .cv-container-compact {
          max-width: 100%;
          margin: 0 auto;
          font-family: '${selectedFont}', sans-serif;
          font-size: ${fontSize || '14px'};
          color: ${textColor || '#000000'};
          line-height: ${lineHeight || '1.5'};
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
          font-size: 1.8em;
          font-weight: 700;
          margin-bottom: 4px;
          color: #111827;
        }
        
        .cv-title-compact {
          font-size: 1em;
          color: #6B7280;
          font-weight: 500;
        }
        
        .cv-header-right-compact {
          text-align: right;
          font-size: 0.85em;
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
          font-size: 0.9em;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
          color: ${headerColor || '#374151'};
          letter-spacing: 0.5px;
          border-bottom: 1px solid ${headerColor || '#374151'};
          padding-bottom: 4px;
        }
        
        .cv-item-compact {
          font-size: 0.9em;
          margin-bottom: 6px;
          color: #374151;
        }
        
        .cv-experience-compact {
          margin-bottom: 16px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        .cv-item-title-compact {
          font-size: 1em;
          font-weight: 600;
          color: #111827;
          margin-bottom: 3px;
        }
        
        .cv-item-date-compact {
          font-size: 0.8em;
          color: #6B7280;
          font-weight: 500;
          display: block;
          margin-bottom: 3px;
        }
        
        .cv-item-subtitle-compact {
          font-size: 0.9em;
          color: #6B7280;
          margin-bottom: 6px;
          font-weight: 500;
        }
      `}} />
      
      {/* Hidden container for measuring */}
      <div className="cv-measure-container">
        <div ref={measureRef} dangerouslySetInnerHTML={{ __html: cvHtml }} />
      </div>
      
      {/* Visible pages */}
      <div className="cv-pages-wrapper" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
        {pages.length > 0 ? (
          pages.map((pageHtml, index) => (
            <div key={index} className="cv-preview-page">
              <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
            </div>
          ))
        ) : (
          <div className="cv-preview-page">
            <div className="cv-container" dangerouslySetInnerHTML={{ __html: cvHtml }} />
          </div>
        )}
      </div>
    </div>
  )
}

function shallowArrayEqual(a: any[] = [], b: any[] = []) {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

export default React.memo(ResumePreview, (prev, next) => {
  if (prev.data !== next.data) return false
  return (
    prev.selectedTemplate === next.selectedTemplate &&
    prev.selectedFont === next.selectedFont &&
    prev.fontSize === next.fontSize &&
    prev.lineHeight === next.lineHeight &&
    prev.textColor === next.textColor &&
    prev.headerColor === next.headerColor &&
    prev.zoomLevel === next.zoomLevel &&
    shallowArrayEqual(prev.sectionOrder, next.sectionOrder) &&
    prev.sections === next.sections &&
    prev.templates === next.templates &&
    prev.onSelectTemplate === next.onSelectTemplate
  )
})
