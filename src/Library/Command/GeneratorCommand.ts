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
    return this.generatorService.generateModule(output, { name });
  }
}
