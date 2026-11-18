/**
 * Who runs the site. Rendered on /integritetspolicy as the data controller.
 *
 * The empty fields must be filled in by the owner with the registered details
 * (as they appear at Bolagsverket) before the policy is relied on. They are
 * left empty rather than guessed: the address on /kontakt is template data.
 * Pages render only the fields that are set.
 */
export interface Company {
  /** Brand name, always shown. */
  name: string
  /** Registered company name, e.g. "Exempel AB". */
  legalName: string
  /** Organisationsnummer, e.g. "556000-0000". */
  orgNumber: string
  /** Postal address on one line, e.g. "Gatan 1, 123 45 Staden". */
  address: string
  supportEmail: string
}

export const company: Company = {
  name: "CVfixaren.se",
  legalName: "",
  orgNumber: "",
  address: "",
  supportEmail: "support@cvfixaren.se",
}
