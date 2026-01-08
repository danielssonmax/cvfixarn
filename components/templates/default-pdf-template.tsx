"use client"

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'

// Register fonts (optional - uses default fonts if not specified)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2'
// })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    objectFit: 'cover',
    marginLeft: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
    letterSpacing: -0.5,
    lineHeight: 1.3,
  },
  title: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 10,
    marginTop: 0,
    fontWeight: 'normal',
    lineHeight: 1.5,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 10,
    color: '#6B7280',
    marginTop: 8,
  },
  contactItem: {
    marginRight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D1D5DB',
    textTransform: 'uppercase',
    color: '#111827',
    letterSpacing: 0.5,
  },
  experienceItem: {
    marginBottom: 16,
    paddingLeft: 0,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    alignItems: 'baseline',
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginBottom: 4,
  },
  experienceDate: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'normal',
    marginLeft: 8,
  },
  company: {
    fontSize: 11,
    marginBottom: 3,
    color: '#374151',
    fontWeight: 'normal',
  },
  location: {
    fontSize: 9,
    color: '#9CA3AF',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#4B5563',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  skillItem: {
    fontSize: 10,
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 3,
    color: '#374151',
  },
  languageItem: {
    fontSize: 10,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 3,
    color: '#1E40AF',
  },
})

interface TemplatePDFProps {
  data: any
  sectionOrder: string[]
  sections?: { id: string; title: string; hidden?: boolean }[]
  headerColor?: string
  selectedFont?: string
  fontSize?: string
  textColor?: string
  selectedTemplate?: string
}

const hasContent = (item: any) => {
  if (!item || typeof item !== 'object') return false
  const values = Object.values(item)
  if (values.length === 0) return false
  return values.some((value) => {
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'boolean') return value
    if (Array.isArray(value)) return value.length > 0
    return value != null
  })
}

const hasArrayContent = (array: any) => {
  return Array.isArray(array) && array.length > 0 && array.some(hasContent)
}

const stripHTML = (html: string): string => {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

// Safe text helper - ensures Text components never receive empty strings or booleans
const safeText = (val: any) => {
  if (val == null) return '\u200B';
  const s = String(val).trim();
  return s === '' ? '\u200B' : s;
};

// Stable key helper - uses permanent UIDs, never content-based
const itemKey = (item: any, i: number) => item?.id ?? item?.__uid ?? String(i);

const isValidImageSrc = (src: any) =>
  typeof src === 'string' &&
  src.trim() !== '' &&
  (/^https?:\/\//.test(src) || /^data:image\//.test(src));

const dateLabel = (month?: string, year?: string) => {
  if (!month && !year) return '';
  const names = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
  const idx = Number(month) - 1;
  const name = names[idx] || '';
  return `${name} ${year || ''}`.trim();
};

const dateRange = (
  startMonth?: string, startYear?: string,
  endMonth?: string, endYear?: string,
  current?: boolean
) => {
  const hasStart = !!(startMonth || startYear);
  const hasEnd = !!(endMonth || endYear || current);
  if (!hasStart && !hasEnd) return '';
  const start = dateLabel(startMonth, startYear);
  const end = current ? 'Nutid' : dateLabel(endMonth, endYear);
  // Always return string, never boolean children
  return hasStart && hasEnd ? `${start} - ${end}` : (start || end);
};

const DefaultPDFTemplateComponent = ({ data, sectionOrder, sections = [], headerColor }: TemplatePDFProps) => {
  // Safety check - ensure data exists and has required fields
  if (!data || !data.personalInfo || typeof data.personalInfo !== 'object') {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text>Loading...</Text>
          </View>
        </Page>
      </Document>
    )
  }
  
  // Ensure all personalInfo fields are strings (not undefined)
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
  
  // Use safePersonalInfo instead of data.personalInfo
  const safeData = {
    ...data,
    personalInfo: safePersonalInfo,
  }

  const renderSection = (sectionId: string) => {
    try {
      const section = sections.find((s) => s.id === sectionId)
      if (!section || section.hidden) {
        return null
      }

      switch (sectionId) {
      case 'experience':
        if (!hasArrayContent(data.workExperience)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>ARBETSLIVSERFARENHET</Text>
            {(data.workExperience || []).map((exp: any, index: number) => {
              if (!hasContent(exp)) return null
              return (
                <View key={itemKey(exp, index)} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.experienceTitle}>{safeText(exp.title)}</Text>
                    <Text style={styles.experienceDate}>
                      {safeText(dateRange(exp.startDate, exp.startYear, exp.endDate, exp.endYear, exp.current))}
                    </Text>
                  </View>
                  <Text style={styles.company}>{safeText(exp.company)}</Text>
                  <Text style={styles.location}>{safeText(exp.location)}</Text>
                  <Text style={styles.description}>{safeText(stripHTML(exp.description))}</Text>
                </View>
              )
            })}
          </View>
        )

      case 'education':
        if (!hasArrayContent(data.education)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>UTBILDNING</Text>
            {(data.education || []).map((edu: any, index: number) => {
              if (!hasContent(edu)) return null
              return (
              <View key={itemKey(edu, index)} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{safeText(edu.degree)}</Text>
                  <Text style={styles.experienceDate}>
                    {safeText(dateRange(edu.startDate, edu.startYear, edu.endDate, edu.endYear, edu.current))}
                  </Text>
                </View>
                <Text style={styles.company}>{safeText(edu.school)}</Text>
                <Text style={styles.location}>{safeText(edu.location)}</Text>
                <Text style={styles.description}>{safeText(stripHTML(edu.description))}</Text>
              </View>
              )
            })}
          </View>
        )

      case 'skills':
        if (!hasArrayContent(data.skills)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>FÄRDIGHETER</Text>
            <View style={styles.skillsContainer}>
              {(data.skills || []).map((skill: any, index: number) => {
                if (!hasContent(skill)) return null
                return <Text key={itemKey(skill, index)} style={styles.skillItem}>{safeText(skill.name)}</Text>
              })}
            </View>
          </View>
        )

      case 'languages':
        if (!hasArrayContent(data.languages)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>SPRÅK</Text>
            <View style={styles.skillsContainer}>
              {(data.languages || []).map((lang: any, index: number) => {
                // Skip if no name
                if (!lang.name || lang.name.trim() === '') return null
                const label = lang.proficiency ?? lang.level
                return (
                  <Text key={itemKey(lang, index)} style={styles.languageItem}>
                    {safeText([lang.name, label ? ` - ${label}` : ''].join('').trim())}
                  </Text>
                )
              })}
            </View>
          </View>
        )

      case 'profile':
        if (!data.sections?.profile || !(data.sections.profile as any)?.description) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>PROFIL</Text>
            <Text style={styles.description}>
              {safeText(stripHTML((data.sections.profile as any)?.description))}
            </Text>
          </View>
        )

      case 'traits':
        const traits = data.sections?.traits
        if (!hasArrayContent(traits)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>EGENSKAPER</Text>
            <View style={styles.skillsContainer}>
              {(traits || []).map((trait: any, index: number) => {
                if (!hasContent(trait)) return null
                return <Text key={itemKey(trait, index)} style={styles.skillItem}>{safeText(trait.name)}</Text>
              })}
            </View>
          </View>
        )

      case 'courses':
        const courses = data.sections?.courses
        if (!hasArrayContent(courses)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>KURSER</Text>
            {(courses || []).map((course: any, index: number) => {
              if (!hasContent(course)) return null
              return (
              <View key={itemKey(course, index)} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{safeText(course.name)}</Text>
                  <Text style={styles.experienceDate}>{safeText(course.date)}</Text>
                </View>
                <Text style={styles.company}>{safeText(course.institution)}</Text>
                <Text style={styles.description}>{safeText(stripHTML(course.description))}</Text>
              </View>
              )
            })}
          </View>
        )

      case 'internship':
        const internships = data.sections?.internship
        if (!hasArrayContent(internships)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>PRAKTIK</Text>
            {(internships || []).map((intern: any, index: number) => {
              if (!hasContent(intern)) return null
              return (
              <View key={itemKey(intern, index)} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{safeText(intern.title)}</Text>
                  <Text style={styles.experienceDate}>
                    {safeText(dateRange(intern.startDate, intern.startYear, intern.endDate, intern.endYear, intern.current))}
                  </Text>
                </View>
                <Text style={styles.company}>{safeText(intern.company)}</Text>
                <Text style={styles.location}>{safeText(intern.location)}</Text>
                <Text style={styles.description}>{safeText(stripHTML(intern.description))}</Text>
              </View>
              )
            })}
          </View>
        )

      case 'hobbies':
        if (!data.sections?.hobbies || !(data.sections.hobbies as any)?.description) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>FRITIDSAKTIVITETER</Text>
            <Text style={styles.description}>
              {safeText(stripHTML((data.sections.hobbies as any)?.description))}
            </Text>
          </View>
        )

      case 'certificates':
        const certificates = data.sections?.certificates
        if (!hasArrayContent(certificates)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>CERTIFIKAT</Text>
            {(certificates || []).map((cert: any, index: number) => {
              if (!hasContent(cert)) return null
              return (
              <View key={itemKey(cert, index)} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{safeText(cert.name)}</Text>
                  <Text style={styles.experienceDate}>{safeText(cert.year)}</Text>
                </View>
                <Text style={styles.company}>{safeText(cert.issuer)}</Text>
                <Text style={styles.description}>{safeText(stripHTML(cert.description))}</Text>
              </View>
              )
            })}
          </View>
        )

      case 'achievements':
        const achievements = data.sections?.achievements
        if (!hasArrayContent(achievements)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>PRESTATIONER</Text>
            {(achievements || []).map((achievement: any, index: number) => {
              if (!hasContent(achievement)) return null
              return (
              <View key={itemKey(achievement, index)} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{safeText(achievement.title)}</Text>
                  <Text style={styles.experienceDate}>{safeText(achievement.date)}</Text>
                </View>
                <Text style={styles.company}>{safeText(achievement.issuer)}</Text>
                <Text style={styles.description}>{safeText(stripHTML(achievement.description))}</Text>
              </View>
              )
            })}
          </View>
        )

      case 'references':
        const references = data.sections?.references
        if (!hasArrayContent(references)) return null
        return (
          <View key={sectionId} style={styles.section}>
            <Text style={styles.sectionTitle}>REFERENSER</Text>
            {(references || []).map((ref: any, index: number) => {
              if (!hasContent(ref)) return null
              return (
              <View key={itemKey(ref, index)} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{safeText(ref.name)}</Text>
                </View>
                <Text style={styles.company}>{safeText(ref.title)}</Text>
                <Text style={styles.location}>{safeText(ref.company)}</Text>
                <Text style={styles.description}>{safeText(ref.email ? `Email: ${ref.email}` : '')}</Text>
                <Text style={styles.description}>{safeText(ref.phone ? `Telefon: ${ref.phone}` : '')}</Text>
              </View>
              )
            })}
          </View>
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
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.name}>
                {safeText(
                  `${safePersonalInfo.firstName.trim()} ${safePersonalInfo.lastName.trim()}`
                    .trim() || 'Curriculum Vitae'
                )}
              </Text>
            </View>
            <View>
              <Text style={styles.title}>{safeText(safePersonalInfo.title)}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactItem}>{safeText(safePersonalInfo.email)}</Text>
              <Text style={styles.contactItem}>{safeText(safePersonalInfo.phone)}</Text>
              <Text style={styles.contactItem}>
                {safeText([safePersonalInfo.address, safePersonalInfo.postalCode, safePersonalInfo.location]
                  .filter(v => v && v.trim() !== '')
                  .join(", "))}
              </Text>
            </View>
          </View>
          {isValidImageSrc(safePersonalInfo.photo) && (
            <Image 
              src={safePersonalInfo.photo} 
              style={styles.profileImage}
            />
          )}
        </View>

        {/* Sections */}
        {sectionOrder
          .map((sectionId) => renderSection(sectionId))
          .filter((section) => section !== null && section !== undefined)}
      </Page>
    </Document>
  )
}

// Shallow comparison helpers
const shallowEqual = (a: any, b: any) => {
  if (a === b) return true
  if (!a || !b) return false
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false
  }
  return true
}

const shallowArrayEqual = (a: any[] = [], b: any[] = []) => {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

// Memoize to prevent unnecessary re-renders
export const DefaultPDFTemplate = React.memo(DefaultPDFTemplateComponent, (prev, next) => {
  return (
    shallowEqual(prev.data?.personalInfo, next.data?.personalInfo) &&
    shallowArrayEqual(prev.data?.workExperience, next.data?.workExperience) &&
    shallowArrayEqual(prev.data?.education, next.data?.education) &&
    shallowArrayEqual(prev.data?.skills, next.data?.skills) &&
    shallowArrayEqual(prev.data?.languages, next.data?.languages) &&
    shallowArrayEqual(prev.sectionOrder, next.sectionOrder) &&
    prev.headerColor === next.headerColor &&
    prev.selectedFont === next.selectedFont &&
    prev.fontSize === next.fontSize &&
    prev.textColor === next.textColor &&
    prev.selectedTemplate === next.selectedTemplate
  )
})

export default DefaultPDFTemplate

