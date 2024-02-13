import { endent, property } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { execaCommand } from 'execa'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

const nodeMajorVersion = parseInt(process.versions.node.split('.')[0], 10)

export default {
  before: () => execaCommand('base prepublishOnly'),
  ...(nodeMajorVersion > 14 && {
    module: () =>
      withLocalTmpDir(async () => {
        // Execution order is non-deterministic (also when imported from node_modules)
        await outputFiles({
          '.babelrc.json': JSON.stringify({
            plugins: [packageName`@babel/plugin-syntax-import-assertions`],
          }),
          'entry.js': endent`
            import '../dist/cjs-fallback.cjs'

            await import('./mod.js')
          `,
          'foo.json': JSON.stringify({}),
          'mod.js': "import './foo.json' assert { type: 'json' }",
          'package.json': JSON.stringify({ type: 'module' }),
        })
        expect(
          execaCommand('node entry.js', { all: true })
            |> await
            |> property('all'),
        ).toEqual('')
      }),
  }),
  works: async () =>
    expect(
      execaCommand(
        `node --require=. --experimental-loader=${packageName`babel-register-esm`} -e ''`,
        { all: true },
      )
        |> await
        |> property('all'),
    ).toEqual(''),
}
