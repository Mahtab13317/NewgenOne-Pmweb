import React from "react";

import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import reducers from "../../../../redux-store/reducers/reducers";
import { BrowserRouter as Router } from "react-router-dom";
import thunk from "redux-thunk";

const CustomTestComponent = ({ children }) => {
  const store = createStore(reducers, applyMiddleware(thunk));
  return (
    <Provider store={store}>
      <Router>{children}</Router>
    </Provider>
  );
};

export default CustomTestComponent;
