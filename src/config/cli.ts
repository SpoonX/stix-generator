import { Cli } from 'stix';
import { GeneratorCommand } from '../Library/Command';

export const cli = {
  commands: [
    Cli.program('generator', {
      commands: [
        Cli.command('generate:controller <module> <name>', GeneratorCommand, 'generateController', {
          description: 'Generate a controller for <module>.',
          options: {
            crud: {
              alias: 'c',
              description: 'Generate a CRUD controller and entity (requires stix-wetland)',
            },
          },
        }),
        Cli.command('generate:module <name>', GeneratorCommand, 'generateModule', {
          description: 'Generate a module.',
        }),
      ],

      examples: [
        `$ stix generate:module user`,
        `$ stix generate:controller user profile`,
        `$ stix generate:controller user profile --crud`,
      ],
    }),
  ],
};
