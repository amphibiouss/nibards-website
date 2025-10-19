# 📻 Guide Simple - Ajouter un Épisode de Podcast

## 🎯 En bref : 3 étapes simples

1. **Dépose ton fichier MP3** dans `assets/podcast/audio/`
2. **Dépose ta pochette JPG** dans `assets/podcast/covers/`
3. **Ajoute une entrée** dans `assets/podcast/episodes.json`

---

## 📁 Structure des dossiers

```
nibards/
└── assets/
    └── podcast/
        ├── audio/          ← Tes fichiers MP3 ici
        ├── covers/         ← Tes pochettes (JPG/PNG) ici
        └── episodes.json   ← La liste de tes épisodes
```

---

## 📝 Nomenclature des fichiers

### Option 1 : Nomenclature libre ✅ **RECOMMANDÉE**

Tu peux nommer tes fichiers **comme tu veux** ! Exemple :

```
audio/
├── mon-super-episode.mp3
├── discussion-avec-marie.mp3
└── nibards-renaissance.mp3

covers/
├── mon-super-episode.jpg
├── discussion-avec-marie.jpg
└── nibards-renaissance.png
```

**Important** : Assure-toi juste que le nom du fichier audio et de la pochette correspondent dans le JSON.

### Option 2 : Nomenclature numérotée

Si tu préfères t'organiser par numéro d'épisode :

```
audio/
├── episode-01.mp3
├── episode-02.mp3
└── episode-03.mp3

covers/
├── episode-01.jpg
├── episode-02.jpg
└── episode-03.jpg
```

---

## 🎬 Exemple concret pas à pas

### Scénario : Tu veux ajouter ton 4ème épisode

#### **Étape 1 : Prépare tes fichiers**

- Ton fichier audio : `mon-episode-4.mp3`
- Ta pochette : `pochette-episode-4.jpg` (carré, minimum 1000x1000px)

#### **Étape 2 : Dépose-les dans les bons dossiers**

```bash
# Copie ton MP3
assets/podcast/audio/mon-episode-4.mp3

# Copie ta pochette
assets/podcast/covers/pochette-episode-4.jpg
```

#### **Étape 3 : Édite le fichier `episodes.json`**

Ouvre `assets/podcast/episodes.json` et ajoute ton épisode **au début** de la liste :

```json
{
  "episodes": [
    {
      "title": "Les Nibards dans le Surréalisme",
      "episode": 4,
      "date": "2025-02-05",
      "guests": ["Salvador Dalí Jr", "André Breton"],
      "description": "Une exploration surréaliste des formes mammaires dans l'art du 20ème siècle.",
      "audio": "assets/podcast/audio/mon-episode-4.mp3",
      "cover": "assets/podcast/covers/pochette-episode-4.jpg"
    },
    {
      "title": "Symbolisme et Modernité",
      "episode": 3,
      "date": "2025-01-29",
      "guests": ["Claire Moderne"],
      "description": "Comment les nibards sont devenus des symboles de liberté...",
      "audio": "assets/podcast/audio/episode-03.mp3",
      "cover": "assets/podcast/covers/episode-03.jpg"
    }
    // ... autres épisodes
  ]
}
```

**⚠️ ATTENTION** : 
- N'oublie pas la **virgule** après l'accolade `}` de ton nouvel épisode
- Mets toujours le **plus récent en premier**

---

## 📋 Détails des champs JSON

| Champ | Obligatoire | Format | Exemple |
|-------|-------------|--------|---------|
| `title` | ✅ Oui | Texte libre | `"Les Nibards Baroques"` |
| `episode` | ✅ Oui | Nombre | `4` |
| `date` | ✅ Oui | AAAA-MM-JJ | `"2025-02-15"` |
| `guests` | ⚠️ Optionnel | Liste | `["Marie", "Jean"]` ou `[]` |
| `description` | ⚠️ Optionnel | Texte | `"Une exploration..."` |
| `audio` | ✅ Oui | Chemin | `"assets/podcast/audio/fichier.mp3"` |
| `cover` | ✅ Oui | Chemin | `"assets/podcast/covers/image.jpg"` |

---

## ✅ Checklist avant de publier

- [ ] Mon fichier MP3 est dans `assets/podcast/audio/`
- [ ] Ma pochette est dans `assets/podcast/covers/` (format carré)
- [ ] J'ai ajouté l'entrée dans `episodes.json`
- [ ] J'ai vérifié qu'il n'y a **pas d'erreur de syntaxe** dans le JSON
- [ ] Les chemins `audio` et `cover` correspondent exactement aux noms de fichiers
- [ ] La date est au format `YYYY-MM-DD`
- [ ] J'ai testé sur le site local

---

## 🛠️ Outils utiles

### Vérifier la syntaxe JSON
Copie le contenu de ton `episodes.json` et colle-le sur https://jsonlint.com/

### Format de pochette recommandé
- **Taille** : 1400x1400px (ou 3000x3000px pour la meilleure qualité)
- **Format** : JPG (pour la taille) ou PNG (pour la qualité)
- **Poids** : < 500KB pour un chargement rapide

---

## 🚨 Erreurs courantes

### ❌ L'épisode n'apparaît pas
- Vérifie que le fichier `episodes.json` est valide (pas de virgule manquante)
- Vérifie que les chemins sont corrects (avec le bon nom de fichier)

### ❌ La pochette ne s'affiche pas
- Vérifie que le nom du fichier correspond **exactement** (majuscules/minuscules)
- Vérifie que l'extension est correcte (`.jpg` pas `.jpeg`)

### ❌ L'audio ne se lance pas
- Vérifie que le fichier est bien un MP3
- Vérifie le chemin dans le JSON

---

## 💡 Exemple de flux de travail hebdomadaire

**Chaque semaine :**

1. Exporte ton épisode en MP3 : `episode-S01E04.mp3`
2. Crée/exporte ta pochette : `episode-S01E04.jpg`
3. Copie les deux fichiers dans les dossiers appropriés
4. Ouvre `episodes.json`
5. Copie l'épisode précédent, modifie les infos, colle en premier
6. Sauvegarde
7. Rafraîchis ton navigateur → C'est en ligne ! 🎉

---

**🎯 Tu n'as besoin de toucher à RIEN d'autre ! Juste ces 3 fichiers chaque semaine.**

