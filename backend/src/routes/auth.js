const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../utils/firebase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'crownridge_super_secret_jwt_key_2026';

// ============================================================
// PUBLIC: Login User
// - Checks allowedUsers collection before granting access
// - Role is always read from allowedUsers, NOT from user input
// ============================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password' });
  }

  try {
    // Step 1: Check if email is in the allowedUsers whitelist
    const allowedRef = db.collection('allowedUsers');
    const allowedSnap = await allowedRef.where('email', '==', email.toLowerCase()).limit(1).get();

    if (allowedSnap.empty) {
      return res.status(403).json({ error: 'Access denied. Your email is not authorized to use this system.' });
    }

    const allowedDoc = allowedSnap.docs[0];
    const allowedData = allowedDoc.data();

    // Step 2: Check if user status is active
    if (allowedData.status !== 'active') {
      return res.status(403).json({ error: 'Access denied. Your account has been deactivated. Contact your administrator.' });
    }

    // Step 3: Validate credentials from the users collection
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'Invalid email or password. If you were recently approved, contact your administrator to set up your account.' });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Step 4: Use role from allowedUsers (authoritative source), not from users collection
    const authorizedRole = allowedData.role === 'admin' ? 'Administrator' : 'User';

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: authorizedRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: authorizedRole
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ADMIN-ONLY: Register / Create a new user account
// - Requires admin authentication
// - Looks up email in allowedUsers to get pre-assigned role
// - Rejects if email not in allowedUsers or not active
// ============================================================
router.post('/register', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please enter all required fields (name, email, password)' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const normalizedEmail = email.toLowerCase();

    // Step 1: Verify this email is in the allowedUsers whitelist
    const allowedRef = db.collection('allowedUsers');
    const allowedSnap = await allowedRef.where('email', '==', normalizedEmail).limit(1).get();

    if (allowedSnap.empty) {
      return res.status(403).json({ error: 'This email is not in the approved users list. Add it to Allowed Users first.' });
    }

    const allowedData = allowedSnap.docs[0].data();

    if (allowedData.status !== 'active') {
      return res.status(403).json({ error: 'This email is in the approved list but is currently inactive. Activate it first.' });
    }

    // Step 2: Check if user account already exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', normalizedEmail).limit(1).get();

    if (!snapshot.empty) {
      return res.status(400).json({ error: 'A user account with this email already exists' });
    }

    // Step 3: Get role from allowedUsers (never from request body)
    const finalRole = allowedData.role === 'admin' ? 'Administrator' : 'User';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: finalRole,
      createdAt: new Date().toISOString()
    };

    const docRef = await usersRef.add(newUser);
    newUser.id = docRef.id;

    res.status(201).json({
      message: 'User account created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// PROTECTED: Get User Profile
// ============================================================
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = { id: userDoc.id, ...userDoc.data() };
    delete user.password;

    res.json(user);
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ADMIN-ONLY: List all allowed users
// ============================================================
router.get('/allowed-users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('allowedUsers').orderBy('createdAt', 'desc').get();
    const allowedUsers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(allowedUsers);
  } catch (error) {
    console.error('Fetch Allowed Users Error:', error);
    res.status(500).json({ error: 'Failed to fetch allowed users' });
  }
});

// ============================================================
// ADMIN-ONLY: Add a new allowed user entry
// ============================================================
router.post('/allowed-users', authenticateToken, requireAdmin, async (req, res) => {
  const { email, name, role, status } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }

  const normalizedEmail = email.toLowerCase();
  const validRoles = ['admin', 'user'];
  const validStatuses = ['active', 'inactive'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role must be either "admin" or "user"' });
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be either "active" or "inactive"' });
  }

  try {
    // Check if already exists
    const existing = await db.collection('allowedUsers').where('email', '==', normalizedEmail).limit(1).get();
    if (!existing.empty) {
      return res.status(400).json({ error: 'This email is already in the allowed users list' });
    }

    const newEntry = {
      email: normalizedEmail,
      name: name || '',
      role,
      status: status || 'active',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('allowedUsers').add(newEntry);
    res.status(201).json({ id: docRef.id, ...newEntry });
  } catch (error) {
    console.error('Add Allowed User Error:', error);
    res.status(500).json({ error: 'Failed to add allowed user' });
  }
});

// ============================================================
// ADMIN-ONLY: Update an allowed user entry (role/status)
// ============================================================
router.put('/allowed-users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role, status, name } = req.body;

  const validRoles = ['admin', 'user'];
  const validStatuses = ['active', 'inactive'];

  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role must be either "admin" or "user"' });
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be either "active" or "inactive"' });
  }

  try {
    const docRef = db.collection('allowedUsers').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Allowed user not found' });
    }

    const updates = {};
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (name !== undefined) updates.name = name;
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Update Allowed User Error:', error);
    res.status(500).json({ error: 'Failed to update allowed user' });
  }
});

// ============================================================
// ADMIN-ONLY: Delete an allowed user entry
// ============================================================
router.delete('/allowed-users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('allowedUsers').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Allowed user not found' });
    }

    await docRef.delete();
    res.json({ message: 'Allowed user removed successfully' });
  } catch (error) {
    console.error('Delete Allowed User Error:', error);
    res.status(500).json({ error: 'Failed to delete allowed user' });
  }
});

module.exports = router;
