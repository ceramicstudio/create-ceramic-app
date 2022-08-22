import { Command } from "../command"
import axios from 'axios'

import degit = require('degit')

export default class Clone extends Command {
  async run(): Promise<void> {
    try {
      // FUTURE: Allow users to provide their own URL to clone from. If no full url is provided (including a .com/ca/xyz etc) assume it's one of
        // our defaults & use the appropriate URL.

      const emitter = degit(
        "https://github.com/vercel/next.js/tree/canary/examples/", // TODO: Update to pull from our repo not Nexts
        {
          cache: false,
          force: true,
          verbose: true,
        }
      );
      //@ts-ignore
      emitter.on('info', info => {
        console.info(info)
      })
      // TODO: install in current directory, not home root.
      await emitter.clone('~/')
    } catch (e) {
      console.error(e)
    }
  }
}