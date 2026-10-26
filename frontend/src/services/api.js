const API_BASE = "/api/tasks";

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data.data;
};

export const fetchTasks = async (filter = {}) => {
  const queryString = buildQueryString(filter);
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
  
  const response = await fetch(url);
  return handleResponse(response);
};

export const fetchTask = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`);
  return handleResponse(response);
};

export const createTask = async (taskData) => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
};

export const updateTask = async (id, taskData) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
};

export const patchTask = async (id, taskData) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE"
  });
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};