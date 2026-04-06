const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Stocker les codes temporairement
const codes = {};

// Configuration email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// 📧 Envoyer le code par email
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier si l'email existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email non trouvé !' });
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Sauvegarder le code avec expiration 10 minutes
    codes[email] = { code, expiry: Date.now() + 10 * 60 * 1000 };

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: '🔑 Code de réinitialisation - Louage.tn',
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Votre code de vérification est :</p>
        <h1 style="color: #E53935; font-size: 40px;">${code}</h1>
        <p>Ce code expire dans <b>10 minutes</b>.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
    });

    res.json({ message: '✅ Code envoyé par email !' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
});

// 🔢 Vérifier le code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!codes[email]) {
      return res.status(400).json({ message: 'Aucun code envoyé !' });
    }

    if (codes[email].expiry < Date.now()) {
      delete codes[email];
      return res.status(400).json({ message: 'Code expiré !' });
    }

    if (codes[email].code !== code) {
      return res.status(400).json({ message: 'Code incorrect !' });
    }

    res.json({ message: '✅ Code correct !' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
});

// 🔑 Changer le mot de passe
router.post('/change-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!codes[email] || codes[email].code !== code) {
      return res.status(400).json({ message: 'Code invalide !' });
    }

    // Crypter le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Supprimer le code
    delete codes[email];

    res.json({ message: '✅ Mot de passe modifié avec succès !' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
});

module.exports = router;