import type { Users } from 'hub:db:schema'

declare module '#auth-utils' {
  type User = Pick<Users, 'id' | 'name' | 'email' | 'avatarUrl' | 'emailVerifiedAt'>
  //
  // interface UserSession {
  //   // Add your own fields
  // }
  // interface SecureSessionData {
  //   // Add your own fields
  // }
}

export {}
