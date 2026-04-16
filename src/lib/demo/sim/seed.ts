export type Prng = () => number;

// Stable, small, non-crypto hash for demo variability.
export function hashStringToUint32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): Prng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: Prng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

export function pickManyUnique<T>(rng: Prng, items: readonly T[], max: number): T[] {
  if (max <= 0) return [];
  if (items.length <= max) return [...items];
  const pool = [...items];
  const out: T[] = [];
  while (out.length < max && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]!);
  }
  return out;
}

export function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

