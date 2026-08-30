import axios, { AxiosResponse } from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  withCredentials: true,
  timeout: 15000,
});

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  error?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/** Unwraps the { success, message, data } envelope, throwing ApiRequestError on failure. */
export async function unwrap<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  try {
    const { data: body } = await promise;
    if (!body.success) {
      throw new ApiRequestError(body.message, undefined, body.error);
    }
    return body.data;
  } catch (err) {
    if (err instanceof ApiRequestError) throw err;
    if (axios.isAxiosError(err)) {
      const body = err.response?.data as ApiFailure | undefined;
      throw new ApiRequestError(body?.message ?? err.message, err.response?.status, body?.error);
    }
    throw err;
  }
}
