import { inject, AbstractCommand, Output, Config } from 'stix';
import { GeneratorService } from '../GeneratorService';

export class GeneratorCommand extends AbstractCommand {
  @inject(Config)
  private config: Config;

  @inject(GeneratorService)
  private generatorService: GeneratorService;

  // @todo move to stix-cli. Needs to be a standalone function that does this.
  // async init (name: string) {
  //   const project = path.resolve(process.cwd(), name);
  //
  //   await Git.clone('https://github.com/SpoonX/stix-skeleton.git', name, __dirname);
  //   await File.remove(path.resolve(project, `.git`), true);
  //   await Package.install(project);
  // }

  // @todo figure out if we can overwrite commands. If so, move the entity part to stix-wetland.
  // @todo I've figured out the above, and we can. stix-wetland will override this generator
  public generateController (output: Output, { name, field }: { name: string, field: string | string[] }) {
    return this.generatorService.generateController({ name, field });
  }

  public async generateModule (output: Output, { name }: { name: string }) {
    return this.generatorService.generateModule({ name });

    output.addData('blblblblblbl');
  }

  // @todo move to stix-wetland
  public async generateEntity (output: Output, { name, field }: { name: string, field: string[] }) {
    const fields = Array.isArray(field) ? field : [ field ];
    const { pascalCased, camelCased } = this.generatorService.formatNames(name);

    const relationRegex = /^(?:([\w]+\b)?(\*)?(-|<>|>|<)?(\*)?([\w]+)(?:\.)?(\w+)?)$/g;
    const relationsMap: { [key: string]: string } = {
      '-': 'oneToOne',
      '>': 'manyToOne',
      '<': 'oneToMany',
      '<>': 'manyToMany',
    };

    const relations = fields.map(f => {
      const matches = relationRegex.exec(f);

      return {
        entity: pascalCased,
        relation: relationsMap[matches[3] || '-'],
        property: matches[1] || this.generatorService.formatNames(matches[5]).camelCased,
        owning: !!matches[2] || !matches[4],
        other: {
          property: matches[6] || camelCased,
          entity: matches[5],
          owning: !!matches[4],
        },
      };
    });

    output.addData(relations);
  }
}

type NameFormatsType = { camelCased: string; pascalCased: string; upperCased: string; };
