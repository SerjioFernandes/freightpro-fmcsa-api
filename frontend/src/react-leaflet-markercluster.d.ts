declare module '@changey/react-leaflet-markercluster' {
  import { FC } from 'react';
  
  interface MarkerClusterGroupProps {
    children?: React.ReactNode;
    chunkedLoading?: boolean;
    maxClusterRadius?: number;
    [key: string]: any;
  }
  
  const MarkerClusterGroup: FC<MarkerClusterGroupProps>;
  export default MarkerClusterGroup;
}

