import React from 'react'
import { Link } from 'react-router-dom'

import './NoteListItem.css'

export interface Props {
  isSelected: boolean
  noteId: string
  title: string
}

export default function NoteListItem(props: Props) {
  const { isSelected, noteId, title } = props
  let classNames = 'NoteListItem '
  if (isSelected) {
    classNames += 'NoteListItem--selected'
  }

  return (
    <Link data-testid="NoteListItem" className={classNames} to={'/' + noteId}>
      {title || 'Untitled'}
    </Link>
  )
}
