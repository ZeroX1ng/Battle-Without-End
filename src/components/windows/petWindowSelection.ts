export interface PetSelectionCandidate {
  name?: unknown
  realName?: unknown
  level?: unknown
  type?: unknown
  mc_name?: unknown
  save?: () => unknown
}

function toKeyPart(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

export function getPetSelectionKey(pet: PetSelectionCandidate | null | undefined): string | null {
  if (!pet) return null

  if (typeof pet.save === 'function') {
    try {
      const saved = pet.save()
      if (typeof saved === 'string' && saved.length > 0) {
        return `save:${saved}`
      }
    } catch {
      // Some light test doubles or partially loaded pets may not support save().
    }
  }

  const parts = [pet.name, pet.realName, pet.level, pet.type, pet.mc_name]
    .map(toKeyPart)
    .filter((part): part is string => Boolean(part))
  return parts.length ? `pet:${parts.join('|')}` : null
}

export function resolveSelectedPet<T extends PetSelectionCandidate>(
  petList: readonly T[],
  activePet: T | null | undefined,
  selectedPetKey: string | null,
): T | null {
  const fallback = petList[0] ?? activePet ?? null
  if (!selectedPetKey) return fallback

  const listMatch = petList.find(pet => getPetSelectionKey(pet) === selectedPetKey)
  if (listMatch) return listMatch

  if (activePet && getPetSelectionKey(activePet) === selectedPetKey) {
    return activePet
  }

  return fallback
}
