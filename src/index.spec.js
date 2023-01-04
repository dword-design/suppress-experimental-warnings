import { endent, property } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import execa from 'execa'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  module: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'entry.js': endent`
        import '../src/index.js'
        import './mod.js'
      `,
        'foo.json': JSON.stringify({}),
        'mod.js': "import './foo.json' assert { type: 'json' }",
        'package.json': JSON.stringify({ type: 'module' }),
      })
      expect(
        execa.command('node entry.js', { all: true })
          |> await
          |> property('all')
      ).toEqual('')
    }),
  works: async () =>
    expect(
      execa.command(
        `node --require=./src --experimental-loader=${packageName`@dword-design/babel-register-esm`} -e ''`,
        { all: true }
      )
        |> await
        |> property('all')
    ).toEqual(''),
}
