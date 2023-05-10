import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import LoadingDotsIcon from './LoadingDotsIcon'

// Runs anytime state changes or any parent props that are being passed into it change
function ProfileFollowing(props) {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  //piece of state that will store raw data for all of the posts
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    // Solution for using async function with useEffect***
    async function fetchPosts() {
      try {
        // we want the value after /profile/**This value/posts to be dynamic, so we import {useParams}****
        const response = await Axios.get(`/profile/${username}/following`, { cancelToken: ourRequest.token })
        // update piece of state with posts:
        setPosts(response.data)
        // loading has completed:
        setIsLoading(false)
      } catch (e) {
        console.log('There was a problem')
      }
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])
  // display for when page is loading
  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link key={index} to={`/profile/${follower.username}`} /*Show unique post*/ className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollowing
