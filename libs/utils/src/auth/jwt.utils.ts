import {JwtRequest, JWT} from './jwt.types'

/**
 * Return a boolean indicating whether a user is present on the request.
 */
export const isAuthenticated = (req: JwtRequest): boolean => Boolean(req.user)

/**
 * Return the user parameter on requests if present.
 */
export const getUser = (req: JwtRequest): JWT | undefined => req.user

/**
 * Return the user sub parameter on requests if present.
 */
export const getUserSub = (req: JwtRequest): string | undefined => req.user?.sub
