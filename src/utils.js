const NUM_SKIN_TONES = 5

module.exports = {
  NUM_SKIN_TONES,
  getRandomSkinTone () {
    return Math.round(Math.random() * (NUM_SKIN_TONES - 1))
  }
}
