import React, { memo } from 'react';
import { Box, Header, SpaceBetween } from '@cloudscape-design/components';
import TextSettings, { isTextWidget } from './sections/textSettingSection/text';
import LinkSettings from './sections/textSettingSection/link';
import { BaseSettings } from './sections/baseSettingSection';
import AxisSetting, { isAxisSettingsSupported } from './sections/axisSettingSection';
import ThresholdsSection, { isThresholdsSupported } from './sections/thresholdsSection/thresholdsSection';
import { isPropertiesAndAlarmsSupported, PropertiesAlarmsSection } from './sections/propertiesAlarmSection';
import type { DashboardMessages } from '~/messages';
import type { FC } from 'react';
import { useSelectedWidgets } from '~/hooks/useSelectedWidgets';

import './index.css';

const SidePanel: FC<{ messageOverrides: DashboardMessages }> = ({ messageOverrides }) => {
  const selectedWidgets = useSelectedWidgets();
  if (selectedWidgets.length !== 1) {
    return (
      <div className='side-panel-empty'>
        <Box margin='m' variant='p' color='text-status-inactive'>
          {messageOverrides.sidePanel.defaultMessage}
        </Box>
      </div>
    );
  }

  const selectedWidget = selectedWidgets[0];

  return (
    <Box padding={{ horizontal: 'm', vertical: 'l' }}>
      <Header variant='h3'>{messageOverrides.sidePanel.header}</Header>
      <SpaceBetween size='xs' direction='vertical'>
        <BaseSettings {...selectedWidget} />
        {isTextWidget(selectedWidget) && (
          <>
            <TextSettings {...selectedWidget} />
            <LinkSettings {...selectedWidget} />
          </>
        )}
        {isPropertiesAndAlarmsSupported(selectedWidget) && <PropertiesAlarmsSection {...selectedWidget} />}
        {isThresholdsSupported(selectedWidget) && <ThresholdsSection {...selectedWidget} />}
        {isAxisSettingsSupported(selectedWidget) && <AxisSetting {...selectedWidget} />}
      </SpaceBetween>
    </Box>
  );
};

export default memo(SidePanel);
