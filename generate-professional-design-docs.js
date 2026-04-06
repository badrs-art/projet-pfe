const fs = require('fs');
const path = require('path');
const PDFDocument = require('./backend/node_modules/pdfkit');

const pdfPath = path.join(__dirname, 'Conception_Professionnelle_LouageTN.pdf');
const rtfPath = path.join(__dirname, 'Conception_Professionnelle_LouageTN_Word.rtf');

function ensurePageSpace(doc, neededHeight) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + neededHeight > bottom) {
    doc.addPage();
  }
}

function addHeader(doc, title, subtitle) {
  doc.font('Helvetica-Bold').fontSize(24).fillColor('#0F172A').text(title, { align: 'center' });
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(11).fillColor('#475569').text(subtitle, { align: 'center' });
  doc.moveDown(1);
}

function addSection(doc, title) {
  ensurePageSpace(doc, 40);
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(17).fillColor('#1D4ED8').text(title);
  doc.moveDown(0.25);
}

function addSubsection(doc, title) {
  ensurePageSpace(doc, 28);
  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#C2410C').text(title);
  doc.moveDown(0.15);
}

function addParagraph(doc, text) {
  ensurePageSpace(doc, 54);
  doc.font('Helvetica').fontSize(10.5).fillColor('#111827').text(text, {
    align: 'justify',
    lineGap: 3,
  });
  doc.moveDown(0.35);
}

function addBullet(doc, text) {
  ensurePageSpace(doc, 18);
  doc.font('Helvetica').fontSize(10.5).fillColor('#111827').text(`- ${text}`, {
    indent: 12,
    lineGap: 2,
  });
}

function drawClassBox(doc, opts) {
  const { x, y, width, name, attributes = [], methods = [], fill = '#FFFFFF' } = opts;
  const lineHeight = 12;
  const headerHeight = 24;
  const attrHeight = Math.max(attributes.length, 1) * lineHeight + 10;
  const methodHeight = Math.max(methods.length, 1) * lineHeight + 10;
  const totalHeight = headerHeight + attrHeight + methodHeight;

  doc.save();
  doc.roundedRect(x, y, width, totalHeight, 8).fillAndStroke(fill, '#334155');
  doc.fillColor('#E2E8F0').rect(x, y, width, headerHeight).fill();
  doc.strokeColor('#334155').lineWidth(1);
  doc.roundedRect(x, y, width, totalHeight, 8).stroke();
  doc.moveTo(x, y + headerHeight).lineTo(x + width, y + headerHeight).stroke();
  doc.moveTo(x, y + headerHeight + attrHeight).lineTo(x + width, y + headerHeight + attrHeight).stroke();

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text(name, x, y + 7, {
    width,
    align: 'center',
  });

  doc.font('Helvetica').fontSize(9).fillColor('#1F2937');
  const attrText = attributes.length ? attributes.join('\n') : '-';
  doc.text(attrText, x + 8, y + headerHeight + 6, {
    width: width - 16,
    lineGap: 2,
  });

  const methodText = methods.length ? methods.join('\n') : '-';
  doc.text(methodText, x + 8, y + headerHeight + attrHeight + 6, {
    width: width - 16,
    lineGap: 2,
  });
  doc.restore();

  return { x, y, width, height: totalHeight };
}

function drawAssociation(doc, from, to, label, multiplicityFrom, multiplicityTo) {
  const fromX = from.x + from.width;
  const fromY = from.y + from.height / 2;
  const toX = to.x;
  const toY = to.y + to.height / 2;

  doc.save();
  doc.strokeColor('#475569').lineWidth(1.2);
  doc.moveTo(fromX, fromY).lineTo(toX, toY).stroke();

  const angle = Math.atan2(toY - fromY, toX - fromX);
  const arrowSize = 7;
  doc.moveTo(toX, toY);
  doc.lineTo(toX - arrowSize * Math.cos(angle - Math.PI / 6), toY - arrowSize * Math.sin(angle - Math.PI / 6));
  doc.moveTo(toX, toY);
  doc.lineTo(toX - arrowSize * Math.cos(angle + Math.PI / 6), toY - arrowSize * Math.sin(angle + Math.PI / 6));
  doc.stroke();

  if (label) {
    doc.font('Helvetica').fontSize(8).fillColor('#334155').text(label, (fromX + toX) / 2 - 20, (fromY + toY) / 2 - 12, {
      width: 50,
      align: 'center',
    });
  }

  if (multiplicityFrom) {
    doc.font('Helvetica').fontSize(8).fillColor('#334155').text(multiplicityFrom, fromX - 12, fromY - 14);
  }

  if (multiplicityTo) {
    doc.font('Helvetica').fontSize(8).fillColor('#334155').text(multiplicityTo, toX + 4, toY - 14);
  }
  doc.restore();
}

function drawComposition(doc, whole, part, label, multiplicityWhole, multiplicityPart) {
  const fromX = whole.x + whole.width;
  const fromY = whole.y + whole.height / 2;
  const toX = part.x;
  const toY = part.y + part.height / 2;

  doc.save();
  doc.strokeColor('#475569').lineWidth(1.2);
  doc.moveTo(fromX, fromY).lineTo(toX, toY).stroke();

  const diamondX = fromX + 10;
  const diamondY = fromY;
  doc.polygon(
    [fromX, fromY],
    [diamondX, diamondY - 5],
    [diamondX + 10, diamondY],
    [diamondX, diamondY + 5]
  ).fillAndStroke('#475569', '#475569');

  if (label) {
    doc.font('Helvetica').fontSize(8).fillColor('#334155').text(label, (fromX + toX) / 2 - 20, (fromY + toY) / 2 - 12, {
      width: 55,
      align: 'center',
    });
  }

  if (multiplicityWhole) {
    doc.font('Helvetica').fontSize(8).fillColor('#334155').text(multiplicityWhole, fromX + 8, fromY - 14);
  }

  if (multiplicityPart) {
    doc.font('Helvetica').fontSize(8).fillColor('#334155').text(multiplicityPart, toX + 4, toY - 14);
  }
  doc.restore();
}

function generatePdf() {
  const doc = new PDFDocument({ margin: 36, size: 'A4' });
  doc.pipe(fs.createWriteStream(pdfPath));

  addHeader(
    doc,
    'Conception Professionnelle - Louage.tn',
    'Architecture detaillee, diagramme de classes UML et organisation applicative'
  );

  addSection(doc, '1. Vue d ensemble');
  addParagraph(
    doc,
    "Louage.tn est une application mobile de mise en relation entre chauffeurs et passagers pour la publication, la recherche et la reservation de trajets. L architecture adoptee est de type client-serveur. Le client mobile en Expo React Native consomme une API REST Express. Les donnees sont persistees dans MongoDB via Mongoose."
  );
  addBullet(doc, "Presentation mobile: authentification, navigation, consultation des trajets, reservation et notation.");
  addBullet(doc, "Couche API: exposition des routes metier d authentification, trajet, avis et reinitialisation de mot de passe.");
  addBullet(doc, "Couche donnees: modeles User, Trajet et Avis, avec sous-structures DemandeReservation et Reservation.");
  doc.moveDown(0.4);

  addSection(doc, '2. Description des classes metier');

  addSubsection(doc, 'User');
  addBullet(doc, "Attributs: nom, prenom, telephone, email, password, role.");
  addBullet(doc, "Responsabilite: representer un acteur authentifie du systeme.");
  addBullet(doc, "Contraintes: email unique, role limite a passager ou chauffeur.");

  addSubsection(doc, 'Trajet');
  addBullet(doc, "Attributs: chauffeur, depart, arrivee, heure, places, placesInitiales, prix, statut.");
  addBullet(doc, "Associations: contient des demandes de reservation et des reservations confirmees.");
  addBullet(doc, "Responsabilite: agreger toute la gestion de capacite et de reservation d un trajet.");

  addSubsection(doc, 'DemandeReservation');
  addBullet(doc, "Attributs: passager, nom, prenom, telephone, email, status, requestedAt, decidedAt.");
  addBullet(doc, "Responsabilite: memoriser une demande avant sa validation ou son rejet.");

  addSubsection(doc, 'Reservation');
  addBullet(doc, "Attributs: passager, nom, prenom, telephone, email, reservedAt.");
  addBullet(doc, "Responsabilite: representer une place officiellement confirmee.");

  addSubsection(doc, 'Avis');
  addBullet(doc, "Attributs: passager, chauffeur, trajet, note, commentaire.");
  addBullet(doc, "Responsabilite: stocker l evaluation post trajet.");

  doc.addPage({ size: 'A4', layout: 'landscape', margin: 28 });
  addHeader(doc, 'Diagramme de Classes Metier', 'Representation UML professionnelle des principales entites');

  const userBox = drawClassBox(doc, {
    x: 30,
    y: 90,
    width: 190,
    name: 'User',
    attributes: [
      '+ nom: String',
      '+ prenom: String',
      '+ telephone: String',
      '+ email: String',
      '+ password: String',
      '+ role: String',
    ],
    methods: [
      '+ register()',
      '+ login()',
    ],
    fill: '#FFFFFF',
  });

  const trajetBox = drawClassBox(doc, {
    x: 300,
    y: 70,
    width: 215,
    name: 'Trajet',
    attributes: [
      '+ chauffeur: ObjectId',
      '+ depart: String',
      '+ arrivee: String',
      '+ heure: String',
      '+ places: Number',
      '+ placesInitiales: Number',
      '+ prix: Number',
      '+ statut: String',
    ],
    methods: [
      '+ addTrajet()',
      '+ demanderReservation()',
      '+ traiterDemande()',
      '+ updatePlaces()',
      '+ deleteTrajet()',
    ],
    fill: '#FFFFFF',
  });

  const demandeBox = drawClassBox(doc, {
    x: 585,
    y: 40,
    width: 200,
    name: 'DemandeReservation',
    attributes: [
      '+ passager: ObjectId',
      '+ nom: String',
      '+ prenom: String',
      '+ telephone: String',
      '+ email: String',
      '+ status: String',
      '+ requestedAt: Date',
      '+ decidedAt: Date',
    ],
    methods: [
      '+ confirmer()',
      '+ rejeter()',
    ],
    fill: '#FFFFFF',
  });

  const reservationBox = drawClassBox(doc, {
    x: 585,
    y: 285,
    width: 200,
    name: 'Reservation',
    attributes: [
      '+ passager: ObjectId',
      '+ nom: String',
      '+ prenom: String',
      '+ telephone: String',
      '+ email: String',
      '+ reservedAt: Date',
    ],
    methods: [
      '+ creerTicket()',
    ],
    fill: '#FFFFFF',
  });

  const avisBox = drawClassBox(doc, {
    x: 300,
    y: 330,
    width: 215,
    name: 'Avis',
    attributes: [
      '+ passager: ObjectId',
      '+ chauffeur: ObjectId',
      '+ trajet: ObjectId',
      '+ note: Number',
      '+ commentaire: String',
    ],
    methods: [
      '+ addAvis()',
      '+ getAvisByChauffeur()',
    ],
    fill: '#FFFFFF',
  });

  drawAssociation(doc, userBox, trajetBox, 'publie', '1', '0..*');
  drawComposition(doc, trajetBox, demandeBox, 'contient', '1', '0..*');
  drawComposition(doc, trajetBox, reservationBox, 'contient', '1', '0..*');
  drawAssociation(doc, avisBox, userBox, 'redige / recoit', '0..*', '1');

  doc.save();
  doc.strokeColor('#475569').lineWidth(1.2);
  doc.moveTo(407, 330).lineTo(407, 260).lineTo(407, 260).stroke();
  doc.moveTo(407, 260).lineTo(407, 239).stroke();
  doc.font('Helvetica').fontSize(8).fillColor('#334155').text('concerne', 414, 288);
  doc.font('Helvetica').fontSize(8).fillColor('#334155').text('0..*', 390, 320);
  doc.font('Helvetica').fontSize(8).fillColor('#334155').text('1', 390, 242);
  doc.restore();

  doc.font('Helvetica').fontSize(9).fillColor('#475569').text(
    'Lecture: un chauffeur publie plusieurs trajets, un trajet contient des demandes et reservations, et un avis lie un passager, un chauffeur et un trajet.',
    30,
    545,
    { width: 760, align: 'center' }
  );

  doc.addPage({ size: 'A4', layout: 'landscape', margin: 28 });
  addHeader(doc, 'Diagramme de Classes Applicatives', 'Vue couche service, API mobile et controleurs');

  const apiBox = drawClassBox(doc, {
    x: 35,
    y: 110,
    width: 200,
    name: 'ApiMobile',
    attributes: [
      '+ baseURL: String',
      '+ timeout: Number',
    ],
    methods: [
      '+ register(data)',
      '+ login(data)',
      '+ getTrajets(...)',
      '+ addTrajet(data, token)',
      '+ submitReservationRequest(...)',
      '+ decideReservationRequest(...)',
      '+ updatePlaces(...)',
      '+ addAvis(data, token)',
      '+ sendCode(email)',
      '+ verifyCode(email, code)',
      '+ changePassword(...)',
    ],
  });

  const authController = drawClassBox(doc, {
    x: 315,
    y: 50,
    width: 190,
    name: 'AuthController',
    attributes: [
      '+ route: /api/auth',
    ],
    methods: [
      '+ register(req, res)',
      '+ login(req, res)',
    ],
  });

  const trajetController = drawClassBox(doc, {
    x: 315,
    y: 240,
    width: 210,
    name: 'TrajetController',
    attributes: [
      '+ route: /api/trajets',
    ],
    methods: [
      '+ getTrajets(req, res)',
      '+ addTrajet(req, res)',
      '+ demanderReservation(req, res)',
      '+ decideReservationRequest(req, res)',
      '+ updatePlaces(req, res)',
      '+ deleteTrajet(req, res)',
    ],
  });

  const avisController = drawClassBox(doc, {
    x: 590,
    y: 60,
    width: 180,
    name: 'AvisController',
    attributes: [
      '+ route: /api/avis',
    ],
    methods: [
      '+ addAvis(req, res)',
      '+ getAvisByChauffeur(req, res)',
    ],
  });

  const resetController = drawClassBox(doc, {
    x: 580,
    y: 285,
    width: 190,
    name: 'ResetPasswordController',
    attributes: [
      '+ route: /api/reset',
    ],
    methods: [
      '+ sendCode(req, res)',
      '+ verifyCode(req, res)',
      '+ changePassword(req, res)',
    ],
  });

  drawAssociation(doc, apiBox, authController, 'consomme', '1', '1');
  drawAssociation(doc, apiBox, trajetController, 'consomme', '1', '1');
  drawAssociation(doc, apiBox, avisController, 'consomme', '1', '1');
  drawAssociation(doc, apiBox, resetController, 'consomme', '1', '1');

  doc.font('Helvetica').fontSize(9).fillColor('#475569').text(
    "Cette vue montre l organisation applicative: l application mobile centralise les appels HTTP, puis delegue chaque besoin metier au controleur REST approprie.",
    40,
    540,
    { width: 730, align: 'center' }
  );

  doc.addPage();
  addHeader(doc, 'Regles Metier et Conclusion', 'Synthese professionnelle de la conception');
  addSection(doc, 'Regles metier essentielles');
  addBullet(doc, 'L email d un utilisateur doit etre unique.');
  addBullet(doc, 'Seul un passager peut envoyer une demande de reservation.');
  addBullet(doc, 'Seul le chauffeur proprietaire du trajet peut accepter ou rejeter une demande.');
  addBullet(doc, 'Une confirmation cree une reservation et decremente le nombre de places.');
  addBullet(doc, 'Quand le nombre de places atteint zero, le trajet devient complet.');
  addBullet(doc, 'Un passager ne peut laisser un avis que s il a reserve ce trajet.');
  addBullet(doc, 'Un seul avis est autorise par passager pour un trajet donne.');

  addSection(doc, 'Conclusion');
  addParagraph(
    doc,
    "La modelisation retenue est coherente pour un projet academique ou un MVP professionnel. Les classes principales sont peu nombreuses, bien reliees et suffisamment expressives pour couvrir le cycle complet du service. La conception peut evoluer vers une architecture plus modulaire en externalisant les services de ticket PDF, d envoi d emails et le middleware d authentification."
  );

  doc.end();
}

function rtfEscape(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par ');
}

function generateRtf() {
  const content = [
    '{\\rtf1\\ansi\\deff0',
    '{\\fonttbl{\\f0 Arial;}{\\f1 Courier New;}}',
    '{\\colortbl ;\\red15\\green23\\blue42;\\red29\\green78\\blue216;\\red194\\green65\\blue12;\\red71\\green85\\blue105;}',
    '\\paperw11907\\paperh16840\\margl1134\\margr1134\\margt1134\\margb1134',
    '\\fs48\\b\\cf1 Conception Professionnelle - Louage.tn\\b0\\fs22\\par',
    '\\cf4 Architecture detaillee, diagramme de classes UML et organisation applicative\\par\\par',

    '\\fs34\\b\\cf2 1. Vue d ensemble\\b0\\fs22\\cf1\\par',
    `${rtfEscape("Louage.tn est une application mobile de mise en relation entre chauffeurs et passagers pour la publication, la recherche et la reservation de trajets. L architecture adoptee est de type client-serveur. Le client mobile en Expo React Native consomme une API REST Express. Les donnees sont persistees dans MongoDB via Mongoose.")}\\par\\par`,
    `${rtfEscape("- Presentation mobile: authentification, navigation, consultation des trajets, reservation et notation.")}\\par`,
    `${rtfEscape("- Couche API: exposition des routes metier d authentification, trajet, avis et reinitialisation de mot de passe.")}\\par`,
    `${rtfEscape("- Couche donnees: modeles User, Trajet et Avis, avec sous-structures DemandeReservation et Reservation.")}\\par\\par`,

    '\\fs34\\b\\cf2 2. Classes metier\\b0\\fs22\\cf1\\par',
    '\\b\\cf3 User\\b0\\cf1\\par',
    `${rtfEscape("- Attributs: nom, prenom, telephone, email, password, role.")}\\par`,
    `${rtfEscape("- Responsabilite: representer un acteur authentifie du systeme.")}\\par\\par`,
    '\\b\\cf3 Trajet\\b0\\cf1\\par',
    `${rtfEscape("- Attributs: chauffeur, depart, arrivee, heure, places, placesInitiales, prix, statut.")}\\par`,
    `${rtfEscape("- Responsabilite: agreger les demandes et reservations d un trajet.")}\\par\\par`,
    '\\b\\cf3 DemandeReservation\\b0\\cf1\\par',
    `${rtfEscape("- Attributs: passager, nom, prenom, telephone, email, status, requestedAt, decidedAt.")}\\par\\par`,
    '\\b\\cf3 Reservation\\b0\\cf1\\par',
    `${rtfEscape("- Attributs: passager, nom, prenom, telephone, email, reservedAt.")}\\par\\par`,
    '\\b\\cf3 Avis\\b0\\cf1\\par',
    `${rtfEscape("- Attributs: passager, chauffeur, trajet, note, commentaire.")}\\par\\par`,

    '\\fs34\\b\\cf2 3. Diagramme de classes metier\\b0\\fs22\\cf1\\par',
    '\\f1\\fs18',
    `${rtfEscape(
`+--------------------+           +------------------------+           +----------------------+
        User         | 1     0..*|         Trajet         | 1     0..*| DemandeReservation  |
---------------------+----------->+------------------------+<>-------->+----------------------+
nom: String          |            | chauffeur: ObjectId    |           | passager: ObjectId  |
prenom: String       |            | depart: String         |           | nom: String         |
telephone: String    |            | arrivee: String        |           | prenom: String      |
email: String        |            | heure: String          |           | telephone: String   |
password: String     |            | places: Number         |           | email: String       |
role: String         |            | placesInitiales:Number |           | status: String      |
---------------------+            | prix: Number           |           | requestedAt: Date   |
register()           |            | statut: String         |           | decidedAt: Date     |
login()              |            +------------------------+           +----------------------+
---------------------+                     |
                                            | 1
                                            | 0..*
                                            v
                                   +----------------------+
                                   |     Reservation      |
                                   +----------------------+
                                   | passager: ObjectId   |
                                   | nom: String          |
                                   | prenom: String       |
                                   | telephone: String    |
                                   | email: String        |
                                   | reservedAt: Date     |
                                   +----------------------+

                     +----------------------+
                     |         Avis         |
                     +----------------------+
                     | passager: ObjectId   |
                     | chauffeur: ObjectId  |
                     | trajet: ObjectId     |
                     | note: Number         |
                     | commentaire: String  |
                     +----------------------+`)}\\par`,
    '\\f0\\fs22\\par',

    '\\fs34\\b\\cf2 4. Diagramme de classes applicatives\\b0\\fs22\\cf1\\par',
    '\\f1\\fs18',
    `${rtfEscape(
`+------------------------+      +------------------------+
|       ApiMobile        |----->|     AuthController     |
+------------------------+      +------------------------+
| baseURL: String        |      | register(req, res)     |
| timeout: Number        |      | login(req, res)        |
| register(data)         |      +------------------------+
| login(data)            |
| getTrajets(...)        |----->+------------------------+
| addTrajet(...)         |      |    TrajetController    |
| submitRequest(...)     |      +------------------------+
| decideRequest(...)     |      | getTrajets(req, res)   |
| updatePlaces(...)      |      | addTrajet(req, res)    |
| addAvis(...)           |      | demanderReservation()  |
| sendCode(...)          |      | decideReservation()    |
| verifyCode(...)        |      | updatePlaces(req, res) |
| changePassword(...)    |      | deleteTrajet(req, res) |
+------------------------+      +------------------------+
         |                                     
         +--------------------->+------------------------+
         |                      |     AvisController     |
         |                      +------------------------+
         |                      | addAvis(req, res)      |
         |                      | getAvisByChauffeur()   |
         |
         +--------------------->+------------------------+
                                | ResetPasswordController|
                                +------------------------+
                                | sendCode(req, res)     |
                                | verifyCode(req, res)   |
                                | changePassword(req,res)|
                                +------------------------+`)}\\par`,
    '\\f0\\fs22\\par',

    '\\fs34\\b\\cf2 5. Regles metier\\b0\\fs22\\cf1\\par',
    `${rtfEscape("- L email d un utilisateur doit etre unique.")}\\par`,
    `${rtfEscape("- Seul un passager peut envoyer une demande de reservation.")}\\par`,
    `${rtfEscape("- Seul le chauffeur proprietaire du trajet peut accepter ou rejeter une demande.")}\\par`,
    `${rtfEscape("- Une confirmation cree une reservation et decremente le nombre de places.")}\\par`,
    `${rtfEscape("- Quand le nombre de places atteint zero, le trajet devient complet.")}\\par`,
    `${rtfEscape("- Un passager ne peut laisser un avis que s il a reserve ce trajet.")}\\par`,
    `${rtfEscape("- Un seul avis est autorise par passager pour un trajet donne.")}\\par\\par`,

    '\\fs34\\b\\cf2 6. Conclusion\\b0\\fs22\\cf1\\par',
    `${rtfEscape("La modelisation retenue est coherente pour un projet academique ou un MVP professionnel. Les classes principales sont peu nombreuses, bien reliees et suffisamment expressives pour couvrir le cycle complet du service. La conception peut ensuite evoluer vers une architecture plus modulaire en externalisant les services d email, de ticket PDF et d authentification.")}\\par`,
    '}',
  ].join('');

  fs.writeFileSync(rtfPath, content, 'utf8');
}

generatePdf();
generateRtf();

console.log(`PDF genere: ${pdfPath}`);
console.log(`Document Word compatible genere: ${rtfPath}`);
