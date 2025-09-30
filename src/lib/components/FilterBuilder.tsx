/**
 * FilterBuilder: Main filter builder component
 */

import React, { useState, useEffect, useMemo } from 'react';
import type { FilterBuilderConfig, UIGroupNode, FilterRoot } from '../types';
import { deserializeFilter, serializeFilterRoot } from '../core/serializer';
import { validateFilter } from '../core/validator';
import { FilterGroup } from './FilterGroup';
import { generateId } from '../utils';

export const FilterBuilder: React.FC<FilterBuilderConfig> = ({
  schema,
  initialFilter,
  onChange,
  onSubmit,
}) => {
  // Initialize root node from initialFilter or create empty
  const [rootNode, setRootNode] = useState<UIGroupNode>(() => {
    if (initialFilter) {
      const deserialized = deserializeFilter(initialFilter, 'root');
      return deserialized.type === 'group' ? deserialized : createEmptyRootNode();
    }
    return createEmptyRootNode();
  });

  // Validate on every change
  const validation = useMemo(() => {
    return validateFilter(rootNode, schema);
  }, [rootNode, schema]);

  // Serialize to JSON format
  const filterJson = useMemo(() => {
    return serializeFilterRoot(rootNode);
  }, [rootNode]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(filterJson, validation.valid);
    }
  }, [filterJson, validation.valid, onChange]);

  const handleRootChange = (node: UIGroupNode) => {
    setRootNode(node);
  };

  const handleSubmit = () => {
    if (validation.valid && onSubmit) {
      onSubmit(filterJson);
    }
  };

  const handleClear = () => {
    setRootNode(createEmptyRootNode());
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '100%' }}>
      <FilterGroup
        node={rootNode}
        schema={schema}
        onChange={handleRootChange}
        isRoot={true}
      />

      {validation.errors.length > 0 && (
        <div
          style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            padding: '8px',
            borderRadius: '4px',
            marginTop: '12px',
          }}
        >
          <strong>Validation Errors:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {validation.errors.map((error, index) => (
              <li key={index}>
                {error.field ? `${error.field}: ` : ''}{error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button
          onClick={handleSubmit}
          disabled={!validation.valid}
          style={{
            padding: '8px 16px',
            cursor: validation.valid ? 'pointer' : 'not-allowed',
            backgroundColor: validation.valid ? '#007bff' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Apply Filter
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Clear
        </button>
      </div>

      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          View JSON Output
        </summary>
        <pre
          style={{
            backgroundColor: '#f4f4f4',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '8px',
          }}
        >
          {JSON.stringify(filterJson, null, 2)}
        </pre>
      </details>
    </div>
  );
};

function createEmptyRootNode(): UIGroupNode {
  return {
    id: generateId(),
    type: 'group',
    combinator: 'and',
    children: [],
  };
}