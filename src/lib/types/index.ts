/**
 * Supported field data types
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'date';

/**
 * Operator types
 */
export type Operator =
  // String operators
  | 'eq' | 'neq' | 'contains' | 'starts_with' | 'ends_with'
  // Number operators
  | 'gt' | 'lt' | 'gte' | 'lte' | 'between'
  // Boolean operators (eq, neq already covered)
  // Date operators (eq, neq, before, after, between)
  | 'before' | 'after'
  // Common operators
  | 'in' | 'not_in' | 'is_null' | 'is_not_null';

/**
 * Operator configuration per field type
 */
export type OperatorsByType = {
  [K in FieldType]: Operator[];
};

/**
 * Field definition in schema
 */
export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  operators?: Operator[]; // Override default operators for this field
}

/**
 * Schema configuration
 */
export interface FilterSchema {
  fields: FieldDefinition[];
  operatorsByType?: OperatorsByType; // Global operator config, can be overridden per field
}

/**
 * Single filter condition
 */
export interface FilterCondition {
  field: string;
  operator: Operator;
  value?: unknown;
}

/**
 * Group of conditions with AND/OR logic
 */
export interface FilterGroup {
  and?: Filter[];
  or?: Filter[];
}

/**
 * Filter can be a condition or a group
 */
export type Filter = FilterCondition | FilterGroup;

/**
 * Root filter structure
 */
export type FilterRoot = FilterGroup;

/**
 * Internal UI node types for managing filter state
 */
export type NodeType = 'condition' | 'group';

export interface UINode {
  id: string;
  type: NodeType;
}

export interface UIConditionNode extends UINode {
  type: 'condition';
  field: string;
  operator: Operator;
  value?: unknown;
}

export interface UIGroupNode extends UINode {
  type: 'group';
  combinator: 'and' | 'or';
  children: UIFilterNode[];
}

export type UIFilterNode = UIConditionNode | UIGroupNode;

/**
 * API configuration
 */
export type RequestMethod = 'GET' | 'POST';

export interface APIConfig {
  url: string;
  method: RequestMethod;
  queryParamName?: string; // For GET requests, default: 'filter'
  headers?: Record<string, string>;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  nodeId: string;
  field: string;
  message: string;
}

/**
 * Filter builder configuration
 */
export interface FilterBuilderConfig {
  schema: FilterSchema;
  initialFilter?: FilterRoot;
  apiConfig?: APIConfig;
  onChange?: (filter: FilterRoot, valid: boolean) => void;
  onSubmit?: (filter: FilterRoot) => void;
}

/**
 * Default operators by type
 */
export const DEFAULT_OPERATORS_BY_TYPE: OperatorsByType = {
  string: ['eq', 'neq', 'contains', 'starts_with', 'ends_with', 'in', 'not_in', 'is_null', 'is_not_null'],
  number: ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'between', 'in', 'not_in', 'is_null', 'is_not_null'],
  boolean: ['eq', 'neq', 'is_null', 'is_not_null'],
  date: ['eq', 'neq', 'before', 'after', 'between', 'is_null', 'is_not_null'],
};