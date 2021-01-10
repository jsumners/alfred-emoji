export const NUM_SKIN_TONES = 5

export function getRandomSkinTone () {
  return Math.round(Math.random() * (NUM_SKIN_TONES - 1))
}
