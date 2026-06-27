const express = require('express');
const { db } = require('../utils/firebase');
const { generateDelayAnalysis } = require('../utils/ai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', authenticateToken, async (req, res) => {
  const {
    projectName,
    projectId,
    location,
    weather,
    labour,
    material,
    equipment,
    approval,
    delayDuration,
    severity,
    notes
  } = req.body;

  if (!projectName || !projectId || !location || !weather || !labour || !material || !equipment || !approval || !delayDuration || !severity) {
    return res.status(400).json({ error: 'All fields except additional notes are required.' });
  }

  try {
    const aiReport = await generateDelayAnalysis({
      projectName,
      projectId,
      location,
      weather,
      labour,
      material,
      equipment,
      approval,
      delayDuration,
      severity,
      notes
    });

    const reportData = {
      userId: req.user.id,
      projectName,
      projectId,
      location,
      weather,
      labour,
      material,
      equipment,
      approval,
      delayDuration,
      severity,
      notes: notes || '',
      aiResponse: JSON.stringify(aiReport),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('reports').add(reportData);

    res.status(201).json({
      id: docRef.id,
      ...reportData,
      aiResponse: aiReport
    });
  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate delay analysis report.' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const { search, startDate, endDate } = req.query;

  try {
    let reportsRef = db.collection('reports');
    
    if (req.user.role !== 'Administrator') {
      reportsRef = reportsRef.where('userId', '==', req.user.id);
    }

    const snapshot = await reportsRef.get();
    let reports = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const report = { id: doc.id, ...data };
      
      // Simulate relational joins
      const userDoc = await db.collection('users').doc(data.userId).get();
      if (userDoc.exists) {
        report.user = { name: userDoc.data().name, email: userDoc.data().email };
      }

      const feedbackSnap = await db.collection('feedback').where('reportId', '==', doc.id).get();
      if (!feedbackSnap.empty) {
         report.feedback = feedbackSnap.docs[0].data();
      }

      report.aiResponse = JSON.parse(report.aiResponse || '{}');
      reports.push(report);
    }

    // In-memory filter/sort for NoSQL
    if (search) {
      const q = search.toLowerCase();
      reports = reports.filter(r => 
        (r.projectName && r.projectName.toLowerCase().includes(q)) ||
        (r.projectId && r.projectId.toLowerCase().includes(q)) ||
        (r.location && r.location.toLowerCase().includes(q))
      );
    }

    if (startDate) {
      const sDate = new Date(startDate);
      reports = reports.filter(r => new Date(r.createdAt) >= sDate);
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      reports = reports.filter(r => new Date(r.createdAt) <= eDate);
    }

    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(reports);
  } catch (error) {
    console.error('Fetch Reports Error:', error);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const docRef = db.collection('reports').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const report = { id: doc.id, ...doc.data() };

    if (req.user.role !== 'Administrator' && report.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this report.' });
    }

    const userDoc = await db.collection('users').doc(report.userId).get();
    if (userDoc.exists) {
      report.user = { name: userDoc.data().name, email: userDoc.data().email };
    }

    const feedbackSnap = await db.collection('feedback').where('reportId', '==', doc.id).get();
    if (!feedbackSnap.empty) {
      report.feedback = feedbackSnap.docs[0].data();
    }

    report.aiResponse = JSON.parse(report.aiResponse || '{}');

    res.json(report);
  } catch (error) {
    console.error('Fetch Report Detail Error:', error);
    res.status(500).json({ error: 'Failed to fetch report details.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const docRef = db.collection('reports').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const report = doc.data();
    if (req.user.role !== 'Administrator' && report.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this report.' });
    }

    await docRef.delete();
    res.json({ message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(500).json({ error: 'Failed to delete report.' });
  }
});

module.exports = router;
