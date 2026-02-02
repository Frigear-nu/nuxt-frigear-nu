import type { Users } from '@nuxthub/db/schema'
import type { ExtendableJwtPayload } from '@nitrotool/jwt/core'

type SessionUser = Pick<Users, 'id' | 'name' | 'email' | 'avatarUrl' | 'emailVerifiedAt'>

declare module '#auth-utils' {
  interface User extends SessionUser {
    sbId?: string
  }
  //
  // interface UserSession {
  //   // Add your own fields
  // }
  // interface SecureSessionData {
  //   // Add your own fields
  // }
}
//
declare module 'h3' {
  interface H3EventContext {
    $user?: SessionUser
    $jwt?: ExtendableJwtPayload
  }
}

export {}
