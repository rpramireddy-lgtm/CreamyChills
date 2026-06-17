import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, TextField, InputAdornment } from '@mui/material';
import { CloudUpload, Search, CheckCircle } from '@mui/icons-material';
import { imagesAPI } from '../../services/api';

interface Props {
  value: string; // current image URL
  onChange: (url: string) => void;
}

const ImagePicker: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (open) fetchImages();
  }, [open]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await imagesAPI.getAll();
      setImages(res.data.images || []);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const res = await imagesAPI.upload(file);
        onChange(res.data.url);
      }
      fetchImages();
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const filteredImages = images.filter(img =>
    !search || img.filename?.toLowerCase().includes(search.toLowerCase()) || img.key?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Preview + Select Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {value ? (
          <Box sx={{ position: 'relative', width: 100, height: 100, borderRadius: 2, overflow: 'hidden', border: '2px solid #d4859a' }}>
            <Box component="img" src={value} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.src = '/images/placeholder.jpg'; }} />
          </Box>
        ) : (
          <Box sx={{ width: 100, height: 100, borderRadius: 2, border: '2px dashed #d4859a', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fcf5f6' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#999', textAlign: 'center', px: 1 }}>No image</Typography>
          </Box>
        )}
        <Box>
          <Button variant="contained" size="small" onClick={() => setOpen(true)} sx={{ bgcolor: '#b03160', textTransform: 'none', borderRadius: '100px', mb: 1, display: 'block', '&:hover': { bgcolor: '#9e3a58' } }}>
            {value ? 'Change Image' : 'Select Image'}
          </Button>
          {value && (
            <Button size="small" onClick={() => onChange('')} sx={{ textTransform: 'none', color: '#999', fontSize: '0.75rem' }}>Remove</Button>
          )}
        </Box>
      </Box>

      {/* Image Library Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500 }}>Image Library</Typography>
          <Button variant="contained" component="label" size="small" startIcon={<CloudUpload />} sx={{ bgcolor: '#b03160', textTransform: 'none', borderRadius: '100px' }}>
            Upload
            <input type="file" hidden accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => e.target.files && handleUpload(e.target.files)} />
          </Button>
        </DialogTitle>

        <DialogContent>
          {/* Drag & Drop Zone */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            sx={{
              border: dragOver ? '3px dashed #b03160' : '3px dashed #e0e0e0',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              mb: 3,
              bgcolor: dragOver ? '#fcf5f6' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            {uploading ? (
              <CircularProgress size={24} sx={{ color: '#b03160' }} />
            ) : (
              <>
                <CloudUpload sx={{ fontSize: 32, color: dragOver ? '#b03160' : '#ccc', mb: 1 }} />
                <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                  Drag & drop images here or click Upload above
                </Typography>
                <Typography sx={{ color: '#999', fontSize: '0.75rem', mt: 0.5 }}>
                  JPEG, PNG, WebP • Max 5MB
                </Typography>
              </>
            )}
          </Box>

          {/* Search */}
          <TextField
            fullWidth size="small" placeholder="Search images..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment> }}
            sx={{ mb: 2 }}
          />

          {/* Image Grid */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1.5, maxHeight: 400, overflow: 'auto' }}>
              {filteredImages.map((img: any) => {
                const isSelected = value === img.url;
                return (
                  <Box
                    key={img.key || img.filename}
                    onClick={() => { onChange(img.url); setOpen(false); }}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '100%',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: isSelected ? '3px solid #b03160' : '2px solid #e0e0e0',
                      '&:hover': { border: '2px solid #b03160', opacity: 0.9 }
                    }}
                  >
                    <Box component="img" src={img.url} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isSelected && (
                      <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                        <CheckCircle sx={{ color: '#b03160', fontSize: 20, bgcolor: 'white', borderRadius: '50%' }} />
                      </Box>
                    )}
                  </Box>
                );
              })}
              {filteredImages.length === 0 && !loading && (
                <Typography sx={{ gridColumn: '1/-1', textAlign: 'center', py: 4, color: '#999' }}>
                  {search ? 'No images match your search' : 'No images uploaded yet. Drag & drop to upload.'}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImagePicker;
