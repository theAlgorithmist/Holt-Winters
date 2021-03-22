# Exponential Smoothing and Holt Winters

This is a simple TypeScript implementation of single, double, and triple exponential smoothing with Holt Winters forecasting.  [This article](https://en.wikipedia.org/wiki/Exponential_smoothing) provides a solid introduction to the topic.

Exponential smoothing can be used for rudimentary outlier detection.  All exponential smoothing methods require some parameter estimation.  Estimation typically involves computing versions of all parameters that minimize some metric such as sum of squared error or mean-squared error.  Code for both metrics is provided for you in the _/src/errors.ts_ file.  In general, parameter estimation requires additional software to perform the optimization such as Nelder Mead.

A [TypeScript implementation of Nelder Mead](https://github.com/theAlgorithmist/Nelder-Mead) is also available to you from my GitHub.

Some have experienced success with trial and error in parameter estimation, but in general, that involves a lot of trial and a lot of error.

Have fun and remember - if you want to forecast well, be prepared to forecast often :)

Author:  Jim Armstrong - [The Algorithmist]

@algorithmist

theAlgorithmist [at] gmail [dot] com

Typescript: 3.8.3

Jest: 25.2.1

Version: 1.0


## Installation

Installation involves all the usual suspects

  - npm installed globally
  - Clone the repository
  - npm install
  - get coffee (this is the most important step)


### Building and running the tests

1. npm t (it really should not be this easy, but it is)

2. Standalone compilation only (npm build)

Specs (_exp.spec.ts_) reside in the ___tests___ folder.


### Usage

Import the desired smoothing method (or all functions), i.e.

```
import {
  expSmooth,
  doubleExpSmooth,
  holtWinters,
  holtWintersPartitioned,
} from "../src/exp-smoothing";
```

For smoothing, simply call the desired method based on whether the series exhibits level only, level and trend, or level, trend, and seasonality.

```
 const result: Array<number> = expSmooth([71, 70, 69, 68, 64, 65, 72, 78, 75, 75, 75, 70], 0.1);
```

Use the Holt-Winters partitioned method for forecasting.  There will be some lag in the forecast, and the result array is zero-padded on the front end to accommodate setting chart data providers. You may replace the padded zeros with whatever value you like, depending on how the data is displayed.


Refer to the remainder of the specs for more usage examples.


License
----

Apache 2.0

**Free Software? Yeah, Homey plays that**

[//]: # (kudos http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

[The Algorithmist]: <https://www.linkedin.com/in/jimarmstrong/>

