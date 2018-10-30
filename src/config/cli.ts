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

        Cli.command('generate:entity <module> <name>', GeneratorCommand, 'generateEntity', {
          description: 'Generate a new entity for <module>.',
          options: {
            field: {
              alias: 'f',
              description: 'Field to add to entity. Can be used multiple times.',
            },
          },
          examples: [
            '$ stix generate:entity user profile -f moto:string',
            '$ stix generate:entity user profile -f createdAt.field(type:dateTime, defaultTo:now())',
          ],
        }),

        Cli.command('generate:action <module> <controller> <action>', GeneratorCommand, 'generateAction', {
          description: 'Generate an action for <controller>.',
          options: {
            route: {
              alias: 'r',
              description: 'The route for this action. Default to /<controller>/<action>',
            },
            method: {
              alias: 'm',
              description: 'The request method for this route. Defaults to get.',
            },
          },
          examples: [
            '$ stix generate:action user profile make-private -r /profile/make-private',
            '$ stix generate:action cart cart clear',
          ],
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
