import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slice/productsSlice.jsx';
import OurPurpose from '../components/Home/OurPurpose.jsx';
import Carousel1 from '../components/Home/Carousel1.jsx';
import Carousel2 from '../components/Home/Carousel2.jsx';
import CoffeeBanner from '../components/Home/CoffeeBanner.jsx';
import OurNewsletter from '../components/Home/OurNewsletter.jsx';

function HomePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, []); 

  return (
    <>
      <CoffeeBanner/>
      <Carousel1 />
      <OurPurpose />
      <Carousel2 />
      <OurNewsletter />
    </>
  );
}

export default HomePage;