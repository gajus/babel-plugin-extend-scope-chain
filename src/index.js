// @flow

const extendScopeChain = (t, identifier, realGlobals) => {
  if (realGlobals.includes(identifier.node.name)) {
    return;
  }

  const hasBinding = identifier.scope.hasBinding(identifier.node.name);
  const isGlobal = identifier.scope.hasGlobal(identifier.node.name);

  if (!hasBinding && isGlobal) {
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
      FunctionDeclaration (path: Object) {
        if (!t.isProgram(path.parent)) {
          return;
        }

        path.insertAfter(
          t.assignmentExpression(
            '=',
            t.memberExpression(
              t.identifier('window'),
              path.node.id
            ),
            path.node.id
          )
        );
      },
      Identifier (path: Object) {
        if (t.isAssignmentExpression(path.parent) && path.parent.left === path.node) {
          extendScopeChain(t, path, realGlobals);
        }
      },
      MemberExpression (path: Object) {
        const identifierNode = path.get('object');

        extendScopeChain(t, identifierNode, realGlobals);
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
                t.blockStatement(
                  path.node.body.map((maybeExpression) => {
                    return t.isExpressionStatement(maybeExpression) ? maybeExpression : t.expressionStatement(maybeExpression);
                  })
                )
              )
            )
          ];
        }
      },
      VariableDeclaration (path: Object) {
        if (!t.isProgram(path.parent)) {
          return;
        }

        const declarations = path.get('declarations');

        for (const declaration of declarations) {
          for (const referencePath of declaration.scope.getBinding(declaration.node.id.name).referencePaths) {
            referencePath.replaceWith(
              t.memberExpression(
                t.identifier('window'),
                declaration.node.id
              )
            );
          }

          if (declaration.node.init) {
            path.insertAfter(
              t.assignmentExpression(
                '=',
                t.memberExpression(
                  t.identifier('window'),
                  declaration.node.id
                ),
                declaration.node.init
              )
            );
          }

          declaration.remove();
        }
      }
    }
  };
};
