import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          margin: '40px auto',
          maxWidth: '800px',
          background: '#1a1010',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          color: '#f87171'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>⚠️ 畫面發生錯誤 (React Error Caught)</h2>
          <p style={{ color: '#fca5a5', marginBottom: '16px' }}>
            {this.state.error?.toString()}
          </p>
          <details style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem', background: '#0a0505', padding: '12px', borderRadius: '4px' }}>
            {this.state.errorInfo?.componentStack || this.state.error?.stack}
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            嘗試重新載入 (Retry)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
