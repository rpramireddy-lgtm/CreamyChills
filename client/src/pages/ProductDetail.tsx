import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  flavors?: string[];
  toppings?: string[];
  inStock: boolean;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const response = await productsAPI.getById(id);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading product...</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Product not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={product.image || '/images/placeholder.jpg'}
            alt={product.name}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
              borderRadius: 2,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom>
            {product.name}
          </Typography>
          
          <Typography variant="h4" color="primary" gutterBottom>
            £{product.price.toFixed(2)}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            {product.description}
          </Typography>

          {product.flavors && product.flavors.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Flavors
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {product.flavors.map((flavor) => (
                    <Chip key={flavor} label={flavor} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {product.toppings && product.toppings.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Toppings
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {product.toppings.map((topping) => (
                    <Chip key={topping} label={topping} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            sx={{ mr: 2 }}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;