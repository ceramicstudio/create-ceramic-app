import {Hook} from '@oclif/core'

const hook: Hook.CommandNotFound = async function (opts) {
  await opts.config.runCommand('clone')
}

export default hook;