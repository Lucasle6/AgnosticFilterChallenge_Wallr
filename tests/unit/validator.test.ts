/**
 * Validator tests
 */

import { describe, it, expect } from 'vitest';
import { validateFilter } from '../../src/lib/core/validator';
import type { UIConditionNode, UIGroupNode, FilterSchema } from '../../src/lib/types';

const mockSchema: FilterSchema = {
  fields: [
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'name', label: 'Name', type: 'string' },
    { name: 'isActive', label: 'Active', type: 'boolean' },
    { name: 'createdAt', label: 'Created', type: 'date' },
  ],
  operatorsByType: {
    string: ['eq', 'neq', 'contains'],
    number: ['eq', 'neq', 'gt', 'lt', 'between'],
    boolean: ['eq', 'neq'],
    date: ['eq', 'before', 'after', 'between'],
  },
};

describe('Validator', () => {
  describe('validateFilter - conditions', () => {
    it('should validate a correct condition', () => {
      const node: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'age',
        operator: 'gt',
        value: 30,
      };

      const result = validateFilter(node, mockSchema);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid field', () => {
      const node: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'nonexistent',
        operator: 'eq',
        value: 'test',
      };

      const result = validateFilter(node, mockSchema);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('not found in schema');
    });

    it('should reject operator not allowed for field type', () => {
      const node: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'name',
        operator: 'gt',
        value: 'test',
      };

      const result = validateFilter(node, mockSchema);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('not allowed for field type');
    });

    it('should reject missing value for regular operators', () => {
      const node: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'age',
        operator: 'gt',
        value: undefined,
      };

      const result = validateFilter(node, mockSchema);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Value is required');
    });

    it('should accept is_null operator without value', () => {
      const node: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'name',
        operator: 'is_null' as never,
        value: undefined,
      };

      // Temporarily allow is_null for testing
      const schema = {
        ...mockSchema,
        operatorsByType: {
          ...mockSchema.operatorsByType,
          string: [...mockSchema.operatorsByType.string, 'is_null'],
        },
      };

      const result = validateFilter(node, schema);

      expect(result.valid).toBe(true);
    });

    it('should validate between operator requires exactly two values', () => {
      const nodeInvalid: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'age',
        operator: 'between',
        value: [30],
      };

      const result1 = validateFilter(nodeInvalid, mockSchema);
      expect(result1.valid).toBe(false);
      expect(result1.errors[0].message).toContain('exactly two values');

      const nodeValid: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'age',
        operator: 'between',
        value: [18, 65],
      };

      const result2 = validateFilter(nodeValid, mockSchema);
      expect(result2.valid).toBe(true);
    });

    it('should validate value types', () => {
      const node: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'age',
        operator: 'eq',
        value: 'not a number',
      };

      const result = validateFilter(node, mockSchema);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be a number');
    });
  });

  describe('validateFilter - groups', () => {
    it('should validate a correct group', () => {
      const node: UIGroupNode = {
        id: '1',
        type: 'group',
        combinator: 'and',
        children: [
          {
            id: '2',
            type: 'condition',
            field: 'age',
            operator: 'gt',
            value: 30,
          },
        ],
      };

      const result = validateFilter(node, mockSchema);

      expect(result.valid).toBe(true);
    });

    it('should reject empty group', () => {
      const node: UIGroupNode = {
        id: '1',
        type: 'group',
        combinator: 'and',
        children: [],
      };

      const result = validateFilter(node, mockSchema);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at least one condition');
    });

    it('should recursively validate nested groups', () => {
      const node: UIGroupNode = {
        id: '1',
        type: 'group',
        combinator: 'and',
        children: [
          {
            id: '2',
            type: 'condition',
            field: 'age',
            operator: 'gt',
            value: 30,
          },
          {
            id: '3',
            type: 'group',
            combinator: 'or',
            children: [
              {
                id: '4',
                type: 'condition',
                field: 'name',
                operator: 'eq',
                value: 123, // Wrong type
              },
            ],
          },
        ],
      };

      const result = validateFilter(node, mockSchema);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('must be a string');
    });
  });
});