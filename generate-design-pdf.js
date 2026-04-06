const fs = require('fs');
const path = require('path');
const PDFDocument = require('./backend/node_modules/pdfkit');

const outputPath = path.join(__dirname, 'Conception_Detaillee_LouageTN.pdf');

const doc = new PDFDocument({ margin: 40, size: 'A4' });
doc.pipe(fs.createWriteStream(outputPath));

const title = (text) => {
  doc.moveDown(0.7);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#0F172A').text(text);
  doc.moveDown(0.3);
};

const subtitle = (text) => {
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1D4ED8').text(text);
  doc.moveDown(0.2);
};

const paragraph = (text) => {
  doc.font('Helvetica').fontSize(11).fillColor('#111827').text(text, {
    align: 'justify',
    lineGap: 3,
  });
  doc.moveDown(0.3);
};

const bullet = (text) => {
  doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`- ${text}`, {
    indent: 12,
    lineGap: 2,
  });
};

const codeBlock = (lines) => {
  const blockText = Array.isArray(lines) ? lines.join('\n') : lines;
  doc.moveDown(0.2);
  const startX = doc.x;
  const startY = doc.y;
  const width = 515;
  const height = doc.heightOfString(blockText, {
    width: width - 20,
    align: 'left',
    lineGap: 2,
  }) + 20;

  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  doc.roundedRect(startX, doc.y, width, height, 8).fill('#F8FAFC');
  doc.fillColor('#334155').font('Courier').fontSize(9).text(blockText, startX + 10, startY + 10, {
    width: width - 20,
    lineGap: 2,
  });
  doc.moveDown(0.8);
};

doc.font('Helvetica-Bold').fontSize(24).fillColor('#C2410C').text('Conception Detaillee - Louage.tn', {
  align: 'center',
});
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(12).fillColor('#475569').text('Architecture fonctionnelle et diagrammes de classes', {
  align: 'center',
});

title('1. Presentation generale');
paragraph(
  "L'application Louage.tn suit une architecture client-serveur. Le front-end mobile est developpe avec Expo et React Native, tandis que le back-end repose sur Node.js, Express et MongoDB via Mongoose. Le systeme permet l'inscription, la connexion, la publication de trajets, l'envoi de demandes de reservation, la confirmation par le chauffeur et l'ajout d'avis."
);

subtitle('Architecture logique');
bullet("Application mobile: interface utilisateur, navigation, formulaires et appels API.");
bullet("API Express: gestion de l'authentification, des trajets, des reservations, des avis et du mot de passe oublie.");
bullet("Base MongoDB: stockage des utilisateurs, trajets, reservations et avis.");
doc.moveDown(0.4);

title('2. Classes metier');

subtitle('Classe User');
bullet('nom: String');
bullet('prenom: String');
bullet('telephone: String');
bullet('email: String');
bullet('password: String');
bullet("role: String = 'passager' | 'chauffeur'");
paragraph("Role: represente un utilisateur authentifiable. Selon son role, il peut publier des trajets ou envoyer des demandes de reservation.");

subtitle('Classe Trajet');
bullet('chauffeur: ObjectId -> User');
bullet('depart: String');
bullet('arrivee: String');
bullet('heure: String');
bullet('places: Number');
bullet('placesInitiales: Number');
bullet('prix: Number');
bullet('demandes: DemandeReservation[]');
bullet('reservations: Reservation[]');
bullet("statut: String = 'actif' | 'complet' | 'annule'");
paragraph("Role: represente une offre de trajet creee par un chauffeur. Cette classe centralise les places disponibles, les demandes en attente et les reservations confirmees.");

subtitle('Classe DemandeReservation');
bullet('passager: ObjectId -> User');
bullet('nom: String');
bullet('prenom: String');
bullet('telephone: String');
bullet('email: String');
bullet("status: String = 'pending' | 'confirmed' | 'rejected'");
bullet('requestedAt: Date');
bullet('decidedAt: Date');
paragraph("Role: memorise la demande envoyee par un passager avant la confirmation finale.");

subtitle('Classe Reservation');
bullet('passager: ObjectId -> User');
bullet('nom: String');
bullet('prenom: String');
bullet('telephone: String');
bullet('email: String');
bullet('reservedAt: Date');
paragraph("Role: represente une reservation acceptee par le chauffeur.");

subtitle('Classe Avis');
bullet('passager: ObjectId -> User');
bullet('chauffeur: ObjectId -> User');
bullet('trajet: ObjectId -> Trajet');
bullet('note: Number');
bullet('commentaire: String');
paragraph("Role: stocke l'evaluation d'un chauffeur par un passager apres un trajet reserve.");

title('3. Diagramme de classes metier');
codeBlock([
  '+------------------+         1       *      +------------------+',
  '|       User       |------------------------>|      Trajet      |',
  '+------------------+                         +------------------+',
  '| nom              |                         | chauffeur         |',
  '| prenom           |                         | depart            |',
  '| telephone        |                         | arrivee           |',
  '| email            |                         | heure             |',
  '| password         |                         | places            |',
  "| role             |                         | placesInitiales   |",
  '+------------------+                         | prix              |',
  '                                             | statut            |',
  '                                             +------------------+',
  '                                                      |',
  '                                                      | 1',
  '                                                      |',
  '                                                  *   |   *',
  '                                   +------------------+   +------------------+',
  '                                   | DemandeReservation|   |   Reservation    |',
  '                                   +------------------+   +------------------+',
  '                                   | passager         |   | passager         |',
  '                                   | nom              |   | nom              |',
  '                                   | prenom           |   | prenom           |',
  '                                   | telephone        |   | telephone        |',
  '                                   | email            |   | email            |',
  '                                   | status           |   | reservedAt       |',
  '                                   | requestedAt      |   +------------------+',
  '                                   | decidedAt        |',
  '                                   +------------------+',
  '',
  '+------------------+',
  '|       Avis       |',
  '+------------------+',
  '| passager         |----> User',
  '| chauffeur        |----> User',
  '| trajet           |----> Trajet',
  '| note             |',
  '| commentaire      |',
  '+------------------+',
]);

title('4. Classes de controle');
subtitle('AuthController');
bullet('register(req, res)');
bullet('login(req, res)');

subtitle('TrajetController');
bullet('getTrajets(req, res)');
bullet('addTrajet(req, res)');
bullet('demanderReservation(req, res)');
bullet('decideReservationRequest(req, res)');
bullet('updatePlaces(req, res)');
bullet('deleteTrajet(req, res)');

subtitle('AvisController');
bullet('addAvis(req, res)');
bullet('getAvisByChauffeur(req, res)');

subtitle('ResetPasswordController');
bullet('sendCode(req, res)');
bullet('verifyCode(req, res)');
bullet('changePassword(req, res)');

title('5. Diagramme de classes applicatives');
codeBlock([
  '+------------------+        +---------------------+',
  '|    ApiMobile     |------->|   AuthController    |',
  '+------------------+        +---------------------+',
  '| register()       |        | register()          |',
  '| login()          |        | login()             |',
  '| getTrajets()     |        +---------------------+',
  '| addTrajet()      |',
  '| submitRequest()  |        +---------------------+',
  '| decideRequest()  |------->|  TrajetController   |',
  '| updatePlaces()   |        +---------------------+',
  '| addAvis()        |        | getTrajets()        |',
  '| sendCode()       |        | addTrajet()         |',
  '+------------------+        | demanderReservation()|',
  '                            | decideReservation()  |',
  '                            | updatePlaces()       |',
  '                            | deleteTrajet()       |',
  '                            +---------------------+',
  '',
  '         +---------------------+      +-------------------------+',
  '         |   AvisController    |      | ResetPasswordController |',
  '         +---------------------+      +-------------------------+',
  '         | addAvis()           |      | sendCode()              |',
  '         | getAvisByChauffeur()|      | verifyCode()            |',
  '         +---------------------+      | changePassword()        |',
  '                                      +-------------------------+',
]);

title('6. Regles metier');
bullet("Un utilisateur possede un email unique.");
bullet("Seul un passager peut envoyer une demande de reservation.");
bullet("Seul le chauffeur proprietaire du trajet peut accepter ou rejeter une demande.");
bullet("Une demande acceptee cree une reservation et diminue le nombre de places.");
bullet("Quand places atteint 0, le trajet devient complet.");
bullet("Un passager ne peut laisser un avis que s'il a reserve le trajet.");
bullet("Un seul avis est autorise par passager et par trajet.");

title('7. Conclusion');
paragraph(
  "La conception actuelle est adaptee a un projet academique ou a un MVP. Les entites metier sont simples, bien reliees et couvrent le cycle complet: authentification, publication des trajets, demandes, confirmations, reservations et evaluation. Une evolution naturelle serait d'extraire des services dedies pour l'email, les tickets PDF et le middleware d'authentification."
);

doc.end();
console.log(`PDF genere: ${outputPath}`);
