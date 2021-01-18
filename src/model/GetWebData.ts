export default class GetWebData { // template from documentation
    public GeolocationOfBuilding (address: string): Promise<any> {
        let http = require("http");
        let queryableAddress = address.replace(" ", "%20");

        return new Promise((resolve, reject) => {
            http.get("http://cs310.students.cs.ubc.ca:11316/api/v1/project_team124/" + queryableAddress,
                (res: any) => {
                    const { statusCode } = res;
                    const contentType = res.headers["content-type"];

                    let error;
                    if (statusCode !== 200) {
                        error = new Error("Request Failed.\n" +
                            "Status Code: ${statusCode}");
                    } else if (!/^application\/json/.test(contentType)) {
                        error = new Error("Invalid content-type.\n" +
                            "Expected application/json but received ${contentType}");
                    }
                    if (error) {
                        // Consume response data to free up memory
                        res.resume();
                        reject(error);
                    }

                    res.setEncoding("utf8");
                    let rawData = "";
                    res.on("data",
                        (chunk: any) => {
                    rawData += chunk;
                    });
                    return res.on("end", () => {
                        try {
                            const parsedData = JSON.parse(rawData);
                            resolve(parsedData);
                        } catch (e) {
                            reject(e);
                        }
                    });
                }).on("error", (e: any) => {
                reject(e);
            });
        });
    }
}
