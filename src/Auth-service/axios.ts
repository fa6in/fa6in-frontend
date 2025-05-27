
import axios from 'axios'
import { BaseUrl } from '../api/BaseUrl'
import AuthService from './AuthService'
import { ALert_Retourne_check_cnx, ALert_Retourne_Login } from './AlertAuth'

const api = axios.create({
  baseURL: BaseUrl
})

api.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      if (!error.response) {
        await ALert_Retourne_check_cnx()
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
  
        try {
            const refresh = AuthService.getRefreshToken()
        const res = await axios.post(`${BaseUrl}auth/token/refresh/`,  {
          refresh : refresh
        } )
           sessionStorage.setItem("access", res.data.access)


          originalRequest.headers.Authorization = `Bearer ${res.data.access}`
          return axios(originalRequest)
        } catch (error:any) {
          if(error.response.data) {
            const result = await ALert_Retourne_Login()
                if (result.isConfirmed) {
                AuthService.clearTokens()
                window.location.href = '/login'
                }
          }
            
        
    }
      }
  
      return Promise.reject(error)
    }
  )
  
export default api
