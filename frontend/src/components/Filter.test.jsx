import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Filter from "./Filter";

describe("Filter - Unit Tests", () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders filter controls", () => {
    render(<Filter filter={{ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort By")).toBeInTheDocument();
    expect(screen.getByLabelText("Order")).toBeInTheDocument();
  });

  it("calls onFilterChange with function when status changes", async () => {
    const user = userEvent.setup();
    render(<Filter filter={{ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    await user.selectOptions(screen.getByLabelText("Status"), "done");
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls onFilterChange with function when priority changes", async () => {
    const user = userEvent.setup();
    render(<Filter filter={{ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls onFilterChange with function when sort by changes", async () => {
    const user = userEvent.setup();
    render(<Filter filter={{ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    await user.selectOptions(screen.getByLabelText("Sort By"), "title");
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls onFilterChange with function when sort order changes", async () => {
    const user = userEvent.setup();
    render(<Filter filter={{ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    await user.selectOptions(screen.getByLabelText("Order"), "asc");
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it("shows clear filters button when filters are active", () => {
    render(<Filter filter={{ status: "done", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });

  it("hides clear filters button when no filters active", () => {
    render(<Filter filter={{ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    expect(screen.queryByRole("button", { name: /clear filters/i })).not.toBeInTheDocument();
  });

  it("calls onFilterChange with reset object when clear filters clicked", async () => {
    const user = userEvent.setup();
    render(<Filter filter={{ status: "done", priority: "high", sortBy: "title", sortOrder: "asc" }} onFilterChange={mockOnFilterChange} />);
    
    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      status: "",
      priority: "",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
  });

  it("has correct default options for status", () => {
    render(<Filter filter={{ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    const statusOptions = screen.getByLabelText("Status").options;
    expect(statusOptions).toHaveLength(4);
    expect(statusOptions[0]).toHaveValue("");
    expect(statusOptions[1]).toHaveValue("todo");
    expect(statusOptions[2]).toHaveValue("in-progress");
    expect(statusOptions[3]).toHaveValue("done");
  });

  it("has correct default options for priority", () => {
    render(<Filter filter={{ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" }} onFilterChange={mockOnFilterChange} />);
    
    const priorityOptions = screen.getByLabelText("Priority").options;
    expect(priorityOptions).toHaveLength(4);
    expect(priorityOptions[0]).toHaveValue("");
    expect(priorityOptions[1]).toHaveValue("low");
    expect(priorityOptions[2]).toHaveValue("medium");
    expect(priorityOptions[3]).toHaveValue("high");
  });
});