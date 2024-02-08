const theme = {
  main: "#F46A0F",
  mainLight: "#F36A10",
  // main: "#038003",
  // mainLight: "#00ed00",
  sidebar: "#222222",
  //   sidebar: "blue",
};
const customStyles = {
  selected: {
    color: "#F36A10",
  },
  selectedUnderline: { borderBottom: `3px solid ${theme.main}` },
  btn: {
    flex: 1,
    background: "#FFFFFF",
    color: theme.main,
    borderColor: theme.main,
    fontSize: 12,
  },
  btn1: {
    flex: 1,
    background: "#FFFFFF",
    color: "#000000",
    borderColor: "lightgrey",
    fontSize: 12,
  },
  btnFilled: {
    // flex: 1,
    background: "#0072C6",
    color: "#FFFFFF",
    fontSize: 12,
  },
  btnDisabled: {
    // background: theme.main,
    background: "#C4C4C4",
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 1,
  },
  inputTextColor: { color: "#000000" },
  formLabel: { fontSize: 12, color: "#686868" },
  formInnerHeading: {
    color: theme.mainLight,
    fontSize: "12px",
    marginBottom: 12,
    marginTop: 12,
  },
  containerBox: {
    height: 629,
    backgroundColor: "white",
    marginTop: 15,
    border: "1px solid #D4D4D4",
    borderRadius: 4,
  },
  TableHead: {
    color: "#B9B9B9",
    opacity: 1,
    fontSize: 12,
    fontWeight: 600,
  },
  TableItem: {
    color: "#000000",
    opacity: 1,
    fontSize: 12,
    height: 40,
  },
};
export default customStyles;
