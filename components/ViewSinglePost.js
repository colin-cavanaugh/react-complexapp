import React, { useEffect, useState, useContext } from 'react'
import Page from './Page'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Axios from 'axios'
import LoadingDotsIcon from './LoadingDotsIcon'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import NotFound from './NotFound'
// app wide state
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'

function ViewSinglePost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const { id } = useParams()
  // setting up two pieces of state:
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    // Solution for using async function with useEffect***
    // anytime you perform an async function within useEffect, must return "cleanup" function
    async function fetchPost() {
      try {
        // we want the value after /profile/**This value/posts to be dynamic, so we import {useParams}****
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token }) // to identify this request you need cancel token
        // update piece of state with posts:
        setPost(response.data)
        // loading has completed:
        setIsLoading(false)
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
  }, [id])

  if (!isLoading && !post) {
    return <NotFound />
  }

  // when component first renders, wont immediately have post content ready to display yet
  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  const date = new Date(post.createdDate)
  // format dateObject
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username
    }
    return false
  }

  async function deleteHandler() {
    const areYouSure = window.confirm('Do you really want to delete this post?')
    if (areYouSure) {
      try {
        // send off axios request to delete post
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } })
        // backend setup to display "success" when successful
        if (response.data == 'Success') {
          // 1. display a flash message
          appDispatch({ type: 'flashMessage', value: 'Post was successfully deleted.' })

          // 2. redirect back to current user's profile
          navigate(`/profile/${appState.user.username}`)
        }
      } catch (e) {
        console.log('There was a problem')
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tooltip-content="Edit" data-tooltip-id="edit" className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{' '}
            <a onClick={deleteHandler} data-tooltip-content="Delete" data-tooltip-id="delete" className="delete-post-button text-danger">
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>
      <div className="body-content">
        <ReactMarkdown children={post.body} allowedElements={['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li']} />
      </div>
    </Page>
  )
}

export default ViewSinglePost
