import { endent, property } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import execa from 'execa'
import { ensureDir, remove, symlink } from 'fs-extra'
import outputFiles from 'output-files'
import P from 'path'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  module: () =>
    withLocalTmpDir(async () => {
      await remove(P.join('..', 'node_modules', 'self', 'index.js'))
      await ensureDir(P.join('..', 'node_modules', 'self'))
      await symlink(
        P.join('..', '..', 'src', 'index.js'),
        P.join('..', 'node_modules', 'self', 'index.js')
      )
      await outputFiles({
        'entry.js': endent`
        import 'self'

        import './mod.js'
      `,
        // Need some content so the test always fails
        'foo.json': JSON.stringify({ foo: 'bar' }),
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
