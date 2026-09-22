export type CategoryAttributeSchema = {
  key: string
  label: string
  fieldType: string
  unit: string | null
}

export type UnmatchedAttribute = {
  key: string
  label: string
  value: unknown
}

export type AttributeMigrationPlan = {
  matchedKeys: string[]
  missingAttributes: CategoryAttributeSchema[]
  unmatchedAttributes: UnmatchedAttribute[]
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== ''
}

export function computeAttributeMigration(
  oldSchema: CategoryAttributeSchema[],
  newSchema: CategoryAttributeSchema[],
  variantAttributes: Record<string, unknown> | null
): AttributeMigrationPlan {
  const oldKeys = new Set(oldSchema.map((a) => a.key))
  const newKeys = new Set(newSchema.map((a) => a.key))
  const attrs = variantAttributes ?? {}

  const matchedKeys = newSchema
    .filter((a) => oldKeys.has(a.key))
    .map((a) => a.key)

  const missingAttributes = newSchema.filter((a) => !oldKeys.has(a.key))

  const unmatchedAttributes = oldSchema
    .filter((a) => !newKeys.has(a.key) && hasValue(attrs[a.key]))
    .map((a) => ({ key: a.key, label: a.label, value: attrs[a.key] }))

  return { matchedKeys, missingAttributes, unmatchedAttributes }
}