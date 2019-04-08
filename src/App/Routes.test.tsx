import React from 'react'
import { fireEvent } from 'react-testing-library'
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
    const { getByTestId, history } = await renderWithRouter(
      <Routes uid={expectedUid} />
    )

    fireEvent.click(getByTestId('CreateNote__btn'))

    expect(createNote).toHaveBeenCalledWith(expectedUid, expectedNoteId)
    expect(history.entries[1].pathname).toBe('/' + expectedNoteId)
    expect(getByTestId('Note__title').value).toBe(expectedTitle)
    expect(getByTestId('Note__body').value).toBe(expectedBody)
  })

  it('navigates to existing note', async () => {
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

  describe('for small devices', () => {
    beforeEach(() => {
      window.innerWidth = 599
    })

    it('displays sidebar', async () => {
      const { queryByTestId } = await renderWithRouter(
        <Routes {...defaultProps} />
      )

      expect(queryByTestId('Sidebar')).not.toBeNull()
    })

    it('does not display note', async () => {
      const { queryByTestId } = await renderWithRouter(
        <Routes {...defaultProps} />
      )

      expect(queryByTestId('Note')).toBeNull()
    })
  })

  describe('for non-small devices', () => {
    beforeEach(() => {
      window.innerWidth = 600
    })

    it('displays note', async () => {
      const { queryByTestId } = await renderWithRouter(
        <Routes {...defaultProps} />
      )

      expect(queryByTestId('Note')).not.toBeNull()
    })
  })
})
