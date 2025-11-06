import express from 'express';
import { Attack, Pokemon, Trainer, randomChallenge, arena1, deterministicChallenge, arena2 } from './models';

const app = express();
app.use(express.json());

// Base de données en mémoire
const attacks: Attack[] = [];
const pokemons: Pokemon[] = [];
const trainers: Trainer[] = [];

// ==================== ROUTES ATTACKS ====================
app.post('/api/attacks', (req, res) => {
  const { name, damage, usageLimit } = req.body;
  if (!name || !damage || !usageLimit) return res.status(400).json({ error: 'Données manquantes' });
  
  const attack = new Attack(name, damage, usageLimit);
  attacks.push(attack);
  res.status(201).json({ id: attacks.length - 1, name, damage, usageLimit });
});

app.get('/api/attacks', (req, res) => {
  res.json(attacks.map((a, i) => ({ id: i, ...a })));
});

// ==================== ROUTES POKEMONS ====================
app.post('/api/pokemons', (req, res) => {
  const { name, lifePoint } = req.body;
  if (!name || !lifePoint) return res.status(400).json({ error: 'Données manquantes' });
  
  const pokemon = new Pokemon(name, lifePoint);
  pokemons.push(pokemon);
  res.status(201).json({ id: pokemons.length - 1, name, lifePoint });
});

app.get('/api/pokemons', (req, res) => {
  res.json(pokemons.map((p, i) => ({ 
    id: i, 
    name: p.name, 
    lifePoint: p.lifePoint,
    attacks: p.getAttacks().map(a => a.getInfo())
  })));
});

app.post('/api/pokemons/:id/learn', (req, res) => {
  const { attackId } = req.body;
  const pokemon = pokemons[parseInt(req.params.id)];
  const attack = attacks[attackId];
  
  if (!pokemon || !attack) return res.status(404).json({ error: 'Introuvable' });
  
  try {
    pokemon.learnAttack(attack);
    res.json({ message: `${pokemon.name} apprend ${attack.name}!` });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/pokemons/:id/heal', (req, res) => {
  const pokemon = pokemons[parseInt(req.params.id)];
  if (!pokemon) return res.status(404).json({ error: 'Pokémon introuvable' });
  
  pokemon.heal();
  res.json({ message: `${pokemon.name} est soigné!`, lifePoint: pokemon.lifePoint });
});

// ==================== ROUTES TRAINERS ====================
app.post('/api/trainers', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom requis' });
  
  const trainer = new Trainer(name);
  trainers.push(trainer);
  res.status(201).json({ id: trainers.length - 1, name, level: 1, experience: 0 });
});

app.get('/api/trainers', (req, res) => {
  res.json(trainers.map((t, i) => ({ 
    id: i, 
    name: t.name, 
    level: t.level, 
    experience: t.experience,
    pokemons: t.getPokemons().map(p => p.name)
  })));
});

app.post('/api/trainers/:id/add-pokemon', (req, res) => {
  const { pokemonId } = req.body;
  const trainer = trainers[parseInt(req.params.id)];
  const pokemon = pokemons[pokemonId];
  
  if (!trainer || !pokemon) return res.status(404).json({ error: 'Introuvable' });
  
  trainer.addPokemon(pokemon);
  res.json({ message: `${pokemon.name} rejoint ${trainer.name}!` });
});

app.post('/api/trainers/:id/heal-all', (req, res) => {
  const trainer = trainers[parseInt(req.params.id)];
  if (!trainer) return res.status(404).json({ error: 'Dresseur introuvable' });
  
  trainer.healAllPokemonsAtTavern();
  res.json({ message: `Tous les Pokémon de ${trainer.name} sont soignés!` });
});

// ==================== ROUTES BATTLES ====================
app.post('/api/battles/random', (req, res) => {
  const { trainer1Id, trainer2Id } = req.body;
  const t1 = trainers[trainer1Id];
  const t2 = trainers[trainer2Id];
  
  if (!t1 || !t2) return res.status(404).json({ error: 'Dresseur introuvable' });
  
  try {
    const result = randomChallenge(t1, t2);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/battles/arena1', (req, res) => {
  const { trainer1Id, trainer2Id } = req.body;
  const t1 = trainers[trainer1Id];
  const t2 = trainers[trainer2Id];
  
  if (!t1 || !t2) return res.status(404).json({ error: 'Dresseur introuvable' });
  
  const result = arena1(t1, t2);
  res.json(result);
});

app.post('/api/battles/deterministic', (req, res) => {
  const { trainer1Id, trainer2Id } = req.body;
  const t1 = trainers[trainer1Id];
  const t2 = trainers[trainer2Id];
  
  if (!t1 || !t2) return res.status(404).json({ error: 'Dresseur introuvable' });
  
  try {
    const result = deterministicChallenge(t1, t2);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/battles/arena2', (req, res) => {
  const { trainer1Id, trainer2Id } = req.body;
  const t1 = trainers[trainer1Id];
  const t2 = trainers[trainer2Id];
  
  if (!t1 || !t2) return res.status(404).json({ error: 'Dresseur introuvable' });
  
  const result = arena2(t1, t2);
  res.json(result);
});

// ==================== SERVER ====================
app.get('/', (req, res) => {
  res.json({ message: 'API Pokémon 🔥', endpoints: [
    'POST /api/attacks',
    'POST /api/pokemons',
    'POST /api/pokemons/:id/learn',
    'POST /api/trainers',
    'POST /api/trainers/:id/add-pokemon',
    'POST /api/battles/random',
    'POST /api/battles/arena1',
    'POST /api/battles/deterministic',
    'POST /api/battles/arena2'
  ]});
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
});

