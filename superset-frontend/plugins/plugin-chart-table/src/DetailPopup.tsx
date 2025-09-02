/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useMemo } from 'react';
import { Modal, Result } from 'antd';
import {
  DataRecord,
  DataRecordFilters,
  styled,
  t,
} from '@superset-ui/core';
import { DataColumnMeta } from './types';

const ChartContainer = styled.div`
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 500px;
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: ${({ theme }) => theme.borderRadius}px;
`;

// ============================================================================
// --- 1. DEFINE YOUR CHART MAPPINGS HERE ---
// ============================================================================
const chartMap: Record<string | number, number> = {
  2004: 1457,
  2003: 1457,
  2005: 1457,
};
// ============================================================================

export interface DetailPopupProps {
  visible: boolean;
  onClose: () => void;
  rowData?: DataRecord;
  clickedColumn?: DataColumnMeta;
  dashboardFilters?: DataRecordFilters;
}

export const DetailPopup = ({
  visible,
  onClose,
  rowData,
  clickedColumn,
  dashboardFilters,
}: DetailPopupProps) => {
  if (!visible || !rowData || !clickedColumn) {
    return null;
  }

  // Build the iframe URL using useMemo so it only recalculates when inputs change
  const chartUrl = useMemo(() => {
    const clickedValue = rowData[clickedColumn.key];
    const sliceId =
      clickedValue !== null && clickedValue !== undefined
        ? chartMap[clickedValue.toString()]
        : undefined;

    if (!sliceId) {
      return null;
    }

    // 1. Create a map to hold the final set of filters.
    const finalFilters: Record<string, any> = {};

    // 2. Add all existing dashboard filters to the map as the base.
    if (dashboardFilters) {
      Object.entries(dashboardFilters).forEach(([col, val]) => {
        finalFilters[col] = {
          clause: 'WHERE',
          subject: col,
          operator: 'IN',
          comparator: val,
          expressionType: 'SIMPLE',
        };
      });
    }

    // 3. Overwrite the filter for the clicked column with the specific cell value.
    //    This correctly performs a "drill-down" by replacing a general filter
    //    (e.g., Year IN [2023, 2024]) with a specific one (e.g., Year IN [2024]).
    //    Using 'IN' with an array is more robust and consistent.
    finalFilters[clickedColumn.key] = {
      clause: 'WHERE',
      subject: clickedColumn.key,
      operator: 'IN',
      comparator: [clickedValue], // Use IN with an array for consistency
      expressionType: 'SIMPLE',
    };

    // 4. Convert the map of filters back to an array for the form_data.
    const adhocFilters = Object.values(finalFilters);

    const formData = { adhoc_filters: adhocFilters };
    const encodedFormData = encodeURIComponent(JSON.stringify(formData));

    // Return Superset iframe URL
    return `/superset/slice/${sliceId}?standalone=1&extra_form_data=${encodedFormData}`;
  }, [rowData, clickedColumn, dashboardFilters]);

  const title = t("Details for '%s'", String(rowData[clickedColumn.key]));

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <ChartContainer>
        {chartUrl ? (
          <Iframe src={chartUrl} title={title} />
        ) : (
          <Result
            status="info"
            title={t('No Chart Available')}
            subTitle={t(
              "There is no chart mapped for the value '%s'.",
              String(rowData[clickedColumn.key]),
            )}
          />
        )}
      </ChartContainer>
    </Modal>
  );
};