import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      json: tags
    })
  })
})
test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseJson = await response.json()
    responseJson.articles[0].title = 'This is MOCK title for the article'
    responseJson.articles[0].description = 'This is MOCK description for the article'
    await route.fulfill({
      json: responseJson
    })
  })
  await page.goto('https://conduit.bondaracademy.com/');
  await expect(page.locator('.navbar-brand')).toHaveText(/conduit/)
  await expect(page.locator('.sidebar .tag-pill')).toContainText(['Automation', 'Playwright'])
  await expect(page.locator('.preview-link h1').first()).toContainText('This is MOCK title for the article')
  await expect(page.locator('.preview-link p').first()).toContainText('This is MOCK description for the article')
});


test('Delete Article', async ({ page, request }) => {
  const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
        "email": "thaitheyasudanpk1@gmail.com",
        "password": "Sudan@2805"
      }
    }
  })
  expect((loginResponse).status()).toEqual(200)
  const responseLoginJson = await loginResponse.json()
  const token = responseLoginJson.user.token
  console.log(token)

  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "Test title",
        "description": "Testing Mock API",
        "body": "Demo Body",
        "tagList": []
      }
    },
    headers: {
      Authorization: `Token ${token}`
    }
  })
  expect((newArticleResponse).status()).toEqual(201)

  await page.goto('https://conduit.bondaracademy.com/');
  await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name:"Email"}).fill('thaitheyasudanpk1@gmail.com')
  await page.getByRole('textbox', {name:"Password"}).fill('Sudan@2805')
  await page.getByRole('button', {name:"Sign in"}).click()
  await expect(page.locator('.preview-link h1').first()).toContainText('Test title')
  await page.getByText('Test title').click()
  await page.getByRole('button', {name:'Delete Article'}).first().click()
  await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0')
  await expect(page.locator('.preview-link h1').first()).not.toContainText('Test title')
})
