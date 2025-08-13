import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { buildApiUrl, API_CONFIG } from '../../../config/api'
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler'
import PropertyCard from './PropertyCard'
import AuthPromptModal from './AuthPromptModal'
import Login from '../Auth/Login'
import Register from '../Auth/SignUp'
import PropertyDetailsModal from './PropertyDetailsModal'
import './HomePage.css'
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { FaArrowRight } from "react-icons/fa";
import {
  Box,
  TextField,
  MenuItem,
  Slider,
  Button,
  Grid,
  Typography
} from "@mui/material";
import { useNavigate } from 'react-router-dom'
import PropertyFilter from './PropertyFilter'

const areas = [
  { title: "Jayanagar", img: "/src/assets/images/OIP.jpeg" },
  { title: "Indiranagar", img: "/src/assets/images/OIP.webp" },
  { title: "Whitefield", img: "/src/assets/images/OIP(1).jpeg" },
  { title: "HSR Layout", img: "/src/assets/images/OIP(1).webp" },
];

const testimonials = [
  {
    name: 'Rahul Mehta',
    role: 'Tenant, Bengaluru',
    text: 'Found my dream apartment within a week! The process was smooth and hassle-free.',
    image: 'https://randomuser.me/api/portraits/men/10.jpg',
  },
  {
    name: 'Sneha Reddy',
    role: 'Landlord, Hyderabad',
    text: 'Listed my flat and got genuine tenants quickly. Great platform for owners!',
    image: 'https://randomuser.me/api/portraits/women/10.jpg',
  },
  {
    name: 'Vikram Sharma',
    role: 'Tenant, Pune',
    text: 'Clear listings, verified properties, and no hidden charges. Highly recommend!',
    image: 'https://randomuser.me/api/portraits/men/11.jpg',
  },
  {
    name: 'Ananya Iyer',
    role: 'Tenant, Chennai',
    text: 'Saved me so much time! I could shortlist and visit only the best options.',
    image: 'https://randomuser.me/api/portraits/women/11.jpg',
  },
  {
    name: 'Amitabh Singh',
    role: 'Landlord, Delhi',
    text: 'The tenant verification feature gave me peace of mind. Very professional service.',
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
];

const destinations = [
  { name: 'New Cairo', image: '/src/assets/images/homebanner.jpg' },
  { name: 'El Sheikh Zayed', image: '/src/assets/images/homebanner.jpg' },
  { name: '6th of October', image: '/src/assets/images/homebanner.jpg' },
  { name: 'El Gouna', image: '/src/assets/images/homebanner.jpg' },
  { name: 'North Coast', image: '/src/assets/images/homebanner.jpg' },
  { name: 'Ras El Hekma', image: '/src/assets/images/homebanner.jpg' },
];

const HomePage = () => {
  const [showAll, setShowAll] = useState(false);
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showPropertyDetails, setShowPropertyDetails] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const { user, isAuthenticated, token } = useAuth()
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    propertyType: "",
    city: "",
    bedrooms: "",
    searchTerm: "",
    rentRange: [0, 50000],
    depositRange: [0, 100000],
  });

  useEffect(() => {
    fetchProperties()
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, filters])

  useEffect(() => {
    if (isAuthenticated) {
      const propertyToView = localStorage.getItem('propertyToView')
      if (propertyToView) {
        localStorage.removeItem('propertyToView')
        window.open(`/property/${propertyToView}`, '_blank')
      }
    }
  }, [isAuthenticated, properties])

  useEffect(() => {
    applyFilters()
  }, [properties, searchTerm, sortBy])

  const fetchProperties = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = {
        "Content-Type": "application/json"
      };

      if (isAuthenticated && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();

      if (filters.propertyType) params.append("propertyType", filters.propertyType);
      if (filters.city) params.append("city", filters.city);
      if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
      if (filters.searchTerm) params.append("search", filters.searchTerm);
      if (filters.rentRange[0] > 0) params.append("minRent", filters.rentRange[0]);
      if (filters.rentRange[1] < 50000) params.append("maxRent", filters.rentRange[1]);
      if (filters.depositRange[0] > 0) params.append("minDeposit", filters.depositRange[0]);
      if (filters.depositRange[1] < 100000) params.append("maxDeposit", filters.depositRange[1]);

      const response = await fetch(
        `${buildApiUrl(API_CONFIG.USER.PROPERTIES)}?${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      let data;
      try {
        data = await response.json();
        validateApiResponse(data);
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || handleApiError(null, response));
      }

      if (data.success) {
        setProperties(data.data.properties || []);
      } else {
        throw new Error(getErrorMessage(data));
      }
    } catch (err) {
      console.error("Fetch properties error:", err);
      setError(err.message || "Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!isAuthenticated || !token) return

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.USER.WISHLIST), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const ids = (data.data.wishlist || []).map(item => item.id)
          setWishlist(ids)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err)
    }
  }

  const handleWishlistToggle = async (propertyId) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    try {
      const isInWishlist = wishlist.includes(propertyId)
      const method = isInWishlist ? 'DELETE' : 'POST'

      const response = await fetch(buildApiUrl(`${API_CONFIG.USER.WISHLIST}/${propertyId}`), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          if (isInWishlist) {
            setWishlist(prev => prev.filter(id => id !== propertyId))
          } else {
            setWishlist(prev => [...prev, propertyId])
          }
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err)
    }
  }

  const handlePropertyClick = (property) => {
    setSelectedProperty(property)
    setShowPropertyDetails(true)
  }

  const handleLoginRequired = () => {
    setShowLogin(true)
  }

  const handleAuthSuccess = () => {
    setShowLogin(false)
    setShowRegister(false)
    setShowAuthPrompt(false)
  }

  const handleSwitchToRegister = () => {
    setShowLogin(false)
    setShowRegister(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegister(false)
    setShowLogin(true)
  }

  const applyFilters = () => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = properties.filter(property => {
        const titleMatch = property.title?.toLowerCase().includes(searchLower);
        const descMatch = property.description?.toLowerCase().includes(searchLower);
        const locationMatch = getLocationString(property.location).toLowerCase().includes(searchLower);
        return titleMatch || descMatch || locationMatch;
      });
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  };

  const getLocationString = (location) => {
    if (typeof location === 'string') return location
    if (location && typeof location === 'object') {
      if (location.address) return location.address
      if (location.street) return location.street
      if (location.city && location.state) return `${location.city}, ${location.state}`
      return 'Location not specified'
    }
    return 'Location not specified'
  }

  const handleCloseModals = () => {
    setShowAuthPrompt(false)
    setShowLogin(false)
    setShowRegister(false)
    setShowPropertyDetails(false)
    setSelectedProperty(null)
  }

  if (loading) {
    return (
      <div className="homepage">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner large"></div>
            <p>Loading properties...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="homepage">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Find Your Perfect Rental Home</h1>
              <div>
                <h1 className="main-heading">
                  <span className="highlight">No</span> Brokers |{" "}
                  <span className="highlight">No</span> Commissions
                </h1>
              </div>
              <div className="hero-bottom-content">
                <p className="hero-subtitle">
                  Discover amazing properties from verified owners across the city
                </p>
                {!isAuthenticated && (
                  <div className="hero-auth-prompt">
                    <p>Sign up to save your favorite properties and get personalized recommendations!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div className="search-filter-container">
            <PropertyFilter 
              initialFilters={{
                propertyType: "",
                city: "",
                bedrooms: "",
                search: "",
                budgetRange: [0, 100000],
                rentRange: [0, 50000],
              }}
              currentFilters={{
                propertyType: filters.propertyType,
                city: filters.city,
                bedrooms: filters.bedrooms,
                search: filters.searchTerm,
                budgetRange: filters.depositRange,
                rentRange: filters.rentRange
              }}
              onSearch={(queryString, updatedFilters) => {
                setFilters({
                  ...filters,
                  propertyType: updatedFilters.propertyType,
                  city: updatedFilters.city,
                  bedrooms: updatedFilters.bedrooms,
                  searchTerm: updatedFilters.search,
                  rentRange: updatedFilters.rentRange,
                  depositRange: updatedFilters.budgetRange,
                });
              }}
            />
          </div>

          {/* Properties Grid */}
          <div className="properties-section">
            <div className="properties-header">
              <h2>Featured Properties</h2>
              <p>Browse through our verified listings</p>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="empty-properties">
                <div className="empty-icon">🏠</div>
                <h3>No properties match your criteria</h3>
                <p>Try adjusting your filters or search terms to see more results.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setFilters({
                      propertyType: "",
                      city: "",
                      bedrooms: "",
                      searchTerm: "",
                      rentRange: [0, 50000],
                      depositRange: [0, 100000],
                    })
                    setSearchTerm('')
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="properties-grid">
                {filteredProperties.slice(0, 6).map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isInWishlist={wishlist.includes(property.id)}
                    onWishlistToggle={() => handleWishlistToggle(property.id)}
                    onClick={() => handlePropertyClick(property)}
                    onLoginRequired={handleLoginRequired}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            )}
            <div className="home-showMore">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => navigate(`/properties?${new URLSearchParams(filters).toString()}`)}
                sx={{
                  mt: 3,
                  fontWeight: 600,
                  borderRadius: "8px",
                  maxWidth: "10rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                SHOW MORE
              </Button>
            </div>
          </div>

          {/* Residential Grid Section */}
          <section className="residential-grid">
            {/* Column 1 */}
            <div className="col1">
              <div className="text-block">
                <h2>Residential</h2>
                <p>
                  Find your dream home with Tru Owners. Explore a wide range of
                  verified residential listings including apartments, villas, plots,
                  and independent houses.
                </p>
                <div className="divider"></div>
              </div>
              <div className="image-card-bot">
                <img src="/src/assets/images/OIP(2).jpeg" alt="Apartment" />
                <div className="overlay">
                  <h3>Apartment</h3>
                  <span>MORE DETAILS</span>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="col2">
              <div className="image-card tall">
                <img src="/src/assets/images/homebanner.jpg" alt="Studio" />
                <div className="overlay">
                  <h3>Studio</h3>
                  <span>MORE DETAILS</span>
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="col3">
              <div className="image-card">
                <img src="/src/assets/images/OIP(3).webp" alt="Single Family Room" />
                <div className="overlay">
                  <h3>Single Family Room</h3>
                  <span>MORE DETAILS</span>
                </div>
              </div>
              <div className="image-card1">
                <img src="/src/assets/images/homebanner.jpg" alt="Villa" />
                <div className="overlay">
                  <h3>Villa</h3>
                  <span>MORE DETAILS</span>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="homepage-error">
              <span>⚠️</span>
              {error}
              <button className="btn btn-link" onClick={fetchProperties}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About CTA Section */}
      <section className="about-cta">
        <div className="three-column-layout">
          {/* Column 1 */}
          <div className="column">
            <div className="section12">
              <h2>01.</h2>
              <h3>Verified Listings With Accurate Details</h3>
              <p>
                Every property listed on our platform is thoroughly verified for authenticity,
                location accuracy, and pricing — so you can rent or buy with complete confidence.
              </p>
            </div>
            <div className="section12">
              <h2>02.</h2>
              <h3>User-Friendly Experience</h3>
              <p>
                From advanced filters to 360° virtual tours, our platform makes it easy to explore,
                compare, and schedule viewings — all in just a few clicks.
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="column">
            <div className="section12">
              <h2>03.</h2>
              <h3>Local Expertise & Support</h3>
              <p>
                Backed by a team that knows the area inside out, we help you find the perfect home faster
                with personalized recommendations and support.
              </p>
            </div>
            <div className="section12">
              <h2>04.</h2>
              <h3>Trusted by Thousands</h3>
              <p>
                Our platform has served thousands of satisfied clients who have successfully found their
                dream homes through us.
              </p>
            </div>
          </div>

          {/* Column 3 (Form) */}
          <div className="column form-column">
            <form>
              <label className='title-color'>Get In Touch</label>
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email Address" />
              <input type="number" placeholder="Phone Number" />
              <input type="text" placeholder="Location" />
              <textarea placeholder="Write your message here..." rows="4"></textarea>
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          </div>
        </div>
      </section>

      {/* Explore Areas Section */}
      <div className="explore-container1">
        {/* First section - Text */}
        <div className="explore-text1">
          <h2>Explore Areas From Bangalore</h2>
          <p>
            Discover the most sought-after neighborhoods of Bangalore — each
            offering a unique blend of lifestyle, connectivity, and convenience.
          </p>
        </div>

        {/* Other sections - Images */}
        {areas.slice(0, 3).map((area, idx) => (
          <div className="image-card2" key={idx}>
            <img src={area.img} alt={area.title} />
            <div className="overlay1">
              <h3>{area.title}</h3>
              <span>MORE DETAILS</span>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial Section */}
      <div className="testimonial-slider-container" style={{ maxWidth: '1200px' }}>
        <h2 className="slider-title" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem', color: '#2F80ED' }}>
          What Our Clients Say
        </h2>
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          style={{ padding: '20px' }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index} style={{ height: 'auto' }}>
              <div style={{
                background: ' #f5f4f4ff',
                borderRadius: '10px',
                padding: '30px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                height: '250px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1 }}>
                  "{testimonial.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '15px'
                    }}
                  />
                  <div>
                    <h4 style={{ margin: '0', fontSize: '1.1rem', color: ' #D0021B' }}>{testimonial.name}</h4>
                    <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#2F80ED' }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Modals */}
      {showAuthPrompt && (
        <AuthPromptModal onClose={handleCloseModals} />
      )}

      {showLogin && (
        <Login
          onClose={handleCloseModals}
          onSwitchToSignUp={handleSwitchToRegister}
        />
      )}

      {showRegister && (
        <Register
          onClose={handleCloseModals}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {showPropertyDetails && selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={handleCloseModals}
          isInWishlist={wishlist.includes(selectedProperty.id)}
          onWishlistToggle={() => handleWishlistToggle(selectedProperty.id)}
          isAuthenticated={isAuthenticated}
          onAuthPrompt={() => setShowAuthPrompt(true)}
        />
      )}
    </>
  )
}

export default HomePage