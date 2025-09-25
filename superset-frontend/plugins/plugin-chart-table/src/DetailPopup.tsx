import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Result, Table, Spin, message } from 'antd';
import { SuperChart } from '@superset-ui/core';
import { DataRecord, DataRecordFilters, styled, t } from '@superset-ui/core';
import { DataColumnMeta } from './types';

const ChartContainer = styled.div`
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export interface DetailPopupProps {
  visible: boolean;
  onClose: () => void;
  rowData?: DataRecord;
  clickedColumn?: DataColumnMeta;
  dashboardFilters?: DataRecordFilters;
  sliceId: number; // chart ID
}

export const DetailPopup = ({
  visible,
  onClose,
  rowData,
  clickedColumn,
  dashboardFilters,
  sliceId,
}: DetailPopupProps) => {
  const [chartMeta, setChartMeta] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch chart metadata
  useEffect(() => {
    if (!visible || !sliceId) return;

    const fetchChartMeta = async () => {
      try {
        const res = await fetch(`/su-bi/api/v1/chart/${sliceId}`);
        if (!res.ok) throw new Error('Failed to fetch chart metadata');
        const jsonData = await res.json();
        setChartMeta(jsonData);
      } catch (err: any) {
        console.error(err);
        message.error(err.message);
      }
    };

    fetchChartMeta();
  }, [visible, sliceId]);

  // 2. Build query payload for v1/chart/data
  const queryPayload = useMemo(() => {
    if (!chartMeta?.result || !rowData || !clickedColumn) return null;

    // Parse query_context and params (they are stringified JSON)
    let queryContext: any = {};
    let params: any = {};
    try {
      queryContext = chartMeta.result.query_context
        ? JSON.parse(chartMeta.result.query_context)
        : {};
    } catch {}
    try {
      params = chartMeta.result.params
        ? JSON.parse(chartMeta.result.params)
        : {};
    } catch {}

    // Build filters
    const filters: any[] = [];

    if (dashboardFilters) {
      Object.entries(dashboardFilters).forEach(([col, val]) => {
        filters.push({
          col,
          op: 'IN',
          val,
        });
      });
    }

    const clickedValue = rowData.values[clickedColumn.key];
    filters.push({
      col: clickedColumn.key,
      op: 'IN',
      val: [clickedValue],
    });

    // Columns (prefer query_context, else params, else rowData keys)
    const columns =
      queryContext?.queries?.[0]?.columns ||
      params?.all_columns ||
      rowData.colNames;

    // Metrics
    const metrics =
      queryContext?.queries?.[0]?.metrics || params?.metrics || [];
    // Datasource object
    const datasource = queryContext?.datasource || null;

    if (!datasource) {
      console.error('No datasource info found in chartMeta');
      return null;
    }
    // enforce status closed/Closed
    filters.push({
      col: 'status',
      op: 'IN',
      val: ['closed', 'Closed'],
    });
    // filters.push({
    //   col: 'day',
    //   op: 'TEMPORAL_RANGE',
    //   val: 'DATEADD(DATETIME(), -3, month) : now',
    // });
    filters.push(
      {
        col: 'day',
        op: '>=',
        val: [Date.now() - 210 * 24 * 60 * 60 * 1000], // 90 days ago in ms
      },
      {
        col: 'day',
        op: '<=',
        val: [Date.now() - 30 * 24 * 60 * 60 * 1000],
      },
    );

    return {
      datasource,
      queries: [
        {
          columns,
          filters,
          metrics,
          row_limit: 1000,
        },
      ],
    };
  }, [chartMeta, rowData, clickedColumn, dashboardFilters]);

  // 3. Fetch chart data from v1 API
  useEffect(() => {
    if (!queryPayload) return;

    const fetchChartData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/su-bi/api/v1/chart/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(queryPayload),
        });

        // if (!res.ok) {
        //   const errJson = await res.json();
        //   throw new Error(errJson.message || 'Failed to fetch chart data');
        // }

        const jsonData = await res.json();
        console.log('chart data res', jsonData);
        setChartData(jsonData.result[0]); // Superset v1 returns array of results
      } catch (err: any) {
        console.error(err);
        message.error(err.message);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [queryPayload]);

  // Prepare AntD Table columns dynamically if chartData is a table
  const tableColumns = useMemo(() => {
    console.log('chartData', chartData);
    if (!chartData?.colnames) return [];
    console.log('chartData columns', chartData?.colnames);
    return chartData.colnames.map((col: string) => ({
      title: col,
      dataIndex: col,
      key: col,
    }));
  }, [chartData]);

  const dynamicFormData = useMemo(() => {
    if (!chartMeta?.result?.params) return null;

    let baseFormData: any = {};
    try {
      baseFormData = JSON.parse(chartMeta.result.params);
    } catch (err) {
      console.error('Failed to parse chartMeta.params', err);
    }

    return {
      ...baseFormData,
      // You can override or inject runtime stuff here if needed:
      extra_filters: queryPayload?.queries?.[0]?.filters || [],
    };
  }, [chartMeta, queryPayload]);

  if (!visible || !rowData || !clickedColumn) {
    console.log('returning nothing');

    return null;
  }

  console.log('rowData', rowData);
  const title = t(
    "Details for '%s'",
    String(rowData.values[clickedColumn.key]),
  );
  console.log('visible', visible);
  console.log('modal title', title);
  console.log('rowData', rowData);
  console.log('clickedColumn', clickedColumn);
  console.log(
    'JSON.parse(chartMeta.result.query_context).queries[0]',
    chartMeta?.result?.query_context?.queries,
  );
  console.log('JSON.parse(chartMeta.result.params)', chartMeta?.result?.params);

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <ChartContainer>
        {loading ? (
          <Spin size="large" />
        ) : chartData && chartData.data && chartData.data.length ? (
          chartMeta?.result?.viz_type === 'echarts_timeseries_bar' ? (
            <SuperChart
              chartType="echarts_timeseries_bar"
              formData={dynamicFormData}
              queriesData={[{ data: chartData.data }]}
              height={400}
              width={600}
            />
          ) : (
            <Table
              dataSource={chartData.data}
              columns={tableColumns}
              pagination={{ pageSize: 20 }}
              rowKey={(record: any, idx: number) => idx}
            />
          )
        ) : (
          <Result
            status="info"
            title={t('No Chart Data Available')}
            subTitle={t(
              "There is no chart data for the value '%s'.",
              String(rowData.values[clickedColumn.key]),
            )}
          />
        )}
      </ChartContainer>
    </Modal>
  );
};
