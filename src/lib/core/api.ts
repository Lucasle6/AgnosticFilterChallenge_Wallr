/**
 * API Client: Handle GET/POST requests with filters
 */

import type { FilterRoot, APIConfig } from '../types';

/**
 * Encode filter to URL-safe query string
 */
export function encodeFilterToQueryString(filter: FilterRoot, paramName = 'filter'): string {
  const jsonString = JSON.stringify(filter);
  const encoded = encodeURIComponent(jsonString);
  return `${paramName}=${encoded}`;
}

/**
 * Decode filter from query string
 */
export function decodeFilterFromQueryString(queryString: string, paramName = 'filter'): FilterRoot | null {
  try {
    const params = new URLSearchParams(queryString);
    const encoded = params.get(paramName);
    if (!encoded) return null;

    const decoded = decodeURIComponent(encoded);
    return JSON.parse(decoded) as FilterRoot;
  } catch (error) {
    console.error('Failed to decode filter from query string:', error);
    return null;
  }
}

/**
 * Send filter to API
 */
export async function sendFilter(filter: FilterRoot, config: APIConfig): Promise<unknown> {
  const { url, method, queryParamName = 'filter', headers = {}, onSuccess, onError } = config;

  try {
    let finalUrl = url;
    let body: string | undefined;

    if (method === 'GET') {
      // Append filter as query parameter
      const queryString = encodeFilterToQueryString(filter, queryParamName);
      const separator = url.includes('?') ? '&' : '?';
      finalUrl = `${url}${separator}${queryString}`;
    } else if (method === 'POST') {
      // Send filter as JSON body
      body = JSON.stringify(filter);
    }

    const response = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (onSuccess) {
      onSuccess(data);
    }

    return data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (onError) {
      onError(err);
    } else {
      console.error('Filter API request failed:', err);
    }

    throw err;
  }
}

/**
 * Build full URL with filter for GET requests (without sending)
 */
export function buildFilterUrl(filter: FilterRoot, baseUrl: string, paramName = 'filter'): string {
  const queryString = encodeFilterToQueryString(filter, paramName);
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}