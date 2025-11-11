type ErrorResponse = {
  response?: {
    data?: {
      error?: unknown;
      message?: unknown;
    };
  };
  message?: unknown;
};

const extractString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

export const getErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const typed = error as ErrorResponse;
    const responseError = extractString(typed.response?.data?.error);
    if (responseError) {
      return responseError;
    }

    const responseMessage = extractString(typed.response?.data?.message);
    if (responseMessage) {
      return responseMessage;
    }

    const directMessage = extractString(typed.message);
    if (directMessage) {
      return directMessage;
    }
  }

  return fallback;
};



