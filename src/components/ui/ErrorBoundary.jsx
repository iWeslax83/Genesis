import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GENESIS Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-nexus-card border border-red-500/30 rounded-xl p-6 max-w-md text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-red-400 mb-2">Sistem Hatasi</h2>
            <p className="text-sm text-nexus-text-dim mb-4">
              Bu modülde beklenmeyen bir hata olustu. Sayfa yeniden yüklenebilir.
            </p>
            <p className="text-xs text-red-400/70 font-mono mb-4 bg-nexus-bg rounded p-2 text-left overflow-auto max-h-20">
              {this.state.error?.message || 'Bilinmeyen hata'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg bg-nexus-accent/10 text-nexus-accent text-sm hover:bg-nexus-accent/20 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
