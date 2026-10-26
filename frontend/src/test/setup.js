import "@testing-library/jest-dom";
import { vi, expect, beforeEach } from "vitest";

// Mock fetch globally
global.fetch = vi.fn();

// Make expect available globally
global.expect = expect;

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});