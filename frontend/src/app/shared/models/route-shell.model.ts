import type { AppRole } from './auth.model';

export type RouteAudience = 'public' | AppRole;
export type ShellTone = 'default' | 'immersive';

export interface AppRouteData {
  access?: RouteAudience[];
  navLabelKey?: string;
  pageTitleKey?: string;
  roles?: AppRole[];
  shellTone?: ShellTone;
}
