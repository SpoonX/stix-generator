import { primary, increments{{ importField }} } from 'wetland';
{{ importEntity }}
export class {{ pascalCased }}{{ extendEntity }} {
  @primary() @increments() id: number;{{ fields }}
}
