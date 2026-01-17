// Wrapper sécurisé pour sessionStorage
const isClient = typeof window !== 'undefined';

const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isClient) return null;
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.error('SessionStorage access error:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isClient) return;
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.error('SessionStorage set error:', e);
    }
  },
  removeItem: (key: string): void => {
    if (!isClient) return;
    sessionStorage.removeItem(key);
  },
  clear: (): void => {
    if (!isClient) return;
    sessionStorage.clear();
  }
};

const AuthService = {
  // Tokens
  getAccessToken: (): string | null => safeSessionStorage.getItem('access'),
  getRefreshToken: (): string | null => safeSessionStorage.getItem('refresh'),
  
  // Informations utilisateur
  getUserId: (): string | null => safeSessionStorage.getItem('id'),
  getUsername: (): string | null => safeSessionStorage.getItem('username'),
  getEmail: (): string | null => safeSessionStorage.getItem('email'),
  getFirstName: (): string | null => safeSessionStorage.getItem('first_name'),
  getLastName: (): string | null => safeSessionStorage.getItem('last_name'),
  getFullName: (): string | null => {
    const firstName = safeSessionStorage.getItem('first_name');
    const lastName = safeSessionStorage.getItem('last_name');
    return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null;
  },
  getRole: (): string | null => safeSessionStorage.getItem('role'),
  getPhoneNumber: (): string | null => safeSessionStorage.getItem('phone_number'),
  getProfileImage: (): string | null => safeSessionStorage.getItem('profile_image'),
  getGrade: (): string | null => safeSessionStorage.getItem('grade'),
  getSchool: (): string | null => safeSessionStorage.getItem('school'),
  getDateJoined: (): string | null => safeSessionStorage.getItem('date_joined'),
  getLastLogin: (): string | null => safeSessionStorage.getItem('last_login'),
  getIsActive: (): boolean => safeSessionStorage.getItem('is_active') === 'true',

  // Setters
  setAccessToken: (token: string): void => safeSessionStorage.setItem('access', token),
  setRefreshToken: (token: string): void => safeSessionStorage.setItem('refresh', token),
  setUserId: (id: number): void => safeSessionStorage.setItem('id', id.toString()),
  setUsername: (username: string): void => safeSessionStorage.setItem('username', username),
  setEmail: (email: string): void => safeSessionStorage.setItem('email', email),
  setFirstName: (firstName: string): void => safeSessionStorage.setItem('first_name', firstName),
  setLastName: (lastName: string): void => safeSessionStorage.setItem('last_name', lastName),
  setRole: (role: string): void => safeSessionStorage.setItem('role', role),
  setPhoneNumber: (phoneNumber: string): void => safeSessionStorage.setItem('phone_number', phoneNumber),
  setProfileImage: (image: string | null): void => safeSessionStorage.setItem('profile_image', image || ''),
  setGrade: (grade: string | null): void => safeSessionStorage.setItem('grade', grade || ''),
  setSchool: (school: string | null): void => safeSessionStorage.setItem('school', school || ''),
  setDateJoined: (date: string): void => safeSessionStorage.setItem('date_joined', date),
  setLastLogin: (date: string): void => safeSessionStorage.setItem('last_login', date),
  setIsActive: (isActive: boolean): void => safeSessionStorage.setItem('is_active', isActive.toString()),

  // Méthodes de gestion des données
  clearTokens: (): void => {
    const keysToRemove = [
      'access', 'refresh', 'id', 'username', 'email', 'first_name', 'last_name',
      'role', 'phone_number', 'profile_image', 'grade', 'school',
      'date_joined', 'last_login', 'is_active'
    ];
    
    keysToRemove.forEach(key => safeSessionStorage.removeItem(key));
  },

  logout: (): void => {
    const userKeys = [
      'access', 'refresh', 'id', 'username', 'email', 'first_name', 'last_name',
      'role', 'phone_number', 'profile_image', 'grade', 'school',
      'date_joined', 'last_login', 'is_active'
    ];
    
    userKeys.forEach(key => safeSessionStorage.removeItem(key));
  },

  isAccessTokenExpired: (): boolean => {
    const accessToken = AuthService.getAccessToken();
    if (!accessToken) return true;

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch (e) {
      console.error("Token verification error", e);
      return true;
    }
  },

  isAuthenticated: (): boolean => {
    return !!AuthService.getAccessToken();
  },

  getUserInfo: () => ({
    id: AuthService.getUserId(),
    username: AuthService.getUsername(),
    email: AuthService.getEmail(),
    first_name: AuthService.getFirstName(),
    last_name: AuthService.getLastName(),
    full_name: AuthService.getFullName(),
    role: AuthService.getRole(),
    phone_number: AuthService.getPhoneNumber(),
    profile_image: AuthService.getProfileImage(),
    grade: AuthService.getGrade(),
    school: AuthService.getSchool(),
    date_joined: AuthService.getDateJoined(),
    last_login: AuthService.getLastLogin(),
    is_active: AuthService.getIsActive()
  }),

  // Méthode pour stocker toutes les données de login en une fois
  setLoginData: (data: any): void => {
    if (!data) return;

    // Stocker les tokens
    if (data.access) AuthService.setAccessToken(data.access);
    if (data.refresh) AuthService.setRefreshToken(data.refresh);
    
    // Stocker les informations utilisateur
    if (data.user) {
      const user = data.user;
      
      if (user.id) AuthService.setUserId(user.id);
      if (user.username) AuthService.setUsername(user.username);
      if (user.email) AuthService.setEmail(user.email);
      if (user.first_name) AuthService.setFirstName(user.first_name);
      if (user.last_name) AuthService.setLastName(user.last_name);
      if (user.role) AuthService.setRole(user.role);
      if (user.phone_number) AuthService.setPhoneNumber(user.phone_number);
      if (user.profile_image !== undefined) AuthService.setProfileImage(user.profile_image);
      if (user.grade !== undefined) AuthService.setGrade(user.grade);
      if (user.school !== undefined) AuthService.setSchool(user.school);
      if (user.date_joined) AuthService.setDateJoined(user.date_joined);
      if (user.last_login) AuthService.setLastLogin(user.last_login);
      if (user.is_active !== undefined) AuthService.setIsActive(user.is_active);
    }
  }
};

export default AuthService;