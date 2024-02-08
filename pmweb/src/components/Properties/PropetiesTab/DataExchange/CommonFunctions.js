// Function that returns export type rule empty JSON.
export const getExportRuleJSON = () => {
  return {
    indentationLevel: "",
    m_arrExTableRelationValuesInfo: [],
    m_arrExportMappingValuesInfo: [],
    m_arrFilterStringTableExpInfo: [],
    m_bIsComplexExport: false,
    m_bIsNestedExport: false,
    m_bUpdateIfExistEx: true,
    m_sExFilterString: "",
    m_sRowCountVarId: "",
    ruleId: 2,
    selectedparam1: "",
  };
};

// Function that returns import type rule empty JSON.
export const getImportRuleJSON = () => {
  return {
    indentationLevel: "",
    m_arrTableRelationValuesInfo: [],
    m_arrMappingValuesInfo: [],
    m_arrFilterStringTableImpInfo: [],
    m_arrDataExValuesInfo: [],
    m_bIsComplex: false,
    m_bIsNested: false,
    m_bUpdateIfExist: true,
    m_sFilterString: "",
    m_sRowCountVarId: "",
    ruleId: 1,
    selectedparam1: "",
  };
};

// Function to get the multi selected table names from various data and store them to a state so that it can be shown at many places.
export const getMultiSelectedTableNames = (
  mappingDataArr,
  tableRelationDataArr,
  dataExcgTableSecData,
  filterStringDataArr
) => {
  let multiSelectedTableNamesArr = [];
  mappingDataArr?.forEach((element) => {
    const tempObj = {
      TableName: element.selectedEntityName,
    };
    let isUnique = true;
    multiSelectedTableNamesArr?.forEach((elem) => {
      if (elem.TableName === element.selectedEntityName) {
        isUnique = false;
      }
    });
    if (isUnique) {
      multiSelectedTableNamesArr?.push(tempObj);
    }
  });

  tableRelationDataArr?.forEach((element) => {
    const tempObj = {
      TableName: element.selectedEntityName,
    };
    let isUnique = true;
    multiSelectedTableNamesArr?.forEach((elem) => {
      if (elem.TableName === element.selectedEntityName) {
        isUnique = false;
      }
    });
    if (isUnique) {
      multiSelectedTableNamesArr?.push(tempObj);
    }
  });
  if (dataExcgTableSecData && dataExcgTableSecData?.length !== 0) {
    dataExcgTableSecData?.forEach((element) => {
      const tempObj1 = {
        TableName: element.m_sSelecteddataExTable1,
      };
      const tempObj2 = {
        TableName: element.m_sSelecteddataExTable2,
      };
      let isUnique1 = true;
      multiSelectedTableNamesArr?.forEach((elem) => {
        if (elem.TableName === element.m_sSelecteddataExTable1) {
          isUnique1 = false;
        }
      });
      if (isUnique1) {
        multiSelectedTableNamesArr.push(tempObj1);
      }
      let isUnique2 = true;
      multiSelectedTableNamesArr?.forEach((elem) => {
        if (elem.TableName === element.m_sSelecteddataExTable2) {
          isUnique2 = false;
        }
      });
      if (isUnique2) {
        multiSelectedTableNamesArr.push(tempObj2);
      }
    });
  }

  filterStringDataArr?.forEach((element) => {
    const tempObj = {
      TableName: element.m_sTableName,
    };
    let isUnique = true;
    multiSelectedTableNamesArr?.forEach((elem) => {
      if (elem.TableName === element.m_sTableName) {
        isUnique = false;
      }
    });
    if (isUnique) {
      multiSelectedTableNamesArr.push(tempObj);
    }
  });

  multiSelectedTableNamesArr?.forEach((element, index) => {
    element.id = index + 1;
  });
  return multiSelectedTableNamesArr;
};

// Function to get the selected table name based on mapping data.
export const getSelectedTableName = (mappingDataArr) => {
  return mappingDataArr && mappingDataArr[0]?.selectedEntityName;
};
