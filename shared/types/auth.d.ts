import type { Users } from 'hub:db:schema'

declare module '#auth-utils' {
  interface User extends Pick<Users, 'id' | 'name' | 'email' | 'avatarUrl' | 'emailVerifiedAt'> {}

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {}
