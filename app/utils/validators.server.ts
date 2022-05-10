export const validateEmail = (email: string): string | undefined => {
  const validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!email.length || !validRegex.test(email)) {
    return "please enter a valid email adress";
  }
};

export const validatePassword = (password: string): string | undefined => {
  if (password.length < 5) {
    return "Password must be at least 5 characters";
  }
};
export const validateUserName = (username: string): string | undefined => {
  if (username.length < 3) return "Username must be at least 3 characters";
};
