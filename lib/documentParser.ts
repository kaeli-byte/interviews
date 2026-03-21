/**
 * Validates extracted document text for minimum content quality
 * Returns true if text appears to contain meaningful content
 */
export function isValidExtractedText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false
  }

  // Remove whitespace and check minimum length
  const cleaned = text.replace(/[\s\n\r]+/g, '')
  if (cleaned.length < 20) {
    return false
  }

  // Check if mostly gibberish (high special char ratio)
  const specialCharRatio = (cleaned.match(/[^a-zA-Z0-9]/g) || []).length / cleaned.length
  if (specialCharRatio > 0.5) {
    return false
  }

  return true
}

/**
 * Checks if text is empty or nonsense (image-only PDF, corrupted file, etc.)
 */
export function isEmptyOrNonsense(text: string): boolean {
  return !isValidExtractedText(text)
}

export const EMPTY_TEXT_THRESHOLD = 20 // minimum meaningful characters
