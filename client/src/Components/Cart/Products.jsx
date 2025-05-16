import React, { useState, useEffect, useContext } from 'react';
import { userContextObj } from '../../Contexts/UserContext';
import Product from './Product';
import axios from 'axios';
import { getBaseUrl } from '../../utils/config';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const { currentUser } = useContext(userContextObj);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${getBaseUrl()}/product-api/product`)
      .then((res) => {
        setProducts(res.data.payload);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Some Error occurred", err);
        setLoading(false);
      });
  }, []);

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      !searchTerm || 
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => 
      categoryFilter === 'all' || product.category === categoryFilter
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
      return 0;
    });

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Nutrition Products</h1>
        <p>High-quality supplements to support your fitness journey</p>
      </div>

      <div className="products-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <i className="bi bi-search search-icon"></i>
        </div>

        <div className="filter-controls">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-filter"
          >
            <option value="default">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="products-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <i className="bi bi-search"></i>
              <p>No products match your search</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div className="product-cell" key={product._id || product.id}>
                  <Product p={product} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;