import React from 'react'
import PropTypes from 'prop-types'

import CreateNote from '../CreateNote/CreateNote'
import NoteList from '../NoteList/NoteList'

import './Main.css'

export default function Main (props) {
  let classNames = 'Main '
  if (props.classNames) {
    classNames += props.classNames
  }

  return (
    <div className={classNames}>
      <CreateNote uid={props.uid} />
      <NoteList uid={props.uid} match={props.match} />
    </div>
  )
}

Main.propTypes = {
  classNames: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      noteId: PropTypes.string.isRequired
    })
  }),
  uid: PropTypes.string.isRequired
}
