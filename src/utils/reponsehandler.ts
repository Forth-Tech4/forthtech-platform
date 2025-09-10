// src/utils/graphqlResponse.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const successResponse = <T>(
  data: T,
  message: string = "Success"
): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (
  message: string = "An error occurred",
  errorDetails?: any
): ApiResponse<any> => ({
  success: false,
  message,
  error: errorDetails ? JSON.stringify(errorDetails) : message,
});
