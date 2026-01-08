"use client"

import React from 'react'

// Helper functions (same as PDF template)
const stripHTML = (html: string) => {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

const safeText = (val: any) => {
  if (val == null) return '\u200B'
  const s = String(val).trim()
  return s === '' ? '\u200B' : s
}

const isValidImageSrc = (src: any) =>
  typeof src === 'string' &&
  src.trim() !== '' &&
  (/^https?:\/\//.test(src) || /^data:image\//.test(src))

const dateLabel = (month?: string, year?: string) => {
  if (!month && !year) return ''
  const names = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December']
  const idx = Number(month) - 1
  const name = names[idx] || ''
  return `${name} ${year || ''}`.trim()
}

const dateRange = (
  startMonth?: string, startYear?: string,
  endMonth?: string, endYear?: string,
  current?: boolean
) => {
  const hasStart = !!(startMonth || startYear)
  const hasEnd = !!(endMonth || endYear || current)
  if (!hasStart && !hasEnd) return ''
  const start = dateLabel(startMonth, startYear)
  const end = current ? 'Nutid' : dateLabel(endMonth, endYear)
  return hasStart && hasEnd ? `${start} - ${end}` : (start || end)
}

const hasContent = (item: any) => {
  if (!item || typeof item !== 'object') return false
  const ignoredKeys = ['id', '__typename', '__uid']
  const relevantEntries = Object.entries(item).filter(([key]) => !ignoredKeys.includes(key))
  
  return relevantEntries.some(([key, value]) => {
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'boolean') return value === true
    if (Array.isArray(value)) return value.length > 0
    return value != null && value !== ''
  })
}

const hasArrayContent = (arr: any) => {
  if (!Array.isArray(arr)) return false
  return arr.some(item => hasContent(item))
}

interface CVHtmlProps {
  data: any
  sectionOrder: string[]
  sections?: { id: string; title: string; hidden?: boolean }[]
  headerColor?: string
  selectedFont?: string
  fontSize?: string
  textColor?: string
}

export function CVHtml({
  data,
  sectionOrder,
  sections = [],
  headerColor = '#1e40af',
  selectedFont = 'Inter',
  fontSize = '14px',
  textColor = '#000000',
}: CVHtmlProps) {
  // Safety check
  if (!data || !data.personalInfo || typeof data.personalInfo !== 'object') {
    return (
      <div className="cv-container">
        <p>Laddar CV...</p>
      </div>
    )
  }

  const safePersonalInfo = {
    firstName: data.personalInfo.firstName || '',
    lastName: data.personalInfo.lastName || '',
    title: data.personalInfo.title || '',
    email: data.personalInfo.email || '',
    phone: data.personalInfo.phone || '',
    address: data.personalInfo.address || '',
    postalCode: data.personalInfo.postalCode || '',
    location: data.personalInfo.location || '',
    photo: data.personalInfo.photo || '',
  }

  const renderSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || section.hidden) {
      return null
    }

    try {
      switch (sectionId) {
        case 'personalInfo':
          return (
            <div key={sectionId} className="cv-header">
              <div className="cv-header-content">
                <h1 className="cv-name">
                  {safeText(
                    `${safePersonalInfo.firstName.trim()} ${safePersonalInfo.lastName.trim()}`
                      .trim() || 'Curriculum Vitae'
                  )}
                </h1>
                <p className="cv-title">{safeText(safePersonalInfo.title)}</p>
                <div className="cv-contact">
                  <span className="cv-contact-item">{safeText(safePersonalInfo.email)}</span>
                  <span className="cv-contact-item">{safeText(safePersonalInfo.phone)}</span>
                  <span className="cv-contact-item">
                    {safeText([safePersonalInfo.address, safePersonalInfo.postalCode, safePersonalInfo.location]
                      .filter(v => v && v.trim() !== '')
                      .join(", "))}
                  </span>
                </div>
              </div>
              {isValidImageSrc(safePersonalInfo.photo) && (
                <img 
                  src={safePersonalInfo.photo} 
                  alt="Profile"
                  className="cv-profile-image"
                />
              )}
            </div>
          )

        case 'experience':
          if (!hasArrayContent(data.workExperience)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">ARBETSLIVSERFARENHET</h2>
              {(data.workExperience || []).map((exp: any, index: number) => {
                if (!hasContent(exp)) return null
                return (
                  <div key={exp?.id ?? exp?.__uid ?? index} className="cv-item cv-experience-item" data-keep>
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{safeText(exp.title)}</h3>
                      <span className="cv-item-date">
                        {safeText(dateRange(exp.startDate, exp.startYear, exp.endDate, exp.endYear, exp.current))}
                      </span>
                    </div>
                    <p className="cv-item-company">{safeText(exp.company)}</p>
                    <p className="cv-item-location">{safeText(exp.location)}</p>
                    <p className="cv-item-description">{safeText(stripHTML(exp.description))}</p>
                  </div>
                )
              })}
            </div>
          )

        case 'education':
          if (!hasArrayContent(data.education)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">UTBILDNING</h2>
              {(data.education || []).map((edu: any, index: number) => {
                if (!hasContent(edu)) return null
                return (
                  <div key={edu?.id ?? edu?.__uid ?? index} className="cv-item cv-experience-item" data-keep>
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{safeText(edu.degree)}</h3>
                      <span className="cv-item-date">
                        {safeText(dateRange(edu.startDate, edu.startYear, edu.endDate, edu.endYear, edu.current))}
                      </span>
                    </div>
                    <p className="cv-item-company">{safeText(edu.school)}</p>
                    <p className="cv-item-location">{safeText(edu.location)}</p>
                    <p className="cv-item-description">{safeText(stripHTML(edu.description))}</p>
                  </div>
                )
              })}
            </div>
          )

        case 'skills':
          if (!hasArrayContent(data.skills)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">FÄRDIGHETER</h2>
              <div className="cv-skills-container">
                {(data.skills || []).map((skill: any, index: number) => {
                  if (!hasContent(skill)) return null
                  return <span key={skill?.id ?? skill?.__uid ?? index} className="cv-skill-item">{safeText(skill.name)}</span>
                })}
              </div>
            </div>
          )

        case 'languages':
          if (!hasArrayContent(data.languages)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">SPRÅK</h2>
              <div className="cv-skills-container">
                {(data.languages || []).map((lang: any, index: number) => {
                  if (!lang.name || lang.name.trim() === '') return null
                  const label = lang.proficiency ?? lang.level
                  return (
                    <span key={lang?.id ?? lang?.__uid ?? index} className="cv-language-item">
                      {safeText([lang.name, label ? ` - ${label}` : ''].join('').trim())}
                    </span>
                  )
                })}
              </div>
            </div>
          )

        case 'profile':
          if (!data.sections?.profile || !(data.sections.profile as any)?.description) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">PROFIL</h2>
              <p className="cv-item-description">{safeText(stripHTML((data.sections.profile as any).description))}</p>
            </div>
          )

        case 'traits':
          const traits = data.sections?.traits
          if (!hasArrayContent(traits)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">EGENSKAPER</h2>
              <div className="cv-skills-container">
                {(traits || []).map((trait: any, index: number) => {
                  if (!hasContent(trait)) return null
                  return <span key={trait?.id ?? trait?.__uid ?? index} className="cv-skill-item">{safeText(trait.name)}</span>
                })}
              </div>
            </div>
          )

        case 'courses':
          const courses = data.sections?.courses
          if (!hasArrayContent(courses)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">KURSER</h2>
              {(courses || []).map((course: any, index: number) => {
                if (!hasContent(course)) return null
                return (
                  <div key={course?.id ?? course?.__uid ?? index} className="cv-item cv-experience-item" data-keep>
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{safeText(course.name)}</h3>
                      <span className="cv-item-date">{safeText(course.date)}</span>
                    </div>
                    <p className="cv-item-company">{safeText(course.institution)}</p>
                    <p className="cv-item-description">{safeText(stripHTML(course.description))}</p>
                  </div>
                )
              })}
            </div>
          )

        case 'internship':
          const internships = data.sections?.internship
          if (!hasArrayContent(internships)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">PRAKTIK</h2>
              {(internships || []).map((intern: any, index: number) => {
                if (!hasContent(intern)) return null
                return (
                  <div key={intern?.id ?? intern?.__uid ?? index} className="cv-item cv-experience-item" data-keep>
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{safeText(intern.title)}</h3>
                      <span className="cv-item-date">
                        {safeText(dateRange(intern.startDate, intern.startYear, intern.endDate, intern.endYear, intern.current))}
                      </span>
                    </div>
                    <p className="cv-item-company">{safeText(intern.company)}</p>
                    <p className="cv-item-location">{safeText(intern.location)}</p>
                    <p className="cv-item-description">{safeText(stripHTML(intern.description))}</p>
                  </div>
                )
              })}
            </div>
          )

        case 'hobbies':
          if (!data.sections?.hobbies || !(data.sections.hobbies as any)?.description) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">INTRESSEN</h2>
              <p className="cv-item-description">{safeText(stripHTML((data.sections.hobbies as any).description))}</p>
            </div>
          )

        case 'certificates':
          const certificates = data.sections?.certificates
          if (!hasArrayContent(certificates)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">CERTIFIKAT</h2>
              {(certificates || []).map((cert: any, index: number) => {
                if (!hasContent(cert)) return null
                return (
                  <div key={cert?.id ?? cert?.__uid ?? index} className="cv-item cv-experience-item" data-keep>
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{safeText(cert.name)}</h3>
                      <span className="cv-item-date">{safeText(cert.year)}</span>
                    </div>
                    <p className="cv-item-company">{safeText(cert.issuer)}</p>
                    <p className="cv-item-description">{safeText(stripHTML(cert.description))}</p>
                  </div>
                )
              })}
            </div>
          )

        case 'achievements':
          const achievements = data.sections?.achievements
          if (!hasArrayContent(achievements)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">PRESTATIONER</h2>
              {(achievements || []).map((achievement: any, index: number) => {
                if (!hasContent(achievement)) return null
                return (
                  <div key={achievement?.id ?? achievement?.__uid ?? index} className="cv-item cv-experience-item" data-keep>
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{safeText(achievement.title)}</h3>
                      <span className="cv-item-date">{safeText(achievement.date)}</span>
                    </div>
                    <p className="cv-item-company">{safeText(achievement.issuer)}</p>
                    <p className="cv-item-description">{safeText(stripHTML(achievement.description))}</p>
                  </div>
                )
              })}
            </div>
          )

        case 'references':
          const references = data.sections?.references
          if (!hasArrayContent(references)) return null
          return (
            <div key={sectionId} className="cv-section" data-keep>
              <h2 className="cv-section-title">REFERENSER</h2>
              {(references || []).map((ref: any, index: number) => {
                if (!hasContent(ref)) return null
                return (
                  <div key={ref?.id ?? ref?.__uid ?? index} className="cv-item cv-experience-item" data-keep>
                    <div className="cv-item-header">
                      <h3 className="cv-item-title">{safeText(ref.name)}</h3>
                    </div>
                    <p className="cv-item-company">{safeText(ref.title)}</p>
                    <p className="cv-item-location">{safeText(ref.company)}</p>
                    <p className="cv-item-description">{safeText(ref.email ? `Email: ${ref.email}` : '')}</p>
                    <p className="cv-item-description">{safeText(ref.phone ? `Telefon: ${ref.phone}` : '')}</p>
                  </div>
                )
              })}
            </div>
          )

        default:
          return null
      }
    } catch (error) {
      console.error(`Error rendering section ${sectionId}:`, error)
      return null
    }
  }

  return (
    <div className="cv-pages-wrapper">
      <div 
        className="cv-page" 
        style={{ 
          fontFamily: selectedFont,
          fontSize: fontSize,
          color: textColor 
        }}
      >
        {sectionOrder.map(sectionId => renderSection(sectionId))}
      </div>
    </div>
  )
}

