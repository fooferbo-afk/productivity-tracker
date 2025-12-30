/**
 * Auth API methods.
 */

import { post, get, patch } from './client';
import type { Therapist, TherapistUpdate } from '../types';

/**
 * Register or get current therapist profile.
 */
export async function registerOrGetTherapist(): Promise<Therapist> {
  return post<Therapist>('/auth/register');
}

/**
 * Get current authenticated therapist.
 */
export async function getCurrentTherapist(): Promise<Therapist> {
  return get<Therapist>('/auth/me');
}

/**
 * Update current therapist profile.
 */
export async function updateTherapist(data: TherapistUpdate): Promise<Therapist> {
  return patch<Therapist>('/auth/me', data);
}
