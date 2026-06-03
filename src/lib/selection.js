/**
 * Sélection aléatoire d'un vinyle selon l'humeur.
 * Zéro IA, zéro API externe — du JavaScript pur.
 *
 * Logique :
 * 1. Filtre par genres si sélectionnés
 * 2. Filtre par énergie (tempo approximatif selon genre/style)
 * 3. Exclut les vinyles récemment écoutés
 * 4. Pondère par note Discogs (les mieux notés ont plus de chances)
 * 5. Pioche au hasard dans ce pool pondéré
 */

// Genres "énergiques" — pour le filtre énergie
const HIGH_ENERGY = ['punk', 'metal', 'hard rock', 'dance', 'techno', 'drum & bass', 'hardcore', 'electro']
const LOW_ENERGY  = ['ambient', 'classical', 'jazz', 'folk', 'acoustic', 'blues', 'bossa nova', 'new age']

// Messages selon le contexte — pour la raison affichée
const REASONS = {
  calme: [
    "Ce soir tu veux prendre le temps — ce disque est fait pour ça.",
    "Pose l'aiguille, ferme les yeux. Ce vinyle méritait ce moment.",
    "Parfait pour une soirée qui respire.",
    "Laisse ce disque remplir la pièce doucement.",
  ],
  festif: [
    "La soirée commence vraiment là.",
    "Ce disque va faire bouger les meubles.",
    "Remonte le volume. Sérieusement.",
    "Ce soir ce vinyle s'imposait.",
  ],
  diner: [
    "La bonne bande-son pour une belle table.",
    "Ce disque transforme un dîner en souvenir.",
    "Fond sonore parfait — assez présent, jamais envahissant.",
  ],
  neutre: [
    "Le hasard a bien fait les choses.",
    "Parfois la collection sait mieux que toi.",
    "Ce vinyle attendait son tour depuis trop longtemps.",
    "Une bonne pioche — fais confiance au tirage.",
    "Ce soir c'est lui. Pas de négociation.",
  ]
}

function getReason(mood) {
  let pool
  if (mood.energy < 30 || mood.vibe <= 10) pool = REASONS.calme
  else if (mood.vibe >= 80) pool = REASONS.festif
  else if (mood.vibe >= 50 && mood.vibe < 80) pool = REASONS.diner
  else pool = REASONS.neutre

  // Si texte libre, personnalise légèrement
  if (mood.freeText && mood.freeText.trim().length > 3) {
    return `"${mood.freeText.trim()}" — ${pool[Math.floor(Math.random() * pool.length)].toLowerCase()}`
  }

  return pool[Math.floor(Math.random() * pool.length)]
}

export function selectVinyl(collection, mood) {
  if (!collection || collection.length === 0) {
    throw new Error('La collection est vide')
  }

  let pool = [...collection]

  // 1. FILTRE PAR GENRES sélectionnés
  if (mood.genres && mood.genres.length > 0) {
    const genresLower = mood.genres.map(g => g.toLowerCase())
    const filtered = pool.filter(v => {
      const vGenres = [...(v.genres || []), ...(v.styles || [])].map(g => g.toLowerCase())
      return vGenres.some(g => genresLower.some(mg => g.includes(mg) || mg.includes(g)))
    })
    // Garde le filtre seulement si on a des résultats
    if (filtered.length > 0) pool = filtered
  }

  // 2. FILTRE PAR ÉNERGIE (souple — réduit les chances plutôt qu'éliminer)
  if (mood.energy !== undefined) {
    const vGenres = v => [...(v.genres || []), ...(v.styles || [])].map(g => g.toLowerCase())
    if (mood.energy < 30) {
      // Préfère les genres calmes — duplique-les pour augmenter leur probabilité
      const calmes = pool.filter(v => vGenres(v).some(g => LOW_ENERGY.some(le => g.includes(le))))
      if (calmes.length >= 3) pool = [...calmes, ...calmes, ...pool] // 3x plus de chances
    } else if (mood.energy > 70) {
      const energiques = pool.filter(v => vGenres(v).some(g => HIGH_ENERGY.some(he => g.includes(he))))
      if (energiques.length >= 3) pool = [...energiques, ...energiques, ...pool]
    }
  }

  // 3. EXCLUT L'HISTORIQUE RÉCENT (5 derniers)
  const history = new Set((mood.history || []).slice(0, 5))
  const withoutHistory = pool.filter(v => !history.has(v.id))
  if (withoutHistory.length > 0) pool = withoutHistory

  // 4. PONDÈRE PAR NOTE DISCOGS
  // Note 5 → 5 tickets, note 4 → 4 tickets, note 0 → 2 tickets (neutre)
  const weighted = pool.flatMap(v => {
    const weight = v.rating > 0 ? v.rating : 2
    return Array(weight).fill(v)
  })

  // 5. PIOCHE ALÉATOIRE
  const vinyl = weighted[Math.floor(Math.random() * weighted.length)]

  return {
    vinyl,
    reason: getReason(mood),
    source: 'random',
  }
}
