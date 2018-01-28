import 'reflect-metadata'
import * as express from 'express'
import * as cors from 'cors'
import * as lusca from 'lusca'
import * as bodyParser from 'body-parser'
import { createConnection, useContainer } from 'typeorm'
import { Container } from 'typedi'
import chalk from 'chalk'
import { User } from './entity/user'
import { Post } from './entity/post'
import { Category } from './entity/category'
import { Role } from './entity/role'
import { Country } from './entity/country'
import { Page } from './entity/page'
import { Request, Response } from 'express'
import { routes } from './routes'
import _ENV_ from './config'

useContainer(Container)

createConnection({
    type: 'postgres',
    host: _ENV_.DATABASE_HOST,
    port: _ENV_.DATABASE_PORT,
    username: _ENV_.DATABASE_USER,
    password: _ENV_.DATABASE_PASSWORD,
    database: _ENV_.DATABASE_NAME,
    entities: [
        User,
        Post,
        Page,
        Role,
        Country,
        Category
    ],
    migrations: ['migration/*.js'],
    synchronize: _ENV_.SYNC_DB,
    cli: {
        migrationsDir: 'migration'
    },
    logging: _ENV_.LOG_DB,
    cache: true
})
  .then(async (connection: any) => {
    console.log(chalk.green('Connected to Postgres.'))

    const server = express()
    server.use(cors({ origin: true, credentials: true }))
    server.use(lusca({
      csrf: true,
      csp: {
        policy: {
          'default-csp': 'self'
        }
      },
      xframe: `ALLOW-FROM ${_ENV_.BASE_URL}`,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      xssProtection: true,
      nosniff: true,
      referrerPolicy: 'same-origin'
    }))
    server.use(bodyParser.json())

    routes.forEach((route) => {
      (server as any)[route.method](route.path, (request: Request, response: Response, next: any) => {
        route.action(request, response)
          .then(() => next)
          .catch((err: any) => next(chalk.red(err)))
      })
    })

    server.listen(_ENV_.API_PORT)

    console.log(chalk.green(`Server is up and running on port ${_ENV_.API_PORT}.`))

    })
  .catch((error: any) => console.log(chalk.red(error)))
