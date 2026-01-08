"use client"

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onSoftReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class PDFErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('PDF Rendering Error:', error, errorInfo)
    
    // Trigger soft reset after 100ms via callback
    setTimeout(() => {
      this.props.onSoftReset?.()
      this.setState({ hasError: false, error: null })
    }, 100)
  }

  render() {
    if (this.state.hasError) {
      // Show nothing during the brief reset period
      // This prevents flickering and lets the PDF re-render cleanly
      return null
    }

    return this.props.children
  }
}

