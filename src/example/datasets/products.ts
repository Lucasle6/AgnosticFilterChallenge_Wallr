/**
 * Products dataset schema
 */
import type { FilterRoot } from '@agfilter/core';
import type { FilterSchema } from "@agfilter/core";

export const productsSchema: FilterSchema = {
  fields: [
    { name: "name", label: "Product Name", type: "string" },
    { name: "price", label: "Price", type: "number" },
    { name: "category", label: "Category", type: "string" },
    { name: "inStock", label: "In Stock", type: "boolean" },
    { name: "releaseDate", label: "Release Date", type: "date" },
    { name: "rating", label: "Rating", type: "number" },
  ],
  operatorsByType: {
    string: ["eq","neq","contains","starts_with","ends_with","in","not_in",],
    number: ["eq", "neq", "gt", "lt", "gte", "lte", "between"],
    boolean: ["eq", "neq"],
    date: ["eq", "neq", "before", "after", "between"],
  },
};

export const productsExampleFilter = {
  and: [
    { field: "price", operator: "between", value: [10, 100] },
    { field: "inStock", operator: "eq", value: true },
    {
      or: [
        { field: "category", operator: "eq", value: "electronics" },
        { field: "category", operator: "eq", value: "books" },
      ],
    },
  ],
}satisfies FilterRoot;
