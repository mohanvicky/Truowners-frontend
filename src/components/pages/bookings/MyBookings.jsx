// src/components/Bookings/MyBookings.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { buildApiUrl } from '../../../config/api'
import {
  handleApiError,
  validateApiResponse
} from '../../../utils/errorHandler'

// ────── MUI ──────────────────────────────────────────────────────────
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Grid,
    Stack,
    Divider
  } from '@mui/material'
  import EventIcon from '@mui/icons-material/Event'
  import ScheduleIcon from '@mui/icons-material/Schedule'
  import PlaceIcon from '@mui/icons-material/Place'
  import CheckCircleIcon from '@mui/icons-material/CheckCircle'
  import HourglassTopIcon from '@mui/icons-material/HourglassTop'
  import CancelIcon from '@mui/icons-material/Cancel'
  
  const STATUS_COLORS = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
    cancelled: 'error'
  }
  
  const MyBookings = () => {
    const navigate   = useNavigate()
    const { token, isAuthenticated, user } = useAuth()
  
    const [bookings, setBookings]             = useState([])
    const [totals, setTotals]                 = useState({ total: 0, byStatus: {} })
    const [loading, setLoading]               = useState(true)
    const [error,   setError]                 = useState(null)
  
    // ───── fetch ───────────────────────────────────────────────────────
    const fetchBookings = async () => {
      if (!isAuthenticated || user?.role !== 'user') {
        setLoading(false)
        return
      }
  
      try {
        const res = await fetch(buildApiUrl('/booking'), {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        })
  
        if (!res.ok) throw new Error(handleApiError(null, res))
  
        const data = await res.json()
        validateApiResponse(data)
  
        const { bookings = [], totalBookings = 0 } = data.data ?? {}
        const byStatus = bookings.reduce((acc, b) => {
          acc[b.status] = (acc[b.status] || 0) + 1
          return acc
        }, {})
  
        setBookings(bookings)
        setTotals({ total: totalBookings, byStatus })
      } catch (err) {
        setError(err.message || handleApiError(err))
      } finally {
        setLoading(false)
      }
    }
  
    useEffect(() => { fetchBookings() }, [isAuthenticated, token]) // eslint-disable-line
  
    // ───── helpers ─────────────────────────────────────────────────────
    const bookingsByDate = useMemo(() => {
      return bookings.reduce((map, b) => {
        const dateKey = new Date(b.date).toDateString() // e.g. "Fri Aug 15 2025"
        map[dateKey] = map[dateKey] ? [...map[dateKey], b] : [b]
        return map
      }, {})
    }, [bookings])
  
    const renderStatusChip = (status) => (
      <Chip
        icon={
          status === 'approved'
            ? <CheckCircleIcon />
            : status === 'pending'
            ? <HourglassTopIcon />
            : <CancelIcon />
        }
        label={status}
        size="small"
        color={STATUS_COLORS[status] || 'default'}
        sx={{ textTransform: 'capitalize' }}
      />
    )
  
    // ───── UI states ───────────────────────────────────────────────────
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      )
    }
  
    if (error) {
      return (
        <Box sx={{ maxWidth: 480, mx: 'auto', mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )
    }
  
    if (bookings.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6">No bookings found.</Typography>
        </Box>
      )
    }
  
    // ───── render ──────────────────────────────────────────────────────
    return (
      <Box sx={{ p: { xs: 2, sm: 4 } }}>
        {/* ── page title ───────────────────────────────────────────── */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          My Bookings
        </Typography>
  
        {/* ── summary bar ──────────────────────────────────────────── */}
        <Stack
          direction="row"
          spacing={1}
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ mb: 3, flexWrap: 'wrap' }}
        >
          <Chip
            label={`Total: ${totals.total}`}
            color="primary"
            sx={{ fontWeight: 500 }}
          />
          {Object.entries(totals.byStatus).map(([status, count]) => (
            <Chip
              key={status}
              label={`${status}: ${count}`}
              color={STATUS_COLORS[status] ?? 'default'}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Stack>
  
        {/* ── bookings grouped by date ─────────────────────────────── */}
        {Object.entries(bookingsByDate).map(([dateKey, list]) => (
          <Box key={dateKey} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              {dateKey}
            </Typography>
  
            <Grid container spacing={2}>
              {list.map((b) => {
                const { _id, property, timeSlot, status, date } = b
                const loc = property.location
                return (
                  <Grid item xs={12} md={6} lg={4} key={_id}>
                    <Card
                      sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                      onClick={() => navigate(`/property/${property._id}`)}
                    >
                      <CardContent>
                        {/* title */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {property.title}
                        </Typography>
  
                        {/* address */}
                        {loc?.address && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <PlaceIcon sx={{ fontSize: 18, mr: 0.5 }} />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {loc.address}{loc.city ? `, ${loc.city}` : ''}
                            </Typography>
                          </Box>
                        )}
  
                        {/* date + time */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            icon={<EventIcon />}
                            label={new Date(date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            size="small"
                          />
                          <Chip
                            icon={<ScheduleIcon />}
                            label={timeSlot}
                            size="small"
                          />
                        </Box>
  
                        {/* status */}
                        <Box sx={{ mt: 1.5 }}>{renderStatusChip(status)}</Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        ))}
      </Box>
    )
  }
  
  export default MyBookings