import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

const SEO = ({ title, description }: SEOProps) => {
  useEffect(() => {
    document.title = title 
      ? `${title} | Creamy Chills` 
      : 'Creamy Chills - Premium Desserts in Broxburn';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};

export default SEO;
