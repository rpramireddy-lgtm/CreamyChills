import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import ProductCustomization from '../components/ProductCustomization';
import IceCreamCustomization from '../components/IceCreamCustomization';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  inStock: boolean;
  flavors?: string[];
  toppings?: string[];
  sizes?: Array<{
    name: string;
    price: number;
  }>;
}

const categories = [
  { id: 'all', name: 'All Items', color: '#FF6B6B' },
  { id: 'ice-cream', name: 'Ice Cream', color: '#4ECDC4' },
  { id: 'waffle', name: 'Waffles', color: '#45B7D1' },
  { id: 'cake', name: 'Cakes', color: '#96CEB4' },
  { id: 'milkshake', name: 'Milkshakes', color: '#FFEAA7' },
  { id: 'drink', name: 'Drinks', color: '#DDA0DD' },
];

const Products: React.FC = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Handle category from footer links
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.products);
      setFilteredProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  const handleProductClick = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const handleCustomizeProduct = (product: Product) => {
    setSelectedProduct(product);
    setCustomizationOpen(true);
  };

  const handleAddToCart = (customizedProduct: any) => {
    console.log('Adding to cart:', customizedProduct.name);
    addToCart(customizedProduct);
    setAddedItemName(customizedProduct.name);
    setShowConfirmation(true);
    console.log('Snackbar should show:', customizedProduct.name);
  };

  const handleQuickAdd = (product: Product, flavor?: string, size?: { name: string; price: number }) => {
    const price = size ? size.price : product.price;
    const itemName = product.name + (flavor ? ` (${flavor})` : '') + (size ? ` - ${size.name}` : '');
    console.log('Quick adding to cart:', itemName);
    const customizations = [];
    if (flavor) {
      customizations.push({
        name: 'Flavor',
        value: flavor,
        additionalPrice: 0
      });
    }
    if (size) {
      customizations.push({
        name: 'Size',
        value: size.name,
        additionalPrice: size.price - product.price
      });
    }
    
    addToCart({
      id: product._id,
      name: itemName,
      price: price,
      image: product.image,
      customizations,
    });
    setAddedItemName(itemName);
    setShowConfirmation(true);
    console.log('Quick add snackbar should show:', itemName);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Loading our delicious menu...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <img
              src="/images/creamychills.jpeg"
              alt="Creamy Chills Logo"
              style={{
                height: '80px',
                width: 'auto',
                marginRight: '16px',
              }}
            />
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: '#2c3e50',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Our Menu
            </Typography>
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#7f8c8d',
              fontWeight: 300,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Discover our range of delicious desserts, made fresh daily with the finest ingredients
          </Typography>
        </Box>

        {/* Category Tabs */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'white'
          }}
        >
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 60,
                px: 3,
              },
              '& .Mui-selected': {
                color: '#e74c3c !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#e74c3c',
                height: 3,
              },
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Products Grid */}
        <Grid container spacing={2}>
          {filteredProducts.map((product) => (
            <Grid 
              item
              xs={12} 
              sm={6} 
              md={4} 
              lg={2} 
              xl={2} 
              key={product._id}
              sx={{
                '@media (min-width: 1200px)': {
                  flexBasis: '16.67%',
                  maxWidth: '16.67%',
                },
              }}
            >
              <Paper
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '2px solid #e0e0e0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '2px solid #e74c3c',
                  },
                }}
              >
              <Box
                onClick={() => handleProductClick(product._id)}
                onDoubleClick={() => handleProductClick(product._id)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#f8f9fa',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.image}
                    alt={product.name}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
                  {product.featured && (
                    <Chip
                      label="Popular"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: '#e74c3c',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      borderRadius: 1,
                      p: 0.5,
                    }}
                  >
                    {expandedProduct === product._id ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </Box>

                <Box sx={{ p: 1.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#2c3e50',
                      mb: 1,
                      fontSize: '1.1rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#7f8c8d',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {product.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#e74c3c',
                        fontSize: '1.2rem',
                      }}
                    >
                      From £{product.price.toFixed(2)}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCustomizeProduct(product);
                      }}
                      sx={{
                        bgcolor: '#e74c3c',
                        '&:hover': {
                          bgcolor: '#c0392b',
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                      }}
                    >
                      Customize
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Collapse in={expandedProduct === product._id}>
                <Box sx={{ p: 2, pt: 0, bgcolor: '#fafafa' }}>
                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                        Choose Size:
                      </Typography>
                      <List dense>
                        {product.sizes.map((size) => (
                          <ListItem
                            key={size.name}
                            sx={{
                              bgcolor: 'white',
                              borderRadius: 2,
                              mb: 1,
                              border: '1px solid #e0e0e0',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'stretch', sm: 'center' },
                              py: 2,
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              width: '100%',
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: { xs: 1, sm: 0 }
                            }}>
                              <ListItemText
                                primary={size.name}
                                sx={{ 
                                  flexGrow: 1,
                                  textAlign: { xs: 'center', sm: 'left' }
                                }}
                              />
                              <Typography
                                variant="h6"
                                sx={{ 
                                  color: '#000000 !important', 
                                  fontWeight: '900 !important', 
                                  fontSize: '1.3rem !important',
                                  fontFamily: 'Arial, sans-serif !important',
                                  mr: { xs: 0, sm: 2 },
                                  mb: { xs: 1, sm: 0 }
                                }}
                              >
                                £{size.price.toFixed(2)}
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => handleQuickAdd(product, undefined, size)}
                                sx={{
                                  bgcolor: '#e74c3c',
                                  '&:hover': { bgcolor: '#c0392b' },
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  minWidth: { xs: '100%', sm: 'auto' }
                                }}
                              >
                                Add
                              </Button>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Flavors */}
                  {product.flavors && product.flavors.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                        Available Flavors:
                      </Typography>
                      <List dense>
                        {product.flavors.map((flavor) => (
                          <Box
                            key={flavor}
                            sx={{
                              bgcolor: 'white',
                              borderRadius: 2,
                              mb: 1,
                              border: '1px solid #e0e0e0',
                              p: 2,
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                {flavor}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography
                                variant="h6"
                                sx={{ 
                                  color: '#000000', 
                                  fontWeight: 900, 
                                  fontSize: '1.2rem'
                                }}
                              >
                                £{product.price.toFixed(2)}
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => handleQuickAdd(product, flavor)}
                                sx={{
                                  bgcolor: '#e74c3c',
                                  '&:hover': { bgcolor: '#c0392b' },
                                  textTransform: 'none',
                                  fontWeight: 600,
                                }}
                              >
                                Add
                              </Button>
                            </Box>
                          </Box>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Default option if no flavors or sizes */}
                  {(!product.flavors || product.flavors.length === 0) && 
                   (!product.sizes || product.sizes.length === 0) && (
                    <Box>
                      <ListItem
                        sx={{
                          bgcolor: 'white',
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'stretch', sm: 'center' },
                          py: 2,
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          width: '100%',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: { xs: 1, sm: 0 }
                        }}>
                          <ListItemText
                            primary="Standard"
                            sx={{ 
                              flexGrow: 1,
                              textAlign: { xs: 'center', sm: 'left' }
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ 
                              color: '#000000 !important', 
                              fontWeight: '900 !important', 
                              fontSize: '1.3rem !important',
                              fontFamily: 'Arial, sans-serif !important',
                              mr: { xs: 0, sm: 2 },
                              mb: { xs: 1, sm: 0 }
                            }}
                          >
                            £{product.price.toFixed(2)}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => handleQuickAdd(product)}
                            sx={{
                              bgcolor: '#e74c3c',
                              '&:hover': { bgcolor: '#c0392b' },
                              textTransform: 'none',
                              fontWeight: 600,
                              minWidth: { xs: '100%', sm: 'auto' }
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                      </ListItem>
                    </Box>
                  )}
                </Box>
              </Collapse>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {filteredProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" sx={{ color: '#7f8c8d', mb: 2 }}>
              No items found in this category
            </Typography>
            <Typography variant="body1" sx={{ color: '#95a5a6' }}>
              Try selecting a different category or check back later for new items!
            </Typography>
          </Box>
        )}

        {/* Customization Modal */}
        {selectedProduct && (
          selectedProduct.category === 'ice-cream' ? (
            <IceCreamCustomization
              open={customizationOpen}
              onClose={() => setCustomizationOpen(false)}
              product={selectedProduct}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <ProductCustomization
              open={customizationOpen}
              onClose={() => setCustomizationOpen(false)}
              product={selectedProduct}
              onAddToCart={handleAddToCart}
            />
          )
        )}
        
        <Snackbar
          open={showConfirmation}
          autoHideDuration={3000}
          onClose={() => setShowConfirmation(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ zIndex: 9999 }}
        >
          <Alert 
            onClose={() => setShowConfirmation(false)} 
            severity="success" 
            sx={{ 
              width: '100%',
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            ✅ {addedItemName} added to cart!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Products;