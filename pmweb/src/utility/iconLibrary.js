const importAll = (r) => {
  return {
    images: r.keys().map(r),
    names: r.keys().map((el) => {
      let str = el.replace("./", "");
      str = str.replace(".svg", "");
      return str;
    }),
  };
};

export const listOfImages = importAll(
  require.context("../assets/IconsLibrary/", false, /\.(png|jpe?g|svg)$/)
);
