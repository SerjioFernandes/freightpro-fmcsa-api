import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null; resetError: () => void }> = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetError();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 text-center mb-8">
          We're sorry for the inconvenience. The application encountered an unexpected error.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-mono text-xs break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Go to Home</span>
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-6">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundaryClass;

