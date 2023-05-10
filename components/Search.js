import React, { useEffect } from 'react'
import DispatchContext from '../DispatchContext'
import { useContext } from 'react'
import { useImmer } from 'use-immer'
import Axios from 'axios'
import { Link } from 'react-router-dom'
import Post from './Post'

function Search() {
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neither',
    requestCount: 0,
  })

  useEffect(() => {
    document.addEventListener('keyup', searchKeyPressHandler)
    return () => {
      document.removeEventListener('keyup', searchKeyPressHandler)
    }
  }, [])

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = 'loading'
      })
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++
        }) // use {} within useEffect so it doesn't default to 'return'
      }, 750)

      return () => clearTimeout(delay) //if user types faster than 3 seconds, clears timeout with each keystroke
    } else {
      setState((draft) => {
        draft.show = 'neither'
      })
    }
  }, [state.searchTerm])

  useEffect(() => {
    if (state.requestCount) {
      // Send axios request here
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post('/search', { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token }) // 1st arg: url you want to send request to, 2nd arg: data we want to send along, 3rd arg: object {canceltoken}
          setState((draft) => {
            draft.results = response.data
            draft.show = 'results'
          })
        } catch (e) {
          console.log('There was a problem or the request was cancelled')
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: 'closeSearch' })
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState((draft) => {
      draft.searchTerm = value
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => appDispatch({ type: 'closeSearch' })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={'circle-loader ' + (state.show == 'loading' ? 'circle-loader--visible' : '')}></div>
          <div className={'live-search-results ' + (state.show == 'results' ? 'live-search-results--visible' : '')}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? 'items' : 'item'} found)
                </div>
                {state.results.map((post) => {
                  return <Post post={post} key={post._id} onClick={() => appDispatch({ type: 'closeSearch' })} />
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
