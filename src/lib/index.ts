/**
 * @agfilter/core - Main library exports
 */

// Components
export { FilterBuilder } from './components/FilterBuilder';
export { FilterGroup } from './components/FilterGroup';
export { FilterCondition } from './components/FilterCondition';

// Hooks
export { useFilterAPI } from './hooks';

// Core functions
export { serializeFilter, serializeFilterRoot, deserializeFilter } from './core/serializer';
export { validateFilter } from './core/validator';
export { sendFilter, encodeFilterToQueryString, decodeFilterFromQueryString, buildFilterUrl } from './core/api';

// Types
export type {
  FieldType,
  Operator,
  OperatorsByType,
  FieldDefinition,
  FilterSchema,
  FilterCondition as FilterConditionType,
  FilterGroup as FilterGroupType,
  Filter,
  FilterRoot,
  UINode,
  UIConditionNode,
  UIGroupNode,
  UIFilterNode,
  RequestMethod,
  APIConfig,
  ValidationResult,
  ValidationError,
  FilterBuilderConfig,
} from './types';

export { DEFAULT_OPERATORS_BY_TYPE } from './types';