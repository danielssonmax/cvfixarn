import { NextRequest, NextResponse } from "next/server"
import { detectCvFormat, extractCvText } from "@/lib/extract-cv-text"
import { parseCv } from "@/lib/parse-cv"

export const runtime = "nodejs"
// Parsing a PDF is CPU-bound; give it room without letting it run forever.
export const maxDuration = 30

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

/** Reject files whose bytes do not match the extension they claim. */
function hasExpectedSignature(buffer: Buffer, format: "pdf" | "docx"): boolean {
  if (format === "pdf") return buffer.subarray(0, 5).toString("latin1") === "%PDF-"
  // .docx is a zip archive
  return buffer[0] === 0x50 && buffer[1] === 0x4b
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Ingen fil togs emot." }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Filen är tom." }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Filen är för stor. Maxstorlek är 5 MB." },
        { status: 413 },
      )
    }

    const format = detectCvFormat(file.name, file.type)
    if (!format) {
      return NextResponse.json(
        { error: "Filformatet stöds inte. Ladda upp en PDF- eller Word-fil (.docx)." },
        { status: 415 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (!hasExpectedSignature(buffer, format)) {
      return NextResponse.json(
        { error: "Filen verkar skadad eller ha fel filändelse." },
        { status: 400 },
      )
    }

    let text: string
    try {
      text = await extractCvText(buffer, format)
    } catch (error) {
      console.error("CV text extraction failed:", error)
      return NextResponse.json(
        { error: "Kunde inte läsa filen. Prova att spara om den som PDF och försök igen." },
        { status: 422 },
      )
    }

    // A scanned CV is one big image - there is no text layer to read.
    if (text.replace(/\s/g, "").length < 80) {
      return NextResponse.json(
        {
          error:
            "Vi hittade ingen text i filen. Är den inskannad som bild behöver du fylla i uppgifterna manuellt.",
        },
        { status: 422 },
      )
    }

    const parsed = parseCv(text)

    const found = {
      personalInfo: Boolean(parsed.personalInfo.firstName || parsed.personalInfo.email),
      workExperience: parsed.workExperience.length,
      education: parsed.education.length,
      skills: parsed.skills.length,
      languages: parsed.languages.length,
      sections: parsed.detectedSections,
    }

    if (
      !found.personalInfo &&
      !found.workExperience &&
      !found.education &&
      !found.skills &&
      !found.languages
    ) {
      return NextResponse.json(
        {
          error:
            "Vi kunde läsa filen men inte känna igen några CV-avsnitt. Kontrollera att rubriker som Arbetslivserfarenhet och Utbildning finns med.",
        },
        { status: 422 },
      )
    }

    return NextResponse.json({ success: true, data: parsed, found })
  } catch (error) {
    console.error("CV import failed:", error)
    return NextResponse.json({ error: "Ett oväntat fel uppstod vid importen." }, { status: 500 })
  }
}
