/**
 * Serializer tests
 */

import { describe, it, expect } from 'vitest';
import { serializeFilter, deserializeFilter, serializeFilterRoot } from '../../src/lib/core/serializer';
import type { UIConditionNode, UIGroupNode, FilterRoot } from '../../src/lib/types';

describe('Serializer', () => {
  describe('serializeFilter', () => {
    it('should serialize a simple condition', () => {
      const node: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'age',
        operator: 'gt',
        value: 30,
      };

      const result = serializeFilter(node);

      expect(result).toEqual({
        field: 'age',
        operator: 'gt',
        value: 30,
      });
    });

    it('should omit value for is_null operator', () => {
      const node: UIConditionNode = {
        id: '1',
        type: 'condition',
        field: 'name',
        operator: 'is_null',
        value: undefined,
      };

      const result = serializeFilter(node);

      expect(result).toEqual({
        field: 'name',
        operator: 'is_null',
      });
      expect('value' in result).toBe(false);
    });

    it('should serialize a group with AND combinator', () => {
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
            type: 'condition',
            field: 'role',
            operator: 'eq',
            value: 'admin',
          },
        ],
      };

      const result = serializeFilter(node);

      expect(result).toEqual({
        and: [
          { field: 'age', operator: 'gt', value: 30 },
          { field: 'role', operator: 'eq', value: 'admin' },
        ],
      });
    });

    it('should serialize nested groups', () => {
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
                field: 'role',
                operator: 'eq',
                value: 'admin',
              },
              {
                id: '5',
                type: 'condition',
                field: 'isActive',
                operator: 'eq',
                value: true,
              },
            ],
          },
        ],
      };

      const result = serializeFilterRoot(node);

      expect(result).toEqual({
        and: [
          { field: 'age', operator: 'gt', value: 30 },
          {
            or: [
              { field: 'role', operator: 'eq', value: 'admin' },
              { field: 'isActive', operator: 'eq', value: true },
            ],
          },
        ],
      });
    });
  });

  describe('deserializeFilter', () => {
    it('should deserialize a simple condition', () => {
      const filter: FilterRoot = {
        and: [{ field: 'age', operator: 'gt', value: 30 }],
      };

      const result = deserializeFilter(filter);

      expect(result.type).toBe('group');
      if (result.type === 'group') {
        expect(result.combinator).toBe('and');
        expect(result.children).toHaveLength(1);
        expect(result.children[0]).toMatchObject({
          type: 'condition',
          field: 'age',
          operator: 'gt',
          value: 30,
        });
      }
    });

    it('should deserialize nested groups', () => {
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

      const result = deserializeFilter(filter);

      expect(result.type).toBe('group');
      if (result.type === 'group') {
        expect(result.combinator).toBe('and');
        expect(result.children).toHaveLength(2);
        expect(result.children[1].type).toBe('group');
        if (result.children[1].type === 'group') {
          expect(result.children[1].combinator).toBe('or');
          expect(result.children[1].children).toHaveLength(2);
        }
      }
    });
  });

  describe('round-trip serialization', () => {
    it('should maintain data integrity through serialize/deserialize cycle', () => {
      const original: UIGroupNode = {
        id: 'root',
        type: 'group',
        combinator: 'and',
        children: [
          {
            id: '1',
            type: 'condition',
            field: 'age',
            operator: 'between',
            value: [18, 65],
          },
          {
            id: '2',
            type: 'group',
            combinator: 'or',
            children: [
              {
                id: '3',
                type: 'condition',
                field: 'status',
                operator: 'in',
                value: ['active', 'pending'],
              },
            ],
          },
        ],
      };

      const serialized = serializeFilterRoot(original);
      const deserialized = deserializeFilter(serialized, 'root');

      expect(deserialized.type).toBe('group');
      if (deserialized.type === 'group') {
        expect(deserialized.combinator).toBe(original.combinator);
        expect(deserialized.children).toHaveLength(original.children.length);

        const child0 = deserialized.children[0];
        if (child0.type === 'condition') {
          expect(child0.field).toBe('age');
          expect(child0.operator).toBe('between');
          expect(child0.value).toEqual([18, 65]);
        }
      }
    });
  });
});