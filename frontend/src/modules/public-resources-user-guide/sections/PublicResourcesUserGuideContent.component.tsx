import { Box, Skeleton } from '@mui/material'
import React, { useState } from 'react'

const PublicResourcesUserGuideContent: React.FC = () => {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <Box display="flex" flexDirection="column" maxHeight="70%" minHeight="0" position="relative">
        {loading && (
          <>
            <Skeleton animation="pulse" variant="rectangular" height="50vh" width="100%" sx={{ top: 0, left: 0, zIndex: 1 }} />
            <Skeleton animation="pulse" height="10vh" variant="text" />
          </>
        )}
        <video
          width="100%"
          height="auto"
          controls
          autoPlay
          onCanPlay={() => setLoading(false)}
          style={{
            border: 0,
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <source src="https://pro-reeve-videos.s3.eu-west-1.amazonaws.com/reeve_user_guide.mp4" type="video/mp4" />
          Your browser does not support the format of this video file, please try different browser.
        </video>
      </Box>
    </>
  )
}

export default PublicResourcesUserGuideContent
