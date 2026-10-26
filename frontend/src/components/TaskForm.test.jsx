import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "./TaskForm";

describe("TaskForm - Unit Tests", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create form with empty fields", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText("Add New Task")).toBeInTheDocument();
    expect(screen.getByLabelText("Title *")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(screen.getByLabelText("Status")).toHaveValue("todo");
    expect(screen.getByLabelText("Priority")).toHaveValue("medium");
  });

  it("renders edit form with task data", () => {
    const task = {
      id: 1,
      title: "Test Task",
      description: "Test Description",
      status: "in-progress",
      priority: "high"
    };
    
    render(<TaskForm task={task} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    expect(screen.getByLabelText("Title *")).toHaveValue("Test Task");
    expect(screen.getByLabelText("Description")).toHaveValue("Test Description");
    expect(screen.getByLabelText("Status")).toHaveValue("in-progress");
    expect(screen.getByLabelText("Priority")).toHaveValue("high");
  });

  it("validates required title field", async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);
    
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with form data on valid submit", async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByLabelText("Title *"), "New Task");
    await user.type(screen.getByLabelText("Description"), "Task description");
    await user.selectOptions(screen.getByLabelText("Status"), "in-progress");
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    
    await user.click(screen.getByRole("button", { name: /create task/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          description: "Task description",
          status: "in-progress",
          priority: "high"
        })
      );
    });
  });

  it("calls onSubmit with task id when editing", async () => {
    const user = userEvent.setup();
    const task = { id: 5, title: "Existing", description: "", status: "todo", priority: "medium" };
    
    render(<TaskForm task={task} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.clear(screen.getByLabelText("Title *"));
    await user.type(screen.getByLabelText("Title *"), "Updated Task");
    await user.click(screen.getByRole("button", { name: /update task/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(5, expect.objectContaining({
        title: "Updated Task"
      }));
    });
  });

  it("calls onCancel when cancel button clicked", async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("disables form while submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit;
    const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
    mockOnSubmit.mockReturnValue(submitPromise);
    
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByLabelText("Title *"), "Test");
    await user.click(screen.getByRole("button", { name: /create task/i }));
    
    expect(screen.getByRole("button", { name: /saving.../i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    
    resolveSubmit();
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalled());
  });

  it("clears error when user starts typing", async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByRole("button", { name: /create task/i });
    await user.click(submitButton);
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    
    await user.type(screen.getByLabelText("Title *"), "A");
    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
  });
});