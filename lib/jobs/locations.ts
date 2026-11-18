import data from "@/data/jobs/locations.json"

/**
 * Sweden's 290 municipalities and 21 regions (län) with their JobTech taxonomy
 * concept ids, which is what the JobSearch API filters on.
 *
 *   resolveLocation("721 30 Västerås")  -> { kind: "municipality", name: "Västerås", slug: "vasteras", ... }
 *   resolveLocation("Stockholms län")   -> { kind: "region", name: "Stockholms län", slug: "stockholms-lan", ... }
 *   resolveLocation("Storgatan 1")      -> null
 *   getMunicipalityBySlug("vasteras"), getRegionBySlug("vastmanlands-lan")
 *   regionOf(municipality), listMunicipalities(), listRegions()
 *
 * Slugs are the lowercase name with å/ä -> a, ö -> o and hyphens for spaces.
 * One pair collides: Habo keeps "habo" and Håbo is "habo-uppsala-lan".
 *
 * The data is generated from https://taxonomy.api.jobtechdev.se (types
 * municipality and region, linked through the narrower relation from Sverige).
 * It is about 26 kB, so import this file from server code only.
 */

export type Municipality = {
  kind: "municipality"
  /** Taxonomy concept id, e.g. "8deT_FRF_2SP". */
  id: string
  name: string
  slug: string
  regionId: string
}

export type Region = {
  kind: "region"
  id: string
  /** Includes "län": "Västmanlands län". */
  name: string
  slug: string
}

export type JobLocation = Municipality | Region

const regions: Region[] = data.regions.map((region) => ({ kind: "region" as const, ...region }))
const municipalities: Municipality[] = data.municipalities.map((municipality) => ({
  kind: "municipality" as const,
  ...municipality,
}))

export function listMunicipalities(): Municipality[] {
  return municipalities
}

export function listRegions(): Region[] {
  return regions
}

export function getMunicipalityBySlug(slug: string): Municipality | undefined {
  return municipalities.find((municipality) => municipality.slug === slug)
}

export function getRegionBySlug(slug: string): Region | undefined {
  return regions.find((region) => region.slug === slug)
}

export function getMunicipalityById(id: string): Municipality | undefined {
  return municipalities.find((municipality) => municipality.id === id)
}

export function getRegionById(id: string): Region | undefined {
  return regions.find((region) => region.id === id)
}

export function regionOf(municipality: Municipality): Region | undefined {
  return getRegionById(municipality.regionId)
}

/**
 * Places people write in a CV that are not municipality names: the main town
 * of a municipality with another name, well-known city districts, English
 * names and abbreviations. Only names that point to exactly one municipality
 * belong here.
 */
const MUNICIPALITY_ALIASES: Record<string, string> = {
  sthlm: "Stockholm",
  gbg: "Göteborg",
  gothenburg: "Göteborg",
  kista: "Stockholm",
  bromma: "Stockholm",
  farsta: "Stockholm",
  "hägersten": "Stockholm",
  "skärholmen": "Stockholm",
  "vällingby": "Stockholm",
  "spånga": "Stockholm",
  "älvsjö": "Stockholm",
  hisingen: "Göteborg",
  angered: "Göteborg",
  "västra frölunda": "Göteborg",
  limhamn: "Malmö",
  visby: "Gotland",
  "märsta": "Sigtuna",
  "åkersberga": "Österåker",
  tumba: "Botkyrka",
  jakobsberg: "Järfälla",
  handen: "Haninge",
  "bålsta": "Håbo",
  "mölnlycke": "Härryda",
  kinna: "Mark",
  skoghall: "Hammarö",
  "arlöv": "Burlöv",
  hyltebruk: "Hylte",
  kisa: "Kinda",
  malung: "Malung-Sälen",
  sveg: "Härjedalen",
  kopparberg: "Ljusnarsberg",
}

const REGION_ALIASES: Record<string, string> = {
  "sörmland": "Södermanlands län",
  "stockholmsområdet": "Stockholms län",
  storstockholm: "Stockholms län",
  "stor stockholm": "Stockholms län",
}

const COUNTRY_WORDS = /(^|\s)(sverige|sweden)(?=\s|$)/g

/** Lowercase, hyphens and repeated spaces to single spaces, surrounding punctuation removed. */
const key = (value: string) =>
  value
    .toLowerCase()
    .replace(/[-‐‑–—_]+/g, " ")
    .replace(/[.:!?"']/g, " ")
    .replace(/\s+/g, " ")
    .trim()

/** key() without diacritics, for "Vasteras" and "Goteborg". */
const fold = (value: string) =>
  key(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")

const municipalityByKey: Record<string, Municipality> = {}
// null marks a folded name shared by two municipalities (Habo and Håbo): no guessing.
const municipalityByFold: Record<string, Municipality | null> = {}
const regionByKey: Record<string, Region> = {}
const regionByFold: Record<string, Region> = {}

municipalities.forEach((municipality) => {
  municipalityByKey[key(municipality.name)] = municipality
  const folded = fold(municipality.name)
  municipalityByFold[folded] = folded in municipalityByFold ? null : municipality
})
Object.keys(MUNICIPALITY_ALIASES).forEach((alias) => {
  const target = municipalityByKey[key(MUNICIPALITY_ALIASES[alias])]
  if (!target) return
  if (!(key(alias) in municipalityByKey)) municipalityByKey[key(alias)] = target
  if (!(fold(alias) in municipalityByFold)) municipalityByFold[fold(alias)] = target
})

regions.forEach((region) => {
  // "Västmanlands län" is also written "Västmanlands" and "Västmanland".
  const withoutLan = key(region.name).replace(/ län$/, "")
  const variants = [key(region.name), withoutLan, withoutLan.replace(/s$/, "")]
  variants.forEach((variant) => {
    regionByKey[variant] = region
    regionByFold[fold(variant)] = region
  })
})
Object.keys(REGION_ALIASES).forEach((alias) => {
  const target = regionByKey[key(REGION_ALIASES[alias])]
  if (target) regionByKey[key(alias)] = target
})

function findMunicipality(candidate: string): Municipality | null {
  // "Västerås kommun", "Göteborgs stad"
  const official = /^(.+?)(s?) (kommun|stad)$/.exec(candidate)
  const names = official ? [official[1] + official[2], official[1]] : [candidate]
  for (let i = 0; i < names.length; i++) {
    const exact = municipalityByKey[names[i]]
    if (exact) return exact
  }
  for (let i = 0; i < names.length; i++) {
    const folded = municipalityByFold[fold(names[i])]
    if (folded) return folded
  }
  return null
}

function findRegion(candidate: string): Region | null {
  const name = candidate.replace(/^region /, "")
  return regionByKey[name] || regionByFold[fold(name)] || null
}

/**
 * Turns one comma-separated part of the input into the names worth looking up.
 * A part with digits is an address or a postcode line: drop the postcode
 * ("721 30 Västerås", "Västerås 72130"), and if a street number remains the
 * place is what follows it ("Storgatan 12 Västerås").
 */
function candidatesFrom(part: string): string[] {
  const cleaned = key(part).replace(COUNTRY_WORDS, " ").replace(/\s+/g, " ").trim()
  if (!cleaned) return []
  if (!/\d/.test(cleaned)) return [cleaned]
  const withoutPostcode = cleaned.replace(/(^|\s)\d{3} ?\d{2}(?=\s|$)/g, " ").replace(/\s+/g, " ").trim()
  if (withoutPostcode && !/\d/.test(withoutPostcode)) return [withoutPostcode]
  const afterLastNumber = withoutPostcode.replace(/^.*\d\S*/, "").trim()
  return afterLastNumber ? [afterLastNumber] : []
}

/**
 * Maps what a user typed in the CV "Ort" field to a municipality or a region.
 * A municipality anywhere in the text wins over a region ("Västerås,
 * Västmanlands län" is Västerås). Deliberately conservative: only whole names
 * match, and anything unknown or ambiguous gives null rather than a guess.
 */
export function resolveLocation(freeText: string | null | undefined): JobLocation | null {
  if (typeof freeText !== "string" || freeText.length > 120) return null
  const candidates: string[] = []
  freeText.split(/[,;/|()\n\r\t]+|\s[-–—]\s/).forEach((part) => {
    candidatesFrom(part).forEach((candidate) => candidates.push(candidate))
  })

  for (let i = 0; i < candidates.length; i++) {
    const municipality = findMunicipality(candidates[i])
    if (municipality) return municipality
  }
  for (let i = 0; i < candidates.length; i++) {
    const region = findRegion(candidates[i])
    if (region) return region
  }
  return null
}
