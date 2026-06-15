import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Chip, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ModifierModal from '../components/ModifierModal';
import SEO from '../components/SEO';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addedName, setAddedName] = useState('');

  useEffect(() => {
    if (id) {
      productsAPI.getById(id).then(res => setProduct(res.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 8 }}><Typography>Loading...</Typography></Box>;
  if (!product) return <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h5">Product not found</Typography></Box>;

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 4 }}>
      <SEO title={product.name} description={product.description} />
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Box
              component="img"
              src={product.image || '/images/placeholder.jpg'}
              alt={product.name}
              sx={{ width: '100%', height: { xs: 250, md: 400 }, objectFit: 'cover', borderRadius: 2 }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.8rem', color: '#333', mb: 1 }}>
              {product.name}
            </Typography>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '1.4rem', mb: 2 }}>
              £{product.price.toFixed(2)}
            </Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', lineHeight: 1.7, mb: 3 }}>
              {product.description}
            </Typography>

            {product.allergens?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, mb: 1 }}>Allergens:</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {product.allergens.map((a: string) => (
                    <Chip key={a} label={a} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {product.preparationTime && (
              <Typography sx={{ fontSize: '0.85rem', color: '#999', mb: 3 }}>
                ⏱ Estimated preparation: {product.preparationTime} mins
              </Typography>
            )}

            {product.sizes?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, mb: 1 }}>Available sizes:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {product.sizes.map((s: any) => (
                    <Chip key={s.name} label={`${s.name} — £${s.price.toFixed(2)}`} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setModalOpen(true)}
              disabled={!product.inStock}
              sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', py: 1.5, boxShadow: 'none', fontSize: '1rem' }}
            >
              {product.inStock ? 'Add to Cart' : 'Sold Out'}
            </Button>
          </Box>
        </Box>
      </Container>

      <ModifierModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={product}
        onAdded={(name) => setAddedName(name)}
      />
    </Box>
  );
};

export default ProductDetail;
