# Front-end FATIN — changements

## Enseignant
- **Mes contenus (T2 → T9)** — `/content` : liste des unités (filtres, matière, suppression) + éditeur en 7 étapes
  (unité → leçon → objectifs → compétences → prérequis → chunks → publication). L'état est dans l'URL
  (`?unit=&lesson=&step=`), donc rafraîchir ou suivre un lien « إصلاح » ouvre la bonne étape.
- **Étape 7 Publication (T9)** — nouvelle : `publication_check` du serveur, lien « إصلاح » vers l'étape fautive,
  publication de la leçon puis de l'unité.
- **Accueil (T1)** — branché sur `teacher-dashboard/overview`, `units-performance`, `students-progress`.
- **Mes élèves (T10/T11)** — élèves à suivre avec la raison (erreurs de concept, redirections, inactivité),
  tri, fiche élève avec `summary` + `error-analysis`. (L'ancien bouton « رسالة » qui n'envoyait rien est retiré.)

## Admin
- **Vue d'ensemble (A1)** — `reports`, `reports/usage?days=7`, `reports/attention` avec liens « إصلاح ».
- **Utilisateurs (A2)** — `api/auth/users/` : filtres rôle / wilaya / recherche, pagination, création, édition,
  activation/désactivation, suppression. Rôle `regional_admin`.
- **Programme (A3)** — formulaire d'ajout séparé de l'édition, couleur/statut seulement pour les matières.
- **Rapports (A4)** — période 7/30/90 j réellement appliquée, maîtrise par wilaya réelle (`reports/by-wilaya`,
  avant : valeurs inventées), export CSV réel (compatible Excel).

## Commun
- Cloche de notifications fonctionnelle (élèves à suivre / contenu à corriger / révision suggérée).
- Page « حسابي » : profil, changement de mot de passe, déconnexion — accessible à tous les rôles.
- Mot de passe oublié en 3 étapes (e-mail → code 4 chiffres → nouveau mot de passe) dans le cadre FATIN.
- Rôle lu au rendu (plus au chargement du module) ; `regional_admin` a accès à l'accueil, aux utilisateurs et aux rapports.
- Messages d'erreur d'authentification en arabe ; `<html lang="ar" dir="rtl">`, favicon corrigé.
