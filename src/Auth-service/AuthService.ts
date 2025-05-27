
const AuthService = {
    getAccessToken: () => {
      return sessionStorage.getItem('access')
    },
    
    getRefreshToken: () => {
      return sessionStorage.getItem('refresh_token')
    },
    
    getRoleUserConnect: () => {
      return sessionStorage.getItem('role')
    },
    getPostUserConnect: () => {
      return sessionStorage.getItem('post')
    },
    getPoitUserConnect: () => {
      return sessionStorage.getItem('poit')
    },
    getFullNameUserConnect: () => {
      return sessionStorage.getItem('nom')
    },
    getIDUserConnect: () => {
      return sessionStorage.getItem('id')
    },
    getAGENCEUserConnect: () => {
      return sessionStorage.getItem('agence')
    },
    setAccessToken: (token:string) => {
      sessionStorage.setItem("access", token)

    },
    setRefreshToken: (token:string) => {
      sessionStorage.setItem("refresh_token", token)

    },
  
  
    clearTokens: () => {
 
      sessionStorage.clear()
    },
  
    isAccessTokenExpired: () => {
      const accessToken = AuthService.getAccessToken()
      if (!accessToken) {
        return true 
      }
  
      const expirationTimestamp = parseInt(accessToken, 10)
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const expirationTimeWith3Minutes = expirationTimestamp + (1 * 60)
      return expirationTimeWith3Minutes < currentTimestamp
    },
  
    isAuthenticated: () => {
      return !!AuthService.getAccessToken() && !AuthService.isAccessTokenExpired()
    }
  }
  
  export default AuthService
  