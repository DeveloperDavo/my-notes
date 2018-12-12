/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'
import ContentEditable from 'react-contenteditable'

import Note from './Note'
import { readNote, updateNote } from '../../service/noteService/noteService'

jest.mock('../../service/noteService/noteService')

describe('Note', () => {
  it('renders note', () => {
    const note = {
      title: 'title',
      body: 'body'
    }
    const snapshot = {
      val: function () {
        return note
      }
    }
    readNote.mockImplementation((uid, noteId, cb) => {
      cb(snapshot)
    })

    const uid = 'someUid'
    const noteId = 'someNoteId'
    const match = {params: {noteId: noteId}}
    const wrapper = shallow(<Note uid={uid} match={match} />)

    expect(wrapper.find(ContentEditable).at(0).props().html).toBe(note.title)
    expect(wrapper.find(ContentEditable).at(1).props().html).toBe(note.body)
  })

  it('renders and logs error when reading note fails', () => {
    console.error = jest.fn()
    const err = new Error('Something bad happened')

    const errorNote = {
      title: 'Note cannot be found',
      body: ''
    }
    readNote.mockImplementation((uid, noteId, successCallback, failureCallBack) => {
      failureCallBack(err)
    })

    const match = {params: {noteId: ''}}
    const wrapper = shallow(<Note uid='' match={match} />)

    expect(console.error).toHaveBeenCalledWith(err)
    expect(wrapper.find(ContentEditable).at(0).props().html).toBe(errorNote.title)
    expect(wrapper.find(ContentEditable).at(1).props().html).toBe(errorNote.body)
  })

  it('renders and logs error when there is no note', () => {
    console.error = jest.fn()

    const errorNote = {
      title: 'Note cannot be found',
      body: ''
    }

    const snapshot = {
      val: function () {
        return null
      }
    }
    readNote.mockImplementation((uid, noteId, cb) => {
      cb(snapshot)
    })

    const noteId = 'noteId'
    const match = {params: {noteId}}
    const wrapper = shallow(<Note uid='' match={match} />)

    expect(console.error).toHaveBeenCalledWith('Not able to read note: ' + noteId)
    expect(wrapper.find(ContentEditable).at(0).props().html).toBe(errorNote.title)
    expect(wrapper.find(ContentEditable).at(1).props().html).toBe(errorNote.body)
  })

  it('reads new note when note id changes', () => {
    const uid = 'someUid'
    const noteId1 = 'noteId1'
    const match1 = {params: {noteId: noteId1}}
    const prevProps = {uid, match: match1}
    const wrapper = shallow(<Note {...prevProps} />)

    const noteId2 = 'noteId2'
    const match2 = {params: {noteId: noteId2}}
    const props = {uid, match: match2}
    wrapper.setProps(props)

    expect(readNote).toHaveBeenCalledWith(uid, noteId2, expect.any(Function), expect.any(Function))
  })

  it('applies class names from props', () => {
    const match = {params: {noteId: 'id'}}
    const wrapper = shallow(<Note classNames='forty-two' uid='uid' match={match} />)

    expect(wrapper.find('.forty-two').length).toBe(1)
  })

  it('updates title on change', () => {
    const body = 'body'
    const note = {
      title: 'title',
      body
    }
    const snapshot = {
      val: function () {
        return note
      }
    }
    readNote.mockImplementation((uid, noteId, cb) => {
      cb(snapshot)
    })

    const uid = 'uid'
    const noteId = 'noteId'
    const match = {params: {noteId}}
    const wrapper = shallow(<Note uid={uid} match={match} />)

    const newTitle = 'new title'
    wrapper.find(ContentEditable).at(0).prop('onChange')({target: {value: newTitle}})

    expect(wrapper.find(ContentEditable).at(0).props().html).toBe(newTitle)
    expect(updateNote).toHaveBeenCalledWith(uid, noteId, newTitle, body)
  })

  it('updates body on change', () => {
    const title = 'title'
    const note = {
      title,
      body: 'body'
    }
    const snapshot = {
      val: function () {
        return note
      }
    }
    readNote.mockImplementation((uid, noteId, cb) => {
      cb(snapshot)
    })

    const uid = 'uid'
    const noteId = 'noteId'
    const match = {params: {noteId}}
    const wrapper = shallow(<Note uid={uid} match={match} />)

    const newBody = 'new body'
    wrapper.find(ContentEditable).at(1).prop('onChange')({target: {value: newBody}})

    expect(wrapper.find(ContentEditable).at(1).props().html).toBe(newBody)
    expect(updateNote).toHaveBeenCalledWith(uid, noteId, title, newBody)
  })
})
