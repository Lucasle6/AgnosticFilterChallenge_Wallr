import type { FilterSchema } from "@agfilter/core";
import type { FilterRoot } from '@agfilter/core';

export const CarsSchema: FilterSchema = {
  fields: [
    { name: "model", label: "Model", type: "string" },
    { name: "year", label: "Year", type: "number" },
  ],
  operatorsByType: {
    string: ["eq", "neq", "contains", "ends_with"],
    number: ["eq", "neq", "gt"],
    boolean: [],
    date: [],
  },
};

export const carsExampleFilter = {
  and: [
    { field: "model", operator: "eq", value: "Hyundai" },
    { field: "year", operator: "gt", value: 2019 }
  ],
}satisfies FilterRoot;
