import versionData from '../../version.json';
import {AppEnvironment} from './adConfig';

export const APP_VERSION_NAME = versionData.versionName;
export const APP_VERSION_CODE = versionData.versionCode;
export const APP_BUILD_DATE = versionData.buildDate;

/**
 * Returns formatted version string with environment suffix.
 * - PROD: "v1.0.2"
 * - DEV:  "v1.0.2-dev"
 * - UAT:  "v1.0.2-uat"
 */
export function getAppVersionDisplay(env: AppEnvironment): string {
  const envConfig = versionData.environments[env];
  const suffix = envConfig ? envConfig.suffix : '';
  return `v${APP_VERSION_NAME}${suffix}`;
}

/**
 * Returns full technical version string with build code.
 * E.g. "v1.0.2 (Build 3)" or "v1.0.2-dev (Build 3)"
 */
export function getFullVersionString(env: AppEnvironment): string {
  return `${getAppVersionDisplay(env)} (Build ${APP_VERSION_CODE})`;
}
