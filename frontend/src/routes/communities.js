import React from 'react';
import Header from '../modules/header';
import Main from '../modules/main';
import Footer from '../modules/footer';

export default function Index(props) {
  return (
    <>
      <Header {...props} />
      <Main {...props}>
        <h2>Communities</h2>
      </Main>
      <Footer />
    </>
  );
}
