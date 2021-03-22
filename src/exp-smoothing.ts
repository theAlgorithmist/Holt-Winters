/**
 * Copyright 2021 Jim Armstrong (https://www.linkedin.com/in/jimarmstrong/)
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

/**
 * Simple (additive) exponential smoothing for streams; the predictions is zero-padded at the beginning to make
 * it easier to set chart data providers, for example, relative to the input array.
 *
 * @param data Input data array
 *
 * @alpha smoothing parameter, 0 < alpha < 1
 *
 * @author Jim Armstrong
 *
 * @version 1.0
 */

export function expSmooth(data: Array<number>, alpha: number): Array<number>
{
  if (data === undefined || data == null) return [];

  if (data.length === 1) return [];

  if (isNaN(alpha) || alpha <= 0 || alpha >= 1) return [];

  // zero-pad
  const smoothed: Array<number> = new Array<number>();
  const n: number               = data.length;

  let i: number;

  smoothed[0] = 0;
  smoothed[1] = data[0];

  for (i = 2; i < n; ++i) {
    smoothed[i] = alpha*data[i-1] + (1-alpha)*smoothed[i-1];
  }

  return smoothed;
}


/**
 * Double exponential smoothing for streams; the predictions is zero-padded at the beginning to make it easier to set chart
 * data providers, for example, relative to the input array.
 *
 * @param data Input array of samples
 *
 * @param alpha Alpha parameter in (0,1) (must be estimated)
 *
 * @param gamma Gamma parameter in (0,1) (must be estimated)
 *
 * @author Jim Armstrong
 *
 * @version 1.0
 */
export function doubleExpSmooth(data: Array<number>, alpha: number, gamma: number): Array<number>
{
  if (data === undefined || data == null || data.length < 2) return [];

  if (isNaN(alpha) || alpha < 0 || alpha > 1) return [];
  if (isNaN(gamma) || gamma < 0 || gamma > 1 ) return [];

  // zero-pad
  const smoothed: Array<number> = new Array<number>();
  const b: Array<number>        = new Array<number>();
  const n: number               = data.length;

  let i: number;

  smoothed[0] = 0;
  b[0]        = 0;
  smoothed[1] = data[0];
  b[1]        = data[1] - data[0];  // TODO add alternatives

  for (i = 2; i < n; ++i)
  {
    smoothed[i] = alpha*data[i] + (1-alpha)*(smoothed[i-1] + b[i-1]);
    b[i]        = gamma*(smoothed[i] - smoothed[i-1]) + (1-gamma)*b[i-1];
  }

  return smoothed;
}

/**
 * Triple exponential smoothing; the predictions is zero-padded at the beginning to make it easier to set chart
 * data providers, for example, relative to the input array.
 *
 * @param data Input data array of samples
 *
 * @param alpha Alpha parameter in (0,1) - must be estimated
 *
 * @param beta Beta parameter in (0,1) - must be estimated
 *
 * @param gamma Gamma parameter in (0,1) - must be estimated
 *
 * @param seasonLength Length of seasonality in the sample data
 *
 * @param numPredictions Number of desired predictions
 */
export function holtWinters(
  data: Array<number>, 
  alpha: number, 
  beta: number, 
  gamma: number, 
  seasonLength: number,
  numPredictions: number
): Array<number>
{
  if (data === undefined || data == null) return [];

  const n: number = data.length;

  if (n < 3) return [];

  if (isNaN(alpha) || alpha < 0 || alpha > 1) return [];
  if (isNaN(beta) || beta < 0 || beta > 1) return [];
  if (isNaN(gamma) || gamma < 0 || gamma > 1 ) return [];
  
  // initial trend
  let sum = 0.0;
  let i: number;

  for (i = 0; i < seasonLength; ++i) {
    sum += (data[i + seasonLength] - data[i]) / seasonLength;
  }

  let trend: number = sum / seasonLength;

  // initial seasonals
  const seasonals: Array<number>      = new Array<number>();
  const seasonAverages: Array<number> = new Array<number>();
  const numSeasons: number            = Math.floor(n/seasonLength);

  // seasonal averages
  let j: number;
  for (j = 0; j < numSeasons; ++j)
  {
    sum = 0;
    for (i = seasonLength*j; i < seasonLength*j + seasonLength; ++i) {
      sum += data[i];
    }

    seasonAverages.push(sum/seasonLength);
  }

  // initial values
  for (i = 0; i < seasonLength; ++i)
  {
    sum = 0.0;
    for (j = 0; j < numSeasons; ++j) {
      sum += data[seasonLength*j + i] - seasonAverages[j];
    }

    seasonals[i] = sum / numSeasons;
  }

  // and now, for the main event
  const predictions: Array<number> = new Array<number>();

  let smooth: number;

  for (i = 0; i < n + numPredictions; ++i)
  {
    if (i == 0)
    {
      smooth = data[0];
      predictions.push(data[0]);
      continue;
    }

    if (i >= n)
    {
      const m: number = i - n + 1;
      predictions.push((smooth + m * trend) + seasonals[i % seasonLength]);
    }
    else
    {
      const lastSmooth: number = smooth;
      const val: number        = data[i];

      smooth = alpha * (val - seasonals[i % seasonLength]) + (1 - alpha) * (smooth + trend);
      trend  = beta * (smooth - lastSmooth) + (1 - beta) * trend;

      seasonals[i % seasonLength] = gamma * (val - smooth) + (1 - gamma) * seasonals[i % seasonLength];

      predictions.push(smooth + trend + seasonals[i % seasonLength]);
    }
  }

  return predictions;
}

export const EMPTY_PARTITION: {smoothed: Array<number>, predictions: Array<number>} = {
  smoothed: [],
  predictions: []
};

// impl of Holt Winters with result partitioned into smoothed samples and predictions
export function holtWintersPartitioned(
  data: Array<number>,
  alpha: number,
  beta: number,
  gamma: number,
  seasonLength: number,
  numPredictions: number
): {smoothed: Array<number>, predictions: Array<number>}
{
  if (data === undefined || data == null) return EMPTY_PARTITION;

  const n: number = data.length;

  if (n < 3) return EMPTY_PARTITION;

  if (isNaN(alpha) || alpha < 0 || alpha > 1) return EMPTY_PARTITION;
  if (isNaN(beta) || beta < 0 || beta > 1) return EMPTY_PARTITION;
  if (isNaN(gamma) || gamma < 0 || gamma > 1 ) return EMPTY_PARTITION;

  // initial trend
  let sum = 0.0;
  let i: number;

  for (i = 0; i < seasonLength; ++i) {
    sum += (data[i + seasonLength] - data[i]) / seasonLength;
  }

  let trend: number = sum / seasonLength;

  // initial seasonals
  const seasonals: Array<number>      = new Array<number>();
  const seasonAverages: Array<number> = new Array<number>();
  const numSeasons: number            = Math.floor(n/seasonLength);

  // seasonal averages
  let j: number;
  for (j = 0; j < numSeasons; ++j)
  {
    sum = 0;
    for (i = seasonLength*j; i < seasonLength*j + seasonLength; ++i) {
      sum += data[i];
    }

    seasonAverages.push(sum/seasonLength);
  }

  // initial values
  for (i = 0; i < seasonLength; ++i)
  {
    sum = 0.0;
    for (j = 0; j < numSeasons; ++j) {
      sum += data[seasonLength*j + i] - seasonAverages[j];
    }

    seasonals[i] = sum / numSeasons;
  }

  // and now, for the main event
  const smoothed: Array<number>    = new Array<number>();
  const predictions: Array<number> = new Array<number>();

  let smooth: number;

  for (i = 0; i < n + numPredictions; ++i)
  {
    if (i == 0)
    {
      smooth = data[0];
      smoothed.push(data[0]);
      continue;
    }

    if (i >= n)
    {
      const m: number = i - n + 1;
      predictions.push((smooth + m * trend) + seasonals[i % seasonLength]);
    }
    else
    {
      const lastSmooth: number = smooth;
      const val: number        = data[i];

      smooth = alpha * (val - seasonals[i % seasonLength]) + (1 - alpha) * (smooth + trend);
      trend  = beta * (smooth - lastSmooth) + (1 - beta) * trend;

      seasonals[i % seasonLength] = gamma * (val - smooth) + (1 - gamma) * seasonals[i % seasonLength];

      smoothed.push(smooth + trend + seasonals[i % seasonLength]);
    }
  }

  return {smoothed, predictions};
}
