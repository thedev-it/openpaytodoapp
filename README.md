# Task Manager

Application de gestion de tâches (Task Manager) en architecture Full Stack : une **API REST** développée avec **Java / Spring Boot**, une base de données **PostgreSQL** lancée avec **Docker Compose**, et une interface **Angular**.

> Ce projet a été réalisé dans le cadre d'un test technique pour un stage de Développeur Full Stack.
> Ce README décrit d'abord le **backend** (complet), puis renvoie à la partie **frontend**.

---

## Table des matières

1. [Contexte et fonctionnalités](#1-contexte-et-fonctionnalités)
2. [Technologies et versions](#2-technologies-et-versions)
3. [Prérequis](#3-prérequis)
4. [Structure du projet](#4-structure-du-projet)
5. [Installation et lancement (pas à pas)](#5-installation-et-lancement-pas-à-pas)
6. [Configuration de PostgreSQL](#6-configuration-de-postgresql)
7. [Configuration du backend](#7-configuration-du-backend)
8. [Documentation de l'API REST](#8-documentation-de-lapi-rest)
9. [Tester l'API](#9-tester-lapi)
10. [Tests automatisés](#10-tests-automatisés)
11. [Architecture du backend](#11-architecture-du-backend)
12. [Choix techniques](#12-choix-techniques)
13. [Dépannage](#13-dépannage)
14. [Améliorations possibles](#14-améliorations-possibles)
15. [Frontend Angular](#15-frontend-angular)
16. [Auteur](#16-auteur)

---

## 1. Contexte et fonctionnalités

L'application permet de **consulter, créer, modifier et supprimer des tâches**.

Chaque tâche possède :

| Champ | Type | Description |
|---|---|---|
| `id` | nombre | Identifiant, généré automatiquement |
| `title` | texte | Titre (obligatoire, 150 caractères maximum) |
| `description` | texte | Description (facultative, 1000 caractères maximum) |
| `status` | énumération | `TODO`, `IN_PROGRESS` ou `DONE` |
| `priority` | énumération | `LOW`, `MEDIUM` ou `HIGH` |
| `createdAt` | date et heure | Date de création, générée automatiquement |

Fonctionnalités du backend :

- API REST complète (CRUD) sur les tâches
- Changement du statut d'une tâche (endpoint dédié)
- Recherche par titre, filtre par statut et par priorité (combinables)
- Validation des données et messages d'erreur clairs
- Gestion des erreurs HTTP (400, 404) au format JSON
- Migrations de base de données versionnées (Flyway)
- Base PostgreSQL démarrable en une commande (Docker Compose)

---

## 2. Technologies et versions

| Composant | Technologie | Version |
|---|---|---|
| Langage backend | Java (JDK Temurin) | **21** (LTS) |
| Framework backend | Spring Boot | **4.1.1** |
| Serveur web | Tomcat (intégré à Spring Boot) | 11.0.x |
| Accès aux données | Spring Data JPA / Hibernate | Hibernate 7.4.x |
| Validation | Jakarta Bean Validation (`spring-boot-starter-validation`) | géré par Spring Boot |
| Migrations | Flyway (`spring-boot-starter-flyway`) | géré par Spring Boot |
| Build | Maven (via le Maven Wrapper `mvnw`) | 3.9.x |
| Base de données | PostgreSQL | **16** (image `postgres:16-alpine`) |
| Conteneurs | Docker et Docker Compose | Docker Desktop récent |
| Frontend | Angular | *à compléter* |

> **Maven n'a pas besoin d'être installé** : le projet contient le Maven Wrapper (`mvnw` / `mvnw.cmd`), qui télécharge automatiquement la bonne version.

---

## 3. Prérequis

À installer **avant** de commencer :

| Outil | Version | Utilité | Vérification |
|---|---|---|---|
| **Git** | récent | Cloner le dépôt | `git --version` |
| **JDK** | **21** | Compiler et lancer le backend | `java -version` et `javac -version` |
| **Docker Desktop** | récent | Lancer PostgreSQL | `docker --version` et `docker compose version` |
| **Node.js** et **Angular CLI** | *à compléter* | Frontend uniquement | *voir section 15* |
| Postman *(facultatif)* | récent | Tester l'API | |

Remarques importantes :

- **Docker Desktop doit être démarré** avant de lancer `docker compose`.
- Sur **Windows**, la variable d'environnement `JAVA_HOME` doit pointer vers le dossier du JDK 21 (l'installeur Temurin `.msi` la configure si l'option *Set JAVA_HOME variable* est cochée). Vérification :
  - PowerShell : `echo $env:JAVA_HOME`
  - Linux / macOS : `echo $JAVA_HOME`
- Après avoir modifié une variable d'environnement, **fermez et rouvrez** le terminal (et l'éditeur de code).

---

## 4. Structure du projet

```
<openpaytodoapp>/
├── backend/                          # API REST Spring Boot
│   ├── pom.xml                       # Dépendances Maven
│   ├── mvnw / mvnw.cmd               # Maven Wrapper
│   └── src/
│       ├── main/
│       │   ├── java/thedev/it/todo_app/
│       │   │   ├── TodoAppApplication.java        # Point d'entrée
│       │   │   ├── controller/                    # Couche HTTP (routes REST)
│       │   │   │   └── TaskController.java
│       │   │   ├── service/                       # Logique métier
│       │   │   │   └── TaskService.java
│       │   │   ├── repository/                    # Accès à la base de données
│       │   │   │   └── TaskRepository.java
│       │   │   ├── entity/                        # Entités JPA et énumérations
│       │   │   │   ├── Task.java
│       │   │   │   ├── Status.java
│       │   │   │   └── Priority.java
│       │   │   ├── dto/                           # Objets d'entrée / sortie de l'API
│       │   │   │   ├── TaskRequest.java
│       │   │   │   ├── TaskStatusRequest.java
│       │   │   │   └── TaskResponse.java
│       │   │   ├── exception/                     # Gestion centralisée des erreurs
│       │   │   │   ├── TaskNotFoundException.java
│       │   │   │   ├── ErrorResponse.java
│       │   │   │   └── GlobalExceptionHandler.java
│       │   │   └── config/
│       │   │       └── CorsConfig.java            # Autorise le frontend Angular
│       │   └── resources/
│       │       ├── application.properties         # Configuration
│       │       └── db/migration/
│       │           └── V1__create_tasks_table.sql # Migration Flyway
│       └── test/                                  # Tests automatisés
├── frontend/                         # Application Angular
├── docker-compose.yml                # PostgreSQL en local
└── README.md
```

---

## 5. Installation et lancement (pas à pas)

### Étape 1 : cloner le dépôt

```bash
git clone https://github.com/thedev-it/openpaytodoapp.git
cd openpaytodoapp
```

### Étape 2 : démarrer PostgreSQL avec Docker Compose

À la **racine** du projet (là où se trouve `docker-compose.yml`) :

```bash
docker compose up -d
```

La première exécution télécharge l'image PostgreSQL (quelques instants). Vérifiez ensuite que le conteneur est prêt :

```bash
docker compose ps
```

Attendez que la colonne `STATUS` affiche `Up ... (healthy)`.

### Étape 3 : lancer le backend

```bash
cd backend
```

- **Windows (PowerShell)** :
  ```powershell
  ./mvnw spring-boot:run
  ```
- **Windows (invite de commandes CMD)** :
  ```cmd
  mvnw spring-boot:run
  ```
- **Linux / macOS** :
  ```bash
  chmod +x mvnw      # une seule fois, si le script n'est pas exécutable
  ./mvnw spring-boot:run
  ```

Le premier lancement télécharge les dépendances Maven (plusieurs minutes selon la connexion). Les lancements suivants sont rapides.

Le backend est prêt quand les logs affichent, dans cet ordre :

```
Successfully applied 1 migration to schema "public", now at version v1
Tomcat started on port 8080 (http) with context path '/'
Started TodoAppApplication in X seconds
```

> Le terminal reste occupé tant que l'application tourne (les logs s'affichent en continu). Arrêtez-la avec `Ctrl + C`.

### Étape 4 : vérifier que l'API répond

Ouvrez dans un navigateur sur : **http://localhost:8080/api/tasks**

Avec une base vide, la réponse est un tableau vide : 

```json
[]
```

L'API est opérationnelle. Passez à la section [Tester l'API](#9-tester-lapi) pour créer vos premières tâches.

### Arrêter le projet

```bash
# Backend : Ctrl + C dans le terminal où il tourne

# PostgreSQL (les données sont conservées)
docker compose down
```

### Alternative : générer un fichier JAR exécutable

```bash
cd backend
./mvnw clean package
java -jar target/todo-app-0.0.1-SNAPSHOT.jar
```

Pour ignorer les tests lors de la construction : `./mvnw clean package -DskipTests`.

---

## 6. Configuration de PostgreSQL

La base est définie dans `docker-compose.yml` à la racine du projet.

### Informations de connexion

| Paramètre | Valeur |
|---|---|
| Hôte | `localhost` |
| **Port (machine locale)** | **`5433`** |
| Port interne au conteneur | `5432` |
| Base de données | `taskdb` |
| Utilisateur | `taskuser` |
| Mot de passe | `taskpass` |
| URL JDBC | `jdbc:postgresql://localhost:5433/taskdb` |
| Nom du conteneur | `taskmanager-db` |
| Volume de données | `postgres_data` |

> **Pourquoi le port 5433 et non 5432 ?** Le port 5432 est le port standard de PostgreSQL, souvent déjà utilisé sur une machine de développement (une installation locale ou un autre conteneur). Le port **5433** évite ce conflit. Si le 5433 est lui aussi occupé chez vous, voir la section [Dépannage](#13-dépannage).

Ces identifiants servent **uniquement au développement local**. Ils ne doivent jamais être utilisés en production.

### Commandes utiles

```bash
# Démarrer la base en arrière-plan
docker compose up -d

# Voir l'état du conteneur
docker compose ps

# Voir les logs de la base
docker compose logs -f postgres

# Arrêter la base (données conservées)
docker compose down

# Arrêter la base ET supprimer toutes les données (repartir de zéro)
docker compose down -v
```

### Se connecter à la base en ligne de commande

```bash
docker exec -it taskmanager-db psql -U taskuser -d taskdb
```

Commandes SQL utiles à l'intérieur de `psql` :

```sql
\dt                          -- lister les tables
SELECT * FROM tasks;         -- voir les tâches
SELECT * FROM flyway_schema_history;   -- voir les migrations appliquées
\q                           -- quitter
```

Vous pouvez aussi vous connecter avec un client graphique (DBeaver, pgAdmin, IntelliJ...) avec les informations du tableau ci-dessus.

### Schéma de la base

La table `tasks` est créée automatiquement au démarrage du backend par la migration Flyway `V1__create_tasks_table.sql` :

```sql
CREATE TABLE tasks (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(150)  NOT NULL,
    description VARCHAR(1000),
    status      VARCHAR(20)   NOT NULL,
    priority    VARCHAR(20)   NOT NULL,
    created_at  TIMESTAMP     NOT NULL,
    CONSTRAINT chk_tasks_status   CHECK (status   IN ('TODO', 'IN_PROGRESS', 'DONE')),
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))
);
```

Les contraintes `CHECK` garantissent l'intégrité des données directement au niveau de la base, même en cas d'insertion SQL manuelle.

---

## 7. Configuration du backend

Fichier : `backend/src/main/resources/application.properties`

```properties
spring.application.name=task-manager

# PostgreSQL (docker-compose)
spring.datasource.url=jdbc:postgresql://localhost:5433/taskdb
spring.datasource.username=taskuser
spring.datasource.password=taskpass

# Hibernate vérifie le schéma sans le créer : c'est Flyway qui s'en charge
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

# Migrations
spring.flyway.enabled=true

server.port=8080
```

| Propriété | Rôle |
|---|---|
| `spring.datasource.*` | Connexion à PostgreSQL (doit correspondre au `docker-compose.yml`) |
| `spring.jpa.hibernate.ddl-auto=validate` | Hibernate **vérifie** que les entités correspondent aux tables, sans jamais les modifier |
| `spring.jpa.open-in-view=false` | Évite de garder une connexion à la base ouverte pendant le rendu de la réponse |
| `spring.flyway.enabled=true` | Applique automatiquement les migrations SQL au démarrage |
| `server.port` | Port HTTP du backend |

---

## 8. Documentation de l'API REST

**URL de base** : `http://localhost:8080/api/tasks`

Toutes les requêtes et réponses sont au format **JSON** (`Content-Type: application/json`).

### Liste des endpoints

| Méthode | URL | Description | Succès |
|---|---|---|---|
| `GET` | `/api/tasks` | Lister les tâches (avec filtres facultatifs) | `200 OK` |
| `GET` | `/api/tasks/{id}` | Consulter une tâche | `200 OK` |
| `POST` | `/api/tasks` | Créer une tâche | `201 Created` |
| `PUT` | `/api/tasks/{id}` | Modifier une tâche (remplacement complet) | `200 OK` |
| `PATCH` | `/api/tasks/{id}/status` | Modifier uniquement le statut | `200 OK` |
| `DELETE` | `/api/tasks/{id}` | Supprimer une tâche | `204 No Content` |

### Filtres de `GET /api/tasks`

Tous les paramètres sont **facultatifs** et **combinables** (condition ET) :

| Paramètre | Valeurs | Comportement |
|---|---|---|
| `status` | `TODO`, `IN_PROGRESS`, `DONE` | Filtre exact sur le statut |
| `priority` | `LOW`, `MEDIUM`, `HIGH` | Filtre exact sur la priorité |
| `search` | texte libre | Recherche **partielle**, **insensible à la casse**, dans le titre |

Les résultats sont triés de la **plus récente à la plus ancienne** (`createdAt` décroissant).

Exemple : `GET /api/tasks?status=TODO&priority=HIGH&search=démo`

### Corps de requête : créer ou modifier une tâche (`POST`, `PUT`)

```json
{
  "title": "Préparer la démo",
  "description": "Tester l'API de bout en bout",
  "status": "TODO",
  "priority": "HIGH"
}
```

| Champ | Règle de validation |
|---|---|
| `title` | **Obligatoire**, non vide, 150 caractères maximum |
| `description` | Facultatif, 1000 caractères maximum |
| `status` | **Obligatoire** : `TODO`, `IN_PROGRESS` ou `DONE` |
| `priority` | **Obligatoire** : `LOW`, `MEDIUM` ou `HIGH` |

Les champs `id` et `createdAt` sont gérés par le serveur : ils ne doivent pas être envoyés.

### Corps de requête : modifier le statut (`PATCH`)

```json
{
  "status": "DONE"
}
```

### Exemple de réponse (`TaskResponse`)

```json
{
  "id": 1,
  "title": "Préparer la démo",
  "description": "Tester l'API de bout en bout",
  "status": "TODO",
  "priority": "HIGH",
  "createdAt": "2026-10-01T04:30:12.345678"
}
```

### Codes de réponse HTTP

| Code | Signification | Quand |
|---|---|---|
| `200 OK` | Succès | Lecture et modification |
| `201 Created` | Ressource créée | `POST` réussi |
| `204 No Content` | Succès sans contenu | `DELETE` réussi |
| `400 Bad Request` | Requête invalide | Validation échouée, enum inconnue, JSON illisible, paramètre invalide |
| `404 Not Found` | Ressource inexistante | Tâche introuvable |

### Format des erreurs

Toutes les erreurs ont la même structure JSON :

**Erreur de validation (400)** : le détail par champ se trouve dans `fieldErrors`.

```json
{
  "status": 400,
  "message": "Données invalides",
  "fieldErrors": {
    "title": "Le titre est obligatoire"
  },
  "timestamp": "2026-10-01T04:32:45.123456"
}
```

**Tâche introuvable (404)** :

```json
{
  "status": 404,
  "message": "Tâche introuvable avec l'identifiant 999",
  "fieldErrors": {},
  "timestamp": "2026-10-01T04:33:10.654321"
}
```

---

## 9. Tester l'API

Le backend doit être démarré (voir [section 5](#5-installation-et-lancement-pas-à-pas)).

### Option 1 : le navigateur (lecture seule)

Seules les requêtes `GET` peuvent s'envoyer depuis la barre d'adresse :

- http://localhost:8080/api/tasks
- http://localhost:8080/api/tasks/1
- http://localhost:8080/api/tasks?status=TODO&priority=HIGH

### Option 2 : Postman (recommandé)

1. Créez une collection et une variable `baseUrl` = `http://localhost:8080/api/tasks`.
2. Pour `POST`, `PUT` et `PATCH` : onglet **Body → raw → JSON**.
3. Rejouez les scénarios du tableau ci-dessous.

Si une collection Postman est fournie dans le dépôt (`docs/task-manager.postman_collection.json`), importez-la avec **Import** dans Postman.

### Option 3 : curl (Linux, macOS, Git Bash)

```bash
# Créer une tâche
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Préparer la démo","description":"Tester l API","status":"TODO","priority":"HIGH"}'

# Lister les tâches
curl http://localhost:8080/api/tasks

# Filtrer : statut + priorité + recherche dans le titre
curl "http://localhost:8080/api/tasks?status=TODO&priority=HIGH&search=démo"

# Consulter une tâche
curl http://localhost:8080/api/tasks/1

# Modifier une tâche
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Préparer la présentation","description":"Version finale","status":"IN_PROGRESS","priority":"HIGH"}'

# Modifier uniquement le statut
curl -X PATCH http://localhost:8080/api/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'

# Supprimer une tâche
curl -X DELETE http://localhost:8080/api/tasks/1
```

### Option 4 : PowerShell (Windows)

> En PowerShell, `curl` est un alias d'une autre commande. Utilisez `Invoke-RestMethod`. Pour les accents, le corps est envoyé en octets UTF-8.

```powershell
# Créer une tâche
$body = '{"title":"Préparer la démo","description":"Tester l API","status":"TODO","priority":"HIGH"}'
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/tasks `
  -ContentType "application/json; charset=utf-8" `
  -Body ([Text.Encoding]::UTF8.GetBytes($body))

# Lister
Invoke-RestMethod http://localhost:8080/api/tasks

# Modifier le statut
Invoke-RestMethod -Method Patch -Uri http://localhost:8080/api/tasks/1/status `
  -ContentType "application/json" -Body '{"status":"DONE"}'

# Supprimer
Invoke-RestMethod -Method Delete -Uri http://localhost:8080/api/tasks/1
```

### Scénarios de test conseillés

| # | Requête | Résultat attendu |
|---|---|---|
| 1 | `POST` avec un corps valide | `201`, avec `id` et `createdAt` |
| 2 | `GET /api/tasks` | `200`, liste contenant la tâche créée |
| 3 | `GET /api/tasks?status=TODO&priority=HIGH&search=démo` | `200`, seules les tâches correspondantes |
| 4 | `GET /api/tasks/{id}` | `200` |
| 5 | `PUT /api/tasks/{id}` | `200`, valeurs mises à jour |
| 6 | `PATCH /api/tasks/{id}/status` avec `{"status":"DONE"}` | `200`, `status` = `DONE` |
| 7 | `DELETE /api/tasks/{id}` | `204`, sans contenu |
| 8 | `GET /api/tasks/999` | `404`, message « Tâche introuvable... » |
| 9 | `POST` avec `{"title":"","status":"TODO","priority":"LOW"}` | `400`, `fieldErrors.title` renseigné |
| 10 | `GET /api/tasks?status=INCONNU` | `400`, « Valeur invalide pour le paramètre 'status' » |
| 11 | `POST` avec `"status":"INCONNU"` | `400`, « Corps de la requête invalide ou illisible » |

---

## 10. Tests automatisés

<!-- À COMPLÉTER après l'écriture des tests : liste des classes de tests, ce qu'elles couvrent -->

Lancer les tests du backend :

```bash
cd backend
./mvnw test
```

Pour l'instant, le projet contient le test de chargement du contexte Spring généré par Spring Initializr. Les tests unitaires du service et du contrôleur seront décrits ici une fois ajoutés.

Outils prévus : **JUnit 5**, **Mockito** (tests unitaires du service) et **MockMvc** (tests du contrôleur), fournis par `spring-boot-starter-webmvc-test`.

---

## 11. Architecture du backend

Le backend suit une **architecture en couches** avec une séparation stricte des responsabilités :

```
Client (Angular, Postman)
        │  JSON
        ▼
┌───────────────────┐
│    Controller     │  Reçoit la requête HTTP, valide l'entrée (@Valid), renvoie la réponse
└─────────┬─────────┘
          ▼
┌───────────────────┐
│      Service      │  Logique métier, transactions, conversion entité ↔ DTO
└─────────┬─────────┘
          ▼
┌───────────────────┐
│    Repository     │  Accès aux données (Spring Data JPA)
└─────────┬─────────┘
          ▼
     PostgreSQL
```

| Couche | Package | Responsabilité | Ne doit jamais |
|---|---|---|---|
| Controller | `controller` | Routes REST, codes HTTP | Contenir de la logique métier ou accéder à la base |
| Service | `service` | Règles métier, recherche, transactions | Gérer du HTTP |
| Repository | `repository` | Requêtes vers la base | Contenir de la logique métier |
| Entity | `entity` | Représentation des tables | Être exposée directement par l'API |
| DTO | `dto` | Contrat d'entrée / sortie de l'API | Contenir de la logique |
| Exception | `exception` | Erreurs métier et réponses d'erreur | |
| Config | `config` | Configuration (CORS) | |

### Parcours d'une requête : `POST /api/tasks`

1. Le client envoie un JSON.
2. Le `TaskController` reçoit la requête ; Spring convertit le JSON en `TaskRequest` et le **valide** (`@Valid`). Si une règle échoue, le `GlobalExceptionHandler` renvoie directement un `400`.
3. Le contrôleur appelle `TaskService.create(request)`.
4. Le service crée une entité `Task` et appelle `TaskRepository.save(task)`.
5. PostgreSQL enregistre la tâche et génère l'`id` ; `createdAt` est rempli juste avant l'insertion.
6. Le service convertit l'entité en `TaskResponse`.
7. Spring renvoie le JSON avec le code `201 Created`.

---

## 12. Choix techniques

| Choix | Justification |
|---|---|
| **DTO** (`TaskRequest`, `TaskResponse`) plutôt que l'entité | Sépare le modèle de persistance du contrat de l'API : le client ne peut pas modifier `id` ou `createdAt`, et un changement de la base ne casse pas le frontend |
| **`record` Java** pour les DTO | Classes immuables et concises (constructeur, accesseurs, `equals`, `hashCode` générés) |
| **Injection de dépendances par constructeur** | Dépendances explicites, attributs `final`, classes faciles à tester avec des faux objets |
| **Flyway** pour les migrations | Schéma versionné et reproductible ; Hibernate est en mode `validate` et ne modifie jamais la base |
| **Énumérations stockées en `STRING`** | Lisibilité en base, et ajouter une valeur à l'énumération ne décale pas les données existantes |
| **Contraintes `CHECK` en SQL** | Intégrité garantie même hors de l'application |
| **`Specification` (Spring Data JPA)** pour les filtres | Requête construite dynamiquement selon les paramètres reçus ; évite les erreurs de paramètres `null` avec PostgreSQL |
| **`@Transactional`** (`readOnly` pour les lectures) | Atomicité des écritures, lectures optimisées |
| **`@RestControllerAdvice`** | Gestion centralisée des erreurs, format JSON unique et messages clairs |
| **Endpoint `PATCH /{id}/status`** | Changer le statut sans renvoyer toute la tâche (menu déroulant, glisser-déposer) |
| **CORS limité à `http://localhost:4200`** | Autorise le frontend Angular sans ouvrir l'API à tous les sites |
| **Port PostgreSQL 5433** | Évite le conflit avec un PostgreSQL local déjà installé sur le port 5432 |

---

## 13. Dépannage

| Problème | Cause probable | Solution |
|---|---|---|
| `The JAVA_HOME environment variable is not defined correctly` | `JAVA_HOME` absent ou erroné | Définir `JAVA_HOME` sur le dossier du JDK 21, puis rouvrir le terminal |
| `release version 21 not supported` | JDK inférieur à 21 utilisé | Vérifier `javac -version` (doit afficher 21) |
| `error during connect` ou `docker daemon is not running` | Docker Desktop non démarré | Lancer Docker Desktop, attendre qu'il soit prêt |
| `port is already allocated` (5433) | Le port 5433 est déjà utilisé | Changer le port : dans `docker-compose.yml` (`"5434:5432"`) **et** dans `application.properties` (`localhost:5434`) |
| `Connection refused` au démarrage du backend | PostgreSQL pas encore prêt | Attendre `healthy` dans `docker compose ps`, puis relancer |
| `password authentication failed` | Identifiants différents entre compose et properties | Vérifier que les deux fichiers utilisent `taskuser` / `taskpass` / `taskdb` |
| `No migrations found` dans les logs Flyway | Fichier SQL mal placé ou mal nommé | Le fichier doit être `backend/src/main/resources/db/migration/V1__create_tasks_table.sql` (deux `_` après `V1`) |
| `Schema-validation: missing table` | Migration non appliquée | Vérifier les logs Flyway ; en dernier recours, `docker compose down -v` puis relancer |
| `404` sur `/api/tasks` | Backend non redémarré après modification | Arrêter (`Ctrl + C`) et relancer `./mvnw spring-boot:run` |
| `ERR_CONNECTION_REFUSED` dans le navigateur | Backend non démarré | Lancer le backend et attendre `Started TodoAppApplication` |
| Accents mal affichés en PowerShell (`DÃ©mo`) | Encodage de la console | Utiliser Postman, ou envoyer le corps en octets UTF-8 (voir section 9) |

Pour repartir d'une base propre : `docker compose down -v` puis `docker compose up -d`.

---

## 14. Améliorations possibles

- **Pagination** et **tri** configurable des tâches (`Pageable`)
- **Authentification** (Spring Security, JWT) et tâches par utilisateur
- **Documentation OpenAPI / Swagger** de l'API
- **Tests d'intégration** avec Testcontainers (vraie base PostgreSQL pendant les tests)
- **Dockerisation complète** (backend et frontend) avec un seul `docker compose up`
- **Profils Spring** (`dev`, `prod`) et secrets via variables d'environnement plutôt qu'en clair
- Échappement des caractères spéciaux (`%`, `_`) dans la recherche par titre
- **CI/CD** (GitHub Actions : build et tests à chaque commit)
- Journalisation structurée et monitoring (Spring Boot Actuator)

---

## 15. Frontend Angular

<!-- À COMPLÉTER après la réalisation du frontend : version d'Angular et de Node, installation, lancement, tests, captures d'écran -->

Le frontend se trouve dans le dossier `frontend/`. Il consomme l'API décrite ci-dessus (`http://localhost:8080/api/tasks`).

Cette section sera complétée avec : les prérequis (Node.js, Angular CLI), les commandes d'installation (`npm install`) et de lancement (`ng serve`, accessible sur `http://localhost:4200`), les tests (`ng test`) et la structure des composants.

---

## 16. Auteur

**Gilles Brant BITEMO** : Développeur Full Stack junior

- GitHub : https://github.com/thedev-it
- Portfolio : https://thedev-it.netlify.app/
- LinkedIn : https://www.linkedin.com/in/gilles-brant-bitemo-a3126738a/
- E-mail : bitemogilles@gmail.com