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
  return {
    visitor: {
      Program: {
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
          const currentExpression = declaration.init;

          declaration.init = t.assignmentExpression(
            '=',
            t.memberExpression(
              t.identifier('window'),
              declaration.id
            ),
            declaration.init
          );
        }
      },
      AssignmentExpression (path: Object, state: Object) {
        const realGlobals = state.opts.globals || [
          'window'
        ];

        if (t.isIdentifier(path.get('left'))) {
          extendScopeChain(t, path.get('left'), realGlobals);
        } else if (t.isMemberExpression(path.get('left'))) {
          extendScopeChain(t, path.get('left').get('object'), realGlobals);
        }
      }
    }
  };
};
