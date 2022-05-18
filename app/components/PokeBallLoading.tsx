import Lottie from "lottie-react";
import pokeball from "~/assets/pokeballLoading.json";

export const PokeballLoading = () => {
  return <Lottie animationData={pokeball} />;
};
