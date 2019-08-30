import React from 'react'
import { render, waitForElement } from '@testing-library/react'

import ErrorBoundary from './ErrorBoundary'

import { logError } from '../../logService'

jest.mock('../../logService')

const error = new Error('something bad happened')
function ErrorComponent() {
  throw error
}
const component = (
  <ErrorBoundary>
    <ErrorComponent />
  </ErrorBoundary>
)

describe('ErrorBoundary', () => {
  it('displays and logs error when there is an error', async () => {
    console.error = jest.fn()
    const { getByText } = render(component)

    await waitForElement(() =>
      getByText('Something went wrong. Please refresh the page and try again.')
    )

    expect(logError).toHaveBeenCalledWith({
      error,
      errorInfo: expect.anything()
    })
  })
})
