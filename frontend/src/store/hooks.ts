/**
 * Typed Redux hooks.
 * 
 * Use these instead of plain useDispatch and useSelector for type safety.
 */

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
