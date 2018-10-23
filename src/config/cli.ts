import { Cli } from 'stix';
import { GeneratorCommand } from '../src/Command';

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

        // @todo move to stix-wetland
        Cli.command('generate:entity <name>', GeneratorCommand, 'generateEntity', {
          description: 'Generate an entity.',
          options: {
            field: {
              alias: 'f',
              description: 'Field for entity.',
            },
          },
          examples: [
           '-f username -f position:integer -f createdAt:field(type:DateTime,defaultTo:Mapping.now())',
          ],
        }),
      ],

      examples: [
        `$ stix generate:controller user profile`,
        `$ stix generate:controller user profile --crud`,
      ],
    }),
  ],
};
