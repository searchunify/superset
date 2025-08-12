# Bar Chart with Radius Support

This chart type extends the standard ECharts timeseries bar chart with additional styling options including bar radius support.

## Features

- **Bar Radius**: Add rounded corners to bars by setting a border radius in pixels
- **Bar Width**: Control the width of bars in pixels
- **Axis & Grid Control**: Show/hide X axis, Y axis, and grid lines
- **Orientation**: Support for both vertical and horizontal bar orientations
- **All standard timeseries features**: Time-based data, forecasting, annotations, etc.

## Bar Configuration

### Bar Radius

The bar radius feature allows you to add rounded corners to the bars in your chart:

- **Default**: 0 (sharp corners)
- **Range**: Any positive number in pixels
- **Effect**: Applies `borderRadius` to the `itemStyle` of bar series

### Bar Width

The bar width feature allows you to control the width of bars in your chart:

- **Default**: 5 pixels
- **Range**: Any positive number in pixels
- **Effect**: Applies `barWidth` property to bar series

### Axis & Grid Display

The axis and grid display controls allow you to show or hide various chart elements:

- **Show X Axis**: Controls visibility of the X axis, labels, ticks, and line
- **Show Y Axis**: Controls visibility of the Y axis, labels, ticks, and line
- **Show Grid Lines**: Controls visibility of grid lines on both axes
- **Default**: All elements are shown (true)
- **Effect**: Applies `show` property to axis components and `splitLine.show` to grid lines

### Stacked Bar Radius Behavior

When using stacked bars, the border radius is intelligently applied based on the series position:

- **First series in stack**: Top corners only (`[radius, radius, 0, 0]`)
- **Last series in stack**: Bottom corners only (`[0, 0, radius, radius]`)
- **Middle series in stack**: No radius (`[0, 0, 0, 0]`)
- **Single series**: All corners (`[radius, radius, radius, radius]`)
- **Non-stacked bars**: All corners (`[radius, radius, radius, radius]`)

This ensures that stacked bars have a cohesive appearance with rounded corners only on the outer edges of the stack.

### Usage

1. Select the "Bar Chart" visualization type
2. In the "Chart Options" section, find the styling controls:
   - **Bar Radius**: e.g., 5 for rounded corners
   - **Bar Width**: e.g., 20 for wider bars
3. In the "Axis & Grid Display" section, control visibility:
   - **Show X Axis**: Toggle X axis visibility
   - **Show Y Axis**: Toggle Y axis visibility
   - **Show Grid Lines**: Toggle grid line visibility
4. The chart will update in real-time with your styling and display preferences

### Technical Implementation

The bar styling and display features are implemented by:

1. Adding `barRadius?: number`, `barWidth?: number`, `showXAxis?: boolean`, `showYAxis?: boolean`, and `showGridLines?: boolean` to the `EchartsTimeseriesFormData` type
2. Setting default values in `DEFAULT_FORM_DATA` (barRadius: 0, barWidth: 5, showXAxis: true, showYAxis: true, showGridLines: true)
3. Adding control components in the control panel for user input:
   - `TextControl` for bar radius and width
   - `CheckboxControl` for axis and grid visibility
4. Applying the properties in the `transformSeries` function when `seriesType === 'bar'`
5. For stacked bars, passing `seriesIndex` and `totalSeriesCount` to determine position
6. Applying different border radius arrays based on series position in the stack
7. Applying bar width to all bar series when specified
8. Applying axis and grid visibility settings in `transformProps.ts` by setting `show` properties on axis components and `splitLine.show` for grid lines

### Example

```typescript
// In the control panel
{
  name: 'barRadius',
  config: {
    type: 'TextControl',
    label: t('Bar Radius'),
    description: t('Border radius of bars in pixels (0 for sharp corners)'),
    default: 0,
    renderTrigger: true,
  },
},
{
  name: 'barWidth',
  config: {
    type: 'TextControl',
    label: t('Bar Width'),
    description: t('Width of bars in pixels'),
    default: 5,
    renderTrigger: true,
  },
},
{
  name: 'showXAxis',
  config: {
    type: 'CheckboxControl',
    label: t('Show X Axis'),
    description: t('Show or hide the X axis'),
    default: true,
    renderTrigger: true,
  },
},
{
  name: 'showYAxis',
  config: {
    type: 'CheckboxControl',
    label: t('Show Y Axis'),
    description: t('Show or hide the Y axis'),
    default: true,
    renderTrigger: true,
  },
},
{
  name: 'showGridLines',
  config: {
    type: 'CheckboxControl',
    label: t('Show Grid Lines'),
    description: t('Show or hide grid lines'),
    default: true,
    renderTrigger: true,
  },
}

// In the transformer
if (seriesType === 'bar' && barRadius && barRadius > 0) {
  const radius = parseInt(`${barRadius}`, 10);
  
  if (stack && totalSeriesCount && totalSeriesCount > 1) {
    // For stacked bars, apply radius based on position
    const isFirstSeries = seriesIndex === 0;
    const isLastSeries = seriesIndex === totalSeriesCount - 1;
    
    // [tl, tr, br, bl]
    if (isFirstSeries && isLastSeries) {
      // Single series in stack - apply radius to all corners
      itemStyle.borderRadius = [radius, radius, radius, radius];
    } else if (isFirstSeries) {
      // First series in stack - apply radius to top corners only
      itemStyle.borderRadius = [radius, 0, 0, radius];
    } else if (isLastSeries) {
      // Last series in stack - apply radius to bottom corners only
      itemStyle.borderRadius = [0, radius, radius, 0];
    } else {
      // Middle series in stack - no radius
      itemStyle.borderRadius = [0, 0, 0, 0];
    }
  } else {
    // For non-stacked bars, apply radius to all corners
    itemStyle.borderRadius = [radius, radius, radius, radius];
  }
}

// Apply bar width for bar series
if (seriesType === 'bar' && barWidth && barWidth > 0) {
  seriesConfig.barWidth = barWidth;
}

// In transformProps.ts - Apply axis and grid visibility
let xAxis: any = {
  // ... other properties
  show: showXAxis !== false,
  axisLabel: {
    show: showXAxis !== false,
    // ... other properties
  },
  axisLine: {
    show: showXAxis !== false,
  },
  axisTick: {
    show: showXAxis !== false,
  },
  splitLine: {
    show: showGridLines !== false,
  },
};

let yAxis: any = {
  // ... other properties
  show: showYAxis !== false,
  axisLabel: {
    show: showYAxis !== false,
    // ... other properties
  },
  axisLine: {
    show: showYAxis !== false,
  },
  axisTick: {
    show: showYAxis !== false,
  },
  splitLine: {
    show: showGridLines !== false,
  },
};
```

This feature enhances the visual appeal of bar charts by allowing users to create more modern, rounded bar designs.
