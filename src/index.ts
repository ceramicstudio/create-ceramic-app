import {Command} from '@oclif/core'

export default class DefaultCommand extends Command {
  async run(): Promise<void> {
    this.log('Running the default command...')
    // Add your app creation logic here
  }
}
