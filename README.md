# AgFilter (Agnostic Filter)

A reusable, schema-driven filter builder UI library for React applications. Build complex nested filters with AND/OR logic and serialize them to JSON for API requests.

## Features

-  **Schema-Driven**: Define your fields and operators via configuration
-  **Serialization**: Convert UI state to/from JSON format
-  **Validation**: Type-aware validation based on operator rules
-  **API Integration**: Built-in support for GET (query string) and POST (JSON body) requests
-  **Type-Aware Inputs**: Automatic input components based on field types
-  **Nested Groups**: Unlimited nesting of AND/OR groups
-  **Zero Dependencies**: Only peer dependencies on React
-  **TypeScript**: Full type safety and IntelliSense support
-  **Accessible**: Keyboard navigation and semantic HTML

## Installation

```bash
npm install @agfilter/core react react-dom
```

Or with yarn:

```bash
yarn add @agfilter/core react react-dom
```

## Quick Start

```tsx
import { FilterBuilder } from "@agfilter/core";
import type { FilterSchema, FilterRoot } from "@agfilter/core";

const schema: FilterSchema = {
  fields: [
    { name: "age", label: "Age", type: "number" },
    { name: "name", label: "Name", type: "string" },
    { name: "isActive", label: "Active", type: "boolean" },
  ],
  operatorsByType: {
    string: ["eq", "neq", "contains", "starts_with", "ends_with"],
    number: ["eq", "neq", "gt", "lt", "between"],
    boolean: ["eq", "neq"],
    date: ["eq", "neq", "before", "after", "between"],
  },
};

function MyApp() {
  const handleFilterChange = (filter: FilterRoot, valid: boolean) => {
    console.log("Filter changed:", filter, "Valid:", valid);
  };

  const handleSubmit = (filter: FilterRoot) => {
    console.log("Filter submitted:", filter);
    // Send to your API
  };

  return (
    <FilterBuilder
      schema={schema}
      onChange={handleFilterChange}
      onSubmit={handleSubmit}
    />
  );
}
```

## Target JSON Format

The library produces JSON in this format:

```json
{
  "and": [
    { "field": "age", "operator": "gt", "value": 30 },
    {
      "or": [
        { "field": "role", "operator": "eq", "value": "admin" },
        { "field": "isActive", "operator": "eq", "value": true }
      ]
    }
  ]
}
```

## Configuration API

### FilterSchema

Define your data schema and available operators:

```typescript
interface FilterSchema {
  fields: FieldDefinition[];
  operatorsByType?: OperatorsByType;
}

interface FieldDefinition {
  name: string; // Field identifier
  label: string; // Display label
  type: FieldType; // 'string' | 'number' | 'boolean' | 'date'
  operators?: Operator[]; // Override default operators for this field
}
```

### FilterBuilderConfig

Main component props:

```typescript
interface FilterBuilderConfig {
  schema: FilterSchema;
  initialFilter?: FilterRoot;
  onChange?: (filter: FilterRoot, valid: boolean) => void;
  onSubmit?: (filter: FilterRoot) => void;
}
```

### Supported Operators

#### String Operators

- `eq` - equals
- `neq` - not equals
- `contains` - contains substring
- `starts_with` - starts with
- `ends_with` - ends with
- `in` - in array
- `not_in` - not in array
- `is_null` - is null
- `is_not_null` - is not null

#### Number Operators

- `eq` - equals
- `neq` - not equals
- `gt` - greater than
- `lt` - less than
- `gte` - greater than or equal
- `lte` - less than or equal
- `between` - between (requires 2 values)
- `in` - in array
- `not_in` - not in array
- `is_null` - is null
- `is_not_null` - is not null

#### Boolean Operators

- `eq` - equals
- `neq` - not equals
- `is_null` - is null
- `is_not_null` - is not null

#### Date Operators

- `eq` - equals
- `neq` - not equals
- `before` - before date
- `after` - after date
- `between` - between dates (requires 2 values)
- `is_null` - is null
- `is_not_null` - is not null

## API Integration

### Using GET Requests (Query String)

```typescript
import { useFilterAPI, buildFilterUrl } from "@agfilter/core";

function MyComponent() {
  const { send, buildUrl } = useFilterAPI();

  const handleSubmit = async (filter: FilterRoot) => {
    // Option 1: Build URL manually
    const url = buildUrl(filter, "https://api.example.com/users", "filter");
    console.log(url); // https://api.example.com/users?filter=%7B...

    // Option 2: Send with hook
    await send(filter, {
      url: "https://api.example.com/users",
      method: "GET",
      queryParamName: "filter", // default: 'filter'
      onSuccess: (data) => console.log(data),
      onError: (error) => console.error(error),
    });
  };
}
```

### Using POST Requests (JSON Body)

```typescript
import { useFilterAPI } from "@agfilter/core";

function MyComponent() {
  const { send, loading, error, data } = useFilterAPI();

  const handleSubmit = async (filter: FilterRoot) => {
    await send(filter, {
      url: "https://api.example.com/users",
      method: "POST",
      headers: {
        Authorization: "Bearer token123",
      },
      onSuccess: (data) => console.log("Success:", data),
      onError: (error) => console.error("Error:", error),
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Your UI */}</div>;
}
```

## Advanced Usage

### Custom Field Operators

Override operators for specific fields:

```typescript
const schema: FilterSchema = {
  fields: [
    {
      name: "email",
      label: "Email",
      type: "string",
      operators: ["eq", "neq", "contains"], // Only these operators
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      // Uses default number operators from operatorsByType
    },
  ],
  operatorsByType: {
    string: ["eq", "neq", "contains", "starts_with"],
    number: ["eq", "neq", "gt", "lt", "between"],
    boolean: ["eq"],
    date: ["eq", "before", "after"],
  },
};
```

### Loading Initial Filters

```typescript
const initialFilter: FilterRoot = {
  and: [
    { field: "age", operator: "gt", value: 18 },
    { field: "isActive", operator: "eq", value: true },
  ],
};

<FilterBuilder
  schema={schema}
  initialFilter={initialFilter}
  onChange={handleChange}
/>;
```

### Manual Serialization/Deserialization

```typescript
import {
  serializeFilterRoot,
  deserializeFilter,
  validateFilter,
} from "@agfilter/core";

// Serialize UI state to JSON
const jsonFilter = serializeFilterRoot(uiNodeTree);

// Deserialize JSON to UI state
const uiNodeTree = deserializeFilter(jsonFilter);

// Validate a filter
const validation = validateFilter(uiNodeTree, schema);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### Query String Encoding

```typescript
import {
  encodeFilterToQueryString,
  decodeFilterFromQueryString,
} from "@agfilter/core";

// Encode to query string
const queryString = encodeFilterToQueryString(filter, "filter");
// => "filter=%7B%22and%22%3A%5B..."

// Decode from query string
const filter = decodeFilterFromQueryString(queryString, "filter");
```

## Architecture Decisions

### Why Recursive Components?

The library uses recursive React components to handle unlimited nesting depth. Each 'FilterGroup' can contain both 'FilterCondition' components and nested 'FilterGroup' components, enabling complex filter structures.

### State Management

- **Immutable Updates**: All state changes create new objects to prevent reference bugs
- **Two-Level State**: Internal UI state (with IDs for rendering) serializes to clean JSON
- **Validation-First**: Validation runs on every change, ensuring data integrity

### Zero Dependencies

The library only depends on React as a peer dependency, keeping bundle size minimal and avoiding version conflicts.

## Examples

See the '/src/example' directory for complete examples including:

- **Users Dataset**: Filtering users by age, role, status, etc.
- **Products Dataset**: Filtering products by price, category, stock, etc.
- **GET vs POST**: Examples of both request methods

To run the examples:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Testing

Run the test suite:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

The library includes:

- **Unit tests**: Serialization, validation, API encoding
- **Integration tests**: Component interactions, user workflows

## Building

Build the library:

```bash
npm run build
```

This creates ESM and CommonJS bundles in the `dist/` directory.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React 18+
- ES2020+

## License

MIT
