import * as path from 'path';

const appRoot = path.resolve(process.cwd(), 'app');

const templateRoot = path.resolve(__dirname, '..', 'template');

export const generator = {
  appRoot,
  templateRoot,
  projectConfigDirectory: path.resolve(appRoot, 'config'),
  moduleRoot: path.resolve(appRoot, 'module'),
  templates: {
    controller: path.resolve(templateRoot, 'controller', 'controller.ts'),
    entity: path.resolve(templateRoot, 'entity', 'entity.ts.hs'),
    module: path.resolve(templateRoot, 'module'),
  },
};
