import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { fetchTasks, createTask, updateTask, deleteTask } from "./services/api";

vi.mock("./services/api");

describe("App - Integration Tests", () => {
  const mockTasks = [
    { id: 1, title: "Task 1", description: "Desc 1", status: "todo", priority: "high", createdAt: "2024-01-15T10:00:00.000Z", updatedAt: "2024-01-15T10:00:00.000Z" },
    { id: 2, title: "Task 2", description: "Desc 2", status: "done", priority: "medium", createdAt: "2024-01-16T10:00:00.000Z", updatedAt: "2024-01-16T10:00:00.000Z" },
    { id: 3, title: "Task 3", description: "Desc 3", status: "in-progress", priority: "low", createdAt: "2024-01-17T10:00:00.000Z", updatedAt: "2024-01-17T10:00:00.000Z" }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    fetchTasks.mockResolvedValue(mockTasks);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("loads and displays tasks on mount", async () => {
    render(<App />);
    
    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
      expect(screen.getByText("Task 3")).toBeInTheDocument();
    });
  });

  it("displays task summary counts", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Total: 3")).toBeInTheDocument();
      expect(screen.getByText("Todo: 1")).toBeInTheDocument();
      expect(screen.getByText("In Progress: 1")).toBeInTheDocument();
      expect(screen.getByText("Done: 1")).toBeInTheDocument();
    });
  });

  it("creates new task", async () => {
    const user = userEvent.setup();
    const newTask = { id: 4, title: "New Task", description: "", status: "todo", priority: "medium", createdAt: "2024-01-18T10:00:00.000Z", updatedAt: "2024-01-18T10:00:00.000Z" };
    createTask.mockResolvedValue(newTask);
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    await user.click(screen.getByRole("button", { name: /add task/i }));
    await user.type(screen.getByLabelText("Title *"), "New Task");
    await user.click(screen.getByRole("button", { name: /create task/i }));
    
    await waitFor(() => {
      expect(screen.getByText("New Task")).toBeInTheDocument();
      expect(screen.getByText("Total: 4")).toBeInTheDocument();
    });
  });

  it("edits existing task", async () => {
    const user = userEvent.setup();
    const updatedTask = { ...mockTasks[0], title: "Updated Task 1", status: "done" };
    updateTask.mockResolvedValue(updatedTask);
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    await user.click(screen.getByRole("button", { name: /edit task: task 1/i }));
    await user.clear(screen.getByLabelText("Title *"));
    await user.type(screen.getByLabelText("Title *"), "Updated Task 1");
    // Use the form's status select by id (not the filter)
    await user.selectOptions(screen.getByTestId("task-form-status"), "done");
    await user.click(screen.getByRole("button", { name: /update task/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Updated Task 1")).toBeInTheDocument();
      expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    });
  });

  it("deletes task", async () => {
    const user = userEvent.setup();
    deleteTask.mockResolvedValue({ success: true });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    await user.click(screen.getByRole("button", { name: /delete task: task 1/i }));
    
    await waitFor(() => {
      expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
      expect(screen.getByText("Total: 2")).toBeInTheDocument();
    });
    
    window.confirm.mockRestore();
  });

  it("updates filter state when status filter changes", async () => {
    const user = userEvent.setup();
    // Use a mock that can be called multiple times
    fetchTasks.mockResolvedValue(mockTasks);
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    // Change the status filter - should call fetchTasks with new filter
    await user.selectOptions(screen.getByLabelText("Status"), "done");
    
    // Verify fetchTasks was called with the filter
    await waitFor(() => {
      expect(fetchTasks).toHaveBeenCalledWith(expect.objectContaining({ status: "done" }));
    });
  });

  it("updates filter state when priority filter changes", async () => {
    const user = userEvent.setup();
    fetchTasks.mockResolvedValue(mockTasks);
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    
    await waitFor(() => {
      expect(fetchTasks).toHaveBeenCalledWith(expect.objectContaining({ priority: "high" }));
    });
  });

  it("clears filters and resets filter state", async () => {
    const user = userEvent.setup();
    fetchTasks.mockResolvedValue(mockTasks);
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    // Apply a filter
    await user.selectOptions(screen.getByLabelText("Status"), "done");
    await waitFor(() => {
      expect(fetchTasks).toHaveBeenCalledWith(expect.objectContaining({ status: "done" }));
    });
    
    // Clear filters
    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    
    // Verify fetchTasks called with default filter
    await waitFor(() => {
      expect(fetchTasks).toHaveBeenCalledWith(expect.objectContaining({
        status: "",
        priority: "",
        sortBy: "createdAt",
        sortOrder: "desc"
      }));
    });
  });

  it("cancels task creation", async () => {
    const user = userEvent.setup();
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    await user.click(screen.getByRole("button", { name: /add task/i }));
    await user.type(screen.getByLabelText("Title *"), "New Task");
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    
    await waitFor(() => {
      expect(screen.queryByLabelText("Title *")).not.toBeInTheDocument();
    });
  });

  it("cancels task editing", async () => {
    const user = userEvent.setup();
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    await user.click(screen.getByRole("button", { name: /edit task: task 1/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    
    await waitFor(() => {
      expect(screen.queryByLabelText("Title *")).not.toBeInTheDocument();
    });
  });

  it("displays error when API fails", async () => {
    fetchTasks.mockRejectedValueOnce(new Error("Failed to fetch"));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    });
  });

  it("dismisses error message", async () => {
    const user = userEvent.setup();
    fetchTasks.mockRejectedValueOnce(new Error("Failed to fetch")).mockResolvedValueOnce(mockTasks);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole("button", { name: /dismiss error/i }));
    
    await waitFor(() => {
      expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
    });
  });

  it("shows confirmation before delete", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    
    render(<App />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
    
    await user.click(screen.getByRole("button", { name: /delete task: task 1/i }));
    
    await waitFor(() => {
      expect(deleteTask).not.toHaveBeenCalled();
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });
    
    window.confirm.mockRestore();
  });
});