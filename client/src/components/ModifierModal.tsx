import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Typography, Box, Button, Chip, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import { Close, Add, Remove } from '@mui/icons-material';
import { modifiersAPI } from '../services/api';
import { useCart } from '../context/CartContext';

interface Props {
  open: boolean;
  onClose: () => void;
  product: any;
  onAdded: (name: string) => void;
}

const ModifierModal: React.FC<Props> = ({ open, onClose, product, onAdded }) => {
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, any[]>>({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (open) {
      fetchModifiers();
      setSelected({});
      setQuantity(1);
    }
  }, [open]);

  const fetchModifiers = async () => {
    try {
      const res = await modifiersAPI.getAll();
      const allGroups = res.data || [];
      // If product has linked modifier groups, only show those. Otherwise show all.
      if (product?.modifierGroupIds?.length > 0) {
        setModifierGroups(allGroups.filter((g: any) => product.modifierGroupIds.includes(g._id)));
      } else {
        setModifierGroups(allGroups);
      }
    } catch (e) {}
  };

  const toggleModifier = (groupName: string, modifier: any, maxSelection: number) => {
    const current = selected[groupName] || [];
    const exists = current.find((m: any) => m.name === modifier.name);

    if (exists) {
      setSelected({ ...selected, [groupName]: current.filter((m: any) => m.name !== modifier.name) });
    } else if (current.length < maxSelection) {
      setSelected({ ...selected, [groupName]: [...current, modifier] });
    }
  };

  const isSelected = (groupName: string, modifierName: string) => {
    return (selected[groupName] || []).some((m: any) => m.name === modifierName);
  };

  const getExtrasTotal = () => {
    return Object.values(selected).flat().reduce((sum: number, m: any) => sum + (m.price || 0), 0);
  };

  const handleAddToCart = () => {
    const customizations = Object.entries(selected).flatMap(([group, mods]) =>
      mods.map((m: any) => ({ name: group, value: m.name, additionalPrice: m.price || 0 }))
    );

    const modifierNames = customizations.map(c => c.value).join(', ');
    const itemName = modifierNames ? `${product.name} (${modifierNames})` : product.name;

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${product._id}-${Date.now()}-${i}`,
        name: itemName,
        price: product.price,
        image: product.image,
        customizations
      });
    }

    onAdded(itemName);
    onClose();
  };

  if (!product) return null;

  const totalPrice = (product.price + getExtrasTotal()) * quantity;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ position: 'relative' }}>
        {product.image && (
          <Box component="img" src={product.image} sx={{ width: '100%', height: 200, objectFit: 'cover' }} />
        )}
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.3rem', mb: 0.5 }}>{product.name}</Typography>
        <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', fontSize: '0.9rem', mb: 2 }}>{product.description}</Typography>
        <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '1.1rem', mb: 3 }}>
          £{product.price.toFixed(2)}
        </Typography>

        {/* Allergens */}
        {product.allergens?.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {product.allergens.map((a: string) => (
              <Chip key={a} label={a} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            ))}
          </Box>
        )}

        {/* Modifier Groups */}
        {modifierGroups.map((group: any) => (
          <Box key={group._id} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.95rem' }}>{group.name}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>
                {group.isRequired ? 'Required' : 'Optional'} • Max {group.maxSelection}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {group.modifiers?.map((mod: any) => (
                <Chip
                  key={mod.name}
                  label={`${mod.name}${mod.price > 0 ? ` +£${mod.price.toFixed(2)}` : ''}`}
                  onClick={() => toggleModifier(group.name, mod, group.maxSelection)}
                  variant={isSelected(group.name, mod.name) ? 'filled' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: isSelected(group.name, mod.name) ? '#b03160' : 'transparent',
                    color: isSelected(group.name, mod.name) ? 'white' : '#333',
                    borderColor: '#d4859a',
                    '&:hover': { bgcolor: isSelected(group.name, mod.name) ? '#9e3a58' : '#fcf5f6' }
                  }}
                />
              ))}
            </Box>
          </Box>
        ))}

        {/* Quantity */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
          <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ border: '1px solid #ddd' }}>
            <Remove />
          </IconButton>
          <Typography sx={{ fontWeight: 600, fontSize: '1.2rem' }}>{quantity}</Typography>
          <IconButton onClick={() => setQuantity(Math.min(10, quantity + 1))} sx={{ border: '1px solid #ddd' }}>
            <Add />
          </IconButton>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleAddToCart}
          sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, borderRadius: '100px', py: 1.5, textTransform: 'none', fontFamily: '"PT Serif"', fontSize: '1rem', boxShadow: 'none' }}
        >
          Add to Cart — £{totalPrice.toFixed(2)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModifierModal;
