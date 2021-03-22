/** Copyright 2017 Jim Armstrong (www.algorithmist.net)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */

import {
  expSmooth,
  doubleExpSmooth,
  holtWinters,
  holtWintersPartitioned,
} from "../src/exp-smoothing";

import { mse } from "../src/errors";

const TEST_SERIES: Array<number> = [
  30, 21, 29, 31, 40, 48, 53, 47, 37, 39, 31, 29, 17, 9, 20, 24, 27, 35, 41, 38,
  27, 31, 27, 26, 21, 13, 21, 18, 33, 35, 40, 36, 22, 24, 21, 20, 17, 14, 17, 19,
  26, 29, 40, 31, 20, 24, 18, 26, 17, 9, 17, 21, 28, 32, 46, 33, 23, 28, 22, 27,
  18, 8, 17, 21, 31, 34, 44, 38, 31, 30, 26, 32];

describe('Exponential smoothing tests', () => {

  it('single exp. smoothing works with invalid inputs', function() {
    expect(expSmooth(null, 1.0).length).toBe(0);
    expect(expSmooth([], 0.0).length).toBe(0);
    expect(expSmooth([1, 2, 3], -1).length).toBe(0);
  });

  it('single exp. smoothing test #1', function() {
    const result: Array<number> = expSmooth([6.4, 5.6, 7.8, 8.8, 11.0, 11.6, 16.7, 15.3, 21.6, 22.4], 0.3);

    expect(result.length).toBe(10);

    expect(result[0]).toBe(0);
    expect(result[1]).toEqual(6.4);
    expect(result[2]).toBeCloseTo(6.16, 2);
    expect(result[3]).toBeCloseTo(6.652, 2);
    expect(result[4]).toBeCloseTo(7.296, 2);
    expect(result[5]).toBeCloseTo(8.407, 2);
    expect(result[6]).toBeCloseTo(9.365, 2);
    expect(result[7]).toBeCloseTo(11.565, 2);
    expect(result[8]).toBeCloseTo(12.685, 2);
    expect(result[9]).toBeCloseTo(15.360, 2);
  });

  it('single exp. smoothing test #2 (w/mse)', function() {
    const result: Array<number> = expSmooth([71, 70, 69, 68, 64, 65, 72, 78, 75, 75, 75, 70], 0.1);

    expect(result.length).toBe(12);

    expect(result[0]).toBe(0);
    expect(result[1]).toEqual(71);
    expect(result[2]).toBeCloseTo(70.9, 1);
    expect(result[3]).toBeCloseTo(70.71, 2);
    expect(result[4]).toBeCloseTo(70.439, 2);
    expect(result[5]).toBeCloseTo(69.7951, 3);
    expect(result[6]).toBeCloseTo(69.3155, 3);
    expect(result[7]).toBeCloseTo(69.5840, 3);
    expect(result[8]).toBeCloseTo(70.4256, 3);
    expect(result[9]).toBeCloseTo(70.8830, 3);
    expect(result[10]).toBeCloseTo(71.2947, 3);
    expect(result[11]).toBeCloseTo(71.6652, 3);

    expect(mse(result.slice(1), [70, 69, 68, 64, 65, 72, 78, 75, 75, 75, 70])).toBeCloseTo(18.983491791422477, 3);
  });

  it('double exp. smoothing works with invalid inputs', function() {
    expect(doubleExpSmooth(null, 1.0, 1.0).length).toBe(0);
    expect(doubleExpSmooth([], 0.0, 0.0).length).toBe(0);
    expect(doubleExpSmooth([1, 2, 3], -1, 0.9).length).toBe(0);
    expect(doubleExpSmooth([1, 2, 3], 0.3, 1.5).length).toBe(0);
  });

  it('double exp. smoothing test #1', function() {
    const result: Array<number> = doubleExpSmooth([6.4, 5.6, 7.8, 8.8, 11.0, 11.6, 16.7, 15.3, 21.6, 22.4], 0.3623, 1.0);

    expect(result[0]).toBe(0);
    expect(result[1]).toEqual(6.4);
    expect(result[2]).toBeCloseTo(6.39706, 3);
    expect(result[3]).toBeCloseTo(7.265770, 3);
    expect(result[4]).toBeCloseTo(9.172658, 3);
    expect(result[5]).toBeCloseTo(11.26810, 3);
    expect(result[6]).toBeCloseTo(14.572349, 3);
    expect(result[7]).toBeCloseTo(16.943092, 3);
    expect(result[8]).toBeCloseTo(20.142112, 3);
    expect(result[9]).toBeCloseTo(23.00016, 3);
  });

  it('Holt-Winters works with invalid inputs', function() {
    expect(holtWinters(null, 1.0, 1.0, 1.0, 1, 10).length).toBe(0);
    expect(holtWinters([], 0.0, 0.0, 0.0, 1, 10).length).toBe(0);
    expect(holtWinters([1, 2, 3], -1, 1, 1, 1, 10).length).toBe(0);
    expect(holtWinters([1, 2, 3], 1, -1, 1, 1, 10).length).toBe(0);
    expect(holtWinters([1, 2, 3], 0, 1, -0.5, 1, 10).length).toBe(0);
    expect(holtWinters([1, 2, 3], 0, 1, 1.5, 1, 10).length).toBe(0);
  });

  it('Holt-Winters basic test', function() {
    const result: Array<number> = holtWinters(TEST_SERIES, 0.716, 0.029, 0.993, 12, 10);
    const n: number             = result.length;
    // console.log('result:', result);

    expect(result[n-10]).toBeCloseTo(22.42511411230803, 4);
    expect(result[n-9] ).toBeCloseTo(15.34337175522306, 4);
    expect(result[n-8] ).toBeCloseTo(24.14282581581347, 4);
    expect(result[n-7] ).toBeCloseTo(27.02259921391996, 4);
    expect(result[n-6] ).toBeCloseTo(35.31139046245393, 4);
    expect(result[n-5] ).toBeCloseTo(38.99901466933735, 4);
    expect(result[n-4] ).toBeCloseTo(49.24328387569265, 4);
    expect(result[n-3] ).toBeCloseTo(40.84636009563803, 4);
    expect(result[n-2] ).toBeCloseTo(31.20518050370701, 4);
    expect(result[n-1] ).toBeCloseTo(32.96259980122959, 4);
  });

  it('Holt-Winters partition basic test', function() {
    const result: {smoothed: Array<number>, predictions: Array<number>} = holtWintersPartitioned(TEST_SERIES, 0.716, 0.029, 0.993, 12, 10);

    const predictions: Array<number> = result.predictions;
    const n: number = predictions.length;

    expect(n).toEqual(10);

    expect(predictions[0]).toBeCloseTo(22.42511411230803, 4);
    expect(predictions[1] ).toBeCloseTo(15.34337175522306, 4);
    expect(predictions[2] ).toBeCloseTo(24.14282581581347, 4);
    expect(predictions[3] ).toBeCloseTo(27.02259921391996, 4);
    expect(predictions[4] ).toBeCloseTo(35.31139046245393, 4);
    expect(predictions[5] ).toBeCloseTo(38.99901466933735, 4);
    expect(predictions[6] ).toBeCloseTo(49.24328387569265, 4);
    expect(predictions[7] ).toBeCloseTo(40.84636009563803, 4);
    expect(predictions[8] ).toBeCloseTo(31.20518050370701, 4);
    expect(predictions[9] ).toBeCloseTo(32.96259980122959, 4);
  });
});
