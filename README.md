# API Pokémon - Simple & Minimaliste

API REST en Express + TypeScript avec POO. Stockage en mémoire (pas de BDD).

## 🎯 Fonctionnalités

**Pokémon** : PV, max 4 attaques, apprendre/soigner/attaquer  
**Attaques** : dégâts, limite d'usage, compteur  
**Dresseurs** : niveau/XP, équipe de Pokémon, taverne  
**Combats** : Défi aléatoire, Arène 1, Défi déterministe, Arène 2

## 🚀 Démarrage rapide

```bash
npm install
npm run dev
```

API sur http://localhost:3000

## 📚 Utilisation

```bash
# 1. Créer attaques
curl -X POST http://localhost:3000/api/attacks \
  -H "Content-Type: application/json" \
  -d '{"name":"Lance-Flammes","damage":50,"usageLimit":10}'

# 2. Créer dresseurs
curl -X POST http://localhost:3000/api/trainers \
  -H "Content-Type: application/json" \
  -d '{"name":"Sacha"}'

# 3. Créer Pokémon
curl -X POST http://localhost:3000/api/pokemons \
  -H "Content-Type: application/json" \
  -d '{"name":"Dracaufeu","lifePoint":150}'

# 4. Assigner Pokémon
curl -X POST http://localhost:3000/api/trainers/0/add-pokemon \
  -H "Content-Type: application/json" \
  -d '{"pokemonId":0}'

# 5. Apprendre attaque
curl -X POST http://localhost:3000/api/pokemons/0/learn \
  -H "Content-Type: application/json" \
  -d '{"attackId":0}'

# 6. Combattre !
curl -X POST http://localhost:3000/api/battles/random \
  -H "Content-Type: application/json" \
  -d '{"trainer1Id":0,"trainer2Id":1}'
```

## 📁 Structure

```
src/
├── models.ts   # Classes POO + Logique combat
└── server.ts   # API Express
```

## 🎮 Endpoints

- `POST /api/attacks` - Créer attaque
- `POST /api/pokemons` - Créer Pokémon
- `POST /api/pokemons/:id/learn` - Apprendre attaque
- `POST /api/trainers` - Créer dresseur
- `POST /api/trainers/:id/add-pokemon` - Ajouter Pokémon
- `POST /api/battles/random` - Défi aléatoire
- `POST /api/battles/arena1` - Arène 1 (100 combats)
- `POST /api/battles/deterministic` - Défi déterministe
- `POST /api/battles/arena2` - Arène 2 (100 combats)

