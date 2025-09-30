/**
 * Utility functions
 */

let idCounter = 0;

/**
 * Generate unique ID for UI nodes
 */
export function generateId(): string {
  return `node_${Date.now()}_${idCounter++}`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is a filter group
 */
export function isFilterGroup(filter: unknown): filter is { and?: unknown[] } | { or?: unknown[] } {
  if (typeof filter !== 'object' || filter === null) return false;
  return 'and' in filter || 'or' in filter;
}

/**
 * Check if value is a filter condition
 */
export function isFilterCondition(filter: unknown): filter is { field: string; operator: string; value?: unknown } {
  if (typeof filter !== 'object' || filter === null) return false;
  return 'field' in filter && 'operator' in filter;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}