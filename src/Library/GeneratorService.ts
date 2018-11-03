import { Config, ControllerType, inject, Output } from 'stix';
import { File } from 'tape-roller';
import * as path from 'path';
import * as fs from 'fs';
import { GeneratorConfigType } from './GeneratorConfigType';
import { formatNames, NameFormatsType } from './formatNames';
import { Manipulator } from './Manipulator';
import { Scope } from 'ts-simple-ast';
import * as util from 'util';
import { TypeMap } from './Manipulator/TypeMap';

export class GeneratorService {
  @inject(Config)
  private config: Config;

  // If module doesn't exist, call generator to make it first.
  public async generateController ({ name, module, crud }: { name: string, module: string, crud?: boolean }) {
    const { config, nameFormats } = this.prepare(name);
    const { dirs } = config;
    const controllerClass = `${nameFormats.pascalCased}Controller`;
    const exportString = `export * from './${controllerClass}';\n`;
    const moduleDir = this.pathTo(module);
    const parameters: { [key: string]: string } = { ... nameFormats };
    const controllerDir = this.pathTo(
      module,
      dirs.src,
      dirs.controller,
    );

    try {
      await util.promisify(fs.stat)(moduleDir);
    } catch (error) {
      await this.generateModule({ name: module });
    }

    const controllerIndexFile = path.resolve(controllerDir, 'index.ts');

    if (crud) {
      parameters.decorators = `@dbActions(${nameFormats.pascalCased})\n`;
      parameters.imports = [
        "import { dbActions } from 'stix-wetland';",
        `import { ${nameFormats.pascalCased} } from '../Entity/${nameFormats.pascalCased}';`,
      ].join('\n') + '\n';
    }

    await File.generate(config.templates.controller, path.resolve(controllerDir, `${controllerClass}.ts`), parameters);

    try {
      await util.promisify(fs.stat)(controllerIndexFile);
      await File.modify(controllerIndexFile, /\n$/, { append: exportString });
    } catch (error) {
      await util.promisify(fs.writeFile)(controllerIndexFile, exportString, 'utf8');
    }
  }

  public pathTo (module: string, ...segments: string[]) {
    const config = this.config.of<GeneratorConfigType>('generator');

    if (!module) {
      return path.resolve(config.appRoot, ...segments);
    }

    return path.resolve(config.moduleRoot, formatNames(module).pascalCased, ...segments);
  }

  manipulatorFor (module: string, ...segments: string[]) {
    const pathTo = this.pathTo(module, ...segments);

    return this.getAstManipulator(pathTo);
  }

  public async generateAction (options: ActionOptions) {
    const { controller, module, action, route, method } = options;
    const { config: { dirs }, nameFormats: { pascalCased } } = this.prepare(controller);
    const controllerClassName = `${pascalCased}Controller`;
    const controllerFile = this.pathTo(module, dirs.src, dirs.controller, `${controllerClassName}.ts`);

    // Make sure controller exists.
    try {
      await util.promisify(fs.stat)(controllerFile);
    } catch (error) {
      await this.generateController({ name: options.controller, module });
    }

    const manipulator = this.getAstManipulator(controllerFile);

    manipulator.ensureImport('stix', 'ContextInterface', 'Response');

    manipulator.useClass(controllerClassName).addMethod({
      isAsync: true,
      scope: Scope.Public,
      bodyText: `return this.internalServerErrorResponse('To be implemented.');`,
      parameters: [ { name: 'ctx', type: 'ContextInterface' } ],
      returnType: 'Promise<Response>',
      name: action,
    });

    await this.addRoute(module, { route, method, action, controller, controllerClassName });

    return manipulator.save();
  }

  public async generateEntity (options: EntityOptions) {
    const { config: { templates, dirs: { src, entity, config } }, nameFormats } = this.prepare(options.name);
    const { module } = options;
    const className = nameFormats.pascalCased;
    const entityPath = this.pathTo(module, src, entity, `${className}.ts`);
    const manipulator = this.getAstManipulator(entityPath, true);
    const wetlandConfigFile = this.pathTo(module, config, 'wetland.ts');
    const configIndexFile = this.pathTo(module, config, 'index.ts');

    manipulator.ensureImport('wetland', 'entity', 'autoFields');

    try {
      await util.promisify(fs.stat)(this.pathTo(module));
    } catch (error) {
      await this.generateModule({ name: module });
    }

    try {
      await util.promisify(fs.stat)(wetlandConfigFile);
    } catch (error) {
      await File.modify(configIndexFile, /\n$/, { append: `export * from './wetland';\n` });
      await File.copy(templates.entityConfig, wetlandConfigFile);
    }

    const classDeclaration = manipulator.createClass({
      isExported: true,
      name: className,
      decorators: [
        { name: 'entity', arguments: [] },
        { name: 'autoFields', arguments: [] },
      ],
    });

    const fields = (Array.isArray(options.field) ? options.field : [ options.field ])
      .map(field => this.createField(manipulator, field));

    classDeclaration
      .addProperties(fields)
      .slice(0, -1)
      .forEach(p => p.appendWhitespace(writer => writer.newLine()));

    return manipulator.save();
  }

  createField (manipulator: Manipulator, field: string) {
    const parameters: { [key: string]: { [key: string]: string } } = {};
    const paramsRegex = /\.(\w+)(?:\((.*?)\))?(?=\.|$)/g;
    const normalized = field
      .replace(/(^\w+(?!:)\w+)$/, '$1:string')
      .replace(/^(\w+):(.*?)$/g, '$1.field(type:$2)');

    const parts = normalized.split('.');
    const name = parts.shift();
    const paramsString = '.' + parts.join('.');

    let match: string[];

    while (match = paramsRegex.exec(paramsString)) {
      manipulator.ensureImport('wetland', match[1]);

      if (!match[2]) {
        parameters[match[1]] = null;

        continue;
      }

      parameters[match[1]] = match[2]
        .split(',')
        .map(rawParam => rawParam.split(':').map(x => x.trim()))
        .reduce((params: { [key: string]: string }, paramSet: string[]) => {
          params[paramSet[0]] = paramSet[1];

          return params;
        }, {});
    }

    return this.createProperty(manipulator, name, parameters);
  }

  createProperty (manipulator: Manipulator, name: string, options: any = {}) {
    const type = options.field && options.field.type ? options.field.type : 'string';
    const propertyType = type === 'enumeration' ? manipulator.createEnumeration(name, options.enumeration) : TypeMap[type] || type;

    if (options.field && options.field.defaultTo === 'now()') {
      manipulator.ensureImport('wetland', 'Mapping');
    }

    const decorators = Object.keys(options).map(property => {
      const decoratorParams = !options[property] ? null : util.inspect(options[property], { depth: null })
        .replace('\n', '')
        .replace("'now()'", 'Mapping.now()');

      return { name: property, arguments: decoratorParams ? [ decoratorParams ] : [] };
    });

    return { name, scope: Scope.Public, type: propertyType, decorators };
  }

  public async addRoute (
    module: string,
    routeOptions: { route: string, method: string, controller: string, controllerClassName?: string, action?: string },
    helper: { specifier: string, name: string } = { specifier: 'stix', name: 'Route' },
  ) {
    const { action, controller, controllerClassName, method = 'get' } = routeOptions;
    const className = controllerClassName || `${formatNames(controller).pascalCased}Controller`;
    const route = routeOptions.route || `${controller}/${action}`;
    const actionArgument = action ? ", '${action}'" : '';
    const routeString = `${helper.name}.${method}('${route}', ${className}${actionArgument}),\n`;
    const { config: { dirs } } = this.prepare(module);
    const routerFile = this.pathTo(module, dirs.config, 'router.ts');
    const manipulator = this.getAstManipulator(routerFile);

    manipulator.ensureImport(helper.specifier, helper.name);
    manipulator.ensureImport(path.join('..', dirs.src, dirs.controller), className);

    const replacer = (match: string, opening: string, spaces: string, closing: string, backupSpaces: string) => {
      return `${opening}${spaces || backupSpaces.repeat(2)}${routeString}${closing}`;
    };

    const declaration = manipulator.getFile().getVariableDeclaration('router');
    const initializer = declaration
      .getInitializer()
      .getText()
      .replace(/(routes(?: *):(?: *)\[\n(?:(?:( +).*?,\n)+)?)(( +)])/m, replacer);

    declaration.setInitializer(initializer);

    manipulator.getFile().formatText();

    return manipulator.save();
  }

  public getAstManipulator (file: string, create: boolean = false) {
    const manipulator = new Manipulator();

    create ? manipulator.create(file) : manipulator.load(file);

    return manipulator;
  }

  public async generateModule ({ name }: { name: string }) {
    const { config, nameFormats } = this.prepare(name);
    const modulePath = path.resolve(config.moduleRoot, nameFormats.pascalCased);
    const importName = `${nameFormats.pascalCased}Module`;

    await File.mkdir(modulePath);

    const file = await File.readGlob('**/*', { cwd: config.templates.module });

    await file.replace(nameFormats).write(modulePath);

    await File
      .read(path.resolve(config.appRoot, 'config', 'modules.ts'))
      .addImport(`../module/${nameFormats.pascalCased}`, importName)
      .modify(/( +)\w+,?\n];\s*$/, { custom: (match: string, space: string) => `${space}${importName},\n${match}` })
      .update();
  }

  private prepare (name: string): { config: GeneratorConfigType, nameFormats: NameFormatsType } {
    return {
      config: this.config.of<GeneratorConfigType>('generator'),
      nameFormats: formatNames(name),
    };
  }
}

export type EntityOptions = { module?: string, name: string, field: string[], relation: string[] };
export type ActionOptions = { controller: string, route: string, action: string, method: string, module?: string };
