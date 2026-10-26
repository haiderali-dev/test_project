const express = require("express");
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require("../data/tasks");

const VALID_STATUSES = ["todo", "in-progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

// Validation middleware for POST (create) - title is required
const validateTaskCreate = (req, res, next) => {
  const { title, status, priority } = req.body;
  
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required and must be a non-empty string" });
  }
  
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
  }
  
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` });
  }
  
  next();
};

// Validation middleware for PUT (full update) - title is required if provided
const validateTaskUpdate = (req, res, next) => {
  const { title, status, priority } = req.body;
  
  // Title is optional for PUT but if provided, must be non-empty
  if (title !== undefined && (!title || typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }
  
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
  }
  
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` });
  }
  
  next();
};

// GET /api/tasks - Get all tasks with optional filtering
router.get("/", (req, res) => {
  try {
    let tasks = getAllTasks();
    
    // Filter by status
    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      tasks = tasks.filter(task => task.status === req.query.status);
    }
    
    // Filter by priority
    if (req.query.priority) {
      if (!VALID_PRIORITIES.includes(req.query.priority)) {
        return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` });
      }
      tasks = tasks.filter(task => task.priority === req.query.priority);
    }
    
    // Sort by createdAt (newest first by default)
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    
    tasks.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
      if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
      return 0;
    });
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/tasks/:id - Get single task
router.get("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    
    const task = getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/tasks - Create new task
router.post("/", validateTaskCreate, (req, res) => {
  try {
    const taskData = {
      title: req.body.title.trim(),
      description: req.body.description?.trim() || "",
      status: req.body.status || "todo",
      priority: req.body.priority || "medium"
    };
    
    const newTask = createTask(taskData);
    
    res.status(201).json({
      success: true,
      data: newTask
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/tasks/:id - Update task
router.put("/:id", validateTaskUpdate, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    
    const taskData = {
      title: req.body.title?.trim(),
      description: req.body.description?.trim(),
      status: req.body.status,
      priority: req.body.priority
    };
    
    // Remove undefined fields
    Object.keys(taskData).forEach(key => taskData[key] === undefined && delete taskData[key]);
    
    const updatedTask = updateTask(id, taskData);
    
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/tasks/:id - Partially update task
router.patch("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    
    // Validate only provided fields
    const { status, priority } = req.body;
    
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
    }
    
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` });
    }
    
    if (req.body.title !== undefined && (!req.body.title || typeof req.body.title !== "string" || req.body.title.trim() === "")) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    
    const taskData = {};
    if (req.body.title !== undefined) taskData.title = req.body.title.trim();
    if (req.body.description !== undefined) taskData.description = req.body.description.trim();
    if (req.body.status !== undefined) taskData.status = req.body.status;
    if (req.body.priority !== undefined) taskData.priority = req.body.priority;
    
    const updatedTask = updateTask(id, taskData);
    
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    
    const deleted = deleteTask(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;