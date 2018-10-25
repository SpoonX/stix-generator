import { inject, AbstractCommand, Output, Config } from 'stix';
import { GeneratorService } from '../GeneratorService';

export class GeneratorCommand extends AbstractCommand {
  @inject(Config)
  private config: Config;

  @inject(GeneratorService)
  private generatorService: GeneratorService;

  public async generateController (output: Output, { name, module, crud }: { name: string, module: string, crud: boolean }) {
    await this.generatorService.generateController({ name, module, crud });

    output.success(`${this.generatorService.formatNames(name).pascalCased}Controller created.`);
  }

  public async generateModule (output: Output, { name }: { name: string }) {
    await this.generatorService.generateModule({ name });

    output.success(`Created module ${this.generatorService.formatNames(name).pascalCased}`);
  }
}
