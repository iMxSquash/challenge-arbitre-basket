# Tableau d'affichage de Basketball

Ce projet est un tableau d'affichage de scores pour les matchs de basketball avec une interface d'administration pour les arbitres. Les modifications effectuées dans l'interface d'administration sont immédiatement visibles sur le tableau d'affichage public grâce à une communication en temps réel via WebSockets.

## Fonctionnalités

- **Tableau d'affichage public** - Affiche en temps réel :

  - Scores des équipes
  - Temps de jeu
  - Chronomètre des tirs (24 secondes)
  - Période actuelle
  - Fautes d'équipe
  - Temps morts restants

- **Interface d'administration pour les arbitres** - Permet de :
  - Démarrer/arrêter les chronomètres
  - Ajouter des points (1, 2 ou 3)
  - Gérer les fautes d'équipe
  - Gérer les temps morts
  - Modifier les noms des équipes
  - Changer de période
  - Réinitialiser les chronomètres

## Technologies utilisées

- Next.js (framework React)
- Socket.IO pour la communication en temps réel
- Tailwind CSS pour le design

## Installation

1. Clonez ce dépôt
2. Installez les dépendances :

```bash
npm install
```

## Utilisation

Ce projet nécessite deux serveurs distincts pour fonctionner correctement :

### 1. Démarrer le serveur Socket.IO (serveur WebSocket)

```bash
node server/index.js
```

### 2. Démarrer le serveur Next.js

Dans un nouveau terminal :

```bash
npm run dev
```

### 3. Accéder à l'application

- **Tableau d'affichage public** : [http://localhost:3000](http://localhost:3000)
- **Interface d'administration** : [http://localhost:3000/admin](http://localhost:3000/admin)
  - Mot de passe : `arbitre123`

## Architecture

L'application est divisée en deux parties principales :

1. **Serveur Socket.IO** (port 4000) - Gère la communication en temps réel et l'état des chronomètres
2. **Application Next.js** (port 3000) - Interface utilisateur avec deux vues principales :
   - Tableau d'affichage public
   - Interface d'administration pour les arbitres
