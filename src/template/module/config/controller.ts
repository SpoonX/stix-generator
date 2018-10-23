import { ControllerManagerConfigType } from 'stix';
import path from 'path';

/**
 * This is where you can configure controller overrides or custom factories.
 */
export const controller: ControllerManagerConfigType = {
  locations: [ path.resolve(__dirname, '..', 'src', 'Controller') ],
};
