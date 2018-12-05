/* eslint-env jest */

import firebase from 'firebase/app'

import { createNote, readNote } from './noteService'

describe('noteService', () => {
  it('creates a note in the firebase database', () => {
    const set = jest.fn()

    const ref = jest.fn(() => {
      return {
        set
      }
    })

    jest.spyOn(firebase, 'database').mockImplementation(() => {
      return {
        ref
      }
    })

    const uid = 'uid'
    const noteId = 'noteId'
    createNote(uid, noteId)

    const newNote = {title: 'untitled', body: noteId}

    expect(ref).toHaveBeenCalledWith(`/notes/${uid}/${noteId}`)
    expect(set).toHaveBeenCalledWith(newNote)
  })

  it('reads a note from the firebase database', () => {
    const once = jest.fn()

    const ref = jest.fn(() => {
      return {
        once
      }
    })

    jest.spyOn(firebase, 'database').mockImplementation(() => {
      return {
        ref
      }
    })

    const uid = 'uid'
    const noteId = 'noteId'
    const successCallback = jest.fn()
    const failureCallback = jest.fn()

    readNote(uid, noteId, successCallback, failureCallback)

    expect(once).toHaveBeenCalledWith('value', successCallback, failureCallback)
  })
})
