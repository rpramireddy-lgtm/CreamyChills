import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, Chip, Snackbar, Alert } from '@mui/material';
import { ArrowForward, AccessTime, LocationOn, Star } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ModifierModal from '../components/ModifierModal';
import SEO from '../components/SEO';

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

const isOpen = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const closeHour = [5, 6].includes(day) ? 23 : 22;
  return hour >= 12 && hour < closeHour;
};

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');

  useEffect(() => { fetchFeaturedProducts(); }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getAll({ featured: true, limit: 8 });
      setFeaturedProducts(response.data.products || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const categories = [
    { name: 'Ice Cream', id: 'ice-cream', image: '/images/products/IceCreams/Ferrero Rocher.jpg' },
    { name: 'Waffles', id: 'waffle', image: '/images/products/Waffles/Kinder Bueno Waffle.jpg' },
    { name: 'Milkshakes', id: 'milkshake', image: '/images/products/Milkshakes/Dubai Milkshake.jpg' },
    { name: 'Crepes', id: 'crepe', image: '/images/products/Crepes/Nutella Crepe.jpg' },
    { name: 'Cookie Dough', id: 'cookie-dough', image: '/images/products/Cookie Dough/Nutella Cookie Dough.jpg' },
    { name: 'Sundaes', id: 'sundae', image: '/images/products/Sundaes/Kinder Bueno Sundae.jpg' },
    { name: 'Loaded Kunafa', id: 'loaded-kunafa', image: '/images/products/Loaded Kunafa/Dubai Kunafas.jpg' },
    { name: 'Cakes', id: 'cake', image: '/images/products/Cakes/Matilda Cake.jpg' },
  ];

  const open = isOpen();

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh' }}>
      <SEO title="" description="Premium handcrafted desserts in Broxburn. Order ice cream, waffles, milkshakes, crepes and more for collection or delivery." />

      {/* HERO SECTION */}
      <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#b03160' }}>
        {/* Background image overlay */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(/images/products/Waffles/Dubai Kunafa Waffle.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.15,
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex', flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center', gap: { xs: 4, md: 6 },
            py: { xs: 8, md: 10 },
          }}>
            {/* Left: Text */}
            <Box sx={{ flex: 1, color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
              {/* Open/Closed badge */}
              <Chip
                icon={<AccessTime sx={{ color: 'white !important', fontSize: 16 }} />}
                label={open ? 'Open Now' : 'Currently Closed'}
                sx={{
                  bgcolor: open ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white', mb: 3, fontFamily: '"PT Serif"'
                }}
              />

              <Typography sx={{
                fontFamily: '"Poppins"', fontWeight: 600,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.1, mb: 2, color: 'white',
              }}>
                Desserts worth<br />melting for
              </Typography>

              <Typography sx={{
                fontFamily: '"PT Serif"', fontSize: { xs: '1rem', md: '1.2rem' },
                color: 'rgba(255,255,255,0.85)', mb: 4, maxWidth: 450,
                mx: { xs: 'auto', md: 0 }, lineHeight: 1.6,
              }}>
                Handcrafted waffles, crepes, milkshakes and ice cream made fresh in Broxburn. Order for collection or delivery.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                <Button
                  component={Link} to="/products" variant="contained" size="large"
                  sx={{ bgcolor: 'white', color: '#b03160', borderRadius: '100px', px: 4, py: 1.5, fontFamily: '"PT Serif"', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#f0d6e0' } }}
                >
                  Order Now
                </Button>
                <Button
                  component={Link} to="/find-us" variant="outlined" size="large"
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', borderRadius: '100px', px: 4, py: 1.5, fontFamily: '"PT Serif"', textTransform: 'none', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Find Us
                </Button>
              </Box>

              {/* Trust signals */}
              <Box sx={{ display: 'flex', gap: 3, mt: 4, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ fontSize: 18, color: '#FFD700' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>4.8 rated</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Broxburn, EH52</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>~15 min prep</Typography>
                </Box>
              </Box>
            </Box>

            {/* Right: Product images collage */}
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, maxWidth: 400 }}>
              {[
                '/images/products/Waffles/Kinder Bueno Waffle.jpg',
                '/images/products/Milkshakes/Dubai Milkshake.jpg',
                '/images/products/Crepes/Nutella Crepe.jpg',
                '/images/products/Sundaes/Kinder Bueno Sundae.jpg'
              ].map((img, i) => (
                <Box key={i} sx={{
                  borderRadius: 2, overflow: 'hidden',
                  height: i === 0 || i === 3 ? 180 : 150,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  transform: i % 2 === 0 ? 'translateY(-10px)' : 'translateY(10px)',
                }}>
                  <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Categories */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography sx={{ textAlign: 'center', fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 1, fontSize: { xs: '1.6rem', md: '2rem' } }}>
          Our Menu
        </Typography>
        <Typography sx={{ textAlign: 'center', fontFamily: '"PT Serif"', color: '#696969', mb: 5 }}>
          Tap a category to explore
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(8, 1fr)' }, gap: 2 }}>
          {categories.map((cat, i) => (
            <Box component={Link} to="/products" state={{ category: cat.id }} key={i} sx={{ textDecoration: 'none', textAlign: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
              <Box sx={{ width: '100%', paddingBottom: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative', mb: 1, border: '2px solid #f0e8e8', '&:hover': { border: '2px solid #b03160' } }}>
                <CardMedia component="img" image={cat.image} alt={cat.name} loading="lazy" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.src = '/images/placeholder.jpg'; }} />
              </Box>
              <Typography sx={{ fontFamily: '"PT Serif"', color: '#333', fontSize: '0.78rem' }}>{cat.name}</Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Featured Products */}
      <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 1, fontSize: { xs: '1.6rem', md: '2rem' } }}>
            Most Popular
          </Typography>
          <Typography sx={{ textAlign: 'center', fontFamily: '"PT Serif"', color: '#696969', mb: 5 }}>
            Customer favourites this week
          </Typography>

          {!loading && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
              {featuredProducts.map((product) => (
                <Card key={product._id} onClick={() => setSelectedProduct(product)} sx={{
                  cursor: 'pointer', borderRadius: 2, overflow: 'hidden', border: '1px solid #f0e8e8', boxShadow: 'none',
                  transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(176,49,96,0.1)', border: '1px solid #d4859a' }
                }}>
                  <CardMedia component="img" height="160" image={product.image} alt={product.name} loading="lazy" sx={{ objectFit: 'cover' }} onError={(e: any) => { e.target.src = '/images/placeholder.jpg'; }} />
                  <CardContent sx={{ p: 2 }}>
                    <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.88rem', color: '#333', mb: 0.5, lineHeight: 1.2 }}>{product.name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '1rem' }}>£{product.price.toFixed(2)}</Typography>
                      <Chip label="Add" size="small" sx={{ bgcolor: '#b03160', color: 'white', fontSize: '0.7rem', height: 24, cursor: 'pointer' }} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button component={Link} to="/products" variant="outlined" endIcon={<ArrowForward />} sx={{ borderColor: '#b03160', color: '#b03160', borderRadius: '100px', px: 4, py: 1.2, fontFamily: '"PT Serif"', textTransform: 'none', '&:hover': { bgcolor: '#b03160', color: 'white', borderColor: '#b03160' } }}>
              View Full Menu
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 4, textAlign: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>🍦</Typography>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 0.5 }}>Fresh Daily</Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', fontSize: '0.85rem' }}>Everything made to order with premium ingredients</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>⚡</Typography>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 0.5 }}>Fast Pickup</Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', fontSize: '0.85rem' }}>Ready in 10-15 minutes for collection</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>🎁</Typography>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 0.5 }}>Earn Rewards</Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', fontSize: '0.85rem' }}>Loyalty points on every order</Typography>
          </Box>
        </Box>
      </Container>

      {/* Modifier Modal */}
      <ModifierModal
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onAdded={(name) => { setAddedItemName(name); setShowConfirmation(true); }}
      />

      <Snackbar open={showConfirmation} autoHideDuration={2500} onClose={() => setShowConfirmation(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ zIndex: 9999 }}>
        <Alert onClose={() => setShowConfirmation(false)} severity="success" sx={{ width: '100%' }}>
          {addedItemName} added to cart
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
