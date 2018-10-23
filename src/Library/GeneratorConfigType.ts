export type GeneratorConfigType = Partial<{
  appRoot: string;
  projectConfigDirectory: string;
  moduleRoot: string;
  templates: {
    controller: string;
    module: string;
    [key: string]: string;
  }
}>;
