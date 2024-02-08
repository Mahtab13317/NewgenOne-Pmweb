import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import arabicStyles from "./ArabicStyles.module.css";
import { RTL_DIRECTION } from "../../Constants/appConstants";
import { MDMtoProcessDesignerVarTypes } from "../../components/DataModel/BusinessVariables/PrimaryVariables/TypeAndFieldMapping";
import {
  Checkbox,
  InputBase,
  MenuItem,
  Icon,
  Popover,
  Tooltip,
  useMediaQuery,
} from "@material-ui/core";
import clsx from "clsx";
import Modal from "../../UI/Modal/Modal";
import VariableProperties from "../../components/DataModel/BusinessVariables/PrimaryVariables/VariableProperties";
import IntegerIcon from "../../assets/DataModalIcons/DM_Integer.svg";
import FloatIcon from "../../assets/DataModalIcons/DM_Float.svg";
import DateIcon from "../../assets/DataModalIcons/DM_Date.svg";
import StringIcon from "../../assets/DataModalIcons/DM_String.svg";
import LongIcon from "../../assets/DataModalIcons/DM_Long.svg";
import ComplexIcon from "../../assets/DataModalIcons/VT_Complex.svg";
import { useRef } from "react";
import { FieldValidations } from "../../utility/FieldValidations/fieldValidations";
import CustomizedDropdown from "../Components_With_ErrrorHandling/Dropdown";
import { LightTooltip } from "../StyledTooltip";

function TypeAndFieldMapping(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [variableTypeOptions, setVariableTypeOptions] = useState([]);
  const [isComplexTypeSelected, setIsComplexTypeSelected] = useState(false);
  const {
    varData,
    microProps,
    modifyVariableData,
    setdataObjectTemplates,
    bForDisabled,
    autofocusInput,
    componentStyles,
    handleAliasName,
    aliasName,
    variableType,
    handleVariableType,
    dataField,
    handleDataType,
    dataObjectTemplates,
    dataTypeOptions,
    localLoadedProcessData,
    isEditable,
  } = props;
  const aliasRef = useRef(null);
  const isTabScreen = useMediaQuery("(max-width: 850px)");

  const menuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
  };

  useEffect(() => {
    let complexVariableTypes = [];
    let finalVariableTypes = [
      { value: "3", label: "Integer", icon: IntegerIcon },
      { value: "4", label: "Long", icon: LongIcon },
      { value: "6", label: "Float", icon: FloatIcon },
      { value: "8", label: "Date", icon: DateIcon },
      { value: "10", label: "String", icon: StringIcon },
      { value: "11", label: "User Defined", icon: null },
    ];
    if (
      localLoadedProcessData.ComplexVarDefinition &&
      localLoadedProcessData.ComplexVarDefinition.length > 0
    ) {
      complexVariableTypes = localLoadedProcessData.ComplexVarDefinition;
    }
    complexVariableTypes &&
      complexVariableTypes.length > 0 &&
      complexVariableTypes.forEach((element) => {
        const complexObj = {
          value: `C_${element.TypeId}`,
          label: element.TypeName,
          icon: ComplexIcon,
        };
        //finalVariableTypes.push(complexObj);
      });
    setVariableTypeOptions(finalVariableTypes);
  }, []);

  useEffect(() => {
    if (variableType.includes("C") === true) {
      setIsComplexTypeSelected(true);
    } else {
      setIsComplexTypeSelected(false);
    }
  }, [variableType]);
  const [open, setopen] = useState(false);
  const handleClose = () => {
    setAnchorElMF(null);
    setopen(false);
  };
  const [anchorElMF, setAnchorElMF] = React.useState(null);

  const handleTypeChangeMF = (event) => {
    setopen(true);
    setAnchorElMF(event?.currentTarget);
  };

  useEffect(() => {
    if (!!props.inputStrip) {
      if (variableType !== "11" && props.arrayType && !!variableType) {
        microAppsHandler(null, "primitiveArray");
      }
    }
  }, [props.arrayType, props.inputStrip, variableType]);

  const addTemplate = (data) => {
    setdataObjectTemplates((prev) => {
      let temp = [...prev];
      temp.push({
        id: +data.data.id,
        template_name: data.data.template_name,
        alias_name: data.data.template_name,
        name: data.data.template_name.split(" ").join("_"),
        description: data.data.description,
      });
      return temp;
    });
  };

  const microAppsHandler = (e, param) => {
    let temp = { ...microProps };
    if (param === "Y" || param === "N") {
      temp.use_existing = param;
    } else if (param === "data_source" || param === "system") {
      temp.upload = param; // data_source/system

      temp.use_existing = "N";
    } else if (param === "template") {
      temp.new_template = true;
      temp.Component = "TemplateMF";
      temp.use_existing = "N";
      temp.Renderer = "renderTemplateMF";
      temp.Callback = addTemplate;
    } else if (param === "primitiveArray") {
      temp.source = "PD_ARR";
      temp.Component = "DataModelDesignerViewer";
      temp.Renderer = "renderDataModelDesignerViewer";
      let tempArr = [
        {
          name: "mapid",
          alias: "mapid",
          type: "1",
          key_field: false,
          id: 0,
        },
        {
          name: aliasName.split(" ").join("_"),
          alias: aliasName,
          type: MDMtoProcessDesignerVarTypes(variableType),
          key_field: false,
        },
        {
          name: "insertionorderid",
          alias: "insertionorderid",
          type: "3",
          key_field: true,
          auto_generated_enabled: true,
          identity: true,
        },
      ];
      temp.default_data_fields = [];
      temp.default_data_fields = [...tempArr];
      temp.arr_type_do = "Y";
    }
    if (props.arrayType && param !== "primitiveArray") {
      let tempArr = [
        {
          name: "mapid",
          alias: "mapid",
          type: "1",
          key_field: false,
          id: 0,
        },

        {
          name: "insertionorderid",
          alias: "insertionorderid",
          type: "3",
          key_field: true,
          auto_generated_enabled: true,
          identity: true,
        },
      ];

      temp.default_data_fields = [];

      temp.default_data_fields = [...tempArr];
      temp.arr_type_do = "Y";
    }
    if (param === "existingTemplate") {
      temp["template_id"] = e;
      temp.use_existing = "N";
    }
    // else {
    //   microProps.unbounded = "N";
    // }

    // setmicroProps(temp);

    window.MdmDataModelPMWEB(temp);
    handleClose();
  };

  const modifyMethod = (data) => {
    modifyVariableData(data);
  };

  const openModifyMF = () => {
    let microMFProps = {
      source: "PD_CMP", //PD_EXT
      template_id: "",
      // "use_existing":"Y",
      data_object_alias_name: varData?.dataField.split("_").join(" "), // Mandatory in props in PD_EXT
      data_object_name: varData?.dataField, // Mandatory in props in PD_EXT
      data_object_id: +varData?.dataObjectId,
      object_id: localLoadedProcessData.ProcessDefId,
      object_type: "P", //AP/P/C

      // parent_do: [
      //   {
      //     name: "WFINSTRUMENTTABLE",
      //     rel_do_id: "-1",
      //     relations: [
      //       {
      //         mapped_do_field: "ProcessInstanceID",
      //         base_do_field_id: 1,
      //         base_do_field: "itemindex",
      //       },
      //     ],
      //     status: 4,
      //   },
      // ],
      // default_data_fields: [
      //   //PD_EXT    // Mandatory
      //   {
      //     name: "itemindex",
      //     id: 1,
      //     alias: "itemindex",
      //     type: "2",
      //     key_field: true,
      //     auto_generated_enabled: true,
      //     identity: true,
      //   },
      // ],

      ContainerId: "pmweb_dataModifyContainer",
      Module: "MDM",

      Component: "DataModelListViewer",

      InFrame: false,

      Renderer: "renderDataModelListViewer",

      Callback: modifyMethod,

      // auto_generate_table: true,

      data_types: [1, 2, 3, 4, 5, 8, 9, 10],
    };
    window.MdmDataModelPMWEB(microMFProps);
  };

  const getVariableTypeFromVarNumber = (num) => {
    let temp = "";
    variableTypeOptions.forEach((varType) => {
      if (varType.value === num + "") temp = varType.label;
    });
    return temp;
  };

  const complexOptions = [
    { paramType: "N", label: t("createDataObject") },
    { paramType: "Y", label: t("copyAvailableDataObject") },
    { paramType: "system", label: t("uploadFromMyComputer") },
    { paramType: "data_source", label: t("importFromDataSource") },
  ];

  const replaceSpaceToUnderScore = (str) => {
    return str.replaceAll(" ", "_");
  };

  return (
    <div className={componentStyles.mainDiv} style={props.style}>
      <div
        style={{
          display: "none",
        }}
        id="pmweb_dataObjectContainer"
      ></div>
      <div
        style={{
          display: "none",
        }}
        id="pmweb_dataModifyContainer"
      ></div>
      <label
        htmlFor={`pmweb_type_field_mapping_input_aliasName_${aliasName}`}
        className="pmweb_sr_only"
      >
        {/**code added for bug id 136265 */}

        {aliasName || t("aliasName")}
      </label>
      {/* Changes on 07-09-2023 to resolve the bug Id 135573  */}
      {!isEditable ? (
        <LightTooltip
          id="section_Tooltip"
          arrow={true}
          enterDelay={500}
          placement="bottom-start"
          title={aliasName}
        >
          <InputBase
            disabled={bForDisabled}
            readOnly={props?.newField ? !props.newField : !isEditable}
            inputProps={{
              id: `pmweb_type_field_mapping_input_aliasName_${aliasName}`,
            }}
            className={
              direction === RTL_DIRECTION
                ? componentStyles.inputbaseRtl
                : componentStyles.inputbaseLtr
            }
            autoFocus={autofocusInput}
            variant="outlined"
            onChange={handleAliasName}
            value={aliasName}
            inputRef={aliasRef}
            onKeyPress={(e) => FieldValidations(e, 102, aliasRef.current, 50)}
          />
        </LightTooltip>
      ) : (
        <InputBase
          disabled={bForDisabled}
          readOnly={props?.newField ? !props.newField : !isEditable}
          inputProps={{
            id: `pmweb_type_field_mapping_input_aliasName_${aliasName}`,
          }}
          className={
            direction === RTL_DIRECTION
              ? componentStyles.inputbaseRtl
              : componentStyles.inputbaseLtr
          }
          autoFocus={autofocusInput}
          variant="outlined"
          onChange={handleAliasName}
          value={aliasName}
          inputRef={aliasRef}
          onKeyPress={(e) => FieldValidations(e, 102, aliasRef.current, 50)}
        />
      )}
      <div
        style={{
          // Changes the width from 10vw to 11vw to resolve the bug Id 133001
          width: isTabScreen ? "12vw" : "10vw",
          // width: "10vw",
          height: "var(--line_height)",
          border: "1px solid rgba(0, 0, 0, 0.3)",
          background: "#fff",
          borderRadius: "2px",
          //code changes for bug id 138795
          // margin: "0.5rem 0.5vw",
          // display: "flex",
          // padding: "0 0.5vw",
          margin: "0.5rem 1vw",
          //till here
          display: "flex",
          padding: "0 0.5vw",
          alignItems: "center",
        }}
        className={
          direction === RTL_DIRECTION
            ? clsx(
                arabicStyles.menuItemStyles,
                isEditable && styles.variableTypeCursor
              )
            : clsx(
                styles.menuItemStyles,
                isEditable && styles.variableTypeCursor
              )
        }
        onClick={(e) => {
          if (isEditable) {
            if (
              varData?.hasOwnProperty("dataObjectId") &&
              varData?.dataObjectId !== ""
            ) {
              openModifyMF();
            } else handleTypeChangeMF(e);
          }
        }}
        id={`pmweb_type_field_mapping_input_type_${getVariableTypeFromVarNumber(
          variableType
        )}`}
        tabindex={0}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            if (isEditable) {
              if (
                varData?.hasOwnProperty("dataObjectId") &&
                varData?.dataObjectId !== ""
              ) {
                openModifyMF();
              } else handleTypeChangeMF(e);
            }
          }
        }}
      >
        {getVariableTypeFromVarNumber(variableType)}
      </div>
      <Popover
        open={open}
        anchorEl={anchorElMF}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div className={styles.typeDiv}>
          <div className={styles.typeInsideDiv} style={{ width: "25%" }}>
            {" "}
            <p style={{ color: "#000000", opacity: "0.54", fontSize: "12px" }}>
              {t("basicDataTypes")}
            </p>
            {variableTypeOptions &&
              variableTypeOptions
                .filter((el) => el.value !== "11")
                .map((element, index) => {
                  return (
                    <div
                      value={element.value}
                      onClick={() => {
                        handleVariableType(element.value);
                        handleClose();
                      }}
                      className={styles.flexRow}
                      id={`pmweb_BusinessVar_VarType_${element.label}`}
                      tabIndex={0}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          handleVariableType(element.value);
                          handleClose();
                        }
                      }}
                    >
                      <Icon className={styles.iconStyle}>
                        <img
                          className={styles.menuItemImage}
                          src={element.icon}
                          alt="MenuItem"
                        />
                      </Icon>
                      <p style={{ color: "black" }}> {element.label}</p>
                    </div>
                  );
                })}
          </div>
          <div
            className={styles.typeInsideDiv}
            style={{ width: "35%", border: "none" }}
          >
            <p style={{ color: "#000000", opacity: "0.54", fontSize: "12px" }}>
              {t("configureDataObjectDirectly")}
            </p>
            {complexOptions.map((option) => (
              <div
                className={styles.flexRow}
                onClick={(e) => microAppsHandler(e, option.paramType)}
                id={`pmweb_BusinessVar_VarType_${replaceSpaceToUnderScore(
                  option.label
                )}`}
                tabindex={0}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    microAppsHandler(e, option.paramType);
                  }
                }}
              >
                <p style={{ color: "black" }}>{option.label}</p>
              </div>
            ))}
          </div>
          <div
            className={styles.typeInsideDiv}
            style={{ width: "40%", border: "none" }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                height: "22px",
                whiteSpace: "nowrap",
              }}
            >
              <p
                style={{ color: "#000000", opacity: "0.54", fontSize: "12px" }}
              >
                {t("useAnAvailableTemplate")}
              </p>
              <p
                style={{
                  color: "rgba(0, 114, 198, 1)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  /*Bug 117732 : Solution: Added a cursor property */
                  cursor: "pointer",
                }}
                onClick={(e) => microAppsHandler(e, "template")}
                id={`pmweb_BusinessVar_VarType_new`}
                tabindex={0}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    microAppsHandler(e, "template");
                  }
                }}
              >
                {t("new")}
              </p>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflowY: "scroll",
              }}
            >
              {dataObjectTemplates?.map((template) => (
                <div
                  style={{
                    width: "100%",
                    height: "2.5rem",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() =>
                    microAppsHandler(template.id, "existingTemplate")
                  }
                  id={`pmweb_BusinessVar_VarType_${replaceSpaceToUnderScore(
                    template.alias_name
                  )}`}
                  tabindex={0}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      microAppsHandler(template.id, "existingTemplate");
                    }
                  }}
                >
                  <p className={styles.flexRow}>{template.alias_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Popover>
      {variableType === "11" || (variableType !== 11 && props.arrayType) ? (
        <Tooltip title={dataField} arrow>
          <div
            style={{
              width: "12vw",
              height: "var(--line_height)",
              border: "1px solid rgba(0, 0, 0, 0.3)",
              background: "#fff",
              borderRadius: "2px",
              margin: "0.5rem 1vw",
              display: "flex",
              alignItems: "center",
              padding: "0 0.5vw",
            }}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.menuItemStyles
                : styles.menuItemStyles
            }
          >
            <span style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
              {dataField}
            </span>
          </div>
        </Tooltip>
      ) : (
        <React.Fragment>
          <label
            htmlFor={`pmweb_type_field_mapping_data_field_dropdown_${dataField}`}
            style={{ display: "none" }}
          >
            {/**code added for bug id 136265 */}
            {dataField || t("dataField")}
          </label>

          <CustomizedDropdown
            disabled={
              bForDisabled ||
              isComplexTypeSelected ||
              // !isEditable ||
              variableType === ""
            }
            id={`pmweb_type_field_mapping_data_field_dropdown_${dataField}`}
            className={
              direction === RTL_DIRECTION
                ? componentStyles.dataFieldRtl
                : componentStyles.dataFieldLtr
            }
            value={dataField + ""}
            MenuProps={menuProps}
            // onOpen={dataTypeOnOpen}
            onChange={handleDataType}
            hideDefaultSelect={true}
            isNotMandatory={true}
            numberOfOptions={dataTypeOptions?.length}
            noOptionsMessage={t("noSysDefinedVarPresentError")} //Changes made to solve Bug 131029 // code modified added transltion for bug 139481
          >
            {/* {selectDataTypeOption} */}
            {dataTypeOptions?.map((element) => {
              return (
                <MenuItem
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.menuItemStyles
                      : styles.menuItemStyles
                  }
                  value={element + ""}
                >
                  {element}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </React.Fragment>
      )}
      <span
        id="pmweb_type_field_mapping_array_type_checkbox"
        style={{ display: "none" }}
      >
        {t("allowMultipleEntries")}
      </span>
      <Checkbox
        disabled={
          (aliasName.trim().length === 0 && bForDisabled) ||
          !isEditable ||
          variableType === "11"
        }
        className={
          direction === RTL_DIRECTION
            ? componentStyles.arrayCheckboxRtl
            : componentStyles.arrayCheckboxLtr
        }
        checked={props.arrayType}
        onChange={(e) => {
          if (
            variableType !== "11" &&
            variableType !== "" &&
            e.target.checked
          ) {
            microAppsHandler(e, "primitiveArray");
          }
          props.setarrayType(e);
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            if (
              variableType !== "11" &&
              variableType !== "" &&
              !props.arrayType
            ) {
              microAppsHandler(e, "primitiveArray");
            }
            props.setarrayType({
              ...e,
              target: { ...e.target, checked: !props.arrayType },
            });
          }
        }}
        size="small"
        inputProps={{
          "aria-labelledby": "pmweb_type_field_mapping_array_type_checkbox",
        }}
      />
      {/* <MoreHorizOutlinedIcon
        id="type_field_mapping_more_options"
        className={
          direction === RTL_DIRECTION
            ? componentStyles.moreOptionsRtl
            : componentStyles.moreOptionsLtr
        }
        fontSize="small"
        onClick={() => isEditable && setShowPropertiesModal(true)}
      /> */}
      {showPropertiesModal ? (
        <Modal
          show={showPropertiesModal}
          style={{
            opacity: "1",
            width: "243px",
            height: "164px",
            top: "15%",
            padding: "0% !important",
            position: "absolute",
          }}
          // code commented on 7 Sep 2022 for BugId 113905
          // modalClosed={() => setShowPropertiesModal(false)}
          children={
            <VariableProperties
              setShowPropertiesModal={setShowPropertiesModal}
              aliasName={aliasName}
              variableType={variableType}
              defaultValue={props.defaultValue}
              variableLength={props.variableLength}
            />
          }
        />
      ) : null}
    </div>
  );
}

export default TypeAndFieldMapping;
