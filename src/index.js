// @flow

const extendScopeChain = (t, identifier, realGlobals) => {
  const isGlobal = identifier.scope.globals[identifier.node.name] === identifier.node;

  if (realGlobals.includes(identifier.node.name)) {
    return;
  }

  if (isGlobal) {
    identifier.replaceWith(
      t.memberExpression(
        t.identifier('window'),
        identifier.node
      )
    );
  }
};

export default ({
  types: t
}: {
  types: Object
}) => {
  let realGlobals;

  return {
    visitor: {
      Identifier (path: Object) {
        if (t.isAssignmentExpression(path.parent) && (path.parent.left === path.node || path.parent.right === path.node)) {
          extendScopeChain(t, path, realGlobals);
        }

        if (t.isMemberExpression(path.parent) && path.parent.object === path.node) {
          extendScopeChain(t, path, realGlobals);
        }
      },
      Program: {
        enter (path: Object, state: Object) {
          realGlobals = state.opts.globals || [
            'window'
          ];
        },
        exit (path: Object, state: Object) {
          if (!state.opts.export) {
            return;
          }

          path.node.body = [
            t.assignmentExpression(
              '=',
              t.memberExpression(
                t.identifier('module'),
                t.identifier('exports'),
              ),
              t.functionExpression(
                null,
                [],
                t.blockStatement(path.node.body)
              )
            )
          ];
        }
      },
      VariableDeclaration (path: Object) {
        if (!t.isProgram(path.parent)) {
          return;
        }

        for (const declaration of path.node.declarations) {
          declaration.init = t.assignmentExpression(
            '=',
            t.memberExpression(
              t.identifier('window'),
              declaration.id
            ),
            declaration.init
          );
        }
      }
    }
  };
};
