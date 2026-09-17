const express = require('express');
const router  = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

// ─── Task Routes ──────────────────────────────────────────────────────────────
// Base path: /api/tasks  (mounted in server.js)

router.post('/',     createTask);    // POST   /api/tasks
router.get('/',      getAllTasks);   // GET    /api/tasks
router.get('/:id',   getTaskById);  // GET    /api/tasks/:id
router.put('/:id',   updateTask);   // PUT    /api/tasks/:id
router.delete('/:id', deleteTask);  // DELETE /api/tasks/:id

module.exports = router;
