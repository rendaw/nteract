import { ofType } from "redux-observable";
import { ActionsObservable } from "redux-observable";
import { kernelspecs, ServerConfig } from "rx-jupyter";
import { empty, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";

import * as actions from "@nteract/actions";
import * as selectors from "@nteract/selectors";
import { KernelspecProps } from "@nteract/types";

export const fetchKernelspecsEpic = (
  action$: ActionsObservable<actions.FetchKernelspecs>,
  state$: any
) =>
  action$.pipe(
    ofType(actions.FETCH_KERNELSPECS),
    mergeMap((action: actions.FetchKernelspecs) => {
      const {
        payload: { hostRef, kernelspecsRef }
      } = action;
      const state = state$.value;

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig: ServerConfig = selectors.serverConfig(host);

      return kernelspecs.list(serverConfig).pipe(
        map(data => {
          const defaultKernelName = data.response.default;
          const kernelspecs: { [key: string]: KernelspecProps } = {};
          Object.keys(data.response.kernelspecs).forEach(key => {
            const value = data.response.kernelspecs[key];
            kernelspecs[key] = {
              name: value.name,
              resources: value.resources,
              argv: value.spec.argv,
              displayName: value.spec.display_name,
              env: value.spec.env,
              interruptMode: value.spec.interrupt_mode,
              language: value.spec.language,
              metadata: value.spec.metadata
            };
          });
          return actions.fetchKernelspecsFulfilled({
            hostRef,
            kernelspecsRef,
            defaultKernelName,
            kernelspecs
          });
        }),
        catchError(error => {
          return of(actions.fetchKernelspecsFailed({ kernelspecsRef, error }));
        })
      );
    })
  );
