import { useEffect, useCallback, useState } from 'react'
import axios from "axios"
import {toast} from 'react-toastify'


let logoutTimer

export const useAuth = () => {
  const [token, setToken] = useState()
  const [tokenExpirationDate, setTokenExpirationDate] = useState()
  const [userId, setUserId] = useState(false)

  const setAxiosToken = (token) => {
    axios.defaults.headers["Authorization"] = "Bearer " + token;
  } 

  const login = useCallback((uid, token, expirationDate) => {
    setToken(token)
    setUserId(uid)
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60)
    setTokenExpirationDate(tokenExpirationDate)
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        token,
        expiration: tokenExpirationDate.toISOString()
      })
    )
    setAxiosToken(token)
  }, [])


  const logout = useCallback(() => {
    setToken(null)
    setTokenExpirationDate(null)
    setUserId(null)
    localStorage.removeItem('userData')
    toast.success("Vous êtes bien deconnecté ✅")
  }, [])

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'))
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      )
    }
  }, [login])

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime()
      logoutTimer = setTimeout(logout, remainingTime)
    } else {
      clearTimeout(logoutTimer)
    }
  }, [logout, token, tokenExpirationDate])

  return { token, login, logout, userId }
}
