import { property } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import execa from 'execa'

export default {
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
