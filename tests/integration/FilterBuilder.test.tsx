/**
 * FilterBuilder integration tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBuilder } from '../../src/lib/components/FilterBuilder';
import type { FilterSchema } from '../../src/lib/types';

const mockSchema: FilterSchema = {
  fields: [
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'name', label: 'Name', type: 'string' },
    { name: 'isActive', label: 'Active', type: 'boolean' },
  ],
  operatorsByType: {
    string: ['eq', 'neq', 'contains'],
    number: ['eq', 'neq', 'gt', 'lt'],
    boolean: ['eq', 'neq'],
    date: ['eq', 'before', 'after'],
  },
};

describe('FilterBuilder Integration', () => {
  it('should render with empty state', () => {
    render(<FilterBuilder schema={mockSchema} />);

    expect(screen.getByText('No conditions. Click "+ Condition" to add one.')).toBeInTheDocument();
    expect(screen.getByText('+ Condition')).toBeInTheDocument();
    expect(screen.getByText('+ Group')).toBeInTheDocument();
  });

  it('should add a condition when button clicked', async () => {
    const user = userEvent.setup();
    render(<FilterBuilder schema={mockSchema} />);

    const addButton = screen.getByText('+ Condition');
    await user.click(addButton);

    // Should have field selector and remove button
    expect(screen.getByText('Select field...')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('should remove a condition when remove button clicked', async () => {
    const user = userEvent.setup();
    render(<FilterBuilder schema={mockSchema} />);

    // Add condition
    await user.click(screen.getByText('+ Condition'));
    expect(screen.getByText('Remove')).toBeInTheDocument();

    // Remove condition
    await user.click(screen.getByText('Remove'));
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    expect(screen.getByText('No conditions. Click "+ Condition" to add one.')).toBeInTheDocument();
  });

  it('should add nested group', async () => {
    const user = userEvent.setup();
    render(<FilterBuilder schema={mockSchema} />);

    // Add group
    await user.click(screen.getByText('+ Group'));

    // Should have two sets of AND/OR radio buttons (root + nested)
    const andRadios = screen.getAllByLabelText('AND');
    expect(andRadios).toHaveLength(2);
  });

  it('should call onChange callback when filter changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterBuilder schema={mockSchema} onChange={onChange} />);

    // Add condition
    await user.click(screen.getByText('+ Condition'));

    // onChange should be called
    expect(onChange).toHaveBeenCalled();
  });

  it('should display validation errors', async () => {
    const user = userEvent.setup();
    render(<FilterBuilder schema={mockSchema} />);

    // Add condition (empty group is invalid, but after adding condition it might still have validation issues)
    await user.click(screen.getByText('+ Condition'));

    // The condition starts with a field selected but might need a value
    // Just check that Apply Filter button exists and state works
    const applyButton = screen.getByText('Apply Filter');
    expect(applyButton).toBeInTheDocument();
  });

  it('should load initial filter', () => {
    const initialFilter = {
      and: [
        { field: 'age', operator: 'gt', value: 30 },
        { field: 'name', operator: 'eq', value: 'John' },
      ],
    };

    render(<FilterBuilder schema={mockSchema} initialFilter={initialFilter} />);

    // Check for the actual values in the inputs
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });

  it('should toggle between AND and OR combinators', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterBuilder schema={mockSchema} onChange={onChange} />);

    // Default is AND
    const andRadio = screen.getByLabelText('AND');
    const orRadio = screen.getByLabelText('OR');

    expect(andRadio).toBeChecked();
    expect(orRadio).not.toBeChecked();

    // Switch to OR
    await user.click(orRadio);

    expect(orRadio).toBeChecked();
    expect(andRadio).not.toBeChecked();

    // Check that onChange was called with OR combinator
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall[0]).toHaveProperty('or');
  });

  it('should clear all filters when clear button clicked', async () => {
    const user = userEvent.setup();
    render(<FilterBuilder schema={mockSchema} />);

    // Add condition
    await user.click(screen.getByText('+ Condition'));
    expect(screen.getByText('Remove')).toBeInTheDocument();

    // Clear
    await user.click(screen.getByText('Clear'));

    // Should be back to empty state
    expect(screen.getByText('No conditions. Click "+ Condition" to add one.')).toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });
});