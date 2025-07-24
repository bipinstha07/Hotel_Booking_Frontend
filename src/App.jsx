import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Rooms from './components/Rooms';
import Amenties from './components/Amenties';
import BookRoom from './components/BookRoom';

function App() {
  return (
    <div>
      <Header/>
      <Hero />
      <Rooms />
      <Amenties />
     
    </div>
  );
}

export default App;