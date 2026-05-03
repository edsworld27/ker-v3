// /felicias-login — frozen reference of Felicia's customer login surface.
//
// Renders the same component tree as /account so the "perfect portal"
// reference is a single navigable URL. When logged out, shows the
// AuthForm with admin-access link. When logged in, shows the dashboard.
// Useful as a stable bookmark + as a template for future portal work.

export { default } from "../account/page";
