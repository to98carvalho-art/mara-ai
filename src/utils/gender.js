/**
 * Detects the grammatical gender of a Portuguese first name.
 * Returns 'f' for feminine, 'm' for masculine.
 *
 * Rules (by priority):
 *  1. Known feminine names that DON'T end in 'a'/'ã'
 *  2. Names ending in 'a' or 'ã' → feminine
 *  3. Everything else → masculine
 */

// Feminine names that don't follow the -a/-ã rule
const FEMININE_EXCEPTIONS = new Set([
  'beatriz', 'inês', 'ines', 'isabel', 'raquel', 'rachel', 'esther', 'ester',
  'ruth', 'noemi', 'miriam', 'mirian', 'débora', 'debora', 'deborah',
  'alice', 'clarice', 'denise', 'elise', 'heloíse', 'heloise', 'louise',
  'luise', 'sueli', 'suely', 'carmel', 'luz', 'flor', 'cris', 'iris', 'íris',
  'dolores', 'mercedes', 'lourdes', 'nieves', 'ágnes', 'agnes', 'ingrid',
  'astrid', 'sigrid', 'hildegard', 'hildegarde', 'ester', 'esther',
  'gisell', 'gisele', 'giselle', 'noelle', 'michelle', 'isabelle',
  'elle', 'adele', 'adèle', 'danielle', 'gabrielle', 'rachelle',
  'naomi', 'salomé', 'salome', 'renée', 'renee', 'aimée', 'aimee',
  'chloe', 'chloé', 'zoé', 'zoe', 'noel', // noel pode ser masc mas inclui por segurança
])

// Strip diacritics for simpler comparison
function stripAccents(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function getGender(name) {
  if (!name || !name.trim()) return 'm'
  // Use only the first name
  const first = name.trim().split(/\s+/)[0].toLowerCase()
  if (FEMININE_EXCEPTIONS.has(first)) return 'f'
  const stripped = stripAccents(first)
  if (stripped.endsWith('a') || first.endsWith('ã')) return 'f'
  return 'm'
}

/** "o" / "a" */
export function art(name) {
  return getGender(name) === 'f' ? 'a' : 'o'
}

/** "do" / "da" */
export function dArt(name) {
  return getGender(name) === 'f' ? 'da' : 'do'
}

/** "ao" / "à" */
export function aArt(name) {
  return getGender(name) === 'f' ? 'à' : 'ao'
}

/** "pelo" / "pela" */
export function peloArt(name) {
  return getGender(name) === 'f' ? 'pela' : 'pelo'
}

/** "parceiro" / "parceira" */
export function parceiro(name) {
  return getGender(name) === 'f' ? 'parceira' : 'parceiro'
}

/** "outro" / "outra" */
export function outro(name) {
  return getGender(name) === 'f' ? 'outra' : 'outro'
}
