import { useContext, useEffect, useState } from 'react'
import { userContextObj } from '../../Contexts/UserContext'
import {useUser} from '@clerk/clerk-react'
import {useNavigate} from 'react-router-dom'
import heroImage from "../../assets/image.png";
import axios from 'axios'
import './Home.css'

function Home() {
  const {currentUser , setCurrentUser}=useContext(userContextObj)
  // console.log(currentUser)
  const {isSignedIn , user , isLoaded}=useUser()
  const [error , setError]=useState("")
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([
    { id: 1, name: "Premium Package", price: "$99.99", image: "https://via.placeholder.com/300" },
    { id: 2, name: "Standard Package", price: "$49.99", image: "https://via.placeholder.com/300" },
    { id: 3, name: "Basic Package", price: "$29.99", image: "https://via.placeholder.com/300" }
  ])

  useEffect(()=>{
    
    if (isSignedIn === true){
      axios.get(`http://localhost:4000/user-api/users/${user?.emailAddresses[0].emailAddress}`)
      .then((rep) => {
        if (rep.data.message === "User Not Found") {
          setCurrentUser({
            ...currentUser,
            firstName:user?.firstName,
            lastName:user?.lastName,
            email:user?.emailAddresses[0].emailAddress,
            profileImageUrl:user?.imageUrl
          })
          
        } else {
          setCurrentUser(rep.data.payload)
        }
        // console.log(currentUser)
      })
      .catch(err=>console.log("Some Error occured", err))
      
      
    }
  },[isLoaded])

  const handleViewProducts = () => {
    navigate('/products');
  }

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our Platform</h1>
          <p>Discover the best products and services tailored for you</p>
          <button className="cta-button" onClick={handleViewProducts}>Explore Products</button>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="" />
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Products</h2>
        <div className="featured-products">
          {featuredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="price">{product.price}</p>
              <button className="view-button" onClick={() => navigate(`/products/${product.id}`)}>View Details</button>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>About Us</h2>
          <p>We provide high-quality products and services to meet your needs. Our mission is to deliver exceptional value to our customers through innovation and excellence.</p>
          {!isSignedIn && (
            <div className="cta-container">
              <button className="secondary-button" onClick={() => navigate('/signup')}>Sign Up Now</button>
              <button className="text-button" onClick={() => navigate('/signin')}>Already have an account? Sign In</button>
            </div>
          )}
        </div>
      </section>

      <section className="testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials">
          <div className="testimonial-card">
            <div className="quote">"The products exceeded my expectations. Great quality and service!"</div>
            <div className="author">- Jane Doe</div>
          </div>
          <div className="testimonial-card">
            <div className="quote">"I've been a loyal customer for years. Their plans are the best in the market."</div>
            <div className="author">- John Smith</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home