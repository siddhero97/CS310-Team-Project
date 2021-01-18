/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */

CampusExplorer.buildQuery = function() {
    let query = {};
    let formContainer = document.getElementById("form-container");
    let activeFormList = formContainer.getElementsByClassName("tab-panel active");
    let validActiveForm = CampusExplorer.getActiveForm(activeFormList);
    if (!validActiveForm) {
        return query;
    }
    let whereQuery = CampusExplorer.buildQueryWhere(validActiveForm);
    let columnsQuery = CampusExplorer.buildQueryColumns(validActiveForm, "form-group columns");
    let orderQuery = CampusExplorer.buildQueryOrder(validActiveForm);
    let groupQuery = CampusExplorer.buildQueryColumns(validActiveForm, "form-group groups");
    let applyQuery = CampusExplorer.buildQueryTransformation(validActiveForm);
    let optionsQuery = (orderQuery ? {COLUMNS: columnsQuery, ORDER: orderQuery} : {COLUMNS: columnsQuery});
    if (groupQuery && groupQuery.length > 0 && applyQuery && applyQuery.length > 0) {
        query = {WHERE: whereQuery, OPTIONS: optionsQuery, TRANSFORMATIONS: {GROUP: groupQuery, APPLY: applyQuery}};
    } else {
        query = {WHERE: whereQuery, OPTIONS: optionsQuery};
    }

    return query;
};

CampusExplorer.buildQueryTransformation = function(activeForm) {
    let transformationsFormGroupList = activeForm.form.getElementsByClassName("transformations-container");
    let transformationsFormGroup = CampusExplorer.getSingleOrNull(transformationsFormGroupList);
    let transformations = [];
    for (let i = 0; i < transformationsFormGroup.children.length; i++) {
        transformations.push(CampusExplorer.getTransformationRow(transformationsFormGroup.children[i], activeForm.id));
    }
    return transformations;
};

CampusExplorer.getTransformationRow = function(transformationRow, id) {
    let columnSelected = CampusExplorer.getSelectedFromDropdownList(transformationRow, "control fields");
    let compareSelected = CampusExplorer.getSelectedFromDropdownList(transformationRow, "control operators");
    let fieldValue = CampusExplorer.getTextInput(transformationRow, "control term");
    let v = CampusExplorer.getColumn(id, columnSelected);
    return {[fieldValue]: {[compareSelected]: v}};
};

CampusExplorer.buildQueryWhere = function(activeForm) {
    let conditionsFormGroupList = activeForm.form.getElementsByClassName("form-group conditions");
    let conditionsFormGroup = CampusExplorer.getSingleOrNull(conditionsFormGroupList);
    let conditionType = CampusExplorer.getConditionType(conditionsFormGroup);
    let conditionsContainerList = activeForm.form.getElementsByClassName("conditions-container");
    let conditionsContainer = CampusExplorer.getSingleOrNull(conditionsContainerList);
    let conditionsList = CampusExplorer.getConditionsList(conditionsContainer, activeForm.id);
    if (conditionsList.length === 0) {
        return {};
    }
    if (conditionsList.length === 1) {
        return conditionsList[0];
    }
    if (conditionType === "all") {
        return {AND: conditionsList};
    }
    if (conditionType === "any") {
        return {OR: conditionsList};
    }
    if (conditionType === "none") {
        return {NOT: {OR: conditionsList}};
    }
    return null;
};

CampusExplorer.getConditionsList = function(conditionsContainer, id) {
    let conditions = [];
    for (let i = 0; i < conditionsContainer.children.length; i++) {
        let childCondition = CampusExplorer.getCondition(conditionsContainer.children[i], id);
        conditions.push(childCondition)
    }
    return conditions;
};

CampusExplorer.getCondition = function(conditionRow, id) {
    let numericTypes = ["GT", "LT", "EQ"];
    let checkedBox = conditionRow.querySelector("input[type='checkbox']:checked");
    let columnSelected = CampusExplorer.getSelectedFromDropdownList(conditionRow, "control fields");
    let compareSelected = CampusExplorer.getSelectedFromDropdownList(conditionRow, "control operators");
    let fieldValue = CampusExplorer.getTextInput(conditionRow, "control term");
    if (numericTypes.includes(compareSelected)) {
        fieldValue = Number(fieldValue);
    }
    let v = CampusExplorer.getColumn(id, columnSelected);
    if (checkedBox) {
        return {NOT: {[compareSelected]: {[v]: fieldValue}}};
    }
    return {[compareSelected]: {[v]: fieldValue}};
};

CampusExplorer.getConditionType = function(conditionsFormGroup) {
    if (!conditionsFormGroup) {
        return null;
    }
    let controlGroupList = conditionsFormGroup.getElementsByClassName("control-group condition-type");
    let controlGroup = CampusExplorer.getSingleOrNull(controlGroupList);
    if (!controlGroup) {
        return null;
    }
    let selected = controlGroup.querySelector("input[name='conditionType']:checked").value;
    if (!selected) {
        return null;
    }
    return selected;
};

CampusExplorer.getColumn = function(key, value) {
    let keys;
    if (key === "courses") {
        keys = ["dept", "id", "instructor", "title", "pass", "fail", "audit", "uuid", "avg", "year"];
    } else if (key === "rooms") {
        keys = ["fullname", "shortname", "number", "name", "address", "lat", "lon", "seats", "type", "furniture", "href"];
    } else {
        return null;
    }
    if (keys.includes(value)) {
        return key + "_" + value;
    }
    return value;
};

CampusExplorer.buildQueryOrder = function(activeForm) {
    let orderFormsGroupList = activeForm.form.getElementsByClassName("control order fields");
    let orderFormsGroup = CampusExplorer.getSingleOrNull(orderFormsGroupList);
    if (!orderFormsGroup) {
        return null;
    }
    let selectMult = orderFormsGroup.children[0];
    let options = selectMult && selectMult.options;
    let selectedColumns = [];
    for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
            let v = CampusExplorer.getColumn(activeForm.id, options[i].value);
            selectedColumns.push(v);
        }
    }
    if (selectedColumns.length === 0) {
        return null;
    }
    let orderDescendingList = activeForm.form.getElementsByClassName("control descending");
    let orderDescending = CampusExplorer.getSingleOrNull(orderDescendingList);
    if (!orderDescending) {
        return null;
    }
    let checkedDescending = orderDescending.querySelector("input[type='checkbox']:checked");
    if (!checkedDescending) {
        return {dir: "UP", keys: selectedColumns};
    }
    return {dir: "DOWN", keys: selectedColumns};
};

CampusExplorer.buildQueryColumns = function(activeForm, className) {
    let columnsFormGroupList = activeForm.form.getElementsByClassName(className);
    let columnsFormGroup = CampusExplorer.getSingleOrNull(columnsFormGroupList);
    if (!columnsFormGroup) {
        return null;
    }
    let checkedColumns = columnsFormGroup.querySelectorAll("input[type='checkbox']:checked");
    let columnsArray = [];
    for (let i = 0; i < checkedColumns.length; i++) {
        let v = CampusExplorer.getColumn(activeForm.id, checkedColumns[i].value);
        columnsArray.push(v);
    }
    return columnsArray;
};

CampusExplorer.getTextInput = function(conditionRow, divClass) {
    let textBoxDivList = conditionRow.getElementsByClassName(divClass);
    let textBoxDiv = CampusExplorer.getSingleOrNull(textBoxDivList);
    if (!textBoxDiv) {
        return null;
    }
    let textBox = textBoxDiv.querySelector("input[type='text']");
    if (!textBox) {
        return null;
    }
    return textBox.value;
};

CampusExplorer.getSelectedFromDropdownList = function(conditionRow, divClass) {
    let optionsList = conditionRow.getElementsByClassName(divClass);
    let options = CampusExplorer.getSingleOrNull(optionsList);
    if (!options || options.children.length === 0) {
        return null;
    }
    return options.children[0].options[options.children[0].selectedIndex].value;
};

CampusExplorer.getSingleOrNull = function(htmlCollection) {
    if (!htmlCollection.length) {
        return null; // empty collection
    }
    return htmlCollection[0]; // Get first element of collection
};

CampusExplorer.getActiveForm = function(activeFormList) {
    let validActiveForm = null;
    let id = "";
    for (let activeForm of activeFormList) {
        let activeFormId = activeForm.getAttribute("id");
        if (activeFormId === "tab-courses") {
            id = "courses";
            validActiveForm = activeForm;
            break;
        }
        if (activeFormId === "tab-rooms") {
            id = "rooms";
            validActiveForm = activeForm;
            break;
        }
    }
    if (validActiveForm === null) {
        return null;
    }
    return {form: validActiveForm, id: id};
};
