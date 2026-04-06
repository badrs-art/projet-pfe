const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema(
  {
    passager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String },
    email: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
    decidedAt: { type: Date },
  },
  { _id: false }
);

const reservationSchema = new mongoose.Schema(
  {
    passager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String },
    email: { type: String },
    reservedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const trajetSchema = new mongoose.Schema(
  {
    chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    depart: { type: String, required: true },
    arrivee: { type: String, required: true },
    heure: { type: String, required: true },
    places: { type: Number, required: true, min: 0 },
    placesInitiales: {
      type: Number,
      required: true,
      min: 1,
      default: function () {
        return this.places;
      },
    },
    prix: { type: Number, required: true },
    demandes: { type: [demandeSchema], default: [] },
    reservations: { type: [reservationSchema], default: [] },
    statut: { type: String, enum: ['actif', 'complet', 'annule'], default: 'actif' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trajet', trajetSchema);
