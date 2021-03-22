export function sumSqError(predictions: Array<number>, actual: Array<number>): number
{
  if (predictions === undefined || predictions == null || predictions.length == 0) return -1;

  if (actual === undefined || actual == null || actual.length == 0) return -1;

  if (predictions.length !== actual.length) return -1;

  const n: number = predictions.length;

  let i: number;
  let error: number;

  let sum = 0;

  for (i = 0; i < n; ++i) {
    error = predictions[i] - actual[i];

    sum += error*error;
  }

  return sum;
}

export function mse(predictions: Array<number>, actual: Array<number>): number
{
  if (predictions === undefined || predictions == null || predictions.length == 0) return -1;

  if (actual === undefined || actual == null || actual.length == 0) return -1;

  if (predictions.length !== actual.length) return -1;

  const n: number = predictions.length;

  return sumSqError(predictions, actual) / n;
}
