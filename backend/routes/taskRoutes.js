const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Stats endpoint (MUST be above /:id to avoid path capturing)
router.get('/stats', taskController.getStats);

// List and Create
router.get('/', taskController.listTasks);
router.post('/', taskController.createTask);

// Update and Delete
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
