import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import CreateNote from '../CreateNote/CreateNote'
import Editor from '../Editor/Editor'
import { signInAnonymously } from '../../service/authService/authService'

import './App.css'

class App extends Component {
  constructor () {
    super()
    this.state = {}
  }

  componentDidMount () {
    signInAnonymously()
      .then(userCredentials => {
        this.setState({
          uid: userCredentials.user.uid
        })
      })
      .catch(err => {
        console.error(err)
        window.alert('Something went wrong. Please refresh the page and try again.')
      })
  }

  render () {
    return (
      <div className='App'>
        {this.state.uid &&
          <React.Fragment>
            <Route exact path='/' render={() => <CreateNote uid={this.state.uid} />} />
            <Route exact path='/:noteId' render={(props) => <Editor {...props} uid={this.state.uid} />} />
          </React.Fragment>
        }
      </div>
    )
  }
}

export default App
