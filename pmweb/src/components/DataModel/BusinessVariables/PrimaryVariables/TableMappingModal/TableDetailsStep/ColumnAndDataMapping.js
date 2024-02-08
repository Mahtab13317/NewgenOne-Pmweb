export const columnDetails = [
  {
    aliasName: "Auto Increment ID",
    variableType: "4",
    dataField: "InsertionOrderID",
    isAutoIncrement: true,
    isPrimaryKey: true,
    isForeignKey: false,
  },
  {
    aliasName: "Map ID",
    variableType: "4",
    dataField: "Map ID",
    isAutoIncrement: false,
    isPrimaryKey: false,
    isForeignKey: true,
  },
];

export const defaultColumnData = [
  {
    Attribute: "",
    DefaultValue: "",
    Length: "4",
    Name: "InsertionOrderId",
    AliasName: "Auto Increment ID",
    Precision: "0",
    Type: "4",
  },
  {
    Attribute: "",
    DefaultValue: "",
    Length: "4",
    Name: "MapID",
    AliasName: "Map ID",
    Precision: "0",
    Type: "4",
  },
];
