// PropertiesTab.jsx  —  Enhanced (matches new dashboard styling)
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  FormGroup,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility,
  FilterList,
  ExpandMore,
  Clear,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { buildApiUrl, API_CONFIG } from '../../../config/api';

const PropertiesTab = () => {
  const theme = useTheme();

  /* ---------------- state ---------------- */
  const [properties, setProperties] = useState([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    propertyType: 'all',
    bedrooms: 'all',
    amenities: [],
    city: 'all'
  });
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    amenities: [],
    propertyTypes: []
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRPP] = useState(10);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [reviewLoading,  setReviewLoading]  = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  /* -------------- fetch ------------------ */
  const fetchProperties = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('adminToken');

      const res  = await fetch(buildApiUrl(API_CONFIG.ADMIN.PROPERTIES), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!json.success) throw new Error();

      setProperties(json.data.properties || []);
      /* generate select options */
      const cities = [...new Set(json.data.properties.map(p => p.location?.city).filter(Boolean))];
      const amenities = [...new Set(json.data.properties.flatMap(p => p.amenities || []))];
      const types = [...new Set(json.data.properties.map(p => p.propertyType).filter(Boolean))];
      setFilterOptions({ cities: cities.sort(), amenities: amenities.sort(), propertyTypes: types.sort() });

      setError(null);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { fetchProperties(); }, []);

  /* -------------- helpers --------------- */
  const handleFilter = (key, val) =>
    setFilters(prev => ({ ...prev, [key]: val }));

  const toggleAmenity = (amenity, checked) =>
    setFilters(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));

  const resetFilters = () =>
    setFilters({ status:'all', propertyType:'all', bedrooms:'all', amenities:[], city:'all' });

  const statusColor = s =>
    ({ pending:'warning', approved:'success', published:'info', rejected:'error' }[s] || 'default');

  /* ------------- derived --------------- */
  const filtered = useMemo(() => {
    let list = [...properties];

    /* search */
    if (query)
      list = list.filter(p =>
        [p.title, p.location?.address, p.location?.city]
          .filter(Boolean)
          .some(v => v.toLowerCase().includes(query.toLowerCase()))
      );

    /* filters */
    if (filters.status !== 'all')         list = list.filter(p => p.status === filters.status);
    if (filters.propertyType !== 'all')   list = list.filter(p => p.propertyType === filters.propertyType);
    if (filters.bedrooms !== 'all')       list = list.filter(p => p.bedrooms === +filters.bedrooms);
    if (filters.city !== 'all')           list = list.filter(p => p.location?.city === filters.city);
    if (filters.amenities.length)
      list = list.filter(p => filters.amenities.every(a => p.amenities?.includes(a)));

    return list;
  }, [properties, query, filters]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const activeFilterCount = Object.values(filters).filter(v => (Array.isArray(v)?v.length:v!=='all')).length;

  /* --------------- review / publish ------------- */
  const callReview = async (id, status) => {
    const token = localStorage.getItem('adminToken');
    try {
      setReviewLoading(true);
      await fetch(buildApiUrl(API_CONFIG.ADMIN.REVIEW_PROPERTY.replace(':id', id)), {
        method:'PATCH',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      await fetchProperties();
    } finally { setReviewLoading(false); }
  };
  const callPublish = async id => {
    const token = localStorage.getItem('adminToken');
    try {
      setPublishLoading(true);
      await fetch(buildApiUrl(API_CONFIG.ADMIN.PUBLISH_PROPERTY.replace(':id', id)),{
        method:'PATCH',
        headers:{ Authorization:`Bearer ${token}` }
      });
      await fetchProperties();
      setDialogOpen(false); setSelected(null);
    } finally { setPublishLoading(false); }
  };

  /* --------------- render ---------------- */
  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress size={32} />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {/* header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight:700 }}>
          Properties Management&nbsp;
        </Typography>

        <Tooltip title="Refresh">
          <IconButton
            onClick={fetchProperties}
            disabled={refreshing}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <RefreshIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* search */}
      <TextField
        fullWidth
        placeholder="Search by title, address or city…"
        value={query}
        onChange={e => { setQuery(e.target.value); setPage(0); }}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          )
        }}
      />

      {/* filters */}
      <Paper
        elevation={0}
        sx={{ mb:3, border:`1px solid ${alpha(theme.palette.divider,0.12)}`, borderRadius:2 }}
      >
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterList />
              <Typography variant="subtitle1" fontWeight={600}>
                Filters {activeFilterCount ? `(${activeFilterCount})` : ''}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Grid container spacing={3}>
              {/* status */}
              <Grid item xs={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={e => handleFilter('status', e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {['pending','approved','published','rejected'].map(s=>(
                      <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* type */}
              <Grid item xs={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.propertyType}
                    label="Type"
                    onChange={e => handleFilter('propertyType', e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {filterOptions.propertyTypes.map(t=>(
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* bedrooms */}
              <Grid item xs={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Bedrooms</InputLabel>
                  <Select
                    value={filters.bedrooms}
                    label="Bedrooms"
                    onChange={e => handleFilter('bedrooms', e.target.value)}
                  >
                    <MenuItem value="all">Any</MenuItem>
                    {[1,2,3,4,5].map(n=>(
                      <MenuItem key={n} value={n}>{n} BHK</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* city */}
              <Grid item xs={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>City</InputLabel>
                  <Select
                    value={filters.city}
                    label="City"
                    onChange={e => handleFilter('city', e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {filterOptions.cities.map(c=>(
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* clear */}
              <Grid item xs={6} md={2.4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Clear />}
                  onClick={resetFilters}
                  disabled={!activeFilterCount}
                >
                  Clear
                </Button>
              </Grid>

              {/* amenities */}
              <Grid item xs={12}>
                <Typography gutterBottom>Amenities</Typography>
                <FormGroup row>
                  {filterOptions.amenities.slice(0, 10).map(a=>(
                    <FormControlLabel
                      key={a}
                      control={
                        <Checkbox
                          size="small"
                          checked={filters.amenities.includes(a)}
                          onChange={e=>toggleAmenity(a,e.target.checked)}
                        />
                      }
                      label={a}
                    />
                  ))}
                  {/* {filterOptions.amenities.length>10 && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml:2, alignSelf:'center' }}>
                      +{filterOptions.amenities.length-10} more
                    </Typography>
                  )} */}
                </FormGroup>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {filtered.length !== properties.length && (
        <Alert severity="info" sx={{ mb:3 }}>
          Showing {filtered.length} of {properties.length} properties
        </Alert>
      )}

      {/* table */}
      <Paper
        elevation={0}
        sx={{ border:`1px solid ${alpha(theme.palette.divider,0.12)}`, borderRadius:2, overflow:'hidden' }}
      >
        <TableContainer sx={{ maxHeight:600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell sx={{ width:110 }}>Type</TableCell>
                <TableCell sx={{ width:110 }}>Rent</TableCell>
                <TableCell sx={{ width:110 }}>Status</TableCell>
                <TableCell sx={{ width:110 }}>Created</TableCell>
                <TableCell sx={{ width:110 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map(p=>(
                <Fade in key={p.id}>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="subtitle2">{p.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.bedrooms}BHK • {p.area}sqft
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{p.location?.city||'-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.location?.state}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={p.propertyType} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>₹{p.rent?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={p.status} color={statusColor(p.status)} size="small" />
                    </TableCell>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={()=>{ setSelected(p); setDialogOpen(true); }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </Fade>
              ))}

              {!paginated.length && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box display="flex" justifyContent="center" py={5}>
                      <Typography color="text.secondary">No properties found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5,10,25,50]}
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_,p)=>setPage(p)}
          onRowsPerPageChange={e=>{ setRPP(+e.target.value); setPage(0); }}
        />
      </Paper>

      {/* ---------- detail dialog ---------- */}
      <Dialog
        open={dialogOpen}
        onClose={()=>setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Property Details
          {selected && (
            <Chip label={selected.status} color={statusColor(selected.status)} size="small" sx={{ ml:2 }} />
          )}
        </DialogTitle>

        <DialogContent dividers>
          {selected && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {selected.images?.length && (
                  <CardMedia
                    component="img"
                    height="300"
                    image={selected.images[0]}
                    alt={selected.title}
                    sx={{ borderRadius:1, mb:2 }}
                  />
                )}

                <Typography variant="h5" gutterBottom>{selected.title}</Typography>
                <Typography color="text.secondary" gutterBottom>
                  {selected.location?.address}, {selected.location?.city}, {selected.location?.state}
                </Typography>

                <Box my={2}>
                  <Typography variant="h4" color="primary">
                    ₹{selected.rent?.toLocaleString()} /month
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deposit: ₹{selected.deposit?.toLocaleString()}
                  </Typography>
                </Box>

                <Grid container spacing={2} mb={2}>
                  {[
                    ['Type', selected.propertyType],
                    ['Bedrooms', selected.bedrooms],
                    ['Bathrooms', selected.bathrooms],
                    ['Area', `${selected.area} sqft`]
                  ].map(([k,v])=>(
                    <Grid item key={k}>
                      <Typography variant="body2"><strong>{k}:</strong> {v}</Typography>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="body1" paragraph>{selected.description}</Typography>

                {!!selected.amenities?.length && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Amenities</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {selected.amenities.map(a=>(
                        <Chip key={a} label={a} variant="outlined" size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Owner Information</Typography>
                    <Divider sx={{ mb:2 }} />
                    {selected.owner ? (
                      <>
                        {[
                          ['ID Proof Type',  selected.owner.idProofType],
                          ['ID Proof Number',selected.owner.idProofNumber],
                          ['Verified',        selected.owner.verified ? 'Yes' : 'No'],
                          ['Total Properties',selected.owner.properties?.length || 0]
                        ].map(([k,v])=>(
                          <Typography key={k} paragraph><strong>{k}:</strong> {v}</Typography>
                        ))}

                        {selected.owner.idProofImageUrl && (
                          <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>ID Proof Image</Typography>
                            <CardMedia
                              component="img"
                              height="150"
                              image={selected.owner.idProofImageUrl}
                              alt="ID Proof"
                              sx={{ borderRadius:1 }}
                            />
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography color="text.secondary">Owner information not available</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={()=>setDialogOpen(false)}>Close</Button>

          {selected?.status === 'pending' && (
            <>
              <Button
                color="error"
                disabled={reviewLoading}
                onClick={()=>callReview(selected.id,'rejected')}
              >
                {reviewLoading ? <CircularProgress size={18}/> : 'Reject'}
              </Button>
              <Button
                variant="contained"
                color="success"
                disabled={reviewLoading}
                onClick={()=>callReview(selected.id,'approved')}
              >
                {reviewLoading ? <CircularProgress size={18}/> : 'Approve'}
              </Button>
            </>
          )}

          {selected?.status === 'approved' && (
            <Button
              variant="contained"
              color="primary"
              disabled={publishLoading}
              onClick={()=>callPublish(selected.id)}
            >
              {publishLoading ? <CircularProgress size={18}/> : 'Publish'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertiesTab;
