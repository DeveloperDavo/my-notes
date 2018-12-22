import React from 'react'
import PropTypes from 'prop-types'

import Note from '../Note/Note'
import Main from '../Main/Main'
import { readNote, updateNote } from '../../service/noteService/noteService'

import deviceWidths from '../../deviceWidths'

import './Container.css'

export default class Container extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      note: null,
      isError: false
    }

    this.handleTitleChange = this.handleTitleChange.bind(this)
  }

  readNote () {
    const successCallback = (snapshot) => {
      const note = snapshot.val()

      if (note === null) {
        console.error('Not able to read note: ' + this.props.match.params.noteId)
        this.setState({isError: true})
      } else {
        this.setState({note})
      }
    }

    const failureCallback = (err) => {
      console.error(err)
      this.setState({isError: true})
    }

    readNote(this.props.uid, this.props.match.params.noteId, successCallback, failureCallback)
  }

  handleTitleChange (title) {
    this.setState({
      note: {...this.state.note, title}
    })

    updateNote(this.props.uid, this.props.match.params.noteId, title, this.state.note.body)
  }

  componentDidMount () {
    if (this.props.match.params && this.props.match.params.noteId) {
      this.readNote()
    }
  }

  render () {
    const currentNote = this.state.note ? {id: this.props.match.params.noteId, ...this.state.note} : {}
    const largerScreenContainer = (
      <div className='Container Container--not-small'>
        <Main classNames='Main--not-small' currentNote={currentNote} uid={this.props.uid} match={this.props.match} />
        <Note classNames='Note--not-small' isError={this.state.isError} note={this.state.note} onTitleChange={this.handleTitleChange} {...this.props} />
      </div>
    )
    return (
      window.innerWidth < deviceWidths.small
        ? <Note isError={this.state.isError} note={this.state.note} onTitleChange={() => {}} {...this.props} />
        : largerScreenContainer
    )
  }
}

Container.propTypes = {
  uid: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      noteId: PropTypes.string
    })
  }).isRequired
}
