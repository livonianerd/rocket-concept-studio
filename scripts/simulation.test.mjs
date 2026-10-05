import test from 'node:test';
import assert from 'node:assert/strict';
import { assumptions, areaRatioAtMach, exitMach, simulate } from '../src/simulation.js';

const balanced = { chamber: 52, throat: 35, bell: 72, length: 64 };
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test('supersonic solver matches the analytic Mach 2 area ratio', () => {
  near(areaRatioAtMach(1), 1);
  near(areaRatioAtMach(2), 1.6875);
  near(exitMach(1.6875), 2);
  assert.throws(() => exitMach(0.5), RangeError);
});

test('flow conserves mass and stagnation enthalpy; Isp includes pressure thrust', () => {
  const r = simulate(balanced);
  const a = assumptions;
  const density = r.exitPressurePa / (a.gasConstantJPerKgK * r.exitTemperatureK);
  near(density * r.exitVelocityMPerS * r.exitAreaM2, r.massFlowKgPerS);
  const cp = a.gamma * a.gasConstantJPerKgK / (a.gamma - 1);
  near(cp * r.exitTemperatureK + r.exitVelocityMPerS ** 2 / 2, cp * a.chamberTemperatureK, 1e-7);
  near(r.thrustN, r.momentumThrustN + r.pressureThrustN);
  assert.ok(r.pressureThrustN > 0);
  near(r.specificImpulseS * r.massFlowKgPerS * a.gravityMPerS2, r.thrustN);
  near(r.totalImpulseNS, r.thrustN * 5);
  near(r.gasUsedKg, r.massFlowKgPerS * 5);
});

test('equal-flow comparison fixes mass consumption, while variable throat changes it', () => {
  const wide = { chamber: 68, throat: 43, bell: 78, length: 70 };
  const base = simulate(balanced);
  const equal = simulate(wide);
  const varying = simulate(wide, false);
  near(base.massFlowKgPerS, equal.massFlowKgPerS);
  near(varying.specificImpulseS, equal.specificImpulseS);
  assert.ok(varying.massFlowKgPerS > equal.massFlowKgPerS);
  assert.ok(varying.thrustN > equal.thrustN);
  near(varying.chamberVolumeL, base.chamberVolumeL);
  near(simulate({ ...balanced, chamber: 78, length: 88 }).thrustN, base.thrustN);
});

test('all slider limits give finite positive results; invalid input is rejected', () => {
  for (const throat of [20, 54]) for (const bell of [42, 96]) for (const equal of [true, false]) {
    const r = simulate({ ...balanced, throat, bell }, equal);
    for (const field of ['thrustN', 'specificImpulseS', 'massFlowKgPerS', 'exitPressurePa']) {
      assert.ok(Number.isFinite(r[field]) && r[field] > 0);
    }
    assert.ok(r.exitMach > 1);
  }
  assert.throws(() => simulate({ ...balanced, throat: NaN }), RangeError);
});
