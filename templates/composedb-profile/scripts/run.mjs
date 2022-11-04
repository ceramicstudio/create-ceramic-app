import ora from 'ora'

import { spawn } from "child_process"
import { EventEmitter } from 'events'
import { writeComposite } from './composites.mjs';

const events = new EventEmitter()
const spinner = ora();

const ceramic = spawn("npm", ["run", "ceramic"]);
ceramic.stdout.on("data", (buffer) => {
  console.log('[Ceramic]', buffer.toString())
  if (buffer.toString().includes("0.0.0.0:7007")) {
    events.emit("ceramic", true);
    spinner.succeed("ceramic node started");
  }
})

ceramic.stderr.on('data', (err) => {
  console.error(err.toString())
  events.emit('ceramic', false)
})

process.on("SIGTERM", () => {
  ceramic.kill();
});
process.on("beforeExit", () => {
  ceramic.kill();
});
process.on("exit", () => {
  ceramic.kill();
});

const bootstrap = async () => {
  console.log("running bootstrap function")
  try {
    spinner.info("bootstrapping composites");
    await writeComposite(spinner)
    spinner.succeed("composites bootstrapped");
  } catch (err) {
    spinner.fail(err.message)
    ceramic.kill()
  }
}

const graphiql = async () => {
  spinner.info("starting graphiql");
  const graphiql = spawn('node', ['./scripts/graphiql.mjs'])
  spinner.succeed("graphiql started");
  graphiql.stdout.on('data', (buffer) => {
    console.log('[GraphiqQL]',buffer.toString())
  })
}

const next = async () => {
  const next = spawn('npm', ['run', 'nextDev'])
  spinner.info("starting nextjs app");
  next.stdout.on('data', (buffer) => {
    console.log('[NextJS]', buffer.toString())
  })
}

const start = async () => {
  try {
    spinner.start('Starting Ceramic node')
    events.on('ceramic', async (isRunning) => {
      if(isRunning) {
        await bootstrap()
        graphiql()
        next()
      }
      if(isRunning === false) {
        spinner.fail('ceramic node failed to start with error:')
        ceramic.kill()
      }
    })
  } catch (err) {
    ceramic.kill()
    spinner.fail(err)
  }
}

start()