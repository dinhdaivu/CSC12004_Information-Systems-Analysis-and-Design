export const AUTH_ROUTES = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: () => ({})  // TODO: Implement LoginComponent
  },
  {
    path: 'register',
    component: () => ({})  // TODO: Implement RegisterComponent
  },
  {
    path: 'forgot-password',
    component: () => ({})  // TODO: Implement ForgotPasswordComponent
  }
];
