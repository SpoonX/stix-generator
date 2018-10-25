import { Config, inject, Output } from 'stix';
import { File } from 'tape-roller';
import * as path from 'path';
import { GeneratorConfigType } from './GeneratorConfigType';

export class GeneratorService {
  @inject(Config)
  private config: Config;

  public async generateController ({ name, field }: { name: string, field: string | string[] }) {
    const { config, nameFormats } = this.prepare(name);
    const { pascalCased } = nameFormats;
    const fields = Array.isArray(field) ? field : [ field ];



    const parameters = {
      ...nameFormats,
      imports: [
        `import { dbActions } from 'stix-wetland';`,
        `import { ${pascalCased} } from '../Entity/${pascalCased}';`,
      ].join('\n'),
      dbActions: '@dbActions(pascalCased)\n',
    };

    const destination = path.resolve(config.moduleRoot, pascalCased, 'src', `${pascalCased}Controller`);


    await File.generate(config.templates.controller, destination, this.formatNames(name));
  }

  public async generateModule ({ name }: { name: string }) {
    const { config, nameFormats } = this.prepare(name);
    const modulePath = path.resolve(config.moduleRoot, nameFormats.pascalCased);
    const importName = `${nameFormats.pascalCased}Module`;
    const file = await File.readGlob('**/*', { cwd: config.templates.module });

    await file.replace(nameFormats).write(modulePath);

    await File
      .read(path.resolve(config.appRoot, 'config', 'modules.ts'))
      .addImport(`../module/${nameFormats.pascalCased}`, importName)
      .modify(/( +)\w+,?\n];\s*$/, { custom: (match: string, space: string) => `${space}${importName},\n${match}` })
      .update();
  }

  public formatNames (name: string): NameFormatsType {
    const normalized = name[0].toLowerCase() + name.substr(1);
    const camelCased = normalized.replace(/-([a-z])/ig, ( x, character ) => character.toUpperCase());
    const pascalCased = camelCased[0].toUpperCase() + camelCased.substr(1);
    const upperCased = camelCased.replace(/([A-Z])/g, c => `_${c}`).toUpperCase();

    return { camelCased, pascalCased, upperCased };
  }

  private prepare (name: string): { config: GeneratorConfigType, nameFormats: NameFormatsType } {
    return {
      config: this.config.of<GeneratorConfigType>('generator'),
      nameFormats: this.formatNames(name),
    };
  }
}

type NameFormatsType = { camelCased: string; pascalCased: string; upperCased: string; };
