/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'

import Main from './Main'
import CreateNote from '../CreateNote/CreateNote'
import NoteList from '../NoteList/NoteList'

describe('Main', () => {
  it('renders create-note component', () => {
    const wrapper = shallow(<Main uid='uid' />)

    expect(wrapper.find(CreateNote).length).toBe(1)
  })

  it('renders note list', () => {
    const currentNote = {id: 'id', title: 'title'}
    const match = {something: 'something'}
    const wrapper = shallow(<Main currentNote={currentNote} uid='uid' match={match} />)

    expect(wrapper.find(NoteList).length).toBe(1)
    expect(wrapper.find(NoteList).props().match).toBe(match)
    expect(wrapper.find(NoteList).props().currentNote).toBe(currentNote)
  })

  it('applies class names from props', () => {
    const wrapper = shallow(<Main classNames='forty-two' uid='uid' />)

    expect(wrapper.find('.forty-two').length).toBe(1)
  })
})
