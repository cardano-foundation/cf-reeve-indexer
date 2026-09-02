import { test } from '@playwright/test';

test('verify select placeholder text visibility', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  
  // Take a screenshot of the landing page
  await page.screenshot({ path: '/tmp/landing_select.png', fullPage: true });
  console.log('Screenshot saved');
  
  // Check the select field for text content
  const selectField = page.locator('[role="combobox"]').first();
  const textContent = await selectField.textContent();
  console.log('Select text content:', textContent);
  
  // Get computed style
  const color = await selectField.evaluate((el) => window.getComputedStyle(el).color);
  console.log('Select text color:', color);
  
  await context.close();
});
