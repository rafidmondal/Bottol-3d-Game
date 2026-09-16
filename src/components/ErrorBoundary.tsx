import React, { ErrorInfo, ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[ErrorBoundary] Uncaught component error:', errorMsg, errorInfo?.componentStack || '');
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none font-['Outfit']">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-inner">
              <RotateCcw className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black font-['Fredoka'] text-white">Bottle Flip 3D</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                The 3D graphics engine encountered an unexpected browser interruption. Click below to reload and reset.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reload & Reset Graphics</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
