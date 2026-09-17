const Task = require('../models/Task');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;

    // Basic manual validation — check required fields are present
    if (!title || !description || !priority || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, priority, and dueDate',
      });
    }

    // Create and save the new task (Mongoose will also run schema validation)
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      status: status || 'Pending', // default to Pending if not provided
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    // Handle Mongoose validation errors (e.g. invalid enum value)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    // Fetch all tasks, newest first
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // Task not found in database
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a task by ID
// @route   PUT /api/tasks/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;

    // Find the task first to confirm it exists
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Update only the fields that were sent in the request body
    if (title !== undefined)       task.title       = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined)    task.priority    = priority;
    if (dueDate !== undefined)     task.dueDate     = dueDate;
    if (status !== undefined)      task.status      = status;

    // Save runs Mongoose validation on the updated values
    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a task by ID
// @route   DELETE /api/tasks/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ─── Export all controller functions ─────────────────────────────────────────
module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
