const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trajets', require('./routes/trajets'));
app.use('/api/avis', require('./routes/avis'));
app.use('/api/reset', require('./routes/resetPassword'));
// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté !');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log('❌ Erreur MongoDB:', err));