const request = require("supertest");
const app = require("../server");
const { resetTasks } = require("../data/tasks");

describe("Task API - Integration Tests", () => {
  beforeEach(() => {
    resetTasks();
  });

  describe("GET /api/tasks", () => {
    test("should return all tasks with success response", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
      expect(response.body.data).toHaveLength(5);
    });

    test("should filter tasks by status", async () => {
      const response = await request(app)
        .get("/api/tasks?status=done")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(task => task.status === "done")).toBe(true);
    });

    test("should filter tasks by priority", async () => {
      const response = await request(app)
        .get("/api/tasks?priority=high")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(task => task.priority === "high")).toBe(true);
    });

    test("should filter by both status and priority", async () => {
      const response = await request(app)
        .get("/api/tasks?status=todo&priority=medium")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(task => task.status === "todo" && task.priority === "medium")).toBe(true);
    });

    test("should return 400 for invalid status filter", async () => {
      const response = await request(app)
        .get("/api/tasks?status=invalid")
        .expect(400);

      expect(response.body.error).toContain("Invalid status");
    });

    test("should return 400 for invalid priority filter", async () => {
      const response = await request(app)
        .get("/api/tasks?priority=urgent")
        .expect(400);

      expect(response.body.error).toContain("Invalid priority");
    });

    test("should sort tasks by createdAt descending by default", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .expect(200);

      const tasks = response.body.data;
      for (let i = 0; i < tasks.length - 1; i++) {
        expect(new Date(tasks[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(tasks[i + 1].createdAt).getTime()
        );
      }
    });

    test("should sort tasks ascending when sortOrder=asc", async () => {
      const response = await request(app)
        .get("/api/tasks?sortOrder=asc")
        .expect(200);

      const tasks = response.body.data;
      for (let i = 0; i < tasks.length - 1; i++) {
        expect(new Date(tasks[i].createdAt).getTime()).toBeLessThanOrEqual(
          new Date(tasks[i + 1].createdAt).getTime()
        );
      }
    });
  });

  describe("GET /api/tasks/:id", () => {
    test("should return single task by ID", async () => {
      const response = await request(app)
        .get("/api/tasks/1")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.title).toBe("Set up project structure");
    });

    test("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .get("/api/tasks/999")
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });

    test("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/tasks/abc")
        .expect(400);

      expect(response.body.error).toBe("Invalid task ID");
    });
  });

  describe("POST /api/tasks", () => {
    test("should create new task with valid data", async () => {
      const newTask = {
        title: "New Task",
        description: "Task description",
        status: "in-progress",
        priority: "high"
      };

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newTask.title);
      expect(response.body.data.description).toBe(newTask.description);
      expect(response.body.data.status).toBe(newTask.status);
      expect(response.body.data.priority).toBe(newTask.priority);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).toHaveProperty("updatedAt");
    });

    test("should create task with default values when optional fields omitted", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Minimal Task" })
        .expect(201);

      expect(response.body.data.status).toBe("todo");
      expect(response.body.data.priority).toBe("medium");
      expect(response.body.data.description).toBe("");
    });

    test("should return 400 when title is missing", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ description: "No title" })
        .expect(400);

      expect(response.body.error).toContain("Title is required");
    });

    test("should return 400 when title is empty string", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "   " })
        .expect(400);

      expect(response.body.error).toContain("Title is required");
    });

    test("should return 400 for invalid status", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test", status: "invalid" })
        .expect(400);

      expect(response.body.error).toContain("Status must be one of");
    });

    test("should return 400 for invalid priority", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test", priority: "urgent" })
        .expect(400);

      expect(response.body.error).toContain("Priority must be one of");
    });

    test("should trim whitespace from title and description", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "  Trimmed Title  ", description: "  Trimmed Description  " })
        .expect(201);

      expect(response.body.data.title).toBe("Trimmed Title");
      expect(response.body.data.description).toBe("Trimmed Description");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    test("should update existing task completely", async () => {
      const updates = {
        title: "Updated Task",
        description: "Updated description",
        status: "done",
        priority: "low"
      };

      const response = await request(app)
        .put("/api/tasks/1")
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.priority).toBe(updates.priority);
      expect(response.body.data.id).toBe(1);
    });

    test("should update only provided fields", async () => {
      const original = await request(app).get("/api/tasks/2").expect(200);
      
      const response = await request(app)
        .put("/api/tasks/2")
        .send({ status: "done" })
        .expect(200);

      expect(response.body.data.status).toBe("done");
      expect(response.body.data.title).toBe(original.body.data.title);
      expect(response.body.data.priority).toBe(original.body.data.priority);
    });

    test("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .put("/api/tasks/999")
        .send({ title: "Updated" })
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });

    test("should return 400 for invalid ID", async () => {
      const response = await request(app)
        .put("/api/tasks/abc")
        .send({ title: "Updated" })
        .expect(400);

      expect(response.body.error).toBe("Invalid task ID");
    });

    test("should return 400 for invalid status", async () => {
      const response = await request(app)
        .put("/api/tasks/1")
        .send({ status: "invalid" })
        .expect(400);

      expect(response.body.error).toContain("Status must be one of");
    });

    test("should preserve createdAt when updating", async () => {
      const original = await request(app).get("/api/tasks/1").expect(200);
      
      await request(app)
        .put("/api/tasks/1")
        .send({ title: "Updated" })
        .expect(200);

      const updated = await request(app).get("/api/tasks/1").expect(200);
      expect(updated.body.data.createdAt).toBe(original.body.data.createdAt);
    });
  });

  describe("PATCH /api/tasks/:id", () => {
    test("should partially update task", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "in-progress" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("in-progress");
    });

    test("should update multiple fields at once", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ status: "done", priority: "low" })
        .expect(200);

      expect(response.body.data.status).toBe("done");
      expect(response.body.data.priority).toBe("low");
    });

    test("should return 400 for empty title", async () => {
      const response = await request(app)
        .patch("/api/tasks/1")
        .send({ title: "" })
        .expect(400);

      expect(response.body.error).toContain("Title cannot be empty");
    });

    test("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .patch("/api/tasks/999")
        .send({ status: "done" })
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    test("should delete existing task", async () => {
      const response = await request(app)
        .delete("/api/tasks/1")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Task deleted successfully");

      // Verify task is gone
      await request(app)
        .get("/api/tasks/1")
        .expect(404);
    });

    test("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .delete("/api/tasks/999")
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });

    test("should return 400 for invalid ID", async () => {
      const response = await request(app)
        .delete("/api/tasks/abc")
        .expect(400);

      expect(response.body.error).toBe("Invalid task ID");
    });

    test("should reduce total task count", async () => {
      const before = await request(app).get("/api/tasks").expect(200);
      const initialCount = before.body.count;

      await request(app).delete("/api/tasks/1").expect(200);

      const after = await request(app).get("/api/tasks").expect(200);
      expect(after.body.count).toBe(initialCount - 1);
    });
  });

  describe("Health check", () => {
    test("GET /health should return ok", async () => {
      const response = await request(app)
        .get("/health")
        .expect(200);

      expect(response.body.status).toBe("ok");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("404 handling", () => {
    test("should return 404 for unknown routes", async () => {
      const response = await request(app)
        .get("/api/unknown")
        .expect(404);

      expect(response.body.error).toBe("Route not found");
    });
  });
});