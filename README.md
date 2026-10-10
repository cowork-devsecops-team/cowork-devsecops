# CoWork : pipeline DevSecOps augmentée par IA

Plateforme de réservation de salles et de postes de coworking, développée comme **support de démonstration d'une pipeline DevSecOps** dans l'écosystème JavaScript (Express.js).

> Le livrable principal est la **pipeline** : l'application sert à démontrer ce qu'elle détecte et bloque.

## Principe

L'utilisateur consulte les disponibilités, réserve un créneau, paie par carte en **bac à sable** et reçoit un **QR code** valable uniquement sur son créneau. Le gestionnaire gère les espaces.

Fonctionnalités (périmètre figé) :

- Inscription et authentification
- Consultation des disponibilités
- Réservation d'un créneau
- Paiement sandbox (aucune donnée bancaire réelle)
- Génération et vérification du QR code
- Historique des réservations
- Gestion des espaces par le gestionnaire

Deux rôles seulement : utilisateur et gestionnaire/administrateur.

## Stack technique

| Composant   | Choix                                                                 |
|-------------|-----------------------------------------------------------------------|
| Web         | React (Vite)                                                          |
| Mobile      | React Native (Expo), 3 écrans : connexion, mes réservations, QR       |
| API         | Node.js + Express, documentation OpenAPI                              |
| Base        | PostgreSQL                                                            |
| Paiement    | Stripe en mode test (PaymentIntent + webhook signé) ou paiement simulé |
| Blockchain  | Hardhat (réseau local) + contrat Solidity `AuditAnchor`, Sepolia en option |
| Cloud       | Docker + Terraform (Azure for Students ou AWS), plan B Docker Compose |
| Pipeline    | GitHub Actions                                                        |
| Monitoring  | Pino, Loki, Prometheus, Grafana                                       |
| IA          | Triage et correctifs dans la pipeline, détection d'usages anormaux dans l'app |

## Architecture du dépôt

```
cowork-devsecops/
├── backend/             # API Express, tests, Dockerfile
├── web/                 # Application web React
├── mobile/              # Application React Native (Expo)
├── blockchain/          # Contrat AuditAnchor, tests Hardhat
├── infra/               # Terraform, docker-compose
├── docs/                # Threat model, schéma d'architecture, matrice de traçabilité
├── evidence/            # Une preuve par pratique : rapports, captures, logs de runs
└── .github/workflows/   # Pipeline CI/CD
```

## Les 11 pratiques DevSecOps Tier 1

| #  | Pratique                    | Outils                                    |
|----|-----------------------------|-------------------------------------------|
| 1  | SAST                        | Semgrep, CodeQL, eslint-plugin-security   |
| 2  | DAST                        | OWASP ZAP (baseline + API scan)           |
| 3  | Tests de sécurité automatisés | Jest, Supertest, Schemathesis           |
| 4  | Scan de vulnérabilités      | npm audit, OSV-Scanner, Trivy, Checkov    |
| 5  | Monitoring continu          | Prometheus, Grafana, Loki                 |
| 6  | Intégration continue        | GitHub Actions                            |
| 7  | Modélisation des menaces    | OWASP Threat Dragon (STRIDE)              |
| 8  | Shift-left                  | Husky, lint-staged, gitleaks              |
| 9  | Collaboration inter-équipes | GitHub Projects, CODEOWNERS               |
| 10 | Déploiement continu         | GitHub Actions + Terraform                |
| 11 | Revue de code               | PR obligatoires, branch protection        |

Chaque pratique a sa preuve dans [`evidence/`](./evidence). Les pratiques Tier 2 et Tier 3 retenues sont détaillées dans [`docs/`](./docs).

## Failles semées (démonstration avant/après)

Des failles sont introduites volontairement dans des branches `vuln/*` pour que la pipeline les détecte, puis une correction est appliquée (pipeline rouge, puis verte).

Exemples : double réservation (race condition), rejeu de QR, prix modifiable côté client, IDOR, injection SQL et CORS ouvert, secret en dur, dépendance vulnérable, image Docker en root, contrat sans contrôle d'accès, altération du journal d'audit.

> **Règle de sécurité** : les branches `vuln/*` ne sont **jamais fusionnées dans `main`** et **jamais déployées** sur le cloud public. Elles tournent uniquement en CI et en local (Docker Compose isolé).

## Module blockchain d'audit

Un journal d'audit chaîné (`chain_hash = SHA-256(hash précédent + SHA-256(événement))`) dont l'empreinte est ancrée périodiquement dans un smart contract. Il permet de détecter toute modification d'un événement critique (réservation, paiement, scan de QR) après coup.

- Seule une empreinte de 32 octets est publiée : aucune donnée personnelle ni montant sur la blockchain.
- La blockchain détecte une altération, elle ne l'empêche pas (limites détaillées dans le rapport).

## IA

- **Dans la pipeline** : triage des alertes, propositions de correctifs relues par un humain, score de risque, rapport de synthèse.
- **Dans l'application** : détection d'usages anormaux (règles de vélocité + score simple).
- **Garde-fous** : aucun secret envoyé au modèle, sortie du modèle jamais exécutée automatiquement, risque d'injection de prompt testé.

## Workflow Git

| Branche     | Rôle                                                  |
|-------------|-------------------------------------------------------|
| `main`      | Version stable, protégée, seule branche déployée      |
| `develop`   | Branche d'intégration                                 |
| `feature/*` | Nouvelles fonctionnalités, relues par un autre membre |
| `vuln/*`    | Failles semées, jamais fusionnées ni déployées        |

Commits : [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`).
Definition of Done : code relu, test présent, scanners verts, aucun secret, preuve rangée dans `evidence/`.

## Équipe

Quatre membres, un domaine de sécurité chacun, avec revue croisée des PR :

| Domaine                                   | Responsable |
|-------------------------------------------|-------------|
| API et sécurité applicative               | _à compléter_ |
| Paiement, QR, mobile, anti-fraude         | _à compléter_ |
| Pipeline DevSecOps                        | _à compléter_ |
| Cloud, monitoring, blockchain             | _à compléter_ |

## Planning (9 semaines)

| Semaines | Objectif |
|----------|----------|
| 1-2      | Dépôt, protection de branches, API minimale, CI de base, threat model, SAST |
| 3-4      | Paiement, QR, web, audit chaîné, SCA/Trivy, mobile, staging Terraform |
| 5        | Tier 1 complet : DAST, tests de sécurité, monitoring, CD conditionné |
| 6        | Failles semées, ancrage blockchain, Slither |
| 7-8      | IA de la pipeline, Tier 2/3, gel du code |
| 9        | Rapport, présentation, répétitions de la démo |

## Démarrage

```bash
git clone https://github.com/nouhaila2030/cowork-devsecops.git
cd cowork-devsecops
git switch develop
```

Les instructions d'installation de chaque module seront ajoutées dans le README de son dossier.

## Statut

🚧 En cours : initialisation du dépôt et de la structure (semaine 1).
