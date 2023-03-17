import { newSpecPage } from '@stencil/core/testing';
import { MinimalLiveViewport } from '@synchro-charts/core';
import flushPromises from 'flush-promises';
import {
  initialize,
  createMockSiteWiseSDK,
  createMockIoTEventsSDK,
  ALARM_ASSET_ID,
  ALARM_STATE_PROPERTY_ID,
  TIME_SERIES_DATA_WITH_ALARMS,
  ALARM_MODEL,
  ALARM_PROPERTY_VALUE_HISTORY,
  ALARM_SOURCE_PROPERTY_VALUE,
  ALARM_STATE_PROPERTY_VALUE,
  ASSET_MODEL_WITH_ALARM,
  THRESHOLD_PROPERTY_VALUE,
  toId,
  fromId,
} from '@iot-app-kit/source-iotsitewise';
import { IotTimeSeriesConnector } from './iot-time-series-connector';
import { update } from '../../testing/update';
import { CustomHTMLElement } from '../../testing/types';
import { Components } from '../../components';
import { mockSiteWiseSDK } from '../../testing/mocks/siteWiseSDK';
import { colorPalette } from '../common/colorPalette';
import { mockEventsSDK } from '../../testing/mocks/eventsSDK';

const DATA_STREAM_ID_1 = toId({ assetId: 'some-asset-id', propertyId: 'some-property-id' });
const DATA_STREAM_ID_2 = toId({ assetId: 'some-asset-id-2', propertyId: 'some-property-id-2' });

const viewport: MinimalLiveViewport = {
  duration: 1000,
};

const connectorSpecPage = async (props: Partial<Components.IotTimeSeriesConnector>) => {
  const page = await newSpecPage({
    components: [IotTimeSeriesConnector],
    html: '<div></div>',
    supportsShadowDom: false,
  });
  const connector = page.doc.createElement(
    'iot-time-series-connector'
  ) as CustomHTMLElement<Components.IotTimeSeriesConnector>;

  update(connector, props);

  page.body.appendChild(connector);

  await page.waitForChanges();

  return { page, connector };
};

describe.skip('iot connector', () => {
  it('renders', async () => {
    const renderFunc = jest.fn();

    const { query } = initialize({
      iotSiteWiseClient: mockSiteWiseSDK,
      iotEventsClient: mockEventsSDK,
    });

    await connectorSpecPage({
      renderFunc,
      initialViewport: viewport,
      provider: query
        .timeSeriesData({ assets: [] })
        .build('widget-id', { viewport, settings: { fetchMostRecentBeforeEnd: true } }),
    });

    await flushPromises();

    expect(renderFunc).toBeCalledTimes(1);
    expect(renderFunc).toBeCalledWith({
      dataStreams: [],
      viewport,
      annotations: { y: [] },
    });
  });

  it('provides data streams', async () => {
    const renderFunc = jest.fn();

    const { assetId: assetId_1, propertyId: propertyId_1 } = fromId(DATA_STREAM_ID_1);
    const { assetId: assetId_2, propertyId: propertyId_2 } = fromId(DATA_STREAM_ID_2);

    const { query } = initialize({
      iotSiteWiseClient: mockSiteWiseSDK,
      iotEventsClient: mockEventsSDK,
    });

    await connectorSpecPage({
      renderFunc,
      initialViewport: viewport,
      provider: query
        .timeSeriesData({
          assets: [
            { assetId: assetId_1, properties: [{ propertyId: propertyId_1 }] },
            { assetId: assetId_2, properties: [{ propertyId: propertyId_2 }] },
          ],
        })
        .build('widget-id', { viewport, settings: { fetchMostRecentBeforeEnd: true } }),
    });

    await flushPromises();

    expect(renderFunc).lastCalledWith(
      expect.objectContaining({
        dataStreams: expect.arrayContaining([
          expect.objectContaining({
            id: DATA_STREAM_ID_1,
          }),
        ]),
        viewport,
      })
    );
  });

  it('updates with new queries', async () => {
    const { assetId: assetId_1, propertyId: propertyId_1 } = fromId(DATA_STREAM_ID_1);
    const { assetId: assetId_2, propertyId: propertyId_2 } = fromId(DATA_STREAM_ID_2);

    const renderFunc = jest.fn();

    const { query } = initialize({
      iotSiteWiseClient: mockSiteWiseSDK,
      iotEventsClient: mockEventsSDK,
    });

    const { connector, page } = await connectorSpecPage({
      renderFunc,
      initialViewport: viewport,
      provider: query
        .timeSeriesData({ assets: [] })
        .build('widget-id', { viewport, settings: { fetchMostRecentBeforeEnd: true } }),
    });

    await flushPromises();

    connector.provider = query
      .timeSeriesData({
        assets: [
          { assetId: assetId_1, properties: [{ propertyId: propertyId_1 }] },
          { assetId: assetId_2, properties: [{ propertyId: propertyId_2 }] },
        ],
      })
      .build('widget-id', { viewport, settings: { fetchMostRecentBeforeEnd: true } });

    await page.waitForChanges();

    await flushPromises();

    expect(renderFunc).lastCalledWith(
      expect.objectContaining({
        dataStreams: expect.arrayContaining([
          expect.objectContaining({
            id: DATA_STREAM_ID_1,
          }),
        ]),
        viewport,
      })
    );
  });

  it('binds styles to data streams', async () => {
    const renderFunc = jest.fn();
    const { assetId, propertyId } = fromId(DATA_STREAM_ID_1);
    const REF_ID = 'some-ref-id';

    const { query } = initialize({
      iotSiteWiseClient: mockSiteWiseSDK,
      iotEventsClient: mockEventsSDK,
    });

    await connectorSpecPage({
      renderFunc,
      initialViewport: viewport,
      provider: query
        .timeSeriesData({ assets: [{ assetId, properties: [{ propertyId, refId: REF_ID }] }] })
        .build('widget-id', { viewport, settings: { fetchMostRecentBeforeEnd: true } }),
      styleSettings: {
        [REF_ID]: {
          color: 'red',
          name: 'my-name',
        },
      },
    });

    expect(renderFunc).lastCalledWith(
      expect.objectContaining({
        dataStreams: expect.arrayContaining([
          expect.objectContaining({
            id: DATA_STREAM_ID_1,
            refId: REF_ID,
            color: 'red',
            name: 'my-name',
          }),
        ]),
        viewport,
      })
    );
  });

  it('when assignDefaultColors is true, provides a default color', async () => {
    const renderFunc = jest.fn();
    const { assetId, propertyId } = fromId(DATA_STREAM_ID_1);
    const REF_ID = 'some-ref-id';

    const { query } = initialize({
      iotSiteWiseClient: mockSiteWiseSDK,
      iotEventsClient: mockEventsSDK,
    });

    await connectorSpecPage({
      renderFunc,
      initialViewport: viewport,
      provider: query
        .timeSeriesData({ assets: [{ assetId, properties: [{ propertyId, refId: REF_ID }] }] })
        .build('widget-id', { viewport, settings: { fetchMostRecentBeforeEnd: true } }),
      assignDefaultColors: true,
    });

    expect(renderFunc).lastCalledWith(
      expect.objectContaining({
        dataStreams: expect.arrayContaining([
          expect.objectContaining({
            color: colorPalette[0],
          }),
        ]),
        viewport,
      })
    );
  });

  it('combines annotations passed to component with the ones provided by time series data', async () => {
    const getAlarmModel = jest.fn().mockResolvedValue(ALARM_MODEL);
    const describeAsset = jest.fn().mockResolvedValue({
      id: ALARM_ASSET_ID,
      assetModelId: ASSET_MODEL_WITH_ALARM.assetModelId,
    });
    const describeAssetModel = jest.fn().mockResolvedValue(ASSET_MODEL_WITH_ALARM);
    const getAssetPropertyValue = jest
      .fn()
      .mockResolvedValueOnce({
        propertyValue: ALARM_SOURCE_PROPERTY_VALUE,
      })
      .mockResolvedValueOnce({
        propertyValue: ALARM_STATE_PROPERTY_VALUE,
      })
      .mockResolvedValueOnce({
        propertyValue: THRESHOLD_PROPERTY_VALUE,
      });
    const getAssetPropertyValueHistory = jest.fn().mockResolvedValue(ALARM_PROPERTY_VALUE_HISTORY);

    const renderFunc = jest.fn();

    const { query } = initialize({
      iotSiteWiseClient: createMockSiteWiseSDK({
        describeAsset,
        describeAssetModel,
        getAssetPropertyValue,
        getAssetPropertyValueHistory,
      }),
      iotEventsClient: createMockIoTEventsSDK({
        getAlarmModel,
      }),
    });

    await connectorSpecPage({
      renderFunc,
      initialViewport: viewport,
      provider: query
        .timeSeriesData({
          assets: [{ assetId: ALARM_ASSET_ID, properties: [{ propertyId: ALARM_STATE_PROPERTY_ID }] }],
        })
        .build('widget-id', { viewport }),
    });

    expect(renderFunc).lastCalledWith(
      expect.objectContaining({
        annotations: TIME_SERIES_DATA_WITH_ALARMS.annotations,
      })
    );
  });
});
