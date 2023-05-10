import React, { useEffect, useState, useContext } from 'react'
import { useImmerReducer } from 'use-immer'
import Page from './Page'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Axios from 'axios'
import LoadingDotsIcon from './LoadingDotsIcon'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import NotFound from './NotFound'

function EditPost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const originalState = {
    title: {
      value: '',
      hasErrors: false,
      message: '',
    },
    body: {
      value: '',
      hasErrors: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case 'titleChange':
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case 'bodyChange':
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case 'submitRequest':
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        return
      case 'saveRequestStarted':
        draft.isSaving = true
        return
      case 'saveRequestFinished':
        draft.isSaving = false
        return
      case 'titleRules':
        // trim checks if they just enter spaces as values
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = 'You must provide a title.'
        }
        return
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = 'You must provide body content.'
        }
        return
      case 'notFound':
        draft.notFound = true
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: 'titleRules', value: state.title.value })
    dispatch({ type: 'bodyRules', value: state.body.value })
    dispatch({ type: 'submitRequest' })
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token })
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data })
          if (appState.user.username != response.data.author.username) {
            // display message when unauthorized user tries to edit a post other than their own
            appDispatch({ type: 'flashMessage', value: 'You do not have permission to edit this post' })
            // redirect to homepage
            navigate('/')
          }
        } else {
          dispatch({ type: 'notFound' })
        }
      } catch (e) {
        console.log('There was a problem or the request was cancelled.')
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
  }, [])

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' })
      const ourRequest = Axios.CancelToken.source()
      async function fetchPost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token })
          dispatch({ type: 'saveRequestFinished' })
          appDispatch({ type: 'flashMessage', value: 'Post was updated.' })
        } catch (e) {
          console.log('There was a problem or the request was cancelled.')
        }
      }
      fetchPost()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }

  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to Viewing Post
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={(e) => dispatch({ type: 'titleRules', value: e.target.value })} onChange={(e) => dispatch({ type: 'titleChange', value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={(e) => dispatch({ type: 'bodyRules', value: e.target.value })} onChange={(e) => dispatch({ type: 'bodyChange', value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" value={state.body.value} />
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? `Saving...` : `Save Updates`}
        </button>
      </form>
    </Page>
  )
}

export default EditPost
/*
import React, { useContext, useEffect, useState } from 'react'
import { useImmerReducer } from 'use-immer'
import Page from './Page'
import { useParams, Link } from 'react-router-dom'
import Axios from 'axios'
import LoadingDotsIcon from './LoadingDotsIcon'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'

function ViewSinglePost() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const originalState = {
    title: {
      value: '',
      hasErrors: false,
      message: '',
    },
    body: {
      value: '',
      hasErrors: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
  }
  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case 'titleChange':
        draft.title.value = action.value
        return
      case 'bodyChange':
        draft.body.value = action.value
        return
      case 'submitRequest':
        draft.sendCount++
        return
      case 'saveRequestStarted':
        draft.isSaving = true
        return
      case 'saveRequestFinished':
        draft.isSaving = false
        return
    }
    console.log(draft.isSaving)
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: 'submitRequest' })
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    // Solution for using async function with useEffect***
    // anytime you perform an async function within useEffect, must return "cleanup" function
    async function fetchPost() {
      try {
        // we want the value after /profile/**This value/posts to be dynamic, so we import {useParams}****
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token }) // to identify this request you need cancel token
        dispatch({ type: 'fetchComplete', value: response.data })
      } catch (e) {
        // displayed if there is a problem or request is interrupted
        console.log('There was a problem or the request was cancelled')
      }
    }
    fetchPost()
    // this will run if axios request is "unmounted" or interrupted
    return () => {
      ourRequest.cancel()
    }
  }, [])
  useEffect(() => {
    dispatch({ type: 'saveRequestStarted' })
    if (state.sendCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchPost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token }) // to identify this request you need cancel token
          dispatch({ type: 'saveRequestFinished' })
          appDispatch({ type: 'flashMessage', value: 'Post was updated.' })
        } catch (e) {
          console.log('There was a problem or the request was cancelled')
        }
      }
      fetchPost()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.sendCount])

  // when component first renders, wont immediately have post content ready to display yet
  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={(e) => dispatch({ type: 'titleChange', value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={(e) => dispatch({ type: 'bodyChange', value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" value={state.body.value} />
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  )
}

export default ViewSinglePost
*/
