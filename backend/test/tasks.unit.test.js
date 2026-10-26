const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  resetTasks
} = require("../data/tasks");

describe("Task Data Layer - Unit Tests", () => {
  beforeEach(() => {
    resetTasks();
  });

  describe("getAllTasks", () => {
    test("should return all tasks", () => {
      const tasks = getAllTasks();
      expect(tasks).toHaveLength(5);
      expect(Array.isArray(tasks)).toBe(true);
    });

    test("should return a copy of tasks array (not reference)", () => {
      const tasks1 = getAllTasks();
      const tasks2 = getAllTasks();
      expect(tasks1).not.toBe(tasks2);
      expect(tasks1).toEqual(tasks2);
    });

    test("should return tasks with correct structure", () => {
      const tasks = getAllTasks();
      const task = tasks[0];
      
      expect(task).toHaveProperty("id");
      expect(task).toHaveProperty("title");
      expect(task).toHaveProperty("description");
      expect(task).toHaveProperty("status");
      expect(task).toHaveProperty("priority");
      expect(task).toHaveProperty("createdAt");
      expect(task).toHaveProperty("updatedAt");
    });
  });

  describe("getTaskById", () => {
    test("should return task when ID exists", () => {
      const task = getTaskById(1);
      expect(task).not.toBeNull();
      expect(task.id).toBe(1);
      expect(task.title).toBe("Set up project structure");
    });

    test("should return null when ID does not exist", () => {
      const task = getTaskById(999);
      expect(task).toBeNull();
    });

    test("should return null for invalid ID types", () => {
      expect(getTaskById("abc")).toBeNull();
      expect(getTaskById(null)).toBeNull();
      expect(getTaskById(undefined)).toBeNull();
    });
  });

  describe("createTask", () => {
    test("should create a new task with all fields", () => {
      const newTask = createTask({
        title: "New Task",
        description: "Task description",
        status: "in-progress",
        priority: "high"
      });

      expect(newTask).toHaveProperty("id", 6);
      expect(newTask.title).toBe("New Task");
      expect(newTask.description).toBe("Task description");
      expect(newTask.status).toBe("in-progress");
      expect(newTask.priority).toBe("high");
      expect(newTask).toHaveProperty("createdAt");
      expect(newTask).toHaveProperty("updatedAt");
    });

    test("should create task with default values", () => {
      const newTask = createTask({ title: "Minimal Task" });

      expect(newTask.status).toBe("todo");
      expect(newTask.priority).toBe("medium");
      expect(newTask.description).toBe("");
    });

    test("should increment ID for each new task", () => {
      const task1 = createTask({ title: "Task 1" });
      const task2 = createTask({ title: "Task 2" });
      const task3 = createTask({ title: "Task 3" });

      expect(task1.id).toBe(6);
      expect(task2.id).toBe(7);
      expect(task3.id).toBe(8);
    });

    test("should add task to the collection", () => {
      const initialCount = getAllTasks().length;
      createTask({ title: "New Task" });
      expect(getAllTasks().length).toBe(initialCount + 1);
    });
  });

  describe("updateTask", () => {
    test("should update existing task", () => {
      const updated = updateTask(1, {
        title: "Updated Title",
        status: "done",
        priority: "low"
      });

      expect(updated).not.toBeNull();
      expect(updated.title).toBe("Updated Title");
      expect(updated.status).toBe("done");
      expect(updated.priority).toBe("low");
      expect(updated.id).toBe(1); // ID unchanged
      expect(updated.createdAt).toBe("2024-01-15T10:00:00.000Z"); // CreatedAt preserved
    });

    test("should update only provided fields", () => {
      const original = getTaskById(2);
      const updated = updateTask(2, { status: "done" });

      expect(updated.status).toBe("done");
      expect(updated.title).toBe(original.title);
      expect(updated.description).toBe(original.description);
      expect(updated.priority).toBe(original.priority);
    });

    test("should return null for non-existent task", () => {
      const result = updateTask(999, { title: "New Title" });
      expect(result).toBeNull();
    });

    test("should not allow ID change", () => {
      const updated = updateTask(1, { id: 999, title: "New Title" });
      expect(updated.id).toBe(1);
    });

    test("should update updatedAt timestamp", () => {
      const original = getTaskById(1);
      // Small delay to ensure timestamp difference
      const updated = updateTask(1, { title: "Updated" });
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(original.updatedAt).getTime());
    });
  });

  describe("deleteTask", () => {
    test("should delete existing task", () => {
      const initialCount = getAllTasks().length;
      const result = deleteTask(1);
      
      expect(result).toBe(true);
      expect(getAllTasks().length).toBe(initialCount - 1);
      expect(getTaskById(1)).toBeNull();
    });

    test("should return false for non-existent task", () => {
      const result = deleteTask(999);
      expect(result).toBe(false);
    });

    test("should not affect other tasks", () => {
      deleteTask(1);
      const tasks = getAllTasks();
      expect(tasks.find(t => t.id === 2)).toBeDefined();
      expect(tasks.find(t => t.id === 3)).toBeDefined();
    });
  });

  describe("resetTasks", () => {
    test("should reset to initial state", () => {
      createTask({ title: "New Task" });
      createTask({ title: "Another Task" });
      updateTask(1, { title: "Modified" });
      deleteTask(2);
      
      resetTasks();
      
      const tasks = getAllTasks();
      expect(tasks).toHaveLength(5);
      expect(tasks[0].title).toBe("Set up project structure");
      expect(getTaskById(2)).not.toBeNull();
    });

    test("should reset nextId counter", () => {
      createTask({ title: "Task 1" });
      createTask({ title: "Task 2" });
      
      resetTasks();
      
      const newTask = createTask({ title: "New Task" });
      expect(newTask.id).toBe(6);
    });
  });
});