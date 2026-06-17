import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, Chip, Snackbar, Alert } from '@mui/material';
import { ArrowForward, AccessTime, LocationOn, Star } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://staging.creamychills.com/api', withCredentials: true });

const isOpen = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const closeHour = [5, 6].includes(day) ? 23 : 22;
  return hour >= 12 && hour < closeHour;
};

const Home: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const slideInterval = useRef<any>(null);

  useEffect(() => {
    fetchMenu();
    return () => { if (slideInterval.current) clearInterval(slideInterval.current); };
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (products.length > 0) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.min(products.filter(p => p.image).length, 6));
      }, 3500);
      return () => clearInterval(slideInterval.current);
    }
  }, [products]);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      const allProducts = res.data.products || [];
      const withImages = allProducts.filter((p: any) => p.image);
      setProducts(withImages);
      setCategories(res.data.categories || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const heroProducts = products.slice(0, 6);
  const featuredProducts = products.slice(0, 8);
  const open = isOpen();

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh' }}>
      <SEO title="" description="Premium handcrafted desserts in Broxburn. Order online for collection or delivery." />

      {/* HERO with Slideshow */}
      <Box sx={{ position: 'relative', bgcolor: '#b03160', overflow: 'hidden' }}>
        {/* Slideshow background */}
        {heroProducts.map((product, i) => (
          <Box
            key={product.id}
            sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${product.image})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: currentSlide === i ? 0.25 : 0,
              transition: 'opacity 1s ease-in-out',
            }}
          />
        ))}

        {/* Dark overlay */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(80, 20, 50, 0.6)' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 3, md: 6 }, py: { xs: 6, md: 8 } }}>
            
            {/* Left text */}
            <Box sx={{ flex: 1, color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
              <Chip
                icon={<AccessTime sx={{ color: 'white !important', fontSize: 14 }} />}
                label={open ? 'Open Now' : 'Currently Closed'}
                size="small"
                sx={{ bgcolor: open ? 'rgba(76,175,80,0.85)' : 'rgba(255,255,255,0.2)', color: 'white', mb: 2.5, fontSize: '0.75rem' }}
              />

              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, fontSize: { xs: '2.2rem', md: '3rem' }, lineHeight: 1.1, mb: 2, color: 'white' }}>
                Desserts worth<br />melting for
              </Typography>

              <Typography sx={{ fontFamily: '"PT Serif"', fontSize: { xs: '0.95rem', md: '1.1rem' }, color: 'rgba(255,255,255,0.85)', mb: 3, maxWidth: 400, mx: { xs: 'auto', md: 0 } }}>
                Handcrafted waffles, crepes, milkshakes and ice cream. Order for collection or delivery in Broxburn.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
                <Button component={Link} to="/products" variant="contained" sx={{ bgcolor: 'white', color: '#b03160', borderRadius: '100px', px: 3.5, py: 1.2, fontFamily: '"PT Serif"', textTransform: 'none', fontSize: '0.9rem', boxShadow: 'none', '&:hover': { bgcolor: '#f0d6e0' } }}>
                  Order Now
                </Button>
                <Button component={Link} to="/find-us" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', borderRadius: '100px', px: 3.5, py: 1.2, fontFamily: '"PT Serif"', textTransform: 'none', fontSize: '0.9rem', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Find Us
                </Button>
              </Box>

              {/* Trust signals */}
              <Box sx={{ display: 'flex', gap: 2.5, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                {[
                  { icon: <Star sx={{ fontSize: 15, color: '#FFD700' }} />, text: '4.8 rated' },
                  { icon: <LocationOn sx={{ fontSize: 15 }} />, text: 'Broxburn' },
                  { icon: <AccessTime sx={{ fontSize: 15 }} />, text: '~15 min' }
                ].map((t, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {t.icon}
                    <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>{t.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Right: sliding product cards */}
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, maxWidth: 380 }}>
              <Box sx={{ position: 'relative', height: 320, overflow: 'hidden', borderRadius: 3 }}>
                {heroProducts.map((product, i) => (
                  <Box key={product.id} sx={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    opacity: currentSlide === i ? 1 : 0,
                    transform: currentSlide === i ? 'scale(1)' : 'scale(1.05)',
                    transition: 'all 1s ease-in-out',
                    borderRadius: 3, overflow: 'hidden'
                  }}>
                    <Box component="img" src={product.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                      <Typography sx={{ color: 'white', fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1rem' }}>{product.name}</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                        {product.variations?.[0]?.price ? `£${product.variations[0].price.toFixed(2)}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {/* Dots */}
                <Box sx={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.5 }}>
                  {heroProducts.map((_, i) => (
                    <Box key={i} onClick={() => setCurrentSlide(i)} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: currentSlide === i ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Mobile slideshow - visible only on small screens */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2, mt: -3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ borderRadius: 2, overflow: 'hidden', height: 180, position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          {heroProducts.map((product, i) => (
            <Box key={product.id} sx={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              opacity: currentSlide === i ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}>
              <Box component="img" src={product.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                <Typography sx={{ color: 'white', fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.85rem' }}>{product.name}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Categories */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 4, fontSize: { xs: '1.4rem', md: '1.8rem' }, textAlign: 'center' }}>
          Browse Menu
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.filter(c => !['other'].includes(c.slug)).slice(0, 12).map(cat => (
            <Chip
              key={cat.id}
              label={cat.name}
              component={Link}
              to="/products"
              state={{ category: cat.slug }}
              clickable
              sx={{ fontSize: '0.85rem', px: 1, py: 2.5, borderRadius: '100px', border: '1px solid #d4859a', bgcolor: 'white', color: '#333', fontFamily: '"PT Serif"', '&:hover': { bgcolor: '#fcf5f6', border: '1px solid #b03160' } }}
            />
          ))}
        </Box>
      </Container>

      {/* Featured Products */}
      <Box sx={{ bgcolor: 'white', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
              Popular Items
            </Typography>
            <Button component={Link} to="/products" endIcon={<ArrowForward />} sx={{ color: '#b03160', textTransform: 'none', fontFamily: '"PT Serif"' }}>
              View All
            </Button>
          </Box>

          {!loading && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
              {featuredProducts.map(product => (
                <Card key={product.id} component={Link} to="/products" sx={{
                  textDecoration: 'none', borderRadius: 2, overflow: 'hidden', border: '1px solid #f0e8e8', boxShadow: 'none',
                  transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(176,49,96,0.1)' }
                }}>
                  <CardMedia component="img" height="140" image={product.image} alt={product.name} loading="lazy" sx={{ objectFit: 'cover' }} />
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.8rem', color: '#333', lineHeight: 1.2, mb: 0.5 }}>{product.name}</Typography>
                    <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '0.9rem' }}>
                      {product.variations?.[0]?.price ? `£${product.variations[0].price.toFixed(2)}` : ''}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* Why us */}
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' }, gap: 4, textAlign: 'center' }}>
          {[
            { emoji: '🍦', title: 'Fresh Daily', desc: 'Made to order with premium ingredients' },
            { emoji: '⚡', title: 'Fast Pickup', desc: 'Ready in 10-15 minutes' },
            { emoji: '🎁', title: 'Earn Rewards', desc: 'Loyalty points on every order' }
          ].map((item, i) => (
            <Box key={i}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>{item.emoji}</Typography>
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 0.5 }}>{item.title}</Typography>
              <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', fontSize: '0.85rem' }}>{item.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Container>

      <Snackbar open={showConfirmation} autoHideDuration={2500} onClose={() => setShowConfirmation(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setShowConfirmation(false)} severity="success">{addedItemName} added to cart</Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
