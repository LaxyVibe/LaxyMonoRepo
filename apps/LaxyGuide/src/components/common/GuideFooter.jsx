import React from 'react';
import { CommonFooter } from '@laxy/components';  // ✅ Now this will work with Vite!

/**
 * LaxyGuide-specific Footer that uses static English text
 */
const GuideFooter = (props) => {
  // Static hardcoded English string for Guide
  const poweredByText = "Powered by {{value}}";

  // Guide-specific default styles
  const guideContainerStyle = {
    backgroundColor: '#f9f9f9',
    ...props.containerStyle
  };

  return (
    <CommonFooter 
      poweredByText={poweredByText}
      containerStyle={guideContainerStyle}
      {...props} 
    />
  );
};

export default GuideFooter;
