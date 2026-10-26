// Hardcoded task data - simulating a database
let tasks = [
  {
    id: 1,
    title: "Set up project Zainab",
    description: "Create backend and frontend folder structure",
    status: "done",
    priority: "high",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T12:00:00.000Z"
  },
  {
    id: 2,
    title: "Implement REST API endpoints",
    description: "Create GET, POST, PUT, DELETE endpoints for tasks",
    status: "in-progress",
    priority: "high",
    createdAt: "2024-01-16T09:00:00.000Z",
    updatedAt: "2024-01-16T11:30:00.000Z"
  },
  {
    id: 3,
    title: "Build React frontend components",
    description: "Create TaskList, TaskForm, and TaskItem components",
    status: "todo",
    priority: "medium",
    createdAt: "2024-01-17T14:00:00.000Z",
    updatedAt: "2024-01-17T14:00:00.000Z"
  },
  {
    id: 4,
    title: "Add unit and integration tests",
    description: "Write tests for backend API and frontend components",
    status: "todo",
    priority: "medium",
    createdAt: "2024-01-18T10:00:00.000Z",
    updatedAt: "2024-01-18T10:00:00.000Z"
  },
  {
    id: 5,
    title: "Deploy application",
    description: "Deploy backend and frontend to production",
    status: "todo",
    priority: "low",
    createdAt: "2024-01-19T16:00:00.000Z",
    updatedAt: "2024-01-19T16:00:00.000Z"
  }
];

let nextId = 6;

// Get all tasks
const getAllTasks = () => {
  return [...tasks];
};

// Get task by ID
const getTaskById = (id) => {
  return tasks.find(task => task.id === id) || null;
};

// Create new task
const createTask = (taskData) => {
  const newTask = {
    id: nextId++,
    title: taskData.title,
    description: taskData.description || "",
    status: taskData.status || "todo",
    priority: taskData.priority || "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tasks.push(newTask);
  return newTask;
};

// Update task
const updateTask = (id, taskData) => {
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return null;
  
  tasks[index] = {
    ...tasks[index],
    ...taskData,
    id: tasks[index].id, // Prevent ID change
    createdAt: tasks[index].createdAt, // Preserve creation date
    updatedAt: new Date().toISOString()
  };
  return tasks[index];
};

// Delete task
const deleteTask = (id) => {
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return false;
  
  tasks.splice(index, 1);
  return true;
};

// Reset data to initial state (useful for testing)
const resetTasks = () => {
  tasks = [
    {
      id: 1,
      title: "Set up project structure",
      description: "Create backend and frontend folder structure",
      status: "done",
      priority: "high",
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-15T12:00:00.000Z"
    },
    {
      id: 2,
      title: "Implement REST API endpoints",
      description: "Create GET, POST, PUT, DELETE endpoints for tasks",
      status: "in-progress",
      priority: "high",
      createdAt: "2024-01-16T09:00:00.000Z",
      updatedAt: "2024-01-16T11:30:00.000Z"
    },
    {
      id: 3,
      title: "Build React frontend components",
      description: "Create TaskList, TaskForm, and TaskItem components",
      status: "todo",
      priority: "medium",
      createdAt: "2024-01-17T14:00:00.000Z",
      updatedAt: "2024-01-17T14:00:00.000Z"
    },
    {
      id: 4,
      title: "Add unit and integration tests",
      description: "Write tests for backend API and frontend components",
      status: "todo",
      priority: "medium",
      createdAt: "2024-01-18T10:00:00.000Z",
      updatedAt: "2024-01-18T10:00:00.000Z"
    },
    {
      id: 5,
      title: "Deploy application",
      description: "Deploy backend and frontend to production",
      status: "todo",
      priority: "low",
      createdAt: "2024-01-19T16:00:00.000Z",
      updatedAt: "2024-01-19T16:00:00.000Z"
    }
  ];
  nextId = 6;
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  resetTasks
};
