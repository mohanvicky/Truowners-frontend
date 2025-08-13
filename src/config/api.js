// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    VALIDATE_OTP: '/auth/validate-otp',
    SEND_OTP: '/auth/send-otp',
    LOGIN_OTP: '/auth/login/otp',
    LOGIN_PASSWORD: '/auth/login/password',

    // Forgot password flow
    FORGOT_PASSWORD: '/auth/forgot-password',   // Send OTP for password reset
    RESET_PASSWORD: '/auth/reset-password',     // Verify OTP & set new password
    RESEND_OTP: '/auth/resend-otp'               // Optional: separate resend OTP route if available
  },
  
  // Owner endpoints
  OWNER: {
    PROPERTIES: '/owner/properties'
  },

  ADMIN: {
    USERS: '/admin/users',
    PROPERTIES: '/admin/properties',
    REVIEW_PROPERTY: '/admin/properties/:id/review',
    PUBLISH_PROPERTY: '/admin/properties/:id/publish',
    BOOKINGS: '/booking/all',                    
    BOOKING_ANALYTICS: '/booking/analytics',     
    UPDATE_BOOKING: '/booking/:id/status'        
  },

  // User endpoints
  USER: {
    PROPERTIES: '/user/properties',
    WISHLIST: '/user/wishlist',
    WISHLIST_REMOVE: '/user/wishlist',
    BOOKING_ADD: '/booking',
    BOOKING_UPDATE: '/booking/:id/update-time',
  }
}

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
