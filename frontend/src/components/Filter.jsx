function Filter({ filter, onFilterChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    onFilterChange({ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" });
  };

  const hasActiveFilters = filter.status || filter.priority;

  return (
    <div className="filter-panel">
      <h3>Filters</h3>
      
      <div className="filter-group">
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          name="status"
          value={filter.status}
          onChange={handleChange}
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-priority">Priority</label>
        <select
          id="filter-priority"
          name="priority"
          value={filter.priority}
          onChange={handleChange}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-sort">Sort By</label>
        <select
          id="filter-sort"
          name="sortBy"
          value={filter.sortBy}
          onChange={handleChange}
        >
          <option value="createdAt">Created Date</option>
          <option value="updatedAt">Updated Date</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-order">Order</label>
        <select
          id="filter-order"
          name="sortOrder"
          value={filter.sortOrder}
          onChange={handleChange}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button className="btn btn-secondary" onClick={handleClear} style={{ width: "100%" }}>
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default Filter;