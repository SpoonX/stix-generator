import { inject, AbstractCommand, Output, Config } from 'stix';
import { GeneratorService } from '../GeneratorService';

export class GeneratorCommand extends AbstractCommand {
  @inject(Config)
  private config: Config;

  @inject(GeneratorService)
  private generatorService: GeneratorService;

  public generateController (output: Output, { name, module, crud }: { name: string, module: string, crud: boolean }) {
    return this.generatorService.generateController(output, { name, module, crud });
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
