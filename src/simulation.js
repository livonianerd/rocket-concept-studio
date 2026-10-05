// Ideal, steady, one-dimensional isentropic nitrogen flow into vacuum.
// Equations: https://www.grc.nasa.gov/WWW/k-12/airplane/rktthsum.html
// SI internally. These constants and the visual-to-area mapping are illustrative.
export const assumptions = Object.freeze({
  gas: 'Nitrogen (ideal gas)', gamma: 1.4, gasConstantJPerKgK: 296.8,
  chamberVolumeL: 1, chamberPressurePa: 500000, chamberTemperatureK: 300,
  ambientPressurePa: 0, durationS: 5, referenceThroatAreaM2: 1e-6,
  gravityMPerS2: 9.80665,
  supply: 'Ideal external supply maintains chamber pressure and temperature; no blowdown.',
});

export function areaRatioAtMach(mach, gamma = assumptions.gamma) {
  return (1 / mach) * ((2 / (gamma + 1)) * (1 + (gamma - 1) * mach ** 2 / 2)) ** ((gamma + 1) / (2 * (gamma - 1)));
}

export function exitMach(areaRatio) {
  if (!Number.isFinite(areaRatio) || areaRatio < 1) throw new RangeError('Area ratio must be at least one.');
  let low = 1, high = 2;
  while (areaRatioAtMach(high) < areaRatio) high *= 2;
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    if (areaRatioAtMach(mid) < areaRatio) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export function simulate(parameters, equalFlow = true) {
  for (const [field, min, max] of [['chamber', 25, 78], ['throat', 20, 54], ['bell', 42, 96], ['length', 35, 88]]) {
    if (!Number.isFinite(parameters[field]) || parameters[field] < min || parameters[field] > max) {
      throw new RangeError(`Invalid ${field} proportion.`);
    }
  }
  const a = assumptions;
  // Use the schematic's outer radii as illustrative proxies, not measured geometry.
  const throatRadius = 12 + parameters.throat * 0.36;
  const exitRadius = 34 + parameters.bell * 0.83;
  const areaRatio = (exitRadius / throatRadius) ** 2;
  const throatAreaM2 = a.referenceThroatAreaM2 * (equalFlow ? 1 : (throatRadius / (12 + 35 * 0.36)) ** 2);
  const exitAreaM2 = throatAreaM2 * areaRatio;
  const mach = exitMach(areaRatio);
  const thermalRatio = 1 + (a.gamma - 1) * mach ** 2 / 2;
  const exitTemperatureK = a.chamberTemperatureK / thermalRatio;
  const exitPressurePa = a.chamberPressurePa / thermalRatio ** (a.gamma / (a.gamma - 1));
  const exitVelocityMPerS = mach * Math.sqrt(a.gamma * a.gasConstantJPerKgK * exitTemperatureK);
  const massFlowKgPerS = throatAreaM2 * a.chamberPressurePa / Math.sqrt(a.chamberTemperatureK)
    * Math.sqrt(a.gamma / a.gasConstantJPerKgK)
    * (2 / (a.gamma + 1)) ** ((a.gamma + 1) / (2 * (a.gamma - 1)));
  const momentumThrustN = massFlowKgPerS * exitVelocityMPerS;
  const pressureThrustN = (exitPressurePa - a.ambientPressurePa) * exitAreaM2;
  const thrustN = momentumThrustN + pressureThrustN;
  return {
    parameters: { ...parameters }, chamberVolumeL: a.chamberVolumeL,
    throatAreaM2, exitAreaM2, areaRatio, exitMach: mach,
    exitTemperatureK, exitPressurePa, exitVelocityMPerS, massFlowKgPerS,
    momentumThrustN, pressureThrustN, thrustN,
    specificImpulseS: thrustN / (massFlowKgPerS * a.gravityMPerS2),
    totalImpulseNS: thrustN * a.durationS,
    gasUsedKg: massFlowKgPerS * a.durationS,
  };
}
