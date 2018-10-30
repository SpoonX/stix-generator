import {
  ClassDeclaration,
  ClassDeclarationStructure,
  EnumDeclarationStructure, ImportSpecifierStructure,
  IndentationText,
  Project,
  QuoteKind,
  SourceFile,
} from 'ts-simple-ast';
import util from 'util';
import { TypeMap } from './TypeMap';
import { formatNames } from '../formatNames';

export class Manipulator {
  private project: Project;

  private file: SourceFile;

  private classDeclaration: ClassDeclaration;

  private enumerations: EnumDeclarationStructure[] = [];

  constructor () {
    this.project = new Project({
      manipulationSettings: { indentationText: IndentationText.TwoSpaces, quoteKind: QuoteKind.Single },
    });
  }

  getFile () {
    return this.file;
  }

  public load (file: string) {
    this.file = this.project.addExistingSourceFile(file);
  }

  public create (file: string): this {
    this.file = this.project.createSourceFile(file);

    return this;
  }

  useClass (name: string): ClassDeclaration {
    return this.classDeclaration = this.file.getClass(name);
  }

  ensureAction (name: string, className?: string) {
    if (className) {
      this.useClass(className);
    }

    const method = this.classDeclaration.addMethod({
      isAsync: true,
      parameters: [ { name: 'ctx', type: 'ContextInterface' } ],
      returnType: 'Response',
      name,
    });
  }

  public createClass (options?: Partial<ClassDeclarationStructure>): ClassDeclaration {
    return this.classDeclaration = this.file.addClass(options);
  }

  public save () {
    if (this.enumerations.length) {
      this.file.addEnums(this.enumerations);
    }

    return this.project.save();
  }

  createEnumeration (name: string, enumeration: string[]) {
    const { pascalCased } = formatNames(name);

    this.enumerations.push({
      name: pascalCased,
      isExported: true,
      members: enumeration.map((name: string) => ({ name: formatNames(name).pascalCased, value: name })),
    });

    return pascalCased;
  }

  ensureImport (specifier: string, ...names: string[]) {
    const imports = this.file.getImportDeclaration(specifier);

    // No imports at all yet, create.
    if (!imports) {
      return this.file.addImportDeclaration({
        moduleSpecifier: specifier,
        namedImports: names.map(name => ({ name })),
      });
    }

    const { namedImports } = imports.getStructure();

    // No named imports yet, add.
    if (!namedImports) {
      return imports.addNamedImports(names);
    }

    names.forEach(name => {
      if ((namedImports as ImportSpecifierStructure[]).find(named => named.name === name)) {
        return;
      }

      imports.addNamedImport({ name });
    });
  }

  // makePRettyThins () {
  //
  //
  //   c.addProperties([
  //     createProperty('username'),
  //     createProperty('password'),
  //     createProperty('createdAt', { type: 'datetime', defaultTo: 'Mapping.now()' }),
  //     createProperty('gender', { type: 'enumeration', enumeration: [ 'male', 'female', 'something else' ] }),
  //   ]).slice(0, -1).forEach(p => p.appendWhitespace(writer => writer.newLine()));
  //
  // }
}
