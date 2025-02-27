import { AppState, KernelspecsByRefRecord } from "@nteract/types";

import { createSelector } from "reselect";

/**
 * Returns a ref to the kernelspec of the kernel the nteract application
 * is currently connected to.
 *
 * @param   state   The state of the nteract application
 *
 * @returns         A ref to the kernelspec
 */
export const currentKernelspecsRef = (state: AppState) =>
  state.core.currentKernelspecsRef;

/**
 * Returns a Map of the kernelspecs associated with each kernelspec ref.
 *
 * @param state   The state of the nteract application
 *
 * @returns        An association between a kernelspec ref and the kernelspec
 */
export const kernelspecsByRef = (state: AppState) =>
  state.core.entities.kernelspecs.byRef;

/**
 * Returns the kernelspec of the kernel that the nteract application is
 * currently connected to.
 */
export const currentKernelspecs: (
  state: AppState
) => KernelspecsByRefRecord | null | undefined = createSelector(
  [currentKernelspecsRef, kernelspecsByRef],
  (ref, byRef) => (ref ? byRef.get(ref) : null)
);
