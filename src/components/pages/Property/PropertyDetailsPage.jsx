import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import './PropertyDetailsPage.css'

// MUI imports
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import EditIcon from '@mui/icons-material/Edit'
import PendingIcon from '@mui/icons-material/Pending'
import CancelIcon from '@mui/icons-material/Cancel'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import dayjs from 'dayjs'

const PropertyDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, token, loading: authLoading, validateSession } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Booking state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingBookingId, setEditingBookingId] = useState(null)

  // New booking info state
  const [bookingInfo, setBookingInfo] = useState({
    userHasBooking: false,
    bookedSlots: []
  })

  // Available time slots
  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM'
  ]

  useEffect(() => {
    // Wait for auth context to finish loading before fetching data
    if (!authLoading) {
      fetchPropertyDetails()
      if (isAuthenticated && user?.role === 'user') {
        checkWishlistStatus()
      }
    }
  }, [id, isAuthenticated, user?.role, authLoading])

  const fetchPropertyDetails = async () => {
    setLoading(true)
    setError('')

    try {
      // Validate session if user is authenticated
      if (isAuthenticated && !(await validateSession())) {
        setError('Session expired. Please login again.')
        return
      }

      const headers = {
        'Content-Type': 'application/json'
      }

      // Add auth header if user is authenticated and token exists
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(buildApiUrl(`${API_CONFIG.USER.PROPERTIES}/${id}`), {
        method: 'GET',
        headers
      })

      let data
      try {
        data = await response.json()
        validateApiResponse(data)
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - token might be expired
          setError('Authentication expired. Please login again.')
          // Don't auto-logout here as property might be viewable without auth
          return
        }
        if (response.status === 404) {
          throw new Error('Property not found')
        }
        throw new Error(data.error || handleApiError(null, response))
      }

      if (data.success) {
        setProperty(data.data.property)
        // Set booking info if available
        if (data.data.bookingInfo) {
          setBookingInfo(data.data.bookingInfo)
        }
      } else {
        throw new Error(getErrorMessage(data))
      }
    } catch (err) {
      console.error('Fetch property details error:', err)
      setError(err.message || 'Failed to load property details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !token || user?.role !== 'user') return
  
    try {
      // Validate session before making API call
      if (!(await validateSession())) {
        return
      }

      const response = await fetch(buildApiUrl(API_CONFIG.USER.WISHLIST), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.wishlist) {
          const wishlistPropertyIds = data.data.wishlist.properties.map(prop => prop.id) || []
          setIsInWishlist(wishlistPropertyIds.includes(id))
        }
      } else if (response.status === 401) {
        console.warn('Unauthorized access to wishlist')
        // Token might be expired, but don't force logout
      }
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', `/property/${id}`)
      navigate('/login')
      return
    }
  
    if (user?.role !== 'user') {
      alert('Only users can add properties to wishlist')
      return
    }

    // Validate session before making API call
    if (!(await validateSession())) {
      setError('Session expired. Please login again.')
      return
    }
  
    setWishlistLoading(true)
  
    try {
      let response
  
      if (isInWishlist) {
        // REMOVE from wishlist
        response = await fetch(buildApiUrl(`${API_CONFIG.USER.WISHLIST_REMOVE}`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            propertyId: id
          })
        })
      } else {
        // ADD to wishlist
        response = await fetch(buildApiUrl(API_CONFIG.USER.WISHLIST), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            propertyId: id
          })
        })
      }
  
      let data
      try {
        data = await response.json()
        validateApiResponse(data)
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }
  
      if (response.ok && data.success) {
        setIsInWishlist(!isInWishlist)
        
        const action = !isInWishlist ? 'added to' : 'removed from'
        console.log(`Property ${action} wishlist successfully`)
      } else {
        throw new Error(data.error || getErrorMessage(data))
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err)
      setError(err.message || 'Failed to update wishlist. Please try again.')
    } finally {
      setWishlistLoading(false)
    }
  }

  // Check if a specific date and time slot is booked by others (not current user)
  const isSlotBookedByOthers = (date, timeSlot) => {
    if (!bookingInfo.bookedSlots || bookingInfo.bookedSlots.length === 0) return false
    
    return bookingInfo.bookedSlots.some(slot => {
      const slotDate = dayjs(slot.date).format('YYYY-MM-DD')
      const selectedDateStr = date.format('YYYY-MM-DD')
      return slotDate === selectedDateStr && slot.timeSlot === timeSlot && !slot.bookedByCurrentUser
    })
  }

  // Check if current user has booked a specific slot
  const isSlotBookedByCurrentUser = (date, timeSlot) => {
    if (!bookingInfo.bookedSlots || bookingInfo.bookedSlots.length === 0) return false
    
    return bookingInfo.bookedSlots.some(slot => {
      const slotDate = dayjs(slot.date).format('YYYY-MM-DD')
      const selectedDateStr = date.format('YYYY-MM-DD')
      return slotDate === selectedDateStr && slot.timeSlot === timeSlot && slot.bookedByCurrentUser
    })
  }

  // Get current user's bookings for display
  const getCurrentUserBookings = () => {
    if (!bookingInfo.bookedSlots) return []
    
    return bookingInfo.bookedSlots.filter(slot => slot.bookedByCurrentUser)
  }

  // Get booking status icon and color
  const getBookingStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <PendingIcon />, 
          color: 'warning', 
          label: 'Pending Confirmation' 
        }
      case 'approved':
        return { 
          icon: <CheckCircleIcon />, 
          color: 'success', 
          label: 'Confirmed' 
        }
      case 'rejected':
        return { 
          icon: <CancelIcon />, 
          color: 'error', 
          label: 'Rejected' 
        }
      case 'completed':
        return { 
          icon: <TaskAltIcon />, 
          color: 'info', 
          label: 'Completed' 
        }
      default:
        return { 
          icon: <PendingIcon />, 
          color: 'default', 
          label: 'Unknown' 
        }
    }
  }

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return timeSlots
    
    return timeSlots.map(slot => ({
      value: slot,
      label: slot,
      isBookedByOthers: isSlotBookedByOthers(selectedDate, slot),
      isBookedByCurrentUser: isSlotBookedByCurrentUser(selectedDate, slot)
    }))
  }

  // Check if user can make a new booking (doesn't have existing booking)
  const canMakeNewBooking = () => {
    return !bookingInfo.userHasBooking || getCurrentUserBookings().length === 0
  }

  // Booking functionality
  const handleBookVisit = () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', `/property/${id}`)
      navigate('/login')
      return
    }

    if (user?.role !== 'user') {
      alert('Only users can book property visits')
      return
    }

    setBookingDialogOpen(true)
    setBookingError('')
    setBookingSuccess(false)
    setIsEditMode(false)
    setEditingBookingId(null)
  }

  // Edit booking functionality
  const handleEditBooking = (booking) => {
    setIsEditMode(true)
    setEditingBookingId(booking.id || booking._id) // Handle both id formats
    setSelectedDate(dayjs(booking.date))
    setSelectedTimeSlot(booking.timeSlot)
    setBookingDialogOpen(true)
    setBookingError('')
    setBookingSuccess(false)
  }

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      setBookingError('Please select both date and time slot')
      return
    }

    // Check if slot is already booked by others (exclude current user's booking in edit mode)
    if (!isEditMode && isSlotBookedByOthers(selectedDate, selectedTimeSlot)) {
      setBookingError('This time slot is already booked by someone else. Please select another slot.')
      return
    }

    // In edit mode, check if the new slot conflicts with other bookings
    if (isEditMode && isSlotBookedByOthers(selectedDate, selectedTimeSlot)) {
      setBookingError('This time slot is already booked by someone else. Please select another slot.')
      return
    }

    // Validate session before making API call
    if (!(await validateSession())) {
      setBookingError('Session expired. Please login again.')
      return
    }

    setBookingLoading(true)
    setBookingError('')

    try {
      let response
      
      if (isEditMode) {
        // Update existing booking
        response = await fetch(buildApiUrl(API_CONFIG.USER.BOOKING_UPDATE.replace(':id', editingBookingId)), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: selectedDate.format('YYYY-MM-DD'),
            timeSlot: selectedTimeSlot
          })
        })
      } else {
        // Create new booking
        response = await fetch(buildApiUrl(API_CONFIG.USER.BOOKING_ADD), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            property: id,
            date: selectedDate.format('YYYY-MM-DD'),
            timeSlot: selectedTimeSlot
          })
        })
      }

      let data
      try {
        data = await response.json()
        validateApiResponse(data)
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      if (response.ok && data.success) {
        setBookingSuccess(true)
        setSelectedDate(null)
        setSelectedTimeSlot('')
        
        // Show success message and close dialog
        setTimeout(() => {
          setBookingDialogOpen(false)
          setBookingSuccess(false)
          setIsEditMode(false)
          setEditingBookingId(null)
          fetchPropertyDetails() // Refresh to get updated booking info
        }, 3000) // Show success message for 3 seconds
      } else {
        throw new Error(data.error || getErrorMessage(data))
      }
    } catch (err) {
      console.error('Booking error:', err)
      setBookingError(err.message || `Failed to ${isEditMode ? 'update' : 'book'} visit. Please try again.`)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleBookingCancel = () => {
    setBookingDialogOpen(false)
    setSelectedDate(null)
    setSelectedTimeSlot('')
    setBookingError('')
    setBookingSuccess(false)
    setIsEditMode(false)
    setEditingBookingId(null)
  }

  // Handle return to home
  const handleReturnToHome = () => {
    navigate('/properties')
  }

  const getLocationString = (location) => {
    try {
      if (typeof location === 'string' && location.trim()) {
        return location
      }
      if (location && typeof location === 'object') {
        if (location.address && typeof location.address === 'string') return location.address
        if (location.street && typeof location.street === 'string') return location.street
        if (location.city && location.state) return `${location.city}, ${location.state}`
        return 'Location not specified'
      }
      return 'Location not specified'
    } catch (error) {
      return 'Location not specified'
    }
  }

  const formatCurrency = (amount) => {
    const num = parseInt(amount) || 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getSafeImages = (images) => {
    if (Array.isArray(images)) {
      return images.filter(img => img && typeof img === 'string' && img.trim())
    }
    return []
  }

  const getSafeAmenities = (amenities) => {
    if (Array.isArray(amenities)) {
      return amenities.filter(amenity => amenity && typeof amenity === 'string' && amenity.trim())
    }
    return []
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="property-details-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner large"></div>
            <p>Initializing...</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="property-details-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner large"></div>
            <p>Loading property details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="property-details-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Error Loading Property</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={handleReturnToHome}>
                Back to Home
              </button>
              <button className="btn btn-secondary" onClick={fetchPropertyDetails}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="property-details-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">🏠</div>
            <h2>Property Not Found</h2>
            <p>The property you're looking for doesn't exist or has been removed.</p>
            <button className="btn btn-primary" onClick={handleReturnToHome}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const safeImages = getSafeImages(property.images)
  const safeAmenities = getSafeAmenities(property.amenities)
  const currentUserBookings = getCurrentUserBookings()

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="property-details-page">
        <div className="container">
          {/* Navigation Buttons */}
          <div className="navigation-section">
            <div className="back-navigation">
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
            </div>
            
            <div className="home-navigation">
              <button className="home-btn" onClick={handleReturnToHome}>
                🏠 Return to Home
              </button>
            </div>
          </div>

          {/* Property Header */}
          <div className="property-header">
            <div className="property-title-section">
              <h1 className="property-title">{property.title || 'Untitled Property'}</h1>
              <p className="property-location">📍 {getLocationString(property.location)}</p>
              <div className="property-meta">
                <span className="property-type">{property.propertyType || 'Property'}</span>
                <span className="listed-date">Listed on {formatDate(property.createdAt)}</span>
              </div>
            </div>
            
            {/* WISHLIST BUTTON - Only show for users or non-authenticated */}
            <div className="property-actions">
              {(user?.role === 'user' || !isAuthenticated) && (
                <button 
                  className={`wishlist-btn large ${isInWishlist ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  title={
                    !isAuthenticated 
                      ? 'Login to add to wishlist' 
                      : isInWishlist 
                        ? 'Remove from wishlist' 
                        : 'Add to wishlist'
                  }
                >
                  {wishlistLoading ? (
                    <div className="loading-spinner small"></div>
                  ) : (
                    <>
                      <span className="wishlist-icon">
                        {isInWishlist ? '❤️' : '🤍'}
                      </span>
                      <span className="wishlist-text">
                        {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Current User's Bookings Display */}
          {isAuthenticated && bookingInfo.userHasBooking && currentUserBookings.length > 0 && (
            <div className="user-bookings-section">
              <Alert severity="info" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Your Scheduled Visit
                  </Typography>
                  {currentUserBookings.map((booking, index) => {
                    const statusConfig = getBookingStatusConfig(booking.status)
                    return (
                      <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<CalendarTodayIcon />}
                          label={`${dayjs(booking.date).format('MMM DD, YYYY')} at ${booking.timeSlot}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                        />
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditBooking(booking)}
                          variant="outlined"
                          color="primary"
                        >
                          Edit
                        </Button>
                      </Box>
                    )
                  })}
                </Box>
              </Alert>
            </div>
          )}

          {/* Image Gallery */}
          {safeImages.length > 0 && (
            <div className="image-gallery">
              <div className="main-image">
                <img 
                  src={safeImages[currentImageIndex]} 
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  onError={(e) => {
                    e.target.src = '/placeholder-property.jpg'
                  }}
                />
                
                {safeImages.length > 1 && (
                  <>
                    <button 
                      className="image-nav prev"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? safeImages.length - 1 : prev - 1
                      )}
                    >
                      ‹
                    </button>
                    <button 
                      className="image-nav next"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === safeImages.length - 1 ? 0 : prev + 1
                      )}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              
              {safeImages.length > 1 && (
                <div className="image-thumbnails">
                  {safeImages.map((image, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Property Content */}
          <div className="property-content">
            <div className="property-main">
              {/* Property Specs */}
              <div className="property-specs">
                <div className="spec-item">
                  <span className="spec-number">{property.bedrooms || 0}</span>
                  <span className="spec-label">Bedrooms</span>
                </div>
                <div className="spec-item">
                  <span className="spec-number">{property.bathrooms || 0}</span>
                  <span className="spec-label">Bathrooms</span>
                </div>
                <div className="spec-item">
                  <span className="spec-number">{property.area || 0}</span>
                  <span className="spec-label">sq ft</span>
                </div>
              </div>

              {/* Description */}
              <div className="description-section">
                <h3>Description</h3>
                <p>{property.description || 'No description provided'}</p>
              </div>

              {/* Amenities */}
              {safeAmenities.length > 0 && (
                <div className="amenities-section">
                  <h3>Amenities</h3>
                  <div className="amenities-grid">
                    {safeAmenities.map(amenity => (
                      <div key={amenity} className="amenity-item">
                        <span className="amenity-icon">✓</span>
                        <span className="amenity-name">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="property-sidebar">
              {/* Pricing Card */}
              <div className="pricing-card">
                <div className="rent-info">
                  <div className="rent-amount">
                    <span className="rent-price">{formatCurrency(property.rent)}</span>
                    <span className="rent-period">/month</span>
                  </div>
                  <div className="deposit-amount">
                    Security Deposit: {formatCurrency(property.deposit)}
                  </div>
                </div>
                
                {/* Add another wishlist button in sidebar for easier access */}
                {(user?.role === 'user' || !isAuthenticated) && (
                  <button 
                    className={`wishlist-sidebar-btn ${isInWishlist ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                  >
                    {wishlistLoading ? (
                      <>
                        <div className="loading-spinner small"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="wishlist-icon">
                          {isInWishlist ? '❤️' : '🤍'}
                        </span>
                        {isInWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
                      </>
                    )}
                  </button>
                )}
                
                {isAuthenticated ? (
                  <>
                    <button className="contact-btn">
                      📞 Contact Owner
                    </button>
                    
                    {/* Book a Visit Button - Only show if user can make new booking */}
                    {canMakeNewBooking() && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CalendarTodayIcon />}
                        onClick={handleBookVisit}
                        fullWidth
                        sx={{ 
                          mt: 1,
                          height: '48px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          textTransform: 'none'
                        }}
                      >
                        📅 Book a Visit
                      </Button>
                    )}
                  </>
                ) : (
                  <button className="login-btn" onClick={() => navigate('/login')}>
                    🔐 Login to Contact Owner
                  </button>
                )}
              </div>

              {/* Property Info */}
              <div className="property-info-card">
                <h3>Property Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Property ID:</span>
                    <span className="info-value">{property._id || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">{property.propertyType || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value status-available">🟢 Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Return to Home Section at the bottom */}
          <div className="return-section">
            <div className="return-content">
              <h3>Explore More Properties</h3>
              <p>Find more amazing properties that match your preferences</p>
              <button className="return-home-btn" onClick={handleReturnToHome}>
                🏠 Browse All Properties
              </button>
            </div>
          </div>
        </div>

        {/* Booking Dialog */}
        <Dialog 
          open={bookingDialogOpen} 
          onClose={handleBookingCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              {isEditMode ? <EditIcon color="primary" /> : <CalendarTodayIcon color="primary" />}
              <Typography variant="h6">
                {isEditMode ? 'Edit Your Visit' : 'Book a Visit'}
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            {bookingSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {isEditMode ? 'Visit Updated Successfully!' : 'Visit Booked Successfully!'}
                </Typography>
                <Typography variant="body2">
                  Our team will confirm your booking shortly. You will receive a notification once confirmed.
                </Typography>
              </Alert>
            ) : (
              <>
                {bookingError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {bookingError}
                  </Alert>
                )}
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {isEditMode 
                    ? 'Update your preferred date and time for the property visit.'
                    : 'Select your preferred date and time to visit this property.'
                  }
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newValue) => {
                      setSelectedDate(newValue)
                      if (!isEditMode) {
                        setSelectedTimeSlot('') // Reset time slot when date changes (not in edit mode)
                      }
                    }}
                    minDate={dayjs()}
                    maxDate={dayjs().add(30, 'day')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined"
                      }
                    }}
                  />
                </Box>

                <TextField
                  select
                  label="Select Time Slot"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  fullWidth
                  variant="outlined"
                  disabled={!selectedDate}
                  helperText={!selectedDate ? "Please select a date first" : ""}
                >
                  {getAvailableTimeSlots().map((slot) => (
                    <MenuItem 
                      key={slot.value} 
                      value={slot.value}
                      disabled={slot.isBookedByOthers}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Typography>{slot.label}</Typography>
                        {slot.isBookedByCurrentUser ? (
                          <Chip 
                            icon={<CheckCircleIcon />}
                            label="Your current booking" 
                            color="info" 
                            size="small" 
                          />
                        ) : slot.isBookedByOthers ? (
                          <Chip 
                            icon={<BlockIcon />}
                            label="Booked" 
                            color="error" 
                            size="small" 
                          />
                        ) : null}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
          </DialogContent>
          
          {!bookingSuccess && (
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={handleBookingCancel}
                color="inherit"
                disabled={bookingLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBookingSubmit}
                variant="contained"
                color="primary"
                disabled={bookingLoading || !selectedDate || !selectedTimeSlot}
                startIcon={bookingLoading ? <CircularProgress size={20} /> : null}
              >
                {bookingLoading ? (isEditMode ? 'Updating...' : 'Booking...') : (isEditMode ? 'Update Visit' : 'Book Visit')}
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </div>
    </LocalizationProvider>
  )
}

export default PropertyDetailsPage
