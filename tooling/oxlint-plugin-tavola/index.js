// Tavola's own lint rules, as an oxlint JS plugin. They cover what oxlint has no built-in rule
// for: every function documented, one exported unit per module, and types kept in their own
// files. Parameter and return tags are checked by oxlint's native jsdoc plugin.
import { definePlugin, defineRule } from '@oxlint/plugins';

const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);
const TYPE_DECLARATIONS = new Set(['TSTypeAliasDeclaration', 'TSInterfaceDeclaration']);

/**
 * The declaration a top-level statement introduces, looking through `export` and `export default`.
 * @param {any} statement A statement of the module body.
 * @returns {any} The declaration, or the statement itself.
 */
const unwrapExport = (statement) =>
  (statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration') &&
  statement.declaration
    ? statement.declaration
    : statement;

/**
 * The functions a top-level statement defines, with their names: function declarations, and
 * `const x = () => ...` or `const x = function () {}`.
 * @param {any} statement A statement of the module body.
 * @returns {{ name: string, node: any }[]} The functions.
 */
function functionsOf(statement) {
  const declaration = unwrapExport(statement);
  if (FUNCTION_TYPES.has(declaration.type))
    return [{ name: declaration.id?.name ?? 'default', node: declaration }];
  if (declaration.type !== 'VariableDeclaration') return [];
  return declaration.declarations
    .filter((declarator) => declarator.init && FUNCTION_TYPES.has(declarator.init.type))
    .map((declarator) => ({ name: declarator.id.name, node: declarator.init }));
}

/**
 * The JSDoc block directly above a statement: the last `/** ... *\/` comment that ends before it
 * with only whitespace in between.
 * @param {any} sourceCode The rule's source code object.
 * @param {any} statement The statement the block should document.
 * @returns {any} The comment, or null.
 */
function docAbove(sourceCode, statement) {
  const start = statement.range[0];
  const before = sourceCode.getAllComments().filter((comment) => comment.range[1] <= start);
  const last = before.at(-1);
  if (!last || last.type !== 'Block' || !last.value.startsWith('*')) return null;
  const between = sourceCode.text.slice(last.range[1], start);
  return between.trim() === '' ? last : null;
}

/**
 * The text of a JSDoc block before its first tag, without the comment's asterisks.
 * @param {string} value The comment text between `/*` and `*\/`.
 * @returns {string} The description, trimmed.
 */
function descriptionOf(value) {
  const lines = value.split('\n').map((line) => line.replace(/^\s*\*+\s?/, ''));
  const firstTag = lines.findIndex((line) => line.trimStart().startsWith('@'));
  return (firstTag === -1 ? lines : lines.slice(0, firstTag)).join(' ').trim();
}

const requireDocs = defineRule({
  meta: {
    type: 'suggestion',
    docs: { description: 'Every top-level function has a JSDoc block with a description.' },
  },
  create(context) {
    return {
      Program(program) {
        for (const statement of program.body)
          for (const { name, node } of functionsOf(statement)) {
            const doc = docAbove(context.sourceCode, statement);
            if (doc && descriptionOf(doc.value)) continue;
            context.report({
              node,
              message: doc
                ? `Describe \`${name}\` in its JSDoc block: what it does and why.`
                : `Document \`${name}\` with a JSDoc block: what it does and why, its parameters and its result.`,
            });
          }
      },
    };
  },
});

const oneExport = defineRule({
  meta: {
    type: 'suggestion',
    docs: { description: 'A module exports at most one function, component or class.' },
  },
  create(context) {
    return {
      Program(program) {
        const exported = program.body
          .filter((statement) => statement.type.startsWith('Export'))
          .flatMap((statement) => {
            const declaration = unwrapExport(statement);
            return declaration.type === 'ClassDeclaration'
              ? [declaration]
              : functionsOf(statement).map((entry) => entry.node);
          });
        for (const node of exported.slice(1))
          context.report({
            node,
            message:
              'Export one function, component or class per module; move this one to its own file.',
          });
      },
    };
  },
});

const typesInTypeFiles = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Type aliases and interfaces live in *.type.ts files, which hold nothing else.',
    },
  },
  create(context) {
    const typeFile = context.filename.endsWith('.type.ts');
    return {
      Program(program) {
        for (const statement of program.body) {
          const declaration = unwrapExport(statement);
          const isType = TYPE_DECLARATIONS.has(declaration.type);
          const isImport = statement.type === 'ImportDeclaration';
          const isReExport = statement.type === 'ExportNamedDeclaration' && !statement.declaration;
          if (typeFile && !isType && !isImport && !isReExport)
            context.report({
              node: statement,
              message: 'A .type.ts file holds types only; move this code to a .ts file.',
            });
          if (!typeFile && isType)
            context.report({
              node: statement,
              message: 'Move this type to a .type.ts file next to this module.',
            });
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: 'tavola' },
  rules: {
    'require-docs': requireDocs,
    'one-export': oneExport,
    'types-in-type-files': typesInTypeFiles,
  },
});
