// Legacy compatibility: re-export Firestore db from firebase.js
// All new code should import from '../utils/firebase' directly.
const { db } = require('./firebase');

module.exports = db;
