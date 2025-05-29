'use client';

// import useGameStore from '@/store/gameStore'; // Will be used later

const PauseButton = () => {
  // const { togglePause, isPaused } = useGameStore((state) => ({
  //   togglePause: state.togglePause, // Assuming a togglePause action exists
  //   isPaused: state.isPaused
  // }));

  const handlePauseClick = () => {
    console.log('Pause button clicked - TODO: Implement pause functionality');
    // togglePause(); // This will be called later
  };

  return (
    <button
      onClick={handlePauseClick}
      className="fixed top-5 right-5 z-50 px-6 py-3 bg-pastel-yellow text-cinnamon-brown font-semibold rounded-lg shadow-md hover:bg-pastel-pink transition-colors duration-150"
    >
      {/* {isPaused ? 'Resume' : 'Pause'} // Text will change based on state later */}
      Pause (TODO)
    </button>
  );
};

export default PauseButton;
