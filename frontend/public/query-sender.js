/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */

CampusExplorer.sendQuery = function (query) {
    return new Promise(function (fulfill, reject) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.open("POST", "/query", true);
        httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        httpRequest.onload = function (e) {
            // hello
        };
        httpRequest.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                return fulfill(this.response);
            } else if (this.readyState === XMLHttpRequest.DONE) {
                return reject(this.response);
            }
        };
        httpRequest.send(JSON.stringify(query));
    });
};
