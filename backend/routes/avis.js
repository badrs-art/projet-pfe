const express = require('express');
const router = express.Router();
const Avis = require('../models/Avis');
const Trajet = require('../models/Trajet');
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

router.post('/', auth, async (req, res) => {
  try {
    const { chauffeur, trajet, note, commentaire } = req.body;

    if (!chauffeur || !trajet || !note) {
      return res.status(400).json({ message: 'Chauffeur, trajet et note sont obligatoires' });
    }

    const trajetExistant = await Trajet.findById(trajet);
    if (!trajetExistant) {
      return res.status(404).json({ message: 'Trajet introuvable' });
    }

    const reservation = trajetExistant.reservations.find(
      (item) => item.passager.toString() === req.user.id
    );
    if (!reservation) {
      return res.status(403).json({ message: 'Vous devez reserver ce trajet avant de laisser un avis' });
    }

    const avisExistant = await Avis.findOne({ passager: req.user.id, trajet });
    if (avisExistant) {
      return res.status(400).json({ message: 'Vous avez deja laisse un avis pour ce trajet' });
    }

    const avis = new Avis({ passager: req.user.id, chauffeur, trajet, note, commentaire });
    await avis.save();
    res.status(201).json({ message: 'Avis ajoute' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

router.get('/:chauffeurId', async (req, res) => {
  try {
    const avis = await Avis.find({ chauffeur: req.params.chauffeurId }).populate('passager', 'nom prenom');
    const moyenne = avis.length > 0
      ? (avis.reduce((sum, item) => sum + item.note, 0) / avis.length).toFixed(1)
      : 0;

    res.json({ avis, moyenne, total: avis.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
