import React from 'react';

module.exports = (text) => {
  const arr = text.split(/(?:\r\n|\r|\n)/g);
  
  return (
    <span>
      {arr.map((item, index) => {
        return (<span key={index}>
          <p style={{margin: 0}}>{item}</p>
        </span>);
      })}
    </span>
  );
};
