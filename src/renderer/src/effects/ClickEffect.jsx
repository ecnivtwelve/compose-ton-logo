import React, { useState, useEffect } from 'react';

const ClickEffect = () => {
  const [clicks, setClicks] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const newClick = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };

      // Add the new click to state
      setClicks((prevClicks) => [...prevClicks, newClick]);
    };

    document.addEventListener('click', handleClick);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleAnimationEnd = (id) => {
    // Remove the element from DOM state after animation finishes
    setClicks((prevClicks) => prevClicks.filter((click) => click.id !== id));
  };

  return (
    <>
      <style>
        {`
          .click-effect {
            position: fixed;
            box-sizing: border-box;
            border-style: solid;
            border-color: #ffffff; /* Changed to black for visibility; change to #FFFFFF if on dark bg */
            border-radius: 50%;
            animation: clickEffect 0.4s ease-out;
            z-index: 999999999;
            pointer-events: none; /* Ensures the ring doesn't block actual clicks */
          }

          @keyframes clickEffect {
            0% {
              opacity: 1;
              width: 0.5em; height: 0.5em;
              margin: -0.25em;
              border-width: 0.5em;
            }
            100% {
              opacity: 0.2;
              width: 15em; height: 15em;
              margin: -7.5em;
              border-width: 0.03em;
            }
          }
        `}
      </style>
      {clicks.map((click) => (
        <div
          key={click.id}
          className="click-effect"
          style={{ top: click.y, left: click.x }}
          onAnimationEnd={() => handleAnimationEnd(click.id)}
        />
      ))}
    </>
  );
};

export default ClickEffect;