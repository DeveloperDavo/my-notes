import React from 'react'
import { fireEvent, render } from 'react-testing-library'
import moment from 'moment'

import Note from './Note'

import { log } from '../errorService'
import { deleteNote, readNote, updateNote } from '../noteService/noteService'

jest.mock('../noteService/noteService')
jest.mock('../errorService')

const defaultProps = {
  match: { params: { noteId: 'someNoteId' } },
  uid: 'someUid'
}

describe('Note', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => 1554907683672)
    const snapshot = {
      val() {
        return { title: 'title', body: 'body', lastModified: 1554907683672 } // 2019-04-10T16:48:03.672
      }
    }
    readNote.mockImplementation((a, b, cb) => {
      cb(snapshot)
    })
  })

  it('displays note', () => {
    console.log(moment())
    const body = 'body'
    const title = 'title'
    const note = { title, body }
    const snapshot = {
      val() {
        return note
      }
    }
    readNote.mockImplementation((a, b, cb) => {
      cb(snapshot)
    })

    const { container, getByTestId } = render(<Note {...defaultProps} />)

    expect(getByTestId('Note__title').value).toBe(title)
    expect(getByTestId('Note__body').value).toBe(body)
    expect(container.querySelector('time')).toHaveTextContent('April 10, 2019')
  })

  it('does not display error', () => {
    const { queryByTestId } = render(<Note {...defaultProps} />)

    expect(queryByTestId('Note__error')).not.toBeInTheDocument()
  })

  it('displays empty note when there is no note id in url path', () => {
    const match = { params: {} }
    const { queryByTestId } = render(<Note {...defaultProps} match={match} />)

    expect(queryByTestId('Note__title')).not.toBeInTheDocument()
    expect(queryByTestId('Note__body')).not.toBeInTheDocument()
    expect(queryByTestId('Note__error')).not.toBeInTheDocument()
  })

  it('displays and logs error when there is no note', () => {
    const snapshot = {
      val() {
        return null
      }
    }
    readNote.mockImplementation((a, b, cb) => {
      cb(snapshot)
    })

    const noteId = 'noteId'
    const match = { params: { noteId } }
    const { queryByTestId } = render(<Note {...defaultProps} match={match} />)

    expect(log).toHaveBeenCalledWith('Not able to read note: ' + noteId)
    expect(queryByTestId('Note__error')).toHaveTextContent(
      'Note cannot be found'
    )
  })

  it('displays and logs error when reading note fails', () => {
    const err = new Error('Something bad happened')

    readNote.mockImplementation((a, b, successCallback, failureCallBack) => {
      failureCallBack(err)
    })

    const match = { params: { noteId: 'non-existant' } }
    const { queryByTestId } = render(<Note {...defaultProps} match={match} />)

    expect(log).toHaveBeenCalledWith('Read note failed', err)
    expect(queryByTestId('Note__error')).toHaveTextContent(
      'Note cannot be found'
    )
  })

  it('does not display note when reading note fails', () => {
    const err = new Error('Something bad happened')

    readNote.mockImplementation((a, b, successCallback, failureCallBack) => {
      failureCallBack(err)
    })

    const match = { params: { noteId: 'non-existant' } }
    const { queryByTestId } = render(<Note {...defaultProps} match={match} />)

    expect(queryByTestId('Note__title')).not.toBeInTheDocument()
    expect(queryByTestId('Note__body')).not.toBeInTheDocument()
  })

  it('hides error after successful read', () => {
    readNote.mockImplementationOnce(
      (a, b, successCallback, failureCallBack) => {
        failureCallBack(new Error())
      }
    )

    const snapshot = {
      val() {
        return { title: 'title', body: 'body' }
      }
    }
    readNote.mockImplementationOnce((a, b, cb) => {
      cb(snapshot)
    })

    const uid = 'someUid'
    const noteId1 = 'noteId1'
    const match1 = { params: { noteId: noteId1 } }
    const prevProps = { ...defaultProps, uid, match: match1 }
    const { rerender, queryByText } = render(<Note {...prevProps} />)

    const noteId2 = 'noteId2'
    const match2 = { params: { noteId: noteId2 } }
    const props = { ...prevProps, match: match2 }
    rerender(<Note {...props} />)

    expect(queryByText('Note cannot be found')).toBeNull()
  })

  it('reads new note when note id changes', () => {
    const uid = 'someUid'
    const noteId1 = 'noteId1'
    const match1 = { params: { noteId: noteId1 } }
    const prevProps = { ...defaultProps, uid, match: match1 }
    const { rerender } = render(<Note {...prevProps} />)

    const noteId2 = 'noteId2'
    const match2 = { params: { noteId: noteId2 } }
    const props = { ...prevProps, match: match2 }
    rerender(<Note {...props} />)

    expect(readNote).toHaveBeenCalledWith(
      uid,
      noteId2,
      expect.any(Function),
      expect.any(Function)
    )
  })

  it('applies class names from props', () => {
    const { container } = render(
      <Note {...defaultProps} classNames="forty-two" />
    )

    expect(container.querySelector('.forty-two')).not.toBeNull()
  })

  it('updates note on change and handles title change', () => {
    const body = 'body'
    const title = 'title'
    const note = { title, body }
    const snapshot = {
      val() {
        return note
      }
    }
    readNote.mockImplementation((a, b, cb) => {
      cb(snapshot)
    })

    const handleTitleChange = jest.fn()
    const uid = 'uid'
    const noteId = 'noteId'
    const match = { params: { noteId } }
    const { container, getByTestId } = render(
      <Note onTitleChange={handleTitleChange} uid={uid} match={match} />
    )

    const newTitle = 'new title'
    fireEvent.input(getByTestId('Note__title'), { target: { value: newTitle } })

    const newBody = 'new body'
    fireEvent.input(getByTestId('Note__body'), { target: { value: newBody } })

    expect(updateNote).toHaveBeenCalledWith(uid, noteId, newTitle, body)
    expect(updateNote).toHaveBeenCalledWith(uid, noteId, newTitle, newBody)
    expect(handleTitleChange).toHaveBeenCalledWith({
      id: noteId,
      title: newTitle
    })
    expect(getByTestId('Note__title').value).toBe(newTitle)
    expect(getByTestId('Note__body').value).toBe(newBody)
    expect(container.querySelector('time')).toHaveTextContent('April 10, 2019')
  })

  it('deletes note and navigates back to root route', async () => {
    const noteIdToDelete = 'abc123'
    const expectedUid = 'expectedUid'

    deleteNote.mockResolvedValue()

    const push = jest.fn()
    const history = { push }
    const match = { params: { noteId: noteIdToDelete } }
    const { getByText } = await render(
      <Note history={history} match={match} uid={expectedUid} />
    )

    await fireEvent.click(getByText('Delete'))

    expect(deleteNote).toHaveBeenCalledWith(expectedUid, noteIdToDelete)
    expect(push).toHaveBeenCalledWith('/')
  })

  it('logs error when delete fails', async () => {
    const noteIdToDelete = 'abc123'
    const err = new Error('Something bad happened')

    deleteNote.mockRejectedValue(err)

    const push = jest.fn()
    const history = { push }
    const match = { params: { noteId: noteIdToDelete } }
    const expectedUid = 'expectedUid'
    const { getByText } = await render(
      <Note history={history} match={match} uid={expectedUid} />
    )

    await await fireEvent.click(getByText('Delete'))

    expect(deleteNote).toHaveBeenCalledWith(expectedUid, noteIdToDelete)
    expect(push).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith('Delete note failed', err)
  })

  it('does not display delete button when there is no title and body', async () => {
    const match = { params: {} }
    const { queryByText } = await render(
      <Note {...defaultProps} match={match} />
    )

    expect(queryByText('Delete')).toBeNull()
  })
})
