const express = require('express');
const { db } = require('../utils/firebase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { reportId, rating, like, comment } = req.body;

  if (!reportId || rating === undefined || like === undefined) {
    return res.status(400).json({ error: 'Missing required feedback fields.' });
  }

  try {
    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (req.user.role !== 'Administrator' && reportDoc.data().userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to submit feedback for this report.' });
    }

    // Check if feedback already exists
    const existingSnap = await db.collection('feedback').where('reportId', '==', reportId).get();
    if (!existingSnap.empty) {
      return res.status(400).json({ error: 'Feedback already submitted for this report.' });
    }

    const feedbackData = {
      reportId,
      rating,
      like,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('feedback').add(feedbackData);

    res.status(201).json({
      id: docRef.id,
      ...feedbackData
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ error: 'Unauthorized. Admins only.' });
  }

  try {
    const snapshot = await db.collection('feedback').orderBy('createdAt', 'desc').get();
    const feedbacks = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const feedback = { id: doc.id, ...data };
      
      const reportDoc = await db.collection('reports').doc(data.reportId).get();
      if (reportDoc.exists) {
        feedback.report = {
          projectName: reportDoc.data().projectName,
          projectId: reportDoc.data().projectId,
          severity: reportDoc.data().severity
        };
      }
      feedbacks.push(feedback);
    }

    res.json(feedbacks);
  } catch (error) {
    console.error('Fetch Feedback Error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});

module.exports = router;
