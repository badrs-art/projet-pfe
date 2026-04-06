const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
  passager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trajet: { type: mongoose.Schema.Types.ObjectId, ref: 'Trajet', required: true },
  note: { type: Number, min: 1, max: 5, required: true },
  commentaire: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Avis', avisSchema);