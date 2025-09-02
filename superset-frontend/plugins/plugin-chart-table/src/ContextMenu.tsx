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
import { MouseEvent } from 'react';
// CORRECTION 1 of 2: Import MenuInfo to get the correct event type
import { Menu } from 'antd';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { styled, t } from '@superset-ui/core';

const MenuWrapper = styled.div`
  position: fixed;
  z-index: 1000;
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  background: ${({ theme }) => theme.colors.grayscale.light5};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: ${({ theme }) => theme.borderRadius}px;
`;

export interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onMoreDetail: () => void;
  onDrillToDetail: () => void;
  isDrillToDetailEnabled: boolean;
}

export const ContextMenu = ({
  visible,
  x,
  y,
  onClose,
  onMoreDetail,
  onDrillToDetail,
  isDrillToDetailEnabled,
}: ContextMenuProps) => {
  if (!visible) {
    return null;
  }

  // A transparent overlay to catch clicks outside the menu
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onClose();
  };

  // CORRECTION 2 of 2: Use the correct MenuInfo type for the event handler
  const handleMenuClick = (info: MenuInfo) => {
    if (info.key === 'more-detail') {
      onMoreDetail();
    } else if (info.key === 'drill-to-detail') {
      onDrillToDetail();
    }
    onClose();
  };

  return (
    <>
      <div
        role="presentation"
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: 'transparent',
        }}
      />
      <MenuWrapper style={{ top: y, left: x }}>
        <Menu onClick={handleMenuClick}>
          <Menu.Item key="more-detail">{t('More Detail')}</Menu.Item>
          {isDrillToDetailEnabled && (
            <Menu.Item key="drill-to-detail">{t('Drill to detail')}</Menu.Item>
          )}
        </Menu>
      </MenuWrapper>
    </>
  );
};