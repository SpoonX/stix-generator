import { ModuleInterface } from 'stix';
import * as config from '../config';

/**
 * This file is the main class of your module.
 * This is where stix will collect the configuration and call init() and/or onBootstrap().
 */
export class Module implements ModuleInterface {
  getConfig () {
    return config;
  }
}
