import { useEffect } from "react";
import { router } from "expo-router";

const Create = () => {
  useEffect(() => {
    router.replace("/tetris/createBoard");
  }, []); // The empty dependency array ensures this runs only once after the component mounts

  return null; // Render nothing as this component immediately navigates away
};

export default Create;
