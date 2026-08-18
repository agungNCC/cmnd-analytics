let authToken = null

export const getToken = () => authToken

export const setToken = (token) => {
  authToken = token
}

export const clearToken = () => {
  authToken = null
}
