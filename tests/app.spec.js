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
    await page.getByRole('button', { name: 'Run test & compare' }).click();
    await expect(page.locator('#test-results')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.getByRole('button', { name: 'Export JSON' })).toBeVisible();
  }
});

test('virtual test compares designs fairly, exports assumptions, and invalidates stale results', async ({ page }) => {
  await page.goto('./');
  const run = page.getByRole('button', { name: 'Run test & compare' });
  await expect(page.getByRole('button', { name: 'Export test report' })).toBeDisabled();
  await run.click();
  await expect(page.locator('#test-status')).toContainText('Complete');
  await expect(page.locator('#test-winner')).toContainText('Current shape + Balanced');
  await expect(page.locator('#test-winner')).toContainText('(tie)');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export test report' }).click();
  const download = await downloadPromise;
  const report = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(report.assumptions.chamberVolumeL).toBe(1);
  expect(report.assumptions.ambientPressurePa).toBe(0);
  expect(report.results).toHaveLength(4);
  expect(new Set(report.results.map(r => r.massFlowKgPerS)).size).toBe(1);
  expect(report.results[0].thrustN).toBeGreaterThan(0);
  expect(report.results[0].specificImpulseS).toBeGreaterThan(0);
  await page.getByLabel('Equal gas flow for every design').uncheck();
  await expect(page.locator('#test-results')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Export test report' })).toBeDisabled();
  await run.click();
  await expect(page.locator('#test-winner')).toContainText('Wide bell');
  await page.locator('#bell').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#test-status')).toContainText('Inputs changed');
  await expect(page.locator('#test-results')).toBeHidden();
  await run.click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('#test-results')).toBeHidden();
});

test('engine demo drains, stops, resumes, cuts off at empty and refills', async ({ page }, testInfo) => {
  await page.clock.install();
  await page.goto('./');
  const run = page.locator('#run-feed');
  const flame = page.locator('#feed-flame');
  await expect(flame).toBeHidden();
  await expect(page.locator('#lox-percent')).toHaveText('100%');
  await run.click();
  await expect(flame).toBeVisible();
  await expect(run).toHaveAttribute('aria-pressed', 'true');
  await page.clock.fastForward(5000);
  const remaining = await page.locator('#lox-level').evaluate(el => el.value);
  expect(remaining).toBeGreaterThan(65);
  expect(remaining).toBeLessThan(80);
  await page.locator('#feed-panel').screenshot({ path: testInfo.outputPath('engine-running.png') });
  await run.click();
  await expect(flame).toBeHidden();
  const stopped = await page.locator('#lox-percent').textContent();
  await page.clock.fastForward(5000);
  await expect(page.locator('#lox-percent')).toHaveText(stopped);
  await expect(page.locator('#fuel-percent')).toHaveText(stopped);
  await run.click();
  await page.clock.fastForward(21000);
  await expect(flame).toBeHidden();
  await expect(run).toBeDisabled();
  await expect(page.locator('#feed-panel')).not.toHaveClass(/feed-animating/);
  await expect(page.locator('#lox-percent')).toHaveText('0%');
  await expect(page.locator('#fuel-percent')).toHaveText('0%');
  await expect(page.locator('#feed-status')).toContainText('Tanks empty');
  await page.getByRole('button', { name: 'Refill & reset' }).click();
  await expect(run).toBeEnabled();
  await expect(page.locator('#lox-percent')).toHaveText('100%');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await run.click();
  await expect(flame).toBeVisible();
  expect(await flame.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.motor-rotor').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.clock.fastForward(3000);
  await page.getByRole('button', { name: 'Refill & reset' }).click();
  await page.clock.fastForward(25000);
  await expect(page.locator('#lox-percent')).toHaveText('100%');
  await expect(page.locator('#fuel-percent')).toHaveText('100%');
  await expect(page.locator('#feed-time')).toHaveText('0.0 / 20 s');
  await expect(flame).toBeHidden();
  await expect(run).toHaveAttribute('aria-pressed', 'false');
});
