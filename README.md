# Create Ceramic App Monorepo

## About

Use a CLI to create a scaffolding Javascript application that uses Ceramic or 
ComposeDB for its persistence layer. The generated sample application 
demonstrates authentication using DID-PKH and will require that users have an
Ethereum web wallet installed.



## Folders
| Name                     | Description                                                                                      |
|--------------------------|--------------------------------------------------------------------------------------------------|
| [CLI](./cli)             | The Command Line utility that clones templates & provides utlities for ComposeDB based projects. |
| [Templates](./templates) | The templates that the CLI utility will clone.                                                   |

## Usage

Install create-ceramic-app:
```sh
cd ./cli && npm install && cd ..
```

Create scaffolding js app:
```sh
npx @ceramicnetwork/create-ceramic-app clone
```

## Maintainers

- Elizabeth Murray ([@sterahi](https://github.com/sterahi))

## License

Dual licensed under [MIT](LICENSE-MIT) and [Apache 2](LICENSE-APACHE)
