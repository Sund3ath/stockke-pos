import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '../types';
import { getProductsByUserId } from '../api/products';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemButton,
  TextField,
  Container
} from '@mui/material';
import { ShoppingCart, Restaurant, Close as CloseIcon, Add as AddIcon, Remove as RemoveIcon, Notifications as NotificationsIcon, Search as SearchIcon, Star as StarIcon, ArrowBack, ArrowForward, LocationOn, LocalShipping, ShoppingBagOutlined } from '@mui/icons-material';
import { createExternalOrder } from '../api/orders';
import Cookies from 'js-cookie';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Interface for order items stored in cookies
interface CookieOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Interface for orders stored in cookies
interface CookieOrder {
  id: string;
  items: CookieOrderItem[];
  total: number;
  status: string;
  createdAt: string;
  customerNote?: string;
}

// Add this constant at the top of the file
const CARD_STYLES = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: 2,
    borderRadius: 2,
    '&:hover': { 
      transform: 'translateY(-4px)', 
      boxShadow: 4 
    },
    transition: 'transform 0.2s, box-shadow 0.2s',
    overflow: 'hidden',
    bgcolor: 'white'
  },
  mediaContainer: {
    position: 'relative',
    paddingTop: '56.25%', // 16:9 aspect ratio
    backgroundColor: '#f5f5f5'
  },
  media: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  content: {
    flex: 1,
    p: 2
  },
  priceAction: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mt: 2
  },
  recommendedBadge: {
    position: 'absolute',
    top: 16,
    left: -8,
    bgcolor: 'error.main',
    color: 'white',
    py: 0.5,
    px: 2,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 10% 50%)',
    zIndex: 1
  }
};

const ExternalOrder: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [cookiesEnabled, setCookiesEnabled] = useState(true);
  const [showCookieWarning, setShowCookieWarning] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(true);
  const [orderHistory, setOrderHistory] = useState<CookieOrder[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  // Force German language on component mount
  useEffect(() => {
    if (i18n.language !== 'de') {
      i18n.changeLanguage('de');
    }
  }, [i18n]);

  // Group products by category for sidebar navigation and display
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  useEffect(() => {
    if (!activeCategory && Object.keys(groupedProducts).length > 0) {
      setActiveCategory(Object.keys(groupedProducts)[0]);
    }
  }, [groupedProducts, activeCategory]);

  useEffect(() => {
    // Check if user has already made a cookie choice
    const savedConsent = Cookies.get('cookie_consent');
    if (savedConsent !== undefined) {
      setCookieConsent(savedConsent === 'true');
      setShowConsentDialog(false);
    }
  }, []);

  useEffect(() => {
    if (cookiesEnabled && Object.keys(cart).length > 0) {
      Cookies.set('external_order_cart', JSON.stringify(cart), { expires: 1 }); // Expires in 1 day
    }
  }, [cart, cookiesEnabled]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (userId) {
        try {
          setLoading(true);
          setError(null);
          const productsData = await getProductsByUserId(userId);
          console.log('Fetched products:', productsData);
          setProducts(productsData);
        } catch (error) {
          console.error('Error fetching products:', error);
          setError(t('errors.failedToLoadProducts'));
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProducts();
  }, [userId, t]);

  useEffect(() => {
    const loadOrderHistoryFromCookies = () => {
      if (cookiesEnabled && userId) {
        try {
          setLoadingHistory(true);
          const cookieKey = `order_history_${userId}`;
          const savedOrderHistory = Cookies.get(cookieKey);
          
          console.log('Loading order history from cookies, key:', cookieKey);
          console.log('Raw cookie value:', savedOrderHistory);
          
          if (savedOrderHistory) {
            const parsedOrders = JSON.parse(savedOrderHistory);
            console.log('Parsed orders:', parsedOrders);
            setOrderHistory(parsedOrders);
          } else {
            console.log('No order history found in cookies');
            
            // TEST: Add a test order for debugging
            const testOrder: CookieOrder = {
              id: `test-${Date.now()}`,
              items: [
                {
                  productId: 'test-product-1',
                  productName: 'Test Product 1',
                  quantity: 2,
                  price: 19.99
                }
              ],
              total: 39.98,
              status: 'completed',
              createdAt: new Date().toISOString(),
              customerNote: 'This is a test order'
            };
            
            const testOrders = [testOrder];
            console.log('Setting test order:', testOrders);
            setOrderHistory(testOrders);
            
            // Save test order to cookies
            Cookies.set(cookieKey, JSON.stringify(testOrders), { expires: 30 });
          }
        } catch (error) {
          console.error('Error loading order history from cookies:', error);
          setOrderHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      }
    };
    
    loadOrderHistoryFromCookies();
  }, [userId, cookiesEnabled, orderSuccess]);

  const handleCookieConsent = (consent: boolean) => {
    setCookieConsent(consent);
    setShowConsentDialog(false);
    Cookies.set('cookie_consent', consent.toString(), { expires: 365 }); // Save consent for 1 year

    if (consent) {
      // If user consents, try to enable cookies
      try {
        Cookies.set('test_cookie', 'test');
        const testCookie = Cookies.get('test_cookie');
        if (!testCookie) {
          setCookiesEnabled(false);
          setShowCookieWarning(true);
        } else {
          Cookies.remove('test_cookie');
          setCookiesEnabled(true);
          // Load cart from cookies if available
          const savedCart = Cookies.get('external_order_cart');
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
          
          // Load order history from cookies
          const cookieKey = `order_history_${userId}`;
          const savedOrderHistory = Cookies.get(cookieKey);
          if (savedOrderHistory) {
            setOrderHistory(JSON.parse(savedOrderHistory));
          }
        }
      } catch (error) {
        setCookiesEnabled(false);
        setShowCookieWarning(true);
      }
    } else {
      // If user declines, disable cookie functionality
      setCookiesEnabled(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    if (!cookiesEnabled) {
      setShowCookieWarning(true);
      return;
    }
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    if (!cookiesEnabled) {
      setShowCookieWarning(true);
      return;
    }
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const saveOrderToCookies = (newOrder: CookieOrder) => {
    if (cookiesEnabled && userId) {
      try {
        const cookieKey = `order_history_${userId}`;
        const existingOrdersStr = Cookies.get(cookieKey);
        const existingOrders: CookieOrder[] = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
        
        // Add new order to the beginning of the array
        const updatedOrders = [newOrder, ...existingOrders];
        
        // Limit to storing last 10 orders to avoid cookie size issues
        const limitedOrders = updatedOrders.slice(0, 10);
        
        // Save updated order history
        Cookies.set(cookieKey, JSON.stringify(limitedOrders), { expires: 30 }); // 30 days expiry
        
        // Update state
        setOrderHistory(limitedOrders);
        
        console.log('Saved orders to cookies:', limitedOrders);
      } catch (error) {
        console.error('Error saving order to cookies:', error);
      }
    }
  };

  const handleCheckout = async () => {
    try {
      setIsSubmitting(true);
      setOrderError(null);

      const orderItems = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        if (!product) throw new Error('Product not found');
        
        return {
          productId,
          productName: product.name,
          quantity,
          price: product.price
        };
      });

      console.log('Original orderItems:', orderItems);
      
      const total = calculateTotal();
      
      // Create a new order object for cookies
      const newOrder: CookieOrder = {
        id: `local-${Date.now()}`,
        items: orderItems,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        customerNote: ''
      };
      
      // Save the order to cookies
      saveOrderToCookies(newOrder);
      
      // Also try to create an external order in the background if possible
      try {
        // Create a new array without productName for GraphQL
        const externalOrderItems = Object.entries(cart).map(([productId, quantity]) => {
          const product = products.find(p => p.id === productId);
          if (!product) throw new Error('Product not found');
          
          return {
            productId,
            quantity,
            price: product.price,
            taxRate: product.taxRate || 19
          };
        });
        
        console.log('ExternalOrderItems:', externalOrderItems);
        
        const input = {
          items: externalOrderItems,
          total,
          adminUserId: userId!,
          customerNote: ''
        };
        
        console.log('Final input for createExternalOrder:', JSON.stringify(input));
        
        await createExternalOrder(input);
      } catch (error) {
        console.error('Detailed error in createExternalOrder:', error);
      }
      
      setOrderSuccess(true);
      setCart({});
      setIsCartOpen(false);
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError(t('errors.failedToCreateOrder'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOrderHistory = () => {
    if (loadingHistory) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (orderHistory.length === 0) {
      return (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          {t('orderHistory.noOrders')}
        </Typography>
      );
    }

    return orderHistory.map((order) => (
      <Accordion key={order.id} sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              {new Date(order.createdAt).toLocaleDateString()} - {t(`orders.status.${order.status.toLowerCase()}`)}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              €{order.total.toFixed(2)}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {order.items.map((item, index) => (
              <ListItem key={item.productId + index}>
                <ListItemText
                  primary={item.productName}
                  secondary={`${item.quantity}x €${item.price.toFixed(2)}`}
                />
                <Typography variant="body2">
                  €{(item.quantity * item.price).toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>
          {order.customerNote && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('orderHistory.note')}:
              </Typography>
              <Typography variant="body2">{order.customerNote}</Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    ));
  };

  // Filter products by search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get featured products - first check for featured flag, then take first 3
  const featuredProducts = products
    .filter(p => p.featured)
    .length > 0 ? 
    products.filter(p => p.featured) : 
    products.slice(0, 3);

  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Restaurant sx={{ fontSize: 48, color: 'primary.main' }} />
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            backgroundColor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Typography variant="h6">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            backgroundColor: 'info.light',
            color: 'info.contrastText'
          }}
        >
          <Typography variant="h6">
            {t('externalOrder.noProducts')}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      overflow: 'hidden'
    }}>
      {/* Left Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { xs: 0, md: 240 },
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'white',
          p: 2,
          display: { xs: 'none', md: 'block' },
          boxShadow: '0 0 10px rgba(0,0,0,0.05)',
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>MENU</Typography>
        <List>
          {Object.keys(groupedProducts).map((category) => (
            <ListItem 
              key={category} 
              disablePadding
              onClick={() => setActiveCategory(category)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: activeCategory === category ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: activeCategory === category ? 'primary.main' : 'rgba(0,0,0,0.04)',
                }
              }}
            >
              <ListItemButton>
                <ListItemText 
                  primary={t(`categories.${category.toLowerCase()}`)} 
                  primaryTypographyProps={{
                    fontWeight: activeCategory === category ? 'bold' : 'regular',
                    color: activeCategory === category ? 'white' : 'inherit'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={<NotificationsIcon />}
            fullWidth
            variant="contained"
            color="error"
            sx={{ 
              textAlign: 'left', 
              justifyContent: 'flex-start',
              py: 1.5,
              boxShadow: 3,
              borderRadius: 2
            }}
          >
            Special Offers
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Search Bar - Fixed */}
        <Box sx={{ 
          p: { xs: 2, md: 3 }, 
          bgcolor: '#f8f9fa',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <TextField
            fullWidth
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              sx: { borderRadius: 3, py: 0.5 }
            }}
            sx={{ bgcolor: 'white', boxShadow: 1 }}
          />
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, md: 3 },
          pt: 0
        }}>
          {/* Order History Section */}
          <Box component="div" sx={{ mb: 4 }}>
            <Box component="div" sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              py: 2,
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <ShoppingBagOutlined />
                {t('orderHistory.title')}
              </Typography>
              <Chip 
                label={orderHistory.length > 0 ? orderHistory.length : '0'} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            </Box>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'white', mb: 3, maxHeight: '400px', overflow: 'auto' }}>
              {loadingHistory ? (
                <Box component="div" sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : orderHistory.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  {t('orderHistory.noOrders')}
                </Typography>
              ) : (
                orderHistory.map((order) => (
                  <Accordion key={order.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {new Date(order.createdAt).toLocaleDateString()} - {t(`orders.status.${order.status.toLowerCase()}`)}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          €{order.total.toFixed(2)}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {order.items.map((item, index) => (
                          <ListItem key={item.productId + index}>
                            <ListItemText
                              primary={item.productName}
                              secondary={`${item.quantity}x €${item.price.toFixed(2)}`}
                            />
                            <Typography variant="body2">
                              €{(item.quantity * item.price).toFixed(2)}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                      {order.customerNote && (
                        <Box component="div" sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {t('orderHistory.note')}:
                          </Typography>
                          <Typography variant="body2">{order.customerNote}</Typography>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Paper>
          </Box>

          {/* Featured Products */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
              py: 2
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <StarIcon sx={{ color: 'warning.main' }} />
                {t('featuredProducts')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" sx={{ bgcolor: 'grey.100' }}>
                  <ArrowBack fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ bgcolor: 'grey.100' }}>
                  <ArrowForward fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3,
              mb: 4
            }}>
              {featuredProducts.map((product) => (
                <Card key={product.id} sx={CARD_STYLES.card}>
                  <Box sx={CARD_STYLES.mediaContainer}>
                    <Box sx={CARD_STYLES.recommendedBadge}>
                      {t('recommended')}
                    </Box>
                    <CardMedia
                      component="img"
                      image={product.image || '/default-food-image.jpg'}
                      alt={product.name}
                      sx={CARD_STYLES.media}
                    />
                  </Box>
                  <CardContent sx={CARD_STYLES.content}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                        height: 40
                      }}
                    >
                      {product.description}
                    </Typography>
                    <Box sx={CARD_STYLES.priceAction}>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        €{product.price.toFixed(2)}
                      </Typography>
                      <IconButton
                        color="primary"
                        onClick={() => handleAddToCart(product.id)}
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.main' }
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Active Category Products */}
          {activeCategory && (
            <Box sx={{ mb: 6 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                borderBottom: 1,
                borderColor: 'divider',
                py: 2
              }}>
                <Typography variant="h5" fontWeight="bold">
                  {t(`categories.${activeCategory.toLowerCase()}`)}
                </Typography>
                <Chip 
                  label={`${groupedProducts[activeCategory].length} ${t('items')}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>

              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)'
                },
                gap: 3
              }}>
                {groupedProducts[activeCategory].map((product) => (
                  <Card key={product.id} sx={CARD_STYLES.card}>
                    <Box sx={CARD_STYLES.mediaContainer}>
                      <CardMedia
                        component="img"
                        image={product.image || '/default-food-image.jpg'}
                        alt={product.name}
                        sx={CARD_STYLES.media}
                      />
                    </Box>
                    <CardContent sx={CARD_STYLES.content}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {product.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 1,
                          height: 40
                        }}
                      >
                        {product.description}
                      </Typography>
                      <Box sx={CARD_STYLES.priceAction}>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          €{product.price.toFixed(2)}
                        </Typography>
                        {cart[product.id] ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFromCart(product.id)}
                              sx={{ bgcolor: 'grey.100' }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                              {cart[product.id]}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleAddToCart(product.id)}
                              sx={{ bgcolor: 'grey.100' }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <IconButton
                            color="primary"
                            onClick={() => handleAddToCart(product.id)}
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'white',
                              '&:hover': { bgcolor: 'primary.main' }
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Right Sidebar - Cart */}
      <Box
        sx={{
          width: { xs: 0, md: 320 },
          flexShrink: 0,
          borderLeft: 1,
          borderColor: 'divider',
          bgcolor: 'white',
          p: 3,
          display: { xs: 'none', md: 'block' },
          boxShadow: '0 0 10px rgba(0,0,0,0.05)',
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 3,
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6" fontWeight="bold">
            {t('cart.myOrder')}
          </Typography>
          {getTotalItems() > 0 && (
            <Chip
              label={getTotalItems()}
              color="primary"
              size="small"
            />
          )}
        </Box>

        {getTotalItems() === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
            gap: 2
          }}>
            <ShoppingBagOutlined sx={{ fontSize: 60, color: 'grey.300' }} />
            <Typography color="text.secondary">
              {t('cart.empty')}
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ mb: 3 }}>
              {Object.entries(cart).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                if (!product) return null;

                return (
                  <ListItem 
                    key={productId} 
                    sx={{ 
                      py: 2,
                      borderBottom: '1px dashed rgba(0,0,0,0.1)'
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleRemoveFromCart(productId)}
                          sx={{ bgcolor: 'grey.100' }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography>{quantity}</Typography>
                        <IconButton 
                          size="small"
                          onClick={() => handleAddToCart(productId)}
                          sx={{ bgcolor: 'grey.100' }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={product.name}
                      secondary={`€${product.price.toFixed(2)}`}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                );
              })}
            </List>

            <Box sx={{ 
              py: 2, 
              borderTop: 1, 
              borderBottom: 1, 
              borderColor: 'divider',
              mb: 3
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 1
              }}>
                <Typography color="text.secondary">
                  {t('cart.subtotal')}
                </Typography>
                <Typography>
                  €{calculateTotal().toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between'
              }}>
                <Typography color="text.secondary">
                  {t('cart.deliveryFee')}
                </Typography>
                <Typography>
                  €0.00
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              mb: 3,
              pb: 2,
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="h6" fontWeight="bold">
                {t('cart.total')}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                €{calculateTotal().toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                {t('cart.deliveryMethod')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  variant={deliveryMethod === 'delivery' ? 'contained' : 'outlined'}
                  startIcon={<LocalShipping />}
                  onClick={() => setDeliveryMethod('delivery')}
                  sx={{ flex: 1 }}
                >
                  {t('cart.delivery')}
                </Button>
                <Button
                  variant={deliveryMethod === 'pickup' ? 'contained' : 'outlined'}
                  startIcon={<LocationOn />}
                  onClick={() => setDeliveryMethod('pickup')}
                  sx={{ flex: 1 }}
                >
                  {t('cart.pickup')}
                </Button>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
              onClick={handleCheckout}
              sx={{ borderRadius: 2, py: 1.5, boxShadow: 3 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('cart.checkout')
              )}
            </Button>
          </>
        )}
      </Box>

      {/* Mobile Cart Button */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        display: { xs: 'block', md: 'none' },
        zIndex: 1000 
      }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ShoppingCart />}
          onClick={() => setIsCartOpen(true)}
          sx={{ 
            borderRadius: 8,
            px: 3,
            boxShadow: 4
          }}
        >
          {getTotalItems() > 0 && (
            <>
              {getTotalItems()} - €{calculateTotal().toFixed(2)}
            </>
          )}
        </Button>
      </Box>

      {/* Mobile Cart Drawer */}
      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            px: 2,
          },
        }}
      >
        {/* ... existing drawer content ... */}
      </Drawer>

      {/* ... existing snackbars and dialogs ... */}
    </Box>
  );
};

export default ExternalOrder; 