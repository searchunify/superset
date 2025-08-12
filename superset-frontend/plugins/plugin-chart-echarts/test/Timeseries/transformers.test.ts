/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { CategoricalColorScale } from '@superset-ui/core';
import { transformSeries } from '../../src/Timeseries/transformers';
import { EchartsTimeseriesSeriesType } from '../../src/Timeseries/types';

describe('transformSeries', () => {
  const mockColorScale = jest.fn(
    () => '#000000',
  ) as unknown as CategoricalColorScale;
  const series = { name: 'test', data: [] };

  it('should transform series with basic options', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Line,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect(result).toBeDefined();
  });

  it('should handle undefined series', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Line,
    };
    const result = transformSeries(
      undefined as any,
      mockColorScale,
      'test-key',
      opts,
    );
    expect(result).toBeUndefined();
  });

  it('should apply bar radius for bar series', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
      barRadius: 5,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.itemStyle?.borderRadius).toEqual([5, 5, 5, 5]);
  });

  it('should not apply bar radius for non-bar series', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Line,
      barRadius: 5,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.itemStyle?.borderRadius).toBeUndefined();
  });

  it('should not apply bar radius when barRadius is 0', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
      barRadius: 0,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.itemStyle?.borderRadius).toBeUndefined();
  });

  it('should not apply bar radius when barRadius is undefined', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.itemStyle?.borderRadius).toBeUndefined();
  });

  it('should apply correct border radius for first series in stack', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
      barRadius: 5,
      stack: true,
      seriesIndex: 0,
      totalSeriesCount: 3,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.itemStyle?.borderRadius).toEqual([5, 5, 0, 0]);
  });

  it('should apply correct border radius for last series in stack', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
      barRadius: 5,
      stack: true,
      seriesIndex: 2,
      totalSeriesCount: 3,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.itemStyle?.borderRadius).toEqual([0, 0, 5, 5]);
  });

  it('should apply no border radius for middle series in stack', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
      barRadius: 5,
      stack: true,
      seriesIndex: 1,
      totalSeriesCount: 3,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.itemStyle?.borderRadius).toEqual([0, 0, 0, 0]);
  });

  it('should apply full border radius for single series in stack', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
      barRadius: 5,
      stack: true,
      seriesIndex: 0,
      totalSeriesCount: 1,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.itemStyle?.borderRadius).toEqual([5, 5, 5, 5]);
  });

  it('should apply bar width for bar series', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
      barWidth: 20,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.barWidth).toBe(20);
  });

  it('should not apply bar width for non-bar series', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Line,
      barWidth: 20,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.barWidth).toBeUndefined();
  });

  it('should not apply bar width when barWidth is 0', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
      barWidth: 0,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.barWidth).toBeUndefined();
  });

  it('should not apply bar width when barWidth is undefined', () => {
    const opts = {
      seriesType: EchartsTimeseriesSeriesType.Bar,
    };
    const result = transformSeries(series, mockColorScale, 'test-key', opts);
    expect((result as any)?.barWidth).toBeUndefined();
  });
});
