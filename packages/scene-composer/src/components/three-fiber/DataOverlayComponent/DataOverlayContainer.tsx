import React, { ReactElement, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button } from '@awsui/components-react';

import { IDataOverlayComponentInternal, ISceneNodeInternal } from '../../../store/internalInterfaces';
import { Component } from '../../../models/SceneModels';
import { useStore, useViewOptionState } from '../../../store';
import { sceneComposerIdContext } from '../../../common/sceneComposerIdContext';
import useCallbackWhenNotPanning from '../../../hooks/useCallbackWhenNotPanning';

import { DataOverlayRows } from './DataOverlayRows';
import {
  tmAnnotationContainer,
  tmArrow,
  tmArrowInner,
  tmArrowOuter,
  tmCloseButton,
  tmContainer,
  tmPanelContainer,
} from './styles';

export interface DataOverlayContainerProps {
  node: ISceneNodeInternal;
  component: IDataOverlayComponentInternal;
}

export const DataOverlayContainer = ({ component, node }: DataOverlayContainerProps): ReactElement | null => {
  const sceneComposerId = useContext(sceneComposerIdContext);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSceneNodeRef = useStore(sceneComposerId)((state) => state.selectedSceneNodeRef);
  const setSelectedSceneNodeRef = useStore(sceneComposerId)((state) => state.setSelectedSceneNodeRef);
  const subType = component.subType;
  const isAnnotation = component.subType === Component.DataOverlaySubType.TextAnnotation;

  const componentVisible = useViewOptionState(sceneComposerId).componentVisibilities[subType];
  const initialVisibilitySkipped = useRef(false);

  // TODO: config.isPinned is not supported in milestone 1
  // const [visible, setVisible] = useState(component.config?.isPinned || componentVisible);
  const [visible, setVisible] = useState(componentVisible);

  // Toggle panel visibility on selection change
  useEffect(() => {
    if (selectedSceneNodeRef === node.ref) {
      setVisible(true);
    }
  }, [selectedSceneNodeRef, node.ref]);

  // Toggle visibility on view option change. Skip the first call to make sure the
  // isPinned config can keep panel open initially.
  useEffect(() => {
    if (initialVisibilitySkipped.current) {
      setVisible(componentVisible);
    }
    initialVisibilitySkipped.current = true;
  }, [componentVisible]);

  // Same behavior as other components to select node when clicked on the panel
  const [onPointerDown, onPointerUp] = useCallbackWhenNotPanning(
    (e) => {
      e.stopPropagation();
      if (selectedSceneNodeRef !== node.ref) {
        setSelectedSceneNodeRef(node.ref);
      }
    },
    [selectedSceneNodeRef, node.ref],
  );

  const onClickCloseButton = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  return visible ? (
    <>
      <div
        ref={containerRef}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
        style={{ ...tmContainer, ...(isAnnotation ? tmAnnotationContainer : tmPanelContainer) }}
      >
        {!isAnnotation && !componentVisible && (
          <div style={tmCloseButton}>
            <Button iconName='close' variant='icon' iconAlign='right' onClick={onClickCloseButton} />
          </div>
        )}
        <DataOverlayRows component={component} />
      </div>

      {subType == Component.DataOverlaySubType.OverlayPanel && (
        <div style={tmArrow}>
          <div style={{ ...tmContainer, ...tmArrowOuter }} />
          <div style={{ ...tmContainer, ...tmArrowOuter, ...tmArrowInner }} />
        </div>
      )}
    </>
  ) : null;
};
