import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ContentEditable from 'react-contenteditable'

import { readNote, updateNote } from '../../service/noteService/noteService'

import './Note.css'

export default class Note extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleBodyChange = this.handleBodyChange.bind(this)
  }

  renderErrorMessage () {
    this.setState({
      title: 'Note cannot be found',
      body: ''
    })
  }

  readNote () {
    const successCallback = (snapshot) => {
      const note = snapshot.val()

      if (note === null) {
        console.error('Not able to read note: ' + this.props.match.params.noteId)
        this.renderErrorMessage()
      } else {
        this.setState({
          title: note.title,
          body: note.body
        })
      }
    }

    const failureCallback = (err) => {
      console.error(err)
      this.renderErrorMessage()
    }

    readNote(this.props.uid, this.props.match.params.noteId, successCallback, failureCallback)
  }

  handleTitleChange (e) {
    this.setState({title: e.target.value})
    updateNote(this.props.uid, this.props.match.params.noteId, e.target.value, this.state.body)
  }

  handleBodyChange (e) {
    this.setState({body: e.target.value})
    updateNote(this.props.uid, this.props.match.params.noteId, this.state.title, e.target.value)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.match.params.noteId !== prevProps.match.params.noteId) {
      this.readNote()
    }
  }

  componentDidMount () {
    this.readNote()
  }

  render () {
    let classNames = 'Note '
    if (this.props.classNames) {
      classNames += this.props.classNames
    }

    const shouldRenderTitle = this.state.title || this.state.title === ''
    const shouldRenderBody = this.state.body || this.state.body === ''

    return (
      <div className={classNames}>
        {shouldRenderTitle && <ContentEditable className='Note-title'
          html={this.state.title}
          onChange={this.handleTitleChange}
        />}
        {shouldRenderBody && <ContentEditable className='Note-body'
          html={this.state.body}
          onChange={this.handleBodyChange}
        />}
      </div>
    )
  }
}

Note.propTypes = {
  uid: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      noteId: PropTypes.string.isRequired
    })
  }).isRequired,
  classNames: PropTypes.string
}
