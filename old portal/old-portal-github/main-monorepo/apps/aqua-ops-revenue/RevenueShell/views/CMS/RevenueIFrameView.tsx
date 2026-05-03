import React from 'react';

const IFrameView = () => {
  const cmsUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/admin`
    : '/admin';

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={cmsUrl}
        style={{ border: 'none', width: '100%', height: '100%' }}
        title="Payload CMS"
      />
    </div>
  );
};

export default IFrameView;
