const fs = require('fs');
const path = require('path');
const PDFDocument = require('./backend/node_modules/pdfkit');

const outputPath = path.join(__dirname, 'Rapport_Complet_LouageTN.pdf');

const doc = new PDFDocument({ margin: 40, size: 'A4' });
doc.pipe(fs.createWriteStream(outputPath));

const title = 'Rapport Complet - Application Louage.tn';
const date = new Date().toLocaleString('fr-FR');

function section(titleText) {
  doc.moveDown();
  doc.fillColor('#1E3A8A').font('Helvetica-Bold').fontSize(18).text(titleText);
  doc.moveDown(0.4);
  doc.fillColor('#111111').font('Helvetica').fontSize(11);
}

function bullet(text) {
  doc.font('Helvetica').fontSize(11).fillColor('#222222').text(`• ${text}`, {
    align: 'left',
  });
}

doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(24).text(title, { align: 'center' });
doc.moveDown(0.5);
doc.fillColor('#475569').font('Helvetica').fontSize(11).text(`Date du rapport: ${date}`, { align: 'center' });
doc.moveDown();
doc.fillColor('#111111').fontSize(12).text(
  "Ce document presente un rapport global de l'application mobile et backend Louage.tn, incluant l'architecture, les fonctionnalites metier, les ecrans principaux, les ameliorations visuelles et les derniers changements implementes."
);

section('1. Presentation generale');
bullet("Louage.tn est une application mobile de transport inter-villes en Tunisie.");
bullet("L'application propose deux profils principaux: passager et chauffeur.");
bullet("Le projet contient un frontend mobile Expo / React Native et un backend Node.js / Express / MongoDB.");
bullet("Le frontend se trouve dans le dossier louage-app et le backend dans le dossier backend.");

section('2. Technologies utilisees');
bullet("Frontend: Expo, React Native, Expo Router, AsyncStorage, WebView, Expo Linking, Expo Print, Expo Sharing.");
bullet("Backend: Node.js, Express, Mongoose, JWT, Nodemailer, PDFKit.");
bullet("Base de donnees: MongoDB.");
bullet("Carte: Leaflet charge dans une WebView avec geocodage de villes.");

section('3. Fonctionnalites passager');
bullet("Recherche de trajets par ville de depart et ville d'arrivee.");
bullet("Affichage des trajets disponibles avec heure, prix, chauffeur et nombre de places.");
bullet("Consultation d'un ecran detail avec carte dynamique du trajet.");
bullet("Appel direct du chauffeur depuis l'application.");
bullet("Envoi d'une demande de reservation au chauffeur.");
bullet("Ajout d'un avis sur le chauffeur apres reservation.");

section('4. Fonctionnalites chauffeur');
bullet("Publication de nouveaux trajets avec depart, arrivee, heure, prix et nombre de places.");
bullet("Consultation de tous ses trajets, y compris les trajets complets.");
bullet("Reception des demandes de reservation des passagers.");
bullet("Confirmation ou refus d'une demande avec des boutons simples.");
bullet("Gestion manuelle des places restantes en temps reel avec les boutons + et -.");
bullet("Suppression d'un trajet.");

section('5. Nouveau flux metier de reservation');
bullet("Le passager appelle d'abord le chauffeur.");
bullet("Le passager envoie ensuite une demande de reservation.");
bullet("Le chauffeur voit la demande sur son ecran.");
bullet("Le chauffeur choisit soit de confirmer, soit de refuser.");
bullet("Le nombre de places diminue uniquement si le chauffeur confirme.");
bullet("Si le chauffeur refuse, aucune place n'est retiree.");

section('6. Tickets et email');
bullet("Lorsqu'un chauffeur confirme une demande, un ticket est genere.");
bullet("Le ticket contient le numero, le nom du passager, le trajet, l'heure, le prix et les informations du chauffeur.");
bullet("Le backend genere un vrai PDF grace a PDFKit.");
bullet("Le ticket PDF peut etre envoye par email au passager via Nodemailer.");
bullet("L'envoi depend de la configuration EMAIL et EMAIL_PASSWORD dans le fichier .env du backend.");

section('7. Carte dynamique');
bullet("La carte utilise une recherche reelle des villes au lieu d'une simple liste statique.");
bullet("Si l'utilisateur saisit une ville comme Jendouba, la carte essaie de l'afficher automatiquement.");
bullet("Le trajet est represente par une ligne et un marqueur anime pour rendre l'affichage plus vivant.");

section('8. Ameliorations visuelles');
bullet("Refonte de l'ecran d'accueil.");
bullet("Refonte complete des ecrans d'authentification.");
bullet("Refonte des ecrans passager et chauffeur.");
bullet("Nouvelle hierarchie visuelle plus claire, couleurs plus coherentes et cartes plus modernes.");
bullet("Bouton de deconnexion modernise.");
bullet("Interface plus classe, claire, lisible et adaptee a l'usage mobile.");

section('9. Principaux fichiers modifies');
bullet("louage-app/app/index.tsx");
bullet("louage-app/app/(auth)/login.tsx");
bullet("louage-app/app/(auth)/register.tsx");
bullet("louage-app/app/(auth)/forgotPassword.tsx");
bullet("louage-app/app/(auth)/verifyCode.tsx");
bullet("louage-app/app/(auth)/changePassword.tsx");
bullet("louage-app/app/(passenger)/home.tsx");
bullet("louage-app/app/(passenger)/booking.tsx");
bullet("louage-app/app/(driver)/home.tsx");
bullet("louage-app/app/(driver)/addTrip.tsx");
bullet("louage-app/components/MapView.tsx");
bullet("louage-app/components/RatingStars.tsx");
bullet("louage-app/components/LogoutButton.tsx");
bullet("louage-app/services/api.js");
bullet("louage-app/services/notifications.ts");
bullet("backend/models/Trajet.js");
bullet("backend/routes/trajets.js");
bullet("backend/routes/avis.js");
bullet("backend/routes/auth.js");

section('10. Dependances ajoutees');
bullet("Frontend: expo-print, expo-sharing.");
bullet("Backend: pdfkit.");

section('11. Tests et verification');
bullet("Le frontend passe la verification npm run lint.");
bullet("Les fichiers backend principaux passent la verification syntaxique Node.");
bullet("Les modifications sont enregistrees localement sur le PC dans le dossier du projet.");

section('12. Recommandations finales');
bullet("Redemarrer le backend apres chaque gros changement de routes ou de modeles.");
bullet("Redemarrer Expo apres ajout de nouvelles dependances natives.");
bullet("Verifier la configuration email du backend pour activer l'envoi du ticket PDF.");
bullet("Effectuer des tests complets avec un vrai compte chauffeur et un vrai compte passager.");
bullet("Ajouter ensuite des notifications temps reel si vous voulez une experience encore plus professionnelle.");

doc.moveDown(2);
doc.fillColor('#64748B').font('Helvetica-Oblique').fontSize(10).text(
  'Rapport genere automatiquement depuis le projet local Louage.tn.',
  { align: 'center' }
);

doc.end();

doc.on('finish', () => {
  console.log(outputPath);
});
