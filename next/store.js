import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'
import fetch from 'isomorphic-unfetch'
import { groupBy, keyBy, omit, omitBy } from 'lodash'

const initialState = {
  isFetching: false,
  error: null,
  byId: {},
  byBatch: {},
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_SAMPLES_REQUEST': {
      return { ...state, isFetching: true }
    }
    case 'FETCH_SAMPLES_SUCCESS': {
      const { json } = action
      const byId = keyBy(json, '_id')
      return {
        ...state,
        byId,
        byBatch: groupBy(json.map(s => s._id), id => byId[id].batch),
        isFetching: false,
      }
    }
    case 'FETCH_SAMPLES_ERROR': {
      return {
        ...state,
        isFetching: false,
        error: action.error
      }
    }
    case 'DELETE_SAMPLES': {
      const { batch } = action
      return {
        ...state,
        byId: omitBy(state.byId, { batch }),
        byBatch: omit(state.byBatch, batch),
      }
    }
    case 'UPDATE_SAMPLE': {
      const { id, sample } = action
      return {
        ...state,
        byId: {
          ...state.byId,
          [id]: { ...state.byId[id], ...sample }
        },
      }
    }
    default: {
      return state
    }
  }
}

export const fetchSamples = () => async dispatch => {
  dispatch({ type: 'FETCH_SAMPLES_REQUEST' })
  try {
    const res = await fetch('/api/debug'),
      json = await res.json()
    dispatch({ type: 'FETCH_SAMPLES_SUCCESS', json })
  } catch(error) {
    console.log(error)
    dispatch({ type: 'FETCH_SAMPLES_ERROR', error })
  }
}

export const updateSample = (id, sample) => async dispatch => {
  fetch(`/api/debug?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify(sample),
  })
  dispatch({ type: 'UPDATE_SAMPLE', id, sample })
}

export const deleteSamples = batch => async dispatch => {
  fetch(`/api/debug?batch=${batch}`, { method: 'DELETE' })
  dispatch({ type: 'DELETE_SAMPLES', batch })
}

export function initializeStore(state = initialState) {
  return createStore(reducer, state, composeWithDevTools(applyMiddleware(thunkMiddleware)))
}
