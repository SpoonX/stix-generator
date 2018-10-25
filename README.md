# stix-generator

A module that helps you generate modules and controllers easily using Stix CLI.

## Installing

`yarn add stix-generator` or `npm i stix-generator`

## Setup

```typescript
import { ModuleManagerConfigInterface } from 'Stix';
import Generator from 'stix-generator';

export const modules: ModuleManagerConfigInterface = [
  ...
  Generator,
];
```

## todo 

- A bunch
- Copy "templates" directory to dist on build (otherwise the templates will be the transpiled versions)

## License

MIT.
