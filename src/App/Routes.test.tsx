import React from 'react'
import { fireEvent, waitForElement } from 'react-testing-library'
import uuidv1 from 'uuid/v1'
import { renderWithRouter } from '../testUtils/renderWithRouter'

import Routes from './Routes'

import { createNote, readAllNotes, readNote } from '../noteService/noteService'
import sidebarStyles from '../Sidebar/Sidebar.module.css'

jest.mock('uuid/v1')
jest.mock('../noteService/noteService')
jest.mock('../logService')

const defaultProps = {
  uid: 'uid'
}

describe('Routes', () => {
  beforeEach(() => {
    uuidv1.mockReturnValue('someNoteId')

    const note = {
      body: 'body',
      title: 'title'
    }

    const snapshot = {
      val() {
        return note
      }
    }
    readNote.mockImplementation((uid, noteId, cb) => {
      cb(snapshot)
    })

    const notes = {
      note1: note,
      note2: note,
      note3: note
    }

    const snapshotAll = {
      val() {
        return notes
      }
    }
    readAllNotes.mockImplementation((a, cb) => {
      cb(snapshotAll)
    })
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

  it('hides sidebar when navigating to another note', async () => {
    const { getByTestId, getByText } = renderWithRouter(
      <Routes {...defaultProps} />
    )

    expect(getByTestId('Sidebar')).toHaveClass(sidebarStyles.open)

    fireEvent.click(getByText('Create Note'))

    expect(getByTestId('Sidebar')).not.toHaveClass(sidebarStyles.open)
  })

  // implicitly tests componentDidUpdate in NotesList
  it('displays new newly created note in list', async () => {
    readAllNotes.mockReset()

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

  it('hides error in note list after successful read', () => {
    readAllNotes.mockReset()

    readAllNotes.mockImplementationOnce(
      (aUid, aSuccessCallback, failureCallBack) => {
        failureCallBack(new Error())
      }
    )

    const snapshot = {
      val() {
        return { note1: {}, note2: {} }
      }
    }
    readAllNotes.mockImplementationOnce((aUid, cb) => {
      cb(snapshot)
    })

    const { getByText, queryByText } = renderWithRouter(<Routes />)

    fireEvent.click(getByText('Create Note'))

    expect(queryByText('Notes cannot be found')).toBeNull()
  })
})
