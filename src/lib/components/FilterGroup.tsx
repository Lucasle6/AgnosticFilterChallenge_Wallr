/**
 * FilterGroup: Recursive AND/OR group component
 */

import React from 'react';
import type { UIGroupNode, UIFilterNode, FilterSchema } from '../types';
import { generateId } from '../utils';
import { FilterCondition } from './FilterCondition';

interface FilterGroupProps {
  node: UIGroupNode;
  schema: FilterSchema;
  onChange: (node: UIGroupNode) => void;
  onRemove?: () => void;
  isRoot?: boolean;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  node,
  schema,
  onChange,
  onRemove,
  isRoot = false,
}) => {
  const handleCombinatorChange = (combinator: 'and' | 'or') => {
    onChange({
      ...node,
      combinator,
    });
  };

  const handleAddCondition = () => {
    const newCondition: UIFilterNode = {
      id: generateId(),
      type: 'condition',
      field: schema.fields[0]?.name || '',
      operator: 'eq',
      value: undefined,
    };

    onChange({
      ...node,
      children: [...node.children, newCondition],
    });
  };

  const handleAddGroup = () => {
    const newGroup: UIGroupNode = {
      id: generateId(),
      type: 'group',
      combinator: 'and',
      children: [],
    };

    onChange({
      ...node,
      children: [...node.children, newGroup],
    });
  };

  const handleChildChange = (index: number, child: UIFilterNode) => {
    const newChildren = [...node.children];
    newChildren[index] = child;

    onChange({
      ...node,
      children: newChildren,
    });
  };

  const handleChildRemove = (index: number) => {
    const newChildren = node.children.filter((_, i) => i !== index);

    onChange({
      ...node,
      children: newChildren,
    });
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '12px',
        borderRadius: '4px',
        backgroundColor: isRoot ? '#f9f9f9' : '#fff',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <label>
            <input
              type="radio"
              value="and"
              checked={node.combinator === 'and'}
              onChange={() => handleCombinatorChange('and')}
            />
            AND
          </label>
          <label>
            <input
              type="radio"
              value="or"
              checked={node.combinator === 'or'}
              onChange={() => handleCombinatorChange('or')}
            />
            OR
          </label>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          <button onClick={handleAddCondition} style={{ padding: '4px 8px', cursor: 'pointer' }}>
            + Condition
          </button>
          <button onClick={handleAddGroup} style={{ padding: '4px 8px', cursor: 'pointer' }}>
            + Group
          </button>
          {!isRoot && onRemove && (
            <button onClick={onRemove} style={{ padding: '4px 8px', cursor: 'pointer' }}>
              Remove Group
            </button>
          )}
        </div>
      </div>

      <div style={{ paddingLeft: '12px' }}>
        {node.children.length === 0 ? (
          <div style={{ color: '#999', fontStyle: 'italic' }}>
            No conditions. Click "+ Condition" to add one.
          </div>
        ) : (
          node.children.map((child, index) => (
            <div key={child.id}>
              {child.type === 'condition' ? (
                <FilterCondition
                  node={child}
                  schema={schema}
                  onChange={updatedNode => handleChildChange(index, updatedNode)}
                  onRemove={() => handleChildRemove(index)}
                />
              ) : (
                <FilterGroup
                  node={child}
                  schema={schema}
                  onChange={updatedNode => handleChildChange(index, updatedNode)}
                  onRemove={() => handleChildRemove(index)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};