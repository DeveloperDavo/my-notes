/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'

import App from './App'
import Sidebar from '../Sidebar/Sidebar'
import Container from '../Container/Container'
import { signInAnonymously } from '../authService/authService'

jest.mock('../authService/authService')
jest.mock('react-router-dom')

describe('App', () => {
  beforeEach(() => {
    window.innerWidth = 200
  })

  it('logs error and displays an alert when anonymous sign in fails', async () => {
    window.alert = jest.fn()
    console.error = jest.fn()
    const err = new Error('Something bad happened')
    signInAnonymously.mockReturnValue(Promise.reject(err))

    const wrapper = await shallow(<App />)
    await wrapper.update()

    expect(console.error).toHaveBeenCalledWith(err)
    expect(window.alert).toHaveBeenCalledWith(
      'Something went wrong. Please refresh the page and try again.'
    )
  })

  it('does not render children when there is no uid', () => {
    signInAnonymously.mockReturnValue(Promise.resolve())

    const wrapper = shallow(<App />)
    wrapper.setState({ uid: null })

    expect(wrapper.html()).toBeNull()
  })

  it('renders main component at root path', () => {
    signInAnonymously.mockResolvedValue()

    const wrapper = shallow(<App />)
    const uid = 'uid'
    wrapper.setState({ uid })

    expect(
      wrapper
        .find('Route[path="/"]')
        .at(0)
        .props()
        .render()
    ).toEqual(<Sidebar open small uid={uid} />)
  })

  it('renders container component at noteId path', () => {
    signInAnonymously.mockResolvedValue()

    const wrapper = shallow(<App />)
    const uid = 'uid'
    wrapper.setState({ uid })

    const props = { something: 'something' }

    expect(
      wrapper
        .find('Route[path="/:noteId"]')
        .at(0)
        .props()
        .render(props)
    ).toEqual(<Container {...props} uid={uid} />)
  })
})
