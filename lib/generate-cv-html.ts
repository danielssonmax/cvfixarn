// Generate static HTML from CV data
export function generateCVHtml(data: any, sectionOrder: string[], sections: any[]): string {
  const safeText = (text: any): string => {
    if (text === null || text === undefined || text === '') return ''
    return String(text).trim()
  }

  const hasContent = (item: any): boolean => {
    if (!item || typeof item !== 'object') return false
    // Page breaks always have content
    if (item.isPageBreak) return true
    const keys = Object.keys(item).filter(k => !['id', '__uid', 'isPageBreak'].includes(k))
    return keys.some(key => {
      const val = item[key]
      return val !== null && val !== undefined && val !== '' && val !== false
    })
  }

  const hasArrayContent = (arr: any): boolean => {
    return Array.isArray(arr) && arr.length > 0 && arr.some(item => {
      // Include page breaks in content check
      if (item && item.isPageBreak) return true
      return hasContent(item)
    })
  }

  const dateRange = (startDate?: string, startYear?: string, endDate?: string, endYear?: string, current?: boolean): string => {
    const start = startYear || startDate || ''
    const end = current ? 'Nuvarande' : (endYear || endDate || '')
    if (!start && !end) return ''
    if (!end) return start
    return `${start} - ${end}`
  }

  const stripHTML = (html: string): string => {
    if (!html) return ''
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim()
  }

  const isValidImageSrc = (src: any): boolean => {
    if (!src || typeof src !== 'string') return false
    return src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')
  }

  // Parse optionalFields - it should already be an object from the form
  let optionalFields = {}
  const rawOptionalFields = data?.personalInfo?.optionalFields
  
  if (rawOptionalFields && typeof rawOptionalFields === 'object' && !Array.isArray(rawOptionalFields)) {
    // It's already an object, use it directly
    optionalFields = rawOptionalFields
  }
  
  const safePersonalInfo = {
    firstName: data?.personalInfo?.firstName || '',
    lastName: data?.personalInfo?.lastName || '',
    title: data?.personalInfo?.title || '',
    email: data?.personalInfo?.email || '',
    phone: data?.personalInfo?.phone || '',
    address: data?.personalInfo?.address || '',
    postalCode: data?.personalInfo?.postalCode || '',
    location: data?.personalInfo?.location || '',
    photo: data?.personalInfo?.photo || '',
    optionalFields: optionalFields,
  }
  
  const getFieldLabel = (type: string): string => {
    const labels: Record<string, string> = {
      birthDate: "Födelsedatum",
      birthPlace: "Födelseort",
      drivingLicense: "Körkort",
      gender: "Kön",
      nationality: "Nationalitet",
      civilStatus: "Civilstånd",
      website: "Webbplats",
      linkedin: "LinkedIn",
    }
    return labels[type] || type
  }

  const getFieldIcon = (type: string): string => {
    const iconStyle = 'display: inline-block; vertical-align: middle; margin-right: 4px;'
    const icons: Record<string, string> = {
      birthDate: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      birthPlace: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      drivingLicense: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><circle cx="8" cy="12" r="2"/><path d="M15 8h2"/><path d="M15 12h2"/><path d="M15 16h2"/></svg>`,
      gender: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>`,
      nationality: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      civilStatus: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
      website: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      linkedin: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    }
    return icons[type] || ''
  }

  let html = '<div class="cv-container">'

  sectionOrder.forEach(sectionId => {
    const section = sections.find(s => s.id === sectionId)
    // If section is not found in sections array, create a default one
    // This handles cases where sectionOrder is updated before sections array
    const sectionToUse = section || { id: sectionId, title: sectionId.toUpperCase(), hidden: false }
    if (sectionToUse.hidden) return

    switch (sectionId) {
      case 'personalInfo':
        const contactParts = [safePersonalInfo.address, safePersonalInfo.postalCode, safePersonalInfo.location]
          .filter(v => v && v.trim() !== '')
        const fullName = `${safePersonalInfo.firstName} ${safePersonalInfo.lastName}`.trim() || 'Curriculum Vitae'
        
        html += `<div class="cv-header" data-keep><div class="cv-header-content"><h1 class="cv-name">${fullName}</h1>`
        if (safePersonalInfo.title) html += `<p class="cv-title">${safePersonalInfo.title}</p>`
        html += `<div class="cv-contact">`
        if (safePersonalInfo.email) html += `<span class="cv-contact-item">${safePersonalInfo.email}</span>`
        if (safePersonalInfo.phone) html += `<span class="cv-contact-item">${safePersonalInfo.phone}</span>`
        if (contactParts.length > 0) html += `<span class="cv-contact-item">${contactParts.join(', ')}</span>`
        
        // Add optional fields
        if (safePersonalInfo.optionalFields && typeof safePersonalInfo.optionalFields === 'object') {
          for (const [fieldKey, value] of Object.entries(safePersonalInfo.optionalFields)) {
            // Skip label keys (they end with _label)
            if (fieldKey.endsWith('_label')) continue
            
            if (value && String(value).trim() !== '') {
              // Check if this is a custom field
              const isCustomField = fieldKey.startsWith('custom_')
              
              if (isCustomField) {
                // Custom fields show neutral icon (info circle) without label
                const customIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
                html += `<span class="cv-contact-item">${customIcon}${value}</span>`
              } else {
                // Standard fields show icon instead of label
                const icon = getFieldIcon(fieldKey)
                html += `<span class="cv-contact-item">${icon}${value}</span>`
              }
            }
          }
        }
        
        html += `</div></div>`
        if (isValidImageSrc(safePersonalInfo.photo)) html += `<img src="${safePersonalInfo.photo}" alt="Profile" class="cv-profile-image"/>`
        html += `</div>`
        break

      case 'experience':
        if (!hasArrayContent(data?.workExperience)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'ARBETSLIVSERFARENHET'}</h2>`
        data.workExperience.forEach((exp: any) => {
          // Check if this is a page break first
          if (exp && exp.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          
          if (!hasContent(exp)) return
          const expTitle = safeText(exp.title)
          const expDate = safeText(dateRange(exp.startDate, exp.startYear, exp.endDate, exp.endYear, exp.current))
          const expCompany = safeText(exp.company)
          const expLocation = safeText(exp.location)
          const expDesc = stripHTML(exp.description)
          
          html += `<div class="cv-item cv-experience-item" data-keep><div class="cv-item-header">`
          if (expTitle) html += `<h3 class="cv-item-title">${expTitle}</h3>`
          if (expDate) html += `<span class="cv-item-date">${expDate}</span>`
          html += `</div>`
          if (expCompany) html += `<p class="cv-item-company">${expCompany}</p>`
          if (expLocation) html += `<p class="cv-item-location">${expLocation}</p>`
          if (expDesc) html += `<div class="cv-item-description">${expDesc}</div>`
          html += `</div>`
        })
        html += `</div>`
        break

      case 'education':
        if (!hasArrayContent(data?.education)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'UTBILDNING'}</h2>`
        data.education.forEach((edu: any) => {
          // Check if this is a page break first
          if (edu && edu.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          
          if (!hasContent(edu)) return
          
          const eduDegree = safeText(edu.degree)
          const eduDate = safeText(dateRange(edu.startDate, edu.startYear, edu.endDate, edu.endYear, edu.current))
          const eduSchool = safeText(edu.school)
          const eduLocation = safeText(edu.location)
          const eduDesc = stripHTML(edu.description)
          
          html += `<div class="cv-item cv-experience-item" data-keep><div class="cv-item-header">`
          if (eduDegree) html += `<h3 class="cv-item-title">${eduDegree}</h3>`
          if (eduDate) html += `<span class="cv-item-date">${eduDate}</span>`
          html += `</div>`
          if (eduSchool) html += `<p class="cv-item-company">${eduSchool}</p>`
          if (eduLocation) html += `<p class="cv-item-location">${eduLocation}</p>`
          if (eduDesc) html += `<div class="cv-item-description">${eduDesc}</div>`
          html += `</div>`
        })
        html += `</div>`
        break

      case 'skills':
        if (!hasArrayContent(data?.skills)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'FÄRDIGHETER'}</h2><div class="cv-skills-container">`
        data.skills.forEach((skill: any) => {
          if (!hasContent(skill)) return
          const skillName = safeText(skill.name)
          const skillLevel = safeText(skill.level)
          if (skillName) html += `<span class="cv-skill-item">${skillName}${skillLevel ? ` - ${skillLevel}` : ''}</span>`
        })
        html += `</div></div>`
        break

      case 'languages':
        if (!hasArrayContent(data?.languages)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'SPRÅK'}</h2><div class="cv-skills-container">`
        data.languages.forEach((lang: any) => {
          if (!lang.name || lang.name.trim() === '') return
          const langName = safeText(lang.name)
          const label = lang.proficiency ?? lang.level
          if (langName) html += `<span class="cv-language-item">${langName}${label ? ` - ${label}` : ''}</span>`
        })
        html += `</div></div>`
        break

      case 'profile':
        if (!data?.sections?.profile?.description) break
        const profileDesc = stripHTML(data.sections.profile.description)
        if (profileDesc) html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'PROFIL'}</h2><div class="cv-item-description">${profileDesc}</div></div>`
        break

      case 'traits':
        if (!hasArrayContent(data?.sections?.traits)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'EGENSKAPER'}</h2><div class="cv-skills-container">`
        data.sections.traits.forEach((trait: any) => {
          if (!hasContent(trait)) return
          const traitName = safeText(trait.name)
          if (traitName) html += `<span class="cv-skill-item">${traitName}</span>`
        })
        html += `</div></div>`
        break

      case 'courses':
        if (!hasArrayContent(data?.sections?.courses)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'KURSER'}</h2>`
        data.sections.courses.forEach((course: any) => {
          // Check if this is a page break first
          if (course && course.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          
          if (!hasContent(course)) return
          const courseName = safeText(course.name)
          const courseDate = safeText(course.date)
          const courseInst = safeText(course.institution)
          const courseDesc = stripHTML(course.description)
          
          html += `<div class="cv-item cv-experience-item" data-keep><div class="cv-item-header">`
          if (courseName) html += `<h3 class="cv-item-title">${courseName}</h3>`
          if (courseDate) html += `<span class="cv-item-date">${courseDate}</span>`
          html += `</div>`
          if (courseInst) html += `<p class="cv-item-company">${courseInst}</p>`
          if (courseDesc) html += `<div class="cv-item-description">${courseDesc}</div>`
          html += `</div>`
        })
        html += `</div>`
        break

      case 'internship':
        if (!hasArrayContent(data?.sections?.internship)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'PRAKTIK'}</h2>`
        data.sections.internship.forEach((intern: any) => {
          // Check if this is a page break first
          if (intern && intern.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          
          if (!hasContent(intern)) return
          const internTitle = safeText(intern.title)
          const internDate = safeText(dateRange(intern.startDate, intern.startYear, intern.endDate, intern.endYear, intern.current))
          const internCompany = safeText(intern.company)
          const internLocation = safeText(intern.location)
          const internDesc = stripHTML(intern.description)
          
          html += `<div class="cv-item cv-experience-item" data-keep><div class="cv-item-header">`
          if (internTitle) html += `<h3 class="cv-item-title">${internTitle}</h3>`
          if (internDate) html += `<span class="cv-item-date">${internDate}</span>`
          html += `</div>`
          if (internCompany) html += `<p class="cv-item-company">${internCompany}</p>`
          if (internLocation) html += `<p class="cv-item-location">${internLocation}</p>`
          if (internDesc) html += `<div class="cv-item-description">${internDesc}</div>`
          html += `</div>`
        })
        html += `</div>`
        break

      case 'certificates':
        if (!hasArrayContent(data?.sections?.certificates)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'CERTIFIKAT'}</h2>`
        data.sections.certificates.forEach((cert: any) => {
          // Check if this is a page break first
          if (cert && cert.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          
          if (!hasContent(cert)) return
          const certName = safeText(cert.name)
          const certYear = safeText(cert.year)
          const certIssuer = safeText(cert.issuer)
          const certDesc = stripHTML(cert.description)
          
          html += `<div class="cv-item cv-experience-item" data-keep><div class="cv-item-header">`
          if (certName) html += `<h3 class="cv-item-title">${certName}</h3>`
          if (certYear) html += `<span class="cv-item-date">${certYear}</span>`
          html += `</div>`
          if (certIssuer) html += `<p class="cv-item-company">${certIssuer}</p>`
          if (certDesc) html += `<div class="cv-item-description">${certDesc}</div>`
          html += `</div>`
        })
        html += `</div>`
        break

      case 'achievements':
        if (!hasArrayContent(data?.sections?.achievements)) break
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'PRESTATIONER'}</h2>`
        data.sections.achievements.forEach((achievement: any) => {
          // Check if this is a page break first
          if (achievement && achievement.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          
          if (!hasContent(achievement)) return
          const achTitle = safeText(achievement.title)
          const achDate = safeText(achievement.date)
          const achIssuer = safeText(achievement.issuer)
          const achDesc = stripHTML(achievement.description)
          
          html += `<div class="cv-item cv-experience-item" data-keep><div class="cv-item-header">`
          if (achTitle) html += `<h3 class="cv-item-title">${achTitle}</h3>`
          if (achDate) html += `<span class="cv-item-date">${achDate}</span>`
          html += `</div>`
          if (achIssuer) html += `<p class="cv-item-company">${achIssuer}</p>`
          if (achDesc) html += `<div class="cv-item-description">${achDesc}</div>`
          html += `</div>`
        })
        html += `</div>`
        break

      case 'references':
        html += `<div class="cv-section"><h2 class="cv-section-title">${sectionToUse.title || 'REFERENSER'}</h2>`
        
        // Check if there are any actual references (not just empty or page breaks)
        const hasActualReferences = hasArrayContent(data?.sections?.references) && 
          data.sections.references.some((ref: any) => !ref.isPageBreak && hasContent(ref))
        
        if (!hasActualReferences) {
          // Show "Referenser ges på begäran" if no references
          html += `<p class="cv-item-description" style="font-style: italic;">Referenser ges på begäran</p>`
        } else {
          // Show actual references
          data.sections.references.forEach((ref: any) => {
            // Check if this is a page break first
            if (ref && ref.isPageBreak === true) {
              html += `<div class="cv-page-break"></div>`
              return
            }
            
            if (!hasContent(ref)) return
            const refName = safeText(ref.name)
            const refTitle = safeText(ref.title)
            const refCompany = safeText(ref.company)
            const refEmail = safeText(ref.email)
            const refPhone = safeText(ref.phone)
            
            html += `<div class="cv-item cv-experience-item" data-keep><div class="cv-item-header">`
            if (refName) html += `<h3 class="cv-item-title">${refName}</h3>`
            html += `</div>`
            
            // Titel och företag på samma rad
            if (refTitle || refCompany) {
              const titleCompanyParts = [refTitle, refCompany].filter(v => v && v.trim() !== '')
              html += `<p class="cv-item-company">${titleCompanyParts.join(', ')}</p>`
            }
            
            // Email och telefon på samma rad med ikoner
            if (refEmail || refPhone) {
              const contactParts = []
              if (refEmail) {
                contactParts.push(`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>${refEmail}`)
              }
              if (refPhone) {
                contactParts.push(`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${refPhone}`)
              }
              html += `<p class="cv-item-description">${contactParts.join(' • ')}</p>`
            }
            
            html += `</div>`
          })
        }
        html += `</div>`
        break
    }
  })

  html += '</div>'
  return html
}

