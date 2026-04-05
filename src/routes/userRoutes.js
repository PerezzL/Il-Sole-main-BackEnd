const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const {
  authenticateToken,
  requireAdmin,
  requireRole,
  requireSelfOrAdmin,
} = require('../middleware/auth');

router.post('/', authenticateToken, requireRole(['admin']), userController.createUser);
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, requireSelfOrAdmin, userController.getUserById);
router.put('/:id', authenticateToken, requireRole(['admin']), userController.updateUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router;
