import { property } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import execa from 'execa'
import P from 'path'

export default {
  works: async () =>
    expect(
      execa.command("node -e ''", {
        all: true,
        env: {
          NODE_OPTIONS: `--require="${P.resolve(require.resolve(
            '.'
          ))}" --experimental-loader=${packageName`@dword-design/babel-register-esm`}`,
        },
      })
        |> await
        |> property('all')
    ).toEqual(''),
}
