const express = require('express');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const router = express.Router();
const Trajet = require('../models/Trajet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Non autorise' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function normalizeTrajet(trajet) {
  const data = trajet.toObject ? trajet.toObject() : trajet;
  const confirmedDemandes = (data.demandes || []).filter((item) => item.status === 'confirmed').length;
  if (!data.placesInitiales) {
    data.placesInitiales = Math.max(data.places + confirmedDemandes, 1);
  }
  return data;
}

function createTicketPdf(ticket) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(22).fillColor('#D62828').text('Ticket Louage.tn');
    doc.moveDown();
    doc.fontSize(12).fillColor('#222222');
    doc.text(`Numero: ${ticket.numero}`);
    doc.text(`Passager: ${ticket.passager}`);
    doc.text(`Trajet: ${ticket.depart} -> ${ticket.arrivee}`);
    doc.text(`Heure: ${ticket.heure}`);
    doc.text(`Prix: ${ticket.prix} DT`);
    doc.text(`Chauffeur: ${ticket.chauffeur}`);
    doc.text(`Telephone chauffeur: ${ticket.telephoneChauffeur}`);
    doc.text(`Date de confirmation: ${ticket.dateConfirmation}`);
    doc.text(`Places restantes: ${ticket.placesRestantes}`);
    doc.moveDown();
    doc.text('Merci d avoir choisi Louage.tn.');
    doc.end();
  });
}

async function sendTicketEmail(ticket) {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD || !ticket.emailPassager) {
    return { sent: false, reason: 'configuration email manquante' };
  }

  const pdfBuffer = await createTicketPdf(ticket);

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: ticket.emailPassager,
    subject: 'Votre ticket Louage.tn',
    html: `
      <h2>Reservation confirmee</h2>
      <p>Bonjour ${ticket.passager},</p>
      <p>Votre chauffeur a confirme votre place pour le trajet <b>${ticket.depart} -> ${ticket.arrivee}</b>.</p>
      <p>Vous trouverez votre ticket PDF en piece jointe.</p>
    `,
    attachments: [
      {
        filename: `ticket-${ticket.numero}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  return { sent: true };
}

router.get('/', async (req, res) => {
  try {
    const { depart, arrivee, includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { statut: 'actif' };
    if (depart) filter.depart = new RegExp(depart, 'i');
    if (arrivee) filter.arrivee = new RegExp(arrivee, 'i');

    const trajets = await Trajet.find(filter).populate('chauffeur', 'nom prenom telephone');
    res.json(trajets.map(normalizeTrajet));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { depart, arrivee, heure, places, prix } = req.body;
    const trajet = new Trajet({
      chauffeur: req.user.id,
      depart,
      arrivee,
      heure,
      places,
      placesInitiales: places,
      prix,
    });
    await trajet.save();
    res.status(201).json({ message: 'Trajet ajoute', trajet: normalizeTrajet(trajet) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.post('/:id/demander', auth, async (req, res) => {
  try {
    if (req.user.role !== 'passager') {
      return res.status(403).json({ message: 'Seul un passager peut envoyer une demande' });
    }

    const trajet = await Trajet.findById(req.params.id).populate('chauffeur', 'nom prenom telephone');
    if (!trajet) {
      return res.status(404).json({ message: 'Trajet introuvable' });
    }

    const passager = await User.findById(req.user.id);
    if (!passager) {
      return res.status(404).json({ message: 'Passager introuvable' });
    }

    const existing = trajet.demandes.find((item) => item.passager.toString() === req.user.id);
    if (existing && existing.status === 'pending') {
      return res.status(400).json({ message: 'Votre demande est deja en attente' });
    }
    if (existing && existing.status === 'confirmed') {
      return res.status(400).json({ message: 'Votre reservation est deja confirmee' });
    }

    if (existing && existing.status === 'rejected') {
      existing.status = 'pending';
      existing.requestedAt = new Date();
      existing.decidedAt = undefined;
      existing.nom = passager.nom;
      existing.prenom = passager.prenom;
      existing.telephone = passager.telephone;
      existing.email = passager.email;
    } else {
      trajet.demandes.push({
        passager: passager._id,
        nom: passager.nom,
        prenom: passager.prenom,
        telephone: passager.telephone,
        email: passager.email,
        status: 'pending',
      });
    }

    await trajet.save();

    res.status(201).json({
      message: 'Demande envoyee au chauffeur',
      trajet: normalizeTrajet(trajet),
      chauffeurTelephone: trajet.chauffeur?.telephone || '',
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.patch('/:id/demandes/:passagerId', auth, async (req, res) => {
  try {
    const { decision } = req.body;
    const trajet = await Trajet.findById(req.params.id).populate('chauffeur', 'nom prenom telephone');
    if (!trajet) {
      return res.status(404).json({ message: 'Trajet introuvable' });
    }

    if (trajet.chauffeur._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Seul le chauffeur peut traiter cette demande' });
    }

    const demande = trajet.demandes.find((item) => item.passager.toString() === req.params.passagerId);
    if (!demande) {
      return res.status(404).json({ message: 'Demande introuvable' });
    }

    if (demande.status !== 'pending') {
      return res.status(400).json({ message: 'Cette demande a deja ete traitee' });
    }

    if (decision === 'accept') {
      if (trajet.places <= 0) {
        return res.status(400).json({ message: 'Plus de places disponibles' });
      }

      demande.status = 'confirmed';
      demande.decidedAt = new Date();
      trajet.reservations.push({
        passager: demande.passager,
        nom: demande.nom,
        prenom: demande.prenom,
        telephone: demande.telephone,
        email: demande.email,
        reservedAt: new Date(),
      });
      trajet.places -= 1;
      if (trajet.places === 0) {
        trajet.statut = 'complet';
      }

      await trajet.save();

      const ticket = {
        numero: `${trajet._id.toString().slice(-6).toUpperCase()}-${trajet.reservations.length}`,
        passager: `${demande.nom} ${demande.prenom}`,
        emailPassager: demande.email,
        depart: trajet.depart,
        arrivee: trajet.arrivee,
        heure: trajet.heure,
        prix: trajet.prix,
        chauffeur: `${trajet.chauffeur?.nom || ''} ${trajet.chauffeur?.prenom || ''}`.trim(),
        telephoneChauffeur: trajet.chauffeur?.telephone || '',
        dateConfirmation: new Date().toLocaleString(),
        placesRestantes: trajet.places,
      };

      let emailStatus = { sent: false, reason: 'email non envoye' };
      try {
        emailStatus = await sendTicketEmail(ticket);
      } catch (mailError) {
        emailStatus = { sent: false, reason: mailError.message };
      }

      return res.json({
        message: 'Reservation confirmee',
        trajet: normalizeTrajet(trajet),
        ticket,
        emailStatus,
      });
    }

    if (decision === 'reject') {
      demande.status = 'rejected';
      demande.decidedAt = new Date();
      await trajet.save();
      return res.json({
        message: 'Reservation refusee',
        trajet: normalizeTrajet(trajet),
      });
    }

    return res.status(400).json({ message: 'Decision invalide' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.patch('/:id/places', auth, async (req, res) => {
  try {
    const { action } = req.body;
    const trajet = await Trajet.findById(req.params.id).populate('chauffeur', 'nom prenom telephone');
    if (!trajet) {
      return res.status(404).json({ message: 'Trajet introuvable' });
    }

    if (trajet.chauffeur._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Seul le chauffeur peut modifier les places' });
    }

    if (action === 'increase') {
      trajet.places += 1;
      trajet.placesInitiales = Math.max(trajet.placesInitiales || 0, trajet.places);
      trajet.statut = 'actif';
    } else if (action === 'decrease') {
      if (trajet.places <= 0) {
        return res.status(400).json({ message: 'Le trajet est deja a zero place' });
      }
      trajet.places -= 1;
      if (trajet.places === 0) {
        trajet.statut = 'complet';
      }
    } else {
      return res.status(400).json({ message: 'Action invalide' });
    }

    await trajet.save();
    res.json({ message: 'Places mises a jour', trajet: normalizeTrajet(trajet) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Trajet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trajet supprime' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
