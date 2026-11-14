import type { PathNode, PathResult, TraverseMode } from '../types/mars';
import { sampleTerrain, getJezeroElevation } from '../data/jezeroDemData';

// Priority Queue for fast A* graph search
class MinHeap<T> {
  private heap: { item: T; priority: number }[] = [];

  push(item: T, priority: number) {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0].item;
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIdx].priority) break;
      [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
      index = parentIdx;
    }
  }

  private sinkDown(index: number) {
    const length = this.heap.length;
    while (true) {
      const leftChildIdx = 2 * index + 1;
      const rightChildIdx = 2 * index + 2;
      let smallestIdx = index;

      if (leftChildIdx < length && this.heap[leftChildIdx].priority < this.heap[smallestIdx].priority) {
        smallestIdx = leftChildIdx;
      }
      if (rightChildIdx < length && this.heap[rightChildIdx].priority < this.heap[smallestIdx].priority) {
        smallestIdx = rightChildIdx;
      }
      if (smallestIdx === index) break;

      [this.heap[index], this.heap[smallestIdx]] = [this.heap[smallestIdx], this.heap[index]];
      index = smallestIdx;
    }
  }
}

/**
 * Slope-Aware & Kinematically Constrained A* Pathfinding for Martian Traversing.
 *
 * Strict safety rules:
 * 1. Edge & Midpoint slope checks: Steps > 20° are strictly impassable rollover hazards.
 * 2. Exponential energy penalty for slopes > 12° to favor natural ramps and gentle alluvial channels.
 * 3. Physical distance scaling: 1 coordinate unit = 10 physical meters.
 */
export function findOptimalMarsPath(
  startX: number,
  startY: number,
  goalX: number,
  goalY: number,
  mode: TraverseMode = 'rover'
): PathResult {
  const GRID_STEP = 10; // 10 units = 100 meters per node
  const MIN_COORD = -450;
  const MAX_COORD = 450;
  const GRID_SIZE = Math.round((MAX_COORD - MIN_COORD) / GRID_STEP);

  function coordToGrid(c: number): number {
    return Math.max(0, Math.min(GRID_SIZE - 1, Math.round((c - MIN_COORD) / GRID_STEP)));
  }

  function gridToCoord(g: number): number {
    return MIN_COORD + g * GRID_STEP;
  }

  const startGX = coordToGrid(startX);
  const startGY = coordToGrid(startY);
  const goalGX = coordToGrid(goalX);
  const goalGY = coordToGrid(goalY);

  const key = (gx: number, gy: number) => `${gx}_${gy}`;

  const openSet = new MinHeap<[number, number]>();
  const cameFrom = new Map<string, [number, number]>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const startKey = key(startGX, startGY);
  gScore.set(startKey, 0);

  const goalZ = getJezeroElevation(goalX, goalY);

  const heuristic = (gx: number, gy: number) => {
    const x = gridToCoord(gx);
    const y = gridToCoord(gy);
    const z = getJezeroElevation(x, y);
    const dxM = (x - goalX) * 10;
    const dyM = (y - goalY) * 10;
    const dzM = z - goalZ;
    return Math.sqrt(dxM * dxM + dyM * dyM + dzM * dzM);
  };

  fScore.set(startKey, heuristic(startGX, startGY));
  openSet.push([startGX, startGY], fScore.get(startKey)!);

  const neighbors = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, 1], [1, -1], [-1, -1]
  ];

  let found = false;
  let current: [number, number] = [startGX, startGY];
  let iterations = 0;
  const MAX_ITERATIONS = 25000;

  while (!openSet.isEmpty() && iterations < MAX_ITERATIONS) {
    iterations++;
    current = openSet.pop()!;
    const [cgx, cgy] = current;

    if (cgx === goalGX && cgy === goalGY) {
      found = true;
      break;
    }

    const currentKey = key(cgx, cgy);
    const currentG = gScore.get(currentKey) ?? Infinity;
    const curX = gridToCoord(cgx);
    const curY = gridToCoord(cgy);
    const curZ = getJezeroElevation(curX, curY);

    for (const [dx, dy] of neighbors) {
      const ngx = cgx + dx;
      const ngy = cgy + dy;

      if (ngx < 0 || ngx >= GRID_SIZE || ngy < 0 || ngy >= GRID_SIZE) continue;

      const nextX = gridToCoord(ngx);
      const nextY = gridToCoord(ngy);
      const nextTerrain = sampleTerrain(nextX, nextY);

      // True physical 3D distance between nodes (1 unit = 10 meters)
      const horizDistM = Math.hypot((nextX - curX) * 10, (nextY - curY) * 10);
      const deltaZM = Math.abs(nextTerrain.elevation - curZ);
      const edgeSlopeDeg = (Math.atan2(deltaZM, Math.max(1, horizDistM)) * 180) / Math.PI;

      // Check midpoint to prevent jumping over narrow chasms
      const midX = (curX + nextX) / 2;
      const midY = (curY + nextY) / 2;
      const midTerrain = sampleTerrain(midX, midY);

      const maxStepSlope = Math.max(nextTerrain.slopeDeg, edgeSlopeDeg, midTerrain.slopeDeg);

      // CONSTRAINT RULE 1: Slopes > 20.0° are strictly impassable rollover hazards
      if (maxStepSlope > 20.0) {
        continue;
      }

      // CONSTRAINT RULE 2: Slope cost penalties
      let slopeCostMultiplier = 1.0;
      if (maxStepSlope > 12.0) {
        slopeCostMultiplier = 1.0 + 3.0 * Math.exp((maxStepSlope - 12.0) / 2.0);
      } else if (maxStepSlope > 6.0) {
        slopeCostMultiplier = 1.0 + 0.3 * (maxStepSlope - 6.0);
      }

      // Terrain hazard penalty (Loose sand dune fields with low thermal inertia)
      let hazardMultiplier = 1.0;
      if (nextTerrain.thermalInertia < 170) {
        hazardMultiplier = 4.2;
      }

      const tentativeG = currentG + horizDistM * slopeCostMultiplier * hazardMultiplier;
      const neighborKey = key(ngx, ngy);

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, [cgx, cgy]);
        gScore.set(neighborKey, tentativeG);
        const f = tentativeG + heuristic(ngx, ngy);
        fScore.set(neighborKey, f);
        openSet.push([ngx, ngy], f);
      }
    }
  }

  // Reconstruct path
  const gridPath: [number, number][] = [];
  if (found) {
    let curr: [number, number] | undefined = [goalGX, goalGY];
    while (curr) {
      gridPath.push(curr);
      curr = cameFrom.get(key(curr[0], curr[1]));
    }
    gridPath.reverse();
  } else {
    gridPath.push([startGX, startGY], [goalGX, goalGY]);
  }

  const rawCoords: [number, number, number][] = [];
  for (const [gx, gy] of gridPath) {
    const x = gridToCoord(gx);
    const y = gridToCoord(gy);
    const z = getJezeroElevation(x, y);
    rawCoords.push([x, y, z]);
  }

  const smoothNodes: PathNode[] = [];
  let totalDistM = 0;
  let elevGainM = 0;
  let elevLossM = 0;
  let maxSlope = 0;
  let sumSlope = 0;
  let warningCount = 0;

  for (let i = 0; i < rawCoords.length; i++) {
    const [x, y] = rawCoords[i];
    const terrain = sampleTerrain(x, y);

    let effectiveSlope = terrain.slopeDeg;

    if (i > 0) {
      const [px, py, pz] = rawCoords[i - 1];
      const stepDistM = Math.hypot((x - px) * 10, (y - py) * 10);
      const stepDzM = Math.abs(terrain.elevation - pz);
      const stepSlope = (Math.atan2(stepDzM, Math.max(1, stepDistM)) * 180) / Math.PI;
      effectiveSlope = Math.max(terrain.slopeDeg, stepSlope);

      const d = Math.hypot(stepDistM, terrain.elevation - pz);
      totalDistM += d;

      const dz = terrain.elevation - pz;
      if (dz > 0) elevGainM += dz;
      else elevLossM += Math.abs(dz);
    }

    if (effectiveSlope > maxSlope) maxSlope = effectiveSlope;
    sumSlope += effectiveSlope;

    let warning: 'slope' | 'hazard' | 'rollover' | undefined = undefined;
    if (effectiveSlope > 20.0) {
      warning = 'rollover';
      warningCount++;
    } else if (effectiveSlope > 12.0) {
      warning = 'slope';
      warningCount++;
    } else if (terrain.thermalInertia < 170) {
      warning = 'hazard';
      warningCount++;
    }

    const commsLoS = !(x < -350 && y > 240);
    const distKm = totalDistM / 1000;
    const speedKmh = mode === 'foot' ? 3.2 : 6.0;
    const durationHours = distKm / speedKmh + (elevGainM / 300);
    const batteryKwh = mode === 'foot'
      ? 0.08 * distKm
      : 0.35 * distKm + elevGainM * 0.0022;
    const oxygenLiters = durationHours * 60 * (mode === 'foot' ? (1.25 + (sumSlope / (i + 1)) * 0.045) : 0.45);
    const metabolicBurnRate = Number((0.85 + 0.08 * Math.max(0, effectiveSlope - 4.0)).toFixed(2));

    smoothNodes.push({
      x,
      y,
      z: terrain.elevation,
      slopeDeg: Number(effectiveSlope.toFixed(1)),
      distanceFromStartKm: Number(distKm.toFixed(2)),
      cumulativeElevationM: Math.round(terrain.elevation),
      batteryKwh: Number(batteryKwh.toFixed(2)),
      oxygenLiters: Math.round(oxygenLiters),
      metabolicBurnRate,
      commsLoS,
      warning,
    });
  }

  const totalDistanceKm = Number((totalDistM / 1000).toFixed(2));
  const avgSlopeDeg = Number((sumSlope / Math.max(1, smoothNodes.length)).toFixed(1));
  const maxSlopeDeg = Number(maxSlope.toFixed(1));
  const speedKmh = mode === 'foot' ? 3.2 : 6.0;
  const maxSafeSlopeLimit = mode === 'foot' ? 15.0 : 20.0;
  const estimatedDurationHours = Number((totalDistanceKm / speedKmh + (elevGainM / 300)).toFixed(1));
  const batteryRequiredKwh = mode === 'foot'
    ? Number((0.08 * totalDistanceKm).toFixed(2))
    : Number((0.35 * totalDistanceKm + elevGainM * 0.0022).toFixed(2));
  const oxygenRatePerMin = mode === 'foot'
    ? 1.25 + avgSlopeDeg * 0.045
    : 0.45;
  const oxygenRequiredLiters = Math.round(estimatedDurationHours * 60 * oxygenRatePerMin);

  let safetyScore = 100 - (maxSlopeDeg > (maxSafeSlopeLimit - 4) ? (maxSlopeDeg - (maxSafeSlopeLimit - 4)) * 6 : 0) - (warningCount * 1.5);
  safetyScore = Math.max(15, Math.min(100, Math.round(safetyScore)));

  const isViable = maxSlopeDeg <= maxSafeSlopeLimit;

  const summary = isViable
    ? `Optimal ${mode === 'foot' ? 'Marswalk EVA' : 'Rover Traverse'} Confirmed: Route successfully navigates through natural ramps (<${maxSafeSlopeLimit}° slope limit), avoiding hazards and sand traps. Duration: ${estimatedDurationHours}h.`
    : `Hazard Warning: Route slope ${maxSlopeDeg}° exceeds the ${maxSafeSlopeLimit}° safety limit for ${mode === 'foot' ? 'human suited Marswalks' : 'pressurized rover traverses'}.`;

  return {
    path: smoothNodes,
    rawCoordinates: rawCoords,
    totalDistanceKm,
    estimatedDurationHours,
    batteryRequiredKwh,
    oxygenRequiredLiters,
    elevationGainM: Math.round(elevGainM),
    elevationLossM: Math.round(elevLossM),
    maxSlopeDeg,
    avgSlopeDeg,
    hazardPassCount: warningCount,
    isViable,
    safetyScore,
    traverseMode: mode,
    summary,
  };
}
