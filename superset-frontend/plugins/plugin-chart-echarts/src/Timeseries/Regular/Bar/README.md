# Bar Chart with Radius Support

This chart type extends the standard ECharts timeseries bar chart with additional styling options including bar radius support.

## Features

- **Bar Radius**: Add rounded corners to bars by setting a border radius in pixels
- **Orientation**: Support for both vertical and horizontal bar orientations
- **All standard timeseries features**: Time-based data, forecasting, annotations, etc.

## Bar Radius Configuration

The bar radius feature allows you to add rounded corners to the bars in your chart:

- **Default**: 0 (sharp corners)
- **Range**: Any positive number in pixels
- **Effect**: Applies `borderRadius` to the `itemStyle` of bar series

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
2. In the "Chart Options" section, find the "Bar Radius" control
3. Enter a value in pixels (e.g., 5 for rounded corners)
4. The chart will update to show bars with rounded corners

### Technical Implementation

The bar radius is implemented by:

1. Adding `barRadius?: number` to the `EchartsTimeseriesFormData` type
2. Setting a default value of `0` in `DEFAULT_FORM_DATA`
3. Adding a `TextControl` in the control panel for user input
4. Applying the radius in the `transformSeries` function when `seriesType === 'bar'`
5. For stacked bars, passing `seriesIndex` and `totalSeriesCount` to determine position
6. Applying different border radius arrays based on series position in the stack

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
```

This feature enhances the visual appeal of bar charts by allowing users to create more modern, rounded bar designs.
