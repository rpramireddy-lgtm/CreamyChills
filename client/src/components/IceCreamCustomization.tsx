import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  IconButton,
} from '@mui/material';
import { Close, Add, Remove } from '@mui/icons-material';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  flavors?: string[];
}

interface IceCreamCustomizationProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (customizedProduct: any) => void;
}

const IceCreamCustomization: React.FC<IceCreamCustomizationProps> = ({
  open,
  onClose,
  product,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [containerType, setContainerType] = useState('cone');
  const [scoops, setScoops] = useState(1);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([product.flavors?.[0] || '']);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const handleFlavorChange = (index: number, flavor: string) => {
    const newFlavors = [...selectedFlavors];
    newFlavors[index] = flavor;
    setSelectedFlavors(newFlavors);
  };

  const handleScoopsChange = (newScoops: number) => {
    setScoops(newScoops);
    const newFlavors = Array(newScoops).fill('').map((_, i) => selectedFlavors[i] || product.flavors?.[0] || '');
    setSelectedFlavors(newFlavors);
  };

  const calculatePrice = () => {
    const basePrice = product.price;
    const containerPrice = containerType === 'tub' ? 1.00 : 0; // Tub costs extra £1
    const scoopPrice = (scoops - 1) * 1.50; // First scoop included, additional scoops cost £1.50
    const toppingsPrice = selectedToppings.length * 0.50;
    return basePrice + containerPrice + scoopPrice + toppingsPrice;
  };

  const handleAddToCart = () => {
    const customizations = [];
    
    // Add container customization
    if (containerType === 'tub') {
      customizations.push({
        name: 'Container',
        value: 'Tub',
        additionalPrice: 1.00
      });
    }
    
    // Add scoop customization
    if (scoops > 1) {
      customizations.push({
        name: 'Extra Scoops',
        value: `${scoops - 1} additional scoop${scoops > 2 ? 's' : ''}`,
        additionalPrice: (scoops - 1) * 1.50
      });
    }
    
    // Add toppings customizations
    selectedToppings.forEach(topping => {
      customizations.push({
        name: 'Topping',
        value: topping,
        additionalPrice: 0.50
      });
    });
    
    const customizedProduct = {
      id: `${product._id}-${Date.now()}`, // Unique ID for each customization
      name: `${product.name} (${containerType.toUpperCase()})`,
      price: product.price, // Base price only
      image: product.image,
      quantity,
      customizations,
    };
    
    onAddToCart(customizedProduct);
    onClose();
    
    // Reset state
    setQuantity(1);
    setContainerType('cone');
    setScoops(1);
    setSelectedFlavors([product.flavors?.[0] || '']);
    setSelectedToppings([]);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ position: 'relative' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100%',
              height: '150px',
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
              p: 2,
            }}
          >
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
              {product.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Container Type */}
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            Choose Container
          </FormLabel>
          <RadioGroup
            value={containerType}
            onChange={(e) => setContainerType(e.target.value)}
            row
          >
            <FormControlLabel 
              value="cone" 
              control={<Radio sx={{ color: '#e74c3c', '&.Mui-checked': { color: '#e74c3c' } }} />} 
              label="Cone (Included)" 
            />
            <FormControlLabel 
              value="tub" 
              control={<Radio sx={{ color: '#e74c3c', '&.Mui-checked': { color: '#e74c3c' } }} />} 
              label="Tub (+£1.00)" 
            />
          </RadioGroup>
        </FormControl>

        {/* Number of Scoops */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Number of Scoops</InputLabel>
          <Select
            value={scoops}
            label="Number of Scoops"
            onChange={(e) => handleScoopsChange(Number(e.target.value))}
          >
            <MenuItem value={1}>1 Scoop (Included)</MenuItem>
            <MenuItem value={2}>2 Scoops (+£1.50)</MenuItem>
            <MenuItem value={3}>3 Scoops (+£3.00)</MenuItem>
          </Select>
        </FormControl>

        {/* Add Toppings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
            Add Toppings
          </Typography>
          {['Chocolate Chips', 'Sprinkles', 'Nuts', 'Caramel Sauce', 'Chocolate Sauce', 'Whipped Cream'].map((topping) => (
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
                  onClick={() => {
                    if (selectedToppings.includes(topping)) {
                      setSelectedToppings(prev => prev.filter(t => t !== topping));
                    } else {
                      setSelectedToppings(prev => [...prev, topping]);
                    }
                  }}
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
              Total: £{(calculatePrice() * quantity).toFixed(2)}
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
            Add to Cart - £{(calculatePrice() * quantity).toFixed(2)}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default IceCreamCustomization;