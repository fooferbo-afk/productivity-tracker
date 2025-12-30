/**
 * API client with authentication handling.
 * 
 * Centralized HTTP client that automatically attaches auth tokens
 * and handles common error cases.
 */

import { getIdToken } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
    status: number;
    detail: string;

    constructor(status: number, detail: string) {
        super(detail);
        this.name = 'ApiError';
        this.status = status;
        this.detail = detail;
    }
}

/**
 * Make an authenticated API request.
 * 
 * @param endpoint - API endpoint (e.g., '/sessions')
 * @param options - Fetch options
 * @returns Response data
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    // Get auth token
    const token = await getIdToken();

    // Build headers
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Make request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle errors
    if (!response.ok) {
        let detail = 'An error occurred';

        try {
            const errorData = await response.json();
            detail = errorData.detail || detail;
        } catch {
            // Response wasn't JSON
        }

        throw new ApiError(response.status, detail);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * GET request helper.
 */
export async function get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
    let url = endpoint;

    if (params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        }
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    return apiRequest<T>(url, { method: 'GET' });
}

/**
 * POST request helper.
 */
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PUT request helper.
 */
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PATCH request helper.
 */
export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE request helper.
 */
export async function del<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
}
