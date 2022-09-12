import { Command } from "../command"
import axios from 'axios'

import degit = require('degit')

export default class Clone extends Command {
  async run(): Promise<void> {
    try {
      // FUTURE: Allow users to provide their own URL to clone from. If no full url is provided (including a .com/ca/xyz etc) assume it's one of
        // our defaults & use the appropriate URL.
      const emitter = degit(
        "https://github.com/ceramicstudio/create-ceramic-app/tree/main/templates/basic-profile",
        {
          cache: false,
          force: true,
        }
      );
      
      emitter.on('info', info => {
        if(info.code === 'SUCCESS') {
          console.info(`Project cloned successfully at ${info.dest}`);
        }
        console.info(info)
      })
      await emitter.clone(process.cwd())
    } catch (e) {
      console.error(e)
    }
  }
}