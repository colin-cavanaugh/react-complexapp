import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { useImmerReducer } from 'use-immer'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import ReactTooltip from 'react-tooltip/dist/react-tooltip.css'
import Axios from 'axios'
Axios.defaults.baseURL = 'http://localhost:8080'

import DispatchContext from './DispatchContext'
import StateContext from './StateContext'

// My components
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Home from './components/Home'
import Footer from './components/Footer'
import About from './components/About'
import Terms from './components/Terms'
import { useState, useReducer } from 'react'
import CreatePost from './components/CreatePost'
import ViewSinglePost from './components/ViewSinglePost'
import FlashMessages from './components/FlashMessages'
import Profile from './components/Profile'
import EditPost from './components/EditPost'
import NotFound from './components/NotFound'
import Search from './components/Search'
import Chat from './components/Chat'

// This page contains the foundation for our app.  The initialState variable assigns global items used in state
function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexappToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexappToken'),
      username: localStorage.getItem('complexappUsername'),
      avatar: localStorage.getItem('complexappAvatar'),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  }
  // Reducer should be used for state based functionality
  function ourReducer(draft, action) {
    // Spelled out actions in how our state should change
    switch (action.type) {
      case 'login':
        draft.loggedIn = true
        draft.user = action.data
        return
      case 'logout':
        draft.loggedIn = false
        return
      case 'flashMessage':
        draft.flashMessages.push(action.value)
        return
      case 'openSearch':
        draft.isSearchOpen = true
        return
      case 'closeSearch':
        draft.isSearchOpen = false
        return
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen
        return
      case 'closeChat':
        draft.isChatOpen = false
        return
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++
        return
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      // if state.loggedIn just set and it was true, this is where we would want to save into local storage
      localStorage.setItem('complexappToken', state.user.token)
      localStorage.setItem('complexappUsername', state.user.username)
      localStorage.setItem('complexappAvatar', state.user.avatar)
    } else {
      // if state.loggedIn just got set to false, remove from local storage
      localStorage.removeItem('complexappToken')
      localStorage.removeItem('complexappUsername')
      localStorage.removeItem('complexappAvatar')
    }
  }, [state.loggedIn]) // List or array of dependencies that you want to watch for changes (anytime this changes this function will run)

  // Check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      // Send axios request here
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post('/checkToken', { token: state.user.token }, { cancelToken: ourRequest.token }) // 1st arg: url you want to send request to, 2nd arg: data we want to send along, 3rd arg: object {canceltoken}
          if (!response.data) {
            dispatch({ type: 'logout' })
            dispatch({ type: 'flashMessage', value: 'Your session has expired.  Please log in again.' })
          }
        } catch (e) {
          console.log('There was a problem or the request was cancelled')
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [])

  return (
    // Global state re renders components ** important to be careful when assigning
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Routes>
            <Route path="/profile/:username/*" element={<Profile />} />
            <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
            <Route path="/post/:id" element={<ViewSinglePost />} />
            <Route path="/post/:id/edit" element={<EditPost />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector('#app'))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
/*
Import the necessary libraries and components:

React, useEffect: import React and useEffect for managing side effects in functional components.
ReactDOM: import ReactDOM for rendering React components in the browser.
useImmerReducer: import useImmerReducer for state management with immer.js.
BrowserRouter, Routes, Route: import routing components from 'react-router-dom'.
CSSTransition: import CSSTransition for handling animations during component transitions.
ReactTooltip: import ReactTooltip for displaying tooltips in the application.
Axios: import Axios for making HTTP requests.
DispatchContext, StateContext: import context providers for managing global state and actions.
Header, HomeGuest, Home, Footer, About, Terms, CreatePost, ViewSinglePost, FlashMessages, Profile, EditPost, NotFound, Search, Chat: import custom components for various parts of the application.
Set Axios default base URL:

Axios.defaults.baseURL: sets the default base URL for all Axios requests.
Create the Main component:

Define the initial state for the application.
Create ourReducer function for handling state updates.
Use useImmerReducer to manage state with ourReducer and initialState.
Use useEffect to update localStorage when state.loggedIn changes.
Use useEffect to check if the token has expired on first render.
Render the application with context providers, BrowserRouter, FlashMessages, Header, Routes, CSSTransition for search overlay, Chat, and Footer components.
Render the Main component:

Create a root with ReactDOM.createRoot and render the Main component.
Enable hot module replacement (HMR):

Check if module.hot is enabled and accept hot module updates.
*/
