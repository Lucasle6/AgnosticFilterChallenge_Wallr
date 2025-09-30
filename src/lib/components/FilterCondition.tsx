/**
 * FilterCondition: Single condition row component
 */

import React from "react";
import type {
  UIConditionNode,
  FilterSchema,
  FieldDefinition,
  Operator,
} from "../types";
import { DEFAULT_OPERATORS_BY_TYPE } from "../types";

interface FilterConditionProps {
  node: UIConditionNode;
  schema: FilterSchema;
  onChange: (node: UIConditionNode) => void;
  onRemove: () => void;
}

export const FilterCondition: React.FC<FilterConditionProps> = ({
  node,
  schema,
  onChange,
  onRemove,
}) => {
  const fieldDef = schema.fields.find((f) => f.name === node.field);
  const operators = getOperatorsForField(fieldDef, schema);

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newField = e.target.value;
    const newFieldDef = schema.fields.find((f) => f.name === newField);
    const newOperators = getOperatorsForField(newFieldDef, schema);

    // Reset operator if current one is not valid for new field
    const newOperator = newOperators.includes(node.operator)
      ? node.operator
      : newOperators[0];

    onChange({
      ...node,
      field: newField,
      operator: newOperator,
      value: undefined, // Reset value when field changes
    });
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...node,
      operator: e.target.value as Operator,
      value: undefined, // Reset value when operator changes
    });
  };

  const handleValueChange = (value: unknown) => {
    onChange({
      ...node,
      value,
    });
  };

  const requiresNoValue = ["is_null", "is_not_null"].includes(node.operator);

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        marginBottom: "8px",
      }}
    >
      <select
        value={node.field}
        onChange={handleFieldChange}
        style={{ padding: "4px" }}
      >
        <option value="">Select field...</option>
        {schema.fields.map((field) => (
          <option key={field.name} value={field.name}>
            {field.label}
          </option>
        ))}
      </select>

      {node.field && (
        <select
          value={node.operator}
          onChange={handleOperatorChange}
          style={{ padding: "4px" }}
        >
          {operators.map((op) => (
            <option key={op} value={op}>
              {formatOperator(op)}
            </option>
          ))}
        </select>
      )}

      {node.field && !requiresNoValue && fieldDef && (
        <ValueInput
          fieldDef={fieldDef}
          operator={node.operator}
          value={node.value}
          onChange={handleValueChange}
        />
      )}

      <button
        onClick={onRemove}
        style={{ padding: "4px 8px", cursor: "pointer" }}
      >
        Remove
      </button>
    </div>
  );
};

/**
 * ValueInput: Type-aware input component
 */
interface ValueInputProps {
  fieldDef: FieldDefinition;
  operator: Operator;
  value: unknown;
  onChange: (value: unknown) => void;
}

const ValueInput: React.FC<ValueInputProps> = ({
  fieldDef,
  operator,
  value,
  onChange,
}) => {
  // Handle 'between' operator - requires two values
  if (operator === "between") {
    const arrayValue = Array.isArray(value) ? value : [undefined, undefined];
    return (
      <div style={{ display: "flex", gap: "4px" }}>
        <BaseInput
          type={fieldDef.type}
          value={arrayValue[0]}
          onChange={(v) => onChange([v, arrayValue[1]])}
        />
        <span>and</span>
        <BaseInput
          type={fieldDef.type}
          value={arrayValue[1]}
          onChange={(v) => onChange([arrayValue[0], v])}
        />
      </div>
    );
  }

  // Handle 'in' and 'not_in' operators - requires array of values
  if (operator === "in" || operator === "not_in") {
    const stringValue = Array.isArray(value) ? value.join(", ") : "";
    return (
      <input
        type="text"
        value={stringValue}
        onChange={(e) => {
          const values = e.target.value
            .split(",")
            .map((v) => v.trim())            
          onChange(values);
        }}
        placeholder="value1, value2, ..."
        style={{ padding: "4px", flex: 1 }}
      />
    );
  }

  // Single value input
  return <BaseInput type={fieldDef.type} value={value} onChange={onChange} />;
};

/**
 * BaseInput: Basic input for different types
 */
interface BaseInputProps {
  type: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

const BaseInput: React.FC<BaseInputProps> = ({ type, value, onChange }) => {
  switch (type) {
    case "string":
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ padding: "4px", flex: 1 }}
        />
      );

    case "number":
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ padding: "4px", flex: 1 }}
        />
      );

    case "boolean":
      return (
        <select
          value={value === true ? "true" : value === false ? "false" : ""}
          onChange={(e) => onChange(e.target.value === "true")}
          style={{ padding: "4px" }}
        >
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );

    case "date":
      const dateValue =
        value instanceof Date
          ? value.toISOString().split("T")[0]
          : (value as string) || "";
      return (
        <input
          type="date"
          value={dateValue}
          onChange={(e) => onChange(e.target.value)}
          style={{ padding: "4px", flex: 1 }}
        />
      );

    default:
      return (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ padding: "4px", flex: 1 }}
        />
      );
  }
};

/**
 * Get operators for a field
 */
function getOperatorsForField(
  fieldDef: FieldDefinition | undefined,
  schema: FilterSchema
): Operator[] {
  if (!fieldDef) return [];

  if (fieldDef.operators && fieldDef.operators.length > 0) {
    return fieldDef.operators;
  }

  if (schema.operatorsByType) {
    return schema.operatorsByType[fieldDef.type] || [];
  }

  return DEFAULT_OPERATORS_BY_TYPE[fieldDef.type] || [];
}

/**
 * Format operator for display
 */
function formatOperator(op: Operator): string {
  const labels: Record<string, string> = {
    eq: "equals",
    neq: "not equals",
    gt: "greater than",
    lt: "less than",
    gte: "greater than or equal",
    lte: "less than or equal",
    contains: "contains",
    starts_with: "starts with",
    ends_with: "ends with",
    in: "in",
    not_in: "not in",
    between: "between",
    before: "before",
    after: "after",
    is_null: "is null",
    is_not_null: "is not null",
  };

  return labels[op] || op;
}
