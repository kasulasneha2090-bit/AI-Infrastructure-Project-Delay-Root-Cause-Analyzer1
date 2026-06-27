const express = require('express');
const { db } = require('../utils/firebase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const snapshot = await db.collection('templates').orderBy('createdAt', 'desc').get();
    const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(templates);
  } catch (error) {
    console.error('Fetch Templates Error:', error);
    res.status(500).json({ error: 'Failed to fetch templates.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  const { title, weather, labour, material, equipment, approval } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Template title is required.' });
  }

  try {
    const templateData = {
      title,
      weather: weather || '',
      labour: labour || '',
      material: material || '',
      equipment: equipment || '',
      approval: approval || '',
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('templates').add(templateData);

    res.status(201).json({ id: docRef.id, ...templateData });
  } catch (error) {
    console.error('Create Template Error:', error);
    res.status(500).json({ error: 'Failed to create template.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  try {
    const docRef = db.collection('templates').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    await docRef.delete();
    res.json({ message: 'Template deleted successfully.' });
  } catch (error) {
    console.error('Delete Template Error:', error);
    res.status(500).json({ error: 'Failed to delete template.' });
  }
});

module.exports = router;
