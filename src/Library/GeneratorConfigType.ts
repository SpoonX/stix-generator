export type GeneratorConfigType = Partial<{
  appRoot: string;
  projectConfigDirectory: string;
  moduleRoot: string;
  dirs: {
    src: string;
    config: string;
    entity: string;
    controller: string;
  },
  templates: {
    controller: string;
    module: string;
    entityConfig: string;
    [key: string]: string;
  }
}>;
