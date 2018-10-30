import { inject, AbstractCommand, Output, Config } from 'stix';
import { ActionOptions, EntityOptions, GeneratorService } from '../GeneratorService';
import { formatNames } from '../formatNames';

export class GeneratorCommand extends AbstractCommand {
  @inject(Config)
  private config: Config;

  @inject(GeneratorService)
  private generatorService: GeneratorService;

  public async generateController (output: Output, { name, module }: { name: string, module: string }) {
    await this.generatorService.generateController({ name, module });

    output.success(`${formatNames(name).pascalCased}Controller created.`);
  }

  public async generateModule (output: Output, { name }: { name: string }) {
    await this.generatorService.generateModule({ name });

    output.success(`Created module ${formatNames(name).pascalCased}`);
  }

  public async generateAction (output: Output, options: ActionOptions) {
    await this.generatorService.generateAction(options);

    output.success(`Created action ${formatNames(options.action).pascalCased}`);
  }

  public async generateEntity (output: Output, options: EntityOptions) {
    await this.generatorService.generateEntity(options);

    output.success(`Generated entity.`);
  }
}
