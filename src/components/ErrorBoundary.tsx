import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center bg-[#0a0a1a]">
          <div className="text-5xl">⚡</div>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-[#8892b0] max-w-sm font-mono">{this.state.error.message}</p>
          <button
            onClick={() => { window.location.href = '/' }}
            className="px-6 py-3 bg-[#00d4ff] text-[#0a0a1a] rounded-xl font-semibold text-sm"
          >
            Back to home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
