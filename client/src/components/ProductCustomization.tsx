import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  IconButton,
  Paper,
  Chip,
} from '@mui/material';
import { Close, Add, Remove } from '@mui/icons-material';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  toppings?: string[];
  flavors?: string[];
  customizations?: Array<{
    name: string;
    options: string[];
    additionalPrice: number;
  }>;
  sizes?: Array<{
    name: string;
    price: number;
  }>;
}

interface ProductCustomizationProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (customizedProduct: any) => void;
}

const ProductCustomization: React.FC<ProductCustomizationProps> = ({
  open,
  onClose,
  product,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<{[key: string]: string[]}>({});

  const handleToppingChange = (topping: string) => {
    setSelectedToppings(prev => 
      prev.includes(topping) 
        ? prev.filter(t => t !== topping)
        : [...prev, topping]
    );
  };

  const handleCustomizationChange = (customizationName: string, option: string) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [customizationName]: prev[customizationName]?.includes(option)
        ? prev[customizationName].filter(o => o !== option)
        : [...(prev[customizationName] || []), option]
    }));
  };

  const calculateTotalPrice = () => {
    let basePrice = selectedSize 
      ? product.sizes?.find(s => s.name === selectedSize)?.price || product.price
      : product.price;
    
    let toppingsPrice = selectedToppings.length * 0.50;
    
    let customizationsPrice = 0;
    Object.entries(selectedCustomizations).forEach(([customizationName, options]) => {
      const customization = product.customizations?.find(c => c.name === customizationName);
      if (customization) {
        customizationsPrice += options.length * customization.additionalPrice;
      }
    });

    return (basePrice + toppingsPrice + customizationsPrice) * quantity;
  };

  const handleAddToCart = () => {
    const customizations = [];
    
    // Add size customization
    if (selectedSize) {
      const sizeOption = product.sizes?.find(s => s.name === selectedSize);
      if (sizeOption && sizeOption.price !== product.price) {
        customizations.push({
          name: 'Size',
          value: selectedSize,
          additionalPrice: sizeOption.price - product.price
        });
      }
    }
    
    // Add toppings customizations
    selectedToppings.forEach(topping => {
      customizations.push({
        name: 'Topping',
        value: topping,
        additionalPrice: 0.50
      });
    });
    
    // Add custom options
    Object.entries(selectedCustomizations).forEach(([customizationName, options]) => {
      const customization = product.customizations?.find(c => c.name === customizationName);
      if (customization) {
        options.forEach(option => {
          customizations.push({
            name: customizationName,
            value: option,
            additionalPrice: customization.additionalPrice
          });
        });
      }
    });
    
    const basePrice = selectedSize 
      ? product.sizes?.find(s => s.name === selectedSize)?.price || product.price
      : product.price;
    
    const customizedProduct = {
      id: `${product._id}-${Date.now()}`, // Unique ID for each customization
      name: product.name + (selectedFlavor ? ` (${selectedFlavor})` : '') + (selectedSize ? ` - ${selectedSize}` : ''),
      price: basePrice, // Base price only, customizations handled separately
      image: product.image,
      quantity,
      customizations,
    };
    
    onAddToCart(customizedProduct);
    onClose();
    
    // Reset state
    setQuantity(1);
    setSelectedToppings([]);
    setSelectedFlavor('');
    setSelectedSize('');
    setSelectedCustomizations({});
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ position: 'relative' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
            }}
          />
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' },
            }}
          >
            <Close />
          </IconButton>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              p: 3,
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
              {product.name}
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
              {product.description}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Choose Size
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {product.sizes.map((size) => (
                <Box key={size.name} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                  <Paper
                    onClick={() => setSelectedSize(size.name)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedSize === size.name ? '2px solid #e74c3c' : '1px solid #e0e0e0',
                      bgcolor: selectedSize === size.name ? '#fff5f5' : 'white',
                      '&:hover': { bgcolor: '#f8f9fa' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {size.name}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#e74c3c', fontWeight: 700 }}>
                        £{size.price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Flavors */}
        {product.flavors && product.flavors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Choose Flavor
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {product.flavors.map((flavor) => (
                <Chip
                  key={flavor}
                  label={flavor}
                  onClick={() => setSelectedFlavor(flavor)}
                  variant={selectedFlavor === flavor ? 'filled' : 'outlined'}
                  color={selectedFlavor === flavor ? 'primary' : 'default'}
                  sx={{
                    '&.MuiChip-filled': {
                      bgcolor: '#e74c3c',
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Toppings - Always show for all categories */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Add Toppings
          </Typography>
          {['Chocolate Chips', 'Sprinkles', 'Nuts', 'Caramel Sauce', 'Chocolate Sauce', 'Whipped Cream', 'Fresh Berries', 'Crushed Cookies'].map((topping) => (
            <Box
              key={topping}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                mb: 1,
                bgcolor: selectedToppings.includes(topping) ? '#fff5f5' : 'white',
                borderRadius: 2,
                border: selectedToppings.includes(topping) ? '2px solid #e74c3c' : '1px solid #e0e0e0',
              }}
            >
              <Typography variant="body1">{topping}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ color: '#e74c3c', fontWeight: 700 }}>
                  +£0.50
                </Typography>
                <Button
                  variant={selectedToppings.includes(topping) ? 'outlined' : 'contained'}
                  size="small"
                  startIcon={selectedToppings.includes(topping) ? <Remove /> : <Add />}
                  onClick={() => handleToppingChange(topping)}
                  sx={{
                    bgcolor: selectedToppings.includes(topping) ? 'transparent' : '#e74c3c',
                    color: selectedToppings.includes(topping) ? '#e74c3c' : 'white',
                    borderColor: '#e74c3c',
                    '&:hover': { 
                      bgcolor: selectedToppings.includes(topping) ? '#fff5f5' : '#c0392b',
                      borderColor: '#e74c3c'
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {selectedToppings.includes(topping) ? 'Remove' : 'Add'}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Custom Options */}
        {product.customizations && product.customizations.map((customization) => (
          <Box key={customization.name} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {customization.name}
            </Typography>
            <FormGroup>
              {customization.options.map((option) => (
                <Paper
                  key={option}
                  sx={{
                    p: 1,
                    mb: 1,
                    border: selectedCustomizations[customization.name]?.includes(option) 
                      ? '2px solid #e74c3c' : '1px solid #e0e0e0',
                    bgcolor: selectedCustomizations[customization.name]?.includes(option) 
                      ? '#fff5f5' : 'white',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCustomizations[customization.name]?.includes(option) || false}
                        onChange={() => handleCustomizationChange(customization.name, option)}
                        sx={{
                          color: '#e74c3c',
                          '&.Mui-checked': { color: '#e74c3c' },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2">{option}</Typography>
                        <Typography variant="body2" sx={{ color: '#e74c3c', fontWeight: 600 }}>
                          +£{customization.additionalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              ))}
            </FormGroup>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Quantity */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quantity
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              sx={{ bgcolor: '#f8f9fa' }}
            >
              <Remove />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: '40px', textAlign: 'center' }}>
              {quantity}
            </Typography>
            <IconButton
              onClick={() => setQuantity(quantity + 1)}
              sx={{ bgcolor: '#f8f9fa' }}
            >
              <Add />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Total: £{calculateTotalPrice().toFixed(2)}
            </Typography>
          </Box>
          <Button
            onClick={handleAddToCart}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              bgcolor: '#e74c3c',
              '&:hover': { bgcolor: '#c0392b' },
              borderRadius: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Add to Cart - £{calculateTotalPrice().toFixed(2)}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCustomization;