/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import { readJson } from 'fs-extra'
import View from '@ioc:Adonis/Core/View'
import Route from '@ioc:Adonis/Core/Route'
import Content from 'App/Services/Content'
import Application from '@ioc:Adonis/Core/Application'

const collaboratorsToIgnore = [
  'thetutlage',
  'RomainLanz',
  'targos',
  'Julien-R44',
  'greenkeeperio-bot',
  'dependabot-preview[bot]',
  'greenkeeper[bot]',
  'dependabot[bot]',
  'snyk-bot',
]

View.global('shouldMention', function (githubUserName: string) {
  return !collaboratorsToIgnore.includes(githubUserName)
})

View.global('collaborators', async function () {
  const list = await readJson(Application.makePath('content/collaborators.json'))
  return {
    total: list.length - collaboratorsToIgnore.length,
    list,
  }
})

/**
 * There is no homepage for docs
 */
Route.get('/', ({ response }) => {
  response.redirect('/guides/introduction')
})

/**
 * Render a 404 template
 */
Route.get('/404', ({ view }) => {
  return view.render('errors/404')
})

/**
 * Process all other routes via `@dimerapp/content` module
 */
Route.get('*', async ({ request, response, view }) => {
  const { html, error } = await Content.render(request.url())

  if (error && error.includes('Unable to lookup')) {
    return response.redirect('/404')
  } else if (error) {
    return view.render('errors/500', { error })
  } else {
    response.send(html)
  }
})
