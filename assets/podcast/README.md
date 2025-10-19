# 📻 Dossier Podcast

## 📁 Structure

```
podcast/
├── audio/              ← Tes fichiers MP3 ici
├── covers/             ← Tes pochettes (JPG/PNG) ici
├── episodes.json       ← Liste de tous tes épisodes
└── GUIDE-AJOUT-EPISODE.md  ← Guide complet pas à pas
```

## 🚀 Quick Start

Pour ajouter un nouvel épisode :

1. **Copie** ton fichier MP3 dans `audio/`
2. **Copie** ta pochette dans `covers/`
3. **Édite** `episodes.json` pour ajouter ton épisode

📖 **Consulte `GUIDE-AJOUT-EPISODE.md` pour les détails complets !**

## 📝 Exemple rapide d'ajout dans episodes.json

```json
{
  "episodes": [
    {
      "title": "Ton nouvel épisode",
      "episode": 4,
      "date": "2025-02-15",
      "guests": ["Invité 1"],
      "description": "Description courte",
      "audio": "assets/podcast/audio/ton-fichier.mp3",
      "cover": "assets/podcast/covers/ton-image.jpg"
    }
  ]
}
```

---

💡 **Tout est prêt !** Tu n'as plus qu'à ajouter tes fichiers.
