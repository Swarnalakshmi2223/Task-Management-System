const mongoose = require('mongoose');

// ─── Task Schema Definition ───────────────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    // Title of the task — short summary, cannot be empty
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },

    // Detailed description of the task
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    // Priority level — only Low, Medium, or High are allowed
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
    },

    // Due date for completing the task
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },

    // Current progress status of the task
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: 'Status must be Pending, In Progress, or Completed',
      },
      default: 'Pending',
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// ─── Export the Model ─────────────────────────────────────────────────────────
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
