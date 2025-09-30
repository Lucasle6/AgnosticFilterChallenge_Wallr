/**
 * API tests
 */

import { describe, it, expect } from 'vitest';
import { encodeFilterToQueryString, decodeFilterFromQueryString, buildFilterUrl } from '../../src/lib/core/api';
import type { FilterRoot } from '../../src/lib/types';

describe('API', () => {
  describe('encodeFilterToQueryString', () => {
    it('should encode filter to URL-safe query string', () => {
      const filter: FilterRoot = {
        and: [
          { field: 'age', operator: 'gt', value: 30 },
          { field: 'role', operator: 'eq', value: 'admin' },
        ],
      };

      const result = encodeFilterToQueryString(filter);

      expect(result).toContain('filter=');
      expect(result).toMatch(/^filter=%7B/); // Starts with encoded {
    });

    it('should use custom param name', () => {
      const filter: FilterRoot = {
        and: [{ field: 'age', operator: 'gt', value: 30 }],
      };

      const result = encodeFilterToQueryString(filter, 'customFilter');

      expect(result).toContain('customFilter=');
    });

    it('should handle nested groups', () => {
      const filter: FilterRoot = {
        and: [
          { field: 'age', operator: 'gt', value: 30 },
          {
            or: [
              { field: 'role', operator: 'eq', value: 'admin' },
              { field: 'isActive', operator: 'eq', value: true },
            ],
          },
        ],
      };

      const result = encodeFilterToQueryString(filter);

      expect(result).toBeTruthy();
      expect(result).toContain('filter=');

      // Should be decodable
      const decoded = decodeFilterFromQueryString(result);
      expect(decoded).toEqual(filter);
    });
  });

  describe('decodeFilterFromQueryString', () => {
    it('should decode filter from query string', () => {
      const original: FilterRoot = {
        and: [
          { field: 'age', operator: 'gt', value: 30 },
          { field: 'role', operator: 'eq', value: 'admin' },
        ],
      };

      const encoded = encodeFilterToQueryString(original);
      const decoded = decodeFilterFromQueryString(encoded);

      expect(decoded).toEqual(original);
    });

    it('should return null for invalid query string', () => {
      const result = decodeFilterFromQueryString('invalid');

      expect(result).toBeNull();
    });

    it('should return null if param not found', () => {
      const result = decodeFilterFromQueryString('other=value');

      expect(result).toBeNull();
    });

    it('should use custom param name', () => {
      const original: FilterRoot = {
        and: [{ field: 'age', operator: 'gt', value: 30 }],
      };

      const encoded = encodeFilterToQueryString(original, 'customFilter');
      const decoded = decodeFilterFromQueryString(encoded, 'customFilter');

      expect(decoded).toEqual(original);
    });
  });

  describe('buildFilterUrl', () => {
    it('should build URL with filter query param', () => {
      const filter: FilterRoot = {
        and: [{ field: 'age', operator: 'gt', value: 30 }],
      };

      const url = buildFilterUrl(filter, 'https://api.example.com/users');

      expect(url).toContain('https://api.example.com/users?filter=');
    });

    it('should append to existing query params', () => {
      const filter: FilterRoot = {
        and: [{ field: 'age', operator: 'gt', value: 30 }],
      };

      const url = buildFilterUrl(filter, 'https://api.example.com/users?page=1');

      expect(url).toContain('https://api.example.com/users?page=1&filter=');
    });

    it('should use custom param name', () => {
      const filter: FilterRoot = {
        and: [{ field: 'age', operator: 'gt', value: 30 }],
      };

      const url = buildFilterUrl(filter, 'https://api.example.com/users', 'q');

      expect(url).toContain('?q=');
    });
  });

  describe('round-trip encoding', () => {
    it('should maintain filter integrity through encode/decode cycle', () => {
      const original: FilterRoot = {
        and: [
          { field: 'age', operator: 'between', value: [18, 65] },
          {
            or: [
              { field: 'status', operator: 'in', value: ['active', 'pending'] },
              { field: 'isVerified', operator: 'eq', value: true },
            ],
          },
        ],
      };

      const encoded = encodeFilterToQueryString(original);
      const decoded = decodeFilterFromQueryString(encoded);

      expect(decoded).toEqual(original);
    });
  });
});