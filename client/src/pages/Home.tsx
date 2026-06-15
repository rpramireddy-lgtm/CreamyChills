import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import ModifierModal from '../components/ModifierModal';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  inStock: boolean;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getAll({ featured: true, limit: 8 });
      setFeaturedProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Ice Cream', id: 'ice-cream', image: '/images/products/IceCreams/Vanilla Ice Cream.jpg' },
    { name: 'Waffles', id: 'waffle', image: '/images/products/Waffles/Kinder Bueno Waffle.jpg' },
    { name: 'Milkshakes', id: 'milkshake', image: '/images/products/Milkshakes/Dubai Milkshake.jpg' },
    { name: 'Cakes', id: 'cake', image: '/images/products/Cakes/Dream Cake.jpg' },
    { name: 'Sundaes', id: 'sundae', image: '/images/products/Sundaes/Oreo Sundae.jpg' },
    { name: 'Cookie Dough', id: 'cookie-dough', image: '/images/products/Cookie Dough/Nutella Cookie Dough.jpg' },
  ];

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: '#b03160',
          color: 'white',
          py: { xs: 10, md: 14 },
          textAlign: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at top right, rgba(212, 133, 154, 0.4) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(198, 100, 129, 0.3) 0%, transparent 60%)',
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              fontSize: { xs: '2.8rem', md: '4rem' },
              mb: 3,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            Creamy Chills
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"PT Serif", serif',
              fontWeight: 400,
              mb: 5,
              color: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              lineHeight: 1.6,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Premium handcrafted desserts in Broxburn.<br/>
            Made fresh daily with the finest ingredients.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/products"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#ffffff',
                color: '#b03160',
                borderRadius: '100px',
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                fontFamily: '"PT Serif", serif',
                fontWeight: 400,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#f0d6e0', boxShadow: 'none' },
              }}
            >
              Order Now
            </Button>
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.6)',
                color: '#ffffff',
                borderRadius: '100px',
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                fontFamily: '"PT Serif", serif',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              View Menu
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Pickup info bar */}
      <Box sx={{ bgcolor: '#9e3a58', py: 1.5, textAlign: 'center' }}>
        <Typography sx={{ 
          color: 'white', 
          fontFamily: '"PT Serif", serif',
          fontSize: '0.95rem' 
        }}>
          📍 Pickup from 60 East Main Street, Broxburn
        </Typography>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500,
            color: '#b03160',
            mb: 2,
            fontSize: { xs: '1.8rem', md: '2.2rem' },
          }}
        >
          Our Menu
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            fontFamily: '"PT Serif", serif',
            color: '#696969',
            mb: 6,
            fontSize: '1.05rem',
          }}
        >
          Explore our handcrafted dessert collection
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: 3 
        }}>
          {categories.map((category, index) => (
            <Box
              component={Link}
              to="/products"
              state={{ category: category.id }}
              key={index}
              sx={{
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  paddingBottom: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  position: 'relative',
                  mb: 1.5,
                  boxShadow: '0 4px 12px rgba(176, 49, 96, 0.12)',
                  border: '3px solid transparent',
                  '&:hover': { border: '3px solid #d4859a' },
                }}
              >
                <CardMedia
                  component="img"
                  image={category.image}
                  alt={category.name}
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' 
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontFamily: '"PT Serif", serif',
                  fontWeight: 400,
                  color: '#333',
                  fontSize: '0.9rem',
                }}
              >
                {category.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Featured Products */}
      <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 500,
              color: '#b03160',
              mb: 2,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
            }}
          >
            Popular Right Now
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              fontFamily: '"PT Serif", serif',
              color: '#696969',
              mb: 6,
              fontSize: '1.05rem',
            }}
          >
            Our customers' favourites
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3 
            }}>
              {featuredProducts.map((product) => (
                <Card
                  key={product._id}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    border: '1px solid #f0e8e8',
                    boxShadow: 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(176, 49, 96, 0.1)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={product.image}
                      alt={product.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  </Box>

                  <CardContent sx={{ p: 2.5 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500,
                        color: '#333',
                        fontSize: '0.95rem',
                        mb: 0.5,
                        lineHeight: 1.3,
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: '"PT Serif", serif',
                        color: '#999',
                        fontSize: '0.8rem',
                        mb: 2,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 600,
                          color: '#b03160',
                          fontSize: '1.1rem',
                        }}
                      >
                        £{product.price.toFixed(2)}
                      </Typography>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setSelectedProduct(product)}
                        disabled={!product.inStock}
                        sx={{
                          bgcolor: '#b03160',
                          color: 'white',
                          borderRadius: '100px',
                          textTransform: 'none',
                          fontFamily: '"PT Serif", serif',
                          fontSize: '0.8rem',
                          px: 2,
                          py: 0.5,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#9e3a58', boxShadow: 'none' },
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                borderColor: '#b03160',
                color: '#b03160',
                borderRadius: '100px',
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                fontFamily: '"PT Serif", serif',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#9e3a58',
                  bgcolor: '#b03160',
                  color: 'white',
                },
              }}
            >
              View Full Menu
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Info Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 500,
              color: '#b03160',
              mb: 3,
              fontSize: { xs: '1.5rem', md: '1.8rem' },
            }}
          >
            Visit Us
          </Typography>
          <Typography
            sx={{
              fontFamily: '"PT Serif", serif',
              color: '#555',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              mb: 3,
            }}
          >
            60 East Main Street, Broxburn, EH52 5EE<br/>
            Open 7 days a week
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#b03160',
              color: 'white',
              borderRadius: '100px',
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              fontFamily: '"PT Serif", serif',
              fontWeight: 400,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#9e3a58', boxShadow: 'none' },
            }}
          >
            Order for Pickup
          </Button>
        </Container>
      </Box>

      {/* Modifier Modal */}
      <ModifierModal
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onAdded={(name) => { setAddedItemName(name); setShowConfirmation(true); }}
      />
      
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
          sx={{ width: '100%', fontSize: '1rem', fontWeight: 500 }}
        >
          {addedItemName} added to cart
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
