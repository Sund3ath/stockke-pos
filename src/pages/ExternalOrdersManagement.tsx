import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  AccessTime as AccessTimeIcon,
  Done as DoneIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { getExternalOrdersByUserId, updateExternalOrder } from '../api/orders';
import { useStore } from '../store';

interface ExternalOrder {
  id: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
  customerNote?: string;
}

const ExternalOrdersManagement: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<ExternalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ExternalOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const userId = useStore(state => state.user?.id);

  useEffect(() => {
    fetchOrders();
    // Set up polling for new orders
    const interval = setInterval(fetchOrders, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const fetchOrders = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const fetchedOrders = await getExternalOrdersByUserId(userId);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId: string, newStatus: string) => {
    try {
      setProcessingOrder(orderId);
      await updateExternalOrder({
        id: orderId,
        status: newStatus
      });
      await fetchOrders(); // Refresh orders after update
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setProcessingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <AccessTimeIcon />;
      case 'processing':
        return <CircularProgress size={20} />;
      case 'completed':
        return <DoneIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('externalOrders.management.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Pending Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('externalOrders.management.pendingOrders')}
            </Typography>
            {orders
              .filter(order => order.status.toLowerCase() === 'pending')
              .map(order => (
                <Paper
                  key={order.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { boxShadow: 2 }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                    <Chip
                      label={t(`orders.status.${order.status.toLowerCase()}`)}
                      color={getStatusColor(order.status)}
                      size="small"
                      icon={getStatusIcon(order.status)}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {order.items.length} {t('items')} - €{order.total.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleOrderAction(order.id, 'processing')}
                      disabled={!!processingOrder}
                      startIcon={<CheckIcon />}
                    >
                      {t('externalOrders.management.accept')}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleOrderAction(order.id, 'cancelled')}
                      disabled={!!processingOrder}
                      startIcon={<CloseIcon />}
                    >
                      {t('externalOrders.management.reject')}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
          </Paper>
        </Grid>

        {/* Active Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('externalOrders.management.activeOrders')}
            </Typography>
            {orders
              .filter(order => order.status.toLowerCase() === 'processing')
              .map(order => (
                <Paper
                  key={order.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { boxShadow: 2 }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                    <Chip
                      label={t(`orders.status.${order.status.toLowerCase()}`)}
                      color={getStatusColor(order.status)}
                      size="small"
                      icon={getStatusIcon(order.status)}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {order.items.length} {t('items')} - €{order.total.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleOrderAction(order.id, 'completed')}
                      disabled={!!processingOrder}
                      startIcon={<CheckIcon />}
                    >
                      {t('externalOrders.management.complete')}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Order Details Dialog */}
      <Dialog
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('externalOrders.management.orderDetails')}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('orders.orderDate')}
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <List>
                {selectedOrder.items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.productName}
                      secondary={`${item.quantity}x €${item.price.toFixed(2)}`}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="body2">
                        €{(item.quantity * item.price).toFixed(2)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('orders.total')}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  €{selectedOrder.total.toFixed(2)}
                </Typography>
              </Box>
              {selectedOrder.customerNote && (
                <TextField
                  fullWidth
                  label={t('orders.customerNote')}
                  value={selectedOrder.customerNote}
                  multiline
                  rows={2}
                  variant="outlined"
                  disabled
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsOpen(false)}>
            {t('common.close')}
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => {
              // TODO: Implement print functionality
              setIsDetailsOpen(false);
            }}
          >
            {t('orders.print')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExternalOrdersManagement; 