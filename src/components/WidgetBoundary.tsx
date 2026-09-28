'use client'

import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback: ReactNode }
type State = { failed: boolean }

/**
 * Per-widget error boundary. A section that throws renders `fallback`
 * instead, leaving the rest of the page (siblings) intact.
 */
export default class WidgetBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
