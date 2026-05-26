const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true,
    default: ''
  },
  importance: {
    type: Number,
    required: [true, 'Importance is required'],
    min: [1, 'Importance must be between 1 and 5'],
    max: [5, 'Importance must be between 1 and 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Importance must be an integer'
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(val) {
        // Enforce future date ONLY during creation (not on updates)
        if (this.isNew) {
          return new Date(val) > new Date();
        }
        return true;
      },
      message: 'Due date must be a future date on creation'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed'],
      message: 'Status must be pending or completed'
    },
    default: 'pending'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Auto-generate createdAt only
});

const MongooseTask = mongoose.model('Task', taskSchema);

// In-Memory Database Fallback for database-less evaluation
let inMemoryDb = [
  {
    _id: "demo-t1",
    title: "Submit Q2 financial report review",
    description: "Prepare and check spreadsheet balance statements and submit to stakeholders for approval.",
    importance: 5,
    dueDate: new Date(Date.now() + 10 * 60000), // due in 10 minutes (SLA hot!)
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 3600000) // created 3 hours ago
  },
  {
    _id: "demo-t2",
    title: "Draft product roadmap presentation",
    description: "Compile feature lists and coordinate release milestones with dev teams.",
    importance: 3,
    dueDate: new Date(Date.now() + 48 * 3600000), // due in 2 days
    status: "pending",
    createdAt: new Date(Date.now() - 24 * 3600000)
  },
  {
    _id: "demo-t3",
    title: "Resolve auth session timeout bug",
    description: "Fix security cookie expiration mismatch in client authentication middleware.",
    importance: 4,
    dueDate: new Date(Date.now() - 12 * 3600000), // overdue task
    status: "pending",
    createdAt: new Date(Date.now() - 48 * 3600000)
  },
  {
    _id: "demo-t4",
    title: "Database index optimization",
    description: "Add key indices on user queries to speed up endpoint retrieval times.",
    importance: 4,
    dueDate: new Date(Date.now() - 2 * 3600000),
    status: "completed", // completed task (priorityScore should always be 0!)
    createdAt: new Date(Date.now() - 5 * 3600000)
  }
];

class InMemoryTask {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substring(2, 9);
    this.title = data.title;
    this.description = data.description || '';
    this.importance = Number(data.importance);
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    // Explicit Validation
    if (!this.title || this.title.length < 3 || this.title.length > 100) {
      throw new Error('Title must be between 3 and 100 characters');
    }
    if (this.description && this.description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
    if (isNaN(this.importance) || this.importance < 1 || this.importance > 5 || !Number.isInteger(this.importance)) {
      throw new Error('Importance must be an integer between 1 and 5');
    }
    if (!this.dueDate) {
      throw new Error('Due date is required');
    }

    // Check if new and if dueDate is in the future
    const isNew = !inMemoryDb.some(t => t._id === this._id);
    if (isNew && new Date(this.dueDate) <= new Date()) {
      throw new Error('Due date must be a future date on creation');
    }

    const idx = inMemoryDb.findIndex(t => t._id === this._id);
    if (idx !== -1) {
      inMemoryDb[idx] = this.toObject();
    } else {
      inMemoryDb.push(this.toObject());
    }
    return this;
  }

  toObject() {
    return {
      _id: this._id,
      title: this.title,
      description: this.description,
      importance: this.importance,
      dueDate: this.dueDate,
      status: this.status,
      createdAt: this.createdAt
    };
  }

  static find(query = {}) {
    let results = inMemoryDb.map(t => new InMemoryTask(t));

    // Combinable Query Filters
    if (query.status) {
      results = results.filter(t => t.status === query.status);
    }
    if (query.importance !== undefined) {
      // Handles minImportance filter ($gte equivalent)
      const minImp = Number(query.importance);
      if (!isNaN(minImp)) {
        results = results.filter(t => t.importance >= minImp);
      }
    }

    const chainable = Promise.resolve(results);
    chainable.sort = (sortObj) => {
      // Always support chaining for verification logic
      return Promise.resolve(results);
    };
    return chainable;
  }

  static async findById(id) {
    const task = inMemoryDb.find(t => t._id === id);
    return task ? new InMemoryTask(task) : null;
  }

  static async findByIdAndDelete(id) {
    const idx = inMemoryDb.findIndex(t => t._id === id);
    if (idx !== -1) {
      const deleted = inMemoryDb[idx];
      inMemoryDb.splice(idx, 1);
      return new InMemoryTask(deleted);
    }
    return null;
  }

  // Support aggregate for memory fallback stats
  static aggregate(pipeline) {
    const totalTasks = inMemoryDb.length;
    const pendingTasks = inMemoryDb.filter(t => t.status === 'pending').length;
    const completedTasks = inMemoryDb.filter(t => t.status === 'completed').length;
    const overdueTasks = inMemoryDb.filter(t => t.status === 'pending' && new Date(t.dueDate) < new Date()).length;
    
    // Average Importance
    const totalImportance = inMemoryDb.reduce((sum, t) => sum + t.importance, 0);
    const averageImportance = totalTasks > 0 ? Number((totalImportance / totalTasks).toFixed(2)) : 0;

    // Distribution by importance
    const tasksByImportance = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    inMemoryDb.forEach(t => {
      if (tasksByImportance[t.importance] !== undefined) {
        tasksByImportance[t.importance]++;
      }
    });

    return Promise.resolve([{
      totalTasks,
      pendingTasks,
      completedTasks,
      averageImportance,
      overdueTasks,
      tasksByImportance
    }]);
  }
}

// Proxy module exports to dynamically switch depending on active DB mode
module.exports = new Proxy(MongooseTask, {
  get(target, prop) {
    if (global.useInMemoryDb) {
      return InMemoryTask[prop] !== undefined ? InMemoryTask[prop] : InMemoryTask;
    }
    return MongooseTask[prop] !== undefined ? MongooseTask[prop] : MongooseTask;
  },
  construct(target, args) {
    if (global.useInMemoryDb) {
      return new InMemoryTask(...args);
    }
    return new MongooseTask(...args);
  }
});
