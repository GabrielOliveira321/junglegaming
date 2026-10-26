const AUTH_TOKEN_KEY = "kurio-auth-token";
const AUTH_TOKEN_CHANGED_EVENT = "kurio-auth-token-changed";

function parseUserIdFromToken(token: string) {
  const tokenParts = token.split("-");
  if (tokenParts.length >= 3 && tokenParts[0] === "token") {
    return `${tokenParts[1]}-${tokenParts[2]}`;
  }

  return null;
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CHANGED_EVENT));
  }
}

export function getAuthScopeKey() {
  const token = getAuthToken();
  if (!token) {
    return "guest";
  }

  const userId = parseUserIdFromToken(token);
  if (userId) {
    return userId;
  }

  return token;
}

export function getAuthUserId() {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  return parseUserIdFromToken(token);
}

export function getAuthTokenChangedEventName() {
  return AUTH_TOKEN_CHANGED_EVENT;
}
