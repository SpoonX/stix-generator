import * as path from 'path';

const appRoot = path.resolve(process.cwd(), 'app');

const templateRoot = path.resolve(__dirname, '..', 'template');

export const generator = {
  appRoot,
  templateRoot,
  projectConfigDirectory: path.resolve(appRoot, 'config'),
  moduleRoot: path.resolve(appRoot, 'module'),
  dirs: {
    config: 'config',
    src: 'src',
    entity: 'Entity',
    controller: 'Controller',
  },
  templates: {
    controller: path.resolve(templateRoot, 'controller', 'controller.ts'),
    module: path.resolve(templateRoot, 'module'),
  },
};
