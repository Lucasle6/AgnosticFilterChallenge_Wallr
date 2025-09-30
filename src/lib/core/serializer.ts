/**
 * Serializer: Convert UI state to JSON filter format
 */

import type { Filter, FilterGroup, FilterRoot, UIFilterNode, UIConditionNode, UIGroupNode } from '../types';
import { isFilterGroup } from '../utils';

/**
 * Convert UI node tree to JSON filter structure
 */
export function serializeFilter(node: UIFilterNode): Filter {
  if (node.type === 'condition') {
    return serializeCondition(node);
  }
  return serializeGroup(node);
}

/**
 * Serialize a condition node
 */
function serializeCondition(node: UIConditionNode): Filter {
  const condition: Filter = {
    field: node.field,
    operator: node.operator,
  };

  // Only include value if it's defined and operator requires a value
  const noValueOperators = ['is_null', 'is_not_null'];
  if (!noValueOperators.includes(node.operator) && node.value !== undefined) {
    condition.value = node.value;
  }

  return condition;
}

/**
 * Serialize a group node
 */
function serializeGroup(node: UIGroupNode): FilterGroup {
  const children = node.children.map(child => serializeFilter(child));

  if (node.combinator === 'and') {
    return { and: children };
  }
  return { or: children };
}

/**
 * Convert UI node tree to root filter structure
 */
export function serializeFilterRoot(node: UIGroupNode): FilterRoot {
  return serializeGroup(node) as FilterRoot;
}

/**
 * Deserialize JSON filter to UI node tree
 */
export function deserializeFilter(filter: Filter, rootId?: string): UIFilterNode {
  if (isFilterGroup(filter)) {
    return deserializeGroup(filter as FilterGroup, rootId);
  }
  return deserializeCondition(filter);
}

/**
 * Deserialize a condition
 */
function deserializeCondition(condition: Filter): UIConditionNode {
  const { field, operator, value } = condition as { field: string; operator: string; value?: unknown };

  return {
    id: `node_${Date.now()}_${Math.random()}`,
    type: 'condition',
    field,
    operator: operator as never,
    value,
  };
}

/**
 * Deserialize a group
 */
function deserializeGroup(group: FilterGroup, id?: string): UIGroupNode {
  const combinator = 'and' in group ? 'and' : 'or';
  const filters = group[combinator] || [];

  return {
    id: id || `node_${Date.now()}_${Math.random()}`,
    type: 'group',
    combinator,
    children: filters.map(f => deserializeFilter(f)),
  };
}