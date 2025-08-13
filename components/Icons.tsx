import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const UserIcon: React.FC<IconProps> = ({ 
  width = 20, 
  height = 20, 
  color = "#9CA3AF" 
}) => (
  <Svg width={width} height={height} viewBox="0 0 14 16" fill="none">
    <Path
      d="M7 8C8.06087 8 9.07828 7.57857 9.82843 6.82843C10.5786 6.07828 11 5.06087 11 4C11 2.93913 10.5786 1.92172 9.82843 1.17157C9.07828 0.421427 8.06087 0 7 0C5.93913 0 4.92172 0.421427 4.17157 1.17157C3.42143 1.92172 3 2.93913 3 4C3 5.06087 3.42143 6.07828 4.17157 6.82843C4.92172 7.57857 5.93913 8 7 8ZM5.57188 9.5C2.49375 9.5 0 11.9937 0 15.0719C0 15.5844 0.415625 16 0.928125 16H13.0719C13.5844 16 14 15.5844 14 15.0719C14 11.9937 11.5063 9.5 8.42813 9.5H5.57188Z"
      fill={color}
    />
  </Svg>
);

export const MailIcon: React.FC<IconProps> = ({ 
  width = 20, 
  height = 20, 
  color = "#9CA3AF" 
}) => (
  <Svg width={width} height={height} viewBox="0 0 16 12" fill="none">
    <Path
      d="M1.6 0H14.4C15.28 0 16 0.72 16 1.6V10.4C16 11.28 15.28 12 14.4 12H1.6C0.72 12 0 11.28 0 10.4V1.6C0 0.72 0.72 0 1.6 0ZM1.6 1.6V2.72L8 6.8L14.4 2.72V1.6H1.6ZM14.4 4.32L8 8.4L1.6 4.32V10.4H14.4V4.32Z"
      fill={color}
    />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ 
  width = 20, 
  height = 20, 
  color = "#9CA3AF" 
}) => (
  <Svg width={width} height={height} viewBox="0 0 12 16" fill="none">
    <Path
      d="M10 6V4C10 1.79086 8.20914 0 6 0C3.79086 0 2 1.79086 2 4V6C0.895431 6 0 6.89543 0 8V14C0 15.1046 0.895431 16 2 16H10C11.1046 16 12 15.1046 12 14V8C12 6.89543 11.1046 6 10 6ZM3.5 4C3.5 2.61929 4.61929 1.5 6 1.5C7.38071 1.5 8.5 2.61929 8.5 4V6H3.5V4Z"
      fill={color}
    />
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({ 
  width = 20, 
  height = 20, 
  color = "#9CA3AF" 
}) => (
  <Svg width={width} height={height} viewBox="0 0 20 14" fill="none">
    <Path
      d="M10 0C5.45455 0 1.59091 2.73 0 7C1.59091 11.27 5.45455 14 10 14C14.5455 14 18.4091 11.27 20 7C18.4091 2.73 14.5455 0 10 0ZM10 11.6667C7.42727 11.6667 5.33333 9.57273 5.33333 7C5.33333 4.42727 7.42727 2.33333 10 2.33333C12.5727 2.33333 14.6667 4.42727 14.6667 7C14.6667 9.57273 12.5727 11.6667 10 11.6667ZM10 4.2C8.46364 4.2 7.2 5.46364 7.2 7C7.2 8.53636 8.46364 9.8 10 9.8C11.5364 9.8 12.8 8.53636 12.8 7C12.8 5.46364 11.5364 4.2 10 4.2Z"
      fill={color}
    />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({ 
  width = 16, 
  height = 16, 
  color = "#FFFFFF" 
}) => (
  <Svg width={width} height={height} viewBox="0 0 16 12" fill="none">
    <Path
      d="M14.4 2H11.6L10.4 0.8C10.16 0.32 9.6 0 9 0H7C6.4 0 5.84 0.32 5.6 0.8L4.4 2H1.6C0.72 2 0 2.72 0 3.6V10.4C0 11.28 0.72 12 1.6 12H14.4C15.28 12 16 11.28 16 10.4V3.6C16 2.72 15.28 2 14.4 2ZM8 9.5C6.07 9.5 4.5 7.93 4.5 6C4.5 4.07 6.07 2.5 8 2.5C9.93 2.5 11.5 4.07 11.5 6C11.5 7.93 9.93 9.5 8 9.5Z"
      fill={color}
    />
  </Svg>
);