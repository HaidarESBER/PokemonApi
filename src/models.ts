// ==================== CLASSES POO ====================

export class Attack {
  constructor(
    public name: string,
    public damage: number,
    public usageLimit: number,
    private usageCount: number = 0
  ) {}

  canUse(): boolean {
    return this.usageCount < this.usageLimit;
  }

  use(): void {
    if (!this.canUse()) throw new Error(`${this.name} a atteint sa limite`);
    this.usageCount++;
  }

  reset(): void {
    this.usageCount = 0;
  }

  getInfo(): string {
    return `${this.name} | Dégâts: ${this.damage} | Usage: ${this.usageCount}/${this.usageLimit}`;
  }
}

export class Pokemon {
  private attacks: Attack[] = [];

  constructor(
    public name: string,
    public lifePoint: number,
    private maxLifePoint: number = lifePoint
  ) {}

  isAlive(): boolean {
    return this.lifePoint > 0;
  }

  learnAttack(attack: Attack): void {
    if (this.attacks.length >= 4) throw new Error("Max 4 attaques");
    if (this.attacks.some(a => a.name === attack.name)) throw new Error("Attaque déjà connue");
    this.attacks.push(attack);
  }

  heal(): void {
    this.lifePoint = this.maxLifePoint;
    this.attacks.forEach(a => a.reset());
  }

  takeDamage(damage: number): void {
    this.lifePoint = Math.max(0, this.lifePoint - damage);
  }

  attackPokemon(target: Pokemon): string {
    const usable = this.attacks.filter(a => a.canUse());
    if (usable.length === 0) return `${this.name} n'a plus d'attaques!`;

    const attack = usable[Math.floor(Math.random() * usable.length)];
    attack.use();
    target.takeDamage(attack.damage);
    return `${this.name} utilise ${attack.name} → ${attack.damage} dégâts! (${target.name}: ${target.lifePoint} PV)`;
  }

  getAttacks(): Attack[] {
    return this.attacks;
  }
}

export class Trainer {
  public level: number = 1;
  public experience: number = 0;
  private pokemons: Pokemon[] = [];

  constructor(public name: string) {}

  addPokemon(pokemon: Pokemon): void {
    this.pokemons.push(pokemon);
  }

  healAllPokemonsAtTavern(): void {
    this.pokemons.forEach(p => p.heal());
  }

  gainExperience(amount: number): void {
    this.experience += amount;
    while (this.experience >= 10) {
      this.level++;
      this.experience -= 10;
    }
  }

  hasAlivePokemon(): boolean {
    return this.pokemons.some(p => p.isAlive());
  }

  getRandomAlivePokemon(): Pokemon | null {
    const alive = this.pokemons.filter(p => p.isAlive());
    return alive.length > 0 ? alive[Math.floor(Math.random() * alive.length)] : null;
  }

  getPokemonWithMostHP(): Pokemon | null {
    const alive = this.pokemons.filter(p => p.isAlive());
    return alive.length > 0 ? alive.reduce((max, p) => p.lifePoint > max.lifePoint ? p : max) : null;
  }

  getPokemons(): Pokemon[] {
    return this.pokemons;
  }
}

// ==================== SYSTÈME DE COMBAT ====================

function pokemonBattle(p1: Pokemon, p2: Pokemon): { winner: Pokemon; log: string[] } {
  const log: string[] = [`Combat: ${p1.name} (${p1.lifePoint} PV) vs ${p2.name} (${p2.lifePoint} PV)`];
  let attacker = p1, defender = p2;

  while (p1.isAlive() && p2.isAlive()) {
    log.push(attacker.attackPokemon(defender));
    if (!defender.isAlive()) {
      log.push(`${defender.name} est K.O.!`);
      break;
    }
    [attacker, defender] = [defender, attacker];
  }

  return { winner: p1.isAlive() ? p1 : p2, log };
}

export function randomChallenge(t1: Trainer, t2: Trainer) {
  const log: string[] = [`=== DÉFI ALÉATOIRE: ${t1.name} vs ${t2.name} ===`];
  t1.healAllPokemonsAtTavern();
  t2.healAllPokemonsAtTavern();

  const p1 = t1.getRandomAlivePokemon();
  const p2 = t2.getRandomAlivePokemon();
  if (!p1 || !p2) throw new Error("Pas de Pokémon disponible");

  const battle = pokemonBattle(p1, p2);
  log.push(...battle.log);

  const winner = battle.winner === p1 ? t1 : t2;
  winner.gainExperience(1);
  log.push(`${winner.name} gagne!`);

  return { winner: winner.name, log, level: winner.level, exp: winner.experience };
}

export function arena1(t1: Trainer, t2: Trainer) {
  const log: string[] = [`=== ARÈNE 1: 100 combats aléatoires ===`];

  for (let i = 0; i < 100; i++) {
    t1.healAllPokemonsAtTavern();
    t2.healAllPokemonsAtTavern();
    const p1 = t1.getRandomAlivePokemon();
    const p2 = t2.getRandomAlivePokemon();
    if (!p1 || !p2) continue;

    const battle = pokemonBattle(p1, p2);
    const winner = battle.winner === p1 ? t1 : t2;
    winner.gainExperience(1);
  }

  const winner = t1.level > t2.level || (t1.level === t2.level && t1.experience >= t2.experience) ? t1 : t2;
  log.push(`${t1.name}: Niv ${t1.level}, XP ${t1.experience}`);
  log.push(`${t2.name}: Niv ${t2.level}, XP ${t2.experience}`);
  log.push(`${winner.name} gagne l'Arène 1!`);

  return { winner: winner.name, log, level: winner.level, exp: winner.experience };
}

export function deterministicChallenge(t1: Trainer, t2: Trainer) {
  const log: string[] = [`=== DÉFI DÉTERMINISTE: ${t1.name} vs ${t2.name} ===`];

  const p1 = t1.getPokemonWithMostHP();
  const p2 = t2.getPokemonWithMostHP();
  if (!p1 || !p2) throw new Error("Pas de Pokémon disponible");

  log.push(`${t1.name} choisit ${p1.name} (${p1.lifePoint} PV)`);
  log.push(`${t2.name} choisit ${p2.name} (${p2.lifePoint} PV)`);

  const battle = pokemonBattle(p1, p2);
  log.push(...battle.log);

  const winner = battle.winner === p1 ? t1 : t2;
  winner.gainExperience(1);
  log.push(`${winner.name} gagne!`);

  return { winner: winner.name, log, level: winner.level, exp: winner.experience };
}

export function arena2(t1: Trainer, t2: Trainer) {
  const log: string[] = [`=== ARÈNE 2: 100 combats déterministes ===`];

  for (let i = 0; i < 100; i++) {
    const p1 = t1.getPokemonWithMostHP();
    const p2 = t2.getPokemonWithMostHP();

    if (!p1 || !p2) {
      const winner = p1 ? t1 : t2;
      log.push(`${winner.name} gagne (adversaire sans Pokémon)!`);
      return { winner: winner.name, log, level: winner.level, exp: winner.experience };
    }

    const battle = pokemonBattle(p1, p2);
    const winner = battle.winner === p1 ? t1 : t2;
    winner.gainExperience(1);
  }

  const winner = t1.level > t2.level || (t1.level === t2.level && t1.experience >= t2.experience) ? t1 : t2;
  log.push(`${t1.name}: Niv ${t1.level}, XP ${t1.experience}`);
  log.push(`${t2.name}: Niv ${t2.level}, XP ${t2.experience}`);
  log.push(`${winner.name} gagne l'Arène 2!`);

  return { winner: winner.name, log, level: winner.level, exp: winner.experience };
}

