# Pim-Mobility-site-covoiturage-MERN
Site de covoiturage planifié réalisé avec MERN lors de mon stage de fin de formation

Il s’agit d’un site de covoiturage planifié conçu pour la plaine de l’Ain de déplacements professionnels du domicile jusqu’au lieu de travail pour les trajets 
aller comme retour pour tous les jours travaillés.

Je suis le seul développeur de ce site que j’ai réalisé lors de mon stage de fin de formation de développeur full stack. J’ai utilisé MongoDB, Express, React
(avec les hooks) et NodeJS.

Ce site permet à un utilisateur de trouver des covoitureurs (en tant que passager ou conducteur) pour ses trajets domicile/travail.

La partie utilisateur:

I. Inscription

L’inscription se fait en 4 étapes:
Etape 1: Enregistrement de ses données: nom, prénom, email (unique), téléphone et commune d’entreprise (optionnel)
Etape 2: enregistrement de son rôle: passager, conducteur ou hybride. S’il choisi un rôle autre que passager, il pourra indiquer le moyen de paiement souhaité.
Etape 3: Le nouveau membre va enregistrer tous ses trajets aller. Pour plus de facilité, il va choisir les jours de la semaines où il les effectue, son point de 
départ, sa destination, l’heure à laquelle il part et, s’il n’est pas passager exclusif, le nombre de places disponibles dans son véhicule. Les points de départs
et destinations sont dynamiques et modifiables par l’administrateur. Il lui est aussi possible de rajouter des quartier à chacun d’entre eux (arrondisement, gare,
mairie...)
Etape 4: Pareil que pour l’étape 3 mais pour les trajets retour.

Si le nouveau membre interrompt son inscription à partir de l’étape 2, à sa reconnexion un lien apparaitera lui permettant de reprendre là oùu il s’est arrêté.

II. Gestion du profil

Une fois enregistré, il accèdera directement à son profil et ses trajets. Il pourra modifier ses données (son mot de passe lui sera de nouveau demandé) ou modifier
ses trajets un par un s’il n’a pas les mêmes horaires chaques jours. Il pourra aussi supprimer ou ajouter un nouveau trajet (aller ou retour)
A noter que le membre ne pourra pas modifier son trajet s’il est dans un covoiturage (sauf le nombre de places disponibles dans le véhicule) ni supprimer un trajet
pour lequel il a un covoiturage, reçu ou envoyé une demande de covoiturage.

Le membre peut aussi choisir s’il souhaite apparaître ou pas dans le matching d’un simple clic sur la gestion de son profil.

III. Recherche de covoiturage:

Une fois les 4 étapes terminées, il pourra faire des recherches de covoiturage en cliquant sur Covoiturage planifié dans la navbar puis trouver un 
conducteur/passager soit pour l’aller, soit pour le retour.

Les résultats affichés seront, pour chaque jour,  ceux des membres ayant un rôle (conducteur, passager ou hybride) correspondant a celui qui recherche pour des
trajets ayant le même départ, même destination et un horaire de plus ou moins 15 minutes et des places disponibles.
Les résultats sont classés par jour du trajet (du lundi et dimanche).
Ainsi un rôle conducteur exclusif pourra matcher avec tous les hybrides (qui ne sont pas conducteur pour leur trajet) et tous les passagers disponibles et 
inversement pour les passager.
Par exemple, si un rôle hybride est conducteur le lundi (plus de places disponibles pour ce trajet) et mardi (il lui reste des places) et passager le vendredi,
le résultat du matching n’affichera aucun trajet pour le lundi, uniquement des passagers ou des hybrides non conducteurs le mardi, tout ce qui correspond le
mercredi et jeudi et aucun résultat le vendredi étant donné qu’il est passager.

En cliquant sur un trajet, l’utilisateur pour afficher tous les trajets du membre choisi qui correspondent à ses critères et qui sont disponible. Dans le cas d’un
rôle hybride, il devra choisir s’il souhaite faire une demande en tant que conducteur ou passager et les trajets affichés correspondront à ce rôle. Il est 
possible de faire en même temps une demande de covoiturages pour plusieurs trajets d’un membre. Une fois la demande de covoiturage effectuée, il pourra soit 
accéder directement aux trajets retours du membre sélecionné, soit revenir aux résultats.

Une fois la demande effectuée, il doit attendre l’accord ou le refus de l’autre membre mais peut, s’il le souhaite, annuler sa demande de covoiturage (covoiturage
planifié puis mes demandes de covoiturages)

IV Demande de covoiturage:

1. Fonctionnement:

Il n’y a aucune limite sur le nombre de demandes de covoiturage d’un utilisateur. Cependant, il ne pas pas faire 2 fois la même demande (sa demande de covoiturage
pour le trajet est toujours en attente d’accord ou de refus) et ne peut pas faire de demande pour un trajet sur lequel il est déjà conducteur ou passager.

Il peut cependant refaire une demande si celle-ci a été refusé ou s’il ne fait plus parti du covoiturage (quel que soit son rôle)

Le membre qui a reçu une ou plusieurs demandes de covoiturage verra une notification dès sa connexion au site. En cliquand dessus il pourra accéder au détail et 
pourra soit accepter soit refuser un ou plusieurs trajets en même temps. La notification restera visible tant qu’il lui restera un trajet sans accord ou refus de
sa part.

2. Accepter la demande de covoiturage:

Comme l’utilisateur n’a pas de limite sur le nombre de demandes de covoiturage, des vérifications sont faites avant de pouvoir accepter.

S’il s’agit d’une demande en tant que conducteur (la personne qui accepte sera donc passager), on vérifie s’il n’a pas déjà accepté une demande de covoiturage 
(passager ou conducteur) entre temps.
S’il s’agit d’une demande en tant que passager (la personne qui accepte sera donc conducteur), on vérifie s’il lui reste des places disponibles.
Dans un cas comme dans l’autre, aucune demande de covoiturage (s’il en sélectionne plusieurs via les checkboxs) ne sera accepté et il lui sera indiqué quel trajet
pose pose problème et pour la raison en l’invitant à refuser le trajet concerné.

En acceptant la demande de covoiturage, le membre pourra envoyer un message via le site à son conducteur ou passager afin de communiquer ou, s’il le souhaite
donner son numéro de téléphone.

Une notification sera envoyée au membre qui a fait la demande afin de l’informer quel(s) trajet(s) a(ont) été accepté(s). Le nombre de places disponibles du 
conducteur sera diminué de 1. Le trajet du passager ne sera plus disponible pour le matching.  S’il n’existe pas d’équipage pour ce trajet, il sera créé.

3. Refuser la demande de covoiturage:

En cas de refus d’une demande de covoiturage, le membre peut soit sélectionner un motif existant, soit indiquer un motif personnalisé ou n’indiquer aucun motif.

Une notification sera envoyée au membre qui a fait la demande afin de l’informer quel(s) trajet(s) a(ont) été refusé(s).

4. Gérer ses demandes de covoiturages:

Comme il a tét dit plus haut, un membre peut annuler ses demandes de covoiturages qui n’ont pas encore été acceptées. Il a aussi la possibilité de consulter 
celles qui ont été acceptées ou refusées.

V. Gérer les covoiturages:

En allant sur son profil le membre verra dans ses trajets ceux pour lesquels il a soit trouvé un conducteur ou un passager.

Pour gérer ses covoiturages il doit aller sur covoiturage planifié à partir de la navbar et mes covoiturages. Tous les trajets pour lesquels il a un covoiturage 
apparaîteront.

Pour les trajets où il est passager, il pourra cliquer sur le profil du conducteur et soit lui envoyer un message soit quitter le covoiturage. Tous les trajets
qu’il a avec ce conducteur apparaîteront et il pourra en quitter un ou plusieurs, voir tous. En quittant un covoiturage, le membre sera de nouveau disponible lors
d’un matching.

Pour les trajets où il est conducteur il pourra cliquer sur le nom de chaque passager pour leur envoyer un message individuel, soit supprimer un passager d’un ou 
plusieurs covoiturages. Si le conducteur se retrouve sans passager et qu’il a un profil hybride, il sera de nouveau disponible pour le matching pour des demandes 
en tant que conducteur ou passager.

VI: Les Messages:

Il est possible pour les covoitureurs de pouvoir discuter entre eux via un système de messagerie. 

A chaque message envoyé, une notification aparraîtera sur la page d’accueil du déstinataire à partir de laquelle il pourra afficher le message et, s’il le 
souhaite, y répondre. Il peut aussi accéder à toutes ses conversation via son profil en cliquant sur son nom dans la navbar puis en allant sur mes messages. Les 
conversations sont classées par la date du dernier message. 
S’il n’y a pas encore de conversation, il pourra en créer une en allant sur le profil de son conducteur ou de ses passagers dans ses covoiturages.

Afin d’éviter tout débordements inhérent à un système de messagerie, les messages sont limités en terme de destinataire. Un passager ne pourra envoyer un message
qu’à un conducteur et un conducteur qu’à ses passagers car s’ils n’ont pas souhaiter partager leur coordonnées personnelles, cela permettra d’avertir en cas de 
retard, maladie, vacances…

Les passagers n’ont donc pas la possibilité de dialoguer entre eux via la messagerie du site.

VII: FAQ:

Les membres et non membres peuvent consulter une FAQ via le lien sur la navbar

VIII: La partie administrateur:

Quand un administrateur se connecte, un lien apparait sur la navbar lui perlettant de gérer le site.

1. Gestion des membres:

Permet de voir tous les membres, leur nombre et accéder à leur profil. L’administrateur a la possibilité de ne plus faire apparaître un membre lors du matching 
(de la même façon que le mebre lui-même) pour éviter les utilisateurs “fantômes”

2. Gestion des administrateurs

Permet d’afficher la liste des administrateurs ainsi que leur nombre mais aussi d’en créer un nouveau ou d’en supprimer un. Un mot de passe spécifique est requis
afin d’éviter tout problème.

3.  Afficher les notifications:

Permet de voir toutes les notifications de demandes de covoiturages en cours. 

→ Toutes: toutes les demandes en cours

→ Les non-vues: le membre qui l’a reçue ne s’est pas connecté au site depuis qu’il l’a reçue et ne l’a donc pas vue

→ Vues: le membre a vue la notification de demande de covoiturage mais ne la pas ouverte.

→ Ouvertes: le membre a vu et ouvert la notification mais n’a pas accepté/refusé toutes les demandes de covoiturage.

Ce sytème a été mis en place pour traquer et sortir du matching les utilisateurs fantômes.

4. Actualités du site:

Permet à l’administrateur de créer des messages d’actualité, d’information, d’alerte qui apparaîteront sur la page d’accueil pour le connectés et non connectés.
Il peut les modifier, supprimer ou gérer l’apparation sur la page d’accueil.

5. Gérer les menus déroulants:

Casiment tous les menus déroulant sont dynamiques, c’est à partir de la qu’il pourra ajouter, modifier, afficher et supprimer le contenu des: Communes d’entreprise
s, Départs, Destinations, Quartiers pour départs/destinations, Heures, Minutes, Moyens de paiement, Type de conducteur/Passager, Nombre de places disponibles pour
les passagers, Motifs de refus de covoiturages, Types d’actualité.

6. FAQ:

Permet de créer, mofifier ou supprimer les faqs.

7. Statistiques:

Donne sur une seule page les informations sur l’utilisation du site avec pour la plupart un lien vers le détail

Administrateur: nombre + détail
Membre: nombre total et nombre selon le rôle, s’ils apparaissent dans le matching et les profils incomplets. Possibilité d’avoir le détail pour chaque catégorie.

Trajets aller (ou retour): nombre total et nombre pour lesquels un conducteur, un passager ou aucun covoiturage n’a été trouvé. Possibilité d’avoir le détail 
pour chaque catégorie.

Zones de départs (ou destination) pour les trajets aller et retour: indique pour chaque départ ou destination le nombre de membre qui l’utilisent. Possibilité 
d’avoir le détail pour chacun.

Navigation: historique du nombre de fois que chaque page a été visitée.

Demandes de covoiturages: toutes les demandes (en cours, acceptées, refusées, anulées). Possibilité d’avoir le détail pour chaque catégorie.

IX. Comment faire fonctionner le site:

Etant donné que presque tous les menus déroulants sont dynamiques, il faut d’abord créer un compte administrateur. Pour créer le premier administrateur, il faut 
modifier le modèle du membre pour mettre admin en true et créer un nouveau membre (back/models/membreModel.js, ligne 56). Seule la première étape est nécessaire 
pour un profil administrateur.

Une fois le profil créé, il faut enregistrer les données des menus déroulants nécessaires au bon fonctionnement via l’onglet Admin→ Gérer le contenu des menus 
déroulants. Si certains menus déroulant nécessitent des données particulières, un texte rouge les indique sur la page.

Des variables d’environnement sont utilisées. Il faut donc un fichier .env à la racine du back. Les données utilisées sont: MONGODB_CONNECTION_STRING, JWT_SECRET,
MOT_DE_PASSE

X. Npm utilisés:

Pour le frontend:
npx create-react-app front
npm install react-router-dom
npm install axios
npm install bootstrap
npm install react-bootstrap
npm install node-sass --> permet de customiser bootstrap en modifiant les variables grâce au scss
npm install react-bootstrap-submenu --> permet de faire des sous menus dans les dropdowns

Pour le backend:
npm init -y
npm install mongodb
npm install express
npm install mongoose
npm install cors
npm install dotenv // Permet de stocker localement des variables dans le fichier
npm install bcryptjs
npm install jsonwebtoken
npm install body-parser
