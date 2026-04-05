import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  return (
    <motion.div 
      className="card" 
      style={{ position: 'relative' }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {product.offer_label && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}>
          <span className="badge">{product.offer_label}</span>
        </div>
      )}
      <Link to={`/product/${product.id}`}>
        <img 

          src={product.image_url?.trim() ? product.image_url : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220px%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23333333%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'}
          onError={(e) => { e.target.onerror = null; e.target.src="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220px%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23333333%22%3EBroken%20Image%3C%2Ftext%3E%3C%2Fsvg%3E"; }}
          alt={product.name} 
          className="card-img"
        />
      </Link>
      <div className="card-body">
        <Link to={`/product/${product.id}`}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </h3>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {product.discount_price ? (
              <>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{product.discount_price}</span>
                <span style={{ fontSize: '0.875rem', textDecoration: 'line-through', color: 'gray', marginLeft: '0.5rem' }}>₹{product.price}</span>
              </>
            ) : (
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{product.price}</span>
            )}
          </div>
          <Link to={`/product/${product.id}`} className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
