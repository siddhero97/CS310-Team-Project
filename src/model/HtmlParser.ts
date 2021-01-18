export default class HtmlParser {
    public GetAttributeAText(document: any, attributeName: string, attributeValue: string): string {
        let info = this.FindAttribute(document, attributeName, attributeValue);
        if (info.length === 0) {
            return null;
        }
        for (let node of info) {
            let aList = this.FindNodeName(node, "a");
            if (aList.length === 0) {
                return null;
            }
            for (let a of aList) {
                let textNode = this.FindNodeName(a, "#text");
                for (let n of textNode) {
                    let value = this.GetValue(n);
                    if (value) {
                        return value;
                    }
                }
            }
        }
        return null;
    }

    public GetAttributeAHrefText(document: any, attributeName: string, attributeValue: string):
        {href: string, text: string} {
        let info = this.FindAttribute(document, attributeName, attributeValue);
        if (info.length === 0) {
            return {href: null, text: null};
        }
        for (let node of info) {
            let aList = this.FindNodeName(node, "a");
            if (aList.length === 0) {
                return {href: null, text: null};
            }
            for (let a of aList) {
                let href = a.hasOwnProperty("attrs") ? this.GetValueFromAttributeList(a.attrs, "href") : null;
                let textNode = this.FindNodeName(a, "#text");
                for (let n of textNode) {
                    let value = this.GetValue(n);
                    if (value && href) {
                        return {href: href, text: value};
                    }
                }
            }
        }
        return {href: null, text: null};
    }

    public FindTextStoredInNodeWithAttribute(roomRow: any, attributeName: string, attributeValue: string): string {
        let roomsInfo = this.FindAttribute(roomRow, attributeName, attributeValue);
        for (let room of roomsInfo) {
            let textNodes = this.FindNodeName(room, "#text");
            for (let text of textNodes) {
                let t = this.GetValue(text);
                if (t) {
                    return t.trim();
                }
            }
        }
        return null;
    }

    public GetValue(node: any): string {
        if (!node.hasOwnProperty("value")) {
            return null;
        }
        return node.value;
    }

    public GetTextFromHtml(building: any, attributeName: string, attributeValue: string): string {
        let buildingInfo = this.FindAttribute(building, attributeName, attributeValue);
        if (buildingInfo.length === 0) {
            return null;
        }
        for (let info of buildingInfo) {
            let textNode = this.FindNodeName(info, "#text");
            for (let value of textNode) {
                if (value.hasOwnProperty("value")) {
                    return value.value.trim();
                }
            }
        }
        return null;
    }

    public GetAssociatedRoomFile(content: string, row: any): string {
        let hrefList = this.FindAttribute(row, "class", "views-field views-field-nothing");
        hrefList = this.FindNodeName(hrefList[0], "a");
        return this.GetValueFromAttributeList(hrefList[0].attrs, "href");
    }

    public GetValueFromAttributeList(attrsList: any[], attributeName: string): string {
        if (!attrsList) {
            return null;
        }
        for (let attrs of attrsList) {
            if (attrs.name === attributeName) {
                return attrs.value;
            }
        }
        return null;
    }

    public FindAttribute(document: any, attributeName: string, attributeValue: string): any[] {
        let sets: any = [];
        let that = this;
        if (!document.hasOwnProperty("childNodes")) {
            return [];
        }
        document.childNodes.forEach(function (child: any) {
            let hasAttribute = false;
            if (child.hasOwnProperty("attrs")) {
                child.attrs.forEach(function (attrSet: any) {
                    hasAttribute = hasAttribute || (attrSet.name === attributeName && attrSet.value === attributeValue);
                });
            }
            if (hasAttribute) {
                sets.push(child);
            } else {
                that.FindAttribute(child, attributeName, attributeValue);
            }
        });
        return sets;
    }

    public FindNodeName(document: any, nodeName: string): any[] {
        let sets: any = [];
        const that = this;
        if (!document.hasOwnProperty("childNodes")) {
            return [];
        }
        document.childNodes.forEach(function (child: any) {
            if (child.nodeName === nodeName) {
                sets.push(child);
            } else {
                sets = sets.concat(that.FindNodeName(child, nodeName));
            }
        });
        return sets;
    }
}
