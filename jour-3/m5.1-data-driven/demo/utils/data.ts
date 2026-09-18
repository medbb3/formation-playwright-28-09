import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

export type Produit = { nom: string; prix: number };

/** Charge data/produits.csv (séparateur ;, prix avec virgule) en objets typés et validés. */
export function chargerProduits(): Produit[] {
  const brut = fs.readFileSync(path.join(__dirname, '../data/produits.csv'), 'utf-8');
  const lignes = parse(brut, { columns: true, delimiter: ';', trim: true, bom: true, skip_empty_lines: true }) as Record<string, string>[];
  return lignes.map((l) => {
    const prix = Number(l.prix.replace(',', '.'));
    if (!l.nom || Number.isNaN(prix)) throw new Error(`Ligne CSV invalide : ${JSON.stringify(l)}`);
    return { nom: l.nom, prix };
  });
}
