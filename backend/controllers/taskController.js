const Task = require('../models/task');

/**
 * Helper to compute derived priorityScore for a single task
 */
const computePriorityScore = (task) => {
  if (task.status === 'completed') {
    return {
      ...task.toObject ? task.toObject() : task,
      priorityScore: 0.00
    };
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  
  // Calculate difference in milliseconds
  const diffTime = dueDate.getTime() - now.getTime();
  
  // Convert to full days, rounded down
  let daysUntilDue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Apply floor of 1 day to avoid division by zero or negative days division
  if (daysUntilDue < 1) {
    daysUntilDue = 1;
  }

  // Formula: (importance * 10) + (100 / daysUntilDue)
  const score = (task.importance * 10) + (100 / daysUntilDue);
  const roundedScore = Number(score.toFixed(2));

  return {
    ...task.toObject ? task.toObject() : task,
    priorityScore: roundedScore
  };
};

// @desc    Create a task
// @route   POST /api/bfhl/tasks
// @access  Public
exports.createTask = async (req, res) => {
  try {
    const { title, description, importance, dueDate } = req.body;

    // Direct validation checks for nice 400 error responses
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (title.length < 3) return res.status(400).json({ error: 'Title must be at least 3 characters long' });
    if (!importance) return res.status(400).json({ error: 'Importance is required' });
    
    const impNum = Number(importance);
    if (isNaN(impNum) || impNum < 1 || impNum > 5 || !Number.isInteger(impNum)) {
      return res.status(400).json({ error: 'Importance must be an integer between 1 and 5' });
    }

    if (!dueDate) return res.status(400).json({ error: 'Due date is required' });
    if (new Date(dueDate) <= new Date()) {
      return res.status(400).json({ error: 'Due date must be a future date on creation' });
    }

    const task = new Task({
      title,
      description,
      importance: impNum,
      dueDate,
      status: 'pending'
    });

    await task.save();
    res.status(201).json(computePriorityScore(task));
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get all tasks with filters, sorted by priorityScore DESC
// @route   GET /api/bfhl/tasks
// @access  Public
exports.listTasks = async (req, res) => {
  try {
    const { status, minImportance } = req.query;

    // Build database query
    const dbQuery = {};
    if (status) {
      dbQuery.status = status;
    }
    if (minImportance !== undefined) {
      const minImp = Number(minImportance);
      if (!isNaN(minImp)) {
        // In Mongoose it translates to $gte, in Memory model we manually check importance >= minImp
        dbQuery.importance = global.useInMemoryDb ? minImp : { $gte: minImp };
      }
    }

    const tasks = await Task.find(dbQuery);

    // Compute priorityScore dynamically for all matched tasks
    const mappedTasks = tasks.map(computePriorityScore);

    // Sort by priorityScore in descending order
    mappedTasks.sort((a, b) => b.priorityScore - a.priorityScore);

    res.json(mappedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update a task (PATCH)
// @route   PATCH /api/bfhl/tasks/:id
// @access  Public
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const editableFields = ['title', 'description', 'importance', 'dueDate', 'status'];
    
    // Apply updates
    editableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    res.json(computePriorityScore(task));
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/bfhl/tasks/:id
// @access  Public
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get aggregate analytics (Bonus Aggregation Pipeline)
// @route   GET /api/bfhl/tasks/stats
// @access  Public
exports.getStats = async (req, res) => {
  try {
    // If in memory fallback, use simple mock aggregator
    if (global.useInMemoryDb) {
      const stats = await Task.aggregate();
      return res.json(stats[0]);
    }

    // MongoDB Aggregation Framework Pipeline
    const aggregationResult = await Task.aggregate([
      {
        $facet: {
          coreStats: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                },
                averageImportance: { $avg: "$importance" },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "pending"] },
                          { $lt: ["$dueDate", new Date()] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          importanceCounts: [
            {
              $group: {
                _id: "$importance",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const facet = aggregationResult[0];
    const core = facet.coreStats[0] || {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      averageImportance: 0,
      overdueTasks: 0
    };

    // Format tasksByImportance object
    const tasksByImportance = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    if (facet.importanceCounts) {
      facet.importanceCounts.forEach(item => {
        if (tasksByImportance[item._id] !== undefined) {
          tasksByImportance[item._id] = item.count;
        }
      });
    }

    res.json({
      totalTasks: core.totalTasks,
      pendingTasks: core.pendingTasks,
      completedTasks: core.completedTasks,
      averageImportance: core.averageImportance ? Number(core.averageImportance.toFixed(2)) : 0.00,
      overdueTasks: core.overdueTasks,
      tasksByImportance
    });
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};
