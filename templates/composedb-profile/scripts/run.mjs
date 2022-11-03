import ora from 'ora'

import { spawn } from "child_process"
import { EventEmitter } from 'events'
import { writeComposite } from './composites.mjs';

const events = new EventEmitter()

const ceramic = spawn("npm", ["run", "ceramic"]);
ceramic.stdout.on("data", (buffer) => {
  console.log('[Ceramic]', buffer.toString())
  if (buffer.toString().includes("0.0.0.0:7007")) {
    events.emit("ceramic", true);
  }
})
ceramic.stderr.on('data', (err) => {
  console.error(err.toString())
  events.emit('ceramic', false)
})

const bootstrap = async (spinner) => {
  console.log("running bootstrap function")
  try {
    await writeComposite(spinner)
  } catch (err) {
    console.error(err)
    ceramic.kill()
  }
}

const graphiql = async () => {
  const graphiql = spawn('node', ['./scripts/graphiql.mjs'])
  graphiql.stdout.on('data', (buffer) => {
    console.log('[GraphiqQL]',buffer.toString())
  })
}
const next = async () => {
  const next = spawn('npm', ['run', 'nextDev'])
  next.stdout.on('data', (buffer) => {
    console.log('[NextJS]', buffer.toString())
  })
}

const spinUp = async () => {
  const spinner = ora()
  try {
    spinner.start('Starting Ceramic node')
    events.on('ceramic', async (isRunning) => {
      if(isRunning) {
        // throw new Error('Ceramic node failed to start')
        spinner.succeed('ceramic node started')
        spinner.info('bootstrapping composites')
        await bootstrap(spinner)
        spinner.succeed('composites bootstrapped')
        spinner.info('starting graphiql')
        graphiql()
        spinner.succeed('graphiql started')
        spinner.info('starting nextjs app')
        next()
        spinner.succeed('nextjs app started')
      }
      if(isRunning === false) {
        spinner.fail('ceramic node failed to start with error:')
        ceramic.kill()
      }
    })
  } catch (err) {
    ceramic.kill()
    spinner.error(err)
  }
}

process.on('SIGTERM', () => {
  ceramic.kill()
})
process.on('beforeExit', () => {
  ceramic.kill()
})
process.on('exit', () => {
  ceramic.kill()
})

spinUp()