import React from 'react'
import { fireEvent, waitForElement } from 'react-testing-library'
import uuidv1 from 'uuid/v1'
import { renderWithRouter } from '../testUtils/renderWithRouter'

import Routes from './Routes'

import { createNote, readAllNotes, readNote } from '../noteService/noteService'

jest.mock('uuid/v1')
jest.mock('../noteService/noteService')

const defaultProps = {
  uid: 'uid'
}

describe('Routes', () => {
  it('redirects to first note if there is no note id in the url', async () => {
    const expectedNoteId = 'afk234'
    const expectedTitle = 'Awesome note'
    const expectedNote = { title: expectedTitle, body: 'some body' }
    const notes = {
      [expectedNoteId]: expectedNote,
      note2: {},
      note3: {}
    }
    const readAllSnapshot = {
      val() {
        return notes
      }
    }
    readAllNotes.mockImplementation((a, cb) => {
      cb(readAllSnapshot)
    })

    const snapshot = {
      val() {
        return expectedNote
      }
    }
    readNote.mockImplementation((a, b, cb) => {
      cb(snapshot)
    })

    const { getByTestId, history } = await renderWithRouter(
      <Routes {...defaultProps} />,
      {
        route: '/'
      }
    )

    expect(history.location.pathname).toBe('/' + expectedNoteId)
    expect(getByTestId('Note__title').value).toBe(expectedTitle)
  })

  it('creates a new note and navigates to it', async () => {
    const expectedNoteId = 'noteId'
    uuidv1.mockReturnValue(expectedNoteId)

    const expectedTitle = 'title'
    const expectedBody = 'body'
    const snapshot = {
      val() {
        return { title: expectedTitle, body: expectedBody }
      }
    }
    readNote.mockImplementation((uid, noteId, cb) => {
      cb(snapshot)
    })

    const expectedUid = 'uid'
    const { getByTestId, getByText, history } = await renderWithRouter(
      <Routes uid={expectedUid} />
    )

    fireEvent.click(getByText('Create Note'))

    expect(createNote).toHaveBeenCalledWith(expectedUid, expectedNoteId)
    expect(history.entries[1].pathname).toBe('/' + expectedNoteId)
    expect(getByTestId('Note__title').value).toBe(expectedTitle)
    expect(getByTestId('Note__body').value).toBe(expectedBody)
  })

  // implicitly tests componentDidUpdate in NotesList
  it('displays new newly created note in list', async () => {
    uuidv1.mockReturnValue('someNoteId')

    const note = {
      body: 'body',
      title: 'title'
    }

    const notes = {
      note1: note,
      note2: note,
      note3: note
    }

    const snapshot = {
      val() {
        return notes
      }
    }
    readAllNotes.mockImplementationOnce((a, cb) => {
      cb(snapshot)
    })

    const expectedTitle = 'new title'
    const newNote = { title: expectedTitle, body: 'new body' }
    const newNotes = { ...notes, newNote }
    const newSnapshot = {
      val() {
        return newNotes
      }
    }
    readAllNotes.mockImplementationOnce((a, cb) => {
      cb(newSnapshot)
    })

    const { getByText } = await renderWithRouter(<Routes {...defaultProps} />)

    fireEvent.click(getByText('Create Note'))

    await waitForElement(() => getByText(expectedTitle))
  })

  it('navigates to existing note on click', async () => {
    const expectedTitle = 'title'
    const expectedBody = 'body'
    const expectedNoteId = 'note2'
    const expectedNote = { title: expectedTitle, body: expectedBody }

    const notes = {
      note1: {},
      [expectedNoteId]: expectedNote,
      note3: {}
    }
    const readAllSnapshot = {
      val() {
        return notes
      }
    }
    readAllNotes.mockImplementation((uid, cb) => {
      cb(readAllSnapshot)
    })

    const snapshot = {
      val() {
        return expectedNote
      }
    }
    readNote.mockImplementation((uid, noteId, cb) => {
      cb(snapshot)
    })

    const { getByText, getByTestId, history } = await renderWithRouter(
      <Routes {...defaultProps} />,
      { route: '/anotherNoteId' }
    )

    fireEvent.click(getByText(expectedTitle))

    expect(history.entries[1].pathname).toBe('/' + expectedNoteId)
    expect(getByTestId('Note__title').value).toBe(expectedTitle)
  })
})
