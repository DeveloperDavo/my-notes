import React from 'react'

import { logError } from './logService'

export interface State {
  hasError: boolean
}

export default class ErrorBoundary extends React.Component<any, State> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ hasError: true })
    logError({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1>Something went wrong. Please refresh the page and try again.</h1>
      )
    }

    return this.props.children
  }
}
