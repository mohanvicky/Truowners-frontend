import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Grid,
  IconButton,
  Tooltip,
  Paper,
  Divider
} from '@mui/material'
import {
  LocationOn,
  Bed,
  Bathtub,
  SquareFoot,
  CurrencyRupee,
  Lock,
  Home,
  Visibility,
  FavoriteOutlined,
  Favorite
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'


const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}))


const StyledCardMedia = styled(CardMedia)({
  height: 240,
  position: 'relative',
  backgroundColor: '#f5f5f5',
})


const PropertyTypeBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  backgroundColor: 'rgba(47, 128, 237, 0.9)',
  color: 'white',
  fontWeight: 600,
  zIndex: 1,
}))


const WishlistButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: '#d32f2f',
  zIndex: 1,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
}))


const ImagePlaceholder = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f0f0f0',
  color: '#666',
})


const SpecBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  minWidth: 'fit-content',
}))


const PriceBox = styled(Paper)(({ theme }) => ({
  padding: '12px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  marginTop: '8px',
}))


const PropertyCard = ({ 
  property, 
  isAuthenticated,
  onLoginRequired,
  onViewDetails,
  isInWishlist = false,
  onWishlistToggle
}) => {
  const navigate = useNavigate()


  const getLocationString = (location) => {
    try {
      if (typeof location === 'string' && location.trim()) {
        return location
      }
      if (location && typeof location === 'object') {
        if (location.address && typeof location.address === 'string') return location.address
        if (location.street && typeof location.street === 'string') return location.street
        if (location.city && location.state) return `${location.city}, ${location.state}`
        if (location.city) return location.city
        return 'Location not specified'
      }
      return 'Location not specified'
    } catch (error) {
      return 'Location not specified'
    }
  }


  const formatCurrency = (amount) => {
    const num = parseInt(amount) || 0
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)}Cr`
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(0)}K`
    }
    return `₹${num.toLocaleString()}`
  }


  const formatNumber = (value) => {
    const num = parseInt(value) || 0
    if (num === 0) {
      return 'N/A'
    }
    return num.toString()
  }


  const getSafeImages = (images) => {
    if (Array.isArray(images)) {
      const validImages = images.filter(img => img && typeof img === 'string' && img.trim())
      return validImages.filter(img => 
        !img.toLowerCase().includes('car') && 
        !img.toLowerCase().includes('vehicle') &&
        !img.toLowerCase().includes('auto')
      )
    }
    return []
  }


  const handleViewDetailsClick = (e) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', `/property/${property.id}`)
      onLoginRequired && onLoginRequired()
    } else {
      navigate(`/property/${property.id}`)
      onViewDetails && onViewDetails(property.id)
    }
  }


  const handleWishlistClick = (e) => {
    e.stopPropagation()
    onWishlistToggle && onWishlistToggle()
  }


  const handleCardClick = () => {
    handleViewDetailsClick({ stopPropagation: () => {} })
  }


  const safeImages = getSafeImages(property.images)
  const bedrooms = formatNumber(property.bedrooms)
  const bathrooms = formatNumber(property.bathrooms)
  const area = formatNumber(property.area)


  return (
    <StyledCard onClick={handleCardClick}>
      <Box sx={{ position: 'relative' }}>
        <PropertyTypeBadge 
          label={property.propertyType || 'Property'} 
          size="small"
        />
        
        {isAuthenticated && (
          <WishlistButton onClick={handleWishlistClick} size="small">
            {isInWishlist ? <Favorite /> : <FavoriteOutlined />}
          </WishlistButton>
        )}


        {safeImages.length > 0 ? (
          <StyledCardMedia
            component="img"
            image={safeImages[0]}
            alt={property.title || 'Property'}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : (
          <StyledCardMedia>
            <ImagePlaceholder>
              <Home sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2">No Image Available</Typography>
            </ImagePlaceholder>
          </StyledCardMedia>
        )}
      </Box>


      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Title and Location */}
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {property.title || 'Untitled Property'}
        </Typography>


        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ fontSize: 16, color: '#666', mr: 0.5 }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {getLocationString(property.location)}
          </Typography>
        </Box>


        {/* Property Specifications */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <SpecBox>
              <Bed sx={{ fontSize: 16, color: '#2F80ED' }} />
              <Typography variant="caption" fontWeight={600}>
                {bedrooms}
              </Typography>
            </SpecBox>
          </Grid>
          <Grid item xs={4}>
            <SpecBox>
              <Bathtub sx={{ fontSize: 16, color:'#2F80ED' }} />
              <Typography variant="caption" fontWeight={600}>
                {bathrooms}
              </Typography>
            </SpecBox>
          </Grid>
          <Grid item xs={4}>
            <SpecBox>
              <SquareFoot sx={{ fontSize: 16, color: '#2F80ED' }} />
              <Typography variant="caption" fontWeight={600}>
                {area}
              </Typography>
            </SpecBox>
          </Grid>
        </Grid>


        {/* Additional Property Details */}
        {property.furnished && (
          <Chip 
            label={property.furnished} 
            size="small" 
            variant="outlined" 
            sx={{ mr: 1, mb: 1 }}
          />
        )}
        
        {property.parking && (
          <Chip 
            label="Parking" 
            size="small" 
            variant="outlined" 
            sx={{ mr: 1, mb: 1 }}
          />
        )}


        {property.amenities && property.amenities.length > 0 && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            <strong>Amenities:</strong> {property.amenities.slice(0, 3).join(', ')}
            {property.amenities.length > 3 && ` +${property.amenities.length - 3} more`}
          </Typography>
        )}


        {/* Description preview */}
        {property.description && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            sx={{ 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {property.description}
          </Typography>
        )}


        {/* Pricing */}
        <PriceBox elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2F80ED' }}>
              {formatCurrency(property.rent)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              /month
            </Typography>
          </Box>
          
          {property.deposit && (
            <Typography variant="body2" color="text.secondary">
              Deposit: {formatCurrency(property.deposit)}
            </Typography>
          )}
        </PriceBox>
      </CardContent>


      <Divider />


      <CardActions sx={{ p: 2, pt: 1 }}>
        <Button
          fullWidth
          variant={isAuthenticated ? "contained" : "outlined"}
          color="primary"
          onClick={handleViewDetailsClick}
          startIcon={isAuthenticated ? <Visibility /> : <Lock />}
          sx={{ 
            py: 1,
            fontWeight: 600,
            borderRadius: '8px'
          }}
        >
          {isAuthenticated ? 'View Details' : 'Login to View Details'}
        </Button>
      </CardActions>
    </StyledCard>
  )
}


export default PropertyCard
