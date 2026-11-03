// Le prix est TOUJOURS calcule par le serveur, jamais lu dans la requete du client.
export function computePriceCents(hourlyRateCents: number, startsAt: Date, endsAt: Date): number {
  const ms = endsAt.getTime() - startsAt.getTime();
  if (!Number.isFinite(ms) || ms <= 0) throw new Error("Creneau invalide");
  const hours = Math.ceil(ms / 3_600_000);
  return hourlyRateCents * hours;
}
