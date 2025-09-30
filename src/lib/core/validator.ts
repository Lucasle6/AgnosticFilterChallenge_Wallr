/**
 * Validator: Validate filter conditions based on operator rules
 */

import type {
  UIFilterNode,
  UIConditionNode,
  UIGroupNode,
  ValidationResult,
  ValidationError,
  FilterSchema,
  FieldDefinition,
  Operator,
} from "../types";

/**
 * Validate a filter node tree
 */
export function validateFilter(
  node: UIFilterNode,
  schema: FilterSchema
): ValidationResult {
  const errors: ValidationError[] = [];

  if (node.type === "condition") {
    const conditionErrors = validateCondition(node, schema);
    errors.push(...conditionErrors);
  } else {
    const groupErrors = validateGroup(node, schema);
    errors.push(...groupErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a condition node
 */
function validateCondition(
  node: UIConditionNode,
  schema: FilterSchema
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Find field definition
  const fieldDef = schema.fields.find((f) => f.name === node.field);
  if (!fieldDef) {
    errors.push({
      nodeId: node.id,
      field: node.field,
      message: `Field "${node.field}" not found in schema`,
    });
    return errors;
  }

  // Validate operator is allowed for field type
  const allowedOperators = getOperatorsForField(fieldDef, schema);
  if (!allowedOperators.includes(node.operator)) {
    errors.push({
      nodeId: node.id,
      field: node.field,
      message: `Operator "${node.operator}" not allowed for field type "${fieldDef.type}"`,
    });
  }

  // Validate value based on operator
  const valueError = validateValue(node, fieldDef);
  if (valueError) {
    errors.push({
      nodeId: node.id,
      field: node.field,
      message: valueError,
    });
  }

  return errors;
}

/**
 * Validate a group node
 */
function validateGroup(
  node: UIGroupNode,
  schema: FilterSchema
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate children exist
  if (!node.children || node.children.length === 0) {
    errors.push({
      nodeId: node.id,
      field: "",
      message: "Group must have at least one condition or child group",
    });
    return errors;
  }

  // Recursively validate children
  for (const child of node.children) {
    const childResult = validateFilter(child, schema);
    errors.push(...childResult.errors);
  }

  return errors;
}

/**
 * Get allowed operators for a field
 */
function getOperatorsForField(
  field: FieldDefinition,
  schema: FilterSchema
): Operator[] {
  // Field-specific operators override schema defaults
  if (field.operators && field.operators.length > 0) {
    return field.operators;
  }

  // Use schema operators by type
  if (schema.operatorsByType) {
    return schema.operatorsByType[field.type] || [];
  }

  return [];
}

/**
 * Validate value based on operator requirements
 */
function validateValue(
  node: UIConditionNode,
  fieldDef: FieldDefinition
): string | null {
  const { operator, value } = node;

  // Operators that don't require a value
  const noValueOperators: Operator[] = ["is_null", "is_not_null"];
  if (noValueOperators.includes(operator)) {
    return null;
  }

  // Value is required for other operators
  if (value === undefined || value === null || value === "") {
    return `Value is required for operator "${operator}"`;
  }

  // 'between' requires exactly two values
  if (operator === "between") {
    if (!Array.isArray(value) || value.length !== 2) {
      return 'Operator "between" requires exactly two values';
    }
    // Check both values are valid for the field type
    for (const v of value) {
      const typeError = validateValueType(v, fieldDef.type);
      if (typeError) return typeError;
    }
    return null;
  }

  // 'in' and 'not_in' require an array
  if (operator === "in" || operator === "not_in") {
    if (!Array.isArray(value) || value.length === 0) {
      return `Operator "${operator}" requires an array of at least one value`;
    }
    // Check all values are valid for the field type
    // for (const v of value) {
    //   const typeError = validateValueType(v, fieldDef.type);
    //   if (typeError) return typeError;
    // }
    return null;
  }

  // Validate value type matches field type
  return validateValueType(value, fieldDef.type);
}

/**
 * Validate value type matches field type
 */
function validateValueType(value: unknown, fieldType: string): string | null {
  switch (fieldType) {
    case "string":
      if (typeof value !== "string") {
        return `Value must be a string`;
      }
      break;

    case "number":
      if (
        (typeof value !== "number" || isNaN(value)) &&
        !Array.isArray(value)
      ) {
        return `Value must be a number`;
      }
      break;

    case "boolean":
      if (typeof value !== "boolean") {
        return `Value must be a boolean`;
      }
      break;

    case "date":
      // Accept Date objects or ISO date strings
      if (!(value instanceof Date) && typeof value !== "string") {
        return `Value must be a date`;
      }
      if (typeof value === "string") {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return `Value must be a valid date string`;
        }
      }
      break;

    default:
      return `Unknown field type "${fieldType}"`;
  }

  return null;
}
