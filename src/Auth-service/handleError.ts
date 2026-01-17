


import axios from "axios";

export const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Check if the error contains a response with an array of messages
    if (Array.isArray(error.response?.data) && error.response?.data[0]) {
      return error.response.data[0]; // Return the first error message in the array
    }
    // Check if the error contains a response with a string message
    if (typeof error.response?.data?.message === "string") {
      return error.response.data.message;
    }
    if (error.response?.status) {
      return `Error ${error.response.status}: ${error.response.statusText}`;
    }
    return "A network error occurred. Please check your connection.";
  } else if (error instanceof Error) {
    // Handle standard JavaScript errors
    return error.message;
  }

  // Fallback for unexpected errors
  console.error("Unhandled error:", error);
  return "An unexpected error occurred. Please try again later.";
};
