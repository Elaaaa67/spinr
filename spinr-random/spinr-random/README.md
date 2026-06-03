# Spinr — Version sans IA 🎲

Sélectionne aléatoirement le prochain vinyle à écouter depuis ta collection Discogs.
Zéro IA, zéro clé API externe — juste du JavaScript pur.

## Installation

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173

## Configuration

Au premier lancement, entre :
- Ton **pseudo Discogs**
- Ton **token personnel** → génère-le sur https://www.discogs.com/settings/developers

## Comment fonctionne la sélection aléatoire

Ce n'est pas du hasard pur — c'est un hasard **intelligent** :

1. **Filtre par genres** — si tu choisis "Jazz" et "Soul", seuls ces vinyles sont candidats
2. **Filtre par énergie** — les genres calmes (ambient, jazz, folk) sont favorisés si tu veux quelque chose de doux, les genres énergiques (punk, metal, électro) si tu veux de l'intensité
3. **Évite les répétitions** — les 5 derniers vinyles tirés sont exclus
4. **Pondère par note Discogs** — tes vinyles mieux notés ont statistiquement plus de chances d'être tirés

## Structure

```
src/
├── lib/selection.js      ← toute la logique de sélection (aucune IA)
├── hooks/useDiscogs.js   ← fetch + cache collection Discogs
├── components/
│   ├── Setup.jsx         ← écran de connexion
│   ├── MoodPicker.jsx    ← sidebar filtres
│   ├── Library.jsx       ← grille de vinyles
│   └── ResultCard.jsx    ← carte résultat
└── App.jsx
```
