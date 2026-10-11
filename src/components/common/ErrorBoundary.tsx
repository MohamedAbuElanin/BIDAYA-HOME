import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { captureAppException } from '../../lib/posthog';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    captureAppException(error, {
      componentStack: errorInfo.componentStack ?? 'unknown',
      source: 'ReactErrorBoundary',
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isArabic = (localStorage.getItem('bh_language') || 'ar') === 'ar';

      return (
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            backgroundColor: 'var(--bg-main, #fbf9f6)',
            color: 'var(--text-main, #1e201e)',
            fontFamily: isArabic ? "'Cairo', sans-serif" : 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              borderRadius: '20px',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07)',
              border: '1px solid var(--border-default, #e4ded5)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-50, #fdf5f0)',
                color: 'var(--accent-600, #c75628)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h1
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                marginBottom: '12px',
                color: 'var(--text-main, #1e201e)',
              }}
            >
              {isArabic ? 'عذراً، حدث خطأ غير متوقع' : 'Something went wrong'}
            </h1>

            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary, #575957)',
                marginBottom: '28px',
              }}
            >
              {isArabic
                ? 'نعتذر عن هذا الخطأ. تم إرسال تقرير بالخطأ للفريق التقني للعمل على حله في أسرع وقت.'
                : 'We apologize for the inconvenience. An error report has been logged and we are working to resolve it.'}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--primary-600, #297749)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <RefreshCw size={18} />
                <span>{isArabic ? 'إعادة المحاولة' : 'Try Again'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary, #575957)',
                  border: '1px solid var(--border-default, #e4ded5)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Home size={18} />
                <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
