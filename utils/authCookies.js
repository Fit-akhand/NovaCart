const REFRESH_COOKIE_NAME = 'refreshtoken'
const REFRESH_COOKIE_PATH = '/api/auth/accessToken'
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60

function buildCookieParts(value, maxAge) {
  const secure = process.env.NODE_ENV === 'production'
  const parts = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(value)}`,
    'HttpOnly',
    `Path=${REFRESH_COOKIE_PATH}`,
    `Max-Age=${maxAge}`,
    'SameSite=Strict',
  ]

  if (secure) {
    parts.push('Secure')
  }

  return parts.join('; ')
}

export function setRefreshTokenCookie(res, token) {
  res.setHeader('Set-Cookie', buildCookieParts(token, REFRESH_MAX_AGE))
}

export function clearRefreshTokenCookie(res) {
  res.setHeader('Set-Cookie', buildCookieParts('', 0))
}
