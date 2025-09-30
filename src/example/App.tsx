/**
 * Example app demonstrating FilterBuilder usage
 */

import React, { useState } from "react";
import { FilterBuilder, useFilterAPI, buildFilterUrl } from "@agfilter/core";
import type { FilterRoot, FilterSchema } from "@agfilter/core";
import { usersSchema, usersExampleFilter } from "./datasets/users";
import { productsSchema, productsExampleFilter } from "./datasets/products";
import { CarsSchema, carsExampleFilter } from "./datasets/cars";

type Dataset = "users" | "products" | "cars";
type RequestMethod = "GET" | "POST";

const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset>("users");
  const [method, setMethod] = useState<RequestMethod>("GET");
  const [currentFilter, setCurrentFilter] = useState<FilterRoot | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [version, setVersion] = useState(0);

  const { loading, error, data, send, buildUrl } = useFilterAPI();

  // Get current schema and example
  const schema: FilterSchema =
    dataset === "users"
      ? usersSchema
      : dataset === "cars"
      ? CarsSchema
      : productsSchema;

  const exampleFilter =
    dataset === "users" ? usersExampleFilter 
    : dataset === "cars" ? carsExampleFilter
    : productsExampleFilter;

  const handleFilterChange = (filter: FilterRoot, valid: boolean) => {
    setCurrentFilter(filter);
    setIsValid(valid);
  };

  const handleSubmit = async (filter: FilterRoot) => {
    // Mock API endpoint
    const apiUrl = `https://api.example.com/${dataset}`;

    console.log("Submitting filter:", filter);
    console.log("Method:", method);

    if (method === "GET") {
      const fullUrl = buildUrl(filter, apiUrl);
      console.log("GET URL:", fullUrl);
    } else {
      console.log("POST Body:", JSON.stringify(filter, null, 2));
    }
    // In a real app, you would call:
    // await send(filter, { url: apiUrl, method });

    alert(`Filter submitted via ${method}!\nCheck console for details.`);
  };

  const loadExample = () => {
    // Force re-render by changing key
    setCurrentFilter(exampleFilter);
    setVersion(v => v + 1);
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "8px" }}>Wallround - Agnostic Filter Builder Demo</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        A reusable, schema-driven filter builder for React applications
      </p>

      {/* Dataset Selector */}
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontWeight: "bold", marginRight: "12px" }}>
            Dataset:
          </label>
          <label style={{ marginRight: "16px" }}>
            <input
              type="radio"
              value="users"
              checked={dataset === "users"}
              onChange={() => setDataset("users")}
            />{" "}
            Users
          </label>
          <label>
            <input
              type="radio"
              value="products"
              checked={dataset === "products"}
              onChange={() => setDataset("products")}
            />{" "}
            Products
          </label>
          <label>
            <input
              type="radio"
              value="cars"
              checked={dataset === "cars"}
              onChange={() => setDataset("cars")}
            />{" "}
            Cars
          </label>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontWeight: "bold", marginRight: "12px" }}>
            Request Method:
          </label>
          <label style={{ marginRight: "16px" }}>
            <input
              type="radio"
              value="GET"
              checked={method === "GET"}
              onChange={() => setMethod("GET")}
            />{" "}
            GET (Query String)
          </label>
          <label>
            <input
              type="radio"
              value="POST"
              checked={method === "POST"}
              onChange={() => setMethod("POST")}
            />{" "}
            POST (JSON Body)
          </label>
        </div>

        <button
          onClick={loadExample}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Load Example Filter
        </button>
      </div>

      {/* Filter Builder */}
      <div style={{ marginBottom: "24px" }}>
        <h2>Build Your Filter</h2>
        <FilterBuilder
          key={`${dataset}-${version}`}
          schema={schema}
          initialFilter={currentFilter || undefined}
          onChange={handleFilterChange}
          onSubmit={handleSubmit}
        />
      </div>

      {/* API Preview */}
      {currentFilter && isValid && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: "#e7f3ff",
            borderRadius: "8px",
          }}
        >
          <h3>API Request Preview</h3>
          {method === "GET" ? (
            <div>
              <strong>GET Request URL:</strong>
              <pre
                style={{
                  backgroundColor: "#fff",
                  padding: "12px",
                  borderRadius: "4px",
                  overflow: "auto",
                  marginTop: "8px",
                }}
              >
                {buildUrl(currentFilter, `https://api.example.com/${dataset}`)}
              </pre>
            </div>
          ) : (
            <div>
              <strong>POST Request:</strong>
              <div style={{ marginTop: "8px" }}>
                <div>
                  <strong>URL:</strong> https://api.example.com/{dataset}
                </div>
                <div>
                  <strong>Body:</strong>
                </div>
                <pre
                  style={{
                    backgroundColor: "#fff",
                    padding: "12px",
                    borderRadius: "4px",
                    overflow: "auto",
                    marginTop: "8px",
                  }}
                >
                  {JSON.stringify(currentFilter, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schema Info */}
      <details style={{ marginTop: "24px" }}>
        <summary
          style={{ cursor: "pointer", fontWeight: "bold", marginBottom: "8px" }}
        >
          View Schema Configuration
        </summary>
        <pre
          style={{
            backgroundColor: "#f4f4f4",
            padding: "12px",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(schema, null, 2)}
        </pre>
      </details>

      {/* Usage Info */}
      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          backgroundColor: "#fff3cd",
          borderRadius: "8px",
        }}
      >
        <h3>How to Use</h3>
        <ol>
          <li>Select a dataset (Users or Products or "Cars" (This last one created as extra dataset))</li>
          <li>Choose your preferred request method (GET or POST)</li>
          <li>Click "+ Condition" to add filter conditions</li>
          <li>Click "+ Group" to create nested AND/OR groups</li>
          <li>Configure field, operator, and value for each condition</li>
          <li>View the JSON output and API request preview below</li>
          <li>Click "Apply Filter" to submit (logs to console)</li>
        </ol>
      </div>
    </div>
  );
};

export default App;
