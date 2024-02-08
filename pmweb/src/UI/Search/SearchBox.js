
import React, { useState } from 'react';
import IconsButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  search: {
    position: 'relative',
    // borderRadius: theme.shape.borderRadius,
    // backgroundColor: fade(theme.palette.common.white, 0.15),
    // '&:hover': {
    //   backgroundColor: fade(theme.palette.common.white, 0.25),
    // },
    backgroundColor: 'rgba(173,173,173,0.2)', // same as #ADADAD at 20% opacity
    borderRadius: '2px',
    marginLeft: 0,
    display: "flex",
    width: '100%',
    height : '28px',
    maxWidth: "250px",
    [theme.breakpoints.up('sm')]: {
      marginLeft: '50px',
      width: 'auto',
    },
  },
  svgIconSmall : {
    fontSize : '1.12rem',
  },
  searchIcon: {
    //padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  inputRoot: {
    color: '#808080',
    opacity : '100%',
    fontFamily : 'Open Sans',
    width : '100%'
  },
  inputInput: {
    padding: '9px 8px 7px 0px',
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(3)}px)`,
    transition: theme.transitions.create('width'),
    fontSize : '11px',
    // [theme.breakpoints.up('sm')]: {
    //   width: '13ch',
    //   '&:focus': {
    //     width: '13ch',
    //   },
    // },
  },
}));
const SearchBox = (props) => {

  const {
    clearSearchResult = null,
  } = props;

  const classes = useStyles();
  const { size = "medium" } = props;
  const [searchValue, setSearchValue] = useState("");
  const onChangeHandler = (e) => {
    setSearchValue(e.target.value);
  }
  const cancelHandler = () => {
    setSearchValue("");
    if (clearSearchResult != null)
      clearSearchResult();
  }
  return (
    <div className={classes.search} style={{ width: size === "small" ? "20ch" : size === "large" ? "35ch" : "25ch"  , ...props.style}}>
      <div className={classes.searchIcon}>
          {props.searchIconAlign === 'left' ? 
            <IconsButton type="SearchIcon" >
              <SearchIcon fontSize = 'small' classes = {{fontSizeSmall : classes.svgIconSmall}}/>
            </IconsButton>
            : null}
          {props.cancelIconAlign === 'left' ? 
            ((searchValue !== "") ? 
              <div className={classes.cancelIcon}>
                <IconsButton type="CancelIcon" onClick={cancelHandler} >
                  <CancelIcon fontSize = 'small' classes = {{fontSizeSmall : classes.svgIconSmall}}/>
                </IconsButton>
              </div>
              : null)
            : null}        
      </div>
      <InputBase
        placeholder= {props.placeholder}
        value={searchValue}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        name={props.name}
        inputProps={{ 'aria-label': 'search' }}
        onChange={onChangeHandler}
      />
      {props.searchIconAlign === 'right' ? 
        <IconsButton type="SearchIcon" >
          <SearchIcon fontSize = 'small' classes = {{fontSizeSmall : classes.svgIconSmall}}/>
        </IconsButton>
        : null}
      {props.cancelIconAlign === 'right' ? 
        ((searchValue !== "") ? 
          <div className={classes.cancelIcon}>
            <IconsButton type="CancelIcon" onClick={cancelHandler} >
              <CancelIcon fontSize = 'small' classes = {{fontSizeSmall : classes.svgIconSmall}}/>
            </IconsButton>
          </div>
          : null)
        : null}

    </div>

  );
}

export default SearchBox;

      // <TextField
      //       id="outlined-basic"
      //       placeholder="Search"
      //       variant="outlined"
      //       style={{maxWidth:"150px"}}
      //       size="small"
      //       InputProps={{
      //         endAdornment: (
      //           <InputAdornment position="end">
      //             <IconsButton type="SearchIcon"  />
      //           </InputAdornment>
      //         )
      //       }}
      //     />