// Generate static HTML from CV data for Executive template
export function generateCVHtmlExecutive(data: any, sectionOrder: string[], sections: any[]): string {
  const safeText = (text: any): string => {
    if (text === null || text === undefined || text === '') return ''
    return String(text).trim()
  }

  const hasContent = (item: any): boolean => {
    if (!item || typeof item !== 'object') return false
    if (item.isPageBreak) return true
    const keys = Object.keys(item).filter(k => !['id', '__uid', 'isPageBreak'].includes(k))
    return keys.some(key => {
      const val = item[key]
      return val !== null && val !== undefined && val !== '' && val !== false
    })
  }

  const hasArrayContent = (arr: any): boolean => {
    return Array.isArray(arr) && arr.length > 0 && arr.some(item => {
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

  let optionalFields = {}
  const rawOptionalFields = data?.personalInfo?.optionalFields
  
  if (rawOptionalFields && typeof rawOptionalFields === 'object' && !Array.isArray(rawOptionalFields)) {
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
  
  const getFieldIcon = (type: string): string => {
    const iconStyle = 'display: inline-block; vertical-align: middle; margin-right: 6px;'
    const icons: Record<string, string> = {
      birthDate: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      birthPlace: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      drivingLicense: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><circle cx="8" cy="12" r="2"/><path d="M15 8h2"/><path d="M15 12h2"/><path d="M15 16h2"/></svg>`,
      gender: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>`,
      nationality: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      civilStatus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
      website: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      linkedin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${iconStyle}"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    }
    return icons[type] || ''
  }

  // Executive template - large header with photo, elegant single column
  let html = '<div class="cv-container-executive">'
  
  const fullName = `${safePersonalInfo.firstName} ${safePersonalInfo.lastName}`.trim() || 'Curriculum Vitae'
  
  // Large header with photo and name side by side
  html += `<div class="cv-header-executive">`
  html += `<div class="cv-header-content-executive">`
  
  // Photo on the left
  if (isValidImageSrc(safePersonalInfo.photo)) {
    html += `<div class="cv-photo-executive">`
    html += `<img src="${safePersonalInfo.photo}" alt="Profile" class="cv-profile-image-executive" />`
    html += `</div>`
  }
  
  // Name and title on the right
  html += `<div class="cv-header-text-executive">`
  html += `<h1 class="cv-name-executive">${fullName}</h1>`
  if (safePersonalInfo.title) html += `<p class="cv-title-executive">${safePersonalInfo.title}</p>`
  html += `</div>`
  
  html += `</div>` // End header-content
  
  // Contact info below
  html += `<div class="cv-contact-executive">`
  const contactItems = []
  if (safePersonalInfo.email) contactItems.push(`<span class="cv-contact-item-executive">${safePersonalInfo.email}</span>`)
  if (safePersonalInfo.phone) contactItems.push(`<span class="cv-contact-item-executive">${safePersonalInfo.phone}</span>`)
  const locationParts = [safePersonalInfo.address, safePersonalInfo.postalCode, safePersonalInfo.location].filter(v => v && v.trim() !== '')
  if (locationParts.length > 0) contactItems.push(`<span class="cv-contact-item-executive">${locationParts.join(', ')}</span>`)
  
  // Optional fields
  if (safePersonalInfo.optionalFields && typeof safePersonalInfo.optionalFields === 'object') {
    for (const [fieldKey, value] of Object.entries(safePersonalInfo.optionalFields)) {
      if (fieldKey.endsWith('_label')) continue
      if (value && String(value).trim() !== '') {
        const isCustomField = fieldKey.startsWith('custom_')
        if (isCustomField) {
          const customIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
          contactItems.push(`<span class="cv-contact-item-executive">${customIcon}${value}</span>`)
        } else {
          const icon = getFieldIcon(fieldKey)
          contactItems.push(`<span class="cv-contact-item-executive">${icon}${value}</span>`)
        }
      }
    }
  }
  
  html += contactItems.join(' ')
  html += `</div>` // End contact
  html += `</div>` // End header
  
  // Main content
  sectionOrder.forEach(sectionId => {
    const section = sections.find(s => s.id === sectionId)
    const sectionToUse = section || { id: sectionId, title: sectionId.toUpperCase(), hidden: false }
    if (sectionToUse.hidden) return
    
    // Skip personalInfo as it's in the header
    if (sectionId === 'personalInfo') return
    
    switch (sectionId) {
      case 'profile':
        if (!data?.sections?.profile?.description || data.sections.profile.description.trim() === '') break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'PROFIL'}</h2>`
        html += `<div class="cv-section-content-executive">`
        html += `<p class="cv-item-description">${stripHTML(data.sections.profile.description)}</p>`
        html += `</div></div>`
        break
        
      case 'experience':
        if (!hasArrayContent(data?.workExperience)) break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'ARBETSLIVSERFARENHET'}</h2>`
        html += `<div class="cv-section-content-executive">`
        data.workExperience.forEach((exp: any) => {
          if (exp && exp.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          if (!hasContent(exp)) return
          
          const expTitle = safeText(exp.title)
          const expCompany = safeText(exp.company)
          const expLocation = safeText(exp.location)
          const expDesc = stripHTML(exp.description)
          const dates = dateRange(exp.startDate, exp.startYear, exp.endDate, exp.endYear, exp.current)
          
          html += `<div class="cv-item-executive" data-keep>`
          html += `<div class="cv-item-header-executive">`
          if (expTitle) html += `<h3 class="cv-item-title-executive">${expTitle}</h3>`
          if (dates) html += `<span class="cv-item-date-executive">${dates}</span>`
          html += `</div>`
          if (expCompany || expLocation) {
            const companyLocation = [expCompany, expLocation].filter(v => v && v.trim() !== '').join(' • ')
            html += `<p class="cv-item-subtitle-executive">${companyLocation}</p>`
          }
          if (expDesc) html += `<p class="cv-item-description">${expDesc}</p>`
          html += `</div>`
        })
        html += `</div></div>`
        break
        
      case 'education':
        if (!hasArrayContent(data?.education)) break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'UTBILDNING'}</h2>`
        html += `<div class="cv-section-content-executive">`
        data.education.forEach((edu: any) => {
          if (edu && edu.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          if (!hasContent(edu)) return
          
          const eduDegree = safeText(edu.degree)
          const eduSchool = safeText(edu.school)
          const eduLocation = safeText(edu.location)
          const eduDesc = stripHTML(edu.description)
          const dates = dateRange(edu.startDate, edu.startYear, edu.endDate, edu.endYear, edu.current)
          
          html += `<div class="cv-item-executive" data-keep>`
          html += `<div class="cv-item-header-executive">`
          if (eduDegree) html += `<h3 class="cv-item-title-executive">${eduDegree}</h3>`
          if (dates) html += `<span class="cv-item-date-executive">${dates}</span>`
          html += `</div>`
          if (eduSchool || eduLocation) {
            const schoolLocation = [eduSchool, eduLocation].filter(v => v && v.trim() !== '').join(' • ')
            html += `<p class="cv-item-subtitle-executive">${schoolLocation}</p>`
          }
          if (eduDesc) html += `<p class="cv-item-description">${eduDesc}</p>`
          html += `</div>`
        })
        html += `</div></div>`
        break
        
      case 'skills':
        if (!hasArrayContent(data?.skills)) break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'FÄRDIGHETER'}</h2>`
        html += `<div class="cv-section-content-executive">`
        html += `<div class="cv-skills-executive">`
        data.skills.forEach((skill: any) => {
          if (!hasContent(skill)) return
          const skillName = safeText(skill.name)
          const skillLevel = safeText(skill.level)
          if (skillName) html += `<span class="cv-skill-item-executive">${skillName}${skillLevel ? ` • ${skillLevel}` : ''}</span>`
        })
        html += `</div></div></div>`
        break
        
      case 'languages':
        if (!hasArrayContent(data?.languages)) break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'SPRÅK'}</h2>`
        html += `<div class="cv-section-content-executive">`
        html += `<div class="cv-skills-executive">`
        data.languages.forEach((lang: any) => {
          if (!hasContent(lang)) return
          const langName = safeText(lang.name || lang.language)
          const langLevel = safeText(lang.proficiency)
          if (langName) html += `<span class="cv-skill-item-executive">${langName}${langLevel ? ` • ${langLevel}` : ''}</span>`
        })
        html += `</div></div></div>`
        break
        
      case 'courses':
        if (!hasArrayContent(data?.sections?.courses)) break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'KURSER'}</h2>`
        html += `<div class="cv-section-content-executive">`
        data.sections.courses.forEach((course: any) => {
          if (course && course.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          if (!hasContent(course)) return
          
          const courseName = safeText(course.name)
          const courseOrganization = safeText(course.organization)
          const courseYear = safeText(course.year)
          const courseDesc = stripHTML(course.description)
          
          html += `<div class="cv-item-executive" data-keep>`
          html += `<div class="cv-item-header-executive">`
          if (courseName) html += `<h3 class="cv-item-title-executive">${courseName}</h3>`
          if (courseYear) html += `<span class="cv-item-date-executive">${courseYear}</span>`
          html += `</div>`
          if (courseOrganization) html += `<p class="cv-item-subtitle-executive">${courseOrganization}</p>`
          if (courseDesc) html += `<p class="cv-item-description">${courseDesc}</p>`
          html += `</div>`
        })
        html += `</div></div>`
        break
        
      case 'certificates':
        if (!hasArrayContent(data?.sections?.certificates)) break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'CERTIFIKAT'}</h2>`
        html += `<div class="cv-section-content-executive">`
        data.sections.certificates.forEach((cert: any) => {
          if (cert && cert.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          if (!hasContent(cert)) return
          
          const certName = safeText(cert.name)
          const certIssuer = safeText(cert.issuer)
          const certYear = safeText(cert.year)
          const certDesc = stripHTML(cert.description)
          
          html += `<div class="cv-item-executive" data-keep>`
          html += `<div class="cv-item-header-executive">`
          if (certName) html += `<h3 class="cv-item-title-executive">${certName}</h3>`
          if (certYear) html += `<span class="cv-item-date-executive">${certYear}</span>`
          html += `</div>`
          if (certIssuer) html += `<p class="cv-item-subtitle-executive">${certIssuer}</p>`
          if (certDesc) html += `<p class="cv-item-description">${certDesc}</p>`
          html += `</div>`
        })
        html += `</div></div>`
        break
        
      case 'achievements':
        if (!hasArrayContent(data?.sections?.achievements)) break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'PRESTATIONER'}</h2>`
        html += `<div class="cv-section-content-executive">`
        data.sections.achievements.forEach((achievement: any) => {
          if (achievement && achievement.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          if (!hasContent(achievement)) return
          
          const achievementTitle = safeText(achievement.title)
          const achievementDesc = stripHTML(achievement.description)
          
          html += `<div class="cv-item-executive" data-keep>`
          if (achievementTitle) html += `<h3 class="cv-item-title-executive">${achievementTitle}</h3>`
          if (achievementDesc) html += `<p class="cv-item-description">${achievementDesc}</p>`
          html += `</div>`
        })
        html += `</div></div>`
        break
        
      case 'internship':
        if (!hasArrayContent(data?.sections?.internship)) break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'PRAKTIK'}</h2>`
        html += `<div class="cv-section-content-executive">`
        data.sections.internship.forEach((intern: any) => {
          if (intern && intern.isPageBreak === true) {
            html += `<div class="cv-page-break"></div>`
            return
          }
          if (!hasContent(intern)) return
          
          const internTitle = safeText(intern.title)
          const internCompany = safeText(intern.company)
          const internLocation = safeText(intern.location)
          const internDesc = stripHTML(intern.description)
          const dates = dateRange(intern.startDate, intern.startYear, intern.endDate, intern.endYear, intern.current)
          
          html += `<div class="cv-item-executive" data-keep>`
          html += `<div class="cv-item-header-executive">`
          if (internTitle) html += `<h3 class="cv-item-title-executive">${internTitle}</h3>`
          if (dates) html += `<span class="cv-item-date-executive">${dates}</span>`
          html += `</div>`
          if (internCompany || internLocation) {
            const companyLocation = [internCompany, internLocation].filter(v => v && v.trim() !== '').join(' • ')
            html += `<p class="cv-item-subtitle-executive">${companyLocation}</p>`
          }
          if (internDesc) html += `<p class="cv-item-description">${internDesc}</p>`
          html += `</div>`
        })
        html += `</div></div>`
        break
        
      case 'traits':
        if (!data?.sections?.traits || !Array.isArray(data.sections.traits) || data.sections.traits.length === 0) break
        const validTraits = data.sections.traits.filter((trait: any) => trait && trait.name && trait.name.trim() !== '')
        if (validTraits.length === 0) break
        
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'EGENSKAPER'}</h2>`
        html += `<div class="cv-section-content-executive">`
        html += `<div class="cv-skills-executive">`
        validTraits.forEach((trait: any) => {
          html += `<span class="cv-skill-item-executive">${safeText(trait.name)}</span>`
        })
        html += `</div></div></div>`
        break
        
      case 'hobbies':
        if (!data?.sections?.hobbies?.description || data.sections.hobbies.description.trim() === '') break
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'FRITIDSAKTIVITETER'}</h2>`
        html += `<div class="cv-section-content-executive">`
        html += `<p class="cv-item-description">${stripHTML(data.sections.hobbies.description)}</p>`
        html += `</div></div>`
        break
        
      case 'references':
        html += `<div class="cv-section-executive">`
        html += `<h2 class="cv-section-title-executive">${sectionToUse.title || 'REFERENSER'}</h2>`
        html += `<div class="cv-section-content-executive">`
        
        const hasActualReferences = hasArrayContent(data?.sections?.references) && 
          data.sections.references.some((ref: any) => !ref.isPageBreak && hasContent(ref))
        
        if (!hasActualReferences) {
          html += `<p class="cv-item-description" style="font-style: italic;">Referenser ges på begäran</p>`
        } else {
          data.sections.references.forEach((ref: any) => {
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
            
            html += `<div class="cv-item-executive" data-keep>`
            if (refName) html += `<h3 class="cv-item-title-executive">${refName}</h3>`
            
            if (refTitle || refCompany) {
              const titleCompanyParts = [refTitle, refCompany].filter(v => v && v.trim() !== '')
              html += `<p class="cv-item-subtitle-executive">${titleCompanyParts.join(' • ')}</p>`
            }
            
            if (refEmail || refPhone) {
              const contactParts = []
              if (refEmail) {
                contactParts.push(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>${refEmail}`)
              }
              if (refPhone) {
                contactParts.push(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${refPhone}`)
              }
              html += `<p class="cv-item-description">${contactParts.join(' • ')}</p>`
            }
            
            html += `</div>`
          })
        }
        html += `</div></div>`
        break
    }
  })
  
  html += '</div>' // End container
  
  return html
}

