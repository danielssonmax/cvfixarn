import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { linkedinUrl } = await req.json()

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: "LinkedIn URL krävs" },
        { status: 400 }
      )
    }

    // Extrahera profil-ID från LinkedIn URL
    // Format: https://www.linkedin.com/in/profile-id/
    const profileIdMatch = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/)
    
    if (!profileIdMatch) {
      return NextResponse.json(
        { error: "Ogiltig LinkedIn URL. Använd formatet: https://www.linkedin.com/in/ditt-namn" },
        { status: 400 }
      )
    }

    const profileId = profileIdMatch[1]

    // Hämta API-nyckel och base URL från miljövariabler
    const apiKey = process.env.ISCRAPER_API_KEY
    const baseUrl = process.env.ISCRAPER_BASE_URL || "https://api.proapis.com/iscraper/v4/profile-details"

    if (!apiKey) {
      console.error("iScraper API-nyckel saknas i miljövariablerna")
      return NextResponse.json(
        { error: "LinkedIn-import är inte konfigurerad. Kontakta systemadministratören." },
        { status: 503 }
      )
    }

    // Anropa iScraper API med timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 sekunder timeout

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          profile_id: profileId,
          profile_type: "personal",
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Hantera olika HTTP-statuskoder
      if (response.status === 401) {
        console.error("ProAPIs autentiseringsfel: Ogiltig API-nyckel")
        return NextResponse.json(
          { error: "LinkedIn-import är felkonfigurerad. Kontakta administratören." },
          { status: 503 }
        )
      }

      if (response.status === 403) {
        console.error("ProAPIs åtkomstfel: Ingen åtkomst till resursen")
        return NextResponse.json(
          { error: "Åtkomst nekad till LinkedIn-data. Kontakta administratören." },
          { status: 403 }
        )
      }

      if (response.status === 404) {
        console.error("ProAPIs 404: Profil hittades inte")
        return NextResponse.json(
          { error: "LinkedIn-profilen kunde inte hittas. Kontrollera att URL:en är korrekt och att profilen är offentlig." },
          { status: 404 }
        )
      }

      if (response.status === 429) {
        console.error("ProAPIs rate limit: För många förfrågningar")
        return NextResponse.json(
          { error: "För många förfrågningar. Vänta en stund och försök igen." },
          { status: 429 }
        )
      }

      if (response.status >= 500) {
        const errorText = await response.text()
        console.error("ProAPIs serverfel:", response.status, errorText)
        return NextResponse.json(
          { error: "LinkedIn-tjänsten är tillfälligt otillgänglig. Försök igen om en stund." },
          { status: 503 }
        )
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("ProAPIs oväntat fel:", response.status, errorText)
        return NextResponse.json(
          { error: "Kunde inte hämta LinkedIn-data. Försök igen senare." },
          { status: response.status }
        )
      }

      const linkedinData = await response.json()

      // DETALJERAD LOGGING
      console.log("=== LINKEDIN API RESPONSE ===")
      console.log("Full response:", JSON.stringify(linkedinData, null, 2))
      console.log("Profile ID:", linkedinData.profile_id)
      console.log("Name:", linkedinData.first_name, linkedinData.last_name)
      console.log("Title:", linkedinData.sub_title)
      console.log("Location:", linkedinData.location)
      console.log("Summary:", linkedinData.summary)
      console.log("Position Groups:", linkedinData.position_groups?.length || 0)
      console.log("Education:", linkedinData.education?.length || 0)
      console.log("Skills:", linkedinData.skills?.length || 0)
      console.log("Skills with endorsements:", JSON.stringify(linkedinData.skills?.map((s: any) => ({ name: s.name, endorsements: s.endorsement_count })), null, 2))
      console.log("Languages raw:", JSON.stringify(linkedinData.languages, null, 2))
      console.log("Profile languages:", linkedinData.languages?.profile_languages)
      console.log("Courses:", linkedinData.courses?.length || 0)
      console.log("Certifications:", linkedinData.certifications?.length || 0)
      console.log("Awards:", linkedinData.awards?.length || 0)
      console.log("=============================")

      // Validera att vi fick data
      if (!linkedinData || !linkedinData.profile_id) {
        console.error("ProAPIs returnerade tom eller ogiltig data:", linkedinData)
        return NextResponse.json(
          { error: "Ingen data kunde hämtas från LinkedIn-profilen." },
          { status: 422 }
        )
      }

      // Mappa LinkedIn-data till CV-format
      const cvData = mapLinkedInDataToCVFormat(linkedinData)

      console.log("=== MAPPED CV DATA ===")
      console.log(JSON.stringify(cvData, null, 2))
      console.log("======================")

      return NextResponse.json({ 
        success: true, 
        data: cvData,
        _debug: {
          raw_linkedin_data: linkedinData,
          profile_id: linkedinData.profile_id,
          name: `${linkedinData.first_name} ${linkedinData.last_name}`,
          title: linkedinData.sub_title,
          position_groups_count: linkedinData.position_groups?.length || 0,
          education_count: linkedinData.education?.length || 0
        }
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error("ProAPIs timeout: Förfrågan tog för lång tid")
        return NextResponse.json(
          { error: "LinkedIn-import tog för lång tid. Försök igen." },
          { status: 504 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error("Error importing LinkedIn data:", error)
    return NextResponse.json(
      { error: "Ett oväntat fel uppstod vid import" },
      { status: 500 }
    )
  }
}

// Hjälpfunktion för att mappa LinkedIn-data till CV-format
function mapLinkedInDataToCVFormat(linkedinData: any) {
  const profile = linkedinData

  // Extrahera location information
  const location = profile.location?.default || profile.location?.city || ""
  const city = profile.location?.city || ""

  return {
    personalInfo: {
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      email: "",
      phone: "",
      address: location,
      city: city,
      postalCode: "",
      title: profile.sub_title || "",
      summary: profile.summary || "",
      // Extra fält som kan vara användbara
      profilePicture: profile.profile_picture || "",
      linkedinUrl: profile.profile_id ? `https://www.linkedin.com/in/${profile.profile_id}` : "",
      industry: profile.industry || "",
    },
    experience: (profile.position_groups || []).flatMap((group: any) => 
      (group.profile_positions || []).map((pos: any) => ({
        id: Math.random().toString(),
        company: group.company?.name || "",
        title: pos.title || "",
        startDate: pos.date?.start?.month ? String(pos.date.start.month) : "",
        startYear: pos.date?.start?.year ? String(pos.date.start.year) : "",
        endDate: pos.date?.end?.month ? String(pos.date.end.month) : "",
        endYear: pos.date?.end?.year ? String(pos.date.end.year) : "",
        current: !pos.date?.end?.year,
        description: pos.description || "",
        location: pos.location || "",
        employmentType: pos.employment_type || "",
        // Extra företagsinfo
        companyUrl: group.company?.url || "",
        companyLogo: group.company?.logo || "",
        companySize: group.company?.employees 
          ? `${group.company.employees.start}${group.company.employees.end ? `-${group.company.employees.end}` : '+'} anställda`
          : "",
      }))
    ),
    education: (profile.education || []).map((edu: any) => ({
      id: Math.random().toString(),
      school: edu.school?.name || "",
      degree: edu.degree_name || "",
      field: edu.field_of_study || "",
      startDate: edu.date?.start?.month ? String(edu.date.start.month) : "",
      startYear: edu.date?.start?.year ? String(edu.date.start.year) : "",
      endDate: edu.date?.end?.month ? String(edu.date.end.month) : "",
      endYear: edu.date?.end?.year ? String(edu.date.end.year) : "",
      current: !edu.date?.end?.year,
      description: edu.description || "",
      grade: edu.grade || "",
      schoolUrl: edu.school?.url || "",
      schoolLogo: edu.school?.logo || "",
    })),
    skills: (profile.skills || []).map((skill: any) => ({
      id: Math.random().toString(),
      name: typeof skill === "string" ? skill : skill.name || "",
      level: "Expert",
    })),
    languages: (profile.languages?.profile_languages || []).map((lang: any) => ({
      id: Math.random().toString(),
      language: lang.name || "",
      proficiency: lang.proficiency || "Flytande",
    })),
    courses: (profile.courses || []).map((course: any) => ({
      id: Math.random().toString(),
      name: course.name || "",
      institution: course.number || "",
      date: course.date || "",
    })),
    certificates: (profile.certifications || []).map((cert: any) => ({
      id: Math.random().toString(),
      name: cert.name || "",
      issuer: cert.authority || "",
      date: cert.date?.start?.year 
        ? `${cert.date.start.year}-${String(cert.date.start.month || 1).padStart(2, "0")}`
        : "",
      url: cert.url || "",
    })),
    // NYA SEKTIONER från LinkedIn
    achievements: (profile.awards || []).map((award: any) => ({
      id: Math.random().toString(),
      title: award.title || "",
      description: award.description || "",
      issuer: award.issuer || "",
      date: award.issued_on?.year 
        ? `${award.issued_on.year}-${String(award.issued_on.month || 1).padStart(2, "0")}`
        : "",
    })),
    projects: (profile.projects || []).map((project: any) => ({
      id: Math.random().toString(),
      name: project.title || "",
      description: project.description || "",
      url: project.url || "",
      startDate: project.date?.start?.year 
        ? `${project.date.start.year}-${String(project.date.start.month || 1).padStart(2, "0")}`
        : "",
      endDate: project.date?.end?.year 
        ? `${project.date.end.year}-${String(project.date.end.month || 1).padStart(2, "0")}`
        : "",
    })),
    publications: (profile.publications || []).map((pub: any) => ({
      id: Math.random().toString(),
      title: pub.name || "",
      publisher: pub.publisher || "",
      date: pub.date?.year 
        ? `${pub.date.year}-${String(pub.date.month || 1).padStart(2, "0")}`
        : "",
      url: pub.url || "",
      description: pub.description || "",
    })),
    patents: (profile.patents || []).map((patent: any) => ({
      id: Math.random().toString(),
      title: patent.title || "",
      number: patent.patent_number || "",
      office: patent.patent_office || "",
      description: patent.description || "",
      date: patent.issued_on?.year 
        ? `${patent.issued_on.year}-${String(patent.issued_on.month || 1).padStart(2, "0")}`
        : "",
      url: patent.url || "",
    })),
    volunteering: (profile.volunteer_experiences || []).map((vol: any) => ({
      id: Math.random().toString(),
      organization: vol.company?.name || "",
      role: vol.role || "",
      cause: vol.cause || "",
      description: vol.description || "",
      startDate: vol.date?.start?.year 
        ? `${vol.date.start.year}-${String(vol.date.start.month || 1).padStart(2, "0")}`
        : "",
      endDate: vol.date?.end?.year 
        ? `${vol.date.end.year}-${String(vol.date.end.month || 1).padStart(2, "0")}`
        : "",
    })),
    organizations: (profile.organizations || []).map((org: any) => ({
      id: Math.random().toString(),
      name: org.name || "",
      position: org.title || "",
      description: org.description || "",
      startDate: org.date?.start?.year 
        ? `${org.date.start.year}-${String(org.date.start.month || 1).padStart(2, "0")}`
        : "",
      endDate: org.date?.end?.year 
        ? `${org.date.end.year}-${String(org.date.end.month || 1).padStart(2, "0")}`
        : "",
    })),
    testScores: (profile.test_scores || []).map((test: any) => ({
      id: Math.random().toString(),
      name: test.name || "",
      score: test.score || "",
      date: test.date?.year 
        ? `${test.date.year}-${String(test.date.month || 1).padStart(2, "0")}`
        : "",
      description: test.description || "",
    })),
    // Metadata som kan vara användbar
    metadata: {
      isPremium: profile.premium || false,
      isInfluencer: profile.influencer || false,
      isOpenToWork: profile.open_to_work || false,
      primaryLanguage: profile.languages?.primary_locale 
        ? `${profile.languages.primary_locale.language}_${profile.languages.primary_locale.country}`
        : "",
    }
  }
}

