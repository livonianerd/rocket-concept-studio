import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('presets, sliders, reset, and exported snapshot work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Shape the concept.' })).toBeVisible();
  await expect(page.locator('#profileName')).toHaveText('Balanced');
  const initialShape = await page.locator('#engine path').first().getAttribute('d');
  for (const [name, values] of [
    ['Compact', [42, 39, 60, 42]],
    ['Wide bell', [68, 43, 78, 70]],
    ['Balanced', [52, 35, 72, 64]],
  ]) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('#profileName')).toHaveText(name);
    for (const [index, field] of ['chamber', 'throat', 'bell', 'length'].entries()) {
      await expect(page.locator(`#${field}`)).toHaveValue(String(values[index]));
    }
  }
  for (const field of ['chamber', 'throat', 'bell', 'length']) {
    await page.locator(`#${field}`).focus();
    await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('#profileName')).toHaveText('Custom');
  await expect(page.locator('#engine path').first()).not.toHaveAttribute('d', initialShape);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('rocket-concept.json');
  const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(exported.parameters).toEqual({ chamber: 53, throat: 36, bell: 73, length: 65 });
  expect(exported.model_type).toBe('visual-only');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('#profileName')).toHaveText('Balanced');
  await expect(page.locator('#engine path').first()).toHaveAttribute('d', initialShape);
  expect(errors).toEqual([]);
});

test('desktop and mobile layouts fit the screen', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    await expect(page.locator('#engine')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.getByRole('button', { name: 'Export JSON' })).toBeVisible();
  }
});
