import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs'
const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ request, page }) => {
    if (fs.existsSync(authFile)) {
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

        const storageStateFile = JSON.parse(fs.readFileSync(authFile, "utf8"))
        storageStateFile.origins[0].localStorage[0].value = token
        fs.writeFileSync(authFile, JSON.stringify(storageStateFile, null, 2))
    } else {
        await page.goto('https://conduit.bondaracademy.com/');
        await page.getByText('Sign in').click()
        await page.getByRole('textbox', { name: "Email" }).fill('thaitheyasudanpk1@gmail.com')
        await page.getByRole('textbox', { name: "Password" }).fill('Sudan@2805')
        await page.getByRole('button', { name: "Sign in" }).click()
    }

    await page.context().storageState({ path: authFile });
});