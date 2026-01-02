import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const canDeactivateGuard = (
  component: CanComponentDeactivate
): Observable<boolean> | Promise<boolean> | boolean => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
