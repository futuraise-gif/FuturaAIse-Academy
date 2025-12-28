import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-red-600 mb-2">Oops!</h1>
              <p className="text-xl text-gray-700">Something went wrong</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-red-900 mb-2">Error:</p>
              <p className="text-sm text-red-800 font-mono">
                {this.state.error?.toString()}
              </p>
            </div>

            {this.state.errorInfo && (
              <details className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <summary className="cursor-pointer font-semibold text-gray-900 mb-2">
                  Stack Trace (click to expand)
                </summary>
                <pre className="text-xs text-gray-700 overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="text-center mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>If this problem persists, please check the browser console for more details.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
