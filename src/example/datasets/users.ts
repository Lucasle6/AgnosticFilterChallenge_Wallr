/**
 * Users dataset schema
 */
import type { FilterRoot } from '@agfilter/core';
import type { FilterSchema } from "@agfilter/core";

export const usersSchema: FilterSchema = {
  fields: [
    { name: "age", label: "Age", type: "number" },
    { name: "email", label: "Email", type: "string" },
    { name: "role", label: "Role", type: "string" },
    { name: "isActive", label: "Is Active", type: "boolean" },
    { name: "createdAt", label: "Created At", type: "date" },
    { name: "score", label: "Score", type: "number" },
  ],
  operatorsByType: {
    string: ["eq","neq","contains","starts_with","ends_with","in","not_in","is_null","is_not_null",],
    number: ["eq","neq","gt","lt","gte","lte","between","in","not_in","is_null","is_not_null",],
    boolean: ["eq", "neq", "is_null", "is_not_null"],
    date: ["eq", "neq", "before", "after", "between", "is_null", "is_not_null"],
  },
};

export const usersExampleFilter = {
  and: [
    { field: "age", operator: "gt", value: 30 },
    {
      or: [
        { field: "role", operator: "eq", value: "admin" },
        { field: "isActive", operator: "eq", value: true },
      ],
    },
  ],
}satisfies FilterRoot;
