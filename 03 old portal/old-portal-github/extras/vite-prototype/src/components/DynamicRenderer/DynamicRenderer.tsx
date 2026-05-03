import type { FC } from 'react';
import { componentMap, ComponentName } from '../componentMap';

export interface ComponentConfig {
  component: ComponentName;
  props: Record<string, any>;
}

interface DynamicRendererProps {
  config: ComponentConfig[];
}

export const DynamicRenderer: FC<DynamicRendererProps> = ({ config }) => {
  return (
    <>
      {config.map((item, index) => {
        const Component = componentMap[item.component];
        if (!Component) {
          console.warn(`DynamicRenderer: "${item.component}" not found in componentMap.`);
          return null;
        }
        return <Component key={index} {...item.props} />;
      })}
    </>
  );
};
