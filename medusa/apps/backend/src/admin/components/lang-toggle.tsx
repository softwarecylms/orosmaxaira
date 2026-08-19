import { Button, Text } from "@medusajs/ui"

/**
 * Small EL/EN switch shown at the top of a content editor. "el" edits the base
 * (Greek) record; "en" edits the record's `translations.en` overlay — only the
 * translatable text fields. Blank English fields fall back to the Greek text on
 * the storefront, so translating is optional per field.
 */
export function LangToggle({
  lang,
  onChange,
}: {
  lang: "el" | "en"
  onChange: (l: "el" | "en") => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
      <Text size="small" weight="plus" className="text-ui-fg-subtle">
        Γλώσσα περιεχομένου
      </Text>
      <div className="flex gap-1">
        <Button
          size="small"
          variant={lang === "el" ? "primary" : "secondary"}
          onClick={() => onChange("el")}
        >
          Ελληνικά
        </Button>
        <Button
          size="small"
          variant={lang === "en" ? "primary" : "secondary"}
          onClick={() => onChange("en")}
        >
          English
        </Button>
      </div>
      {lang === "en" ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          Κενά πεδία εμφανίζουν το ελληνικό κείμενο. Τα κοινά πεδία (τιμές, εικόνες,
          ημερομηνίες) επεξεργάζονται μόνο στα Ελληνικά.
        </Text>
      ) : null}
    </div>
  )
}
